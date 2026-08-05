// ── Admin: tek işaret kararı — onayla ya da sil ──────────────────────────
// approve: manifest duvarda kalır, işaret kapanır (bir daha takılmaz).
// delete:  manifest duvardan silinir; sahibine yumuşak tonlu bilgilendirme
//          maili gider (SMTP hazır ve içerik kendine-zarar iması değilse).

import { getDb } from "../../../../lib/server/db";
import { isAdmin } from "../../../../lib/server/session";
import { bad } from "../../../../lib/server/validate";
import { sendModerationMail } from "../../../../lib/server/mailer";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const { id } = await params;
  const flagId = Number(id);
  if (!Number.isInteger(flagId)) return bad("Geçersiz kayıt.");
  const body = (await req.json()) as { action?: string; sendMail?: boolean };
  if (body.action !== "approve" && body.action !== "delete")
    return bad("Geçersiz işlem.");

  const db = await getDb();
  const { rows } = await db.query(
    "SELECT code, reason, self_harm, status FROM moderation_flags WHERE id = $1",
    [flagId],
  );
  if (rows.length === 0) return bad("Kayıt bulunamadı.", 404);
  const flag = rows[0];
  if (flag.status !== "pending") return bad("Bu kayıt zaten karara bağlanmış.");

  if (body.action === "approve") {
    await db.query(
      "UPDATE moderation_flags SET status = 'approved', decided_at = now() WHERE id = $1",
      [flagId],
    );
    return Response.json({ ok: true, mailSent: false });
  }

  // delete — önce sahibini bul (manifest silinince e-posta erişilmez olur)
  const { rows: owners } = await db.query(
    `SELECT u.email, u.name, m.manifest FROM manifests m
     JOIN users u ON u.id = m.user_id WHERE m.code = $1`,
    [flag.code],
  );
  await db.query("DELETE FROM manifests WHERE code = $1", [flag.code]);
  await db.query(
    "UPDATE moderation_flags SET status = 'deleted', decided_at = now() WHERE id = $1",
    [flagId],
  );

  // Mail: kendine-zarar imalı içerikte standart "kural dışı" maili atılmaz;
  // admin isterse sendMail=true ile yine de gönderebilir
  let mailSent = false;
  const wantMail = body.sendMail ?? !flag.self_harm;
  if (wantMail && owners.length > 0 && owners[0].email) {
    const r = await sendModerationMail(
      db,
      owners[0].email,
      owners[0].name,
      owners[0].manifest,
      flag.reason ?? "topluluk kurallarına uygun bulunmadığı için",
    );
    mailSent = r.ok;
  }
  return Response.json({ ok: true, mailSent });
}
