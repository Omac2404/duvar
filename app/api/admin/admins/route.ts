// ── Admin hesapları yönetimi — yalnızca süper admin ─────────────────────
// Süper admin Ayarlar'dan yeni admin oluşturur/siler; süper admin
// silinemez. Yeni adminler de her girişte iki adımlı doğrulamadan geçer.

import bcrypt from "bcryptjs";
import { getDb } from "../../../lib/server/db";
import { currentAdmin } from "../../../lib/server/session";
import { bad, validEmail } from "../../../lib/server/validate";

export async function GET() {
  const me = await currentAdmin();
  if (!me?.isSuper) return bad("Yetki yok.", 401);
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT id, email, is_super, created_at FROM admins ORDER BY is_super DESC, id",
  );
  return Response.json({
    admins: rows.map((r) => ({
      id: r.id,
      email: r.email,
      isSuper: r.is_super,
      createdAt: new Date(r.created_at).getTime(),
    })),
  });
}

export async function POST(req: Request) {
  const me = await currentAdmin();
  if (!me?.isSuper) return bad("Yetki yok.", 401);
  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  const mail = (email ?? "").trim().toLowerCase();
  if (!validEmail(mail)) return bad("Geçerli bir e-posta adresi gir.");
  if (!password || password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password))
    return bad("Şifre en az 8 karakter olmalı, harf ve rakam içermeli.");
  const db = await getDb();
  const dup = await db.query("SELECT 1 FROM admins WHERE LOWER(email) = $1", [
    mail,
  ]);
  if (dup.rows.length > 0) return bad("Bu e-posta zaten admin.");
  const hash = await bcrypt.hash(password, 10);
  await db.query(
    "INSERT INTO admins (email, pass_hash, is_super) VALUES ($1, $2, FALSE)",
    [mail, hash],
  );
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const me = await currentAdmin();
  if (!me?.isSuper) return bad("Yetki yok.", 401);
  const id = Math.floor(Number(new URL(req.url).searchParams.get("id")));
  if (!Number.isFinite(id) || id < 1) return bad("Geçersiz admin.");
  const db = await getDb();
  // Süper admin silinemez; oturumları CASCADE ile düşer
  await db.query("DELETE FROM admins WHERE id = $1 AND NOT is_super", [id]);
  return Response.json({ ok: true });
}
