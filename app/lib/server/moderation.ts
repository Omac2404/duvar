// ── Saatlik yapay zeka denetimi ──────────────────────────────────────────
// Kapanan her saat penceresinde yazılan yeni manifestler Claude'a topluca
// gönderilir; kural dışı bulunanlar moderation_flags'e düşer ve admin
// panelde "Saatlik kontrole takılanlar" altında listelenir. Takılan
// manifest, admin karar verene kadar duvarda görünmeye devam eder.
//
// Zamanlama: instrumentation.ts içindeki döngü birkaç dakikada bir
// runDueModerationChecks() çağırır. Pencereler [başlangıç, bitiş) ms
// aralıklarıdır; son başarılı koşunun bitişinden kapanmış son saat
// sınırına kadar olan aralık saat saat taranır — sunucu kapalı kalırsa
// açılışta aradaki saatler telafi edilir. Çift çalışmayı Postgres
// advisory lock engeller.

import Anthropic from "@anthropic-ai/sdk";
import type { Pool } from "pg";
import { getAiKey, getDb, getSetting } from "./db";
import {
  MOD_CATEGORIES,
  type ModCategory,
  type ModProgress,
} from "../moderation";

const HOUR = 3600000;
const LOCK_KEY = 714214; // rastgele sabit — bu uygulamaya özel kilit
const MAX_WINDOWS_PER_TICK = 26;
const MODEL = "claude-sonnet-5";

type WindowResult = {
  windowStart: number;
  windowEnd: number;
  scanned: number;
  flagged: number;
  status: "ok" | "failed";
  error?: string;
};

type AiFlag = {
  i: number;
  category: ModCategory;
  confidence: number;
  reason: string;
  excerpt: string;
  selfHarm: boolean;
};

// ── AI çağrısı ───────────────────────────────────────────────────────────

const CATEGORY_LINES = (Object.keys(MOD_CATEGORIES) as ModCategory[])
  .map((k) => `- ${k}: ${MOD_CATEGORIES[k].desc}`)
  .join("\n");

const SYSTEM_PROMPT = `Sen "Manifest Duvarı" adlı sitenin içerik denetçisisin. Site, insanların gelecek hayallerini ve dileklerini (manifestlerini) pozitif bir dille yazıp herkese açık bir duvarda sergilediği bir topluluk alanıdır. Sana üyelerin son bir saat içinde yazdığı manifestler verilecek; kurallara aykırı olanları ayıklayacaksın.

Kategoriler:
${CATEGORY_LINES}

Kurallar:
- Yalnızca net ihlalleri işaretle. Sıradan, zararsız, iyi niyetli manifestleri asla işaretleme — yanlış pozitif, kaçan ihlalden daha maliyetlidir.
- Sansürlenmiş küfürleri (ör. "a.q", "s*ktir") ve ima yoluyla hakareti de yakala.
- Kendi hedefleri için para/başarı dilemek reklam değildir; reklam, başkalarını bir ürüne/hizmete/hesaba yönlendirmektir.
- "Olumsuz nitelik" kategorisini dar tut: yalnızca açıkça karamsar, umutsuz ya da başkasının kötülüğünü dileyen içerikler girer. Buruk ama umutlu manifestler (ör. hastalıktan kurtulma dileği) ihlal DEĞİLDİR.
- İçerikte kendine zarar verme iması varsa selfHarm alanını true yap — bu manifestler özel ele alınır.
- confidence: 0 ile 1 arasında; ihlalden ne kadar eminsin.
- reason: Tek cümle, Türkçe, yumuşak ve saygılı bir dille — bu cümle manifest sahibine gönderilecek e-postada "kaldırılma sebebi" olarak da kullanılacak. Ör: "manifest metninde açık küfür yer aldığı için". Suçlayıcı değil, açıklayıcı yaz.
- excerpt: Sorunlu bölümden kısa bir alıntı.
- Hiçbir ihlal yoksa boş liste döndür.`;

