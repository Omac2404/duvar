// ── Şifre sıfırlama — verify ucundan alınan jetonla yeni şifre yazılır ───

import bcrypt from "bcryptjs";
import { getDb } from "../../../lib/server/db";
import { startSession } from "../../../lib/server/session";
import { bad, passwordIssue } from "../../../lib/server/validate";

export async function POST(req: Request) {
  const { email, token, newPass } = (await req.json()) as {
    email?: string;
    token?: string;
    newPass?: string;
  };
  if (!email || !token) return bad("Eksik bilgi.");
  const pIssue = passwordIssue(newPass ?? "");
  if (pIssue) return bad(pIssue);
  const key = email.trim().toLowerCase();
  const db = await getDb();

  const { rows } = await db.query(
    "SELECT token, expires FROM reset_tokens WHERE email = $1",
    [key],
  );
  if (rows.length === 0 || rows[0].token !== token || Date.now() > Number(rows[0].expires))
    return bad("Sıfırlama isteği geçersiz, yeniden dene.");
  await db.query("DELETE FROM reset_tokens WHERE email = $1", [key]);

  const u = await db.query(
    "UPDATE users SET pass_hash = $1 WHERE LOWER(email) = $2 RETURNING id",
    [await bcrypt.hash(newPass!, 10), key],
  );
  if (u.rows.length === 0) return bad("Üyelik bulunamadı.");
  await startSession(u.rows[0].id);
  return Response.json({ ok: true });
}
