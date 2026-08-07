// ── Bize Ulaşın formu — mesaj kaydeder, admin panelde listelenir ────────

import { getDb } from "../../lib/server/db";
import { sendContactForwardMail } from "../../lib/server/mailer";
import { bad } from "../../lib/server/validate";

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const str = (v: unknown, max: number) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";
  const firstName = str(b.firstName, 60);
  const lastName = str(b.lastName, 60);
  const email = str(b.email, 120);
  const phone = str(b.phone, 30);
  const message = str(b.message, 3000);

  if (!firstName || !lastName) return bad("İsim ve soyisim gerekli.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return bad("Geçerli bir e-posta adresi girin.");
  if (message.length < 5) return bad("Mesajınız çok kısa.");

  const db = await getDb();
  await db.query(
    `INSERT INTO contact_messages (first_name, last_name, email, phone, message)
     VALUES ($1, $2, $3, $4, $5)`,
    [firstName, lastName, email, phone, message],
  );
  // Mesaj SMTP'deki kayıtlı adrese de iletilir (beklenmez; switch'e bağlı)
  void sendContactForwardMail(db, {
    firstName,
    lastName,
    email,
    phone,
    message,
  }).catch(() => {});
  return Response.json({ ok: true });
}
