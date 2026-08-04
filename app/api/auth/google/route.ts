// ── Google ile giriş ─────────────────────────────────────────────────────
// credential: GIS kimlik jetonu — Google'ın tokeninfo ucunda doğrulanır
// (aud, ayarlardaki Client ID ile eşleşmeli). Client ID tanımlı değilse
// demo hesap seçici akışı (demo: true) kabul edilir.

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { getDb, getMailSettings, trDate } from "../../../lib/server/db";
import { startSession } from "../../../lib/server/session";
import { bad } from "../../../lib/server/validate";

const DEMO_GOOGLE = { name: "Deniz Yılmaz", email: "deniz.yilmaz@gmail.com" };

async function upsertGoogleUser(name: string, email: string): Promise<string> {
  const db = await getDb();
  const existing = await db.query(
    "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
    [email],
  );
  if (existing.rows.length > 0) return existing.rows[0].id as string;
  const id = "u" + Date.now().toString(36);
  // Google üyeliğinde şifre kullanılmaz — rastgele değer hash'lenir
  const hash = await bcrypt.hash("google-" + randomBytes(16).toString("hex"), 10);
  await db.query(
    `INSERT INTO users (id, name, email, pass_hash, provider, verified, created_label)
     VALUES ($1, $2, $3, $4, 'google', TRUE, $5)`,
    [id, name, email, hash, trDate()],
  );
  return id;
}

export async function POST(req: Request) {
  const body = (await req.json()) as { credential?: string; demo?: boolean };
  const db = await getDb();
  const clientId = (await getMailSettings(db)).googleClientId.trim();

  if (body.demo) {
    // Demo akışı yalnızca gerçek Google girişi yapılandırılmamışken açık
    if (clientId) return bad("Google girişi yapılandırılmış; demo akış kapalı.");
    const id = await upsertGoogleUser(DEMO_GOOGLE.name, DEMO_GOOGLE.email);
    await startSession(id);
    return Response.json({ ok: true });
  }

  if (!body.credential || !clientId) return bad("Google girişi doğrulanamadı.");
  try {
    const res = await fetch(
      "https://oauth2.googleapis.com/tokeninfo?id_token=" +
        encodeURIComponent(body.credential),
    );
    if (!res.ok) return bad("Google girişi doğrulanamadı.");
    const info = (await res.json()) as {
      aud?: string;
      email?: string;
      email_verified?: string;
      name?: string;
    };
    if (info.aud !== clientId || !info.email)
      return bad("Google girişi doğrulanamadı.");
    const id = await upsertGoogleUser(
      info.name ?? info.email.split("@")[0],
      info.email,
    );
    await startSession(id);
    return Response.json({ ok: true });
  } catch {
    return bad("Google girişi doğrulanamadı.");
  }
}
