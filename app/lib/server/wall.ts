// ── Duvar sorguları — dilimli mimarinin ortak parçaları ──────────────────
// Sıralama günlük tohumla deterministiktir: md5(seed || kod). Böylece
// "duvarın N'inci zarfı hangisi?" sorusunu sunucu cevaplar; istemci
// yalnızca görünür dilimi ister. Tohum her gece 02:00'da değişir
// (istemcideki eski daySeed ile aynı formül).

import type { Pool } from "pg";
import type { MemberManifest } from "../auth";
import { toClientManifest, type ManifestRow } from "./db";
import {
  activeSponsors,
  sponsorItem,
  sponsorSlots,
  type SponsorSlot,
} from "./sponsors";

export function wallSeed(): string {
  return String(Math.floor((Date.now() - 2 * 3600 * 1000) / 86400000));
}

// Yıl/ay filtresi (0 = tümü) — tüm duvar sorguları aynı koşulu kullanır
export function filterSql(y: number, mo: number) {
  return {
    cond: "($1::int = 0 OR y = $1) AND ($2::int = 0 OR mo = $2)",
    params: [y, mo] as unknown[],
  };
}

// Filtreye uyan düz (şişesiz/kutusuz) zarf sayısı — sponsor serpiştirme
// ve meta bunu paylaşır
export async function plainCount(db: Pool, y: number, mo: number) {
  const f = filterSql(y, mo);
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS n FROM manifests
     WHERE ${f.cond} AND NOT bottled AND NOT boxed`,
    f.params,
  );
  return rows[0].n as number;
}

// Yayındaki kampanyaların bugünkü serpiştirme konumları (görüntü uzayı)
export async function wallSponsorSlots(
  db: Pool,
  plain: number,
): Promise<SponsorSlot[]> {
  return sponsorSlots(await activeSponsors(db), plain, wallSeed());
}

async function plainSlice(
  db: Pool,
  y: number,
  mo: number,
  from: number,
  count: number,
) {
  const f = filterSql(y, mo);
  const { rows } = await db.query(
    `SELECT * FROM manifests
     WHERE ${f.cond} AND NOT bottled AND NOT boxed
     ORDER BY md5($3 || code) OFFSET $4 LIMIT $5`,
    [...f.params, wallSeed(), from, Math.max(0, count)],
  );
  return rows as ManifestRow[];
}

// Dilim görüntü uzayında ister: gerçek zarfların arasına, sırası gelen
// sponsor zarfları yerleştirilmiş halde döner
export async function wallSlice(
  db: Pool,
  y: number,
  mo: number,
  from: number,
  to: number,
): Promise<MemberManifest[]> {
  const sponsors = await activeSponsors(db);
  if (sponsors.length === 0)
    return (await plainSlice(db, y, mo, from, to - from)).map(toClientManifest);

  const plain = await plainCount(db, y, mo);
  const slots = sponsorSlots(sponsors, plain, wallSeed());

  // from'dan önceki sponsor sayısı (ikili arama) → veri ofseti kayması
  let lo = 0;
  let hi = slots.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (slots[mid].slot < from) lo = mid + 1;
    else hi = mid;
  }
  const i0 = lo;

  // Görüntü konumlarını yürü: sponsor mu, gerçek zarf mı?
  const kinds: boolean[] = []; // true = sponsor
  let j = i0;
  let dataCount = 0;
  for (let p = from; p < to; p++) {
    if (j < slots.length && slots[j].slot === p) {
      kinds.push(true);
      j++;
    } else {
      kinds.push(false);
      dataCount++;
    }
  }

  const dataRows = await plainSlice(db, y, mo, from - i0, dataCount);
  const items: MemberManifest[] = [];
  let di = 0;
  j = i0;
  for (const isSponsor of kinds) {
    if (isSponsor) items.push(sponsorItem(slots[j++]));
    else if (di < dataRows.length) items.push(toClientManifest(dataRows[di++]));
  }
  return items;
}

// Şişe ve kutular görece nadirdir (150+/250+ şans) — tam liste döner
export async function wallExtras(db: Pool, y: number, mo: number) {
  const f = filterSql(y, mo);
  const seed = wallSeed();
  const [bottles, gifts] = await Promise.all([
    db.query(
      `SELECT * FROM manifests WHERE ${f.cond} AND bottled AND NOT boxed
       ORDER BY md5($3 || code) LIMIT 3000`,
      [...f.params, seed],
    ),
    db.query(
      `SELECT * FROM manifests WHERE ${f.cond} AND boxed
       ORDER BY md5($3 || code) LIMIT 1500`,
      [...f.params, seed],
    ),
  ]);
  return {
    bottles: (bottles.rows as ManifestRow[]).map(toClientManifest),
    gifts: (gifts.rows as ManifestRow[]).map(toClientManifest),
  };
}
