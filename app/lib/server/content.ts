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

// Duvardaki kayan bilgi şeridi — yazı boşsa şerit gizlenir
export type MarqueeSetting = { text: string; seconds: number };

export const DEFAULT_MARQUEE: MarqueeSetting = {
  text: "Tüm manifestlerin yerleri gece 12'de karıştırılır",
  seconds: 36,
};

export async function getMarquee(p: Pool): Promise<MarqueeSetting> {
  const m = { ...DEFAULT_MARQUEE, ...(await getSetting(p, "marquee", {})) };
  m.seconds = Math.min(300, Math.max(5, Number(m.seconds) || 36));
  return m;
}

// İlk kurulum içeriği — admin İçerik sekmesinden özgürce değiştirilir
export const DEFAULT_FAQ: FaqItem[] = [
  {
    q: "Manifest Duvarı nedir?",
    a:
      "Manifest Duvarı, hayallerini ve hedeflerini bir zarfa yazıp koca bir " +
      "duvara astığın; başkalarının da sana şans dileyebildiği bir dilek " +
      "duvarıdır. Her manifest, duvarda kendine özgü renkte bir zarfla durur " +
      "ve binlerce hayalin arasında kendine bir yer bulur.",
  },
  {
    q: "Manifest yazmak ücretli mi?",
    a:
      "Hayır, üyelik de manifest yazmak da tamamen ücretsizdir. Tek sınır, " +
      "her üyenin yıl başına 3 manifest hakkı olmasıdır.",
  },
  {
    q: "Nasıl üye olurum?",
    a:
      "Sağ üstteki \"Giriş Yap / Üye Ol\" butonundan e-posta adresinle üye " +
      "olabilirsin; ilk üyelikte e-postana gelen 6 haneli kodla hesabını " +
      "doğrularsın. Dilersen Google hesabınla tek tıkla da giriş yapabilirsin.",
  },
  {
    q: "Manifest nasıl bırakırım?",
    a:
      "Üye olduktan sonra üye panelinden \"Yeni Manifest Yaz\" ile " +
      "manifestini yazarsın. Zarfın anında duvara asılır ve sana özel 7 " +
      "haneli bir zarf kodu verilir; yazdıktan sonra duvar seni doğrudan " +
      "zarfının yanına götürür.",
  },
  {
    q: "Yılda kaç manifest yazabilirim?",
    a:
      "Her üyenin yıl başına 3 manifest hakkı vardır. İçinde bulunduğun " +
      "yılda bir manifestini silersen o hak yeniden açılır; yeni yıl " +
      "geldiğinde ise herkese 3 yeni hak tanımlanır.",
  },
  {
    q: "Yeni yıl gelince eski manifestlerim ne olur?",
    a:
      "Hiçbir yere gitmez. Geçmiş yılların manifestleri panelinde yıl " +
      "sekmeleri altında arşiv olarak durur; duvarda da yıl filtresiyle " +
      "görüntülenebilir. Geçmiş bir yıla yeni manifest yazılamaz; " +
      "mevcutları olduğu gibi bırakabilir ya da silebilirsin.",
  },
  {
    q: "Zarf kodu nedir, ne işe yarar?",
    a:
      "Her zarfın 5 rakam + 2 harften oluşan benzersiz bir kodu vardır " +
      "(örn. 48213KT). Duvarın üstündeki arama kutusuna kodu yazınca duvar " +
      "seni doğrudan o zarfa götürür. Kodunu paylaşarak sevdiklerinin " +
      "zarfını kolayca bulmasını sağlayabilirsin.",
  },
  {
    q: "Gerçek ismimle mi yazmak zorundayım?",
    a:
      "Hayır. Zarfın üstünde görünen isim tamamen sana kalmış bir rumuzdur; " +
      "her manifestinde farklı bir rumuz bile kullanabilirsin. Gerçek " +
      "kimliğin duvarda görünmez.",
  },
  {
    q: "Manifestimi kimler görebilir?",
    a:
      "Duvar herkese açıktır; zarfını açan herkes rumuzunu ve manifest " +
      "metnini okuyabilir. E-posta adresin ve hesap bilgilerin ise hiçbir " +
      "zaman kimseyle paylaşılmaz.",
  },
  {
    q: "Şans dilemek nedir, nasıl yapılır?",
    a:
      "Bir zarfı açtığında \"şans dile\" butonuyla o manifeste destek " +
      "olursun; zarfın şans sayacı artar. Şans dilemek için üye girişi " +
      "gerekir. Her şans, o hayale omuz veren küçük bir iyiliktir.",
  },
  {
    q: "Şans sayısı ne işe yarıyor?",
    a:
      "Şanslar manifestinin duvardaki yolculuğunu belirler: 20 şansta zarfına " +
      "süs sticker'ı, 50 şansta parlak özel renk, 150 şansta cam şişede " +
      "sergilenme, 250 şansta ise kurdeleli hediye kutusu hakkı kazanırsın. " +
      "Her etapta zarfın duvarda daha çok fark edilir.",
  },
  {
    q: "20 şansa ulaştım, sticker'ımı nasıl seçerim?",
    a:
      "Üye paneline git; manifest kartında \"Sticker'ını Ekle\" butonu " +
      "belirir. Manifest türüne uygun süs emojilerinden birini seçersin ve " +
      "sticker duvardaki zarfının kapağına yapışır.",
  },
  {
    q: "50 şansta kazanılan özel renk nedir?",
    a:
      "Duvardaki pastel zarfların arasında kendini hemen belli eden parlak, " +
      "gradyanlı özel seri renklerdir. 50 şansa ulaşınca panelinden dilediğin " +
      "özel rengi seçersin; zarfın o renge bürünür ve çok daha görünür olur.",
  },
  {
    q: "Şişedeki Not (150 şans) nasıl çalışır?",
    a:
      "150 şansa ulaşan manifestini onayınla zarftan çıkarır, duvarda cam " +
      "bir şişenin içinde sergileriz. Şişeler duvara serpiştirilir ve " +
      "zarflardan çok daha dikkat çeker. Bu adım geri alınamaz.",
  },
  {
    q: "Hediye Kutusu (250 şans) nedir?",
    a:
      "Duvardaki en prestijli sergileme biçimidir. 250 şansa ulaşan " +
      "manifest, onayınla altın ışıltılı kurdeleli bir hediye kutusuna " +
      "taşınır; kutuyu açan ziyaretçiler manifestini içinden çıkan mektupta " +
      "okur.",
  },
  {
    q: "Ödül adımlarını atlayabilir miyim?",
    a:
      "Hayır, ödüller sırayla kullanılır: önce sticker, sonra özel renk, " +
      "ardından şişe ve en son hediye kutusu. Bir adımı tamamlamadan " +
      "sonrakine geçilmez; böylece her manifestin yolculuğu aynı adımlardan " +
      "geçer.",
  },
  {
    q: "Manifestim gerçekleşti, ne yapmalıyım?",
    a:
      "Panelindeki manifest kartından \"Gerçekleşti mi?\" ile işaretle. " +
      "Zarfın yeşil \"Gerçekleşti\" rozeti taşır, şans sayacın o anki " +
      "değerinde dondurulur ve ziyaretçiler artık seni tebrik edebilir. 👏",
  },
  {
    q: "Zarfların yerleri neden değişiyor?",
    a:
      "Duvar her gece saat 12'de karıştırılır; tüm zarflar yeni yerlerine " +
      "dağılır. Böylece hiçbir zarf sürekli üstte ya da altta kalmaz, her " +
      "manifest her gün eşit şansla görünür. Sıralama satılmaz.",
  },
  {
    q: "Duvarda istediğim dönemi görebilir miyim?",
    a:
      "Evet. Arama kutusunun yanındaki yıl ve ay filtreleriyle duvarı " +
      "istediğin döneme göre süzebilirsin; \"Tüm aylar\" seçiliyken o yılın " +
      "tamamı görünür.",
  },
  {
    q: "Görüntülenme sayısı nasıl sayılıyor?",
    a:
      "Bir zarfın görüntülenmesi, aynı cihazdan günde en fazla 1 kez " +
      "sayılır. Zarfı arka arkaya açıp kapatarak sayaç şişirilemez.",
  },
  {
    q: "Sponsorlu zarflar nedir?",
    a:
      "Duvarda arada bir karşına çıkan, üzerinde \"Sponsorlu\" etiketi " +
      "taşıyan marka zarflarıdır. İçlerinden markaların sürprizleri ve " +
      "hediye kodları çıkabilir. Normal zarflardan net biçimde ayrışırlar " +
      "ve şans dileme akışına dahil değildirler.",
  },
  {
    q: "Manifestimi sosyal medyada paylaşabilir miyim?",
    a:
      "Evet! Panelindeki manifest kartından \"Paylaş\" ile zarfının şık bir " +
      "görselini üretiriz; Instagram story, WhatsApp ve dilediğin yerde " +
      "paylaşabilir ya da indirebilirsin. Görselde zarf kodun da yer alır, " +
      "görenler seni duvarda bulup şans dileyebilir.",
  },
  {
    q: "Manifestimi sonradan düzenleyebilir miyim?",
    a:
      "Yazılan manifest duvarda asılı olduğu haliyle kalır; metin " +
      "düzenleme yoktur. İçinde bulunduğun yıla ait bir manifestini silip " +
      "yeniden yazabilirsin; silince o yılın hakkı geri açılır (topladığın " +
      "şanslar silinen manifestle birlikte gider).",
  },
  {
    q: "Uygunsuz bir manifest gördüm, ne yapabilirim?",
    a:
      "Zarfı açtığında sol alttaki bildir bağlantısıyla gerekçeni seçip " +
      "bize iletebilirsin. Bildirimler ekibimize düşer ve incelenir; " +
      "duvarın pozitif ruhunu birlikte koruruz.",
  },
  {
    q: "Manifestler denetleniyor mu?",
    a:
      "Evet. Duvara eklenen manifestler topluluk kurallarına göre düzenli " +
      "olarak denetlenir; hakaret, reklam, kişisel veri gibi içerikler " +
      "yayından kaldırılabilir. Kaldırılan her manifest için sahibine " +
      "nazik bir bilgilendirme e-postası gönderilir.",
  },
  {
    q: "Şifremi unuttum, ne yapmalıyım?",
    a:
      "Giriş ekranındaki \"Şifremi unuttum\" bağlantısına tıkla; e-postana " +
      "gelen 6 haneli kodla yeni şifreni belirlersin. Kod 10 dakika " +
      "geçerlidir.",
  },
  {
    q: "Hesabımı nasıl silerim?",
    a:
      "Üye panelinde \"Hesap Ayarları\" bölümünden hesabını kalıcı olarak " +
      "silebilirsin. Hesabınla birlikte tüm manifestlerin de duvardan " +
      "kaldırılır; bu işlem geri alınamaz.",
  },
  {
    q: "Size nasıl ulaşabilirim?",
    a:
      "\"Bize Yazın\" sayfasındaki formu doldurabilir ya da doğrudan " +
      "bilgi@manifestduvari.com adresine e-posta gönderebilirsin. " +
      "Instagram hesabımızdan da bize yazabilirsin; en kısa sürede dönüş " +
      "yaparız.",
  },
];

