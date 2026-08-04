// ── Admin: bildirilenler — tam liste ve tekil silme ──────────────────────

import { getDb } from "../../../lib/server/db";
import { isAdmin } from "../../../lib/server/session";
import { bad } from "../../../lib/server/validate";

export async function GET() {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT code, name, manifest, reason, ts, date_label FROM reports ORDER BY ts DESC",
  );
  return Response.json({
    reports: rows.map((r) => ({
      code: r.code,
      name: r.name,
      manifest: r.manifest,
      reason: r.reason,
      ts: Number(r.ts),
      date: r.date_label,
    })),
  });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const ts = url.searchParams.get("ts");
  if (!code || !ts) return bad("Eksik bilgi.");
  const db = await getDb();
  await db.query("DELETE FROM reports WHERE code = $1 AND ts = $2", [
    code,
    Number(ts),
  ]);
  return Response.json({ ok: true });
}
