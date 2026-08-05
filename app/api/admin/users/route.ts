// ── Admin: üye listesi — manifestleriyle birlikte ────────────────────────

import { getDb, toClientUser } from "../../../lib/server/db";
import { isAdmin } from "../../../lib/server/session";
import { bad } from "../../../lib/server/validate";

export async function GET() {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const db = await getDb();
  // Manifestler artık gömülmez (100 bin+ kayıtta liste taşar) — yalnızca
  // adet döner; manifest listesi sayfalı /api/admin/manifests ucundadır
  const users = await db.query(
    `SELECT u.id, u.name, u.email, u.provider, u.verified, u.created_label,
            u.created_at, COUNT(m.code)::int AS manifest_count
     FROM users u LEFT JOIN manifests m ON m.user_id = u.id
     GROUP BY u.id ORDER BY u.created_at`,
  );
  return Response.json({
    users: users.rows.map((u) => ({
      ...toClientUser(u, []),
      manifestCount: u.manifest_count as number,
    })),
  });
}
