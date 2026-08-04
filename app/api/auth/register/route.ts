// ── Üye kaydı — doğrulanmamış hesap açar, kod akışı ayrı uçtan yürür ─────

import bcrypt from "bcryptjs";
import { getDb, trDate } from "../../../lib/server/db";
import { bad, passwordIssue, validEmail } from "../../../lib/server/validate";

export async function POST(req: Request) {
  const { name, email, pass } = (await req.json()) as {
    name?: string;
    email?: string;
    pass?: string;
  };
  const nm = (name ?? "").trim();
  if (nm.length < 3 || !nm.includes(" "))
    return bad("İsim ve soyisim birlikte yazılmalı.");
  if (!email || !validEmail(email)) return bad("Geçerli bir e-posta adresi gir.");
  const pIssue = passwordIssue(pass ?? "");
  if (pIssue) return bad(pIssue);

  const db = await getDb();
  const existing = await db.query(
    "SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)",
    [email.trim()],
  );
  if (existing.rows.length > 0)
    return bad("Bu e-posta ile zaten bir üyelik var.");

  const id = "u" + Date.now().toString(36);
  await db.query(
    `INSERT INTO users (id, name, email, pass_hash, provider, verified, created_label)
     VALUES ($1, $2, $3, $4, 'email', FALSE, $5)`,
    [id, nm, email.trim(), await bcrypt.hash(pass!, 10), trDate()],
  );
  return Response.json({ ok: true });
}
