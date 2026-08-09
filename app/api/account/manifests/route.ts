// ── Üyenin manifest listesi — panelden tam liste olarak yazılır ──────────
// Panel update() deseni tüm listeyi gönderir; sunucu içerik alanlarını
// işler ama sayaçları (şans/tebrik/görüntülenme) duvar uçlarına bırakır:
// mevcut manifestte sayaçlar DB'deki değerinde kalır, yenisinde 0 başlar.

import {
  effectiveYear,
  getDb,
  stampForYear,
  trDate,
} from "../../../lib/server/db";
import { sessionUserId } from "../../../lib/server/session";
import { cleanNickname } from "../../../lib/text";
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
  }

  const db = await getDb();
  // Yıllık hak kuralları: yeni manifest yalnızca etkin (içinde bulunulan
  // ya da simüle edilen) yıla yazılır ve o yıla damgalanır; geçmiş yıl
  // manifestleri korunur ya da silinir — silmek geçmiş yıla slot açmaz
  const nowY = await effectiveYear(db);
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query(
      "SELECT code, ts FROM manifests WHERE user_id = $1",
      [uid],
    );
    const mine = new Set(existing.rows.map((r) => r.code as string));
    // Kota, istemcinin gönderdiği ts'e değil sunucu gerçeğine göre sayılır:
    // mevcut manifest DB'deki yılında kalır, yenisi etkin yıla damgalanır
    const yearOf = new Map(
      existing.rows.map((r) => [
        r.code as string,
        new Date(Number(r.ts)).getFullYear(),
      ]),
    );
    const perYear = new Map<number, number>();
    for (const m of manifests) {
      const y = yearOf.get(m.code) ?? nowY;
      perYear.set(y, (perYear.get(y) ?? 0) + 1);
    }
    for (const [y, n] of perYear)
      if (n > QUOTA) {
        await client.query("ROLLBACK");
        return bad(
          y === nowY
            ? `${y} yılı için ${QUOTA} manifest hakkın doldu.`
            : `${y} yılına yeni manifest yazılamaz.`,
        );
      }

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
            // Rumuz emojisiz saklanır (metinde emoji serbest)
            cleanNickname(m.name),
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
        // Yeni manifest her zaman etkin yıla damgalanır (istemcinin
        // gönderdiği ts/tarih dikkate alınmaz — geçmiş yıla yazılamaz)
        const ts = stampForYear(nowY);
        await client.query(
          `INSERT INTO manifests (code, user_id, name, manifest, date_label, ts,
             luck, cheers, views, color_idx, sticker, special, bottled, boxed,
             realized, realized_label)
           VALUES ($1, $2, $3, $4, $5, $6, 0, 0, 0, $7, $8, $9, $10, $11, $12, $13)`,
          [
            m.code,
            uid,
            cleanNickname(m.name),
            m.manifest.trim(),
            trDate(new Date(ts)),
            ts,
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
