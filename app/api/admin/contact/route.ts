// ── Admin: Bize Yazılanlar — iletişim formu mesajları ───────────────────

import { getDb } from "../../../lib/server/db";
import { isAdmin } from "../../../lib/server/session";
import { bad } from "../../../lib/server/validate";

type ContactRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string | Date;
};

export async function GET() {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT * FROM contact_messages ORDER BY id DESC LIMIT 500",
  );
  return Response.json({
    messages: (rows as ContactRow[]).map((r) => ({
      id: r.id,
      firstName: r.first_name,
      lastName: r.last_name,
      email: r.email,
      phone: r.phone,
      message: r.message,
      ts: new Date(r.created_at).getTime(),
    })),
  });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const id = Math.floor(Number(new URL(req.url).searchParams.get("id")));
  if (!Number.isFinite(id) || id < 1) return bad("Geçersiz mesaj.");
  const db = await getDb();
  await db.query("DELETE FROM contact_messages WHERE id = $1", [id]);
  return Response.json({ ok: true });
}
