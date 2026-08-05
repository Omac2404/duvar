// ── Duvar sorguları — dilimli mimarinin ortak parçaları ──────────────────
// Sıralama günlük tohumla deterministiktir: md5(seed || kod). Böylece
// "duvarın N'inci zarfı hangisi?" sorusunu sunucu cevaplar; istemci
// yalnızca görünür dilimi ister. Tohum her gece 02:00'da değişir
// (istemcideki eski daySeed ile aynı formül).

import type { Pool } from "pg";
import { toClientManifest, type ManifestRow } from "./db";

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

export async function wallSlice(
  db: Pool,
  y: number,
  mo: number,
  from: number,
  to: number,
) {
  const f = filterSql(y, mo);
  const { rows } = await db.query(
    `SELECT * FROM manifests
     WHERE ${f.cond} AND NOT bottled AND NOT boxed
     ORDER BY md5($3 || code) OFFSET $4 LIMIT $5`,
    [...f.params, wallSeed(), from, Math.max(0, to - from)],
  );
  return (rows as ManifestRow[]).map(toClientManifest);
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
