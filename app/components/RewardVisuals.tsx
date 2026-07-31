"use client";

// ── Ödül görselleri — duvar ve üye paneli ortak kullanır ─────────────────
// BottleVisual ve GiftBoxVisual duvardaki birebir görsellerdir (page.tsx'ten
// taşındı); MiniEnvelope, panel önizlemeleri için zarfın sade kopyasıdır.

// Sticker paleti — manifest türlerinin karşılığı; her birinin kısa bir
// anlam etiketi var. Duvar, panel ve sticker seçme popup'ı ortak kullanır
export const STICKERS = [
  { emoji: "🏡", label: "Ev" },
  { emoji: "🚗", label: "Araba" },
  { emoji: "✈️", label: "Seyahat" },
  { emoji: "💎", label: "Zenginlik" },
  { emoji: "💼", label: "Kariyer" },
  { emoji: "🎓", label: "Eğitim" },
  { emoji: "❤️", label: "Aşk" },
  { emoji: "👶", label: "Bebek" },
  { emoji: "💍", label: "Evlilik" },
  { emoji: "🌿", label: "Sağlık" },
  { emoji: "⭐", label: "Başarı" },
  { emoji: "🦋", label: "Dönüşüm" },
  { emoji: "🍀", label: "Şans" },
  { emoji: "🐞", label: "Uğur" },
  { emoji: "🧿", label: "Nazar" },
];

// Geriye dönük kolaylık: yalnızca emojiler
export const STICKER_EMOJIS = STICKERS.map((s) => s.emoji);

export const RIBBON_GRADS = [
  ["#3d3d3d", "#101010", "#2c2c2c"], // siyah
  ["#9e2439", "#5c0f1d", "#7b1526"], // bordo
  ["#2a4a8b", "#101f45", "#1d3567"], // lacivert
  ["#6d3aa0", "#3a1560", "#552881"], // koyu mor
];

// Özel seri — 50+ şans hakkı: parlak, gradientli 4 renk. Her birinin bir
// anlamı var; üye panelden kendisi seçer (duvar + panel ortak kullanır)
export const SPECIAL_COLORS = [
  {
    label: "Prestij",
    color: {
      base: "#1c1c1c",
      dark: "#000000",
      ink: "#E5C15C", // siyah üstüne altın yazı
      bodyBg: "linear-gradient(135deg, #3d3d3d, #101010 55%, #2c2c2c)",
      flapBg: "linear-gradient(180deg, #262626, #000000)",
      gloss: true,
    },
  },
  {
    label: "Tutku",
    color: {
      base: "#7b1526",
      dark: "#4a0d16",
      ink: "#E5C15C", // bordo, altın yazı
      bodyBg: "linear-gradient(135deg, #9e2439, #5c0f1d 55%, #7b1526)",
      flapBg: "linear-gradient(180deg, #6f1322, #3f0a12)",
      gloss: true,
    },
  },
  {
    label: "Kararlılık",
    color: {
      base: "#1c3260",
      dark: "#0b1733",
      ink: "#E5C15C", // lacivert, altın yazı
      bodyBg: "linear-gradient(135deg, #2a4a8b, #101f45 55%, #1d3567)",
      flapBg: "linear-gradient(180deg, #1c3260, #0b1733)",
      gloss: true,
    },
  },
  {
    label: "Asalet",
    color: {
      base: "#552881",
      dark: "#2a0f47",
      ink: "#E5C15C", // koyu mor, altın yazı
      bodyBg: "linear-gradient(135deg, #6d3aa0, #3a1560 55%, #552881)",
      flapBg: "linear-gradient(180deg, #4d2178, #2a0f47)",
      gloss: true,
    },
  },
];

// Panel önizlemeleri için örnek renkler (duvar paletiyle birebir)
export const PREVIEW_PASTEL = {
  base: "#FFC8CD",
  dark: "#F7ABB2",
  ink: "#8E3B47",
};
export const PREVIEW_SPECIAL = SPECIAL_COLORS[0].color;

