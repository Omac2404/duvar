// ── Üyenin manifest listesi — panelden tam liste olarak yazılır ──────────
// Panel update() deseni tüm listeyi gönderir; sunucu içerik alanlarını
// işler ama sayaçları (şans/tebrik/görüntülenme) duvar uçlarına bırakır:
// mevcut manifestte sayaçlar DB'deki değerinde kalır, yenisinde 0 başlar.

import { getDb, trDate } from "../../../lib/server/db";
import { sessionUserId } from "../../../lib/server/session";
import { bad, validManifestCode } from "../../../lib/server/validate";

type IncomingManifest = {
  code: string;
  name: string;
  manifest: string;
  date: string;
  ts: number;
  colorIdx: number;
  sticker?: string;
  special?: number;
  bottled?: boolean;
  boxed?: boolean;
  realized: boolean;
  realizedDate?: string;
};

const QUOTA = 3; // yıl başına manifest hakkı

export async function PUT(req: Request) {
  const uid = await sessionUserId();
  if (!uid) return bad("Oturum bulunamadı.", 401);
  const { manifests } = (await req.json()) as { manifests?: IncomingManifest[] };
  if (!Array.isArray(manifests)) return bad("Geçersiz istek.");

  // Doğrulamalar — client kurallarıyla aynı
  const perYear = new Map<number, number>();
  const codes = new Set<string>();
  for (const m of manifests) {
    if (!m || !validManifestCode(m.code ?? "")) return bad("Geçersiz manifest kodu.");
    if (codes.has(m.code)) return bad("Kod tekrarı.");
    codes.add(m.code);
    if ((m.name ?? "").trim().length < 2)
      return bad("Rumuz en az 2 karakter olmalı.");
    const text = (m.manifest ?? "").trim();
    if (text.length < 10) return bad("Manifest en az 10 karakter olmalı.");
    if (text.length > 300) return bad("Manifest en fazla 300 karakter olabilir.");
    const y = new Date(m.ts).getFullYear();
    perYear.set(y, (perYear.get(y) ?? 0) + 1);
  }
  for (const [, n] of perYear)
    if (n > QUOTA) return bad(`Yıl başına en fazla ${QUOTA} manifest hakkın var.`);

  const db = await getDb();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query(
      "SELECT code FROM manifests WHERE user_id = $1",
      [uid],
    );
    const mine = new Set(existing.rows.map((r) => r.code as string));

    // Listeden çıkanlar silinir
    for (const code of mine)
      if (!codes.has(code))
        await client.query("DELETE FROM manifests WHERE code = $1 AND user_id = $2", [
          code,
          uid,
        ]);

    for (const m of manifests) {
      if (mine.has(m.code)) {
        // İçerik alanları güncellenir; sayaçlar DB değerinde kalır
        await client.query(
          `UPDATE manifests SET name = $1, manifest = $2, color_idx = $3,
             sticker = $4, special = $5, bottled = $6, boxed = $7,
             realized = $8, realized_label = $9
           WHERE code = $10 AND user_id = $11`,
          [
            m.name.trim(),
            m.manifest.trim(),
            m.colorIdx ?? 0,
            m.sticker ?? null,
            m.special ?? null,
            !!m.bottled,
            !!m.boxed,
            !!m.realized,
            m.realized ? (m.realizedDate ?? trDate()) : null,
            m.code,
            uid,
          ],
        );
      } else {
        // Yeni manifest: kod başka üyede varsa PK çakışması döner
        const clash = await client.query(
          "SELECT 1 FROM manifests WHERE code = $1",
          [m.code],
        );
        if (clash.rows.length > 0) {
          await client.query("ROLLBACK");
          return bad("Bu kod kullanımda, sayfayı yenileyip tekrar dene.");
        }
        await client.query(
          `INSERT INTO manifests (code, user_id, name, manifest, date_label, ts,
             luck, cheers, views, color_idx, sticker, special, bottled, boxed,
             realized, realized_label)
           VALUES ($1, $2, $3, $4, $5, $6, 0, 0, 0, $7, $8, $9, $10, $11, $12, $13)`,
          [
            m.code,
            uid,
            m.name.trim(),
            m.manifest.trim(),
            m.date || trDate(),
            m.ts || Date.now(),
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
