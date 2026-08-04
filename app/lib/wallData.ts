// ── Duvar demo verisi — deterministik zarf üretimi ──────────────────────
// page.tsx'ten taşındı; duvar ve admin panel ortak kullanır. Canlıda bu
// modülün yerini backend verisi alacak; tipler değişmeden kalır.

import { SPECIAL_COLORS, STICKER_EMOJIS } from "../components/RewardVisuals";

export type EnvelopeColor = {
  base: string;
  dark: string;
  ink: string;
  bodyBg?: string; // gradient gövde (özel seri)
  flapBg?: string; // gradient kapak (özel seri)
  gloss?: boolean; // parlak yüzey efekti (özel seri)
};

export type Sticker = {
  emoji: string;
  left: number; // % — sabit slotlardan biri (sol/sağ)
  rotation: number; // deg
};

export type Envelope = {
  id: number;
  name: string;
  manifest: string;
  jx: number; // 0-1 — yatay serpme tohumu
  jy: number; // 0-1 — dikey serpme tohumu
  zr: number; // 0-3 — z-index tohumu
  rotation: number; // deg
  color: EnvelopeColor;
  sticker?: Sticker;
  luck: number; // kaç kişi şans diledi
  cheers: number; // kaç kişi tebrik etti
  views: number; // görüntülenme — cihaz başına günde 1 sayılır (demo: localStorage)
  code: string; // manifeste özel arama kodu — 5 rakam + 2 harf (örn. 48213KT)
  date: string; // zarfın eklendiği tarih
  year: number; // filtreleme için
  month: number; // 1-12, filtreleme için
  bottled?: boolean; // 150+ şans: manifest şişede sergileniyor
  boxed?: boolean; // 250+ şans: manifest hediye kutusunda sergileniyor
  ribbon?: number; // şişe kurdele rengi (üye zarfında seçilen özel renk)
  sponsored?: boolean; // marka zarfı (native reklam)
  realized?: boolean; // manifest gerçekleşti: şans dondurulur, rozet taşır
  realizedDate?: string; // gerçekleşti olarak işaretlendiği tarih
  ts: number; // eklenme zamanı (timestamp — türetilmiş alanlar için)
};

// 7 haneli manifest kodu: 5 rakam + 2 harf, ayraçsız (örn. 48213KT).
// Rakam kısmı i'den deterministik türetilir — seed zarflarında benzersizdir.
// Yeni üye kodları artık sunucuda üretilir (/api/manifests/new-code)
const CODE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function makeCode(i: number, rand: () => number): string {
  const digits = String(10000 + ((i * 48611) % 90000));
  const l1 = CODE_LETTERS[Math.floor(rand() * 26)];
  const l2 = CODE_LETTERS[Math.floor(rand() * 26)];
  return `${digits}${l1}${l2}`;
}

// Üye zarflarının id aralığı — duvarın kendi zarflarından ayrışması için
export const MEMBER_ID_BASE = 900000;

// ── Bildirimler — ziyaretçi bir manifesti şikâyet eder, admin panele düşer.
// Kayıtlar artık backend'de (reports tablosu); uçlar lib/api.ts'te

export type ReportReason = "Argo" | "Hakaret" | "Kötü niyet" | "Rahatsız edici";
export const REPORT_REASONS: ReportReason[] = [
  "Argo",
  "Hakaret",
  "Kötü niyet",
  "Rahatsız edici",
];

export type Report = {
  code: string; // manifest kodu — zarf/şişe/kutu ayrımı olmadan tekildir
  name: string;
  manifest: string;
  reason: ReportReason;
  ts: number;
  date: string; // okunur tarih (tr-TR)
};

// Sponsor zarf teması — Petimemama marka renkleri (canlı, parlak)
const SPONSOR_COLOR: EnvelopeColor = {
  base: "#ffffff",
  dark: "#5b2d9c",
  ink: "#5b2d9c",
  bodyBg: "linear-gradient(135deg, #ffffff, #f1e8ff 45%, #ffffff 65%, #ffe9d4)",
  flapBg: "linear-gradient(135deg, #7c4ad0, #4a2385 60%, #6535ab)",
  gloss: true,
};

const SPONSOR_TEXT =
  "Petimemama'dan manifest duvarına özel bir sürpriz! Bu zarfa denk gelen " +
  "şanslı ziyaretçilere minik dostlarının mamalarında geçerli özel bir " +
  "hediye kodu bırakıyoruz. Kod: PETI-SURPRIZ. Manifestlerine şans, " +
  "patili dostlarına afiyet olsun! 🐾";