// ── Mini zarf — duvardaki EnvelopeCard'ın statik önizleme kopyası ────────
export function MiniEnvelope({
  color,
  name,
  luck,
  sticker,
  width = 128,
}: {
  color: {
    base: string;
    dark: string;
    ink: string;
    bodyBg?: string;
    flapBg?: string;
    gloss?: boolean;
  };
  name: string;
  luck: number;
  sticker?: string;
  width?: number;
}) {
  const fs = width / 180;
  return (
    <div
      className={`relative aspect-[4/3] rounded-[3px] ${
        color.gloss
          ? "shadow-[0_4px_14px_rgba(0,0,0,0.35)]"
          : "shadow-[0_2px_6px_rgba(0,0,0,0.16)]"
      }`}
      style={{
        width,
        ...(color.bodyBg
          ? { background: color.bodyBg }
          : { backgroundColor: color.base }),
      }}
    >
      {/* Kapak üçgeni */}
      <span
        className="absolute inset-x-0 top-0 h-[56%]"
        style={{
          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          ...(color.flapBg
            ? { background: color.flapBg }
            : { backgroundColor: color.dark }),
        }}
      />
      {/* Parlak yüzey — özel seri */}
      {color.gloss && (
        <span
          className="pointer-events-none absolute inset-0 rounded-[3px]"
          style={{
            background:
              "linear-gradient(115deg, rgba(255,255,255,0.25) 8%, rgba(255,255,255,0.06) 30%, transparent 46%)",
          }}
        />
      )}
      {/* Süs — duvardaki gibi kapak ucu hizasında, sağ slotta */}
      {sticker && (
        <span
          className="pointer-events-none absolute top-[56%] -translate-x-1/2 -translate-y-full leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
          style={{
            left: "76%",
            rotate: "14deg",
            fontSize: 28 * fs,
          }}
        >
          {sticker}
        </span>
      )}
      {/* Şans rozeti */}
      <span className="pointer-events-none absolute inset-x-0 bottom-[23%] flex items-start justify-center leading-none">
        <span className="flex flex-col items-center gap-[1px]">
          <span
            className="opacity-70 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
            style={{ fontSize: Math.max(10, 9 * fs) }}
          >
            ⭐
          </span>
          <span
            className="font-medium opacity-80"
            style={{ color: color.ink, fontSize: Math.max(11.5, 10 * fs) }}
          >
            {luck.toLocaleString("tr-TR")}
          </span>
        </span>
      </span>
      {/* Rumuz */}
      <span
        className="absolute inset-x-0 bottom-[4%] truncate px-1 text-center font-hand leading-none font-semibold"
        style={{ color: color.ink, fontSize: Math.max(14.5, 18 * fs) }}
      >
        {name}
      </span>
    </div>
  );
}

// ── Cam şişe + mantar + kurdele + rulo not: duvardaki birebir görsel ─────
// parlamaları ve gövdesinde kağıt etiket (içeriği dışarıdan gelir)
export function BottleVisual({
  noteOut = false,
  label,
  sticker = "🦋",
  ribbon = 0,
  sheenDelay = 0,
  realized = false,
  bandFs = 10,
}: {
  noteOut?: boolean;
  label?: React.ReactNode;
  sticker?: string;
  ribbon?: number;
  sheenDelay?: number;
  realized?: boolean;
  bandFs?: number;
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

      {/* Gerçekleşti bandı — şişeyi yatayda saran yeşil şerit, etiketin altında */}
      {realized && (
        <div
          className="absolute left-[19.5%] top-[72%] w-[61%] rounded-[3px] border-y border-emerald-700/30 text-center font-bold uppercase text-white shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.3), rgba(0,0,0,0.06) 14%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.08) 86%, rgba(0,0,0,0.32)), linear-gradient(165deg, #34d399, #059669)",
            fontSize: bandFs,
            letterSpacing: "0.1em",
            padding: `${bandFs * 0.35}px 0`,
          }}
        >
          Gerçekleşti
        </div>
      )}
    </div>
  );
}

// Karton kalınlığı katmanının clip yolu: gövde + sağ/alt taşma, uçları 45°
// pahlı. Pah köşeleri küçük quadratic eğrilerle hafifçe yuvarlatılır.
// w/h gövde boyutu, u ölçü birimi (taşma 8u, pah 13u, yuvarlatma ~3u).
export function giftDepthClip(w: number, h: number, u: number) {
  const W = w + 8 * u;
  const H = h + 8 * u;
  const C = 13 * u;
  const r = 3 * u;
  const q = 2.1 * u;
  return `path('M 0 0 L ${W - C - r} 0 Q ${W - C} 0 ${W - C + q} ${q} L ${W - q} ${C - q} Q ${W} ${C} ${W} ${C + r} L ${W} ${H} L ${C + q} ${H} Q ${C} ${H} ${C - q} ${H - q} L ${q} ${H - C + q} Q 0 ${H - C} 0 ${H - C - r} Z')`;
}

