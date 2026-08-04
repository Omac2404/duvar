// ── Admin: üye listesi — manifestleriyle birlikte ────────────────────────

import {
  getDb,
  toClientUser,
  type ManifestRow,
} from "../../../lib/server/db";
import { isAdmin } from "../../../lib/server/session";
import { bad } from "../../../lib/server/validate";

export async function GET() {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const db = await getDb();
  const users = await db.query(
    "SELECT id, name, email, provider, verified, created_label FROM users ORDER BY created_at",
  );
  const manifests = await db.query("SELECT * FROM manifests ORDER BY ts DESC");
  const byUser = new Map<string, ManifestRow[]>();
  for (const m of manifests.rows as ManifestRow[]) {
    const list = byUser.get(m.user_id) ?? [];
    list.push(m);
    byUser.set(m.user_id, list);
  }
  return Response.json({
    users: users.rows.map((u) => toClientUser(u, byUser.get(u.id) ?? [])),
  });
}