// Pastel palet — tüm zarflar bu 12 renkten organik dağılır
// (orijinal tonların ~%28 beyaza çekilmiş, soluk hali)
const PALETTE: EnvelopeColor[] = [
  { base: "#FFC8CD", dark: "#F7ABB2", ink: "#8E3B47" }, // pastel pembe
  { base: "#FFE8CD", dark: "#F9D4B0", ink: "#8A5A2A" }, // pastel şeftali
  { base: "#FFFFCD", dark: "#F4F3AD", ink: "#7A7420" }, // pastel sarı
  { base: "#CDFFD8", dark: "#AEEFC0", ink: "#2E7C48" }, // pastel nane yeşili
  { base: "#CDEAFF", dark: "#AED6F6", ink: "#2F5E8C" }, // pastel bebek mavisi
  { base: "#EBCDFF", dark: "#DAB2F7", ink: "#6D3A96" }, // pastel lila
  { base: "#FFD7E6", dark: "#F7BDD4", ink: "#94436A" }, // pastel gül kurusu
  { base: "#BCDFFF", dark: "#9ECCF4", ink: "#2A5A8C" }, // pastel gökyüzü mavisi
  { base: "#DAC9E5", dark: "#C8B2D6", ink: "#5C3F70" }, // pastel leylak
  { base: "#C9F0E2", dark: "#ACE3CF", ink: "#2F6E58" }, // pastel su yeşili
  { base: "#FFE5D2", dark: "#F7CFB5", ink: "#8A5230" }, // pastel kayısı
  { base: "#D6DBF0", dark: "#BEC5E4", ink: "#47517E" }, // pastel lavanta mavisi
];

// Özel seri — parlak, gradientli, duvarda kendini belli eden 4 renk.
// Tanımlar (anlam etiketleriyle) RewardVisuals'ta; duvar renk sırası
// dönüşümlü atanırken üye zarfları panelden seçilen rengi kullanır
export const SPECIALS: EnvelopeColor[] = SPECIAL_COLORS.map((s) => s.color);

const WORDS = [
  "Lorem", "Ipsum", "Dolor", "Amet", "Consec", "Elit", "Tempor",
  "Magna", "Aliqua", "Veniam", "Nostrud", "Ullamco", "Nisi", "Aliquip",
  "Commodo", "Duis", "Aute", "Irure", "Velit", "Esse", "Cillum",
  "Fugiat", "Nulla", "Pariatur", "Culpa", "Officia", "Mollit", "Sed",
];

const SENTENCES = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  "Nisi ut aliquip ex ea commodo consequat, duis aute irure dolor.",
  "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
  "Deserunt mollit anim id est laborum, sed ut perspiciatis unde omnis.",
  "Iste natus error sit voluptatem accusantium doloremque laudantium.",
  "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
];

// Seed'li rastgelelik: sunucu ve istemci aynı sonucu üretsin (hydration uyumu)
export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const TOTAL = 1000; // toplam zarf

