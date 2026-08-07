// ── Duvar meta — sayılar + günlük tohum + şişe/kutu listeleri ───────────
// Duvar açılışında tek istek: zarf adedi (yükseklik hesabı için), yıllar,
// tohum ve az sayıdaki şişe/kutunun tamamı.

import { getDb } from "../../../lib/server/db";
import {
  filterSql,
  wallExtras,
  wallSeed,
  wallSponsorSlots,
} from "../../../lib/server/wall";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const y = Number(url.searchParams.get("y")) || 0;
  const mo = Number(url.searchParams.get("mo")) || 0;
  const db = await getDb();
  const f = filterSql(y, mo);
  const [counts, years, extras] = await Promise.all([
    db.query(
      `SELECT
         COUNT(*) FILTER (WHERE NOT bottled AND NOT boxed)::int AS plain,
         COUNT(*)::int AS total
       FROM manifests WHERE ${f.cond}`,
      f.params,
    ),
    db.query("SELECT DISTINCT y FROM manifests WHERE y > 0 ORDER BY y"),
    wallExtras(db, y, mo),
  ]);
  // plain görüntü uzayıdır: araya serpiştirilen sponsor zarfları da sayılır
  // (dilim aralıkları ve yerleşim yüksekliği buna göre hesaplanır)
  const slots = await wallSponsorSlots(db, counts.rows[0].plain as number);
  return Response.json({
    seed: wallSeed(),
    plain: (counts.rows[0].plain as number) + slots.length,
    total: counts.rows[0].total,
    years: years.rows.map((r) => r.y as number),
    ...extras,
  });
}
