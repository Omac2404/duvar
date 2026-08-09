// ── Yıllık manifest hakkı — panel ve alt bar aynı sayıyı kullanır ───────

export const MANIFEST_QUOTA = 3;

export type QuotaInfo = {
  year: number; // etkin yıl (admin yıl simülasyonu dahil)
  used: number; // o yıl yazılmış manifest sayısı
};

// Alt bardaki mor butonun rozeti: "2026 manifest 3/1" — soldaki toplam
// hak, sağdaki kullanılan. Hepsi dolduğunda "3/3" olur
export function quotaBadge(q: QuotaInfo): string {
  return `${q.year} manifest ${MANIFEST_QUOTA}/${Math.min(
    q.used,
    MANIFEST_QUOTA,
  )}`;
}
