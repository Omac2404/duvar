// ── Hesap ayarları — isim/şifre güncelleme ve hesabı kalıcı silme ────────

import bcrypt from "bcryptjs";
import { getDb, setSetting } from "../../lib/server/db";
import { endSession, sessionUserId } from "../../lib/server/session";
import { bad, passwordIssue } from "../../lib/server/validate";

export async function PATCH(req: Request) {
  const uid = await sessionUserId();
  if (!uid) return bad("Oturum bulunamadı.", 401);
  const { name, oldPass, newPass } = (await req.json()) as {
    name?: string;
    oldPass?: string;
    newPass?: string;
  };
  const nm = (name ?? "").trim();
  if (nm.length < 3 || !nm.includes(" "))
    return bad("İsim ve soyisim birlikte yazılmalı.");

  const db = await getDb();
  if (oldPass || newPass) {
    const { rows } = await db.query(
      "SELECT pass_hash, provider FROM users WHERE id = $1",
      [uid],
    );
    if (rows.length === 0) return bad("Üyelik bulunamadı.");
    if (rows[0].provider !== "email")
      return bad("Google üyeliğinde şifre değiştirilemez.");
    if (!(await bcrypt.compare(oldPass ?? "", rows[0].pass_hash)))
      return bad("Mevcut şifre hatalı.");
    const issue = passwordIssue(newPass ?? "");
    if (issue) return bad(issue);
    await db.query("UPDATE users SET name = $1, pass_hash = $2 WHERE id = $3", [
      nm,
      await bcrypt.hash(newPass!, 10),
      uid,
    ]);
  } else {
    await db.query("UPDATE users SET name = $1 WHERE id = $2", [nm, uid]);
  }
  return Response.json({ ok: true });
}

export async function DELETE() {
  const uid = await sessionUserId();
  if (!uid) return bad("Oturum bulunamadı.", 401);
  const db = await getDb();
  await db.query("DELETE FROM users WHERE id = $1", [uid]); // manifest + oturum CASCADE
  // Test hesabı bilerek silindiyse yeniden tohumlanmasın
  if (uid === "u-test") await setSetting(db, "testDeleted", true);
  await endSession();
  return Response.json({ ok: true });
}
