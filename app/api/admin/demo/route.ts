// ── Admin: demo manifest üretimi / temizliği ─────────────────────────────
// POST {count}: u-demo hesabına toplu demo manifest üretir (lorem içerik,
// gerçekçi şans piramidi, son ~6 aya yayılmış tarihler). Ölçek testleri
// için kullanılır. DELETE: tüm demo manifestleri (ve onlara bağlı
// moderasyon işaretlerini) siler.

import { getDb } from "../../../lib/server/db";
import { isAdmin } from "../../../lib/server/session";
import { bad } from "../../../lib/server/validate";

const MAX_COUNT = 200000;
const BATCH = 5000;

const WORDS = [
  "Lorem", "Ipsum", "Dolor", "Amet", "Consec", "Elit", "Tempor",
  "Magna", "Aliqua", "Veniam", "Nostrud", "Ullamco", "Nisi", "Aliquip",
  "Commodo", "Duis", "Aute", "Irure", "Velit", "Esse", "Cillum",
  "Fugiat", "Nulla", "Pariatur", "Culpa", "Officia", "Mollit", "Sed",
];

const SENTENCES = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  "Nisi ut aliquip ex ea commodo consequat, duis aute irure dolor.",
  "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
  "Deserunt mollit anim id est laborum, sed ut perspiciatis unde omnis.",
  "Iste natus error sit voluptatem accusantium doloremque laudantium.",
  "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
];

const STICKER_EMOJIS = ["🏡", "🚗", "✈️", "💎", "💼", "🎓", "❤️", "👶", "💍", "🌿", "⭐", "🦋"];
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function trLabel(d: Date): string {
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type DemoRow = {
  code: string;
  name: string;
  manifest: string;
  date_label: string;
  ts: number;
  luck: number;
  cheers: number;
  views: number;
  color_idx: number;
  sticker: string | null;
  special: number | null;
  bottled: boolean;
  boxed: boolean;
  realized: boolean;
  realized_label: string | null;
};

function makeDemo(now: number): DemoRow {
  const r = Math.random;
  let name = WORDS[Math.floor(r() * WORDS.length)];
  if (r() > 0.55) name += " " + WORDS[Math.floor(r() * WORDS.length)];

  let manifest = "";
  for (let s = 0; s < 6; s++) {
    const next =
      (manifest ? manifest + " " : "") +
      SENTENCES[Math.floor(r() * SENTENCES.length)];
    if (next.length > 300) break;
    manifest = next;
  }

  // Şans piramidi — duvardaki demo dağılımıyla aynı bantlar:
  // %68 sade · %22 sticker · %9 özel renk · %0.8 şişe · %0.2 kutu
  const lr = r();
  const luck = Math.floor(
    lr < 0.68
      ? (lr / 0.68) * 19
      : lr < 0.9
        ? 20 + ((lr - 0.68) / 0.22) * 29
        : lr < 0.99
          ? 50 + ((lr - 0.9) / 0.09) * 99
          : lr < 0.998
            ? 150 + ((lr - 0.99) / 0.008) * 99
            : 250 + ((lr - 0.998) / 0.002) * 450,
  );

  // Son ~6 aya yayılmış tarih
  const ts = now - Math.floor(4 + r() * 180) * 86400000 - Math.floor(r() * 86400000);
  const views = Math.floor(luck * (2.5 + r() * 2) + r() * 150);
  const bottled = luck >= 150;
  const boxed = luck >= 250;
  const realized = r() < 0.01;

  const code =
    String(10000 + Math.floor(r() * 90000)) +
    LETTERS[Math.floor(r() * 26)] +
    LETTERS[Math.floor(r() * 26)];

  return {
    code,
    name,
    manifest,
    date_label: trLabel(new Date(ts)),
    ts,
    luck,
    cheers: realized ? Math.floor(luck * 0.6 + r() * 60) : 0,
    views,
    color_idx: Math.floor(r() * 12),
    sticker: luck >= 20 ? STICKER_EMOJIS[Math.floor(r() * STICKER_EMOJIS.length)] : null,
    special: luck >= 50 ? Math.floor(r() * 4) : null,
    bottled,
    boxed,
    realized,
    realized_label: realized
      ? trLabel(new Date(ts + 5 * 86400000 + r() * (now - ts) * 0.8))
      : null,
  };
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const body = (await req.json().catch(() => ({}))) as { count?: number };
  const count = Math.floor(Number(body.count));
  if (!Number.isFinite(count) || count < 1 || count > MAX_COUNT)
    return bad(`Adet 1 ile ${MAX_COUNT.toLocaleString("tr-TR")} arasında olmalı.`);

  const db = await getDb();
  await db.query(
    `INSERT INTO users (id, name, email, pass_hash, provider, verified, created_label)
     VALUES ('u-demo', 'Demo', 'demo@manifestduvari.local', '!', 'email', TRUE, $1)
     ON CONFLICT (id) DO NOTHING`,
    [trLabel(new Date())],
  );

  const now = Date.now();
  let inserted = 0;
  for (let done = 0; done < count; done += BATCH) {
    const n = Math.min(BATCH, count - done);
    const rows: DemoRow[] = [];
    for (let i = 0; i < n; i++) rows.push(makeDemo(now));
    // UNNEST ile tek sorguda toplu ekleme; kod çakışması olursa satır atlanır
    const res = await db.query(
      `INSERT INTO manifests (code, user_id, name, manifest, date_label, ts,
         luck, cheers, views, color_idx, sticker, special, bottled, boxed,
         realized, realized_label, is_demo)
       SELECT c, 'u-demo', n, m, dl, t, l, ch, v, ci, st, sp, bo, bx, re, rl, TRUE
       FROM unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::bigint[],
                   $6::int[], $7::int[], $8::int[], $9::int[], $10::text[],
                   $11::int[], $12::boolean[], $13::boolean[], $14::boolean[],
                   $15::text[])
         AS x(c, n, m, dl, t, l, ch, v, ci, st, sp, bo, bx, re, rl)
       ON CONFLICT (code) DO NOTHING`,
      [
        rows.map((x) => x.code),
        rows.map((x) => x.name),
        rows.map((x) => x.manifest),
        rows.map((x) => x.date_label),
        rows.map((x) => x.ts),
        rows.map((x) => x.luck),
        rows.map((x) => x.cheers),
        rows.map((x) => x.views),
        rows.map((x) => x.color_idx),
        rows.map((x) => x.sticker),
        rows.map((x) => x.special),
        rows.map((x) => x.bottled),
        rows.map((x) => x.boxed),
        rows.map((x) => x.realized),
        rows.map((x) => x.realized_label),
      ],
    );
    inserted += res.rowCount ?? 0;
  }

  const { rows: totals } = await db.query(
    "SELECT COUNT(*)::int AS c FROM manifests WHERE is_demo",
  );
  return Response.json({ ok: true, inserted, totalDemo: totals[0].c });
}

export async function DELETE() {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const db = await getDb();
  await db.query(
    "DELETE FROM moderation_flags WHERE code IN (SELECT code FROM manifests WHERE is_demo)",
  );
  const res = await db.query("DELETE FROM manifests WHERE is_demo");
  return Response.json({ ok: true, deleted: res.rowCount ?? 0 });
}
