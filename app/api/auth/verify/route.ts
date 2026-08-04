// ── Kod doğrulama ────────────────────────────────────────────────────────
// purpose "register": hesabı doğrular + oturum açar.
// purpose "reset": tek kullanımlık şifre sıfırlama jetonu döner.

import { randomBytes } from "crypto";
import { getDb } from "../../../lib/server/db";
import { startSession } from "../../../lib/server/session";
import { bad } from "../../../lib/server/validate";

export async function POST(req: Request) {
  const { email, code, purpose } = (await req.json()) as {
    email?: string;
    code?: string;
    purpose?: "register" | "reset";
  };
  if (!email || !code) return bad("Eksik bilgi.");
  const key = email.trim().toLowerCase();
  const db = await getDb();

  const { rows } = await db.query(
    "SELECT code, expires, attempts FROM verification_codes WHERE email = $1",
    [key],
  );
  if (rows.length === 0)
    return Response.json({ ok: false, error: "Kod bulunamadı, yeniden gönderin." });
  const entry = rows[0];
  if (Date.now() > Number(entry.expires))
    return Response.json({ ok: false, error: "Kodun süresi doldu, yeniden gönderin." });
  if (entry.attempts <= 0)
    return Response.json({ ok: false, error: "Deneme hakkı bitti, yeni kod isteyin." });
  if (entry.code !== code.trim()) {
    const left = entry.attempts - 1;
    await db.query(
      "UPDATE verification_codes SET attempts = $1 WHERE email = $2",
      [left, key],
    );
    return Response.json({
      ok: false,
      error:
        left > 0
          ? `Kod hatalı. ${left} deneme hakkın kaldı.`
          : "Deneme hakkı bitti, yeni kod isteyin.",
      left,
    });
  }
  await db.query("DELETE FROM verification_codes WHERE email = $1", [key]);

  if (purpose === "reset") {
    const token = randomBytes(24).toString("hex");
    await db.query(
      `INSERT INTO reset_tokens (email, token, expires) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET token = $2, expires = $3`,
      [key, token, Date.now() + 10 * 60 * 1000],
    );
    return Response.json({ ok: true, resetToken: token });
  }

  // register: hesabı doğrula + oturum aç
  const u = await db.query(
    "UPDATE users SET verified = TRUE WHERE LOWER(email) = $1 RETURNING id",
    [key],
  );
  if (u.rows.length === 0) return bad("Üyelik bulunamadı.");
  await startSession(u.rows[0].id);
  return Response.json({ ok: true });
}
