// ── Admin: tek üye — tam kayıt güncelleme (saveUser karşılığı) ve silme ──
// Admin editörü sayaçlar dahil her alanı yazabilir (üye ucundan farkı bu).

import { getDb, setSetting, trDate } from "../../../../lib/server/db";
import { isAdmin } from "../../../../lib/server/session";
import { cleanNickname } from "../../../../lib/text";
import { bad, validManifestCode } from "../../../../lib/server/validate";
import { sendAccountDeletedMail } from "../../../../lib/server/mailer";

type IncomingManifest = {
  code: string;
  name: string;
  manifest: string;
  date: string;
  ts: number;
  luck: number;
  cheers: number;
  views: number;
  colorIdx: number;
  sticker?: string;
  special?: number;
  bottled?: boolean;
  boxed?: boolean;
  realized: boolean;
  realizedDate?: string;
};

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const { id } = await params;
  const body = (await req.json()) as {
    name?: string;
    verified?: boolean;
    manifests?: IncomingManifest[];
  };
  // manifests artık isteğe bağlı: verilmezse yalnızca isim/doğrulama yazılır
  const manifests = Array.isArray(body.manifests) ? body.manifests : [];
  const syncManifests = Array.isArray(body.manifests);
  for (const m of manifests)
    if (!validManifestCode(m.code ?? "")) return bad("Geçersiz manifest kodu.");

  const db = await getDb();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const u = await client.query("SELECT 1 FROM users WHERE id = $1", [id]);
    if (u.rows.length === 0) {
      await client.query("ROLLBACK");
      return bad("Üye bulunamadı.", 404);
    }
    if (body.name !== undefined || body.verified !== undefined)
      await client.query(
        `UPDATE users SET
           name = COALESCE($1, name),
           verified = COALESCE($2, verified)
         WHERE id = $3`,
        [body.name ?? null, body.verified ?? null, id],
      );

    const codes = new Set(manifests.map((m) => m.code));
    if (syncManifests) {
      const existing = await client.query(
        "SELECT code FROM manifests WHERE user_id = $1",
        [id],
      );
      for (const r of existing.rows)
        if (!codes.has(r.code))
          await client.query("DELETE FROM manifests WHERE code = $1", [r.code]);
    }

    for (const m of manifests) {
      // Kod başka üyedeyse çakışma hatası
      const clash = await client.query(
        "SELECT user_id FROM manifests WHERE code = $1",
        [m.code],
      );
      if (clash.rows.length > 0 && clash.rows[0].user_id !== id) {
        await client.query("ROLLBACK");
        return bad("Bu kod başka bir üyede kullanımda.");
      }
      await client.query(
        `INSERT INTO manifests (code, user_id, name, manifest, date_label, ts,
           luck, cheers, views, color_idx, sticker, special, bottled, boxed,
           realized, realized_label)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT (code) DO UPDATE SET
           name = $3, manifest = $4, date_label = $5, ts = $6, luck = $7,
           cheers = $8, views = $9, color_idx = $10, sticker = $11,
           special = $12, bottled = $13, boxed = $14, realized = $15,
           realized_label = $16`,
        [
          m.code,
          id,
          cleanNickname(m.name ?? ""), // rumuz emojisiz saklanır
          (m.manifest ?? "").trim(),
          m.date || trDate(),
          m.ts || Date.now(),
          Math.max(0, m.luck ?? 0),
          Math.max(0, m.cheers ?? 0),
          Math.max(0, m.views ?? 0),
          m.colorIdx ?? 0,
          m.sticker ?? null,
          m.special ?? null,
          !!m.bottled,
          !!m.boxed,
          !!m.realized,
          m.realized ? (m.realizedDate ?? trDate()) : null,
        ],
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
  return Response.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const { id } = await params;
  const db = await getDb();
  // E-posta silmeden önce alınır — silinince erişilemez
  const { rows } = await db.query(
    "SELECT email, name FROM users WHERE id = $1",
    [id],
  );
  await db.query("DELETE FROM users WHERE id = $1", [id]);
  if (id === "u-test") await setSetting(db, "testDeleted", true);

  let mailSent = false;
  if (rows.length > 0 && rows[0].email) {
    const r = await sendAccountDeletedMail(db, rows[0].email, rows[0].name);
    mailSent = r.ok;
  }
  return Response.json({ ok: true, mailSent });
}
