// ── Oturum yönetimi — httpOnly cookie + sessions tablosu ────────────────
// Üye oturumu: rastgele token DB'de saklanır, cookie'de taşınır.
// Admin oturumu: ADMIN_PASSWORD'un SHA-256 özeti cookie'de doğrulanır
// (bu ölçekte tablo gerektirmeyecek kadar basit; şifre değişince düşer).

import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { getDb, toClientUser, type ManifestRow } from "./db";

const SESSION_COOKIE = "mw_session";
const ADMIN_COOKIE = "mw_admin";
const SESSION_DAYS = 30;

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function startSession(userId: string) {
  const db = await getDb();
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000);
  await db.query(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)",
    [token, userId, expires],
  );
  (await cookies()).set(SESSION_COOKIE, token, {
    ...cookieBase,
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.query("DELETE FROM sessions WHERE token = $1", [token]);
  }
  jar.delete(SESSION_COOKIE);
}

// Oturumdaki kullanıcının id'si (yoksa null)
export async function sessionUserId(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT user_id FROM sessions WHERE token = $1 AND expires_at > now()",
    [token],
  );
  return rows.length > 0 ? (rows[0].user_id as string) : null;
}

// Oturumdaki kullanıcı, manifestleriyle birlikte (client User biçimi)
export async function sessionUser() {
  const id = await sessionUserId();
  if (!id) return null;
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT id, name, email, provider, verified, created_label FROM users WHERE id = $1",
    [id],
  );
  if (rows.length === 0) return null;
  const m = await db.query(
    "SELECT * FROM manifests WHERE user_id = $1 ORDER BY ts DESC",
    [id],
  );
  return toClientUser(rows[0], m.rows as ManifestRow[]);
}

// ── Admin ────────────────────────────────────────────────────────────────

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "manifest-admin";
}

function adminDigest(): string {
  return createHash("sha256").update("mw-admin:" + adminPassword()).digest("hex");
}

export function checkAdminPassword(pass: string): boolean {
  return pass === adminPassword();
}

export async function grantAdmin() {
  (await cookies()).set(ADMIN_COOKIE, adminDigest(), {
    ...cookieBase,
    maxAge: 7 * 86400,
  });
}

export async function isAdmin(): Promise<boolean> {
  return (await cookies()).get(ADMIN_COOKIE)?.value === adminDigest();
}

export async function revokeAdmin() {
  (await cookies()).delete(ADMIN_COOKIE);
}
