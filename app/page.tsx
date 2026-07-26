"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type EnvelopeColor = {
  base: string;
  dark: string;
  ink: string;
  bodyBg?: string; // gradient gövde (özel seri)
  flapBg?: string; // gradient kapak (özel seri)
  gloss?: boolean; // parlak yüzey efekti (özel seri)
};

type Sticker = {
  emoji: string;
  left: number; // % — sabit slotlardan biri (sol/sağ)
  rotation: number; // deg
};

type Envelope = {
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
  views: number; // görüntülenme sayısı (şimdilik rastgele; ileride IP bazlı)
  code: string; // manifeste özel arama kodu (örn. MF-042)
  date: string; // zarfın eklendiği tarih
  year: number; // filtreleme için
  month: number; // 1-12, filtreleme için
  bottled?: boolean; // 1000+ şans: manifest şişede sergileniyor
  sponsored?: boolean; // marka zarfı (native reklam)
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

// Özel seri — parlak, gradientli, duvarda kendini belli eden 4 renk
const SPECIALS: EnvelopeColor[] = [
  {
    base: "#1c1c1c",
    dark: "#000000",
    ink: "#E5C15C", // siyah üstüne altın yazı
    bodyBg: "linear-gradient(135deg, #3d3d3d, #101010 55%, #2c2c2c)",
    flapBg: "linear-gradient(180deg, #262626, #000000)",
    gloss: true,
  },
  {
    base: "#7b1526",
    dark: "#4a0d16",
    ink: "#E5C15C", // bordo, altın yazı
    bodyBg: "linear-gradient(135deg, #9e2439, #5c0f1d 55%, #7b1526)",
    flapBg: "linear-gradient(180deg, #6f1322, #3f0a12)",
    gloss: true,
  },
  {
    base: "#1c3260",
    dark: "#0b1733",
    ink: "#E5C15C", // lacivert, altın yazı
    bodyBg: "linear-gradient(135deg, #2a4a8b, #101f45 55%, #1d3567)",
    flapBg: "linear-gradient(180deg, #1c3260, #0b1733)",
    gloss: true,
  },
  {
    base: "#552881",
    dark: "#2a0f47",
    ink: "#E5C15C", // koyu mor, altın yazı
    bodyBg: "linear-gradient(135deg, #6d3aa0, #3a1560 55%, #552881)",
    flapBg: "linear-gradient(180deg, #4d2178, #2a0f47)",
    gloss: true,
  },
];

// Şişe kurdele gradyanları — özel seri renklerinin keskin geçişli halleri
const RIBBON_GRADS = [
  ["#3d3d3d", "#101010", "#2c2c2c"], // siyah
  ["#9e2439", "#5c0f1d", "#7b1526"], // bordo
  ["#2a4a8b", "#101f45", "#1d3567"], // lacivert
  ["#6d3aa0", "#3a1560", "#552881"], // koyu mor
];

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
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TOTAL = 1000; // toplam zarf

// Reklam alanları (topbar + 2 banner) — admin panel yapılınca oradan
// açılıp kapatılacak; şimdilik kapalı kabul ediyoruz
const ADS_ENABLED = false;

const MONTHS_TR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

// Orantılı yerleşim: zarf boyutu ekran genişliği / sütun sayısından türetilir.
// Monitörde 10'lu, tablette 6'lı, telefonda 3'lü — hepsi ekrana tam oturur.
function makeLayoutMetrics(vw: number, cols: number) {
  const colStep = Math.floor((vw - 8) / cols);
  const envW = Math.round(colStep * 0.945); // komşu sütunlar hafif örtüşür
  const envH = Math.round(envW * 0.75); // 4:3
  const rowStep = Math.round(envH * 0.91); // satırlar hafif biner
  return {
    colStep,
    envW,
    envH,
    rowStep,
    jx: colStep * 0.24, // yatay serpme payı
    jy: rowStep * 0.15, // dikey serpme payı
    bottleW: Math.round(colStep * 0.88),
    bottleH: Math.round(colStep * 0.88 * 2.6), // 200:520
  };
}

function buildEnvelopes(): Envelope[] {
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

    // Seed dizilimi bozulmasın diye eski palet seçiminin rand() çağrısı korunuyor
    rand();

    // Şans dağılımı — baraj bantlarına göre tasarlandı:
    // %70 → 0-49 (sade) • %22 → 50-249 (sticker hakkı)
    // %7 → 250-999 (parlak renk hakkı) • %1 → 1000+ (şişe hakkı)
    const lr = rand();
    const luck = Math.floor(
      lr < 0.7
        ? (lr / 0.7) * 49
        : lr < 0.92
          ? 50 + ((lr - 0.7) / 0.22) * 199
          : lr < 0.99
            ? 250 + ((lr - 0.92) / 0.07) * 749
            : 1000 + ((lr - 0.99) / 0.01) * 900,
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
      views,
      date,
      year: added.getFullYear(),
      month: added.getMonth() + 1,
      code: `MF-${String(i + 1).padStart(3, "0")}`,
      id: i,
      name,
      manifest: sentences.join(" "),
      jx: rand(),
      jy: rand(),
      rotation: -28 + rand() * 56,
      zr: Math.floor(rand() * 4),
      color: PALETTE[Math.floor(rand() * PALETTE.length)],
    });
  }

  // ~90 zarfa sticker paletinden süs kondur (manifest türlerinin karşılığı).
  // Süs, kapak ucu hizasında sol/sağ slotlardan birine oturur.
  const STICKER_EMOJIS = [
    "🏡", // ev sahibi olmak
    "🚗", // araba almak
    "✈️", // seyahat, yurt dışı
    "💎", // para, zenginlik
    "💼", // kariyer, iş
    "🎓", // sınav, mezuniyet
    "❤️", // aşk, ilişki
    "👶", // çocuk sahibi olmak
    "💍", // evlilik, nişan
    "🌿", // sağlık, yeni başlangıç
    "⭐", // başarı, şöhret
    "🦋", // dönüşüm, özgürlük
    "🍀", // şans
    "🐞", // uğur, kısmet
  ];
  // Baraj kuralları — barajı geçen herkes hakkını kullanmış kabul edilir
  // (e-posta bildirimi gider: "50/250/1000 barajını geçtin!")
  const SLOTS = [24, 76];
  let sk = 0;
  for (const env of list) {
    // 50+ şans → sticker
    if (env.luck >= 50) {
      env.sticker = {
        emoji: STICKER_EMOJIS[Math.floor(rand() * STICKER_EMOJIS.length)],
        left: SLOTS[Math.floor(rand() * SLOTS.length)],
        rotation: -25 + rand() * 50,
      };
    }
    // 250+ şans → parlak renk (sırayla döner)
    if (env.luck >= 250) {
      env.color = SPECIALS[sk % SPECIALS.length];
      sk++;
    }
    // 1000+ şans → manifest şişelenir
    if (env.luck >= 1000) {
      env.bottled = true;
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

  return list;
}

type Origin = { cx: number; cy: number; w: number; h: number };

// ── Şişedeki Not — 1000+ şans dilenmiş manifestler şişede sergilenir ─────
type BottleData = {
  code: string;
  name: string;
  date: string;
  manifest: string;
  views: number;
  luck: number;
  rot: number; // deg
  sticker: string;
  ribbon: number; // RIBBON_GRADS indeksi
};

function toBottleData(env: Envelope, rot: number): BottleData {
  return {
    code: env.code,
    name: env.name,
    date: env.date,
    manifest: env.manifest,
    views: env.views,
    luck: env.luck,
    rot,
    sticker: env.sticker?.emoji ?? "🦋",
    ribbon: env.id % RIBBON_GRADS.length,
  };
}
// El yapımı cam şişe: mantar, ip, içinde rulo not, dipte kum, cam
// parlamaları ve gövdesinde kağıt etiket (içeriği dışarıdan gelir)
function BottleVisual({
  noteOut = false,
  label,
  sticker = "🦋",
  ribbon = 0,
  sheenDelay = 0,
}: {
  noteOut?: boolean;
  label?: React.ReactNode;
  sticker?: string;
  ribbon?: number;
  sheenDelay?: number;
}) {
  const rg = RIBBON_GRADS[ribbon % RIBBON_GRADS.length];
  const ribbonFill = `url(#ribbonGrad${ribbon % RIBBON_GRADS.length})`;
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 200 520" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#bfe4ee" />
            <stop offset="0.45" stopColor="#8ec7d8" />
            <stop offset="0.7" stopColor="#a9d8e5" />
            <stop offset="1" stopColor="#7db8cb" />
          </linearGradient>
          <linearGradient id="cork" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c99a66" />
            <stop offset="1" stopColor="#8a5a2f" />
          </linearGradient>
          <linearGradient id="sheenGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <clipPath id="bottleClip">
            <path d="M82 60 L82 140 C82 162 58 172 50 192 C42 210 40 222 40 242 L40 458 C40 492 62 502 100 502 C138 502 160 492 160 458 L160 242 C160 222 158 210 150 192 C142 172 118 162 118 140 L118 60 Z" />
          </clipPath>
          <linearGradient
            id={`ribbonGrad${ribbon % RIBBON_GRADS.length}`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0" stopColor={rg[0]} />
            <stop offset="0.55" stopColor={rg[1]} />
            <stop offset="1" stopColor={rg[2]} />
          </linearGradient>
        </defs>

        {/* Cam gövde */}
        <path
          d="M82 60 L82 140 C82 162 58 172 50 192 C42 210 40 222 40 242 L40 458 C40 492 62 502 100 502 C138 502 160 492 160 458 L160 242 C160 222 158 210 150 192 C142 172 118 162 118 140 L118 60 Z"
          fill="url(#glass)"
          fillOpacity="0.5"
          stroke="#5d98ab"
          strokeOpacity="0.55"
          strokeWidth="3"
        />
        {/* Rulo yapılmış A4 not — şişenin içinde, parşömen çıkınca kaybolur */}
        <g
          transform="rotate(-11 100 335)"
          style={{ opacity: noteOut ? 0 : 1, transition: "opacity 300ms" }}
        >
          <defs>
            <linearGradient id="paperRoll" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#e3cf9f" />
              <stop offset="0.38" stopColor="#f9efd0" />
              <stop offset="0.62" stopColor="#f3e6be" />
              <stop offset="1" stopColor="#dcc794" />
            </linearGradient>
          </defs>
          {/* Silindir gövde */}
          <rect
            x="77"
            y="196"
            width="46"
            height="274"
            rx="21"
            fill="url(#paperRoll)"
            stroke="#cdb583"
            strokeWidth="1.5"
          />
          {/* Dışta kalan kağıt kenarının kıvrım çizgisi */}
          <path
            d="M121 206 C126 270 119 380 117 460"
            stroke="#cdb583"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Üst uç: rulonun sarmal görünen ağzı */}
          <ellipse cx="100" cy="198" rx="23" ry="8" fill="#f2e4ba" stroke="#cdb583" strokeWidth="1.5" />
          <ellipse cx="100" cy="198" rx="12" ry="4.5" fill="#e4d09e" stroke="#c4ab77" strokeWidth="1.2" />
          <ellipse cx="100" cy="198" rx="4" ry="1.8" fill="#d4bd85" />
          {/* Alt uç gölgesi */}
          <ellipse cx="100" cy="468" rx="21" ry="6.5" fill="#d8c290" />
        </g>
        {/* Cam parlamaları */}
        <rect x="52" y="215" width="13" height="240" rx="6.5" fill="#ffffff" opacity="0.45" />
        <rect x="86" y="70" width="8" height="70" rx="4" fill="#ffffff" opacity="0.5" />
        {/* Periyodik ışık süpürmesi — cam silüetiyle sınırlı */}
        <g clipPath="url(#bottleClip)">
          <rect
            className="bottle-sheen"
            x="0"
            y="0"
            width="64"
            height="520"
            fill="url(#sheenGrad)"
            style={{ animationDelay: `${sheenDelay}s` }}
          />
        </g>
        {/* Şişe ağzı */}
        <ellipse
          cx="100"
          cy="60"
          rx="20"
          ry="6"
          fill="#cfeaf2"
          stroke="#5d98ab"
          strokeOpacity="0.5"
          strokeWidth="2"
        />
        {/* Mantar — not çıkarken fırlar */}
        <g
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            transform: noteOut
              ? "translate(34px, -74px) rotate(38deg)"
              : "none",
            opacity: noteOut ? 0 : 1,
            transition: "transform 500ms ease, opacity 500ms ease",
          }}
        >
          <rect x="80" y="16" width="40" height="48" rx="9" fill="url(#cork)" />
          <ellipse cx="100" cy="18" rx="19" ry="5" fill="#a97b47" />
        </g>
        {/* Kurdele — boğazda büyük klasik fiyonk: keskin gradientli
            (özel renkli zarflarla aynı dil), kontursuz */}
        <g strokeLinejoin="round">
          {/* Boğaza sarılı bant */}
          <rect x="76" y="118" width="48" height="16" rx="5" fill={ribbonFill} />
          {/* Kuyruklar (kırlangıç kesimli) */}
          <path d="M93 130 L70 172 L79 164 L86 174 L104 136 Z" fill={ribbonFill} />
          <path d="M107 130 L130 172 L121 164 L114 174 L96 136 Z" fill={ribbonFill} />
          {/* Fiyonk kanatları */}
          <path
            d="M100 126 C80 98 46 104 54 128 C60 150 88 144 100 126 Z"
            fill={ribbonFill}
          />
          <path
            d="M100 126 C120 98 154 104 146 128 C140 150 112 144 100 126 Z"
            fill={ribbonFill}
          />
          {/* Kanat içi parlak vurgular — gradientin cilalı hissi */}
          <path
            d="M97 124 C84 110 66 112 62 124"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M103 124 C116 110 134 112 138 124"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* Beyaz düğüm */}
          <rect
            x="91"
            y="117"
            width="18"
            height="17"
            rx="5"
            fill="#ffffff"
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="1"
          />
        </g>
        {/* Sticker — camın üstüne yapıştırılmış */}
        <text
          x="60"
          y="240"
          fontSize="44"
          textAnchor="middle"
          dominantBaseline="central"
          transform="rotate(-14 60 240)"
        >
          {sticker}
        </text>
      </svg>

      {/* Kağıt etiket — şişeyi saran bant: kenarlarda silindirik gölge */}
      {label && (
        <div
          className="absolute left-[19.5%] top-[52%] w-[61%] rounded-[3px] border-y border-[#dcc7a0] px-1.5 py-1.5 shadow-[0_3px_8px_rgba(0,0,0,0.15)]"
          style={{
            background:
              "linear-gradient(90deg, rgba(90,70,30,0.22), rgba(90,70,30,0.04) 14%, rgba(90,70,30,0) 30%, rgba(90,70,30,0) 70%, rgba(90,70,30,0.05) 86%, rgba(90,70,30,0.24)), linear-gradient(165deg,#faf1dd,#efdfbc)",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

function BottlePopup({
  bottle,
  origin,
  onClose,
}: {
  bottle: BottleData;
  origin: Origin;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<"origin" | "center" | "open">("origin");
  // Notun yolculuğu: şişenin içinde → boğazda (rulo) → ağzın üstünde açık
  const [notePhase, setNotePhase] = useState<"in" | "neck" | "open">("in");
  const closingRef = useRef(false);
  const [luck, setLuck] = useState(bottle.luck);
  const [wished, setWished] = useState(false);

  const geo = useMemo(() => {
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const popW = Math.min(window.innerWidth * 0.44, 235);
    return {
      s: origin.w / popW,
      dx: origin.cx - vw / 2,
      dy: origin.cy - vh / 2,
    };
  }, [origin]);

  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setStage("center")),
    );
    // Varış → şişe yana yatar + mantar fırlar → not ağızdan kıvrılarak
    // çıkar → ekran ortasında açılır
    const t1 = setTimeout(() => setStage("open"), 430);
    const t2 = setTimeout(() => setNotePhase("neck"), 880);
    const t3 = setTimeout(() => setNotePhase("open"), 1280);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setNotePhase("neck"); // not kıvrılıp ağza döner
    setTimeout(() => setNotePhase("in"), 420); // içeri girer
    setTimeout(() => setStage("center"), 900); // şişe doğrulur, mantar kapanır
    setTimeout(() => setStage("origin"), 1150); // şişe yerine uçar
    setTimeout(onClose, 1650);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const atCenter = stage !== "origin";

  return (
    <div className="fixed inset-0 z-[2000]" onClick={close}>
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300"
        style={{ opacity: atCenter ? 1 : 0 }}
      />
      <div
        className="fixed left-1/2 top-1/2 w-[min(44vw,235px)]"
        style={{
          transform: atCenter
            ? "translate(-50%, -46%)"
            : `translate(-50%, -46%) translate(${geo.dx}px, ${geo.dy}px) rotate(${bottle.rot}deg) scale(${geo.s})`,
          transition: "transform 380ms cubic-bezier(0.3, 0.85, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Şişe — açılınca bardağa döker gibi sol üste yatar */}
        <div
          style={{
            transform:
              stage === "open"
                ? "translate(-170px, -240px) rotate(105deg)"
                : "none",
            transition: "transform 620ms cubic-bezier(0.3, 0.8, 0.3, 1)",
          }}
        >
          <div className="aspect-[200/520] w-full">
            <BottleVisual
              noteOut={notePhase !== "in"}
              sticker={bottle.sticker}
              ribbon={bottle.ribbon}
              label={
                stage === "open" ? undefined : (
                  <div className="flex flex-col items-center gap-[3px]">
                    <p className="text-[11px] leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
                      ⭐
                    </p>
                    <p className="text-[12px] leading-none font-semibold text-[#8a6d33]">
                      {luck.toLocaleString("tr-TR")}
                    </p>
                    <p className="truncate font-hand text-[17px] leading-none font-semibold text-[#6b5426]">
                      {bottle.name}
                    </p>
                  </div>
                )
              }
            />
          </div>
        </div>

        {/* Parşömen not — yatık şişenin ağzından kıvrılarak çıkar,
            ekranın ortasında açılır */}
        <div
          className="absolute left-1/2 top-[46%] z-30 w-[min(88vw,430px)]"
          style={{
            transformOrigin: "center center",
            transform:
              notePhase === "open"
                ? "translate(-50%, calc(-50% + 85px)) rotate(0deg) scale(1)"
                : notePhase === "neck"
                  ? "translate(calc(-50% + 95px), calc(-50% - 165px)) rotate(75deg) scale(0.17)"
                  : "translate(calc(-50% + 57px), calc(-50% - 179px)) rotate(105deg) scale(0.13)",
            opacity: notePhase === "in" ? 0 : 1,
            transition:
              "transform 460ms cubic-bezier(0.3, 0.8, 0.3, 1), opacity 250ms ease",
          }}
        >
          <div className="max-h-[58vh] overflow-y-auto rounded-[10px] border border-[#e2cd9f] bg-[linear-gradient(160deg,#fdf3dd,#f1e0bd)] px-8 py-7 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#a3813f]">
                🍾 Şişedeki Not
              </p>
              <p className="font-mono text-[11px] tracking-wider text-[#a3813f]">
                {bottle.code}
              </p>
            </div>
            <p className="mt-2 font-hand text-3xl text-[#5c4718]">
              {bottle.name}
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-[#5f4d26]">
              {bottle.manifest}
            </p>
            <p className="mt-6 text-[11px] text-[#a3813f]">
              {bottle.date} tarihinde denize bırakıldı
            </p>
            {/* İstatistikler + şans dile */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#dcc7a0] pt-3 text-[12px] font-medium text-[#8a6d33]">
              <span>✉ {bottle.views.toLocaleString("tr-TR")} kişi notu okudu</span>
              <span>⭐ {luck.toLocaleString("tr-TR")} kişi şans diledi</span>
              <button
                type="button"
                onClick={() => {
                  if (wished) return;
                  setWished(true);
                  setLuck((n) => n + 1);
                }}
                className={`cursor-pointer rounded-full border px-3 py-1 text-[12px] font-semibold transition-all ${
                  wished
                    ? "border-amber-400 bg-amber-100 text-amber-700"
                    : "border-[#c9b384] bg-white/70 text-[#6b5426] hover:border-amber-400 hover:text-amber-700"
                }`}
              >
                {wished ? "⭐ Şans dilendi" : "☆ Şans dile"}
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={close}
          className="absolute -right-14 top-[10%] z-40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-xl text-neutral-600 shadow-lg transition-all hover:scale-110"
          style={{ opacity: stage === "open" ? 1 : 0 }}
          aria-label="Kapat"
        >
          ×
        </button>
      </div>
    </div>
  );
}

type Pos = { x: number; y: number; z: number };

function EnvelopeCard({
  envelope,
  pos,
  envW,
  onOpen,
  hidden,
  offset,
  highlighted,
}: {
  envelope: Envelope;
  pos: Pos;
  envW: number;
  onOpen: (e: Envelope, origin: Origin) => void;
  hidden: boolean;
  offset?: { x: number; y: number };
  highlighted: boolean;
}) {
  // Sponsor zarfı diğerlerinden belirgin şekilde büyük gösterilir
  const w = envelope.sponsored ? envW * 1.35 : envW;
  // Zarf içi yazı/süs boyutları zarf genişliğiyle orantılı
  const fs = w / 172;
  return (
    <div
      id={`env-${envelope.id}`}
      className="env-wrap absolute"
      style={{
        width: w,
        left: pos.x - (w - envW) / 2,
        top: pos.y - ((w - envW) * 0.75) / 2,
        zIndex: highlighted ? 1460 : pos.z,
        visibility: hidden ? "hidden" : undefined,
        // İnen zarfa yer açma / geri dönme — organik esneme
        transform: offset ? `translate(${offset.x}px, ${offset.y}px)` : "none",
        transition: "transform 300ms cubic-bezier(0.3, 0.8, 0.35, 1)",
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          const el = e.currentTarget;
          // Merkez döndürülmüş kutudan (rotasyondan etkilenmez), boyutlar ise
          // layout'tan alınır — döndürülmüş kutunun boyutu gerçeğinden büyüktür
          const r = el.getBoundingClientRect();
          onOpen(envelope, {
            cx: r.left + r.width / 2,
            cy: r.top + r.height / 2,
            w: el.offsetWidth,
            h: el.offsetHeight,
          });
        }}
        style={{
          rotate: `${envelope.rotation}deg`,
          ...(envelope.color.bodyBg
            ? { background: envelope.color.bodyBg }
            : { backgroundColor: envelope.color.base }),
        }}
        className={`relative block w-full aspect-[4/3] cursor-pointer touch-manipulation rounded-[3px] transition-all duration-200 hover:scale-135 hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)] ${
          envelope.color.gloss
            ? "shadow-[0_4px_14px_rgba(0,0,0,0.35)]"
            : "shadow-[0_2px_6px_rgba(0,0,0,0.16)]"
        } ${highlighted ? "env-glow" : ""}`}
        aria-label={`${envelope.name} — manifesti oku`}
      >
        {/* Kapak üçgeni */}
        <span
          className="absolute inset-x-0 top-0 h-[56%]"
          style={{
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            ...(envelope.color.flapBg
              ? { background: envelope.color.flapBg }
              : { backgroundColor: envelope.color.dark }),
          }}
        />
        {/* Parlak yüzey — özel seri */}
        {envelope.color.gloss && (
          <span
            className="pointer-events-none absolute inset-0 rounded-[3px]"
            style={{
              background:
                "linear-gradient(115deg, rgba(255,255,255,0.25) 8%, rgba(255,255,255,0.06) 30%, transparent 46%)",
            }}
          />
        )}
        {/* Rumuz */}
        <span
          className="absolute inset-x-0 bottom-[4%] truncate px-1 text-center font-hand leading-none font-semibold"
          style={{ color: envelope.color.ink, fontSize: 18 * fs }}
        >
          {envelope.name}
        </span>
        {/* Sponsor zarfı: logo + SPONSORLU etiketi */}
        {envelope.sponsored && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/petimemama.png"
              alt="Petimemama"
              draggable={false}
              className="pointer-events-none absolute left-1/2 top-[71%] w-[62%] -translate-x-1/2 -translate-y-1/2 select-none object-contain"
            />
            <span
              className="absolute left-1/2 -translate-x-1/2 rounded-full bg-[#f97316] font-bold uppercase text-white shadow-md"
              style={{
                top: "44%",
                rotate: "-4deg",
                fontSize: 8.5 * fs,
                letterSpacing: "0.12em",
                padding: `${2.5 * fs}px ${8 * fs}px`,
              }}
            >
              Sponsorlu
            </span>
          </>
        )}
        {/* Şans dileme rozeti — ismin hemen üstünde: yıldız, altında sayı.
            Kasıtlı olarak silik: duvarın yıldız tarlasına dönmemesi için.
            Sponsor zarfında gösterilmez */}
        {!envelope.sponsored && (
          <span className="pointer-events-none absolute inset-x-0 bottom-[23%] flex flex-col items-center gap-[1px] leading-none">
            <span
              className="opacity-70 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
              style={{ fontSize: 9 * fs }}
            >
              ⭐
            </span>
            <span
              className="font-medium opacity-75"
              style={{ color: envelope.color.ink, fontSize: 10 * fs }}
            >
              {envelope.luck}
            </span>
          </span>
        )}
        {/* Süs — kapak ucu hizasında sol/orta/sağ slotlardan birinde */}
        {envelope.sticker && (
          <span
            className="pointer-events-none absolute top-[56%] -translate-x-1/2 -translate-y-full leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
            style={{
              left: `${envelope.sticker.left}%`,
              rotate: `${envelope.sticker.rotation}deg`,
              fontSize: 28 * fs,
            }}
          >
            {envelope.sticker.emoji}
          </span>
        )}
      </button>
    </div>
  );
}

function ManifestPopup({
  envelope,
  origin,
  onClose,
  onClosingStart,
}: {
  envelope: Envelope;
  origin: Origin;
  onClose: () => void;
  onClosingStart: () => void;
}) {
  // origin: zarf duvardaki yerinde • center: ekran ortasında • open: kapak açık
  const [stage, setStage] = useState<"origin" | "center" | "open">("origin");
  // Şans dileme (demo: yerel state, backend gelince gerçek sayaca bağlanır)
  const [luck, setLuck] = useState(envelope.luck ?? 0);
  const [wished, setWished] = useState(false);
  // Kapak, mektup dışarıdayken arkada (1), mektup içerideyken önde (30) durur
  const [flapZ, setFlapZ] = useState(30);
  const closingRef = useRef(false);

  // Duvardaki konumdan ekran ortasına taşınma geometrisi.
  // X ve Y ayrı ölçeklenir ki zarf, duvardaki kopyasıyla birebir çakışsın;
  // 110px'lik gövde ofseti de zarfın açısına göre döndürülerek hesaplanır.
  const geo = useMemo(() => {
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const popW = Math.min(window.innerWidth * 0.92, 540);
    const sx = origin.w / popW;
    const sy = origin.h / 340;
    const rad = (envelope.rotation * Math.PI) / 180;
    // Duvardaki süs, zarf genişliğinin ~%16'sı. Popup süsü bunun 1/sx katı
    // olur ki zarf küçülünce süs duvardakiyle aynı boyuta insin.
    return {
      sx,
      sy,
      stickerPx: (origin.w * (28 / 172)) / sx,
      dx: origin.cx - vw / 2 + 110 * sy * Math.sin(rad),
      dy: origin.cy - vh / 2 - 110 * sy * Math.cos(rad),
    };
  }, [origin, envelope.rotation]);

  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setStage("center")),
    );
    // Ortaya varış ~380ms → kapak açılır → mektup 200ms gecikmeyle çıkar
    const t1 = setTimeout(() => setStage("open"), 430);
    const t2 = setTimeout(() => setFlapZ(1), 640);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setStage("center"); // mektup içeri girer, ardından kapak kapanır
    setTimeout(onClosingStart, 260); // komşu zarflar yer açmaya başlasın
    setTimeout(() => setFlapZ(30), 430);
    setTimeout(() => setStage("origin"), 480); // sonra zarf yerine uçar
    setTimeout(onClose, 900);
  }, [onClose, onClosingStart]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const atCenter = stage !== "origin";

  return (
    <div className="fixed inset-0 z-[2000]" onClick={close}>
      {/* Karartma zarftan ayrı: zarf uçuş boyunca hep tam görünür kalır */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200"
        style={{ opacity: atCenter ? 1 : 0 }}
      />
      <div
        className="fixed left-1/2 top-1/2 w-[min(92vw,540px)]"
        style={{
          transform: atCenter
            ? "translate(-50%, -50%)"
            : `translate(-50%, -50%) translate(${geo.dx}px, ${geo.dy}px) rotate(${envelope.rotation}deg) scale(${geo.sx}, ${geo.sy})`,
          transition: "transform 380ms cubic-bezier(0.3, 0.85, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[560px]" style={{ perspective: "1100px" }}>
          {/* Zarf arka yüzeyi */}
          <div
            className="absolute inset-x-0 bottom-0 h-[340px] rounded-[6px]"
            style={
              envelope.color.flapBg
                ? { background: envelope.color.flapBg }
                : { backgroundColor: envelope.color.dark }
            }
          />

          {/* Katlanma izi — kapağın menteşe çizgisi. Kapak kapalıyken (z:30)
              kapağın altında kalır, açılınca ortaya çıkar */}
          <div
            className="absolute inset-x-0 top-[220px] z-[5] h-px"
            style={{ backgroundColor: "rgba(0,0,0,0.09)" }}
          />
          <div
            className="absolute inset-x-0 top-[214px] z-[5] h-[6px]"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.05), transparent)",
            }}
          />

          {/* Mektup — kapalıyken zarfın içine sığar, kapak açılınca büyüyerek çıkar */}
          <div
            className="absolute bottom-[36px] left-1/2 z-10 w-[86%]"
            style={{
              transformOrigin: "bottom center",
              transform:
                stage === "open"
                  ? "translateX(-50%) translateY(-58%) scale(1)"
                  : "translateX(-50%) translateY(3%) scale(0.5)",
              transition: `transform 400ms cubic-bezier(0.25, 0.9, 0.3, 1) ${
                stage === "open" ? "200ms" : "0ms"
              }`,
            }}
          >
            <div className="h-[420px] max-h-[62vh] overflow-y-auto rounded-[4px] bg-[#fffdf5] px-8 py-7 shadow-[0_16px_44px_rgba(0,0,0,0.35)]">
              {envelope.sponsored ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/petimemama.png"
                  alt="Petimemama"
                  className="h-9 object-contain"
                />
              ) : (
                <p className="font-hand text-3xl text-neutral-800">
                  {envelope.name}
                </p>
              )}
              <div className="mt-1 flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
                  {envelope.sponsored ? "Sponsorlu • Sürpriz" : "Manifest"}
                </p>
                <p className="font-mono text-[11px] tracking-wider text-neutral-400">
                  {envelope.code}
                </p>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-neutral-700">
                {envelope.manifest}
              </p>
            </div>
          </div>

          {/* Zarf ön cebi (mektubun alt kısmını içine alır) */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[340px] rounded-[6px] shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
            style={{
              clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)",
              ...(envelope.color.bodyBg
                ? { background: envelope.color.bodyBg }
                : { backgroundColor: envelope.color.base }),
            }}
          />
          {/* Parlak yüzey — özel seri, ön cep üzerinde */}
          {envelope.color.gloss && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[21] h-[340px] rounded-[6px]"
              style={{
                clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)",
                background:
                  "linear-gradient(115deg, rgba(255,255,255,0.22) 8%, rgba(255,255,255,0.06) 30%, transparent 46%)",
              }}
            />
          )}

          {/* Eklenme tarihi + görüntülenme — zarf ön yüzü, sol alt */}
          <div
            className="absolute bottom-[16px] left-[22px] z-30 flex flex-col items-start gap-1 text-xs font-medium transition-opacity duration-200"
            style={{
              color: envelope.color.ink,
              opacity: stage === "open" ? 0.85 : 0,
              pointerEvents: "none",
            }}
          >
            <span className="flex items-center gap-1.5 text-[11px] opacity-90">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                <path d="M19 16v6" />
                <path d="M16 19h6" />
              </svg>
              {envelope.date} tarihinde eklendi
            </span>
            <span className="h-px w-full bg-current opacity-25" />
            <span className="flex items-center gap-1.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
              <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
            </svg>
            {envelope.views.toLocaleString("tr-TR")} kişi zarfı açtı
            </span>
          </div>

          {/* Şans dile — zarf ön yüzü, sağ alt (sponsor zarfında yok) */}
          <div
            className="absolute bottom-[14px] right-[20px] z-30 flex flex-col items-end gap-1.5 transition-opacity duration-200"
            style={{
              opacity: stage === "open" && !envelope.sponsored ? 1 : 0,
              pointerEvents:
                stage === "open" && !envelope.sponsored ? "auto" : "none",
            }}
          >
            <span
              className="flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-0.5 text-xs font-medium shadow-sm backdrop-blur-[1px]"
              style={{
                // Beyaz pill üstünde açık mürekkepler okunmaz (özel seri)
                color: envelope.color.gloss ? "#525252" : envelope.color.ink,
              }}
            >
              <span className="text-[11px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
                ⭐
              </span>
              <b className="font-semibold">{luck}</b> kişi şans diledi
            </span>
            <button
              type="button"
              onClick={() => {
                if (wished) return;
                setWished(true);
                setLuck((n) => n + 1);
              }}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm transition-all ${
                wished
                  ? "border-amber-300 bg-amber-50 text-amber-600"
                  : "border-neutral-200 bg-white/90 text-neutral-600 hover:border-amber-300 hover:text-amber-600"
              }`}
            >
              <span
                className={`text-base transition-transform duration-300 ${
                  wished ? "scale-125" : ""
                }`}
              >
                {wished ? "⭐" : "☆"}
              </span>
              Şans dile
            </button>
          </div>

          {/* Kapak — ortaya gelince yukarı açılır, kapanınca geri iner.
              Ucu, ön cebin V çizgisinin altına iner: kapalıyken aralık kalmaz */}
          <div
            className="absolute inset-x-0 top-[220px] h-[185px] rounded-t-[6px]"
            style={{
              ...(envelope.color.flapBg
                ? { background: envelope.color.flapBg }
                : { backgroundColor: envelope.color.dark }),
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              transformOrigin: "top center",
              transform: stage === "open" ? "rotateX(180deg)" : "rotateX(0deg)",
              // Açılırken hemen, kapanırken mektup içeri girdikten sonra
              transition: `transform 340ms ease ${
                stage === "open" ? "0ms" : "200ms"
              }`,
              zIndex: flapZ,
            }}
          />

          {/* Süs — duvardaki zarfla aynı yerde, aynı açıyla */}
          {envelope.sticker && (
            <span
              className="pointer-events-none absolute z-[35] leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]"
              style={{
                left: `${envelope.sticker.left}%`,
                top: "405px",
                fontSize: `${geo.stickerPx}px`,
                transform: `translate(-50%, -100%) rotate(${envelope.sticker.rotation}deg)`,
              }}
            >
              {envelope.sticker.emoji}
            </span>
          )}

          <button
            type="button"
            onClick={close}
            className="absolute -right-2 top-[150px] z-40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-xl text-neutral-600 shadow-lg transition-all hover:scale-110"
            style={{ opacity: stage === "open" ? 1 : 0 }}
            aria-label="Kapat"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const envelopes = useMemo(buildEnvelopes, []);
  const [selected, setSelected] = useState<{
    env: Envelope;
    origin: Origin;
  } | null>(null);
  // İnişte yer açan zarf: inen zarfın id'si
  const [partingId, setPartingId] = useState<number | null>(null);
  // Şişedeki not popup'ı (zarf id'si ile)
  const [bottleOpen, setBottleOpen] = useState<{
    id: number;
    origin: Origin;
  } | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Ekran genişliği + cihaz tipine göre sütun sayısı:
  // telefon → 3, tablet → 6, laptop/monitör → 10 (zarf boyutu ekrana uyar)
  const [vwPx, setVwPx] = useState(1920);
  const [phone, setPhone] = useState(false);

  useEffect(() => {
    const update = () => {
      setVwPx(document.documentElement.clientWidth);
      const ua = navigator.userAgent;
      setPhone(
        /iPhone|iPod|Windows Phone/i.test(ua) ||
          (/Android/i.test(ua) && /Mobile/i.test(ua)),
      );
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  const cols = phone ? 3 : vwPx < 700 ? 3 : vwPx < 1100 ? 6 : 10;

  // Yıl / ay filtresi (0 = tümü) — yıl, mevcut tek yıl olan 2026 seçili gelir
  const [fYear, setFYear] = useState(2026);
  const [fMonth, setFMonth] = useState(0);

  const visible = useMemo(
    () =>
      envelopes.filter(
        (e) =>
          !e.bottled &&
          (!fYear || e.year === fYear) &&
          (!fMonth || e.month === fMonth),
      ),
    [envelopes, fYear, fMonth],
  );

  // Şişedeki manifestler (1000+ şans)
  const bottledEnvs = useMemo(
    () => envelopes.filter((e) => e.bottled),
    [envelopes],
  );

  // Günlük karıştırma tohumu: her gece 02:00'da değişir. Sıralama satılmaz;
  // tüm konumlar her gün bu tohumla rastgele yeniden dağıtılır
  const daySeed = useMemo(
    () => Math.floor((Date.now() - 2 * 3600 * 1000) / 86400000),
    [],
  );

  const years = useMemo(
    () => [...new Set(envelopes.map((e) => e.year))].sort(),
    [envelopes],
  );

  // Yerleşim: tamamen orantılı piksel konumları (zoom yok, ölçek yok).
  // Konum sırası her gün 02:00'da daySeed ile rastgele karılır;
  // filtre aktifken görünür zarflar baştan itibaren yeniden dizilir
  const layout = useMemo(() => {
    const m = makeLayoutMetrics(vwPx, cols);
    const rows = Math.max(1, Math.ceil(visible.length / cols));
    const wrapperW = cols * m.colStep;

    // Reklam banner alanları — tam genişlik. Masaüstünde yan yana iki
    // şerit, mobilde (3 sütun) alt alta. ADS_ENABLED kapalıysa hiç yoklar
    const bannerGap = 14;
    const bannerH = Math.max(110, m.envH * 1.35);
    const stacked = cols === 3;
    const banners = !ADS_ENABLED
      ? []
      : stacked
        ? [
            { x: 0, y: 64, w: wrapperW, h: bannerH },
            { x: 0, y: 64 + bannerH + bannerGap, w: wrapperW, h: bannerH },
          ]
        : (() => {
            // Masaüstünde kenarlardan hafif boşluk
            const side = 20;
            const w = (wrapperW - side * 2 - bannerGap) / 2;
            return [
              { x: side, y: 64, w, h: bannerH },
              { x: side + w + bannerGap, y: 64, w, h: bannerH },
            ];
          })();
    // Zarflar banner bölgesinin hemen altından (reklam kapalıysa tepeden) başlar
    const topOffset = banners.length
      ? banners[banners.length - 1].y + bannerH + 26
      : 8;
    const sectionH = topOffset + rows * m.rowStep + m.envH + 40;

    // Günlük Fisher-Yates karıştırması
    const shuffleRand = mulberry32(daySeed);
    let order = [...visible];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(shuffleRand() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    // Sponsor zarfları eşit yayılır: her ~100 zarflık blokta en fazla 1
    const sponsors = order.filter((e) => e.sponsored);
    if (sponsors.length) {
      const rest = order.filter((e) => !e.sponsored);
      const block = Math.max(1, Math.floor(rest.length / sponsors.length));
      sponsors.forEach((s, i) => {
        const at = Math.min(
          rest.length,
          i * block + Math.floor(shuffleRand() * block),
        );
        rest.splice(at, 0, s);
      });
      order = rest;
    }

    const pos = new Map<number, Pos>();
    order.forEach((env, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      pos.set(env.id, {
        x: 2 + col * m.colStep + env.jx * m.jx,
        y: topOffset + row * m.rowStep + env.jy * m.jy,
        // Sponsor zarfı komşularının önünde durur (etiketi kapanmasın)
        z: (rows - row) * 4 + env.zr + (env.sponsored ? 6 : 0),
      });
    });

    // Şişe konumları da her gün rastgele dağılır (dikeyde bantlara yayılı,
    // banner bölgesinin altından başlarlar)
    const bRand = mulberry32(daySeed + 999);
    const bottles = bottledEnvs.map((env, i) => ({
      env,
      x: bRand() * Math.max(1, wrapperW - m.bottleW - 8),
      y:
        topOffset +
        ((i + 0.1 + bRand() * 0.8) / Math.max(1, bottledEnvs.length)) *
          Math.max(1, sectionH - topOffset - m.bottleH - 100),
      rot: -18 + bRand() * 36,
    }));
    const rx = m.bottleW / 2 + m.envW / 2 + 8;
    const ry = m.bottleH / 2 + m.envH / 2 + 12;
    for (const p of pos.values()) {
      const ex = p.x + m.envW / 2;
      const ey = p.y + m.envH / 2;
      for (const bb of bottles) {
        const bx = bb.x + m.bottleW / 2;
        const by = bb.y + m.bottleH / 2;
        let dx = ex - bx;
        let dy = ey - by;
        const d = Math.hypot(dx / rx, dy / ry);
        if (d >= 1) continue;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        const push = (1 - d) * m.envW * 0.38; // hafif itme
        p.x += dx * push;
        p.y += dy * push;
      }
      p.x = Math.min(wrapperW - m.envW - 2, Math.max(2, p.x));
      p.y = Math.max(2, p.y);
    }

    return {
      ...m,
      rows,
      wrapperW,
      sectionH,
      topOffset,
      pos,
      bottles,
      banners,
      order,
    };
  }, [visible, bottledEnvs, cols, vwPx, daySeed]);

  // Pencereleme: sadece görünür bölge ± tampon kadar satır render edilir,
  // 1000 zarfın tamamı asla aynı anda DOM'da durmaz
  const [range, setRange] = useState({ start: 0, end: 30 });

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const sectionTop = sectionRef.current?.offsetTop ?? 64;
      const y = window.scrollY - sectionTop - layout.topOffset;
      const buffer = 1.5 * vh; // her yönde 1.5 ekran tampon
      const start = Math.max(0, Math.floor((y - buffer) / layout.rowStep));
      const end = Math.min(
        layout.rows - 1,
        Math.ceil((y + vh + buffer) / layout.rowStep),
      );
      setRange((prev) =>
        prev.start === start && prev.end === end ? prev : { start, end },
      );
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Emniyet: olası kaçan scroll olaylarına karşı kendini periyodik onar
    const iv = setInterval(update, 700);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      clearInterval(iv);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [layout.rows, layout.rowStep, layout.topOffset]);

  // Kod ile manifest arama
  const [query, setQuery] = useState("");
  const [searchErr, setSearchErr] = useState(false);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toUpperCase();
    if (!q) return;
    // "MF-042", "mf042" veya sadece "42" kabul edilir
    const num = q.match(/(\d+)/)?.[1];
    const env = envelopes.find(
      (en) => en.code === q || (num && en.code === `MF-${num.padStart(3, "0")}`),
    );
    if (!env) {
      setSearchErr(true);
      setTimeout(() => setSearchErr(false), 1200);
      return;
    }
    // Şişedeki manifest arandıysa şişenin konumuna kaydır
    if (env.bottled) {
      const be = layout.bottles.find((b) => b.env.id === env.id);
      const sec = sectionRef.current;
      if (be && sec) {
        window.scrollTo({
          top: sec.offsetTop + be.y - window.innerHeight / 2 + 120,
          behavior: "smooth",
        });
      }
      return;
    }
    const p = layout.pos.get(env.id);
    if (!p) {
      // Zarf aktif yıl/ay filtresinin dışında
      setSearchErr(true);
      setTimeout(() => setSearchErr(false), 1200);
      return;
    }
    setHighlightId(env.id);
    // Hedef zarf henüz render edilmemiş olabilir (pencereleme) — konumu
    // matematiksel hesapla; kaydırınca görünür alana girip parlar
    const sec = sectionRef.current;
    if (sec) {
      const topPx = sec.offsetTop + p.y;
      window.scrollTo({
        top: topPx - window.innerHeight / 2 + 60,
        behavior: "smooth",
      });
    }
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightId(null), 4000);
  };

  // İnen zarfla temas hâlindeki komşuları bul ve itme vektörlerini hesapla
  const displaced = useMemo(() => {
    const map = new Map<number, { x: number; y: number }>();
    if (partingId === null) return map;
    const target = layout.pos.get(partingId);
    if (!target) return map;
    const pad = 10;
    for (const e of visible) {
      if (e.id === partingId) continue;
      const p = layout.pos.get(e.id)!;
      const touches =
        p.x < target.x + layout.envW + pad &&
        target.x < p.x + layout.envW + pad &&
        p.y < target.y + layout.envH + pad &&
        target.y < p.y + layout.envH + pad;
      if (!touches) continue;
      let dx = p.x - target.x;
      let dy = p.y - target.y;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      const push = layout.envW * 0.6;
      map.set(e.id, { x: dx * push, y: dy * push });
    }
    return map;
  }, [partingId, visible, layout]);

  // Popup açıkken sayfa kaymasın; kaybolan scrollbar kadar padding ekle ki
  // duvar yana kaymasın (yoksa zarf yerine dönerken hedef şaşar)
  useEffect(() => {
    if (selected || bottleOpen) {
      const sbw = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${sbw}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [selected, bottleOpen]);

  return (
    <main className="flex min-h-screen flex-col">
      {/* Topbar reklam alanı — şerit (admin: reklamlar kapalı) */}
      {ADS_ENABLED && (
        <div className="flex h-12 shrink-0 items-center justify-center border-b border-neutral-200 bg-white">
          <span className="rounded border border-dashed border-neutral-300 px-8 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-neutral-400">
            Topbar Reklam Alanı
          </span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-[1500] flex h-16 shrink-0 items-center justify-center border-b border-neutral-300/70 bg-white/70 backdrop-blur">
        <span className="rounded border border-dashed border-neutral-400 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-neutral-400">
          Burası header alanı
        </span>

        {/* Manifest arama + yıl/ay filtresi — header'dan sarkan panel */}
        <form
          onSubmit={handleSearch}
          className={`absolute left-1/2 top-full flex h-11 max-w-[96vw] -translate-x-1/2 items-center rounded-b-2xl border-x border-b bg-white/95 px-4 shadow-[0_8px_20px_rgba(0,0,0,0.1)] backdrop-blur transition-colors ${
            searchErr ? "border-red-400" : "border-neutral-200"
          }`}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zarf kodu"
            className="w-40 min-w-0 bg-transparent px-2 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 max-[520px]:w-24"
          />
          <button
            type="submit"
            className={`flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors ${
              searchErr
                ? "bg-red-50 text-red-500"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-3.5 w-3.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            Ara
          </button>
          <span className="mx-2 h-5 w-px shrink-0 bg-neutral-200" />
          <select
            value={fYear}
            onChange={(e) => setFYear(Number(e.target.value))}
            className="cursor-pointer bg-transparent py-1 text-sm text-neutral-600 outline-none"
            aria-label="Yıl filtresi"
          >
            <option value={0}>Yıl</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <span className="mx-1 h-5 w-px shrink-0 bg-neutral-200" />
          <select
            value={fMonth}
            onChange={(e) => setFMonth(Number(e.target.value))}
            className="cursor-pointer bg-transparent py-1 text-sm text-neutral-600 outline-none"
            aria-label="Ay filtresi"
          >
            <option value={0}>Tüm aylar</option>
            {MONTHS_TR.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </form>
      </header>

      {/* Zarf duvarı — aşağı kaydırılabilir, satırlar görünür oldukça yüklenir */}
      <section
        ref={sectionRef}
        className="relative overflow-hidden"
        style={{ height: layout.sectionH }}
      >
        <div
          className="relative mx-auto h-full"
          style={{ width: layout.wrapperW }}
        >
          {/* Reklam banner alanları — placeholder */}
          {layout.banners.map((bn, i) => (
            <div
              key={i}
              className="absolute flex items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-white/90"
              style={{
                left: bn.x,
                top: bn.y,
                width: bn.w,
                height: bn.h,
                zIndex: layout.rows * 4 + 30,
              }}
            >
              <span className="text-center text-xs font-medium uppercase tracking-[0.25em] text-neutral-400">
                Reklam Alanı {i + 1}
              </span>
            </div>
          ))}

          {/* Şişedeki Notlar — 1000+ şans dilenmiş manifestler */}
          {layout.bottles.map((b, i) => (
            <button
              key={b.env.id}
              type="button"
              aria-label={`${b.env.name} — şişedeki notu oku`}
              onClick={(e) => {
                const el = e.currentTarget;
                const r = el.getBoundingClientRect();
                setBottleOpen({
                  id: b.env.id,
                  origin: {
                    cx: r.left + r.width / 2,
                    cy: r.top + r.height / 2,
                    w: el.offsetWidth,
                    h: el.offsetHeight,
                  },
                });
              }}
              className="absolute aspect-[200/520] cursor-pointer touch-manipulation transition-all duration-200 hover:scale-110"
              style={{
                zIndex: layout.rows * 4 + 40,
                width: layout.bottleW,
                left: b.x,
                top: b.y,
                rotate: `${b.rot}deg`,
                visibility: bottleOpen?.id === b.env.id ? "hidden" : undefined,
              }}
            >
              <BottleVisual
                sticker={b.env.sticker?.emoji ?? "🦋"}
                ribbon={b.env.id % RIBBON_GRADS.length}
                sheenDelay={i * 0.9}
                label={
                  <div className="flex flex-col items-center gap-[3px]">
                    <p
                      className="leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
                      style={{ fontSize: 11 * (layout.bottleW / 160) }}
                    >
                      ⭐
                    </p>
                    <p
                      className="leading-none font-semibold text-[#8a6d33]"
                      style={{ fontSize: 12 * (layout.bottleW / 160) }}
                    >
                      {b.env.luck.toLocaleString("tr-TR")}
                    </p>
                    <p
                      className="truncate font-hand leading-none font-semibold text-[#6b5426]"
                      style={{ fontSize: 17 * (layout.bottleW / 160) }}
                    >
                      {b.env.name}
                    </p>
                  </div>
                }
              />
            </button>
          ))}

          {layout.order
            .filter((_, i) => {
              const row = Math.floor(i / cols);
              return row >= range.start && row <= range.end;
            })
            .map((env) => (
              <EnvelopeCard
                key={env.id}
                envelope={env}
                pos={layout.pos.get(env.id)!}
                envW={layout.envW}
                hidden={selected?.env.id === env.id}
                offset={displaced.get(env.id)}
                highlighted={highlightId === env.id}
                onOpen={(e, origin) => setSelected({ env: e, origin })}
              />
            ))}
        </div>
      </section>

      {bottleOpen &&
        (() => {
          const be = layout.bottles.find((b) => b.env.id === bottleOpen.id);
          return be ? (
            <BottlePopup
              bottle={toBottleData(be.env, be.rot)}
              origin={bottleOpen.origin}
              onClose={() => setBottleOpen(null)}
            />
          ) : null;
        })()}

      {selected && (
        <ManifestPopup
          envelope={selected.env}
          origin={selected.origin}
          onClosingStart={() => setPartingId(selected.env.id)}
          onClose={() => {
            setSelected(null);
            // Zarf yerine oturduktan kısa bir süre sonra komşular geri dönsün
            setTimeout(() => setPartingId(null), 250);
          }}
        />
      )}
    </main>
  );
}
