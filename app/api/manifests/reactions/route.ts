// ── Oturumdaki üyenin verdiği tepkiler ──────────────────────────────────
// Duvar, zarfı açmadan önce bunu okur: daha önce şans dilenmiş/tebrik
// edilmiş zarflarda yıldız dolu görünür ve buton yeniden tıklanamaz.
// Girişsiz ziyaretçide boş liste döner.

import { getDb } from "../../../lib/server/db";
import { sessionUserId } from "../../../lib/server/session";

export async function GET() {
  const userId = await sessionUserId();
  if (!userId) return Response.json({ luck: [], cheer: [] });
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT code, type FROM manifest_reactions WHERE user_id = $1",
    [userId],
  );
  return Response.json({
    luck: rows.filter((r) => r.type === "luck").map((r) => r.code as string),
    cheer: rows.filter((r) => r.type === "cheer").map((r) => r.code as string),
  });
}