const RESULT_SCHEMA = {
  type: "object",
  properties: {
    flags: {
      type: "array",
      items: {
        type: "object",
        properties: {
          i: { type: "integer", description: "Manifestin listedeki indeksi" },
          category: {
            type: "string",
            enum: Object.keys(MOD_CATEGORIES),
          },
          confidence: { type: "number" },
          reason: { type: "string" },
          excerpt: { type: "string" },
          selfHarm: { type: "boolean" },
        },
        required: ["i", "category", "confidence", "reason", "excerpt", "selfHarm"],
        additionalProperties: false,
      },
    },
  },
  required: ["flags"],
  additionalProperties: false,
} as const;

// Anahtar panelden değişebildiği için istemci anahtara göre önbelleklenir
let cached: { key: string; client: Anthropic } | null = null;
function ai(key: string): Anthropic {
  if (!cached || cached.key !== key)
    cached = { key, client: new Anthropic({ apiKey: key }) };
  return cached.client;
}

async function moderateBatch(
  db: Pool,
  items: { code: string; name: string; manifest: string }[],
): Promise<AiFlag[]> {
  const key = await getAiKey(db);
  if (!key)
    throw new Error(
      "Yapay zeka API anahtarı tanımlı değil — admin panel → Ayarlar sekmesinden ekleyin.",
    );
  const payload = items.map((m, i) => ({ i, rumuz: m.name, manifest: m.manifest }));
  const response = await ai(key).messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    output_config: { format: { type: "json_schema", schema: RESULT_SCHEMA } },
    messages: [
      {
        role: "user",
        content:
          "Denetlenecek manifestler:\n" + JSON.stringify(payload, null, 1),
      },
    ],
  });
  if (response.stop_reason === "refusal")
    throw new Error("AI denetimi bu isteği yanıtlamayı reddetti.");
  if (response.stop_reason === "max_tokens")
    throw new Error("AI yanıtı token sınırına takıldı.");
  const text = response.content.find((b) => b.type === "text")?.text ?? "";
  const parsed = JSON.parse(text) as { flags: AiFlag[] };
  // Şema enum'u kategoriyi garantiler; indeks aralığını doğrula ve aynı
  // manifeste birden çok kategori atandıysa en yüksek güvenlisini tut
  // (DB'de manifest başına tek işaret tutulur, sayaç da onu yansıtmalı)
  const byIndex = new Map<number, AiFlag>();
  for (const f of parsed.flags) {
    if (f.i < 0 || f.i >= items.length) continue;
    const cur = byIndex.get(f.i);
    if (!cur || f.confidence > cur.confidence)
      byIndex.set(f.i, { ...f, selfHarm: f.selfHarm || (cur?.selfHarm ?? false) });
  }
  return [...byIndex.values()];
}

// ── Pencere tarama ───────────────────────────────────────────────────────

async function insertFlags(
  db: Pool,
  runId: number,
  items: { code: string; name: string; manifest: string }[],
  flags: AiFlag[],
) {
  for (const f of flags) {
    const m = items[f.i];
    await db.query(
      `INSERT INTO moderation_flags
         (code, category, confidence, reason, excerpt, status, run_id, name, manifest, self_harm)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, $8, $9)
       ON CONFLICT (code) DO NOTHING`,
      [
        m.code,
        f.category,
        Math.max(0, Math.min(1, f.confidence)),
        f.reason,
        f.excerpt,
        runId,
        m.name,
        m.manifest,
        f.selfHarm,
      ],
    );
  }
}