// ── Hediye kutusu — duvardaki birebir görsel ─────────────────────────────
// size = kutunun genişliği; yükseklik 1.32 katıdır.
export function GiftBoxVisual({
  size,
  name,
  luck,
  depth = true,
  glow = false,
  realized = false,
  cheers = 0,
  sticker,
  stickerRot = -10,
}: {
  size: number;
  name: string;
  luck: number;
  // Kapak tek başına uçarken kalınlık gövdede kalır: popup kapağında false
  depth?: boolean;
  // Kapak arasından sızan ışık — duvardaki kapalı kutuda yanar
  glow?: boolean;
  // Gerçekleşen manifestte yeşil etiket + etikete 👏 sütunu (şişeyle aynı)
  realized?: boolean;
  cheers?: number;
  // Üyenin seçtiği süs — zarftaki gibi kapak üstüne yapıştırılır
  sticker?: string;
  stickerRot?: number; // deg
}) {
  const u = size / 150;
  const h = size * 1.32;
  return (
    <div className="relative" style={{ width: size, height: h }}>
      {/* Kapak arasından sızan ışık: dönen ışın demeti + nefes alan hare */}
      {glow && (
        <>
          <div
            className="pointer-events-none absolute"
            style={{ inset: -22 * u }}
          >
            <div
              className="gift-rays absolute inset-0"
              style={{
                background:
                  "repeating-conic-gradient(from 0deg, rgba(255,178,56,0) 0deg, rgba(255,178,56,0.5) 4deg, rgba(255,178,56,0) 8deg 30deg)",
                WebkitMaskImage:
                  "radial-gradient(closest-side, rgba(0,0,0,1) 40%, rgba(0,0,0,0.4) 60%, transparent 72%)",
                maskImage:
                  "radial-gradient(closest-side, rgba(0,0,0,1) 40%, rgba(0,0,0,0.4) 60%, transparent 72%)",
              }}
            />
          </div>
        </>
      )}
      {/* Karton kalınlığı — gövdeden sağa ve alta taşan tek parça. Uçları
          45° pahla kesilir: kenar, gövde köşesinden perspektif yönünde
          kırılıp biter (gerçek kutu kenarı gibi), taşma/kulak kalmaz */}
      {depth && (
        <div
          className="absolute"
          style={{
            top: 0,
            left: 0,
            right: -8 * u,
            bottom: -8 * u,
            borderRadius: 5 * u,
            background: "linear-gradient(135deg, #a3865a, #7c6440)",
            clipPath: giftDepthClip(size, h, u),
          }}
        />
      )}
      {/* Üst yüz — kraft ambalaj */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: 5 * u,
          background:
            "linear-gradient(135deg, #dcc194, #c6a575 70%, #b8955f)",
          boxShadow: `${6 * u}px ${9 * u}px ${18 * u}px rgba(0,0,0,0.3)`,
        }}
      >
        {/* Bordo kurdele — şişe kurdelesiyle aynı keskin geçişli gradyan.
            Dikey %38'de, yatay %26'da kesişir */}
        <div
          className="absolute inset-y-0"
          style={{
            left: "38%",
            width: 17 * u,
            transform: "translateX(-50%)",
            background:
              "linear-gradient(135deg, #9e2439, #5c0f1d 55%, #7b1526)",
          }}
        />
        <div
          className="absolute inset-x-0"
          style={{
            top: "26%",
            height: 17 * u,
            background:
              "linear-gradient(135deg, #9e2439, #5c0f1d 55%, #7b1526)",
          }}
        />
        {/* Sol üstten vuran ışık */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(125deg, rgba(255,255,255,0.22), transparent 55%)",
          }}
        />
      </div>
      {/* Kapak çevresinden sızan amber ışık — kapak hattının hemen dışına,
          sağ/alt karton kalınlığının da üstüne vurur */}
      {glow && (
        <div className="pointer-events-none absolute inset-0">
          <div
            className="gift-leak absolute inset-0"
            style={{
              borderRadius: 5 * u,
              boxShadow: `0 0 ${9 * u}px ${1.5 * u}px rgba(255,186,64,0.95), 0 0 ${26 * u}px ${10 * u}px rgba(255,170,45,0.5)`,
            }}
          />
        </div>
      )}
      {/* Fiyonk — şişedeki kurdeleyle aynı dil: keskin geçişli bordo
          gradyan, kontursuz */}
      <svg
        viewBox="0 0 100 90"
        className="absolute"
        style={{
          left: "38%",
          top: "26%",
          width: 92 * u,
          transform: "translate(-50%, -44%)",
        }}
      >
        <defs>
          <linearGradient id="giftBowGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#9e2439" />
            <stop offset="0.55" stopColor="#5c0f1d" />
            <stop offset="1" stopColor="#7b1526" />
          </linearGradient>
        </defs>
        {/* Kuyruklar */}
        <path
          d="M50 46 C40 60 28 68 18 82 L30 78 C38 66 46 58 50 46 Z"
          fill="url(#giftBowGrad)"
        />
        <path
          d="M50 46 C58 58 70 64 80 74 L70 60 C62 54 54 50 50 46 Z"
          fill="url(#giftBowGrad)"
        />
        {/* Yukarı kıvrılan kurdele ucu */}
        <path
          d="M52 44 C50 28 56 16 50 4 C64 12 60 30 58 44 Z"
          fill="url(#giftBowGrad)"
        />
        {/* Fiyonk kanatları */}
        <path
          d="M50 46 C26 16 4 26 10 44 C15 58 36 56 50 46 Z"
          fill="url(#giftBowGrad)"
        />
        <path
          d="M50 46 C70 14 94 22 90 40 C86 55 64 54 50 46 Z"
          fill="url(#giftBowGrad)"
        />
        <circle cx="50" cy="45" r="6.5" fill="url(#giftBowGrad)" />
      </svg>
      {/* Süs — zarftaki gibi kapak üstüne yapıştırılır; fiyonk ve kurdele
          dışındaki sol alt boş alanda durur */}
      {sticker && (
        <span
          className="pointer-events-none absolute z-10 leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
          style={{
            left: "19%",
            top: "64%",
            fontSize: 26 * u,
            transform: `translate(-50%, -50%) rotate(${stickerRot}deg)`,
          }}
        >
          {sticker}
        </span>
      )}
      {/* Gerçekleşti etiketi — zarftaki yeşil pill'in kutu üstü hali;
          kağıt etikete çarpmasın diye sol-alt bölgede durur */}
      {realized && (
        <span
          className="absolute z-10 whitespace-nowrap rounded-full bg-emerald-500 font-bold uppercase text-white shadow-md"
          style={{
            left: "30%",
            top: "82%",
            transform: "translate(-50%, -50%) rotate(-5deg)",
            fontSize: Math.max(7.5, 9 * u),
            letterSpacing: "0.1em",
            padding: `${2.5 * u}px ${8 * u}px`,
          }}
        >
          Gerçekleşti
        </span>
      )}
      {/* Kağıt etiket — şişelerdeki bantla aynı dil: ⭐ beğeni + rumuz.
          Kutuya göre dikine durur (90° dönük), sağ tarafta kurdelesiz alanda */}
      <div
        className="pointer-events-none absolute flex flex-col items-center rounded-[3px] border-y border-[#dcc7a0] shadow-[0_3px_8px_rgba(0,0,0,0.15)]"
        style={{
          right: -25 * u,
          bottom: 40 * u,
          width: 116 * u,
          gap: 3 * u,
          padding: `${7 * u}px ${8 * u}px`,
          background:
            "linear-gradient(90deg, rgba(90,70,30,0.22), rgba(90,70,30,0.04) 14%, rgba(90,70,30,0) 30%, rgba(90,70,30,0) 70%, rgba(90,70,30,0.05) 86%, rgba(90,70,30,0.24)), linear-gradient(165deg,#faf1dd,#efdfbc)",
          transform: "rotate(-90deg)",
        }}
      >
        <span
          className="flex items-start justify-center"
          style={{ gap: 8 * u }}
        >
          <span className="flex flex-col items-center gap-[2px]">
            <span
              className="leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
              style={{ fontSize: Math.max(9, 10 * u) }}
            >
              ⭐
            </span>
            <span
              className="font-semibold leading-none"
              style={{ color: "#8a6d33", fontSize: Math.max(10, 11 * u) }}
            >
              {luck.toLocaleString("tr-TR")}
            </span>
          </span>
          {realized && (
            <span className="flex flex-col items-center gap-[2px]">
              <span
                className="leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
                style={{ fontSize: Math.max(9, 10 * u) }}
              >
                👏
              </span>
              <span
                className="font-semibold leading-none"
                style={{ color: "#8a6d33", fontSize: Math.max(10, 11 * u) }}
              >
                {cheers.toLocaleString("tr-TR")}
              </span>
            </span>
          )}
        </span>
        <span
          className="w-full truncate text-center font-hand font-semibold leading-none"
          style={{ color: "#6b5426", fontSize: Math.max(12, 15 * u) }}
        >
          {name}
        </span>
      </div>
    </div>
  );
}
