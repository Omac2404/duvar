// ── Doğrulama kodu gönderimi ─────────────────────────────────────────────
// SMTP yapılandırıldıysa gerçek e-posta gider; değilse (veya gönderim
// başarısız olursa) kod yanıtla döner ve üye ekranı demo bildirimi gösterir.

import { getDb } from "../../../lib/server/db";
import { sendCodeMail, smtpConfigured } from "../../../lib/server/mailer";
import { bad, validEmail } from "../../../lib/server/validate";

const CODE_TTL_MS = 10 * 60 * 1000;
const CODE_RESEND_MS = 60 * 1000;
const CODE_MAX_ATTEMPTS = 3;

export async function POST(req: Request) {
  const { email, requireUser } = (await req.json()) as {
    email?: string;
    requireUser?: boolean;
  };
  if (!email || !validEmail(email)) return bad("Geçerli bir e-posta adresi gir.");
  const key = email.trim().toLowerCase();
  const db = await getDb();

  // Şifre sıfırlama akışı: kayıtlı üyelik yoksa kod gönderilmez
  if (requireUser) {
    const u = await db.query(
      "SELECT 1 FROM users WHERE LOWER(email) = $1",
      [key],
    );
    if (u.rows.length === 0)
      return bad("Bu e-posta ile kayıtlı bir üyelik yok.");
  }

  const now = Date.now();
  const prev = await db.query(
    "SELECT last_sent, attempts FROM verification_codes WHERE email = $1",
    [key],
  );
  // Deneme hakkı bittiyse 60 sn bekletmeden yeni kod istenebilir
  if (
    prev.rows.length > 0 &&
    now - Number(prev.rows[0].last_sent) < CODE_RESEND_MS &&
    prev.rows[0].attempts > 0
  ) {
    const waitSec = Math.ceil(
      (CODE_RESEND_MS - (now - Number(prev.rows[0].last_sent))) / 1000,
    );
    return Response.json({ ok: false, waitSec });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await db.query(
    `INSERT INTO verification_codes (email, code, expires, attempts, last_sent)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE
       SET code = $2, expires = $3, attempts = $4, last_sent = $5`,
    [key, code, now + CODE_TTL_MS, CODE_MAX_ATTEMPTS, now],
  );

  if (await smtpConfigured(db)) {
    const m = await sendCodeMail(db, key, code);
    if (m.ok) return Response.json({ ok: true, sent: true });
    // Gerçek gönderim başarısız: neden + demo kod (akış kilitlenmesin)
    return Response.json({ ok: true, sent: false, error: m.error, demoCode: code });
  }
  return Response.json({ ok: true, sent: false, demoCode: code });
}