async function scanWindow(
  db: Pool,
  start: number,
  end: number,
): Promise<WindowResult> {
  const { rows: items } = await db.query(
    `SELECT code, name, manifest FROM manifests
     WHERE ts >= $1 AND ts < $2 AND NOT is_demo
       AND code NOT IN (SELECT code FROM moderation_flags)
     ORDER BY ts ASC`,
    [start, end],
  );

  let flags: AiFlag[] = [];
  let status: "ok" | "failed" = "ok";
  let error: string | null = null;

  if (items.length > 0) {
    setProgress({ scanning: items.length });
    try {
      flags = await moderateBatch(db, items);
    } catch (e) {
      status = "failed";
      error = e instanceof Error ? e.message : "AI denetimi başarısız.";
    }
  }

  const { rows: runRows } = await db.query(
    `INSERT INTO moderation_runs (window_start, window_end, scanned, flagged, status, error, kind)
     VALUES ($1, $2, $3, $4, $5, $6, 'auto')
     ON CONFLICT (window_start) WHERE kind = 'auto' DO UPDATE SET
       window_end = EXCLUDED.window_end,
       scanned = EXCLUDED.scanned,
       flagged = EXCLUDED.flagged,
       status = EXCLUDED.status,
       error = EXCLUDED.error,
       created_at = now()
     RETURNING id`,
    [start, end, items.length, flags.length, status, error],
  );
  const runId = runRows[0].id as number;
  await insertFlags(db, runId, items, flags);

  return {
    windowStart: start,
    windowEnd: end,
    scanned: items.length,
    flagged: flags.length,
    status,
    ...(error ? { error } : {}),
  };
}

// ── Ana giriş — vadesi gelen pencereleri tara ────────────────────────────
// manual=true: içinde bulunulan (henüz kapanmamış) saat de "şu ana kadar"
// taranır; admin panelindeki "Şimdi kontrol et" bunu kullanır.

export async function runDueModerationChecks(
  manual = false,
): Promise<WindowResult[]> {
  const db = await getDb();
  const client = await db.connect();
  const results: WindowResult[] = [];
  try {
    const lock = await client.query(
      "SELECT pg_try_advisory_lock($1) AS ok",
      [LOCK_KEY],
    );
    if (!lock.rows[0].ok) return results; // başka bir koşu sürüyor

    // Otomatik saatlik kontrol panelden kapatılabilir (geliştirme modu);
    // "Şimdi kontrol et" (manual) kapalıyken de çalışır
    if (!manual && !(await getSetting(db, "aiEnabled", false))) return results;

    const now = Date.now();
    const boundary = manual ? now : Math.floor(now / HOUR) * HOUR;
    const { rows } = await db.query(
      "SELECT COALESCE(MAX(window_end), 0) AS last FROM moderation_runs WHERE status = 'ok' AND kind = 'auto'",
    );
    let start = Number(rows[0].last);
    // İlk kuruluşta geçmişin tamamı taranmaz; son kapanan saatten başlanır
    if (start === 0) start = Math.floor(now / HOUR) * HOUR - HOUR;

    // Pencereler baştan hesaplanır ki ilerleme çubuğu toplamı bilsin
    const windows: [number, number][] = [];
    let s = start;
    while (s < boundary && windows.length < MAX_WINDOWS_PER_TICK) {
      const end = Math.min((Math.floor(s / HOUR) + 1) * HOUR, boundary);
      windows.push([s, end]);
      s = end;
    }
    setProgress({
      active: true,
      startedAt: now,
      totalWindows: windows.length,
      doneWindows: 0,
      scanning: 0,
    });

    for (let i = 0; i < windows.length; i++) {
      const r = await scanWindow(db, windows[i][0], windows[i][1]);
      results.push(r);
      setProgress({ doneWindows: i + 1, scanning: 0 });
      if (r.status === "failed") break; // hatalı pencere sonraki turda yeniden denenir
    }
    return results;
  } finally {
    setProgress({ active: false, scanning: 0 });
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_KEY]).catch(() => {});
    client.release();
  }
}

// ── Tarih aralığı taraması — admin panelden istenir ──────────────────────
// Saatlik akıştan bağımsızdır: verilen ts aralığındaki (daha önce hiç
// işaretlenmemiş) TÜM manifestler parça parça AI'dan geçirilir. Koşu
// kind='range' olarak kaydedilir; saatlik filigranı etkilemez.

const RANGE_BATCH = 80; // tek AI çağrısına giden manifest sayısı
const RANGE_MAX_ITEMS = 500;

