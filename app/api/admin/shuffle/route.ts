// ── Admin: duvarı elle karıştır ─────────────────────────────────────────
// Duvar sırası md5(tohum || kod) ile belirlenir; tohum "gün sayısı +
// karıştırma sayacı"dır. Bu uç sayacı bir artırır, böylece gece 00:00'ı
// beklemeden bütün zarflar yeniden dağılır. Şişe, kutu ve sponsor
// konumları da aynı tohumdan türediği için onlar da yer değiştirir.

import { getDb, getSetting, setSetting } from "../../../lib/server/db";
import { isAdmin } from "../../../lib/server/session";
import { WALL_SHUFFLE_KEY, wallSeed } from "../../../lib/server/wall";
import { bad } from "../../../lib/server/validate";

export async function POST() {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const db = await getDb();
  const next = (Number(await getSetting(db, WALL_SHUFFLE_KEY, 0)) || 0) + 1;
  await setSetting(db, WALL_SHUFFLE_KEY, next);
  return Response.json({ ok: true, shuffles: next, seed: await wallSeed(db) });
}
