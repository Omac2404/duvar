// ── Duvarda kod arama — kodun türü ve (zarfsa) sıra numarası ────────────
// 100 binlik duvarda da arama tek indeksli sorgudur; istemci dönen rank
// ile hedef konuma anında zıplar.

import { getDb, toClientManifest, type ManifestRow } from "../../../lib/server/db";
import { validManifestCode } from "../../../lib/server/validate";
import {
  filterSql,
  plainCount,
  wallSeed,
  wallSponsorSlots,
} from "../../../lib/server/wall";
import { toDisplayRank } from "../../../lib/server/sponsors";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = (url.searchParams.get("code") ?? "").toUpperCase();
  const y = Number(url.searchParams.get("y")) || 0;
  const mo = Number(url.searchParams.get("mo")) || 0;
  const num = /^\d{1,5}$/.test(code) ? code.padStart(5, "0") : null;
  if (!num && !validManifestCode(code))
    return Response.json({ found: false });

  const db = await getDb();
  // Tam kod ya da yalnızca 5 rakamlı kısmıyla arama (mevcut davranış)
  const { rows } = await db.query(
    num
      ? "SELECT * FROM manifests WHERE code LIKE $1 || '%' LIMIT 1"
      : "SELECT * FROM manifests WHERE code = $1 LIMIT 1",
    [num ?? code],
  );
  if (rows.length === 0) return Response.json({ found: false });
  const m = rows[0] as ManifestRow & { y: number; mo: number };
  const inFilter = (!y || m.y === y) && (!mo || m.mo === mo);
  const kind = m.boxed ? "boxed" : m.bottled ? "bottled" : "plain";

  let rank = -1;
  if (inFilter && kind === "plain") {
    const f = filterSql(y, mo);
    const r = await db.query(
      `SELECT COUNT(*)::int AS n FROM manifests
       WHERE ${f.cond} AND NOT bottled AND NOT boxed
         AND md5($3 || code) < md5($3 || $4)`,
      [...f.params, await wallSeed(db), m.code],
    );
    rank = r.rows[0].n as number;
    // Araya giren sponsor zarfları sırayı kaydırır → görüntü uzayına çevir
    const slots = await wallSponsorSlots(db, await plainCount(db, y, mo));
    rank = toDisplayRank(rank, slots);
  }
  return Response.json({
    found: true,
    kind,
    inFilter,
    rank,
    item: toClientManifest(m),
  });
}
