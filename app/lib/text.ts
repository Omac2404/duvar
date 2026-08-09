// ── Ortak metin yardımcıları — istemci ve sunucu aynı kuralı kullanır ────

// Rumuz düz metindir: emoji/ikon karakterleri yazarken ayıklanır.
// Manifest METNİNDE emoji serbesttir, yalnızca rumuz temiz tutulur —
// duvarda zarfın üstünde yalnızca rumuz göründüğü için karışık
// görünmesin diye böyle istendi.
export function stripEmoji(s: string): string {
  return s.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, "");
}

// Rumuzu kaydedilebilir biçime getirir: emoji ayıklanır, boşluklar
// sadeleşir, 20 karaktere kırpılır. Tamamı emojiden oluşan rumuz boşa
// düşeceği için "Anonim"e çevrilir
export function cleanNickname(s: string): string {
  const t = stripEmoji(s).replace(/\s+/g, " ").trim().slice(0, 20).trim();
  return t || "Anonim";
}
