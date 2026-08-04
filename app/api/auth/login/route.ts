// ── Giriş — e-posta + şifre; doğrulanmamış hesap kod akışına yönlenir ────

import bcrypt from "bcryptjs";
import { getDb } from "../../../lib/server/db";
import { startSession } from "../../../lib/server/session";
import { bad } from "../../../lib/server/validate";

export async function POST(req: Request) {
  const { email, pass } = (await req.json()) as {
    email?: string;
    pass?: string;
  };
  if (!email || !pass) return bad("Eksik bilgi.");
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT id, pass_hash, verified FROM users WHERE LOWER(email) = LOWER($1)",
    [email.trim()],
  );
  if (rows.length === 0 || !(await bcrypt.compare(pass, rows[0].pass_hash)))
    return Response.json({ ok: false, error: "E-posta veya şifre hatalı." });
  if (!rows[0].verified) return Response.json({ ok: false, unverified: true });
  await startSession(rows[0].id);
  return Response.json({ ok: true });
}
