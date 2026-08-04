// ── Bildirimler — ziyaretçi şikâyetleri ──────────────────────────────────
// GET: bildirilen manifest kodları (duvar "Bildirildi" durumunu gösterir)
// POST: yeni şikâyet — admin panelin Bildirilenler sekmesine düşer

import { getDb, trDate } from "../../lib/server/db";
import { bad } from "../../lib/server/validate";

const REASONS = ["Argo", "Hakaret", "Kötü niyet", "Rahatsız edici"];

export async function GET() {
  const db = await getDb();
  const { rows } = await db.query("SELECT DISTINCT code FROM reports");
  return Response.json({ codes: rows.map((r) => r.code as string) });
}

export async function POST(req: Request) {
  const { code, name, manifest, reason } = (await req.json()) as {
    code?: string;
    name?: string;
    manifest?: string;
    reason?: string;
  };
  if (!code || !name || !manifest || !reason || !REASONS.includes(reason))
    return bad("Eksik veya geçersiz bildirim.");
  const db = await getDb();
  await db.query(
    `INSERT INTO reports (code, name, manifest, reason, ts, date_label)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [code, name, manifest.slice(0, 400), reason, Date.now(), trDate()],
  );
  return Response.json({ ok: true });
}
