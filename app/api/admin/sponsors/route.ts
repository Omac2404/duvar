// ── Admin: sponsor kampanyaları — listele + oluştur ─────────────────────
// Reklam sekmesi buradan okur/yazar. Görünüm ve mektup alanları config
// JSONB'de tutulur; logo data URL olarak logo kolonunda saklanır.

import { getDb } from "../../../lib/server/db";
import { isAdmin } from "../../../lib/server/session";
import { bad } from "../../../lib/server/validate";
import {
  parseSponsorBody,
  toSponsorCampaign,
  type SponsorRow,
} from "../../../lib/server/sponsors";

export async function GET() {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const db = await getDb();
  const { rows } = await db.query("SELECT * FROM sponsors ORDER BY id");
  return Response.json({
    sponsors: (rows as SponsorRow[]).map(toSponsorCampaign),
  });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const p = parseSponsorBody(body);
  if ("error" in p) return bad(p.error!);
  const db = await getDb();
  const { rows } = await db.query(
    `INSERT INTO sponsors (name, active, start_ts, end_ts, freq, logo, config)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      p.name,
      p.active,
      p.startTs,
      p.endTs,
      p.freq,
      p.logo,
      JSON.stringify(p.config),
    ],
  );
  return Response.json({
    ok: true,
    sponsor: toSponsorCampaign(rows[0] as SponsorRow),
  });
}