// ── SEO ayarları — snippet, head kod enjeksiyonu, site haritası ─────────
// Admin panelin Ayarlar sekmesindeki SEO bölümünden yönetilir

export type SeoSettings = {
  title: string; // Google snippet başlığı (<title>)
  description: string; // snippet açıklaması (meta description)
  headCode: string; // <head> içine enjekte edilen kod (Search Console vb.)
  sitemapExclude: string[]; // site haritasından hariç tutulan sayfalar
};

// Site haritasına girebilecek herkese açık sayfalar
export const SITE_PAGES = [
  { path: "/", label: "Ana Sayfa" },
  { path: "/merak-edilenler", label: "Merak Ettikleriniz" },
  { path: "/bize-ulasin", label: "Bize Ulaşın" },
  { path: "/uye", label: "Giriş / Üye Ol" },
] as const;

export const DEFAULT_SEO: SeoSettings = {
  title: "Manifest Duvarı",
  description:
    "Hayalini bir zarfa yaz, koca duvara as; binlerce kişi sana şans " +
    "dilesin. Manifest Duvarı: dileklerin paylaştıkça güçlendiği yer.",
  headCode: "",
  // Varsayılan: site haritasında yalnızca ana sayfa görünür
  sitemapExclude: ["/merak-edilenler", "/bize-ulasin", "/uye"],
};

