// ── Admin: saatlik AI kontrol — koşu listesi ve manuel tetikleme ─────────
// GET: son koşular + her koşuya bağlı işaretler (panel bunu listeler).
// POST: "Şimdi kontrol et" — vadesi gelen pencereler + içinde bulunulan
// saatin şu ana kadarki kısmı hemen taranır.

import { getDb } from "../../../lib/server/db";
import { isAdmin } from "../../../lib/server/session";
import { bad } from "../../../lib/server/validate";
import {
  runDueModerationChecks,
  runRangeScan,
} from "../../../lib/server/moderation";
import type { ModFlag, ModRun } from "../../../lib/moderation";

const RUN_LIMIT = 500; // panel sayfalayarak gösterir

export async function GET() {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const db = await getDb();
  const { rows: runs } = await db.query(
    `SELECT id, window_start, window_end, scanned, flagged, status, error, kind
     FROM moderation_runs ORDER BY created_at DESC LIMIT $1`,
    [RUN_LIMIT],
  );
  const { rows: flags } = await db.query(
    `SELECT id, run_id, code, category, confidence, reason, excerpt,
            status, name, manifest, self_harm
     FROM moderation_flags ORDER BY id DESC`,
  );

  const byRun = new Map<number, ModFlag[]>();
  for (const f of flags) {
    const list = byRun.get(f.run_id) ?? [];
    list.push({
      id: f.id,
      code: f.code,
      name: f.name,
      manifest: f.manifest,
      category: f.category,
      confidence: f.confidence ?? 0,
      reason: f.reason ?? "",
      excerpt: f.excerpt ?? "",
      selfHarm: f.self_harm,
      status: f.status,
    });
    byRun.set(f.run_id, list);
  }

  const out: ModRun[] = runs.map((r) => ({
    id: r.id,
    windowStart: Number(r.window_start),
    windowEnd: Number(r.window_end),
    scanned: r.scanned,
    flagged: r.flagged,
    status: r.status,
    kind: r.kind === "range" ? "range" : "auto",
    ...(r.error ? { error: r.error } : {}),
    flags: byRun.get(r.id) ?? [],
  }));
  return Response.json({ runs: out });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const body = (await req.json().catch(() => ({}))) as {
    from?: number;
    to?: number;
  };
  try {
    // Tarih aralığı verildiyse aralık taraması; verilmediyse vadesi gelen
    // saatlik pencereler + içinde bulunulan saat taranır
    if (typeof body.from === "number" && typeof body.to === "number") {
      if (!(body.from < body.to)) return bad("Tarih aralığı geçersiz.");
      const result = await runRangeScan(body.from, body.to);
      return Response.json({ ok: true, results: [result] });
    }
    const results = await runDueModerationChecks(true);
    return Response.json({ ok: true, results });
  } catch (e) {
    return bad(e instanceof Error ? e.message : "Denetim başlatılamadı.", 409);
  }
}
