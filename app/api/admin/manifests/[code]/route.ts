// ── Admin: üye manifestini gerekçeli sil ─────────────────────────────────
// Üye Manifestleri sekmesindeki "Sil" buradan geçer. Manifest duvardan
// kaldırılır ve sahibine yumuşak tonlu bilgilendirme maili gönderilir:
// category verilirse gerekçe cümlesi eklenir, verilmezse sadece
// "kaldırıldı" bildirimi gider. Koda bağlı bekleyen moderasyon işareti
// varsa o da kapatılır.

import { getDb } from "../../../../lib/server/db";
import { isAdmin } from "../../../../lib/server/session";
import { bad, validManifestCode } from "../../../../lib/server/validate";
import {
  checkLuckMilestones,
  sendModerationMail,
} from "../../../../lib/server/mailer";
import { MOD_CATEGORIES, type ModCategory } from "../../../../lib/moderation";

// Kategori → mail gerekçe cümlesi ("manifest, {gerekçe} yayından kaldırıldı")
function reasonFor(category: ModCategory): string {
  return (
    `içeriği topluluk kurallarımızın "${MOD_CATEGORIES[category].label}" ` +
    "başlığı kapsamında değerlendirildiği için"
  );
}

// Şans gönderme — girilen miktar manifestin şansına eklenir
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const { code } = await params;
  if (!validManifestCode(code)) return bad("Geçersiz manifest kodu.");
  const body = (await req.json().catch(() => ({}))) as { addLuck?: number };
  const add = Math.floor(Number(body.addLuck));
  if (!Number.isFinite(add) || add < 1 || add > 100000)
    return bad("Geçersiz miktar.");
  const db = await getDb();
  const r = await db.query(
    "UPDATE manifests SET luck = luck + $1 WHERE code = $2 RETURNING luck",
    [add, code],
  );
  if (r.rows.length === 0) return bad("Manifest bulunamadı.", 404);
  // Eşik geçildiyse sahibine başarım maili (beklenmez)
  const newLuck = Number(r.rows[0].luck);
  void checkLuckMilestones(db, code, newLuck - add, newLuck).catch(() => {});
  return Response.json({ ok: true, luck: r.rows[0].luck });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const { code } = await params;
  if (!validManifestCode(code)) return bad("Geçersiz manifest kodu.");
  const body = (await req.json().catch(() => ({}))) as {
    category?: string | null;
  };
  const category = body.category ?? null;
  if (category !== null && !(category in MOD_CATEGORIES))
    return bad("Geçersiz gerekçe.");

  const db = await getDb();
  const { rows } = await db.query(
    `SELECT u.email, u.name AS user_name, m.manifest FROM manifests m
     JOIN users u ON u.id = m.user_id WHERE m.code = $1`,
    [code],
  );
  if (rows.length === 0) return bad("Manifest bulunamadı.", 404);
  const owner = rows[0];

  await db.query("DELETE FROM manifests WHERE code = $1", [code]);
  await db.query(
    `UPDATE moderation_flags SET status = 'deleted', decided_at = now()
     WHERE code = $1 AND status = 'pending'`,
    [code],
  );
  // Silinen manifeste ait ziyaretçi bildirimleri de listeden düşer
  await db.query("DELETE FROM reports WHERE code = $1", [code]);

  let mailSent = false;
  if (owner.email) {
    const r = await sendModerationMail(
      db,
      owner.email,
      owner.user_name,
      owner.manifest,
      category ? reasonFor(category as ModCategory) : "",
    );
    mailSent = r.ok;
  }
  return Response.json({ ok: true, mailSent });
}
