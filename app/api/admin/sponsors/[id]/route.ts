// ── Admin: sponsor kampanyası güncelle / sil ────────────────────────────

import { getDb } from "../../../../lib/server/db";
import { isAdmin } from "../../../../lib/server/session";
import { bad } from "../../../../lib/server/validate";
import {
  parseSponsorBody,
  toSponsorCampaign,
  type SponsorRow,
} from "../../../../lib/server/sponsors";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const id = Math.floor(Number((await params).id));
  if (!Number.isFinite(id) || id < 1) return bad("Geçersiz kampanya.");
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const p = parseSponsorBody(body);
  if ("error" in p) return bad(p.error!);
  const db = await getDb();
  const { rows } = await db.query(
    `UPDATE sponsors SET name = $2, active = $3, start_ts = $4, end_ts = $5,
       freq = $6, logo = $7, config = $8
     WHERE id = $1 RETURNING *`,
    [
      id,
      p.name,
      p.active,
      p.startTs,
      p.endTs,
      p.freq,
      p.logo,
      JSON.stringify(p.config),
    ],
  );
  if (rows.length === 0) return bad("Kampanya bulunamadı.", 404);
  return Response.json({
    ok: true,
    sponsor: toSponsorCampaign(rows[0] as SponsorRow),
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const id = Math.floor(Number((await params).id));
  if (!Number.isFinite(id) || id < 1) return bad("Geçersiz kampanya.");
  const db = await getDb();
  await db.query("DELETE FROM sponsors WHERE id = $1", [id]);
  return Response.json({ ok: true });
}
