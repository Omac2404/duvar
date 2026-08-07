// ── Admin girişi — iki adımlı (şifre + e-posta kodu) ────────────────────
// 1. adım: { email, password } → doğruysa e-postaya 6 haneli kod gider
//    (SMTP yoksa ya da kod bildirimi kapalıysa kod yanıtla döner, ekranda
//    demo bildirimi gösterilir).
// 2. adım: { email, code } → kod doğruysa admin oturumu açılır.
// Adminler admins tablosunda; süper admin her açılışta garanti edilir.

import bcrypt from "bcryptjs";
import { getDb } from "../../../lib/server/db";
import { getNotify } from "../../../lib/server/content";
import {
  currentAdmin,
  grantAdmin,
  revokeAdmin,
} from "../../../lib/server/session";
import { sendAdminCodeMail, smtpConfigured } from "../../../lib/server/mailer";
import { bad, validEmail } from "../../../lib/server/validate";

const CODE_TTL_MS = 10 * 60 * 1000;
const CODE_RESEND_MS = 60 * 1000;
const CODE_MAX_ATTEMPTS = 3;
const KEY_PREFIX = "admin:"; // verification_codes içinde üye kodlarıyla çakışmasın

export async function GET() {
  const a = await currentAdmin();
  return Response.json(
    a ? { ok: true, email: a.email, isSuper: a.isSuper } : { ok: false },
  );
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    code?: string;
  };
  const email = (body.email ?? "").trim().toLowerCase();
  if (!validEmail(email)) return bad("Geçerli bir e-posta adresi gir.");
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT id, email, pass_hash FROM admins WHERE LOWER(email) = $1",
    [email],
  );
  const admin = rows[0];
  const key = KEY_PREFIX + email;

  // ── 2. adım: kod doğrulama ──
  if (body.code !== undefined) {
    if (!admin) return bad("E-posta ya da şifre hatalı.", 401);
    const v = await db.query(
      "SELECT code, expires, attempts FROM verification_codes WHERE email = $1",
      [key],
    );
    const rec = v.rows[0];
    if (!rec || Date.now() > Number(rec.expires))
      return bad("Kodun süresi dolmuş; baştan giriş yap.");
    if (rec.attempts <= 0) return bad("Deneme hakkın bitti; baştan giriş yap.");
    if (String(body.code).trim() !== rec.code) {
      await db.query(
        "UPDATE verification_codes SET attempts = attempts - 1 WHERE email = $1",
        [key],
      );
      return bad(`Kod hatalı. ${rec.attempts - 1} deneme hakkın kaldı.`);
    }
    await db.query("DELETE FROM verification_codes WHERE email = $1", [key]);
    await grantAdmin(admin.id);
    return Response.json({ ok: true });
  }

  // ── 1. adım: e-posta + şifre ──
  if (!body.password || !admin) return bad("E-posta ya da şifre hatalı.", 401);
  const passOk = await bcrypt.compare(body.password, admin.pass_hash);
  if (!passOk) return bad("E-posta ya da şifre hatalı.", 401);

  // Admin giriş doğrulaması (Bildirimler) kapalıysa iki adım atlanır:
  // canlıya ilk taşımada SMTP yokken panele girilebilsin diye. SMTP
  // kurulduktan sonra switch açılır ve giriş iki adımlı olur
  if (!(await getNotify(db)).adminLogin) {
    await grantAdmin(admin.id);
    return Response.json({ ok: true, direct: true });
  }

  const now = Date.now();
  const prev = await db.query(
    "SELECT last_sent FROM verification_codes WHERE email = $1",
    [key],
  );
  if (
    prev.rows.length > 0 &&
    now - Number(prev.rows[0].last_sent) < CODE_RESEND_MS
  ) {
    const waitSec = Math.ceil(
      (CODE_RESEND_MS - (now - Number(prev.rows[0].last_sent))) / 1000,
    );
    return Response.json({ ok: true, sent: false, waitSec });
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
    const m = await sendAdminCodeMail(db, admin.email, code);
    if (m.ok) return Response.json({ ok: true, sent: true });
    return Response.json({ ok: true, sent: false, demoCode: code });
  }
  return Response.json({ ok: true, sent: false, demoCode: code });
}

export async function DELETE() {
  await revokeAdmin();
  return Response.json({ ok: true });
}
