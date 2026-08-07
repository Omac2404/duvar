// ── Site içeriği — SSS (Merak Edilenler) ve Instagram ayarı ─────────────
// İkisi de settings tablosunda yaşar; admin panelin İçerik ve Ayarlar
// sekmelerinden düzenlenir. Anahtar hiç yazılmamışsa varsayılanlar döner.

import type { Pool } from "pg";
import { getSetting } from "./db";

export type FaqItem = { q: string; a: string };

export type InstagramSetting = { text: string; url: string };

export const DEFAULT_INSTAGRAM: InstagramSetting = {
  text: "bizi instagramda takip et",
  url: "",
};

// İlk kurulum içeriği — admin İçerik sekmesinden özgürce değiştirilir
export const DEFAULT_FAQ: FaqItem[] = [
  {
    q: "Manifest Duvarı nedir?",
    a:
      "Manifest Duvarı, hayallerini ve hedeflerini bir zarfa yazıp koca bir " +
      "duvara astığın; başkalarının da sana şans dileyebildiği bir dilek " +
      "duvarıdır. Her manifest, duvarda kendine özgü renkte bir zarfla durur.",
  },
  {
    q: "Manifest nasıl bırakırım?",
    a:
      "Üye olduktan sonra üye panelinden \"Yeni Manifest Yaz\" ile " +
      "manifestini yazarsın. Zarfın duvara asılır ve sana özel 7 haneli bir " +
      "zarf kodu verilir; bu kodla zarfını herkes bulabilir.",
  },
  {
    q: "Zarf kodu ne işe yarar?",
    a:
      "Her zarfın 5 rakam + 2 harften oluşan benzersiz bir kodu vardır " +
      "(örn. 48213KT). Duvarın üstündeki arama kutusuna kodu yazınca duvar " +
      "seni doğrudan o zarfa götürür.",
  },
  {
    q: "Şans dilemek ne kazandırır?",
    a:
      "Zarfını açan ziyaretçiler sana şans dileyebilir. 20 şansta zarfına " +
      "süs, 50 şansta parlak özel renk, 150 şansta manifestin şişede " +
      "sergilenmesi, 250 şansta ise hediye kutusu hakkı kazanırsın.",
  },
  {
    q: "Manifestim gerçekleşince ne olur?",
    a:
      "Panelinden \"Gerçekleşti mi?\" ile işaretlersin. Zarfın yeşil " +
      "\"Gerçekleşti\" rozeti taşır, şansın dondurulur ve ziyaretçiler seni " +
      "tebrik edebilir.",
  },
  {
    q: "Manifestim neden kaldırılmış olabilir?",
    a:
      "Topluluk kurallarına uymayan içerikler (hakaret, reklam, kişisel " +
      "veri vb.) denetimden geçer ve kaldırılabilir. Kaldırılan her manifest " +
      "için sahibine bilgilendirme e-postası gönderilir.",
  },
];

export async function getFaq(p: Pool): Promise<FaqItem[]> {
  return getSetting(p, "faq", DEFAULT_FAQ);
}

export async function getInstagram(p: Pool): Promise<InstagramSetting> {
  return { ...DEFAULT_INSTAGRAM, ...(await getSetting(p, "instagram", {})) };
}