export async function runRangeScan(
  from: number,
  to: number,
): Promise<WindowResult> {
  const db = await getDb();
  const client = await db.connect();
  try {
    const lock = await client.query(
      "SELECT pg_try_advisory_lock($1) AS ok",
      [LOCK_KEY],
    );
    if (!lock.rows[0].ok)
      throw new Error(
        "Şu anda başka bir denetim sürüyor — bitmesini bekleyip yeniden deneyin.",
      );

    const { rows } = await db.query(
      `SELECT code, name, manifest FROM manifests
       WHERE ts >= $1 AND ts <= $2 AND NOT is_demo
         AND code NOT IN (SELECT code FROM moderation_flags)
       ORDER BY ts ASC`,
      [from, to],
    );
    const items = rows as { code: string; name: string; manifest: string }[];
    if (items.length > RANGE_MAX_ITEMS)
      throw new Error(
        `Aralıkta ${items.length} manifest var — tek taramada en fazla ` +
          `${RANGE_MAX_ITEMS} taranabilir. Aralığı daraltın.`,
      );

    const chunks: (typeof items)[] = [];
    for (let i = 0; i < items.length; i += RANGE_BATCH)
      chunks.push(items.slice(i, i + RANGE_BATCH));

    setProgress({
      active: true,
      startedAt: Date.now(),
      totalWindows: Math.max(1, chunks.length),
      doneWindows: 0,
      scanning: 0,
    });

    const all: AiFlag[] = [];
    let status: "ok" | "failed" = "ok";
    let error: string | null = null;
    for (let c = 0; c < chunks.length; c++) {
      setProgress({ scanning: chunks[c].length });
      try {
        const flags = await moderateBatch(db, chunks[c]);
        // Parça içi indeksler global listeye çevrilir
        all.push(...flags.map((f) => ({ ...f, i: f.i + c * RANGE_BATCH })));
      } catch (e) {
        status = "failed";
        error = e instanceof Error ? e.message : "AI denetimi başarısız.";
        break;
      }
      setProgress({ doneWindows: c + 1, scanning: 0 });
    }

    const { rows: runRows } = await db.query(
      `INSERT INTO moderation_runs (window_start, window_end, scanned, flagged, status, error, kind)
       VALUES ($1, $2, $3, $4, $5, $6, 'range') RETURNING id`,
      [from, to, items.length, all.length, status, error],
    );
    await insertFlags(db, runRows[0].id as number, items, all);

    return {
      windowStart: from,
      windowEnd: to,
      scanned: items.length,
      flagged: all.length,
      status,
      ...(error ? { error } : {}),
    };
  } finally {
    setProgress({ active: false, scanning: 0 });
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_KEY]).catch(() => {});
    client.release();
  }
}

// ── Zamanlayıcı — instrumentation.ts sunucu açılışında çağırır ───────────

const g = globalThis as unknown as {
  mwModTimer?: ReturnType<typeof setInterval>;
  mwModProgress?: ModProgress;
};

// ── İlerleme durumu — panel "Şimdi kontrol et" sırasında bunu yoklar ─────

const IDLE_PROGRESS: ModProgress = {
  active: false,
  startedAt: 0,
  totalWindows: 0,
  doneWindows: 0,
  scanning: 0,
};

function setProgress(p: Partial<ModProgress>) {
  g.mwModProgress = { ...(g.mwModProgress ?? IDLE_PROGRESS), ...p };
}

export function getModProgress(): ModProgress {
  return g.mwModProgress ?? IDLE_PROGRESS;
}

export function startModerationScheduler() {
  if (g.mwModTimer) return; // HMR / çift kayıt koruması
  const tick = () =>
    runDueModerationChecks().catch((e) =>
      console.error("[moderation] kontrol hatası:", e),
    );
  // Açılışta kısa bir gecikmeyle ilk kontrol; sonra 5 dakikada bir vade bak
  setTimeout(tick, 20000);
  g.mwModTimer = setInterval(tick, 5 * 60000);
}