export function buildEnvelopes(): Envelope[] {
  const rand = mulberry32(20260726);
  const list: Envelope[] = [];

  for (let i = 0; i < TOTAL; i++) {
    // Sıralama konumu render'da sütun sayısına göre hesaplanır;
    // burada yalnızca "popülerlik sırası" için kaba satır kullanılır
    const row = Math.floor(i / 10);

    let name = WORDS[Math.floor(rand() * WORDS.length)];
    if (rand() > 0.55) {
      name += " " + WORDS[Math.floor(rand() * WORDS.length)];
    }

    const sentenceCount = 4 + Math.floor(rand() * 3);
    const sentences: string[] = [];
    for (let s = 0; s < sentenceCount; s++) {
      sentences.push(SENTENCES[Math.floor(rand() * SENTENCES.length)]);
    }
    // Manifest metni en fazla 300 karakter (ürün kuralı)
    let manifest = "";
    for (const s of sentences) {
      const next = manifest ? `${manifest} ${s}` : s;
      if (next.length > 300) break;
      manifest = next;
    }

    // Seed dizilimi bozulmasın diye eski palet seçiminin rand() çağrısı korunuyor
    rand();

    // Şans dağılımı — baraj bantlarına göre tasarlandı (oylar e-posta
    // onaylı üyelerden geldiği için barajlar düşük tutuldu). Piramit:
    // %68 → 0-19 (sade) • %22 → 20-49 (sticker hakkı)
    // %9 → 50-149 (parlak renk hakkı) • %0.8 → 150-249 (şişe)
    // %0.2 → 250+ (hediye kutusu)
    const lr = rand();
    const luck = Math.floor(
      lr < 0.68
        ? (lr / 0.68) * 19
        : lr < 0.9
          ? 20 + ((lr - 0.68) / 0.22) * 29
          : lr < 0.99
            ? 50 + ((lr - 0.9) / 0.09) * 99
            : lr < 0.998
              ? 150 + ((lr - 0.99) / 0.008) * 99
              : 250 + ((lr - 0.998) / 0.002) * 450,
    );

    // Tarih için "yaş" değeri (eski zarflar üst id'lerde)
    const t = (99 - row) / 99;

    // Görüntülenme, şans sayısının birkaç katı + rastgele pay
    const views = Math.floor(luck * (2.5 + rand() * 2) + rand() * 150);

    // Eklenme tarihi: üstteki (popüler) zarflar eski, alttakiler yeni
    // (sabit referans tarihinden geriye gidilir — deterministik)
    const daysAgo = Math.floor(4 + t * 160 + rand() * 25);
    const added = new Date(2026, 6, 26);
    added.setDate(added.getDate() - daysAgo);
    const date = added.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    list.push({
      luck,
      cheers: 0, // gerçekleşme durumuna göre aşağıda doldurulur
      views,
      ts: added.getTime(),
      date,
      year: added.getFullYear(),
      month: added.getMonth() + 1,
      code: makeCode(i, rand),
      id: i,
      name,
      manifest,
      jx: rand(),
      jy: rand(),
      rotation: -28 + rand() * 56,
      zr: Math.floor(rand() * 4),
      color: PALETTE[Math.floor(rand() * PALETTE.length)],
    });
  }

  // Baraj kuralları — barajı geçen herkes hakkını kullanmış kabul edilir
  // (e-posta bildirimi gider: "20/50/150 barajını geçtin!")
  const SLOTS = [24, 76];
  let sk = 0;
  for (const env of list) {
    // 20+ şans → sticker
    if (env.luck >= 20) {
      env.sticker = {
        emoji: STICKER_EMOJIS[Math.floor(rand() * STICKER_EMOJIS.length)],
        left: SLOTS[Math.floor(rand() * SLOTS.length)],
        rotation: -25 + rand() * 50,
      };
    }
    // 50+ şans → parlak renk (sırayla döner)
    if (env.luck >= 50) {
      env.color = SPECIALS[sk % SPECIALS.length];
      sk++;
    }
    // 150+ şans → manifest şişelenir
    if (env.luck >= 150) {
      env.bottled = true;
    }
    // 250+ şans → manifest hediye kutusuna taşınır (şişeden çıkar)
    if (env.luck >= 250) {
      env.boxed = true;
    }
  }

  // 10 sponsor zarfı (marka: Petimemama) — duvara serpiştirilir
  const sponsorSet = new Set<number>();
  while (sponsorSet.size < 10) {
    const idx = Math.floor(rand() * list.length);
    if (list[idx].bottled) continue;
    sponsorSet.add(idx);
  }
  for (const idx of sponsorSet) {
    const env = list[idx];
    env.sponsored = true;
    env.name = "Sürpriz";
    env.color = SPONSOR_COLOR;
    env.sticker = undefined;
    env.manifest = SPONSOR_TEXT;
  }

  // Birkaç manifest gerçekleşmiş: yeşil rozet taşır, şans dilenemez
  const realizedSet = new Set<number>();
  while (realizedSet.size < 8) {
    const idx = Math.floor(rand() * list.length);
    if (list[idx].bottled || list[idx].sponsored) continue;
    realizedSet.add(idx);
  }
  for (const idx of realizedSet) {
    list[idx].realized = true;
  }

  // 2 şişelenmiş manifest de gerçekleşmiş olsun (kutudakiler hariç)
  let bottledRealized = 0;
  for (const env of list) {
    if (env.bottled && !env.boxed && bottledRealized < 2) {
      env.realized = true;
      bottledRealized++;
    }
  }

  // 1 kutudaki manifest de gerçekleşmiş olsun
  for (const env of list) {
    if (env.boxed) {
      env.realized = true;
      break;
    }
  }

  // Tebrik sayısı yalnızca gerçekleşen manifestlerde olur; gerçekleşme
  // tarihi de eklenme ile bugün arasında rastgele bir güne düşer
  const REF_TS = new Date(2026, 6, 26).getTime();
  for (const env of list) {
    env.cheers = env.realized
      ? Math.floor(env.luck * 0.6 + rand() * 60)
      : 0;
    if (env.realized) {
      const span = Math.max(0, REF_TS - env.ts);
      const at = new Date(env.ts + 5 * 86400000 + rand() * span * 0.9);
      env.realizedDate = at.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  }

  return list;
}
