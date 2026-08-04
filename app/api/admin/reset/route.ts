// ── Admin: üye verilerini sıfırla — test hesabı yeniden tohumlanır ───────

import { getDb, setSetting } from "../../../lib/server/db";
import { isAdmin } from "../../../lib/server/session";
import { bad } from "../../../lib/server/validate";

export async function POST() {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const db = await getDb();
  await db.query("DELETE FROM users"); // manifest + oturum CASCADE
  await db.query("DELETE FROM verification_codes");
  await db.query("DELETE FROM reset_tokens");
  await setSetting(db, "testDeleted", false);
  // Seed süreç başına bir kez koştuğu için tohum burada elle atılır:
  // yeni süreçte de getDb() aynı sonucu üretir (idempotent)
  const g = globalThis as unknown as { mwInit?: Promise<void> };
  g.mwInit = undefined;
  await getDb();
  return Response.json({ ok: true });
}
