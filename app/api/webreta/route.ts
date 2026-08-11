// ── Webreta zarfı beğenileri ────────────────────────────────────────────
// Sayaç settings tablosunda (webretaLikes) tutulur. Girişli üyede tekillik
// manifest_reactions üzerinden korunur (kod: WEBRETA, tip: like) — bir üye
// bir kez beğenir. Girişsiz ziyaretçide sunucu tarafında kimlik olmadığı
// için tekillik istemcideki yerel kayıtla sağlanır.

import { getDb, getSetting, setSetting } from "../../lib/server/db";
import { sessionUserId } from "../../lib/server/session";

const KEY = "webretaLikes";
const CODE = "WEBRETA";

export const dynamic = "force-dynamic";

async function readLikes() {
  const db = await getDb();
  return Number(await getSetting(db, KEY, 0)) || 0;
}

export async function GET() {
  const db = await getDb();
  const likes = Number(await getSetting(db, KEY, 0)) || 0;
  // Girişli üye daha önce beğendi mi
  let liked = false;
  const uid = await sessionUserId();
  if (uid) {
    const { rows } = await db.query(
      "SELECT 1 FROM manifest_reactions WHERE code = $1 AND user_id = $2 AND type = 'like'",
      [CODE, uid],
    );
    liked = rows.length > 0;
  }
  return Response.json(
    { likes, liked },
    { headers: { "Cache-Control": "no-store, must-revalidate" } },
  );
}

export async function POST() {
  const db = await getDb();
  const uid = await sessionUserId();
  if (uid) {
    const claim = await db.query(
      `INSERT INTO manifest_reactions (code, user_id, type)
       VALUES ($1, $2, 'like') ON CONFLICT DO NOTHING`,
      [CODE, uid],
    );
    if ((claim.rowCount ?? 0) === 0)
      return Response.json({ ok: false, already: true, likes: await readLikes() });
  }
  const next = (Number(await getSetting(db, KEY, 0)) || 0) + 1;
  await setSetting(db, KEY, next);
  return Response.json({ ok: true, likes: next });
}