export async function getSeo(p: Pool): Promise<SeoSettings> {
  return { ...DEFAULT_SEO, ...(await getSetting(p, "seo", {})) };
}

// Otomatik bildirim anahtarları — admin panelin Bildirimler sekmesinden
// yönetilir; kapatılan bildirim maili sunucu tarafında hiç gönderilmez
export type NotifySettings = {
  moderation: boolean; // manifest kaldırılınca sahibine bilgilendirme
  accountDeleted: boolean; // hesap silinince üyeye bilgilendirme
  verifyCode: boolean; // üyelik doğrulama kodu e-postası
  resetCode: boolean; // şifre sıfırlama kodu e-postası
  milestone20: boolean; // 20 şans: sticker hakkı maili
  milestone50: boolean; // 50 şans: özel renk hakkı maili
  milestone150: boolean; // 150 şans: şişe hakkı maili
  milestone250: boolean; // 250 şans: hediye kutusu hakkı maili
  cheer100: boolean; // her 100 tebrikte kutlama maili
  contactForward: boolean; // iletişim formu mesajı SMTP adresine iletilir
};

export const DEFAULT_NOTIFY: NotifySettings = {
  moderation: true,
  accountDeleted: true,
  verifyCode: true,
  resetCode: true,
  milestone20: true,
  milestone50: true,
  milestone150: true,
  milestone250: true,
  cheer100: true,
  contactForward: true,
};

export async function getNotify(p: Pool): Promise<NotifySettings> {
  return { ...DEFAULT_NOTIFY, ...(await getSetting(p, "notify", {})) };
}

export async function getFaq(p: Pool): Promise<FaqItem[]> {
  return getSetting(p, "faq", DEFAULT_FAQ);
}

export async function getInstagram(p: Pool): Promise<InstagramSetting> {
  return { ...DEFAULT_INSTAGRAM, ...(await getSetting(p, "instagram", {})) };
}
