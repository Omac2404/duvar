"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import SiteHeader from "./components/SiteHeader";
import CopyBtn from "./components/CopyBtn";
import { getUsers, PANEL_COLORS } from "./lib/auth";
import {
  BottleVisual,
  GiftBoxVisual,
  giftDepthClip,
  RIBBON_GRADS,
  SPECIAL_COLORS,
  STICKER_EMOJIS,
} from "./components/RewardVisuals";

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
  cheers: number; // kaç kişi tebrik etti
  views: number; // görüntülenme sayısı (şimdilik rastgele; ileride IP bazlı)
  code: string; // manifeste özel arama kodu — 5 rakam + 2 harf (örn. 48213KT)
  date: string; // zarfın eklendiği tarih
  year: number; // filtreleme için
  month: number; // 1-12, filtreleme için
  bottled?: boolean; // 150+ şans: manifest şişede sergileniyor
  ribbon?: number; // şişe kurdele rengi (üye zarfında seçilen özel renk)
  sponsored?: boolean; // marka zarfı (native reklam)
  realized?: boolean; // manifest gerçekleşti: şans dondurulur, rozet taşır
  realizedDate?: string; // gerçekleşti olarak işaretlendiği tarih
  ts: number; // eklenme zamanı (timestamp — türetilmiş alanlar için)
};

// 7 haneli manifest kodu: 5 rakam + 2 harf, ayraçsız (örn. 48213KT).
// Rakam kısmı i'den deterministik türetilir — her zarfta benzersizdir
const CODE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function makeCode(i: number, rand: () => number): string {
  const digits = String(10000 + ((i * 48611) % 90000));
  const l1 = CODE_LETTERS[Math.floor(rand() * 26)];
  const l2 = CODE_LETTERS[Math.floor(rand() * 26)];
  return `${digits}${l1}${l2}`;
}

// Üye zarflarının id aralığı — duvarın kendi zarflarından ayrışması için
const MEMBER_ID_BASE = 900000;

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
const SPECIALS: EnvelopeColor[] = SPECIAL_COLORS.map((s) => s.color);

// Şişe kurdele gradyanları — özel seri renklerinin keskin geçişli halleri
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
    bottleW: Math.round(colStep * 0.78),
    bottleH: Math.round(colStep * 0.78 * 2.6), // 200:520
    // Hediye kutusu da zarf/şişe gibi sütun genişliğiyle ölçeklenir;
    // telefonda (3 sütun) bir tık daha iri durur
    giftSize: Math.round(colStep * (cols <= 3 ? 0.95 : 0.83)),
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
    // onaylı üyelerden geldiği için barajlar düşük tutuldu):
    // %68 → 0-19 (sade) • %22 → 20-49 (sticker hakkı)
    // %9 → 50-149 (parlak renk hakkı) • %1 → 150+ (şişe hakkı)
    const lr = rand();
    const luck = Math.floor(
      lr < 0.68
        ? (lr / 0.68) * 19
        : lr < 0.9
          ? 20 + ((lr - 0.68) / 0.22) * 29
          : lr < 0.99
            ? 50 + ((lr - 0.9) / 0.09) * 99
            : 150 + ((lr - 0.99) / 0.01) * 550,
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

  // 2 şişelenmiş manifest de gerçekleşmiş olsun
  let bottledRealized = 0;
  for (const env of list) {
    if (env.bottled && bottledRealized < 2) {
      env.realized = true;
      bottledRealized++;
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

type Origin = { cx: number; cy: number; w: number; h: number };

// ── Şişedeki Not — 150+ şans dilenmiş manifestler şişede sergilenir ─────
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
  realized: boolean;
  cheers: number;
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
    ribbon: env.ribbon ?? env.id % RIBBON_GRADS.length,
    realized: !!env.realized,
    cheers: env.cheers,
  };
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
    const t1 = setTimeout(() => setStage("open"), 340);
    const t2 = setTimeout(() => setNotePhase("neck"), 700);
    const t3 = setTimeout(() => setNotePhase("open"), 1010);
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
    setTimeout(() => setNotePhase("in"), 330); // içeri girer
    setTimeout(() => setStage("center"), 710); // şişe doğrulur, mantar kapanır
    setTimeout(() => setStage("origin"), 900); // şişe yerine uçar
    setTimeout(onClose, 1300);
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
          transition: "transform 300ms cubic-bezier(0.3, 0.85, 0.3, 1)",
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
            transition: "transform 490ms cubic-bezier(0.3, 0.8, 0.3, 1)",
          }}
        >
          <div className="aspect-[200/520] w-full">
            <BottleVisual
              noteOut={notePhase !== "in"}
              sticker={bottle.sticker}
              ribbon={bottle.ribbon}
              realized={bottle.realized}
              bandFs={12}
              label={
                stage === "open" ? undefined : (
                  <div className="flex flex-col items-center gap-[3px]">
                    <div className="flex items-start justify-center gap-2">
                      <div className="flex flex-col items-center gap-[2px]">
                        <p className="text-[11px] leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
                          ⭐
                        </p>
                        <p className="text-[12px] leading-none font-semibold text-[#8a6d33]">
                          {luck.toLocaleString("tr-TR")}
                        </p>
                      </div>
                      {bottle.realized && (
                        <div className="flex flex-col items-center gap-[2px]">
                          <p className="text-[11px] leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
                            👏
                          </p>
                          <p className="text-[12px] leading-none font-semibold text-[#8a6d33]">
                            {bottle.cheers.toLocaleString("tr-TR")}
                          </p>
                        </div>
                      )}
                    </div>
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
              "transform 370ms cubic-bezier(0.3, 0.8, 0.3, 1), opacity 200ms ease",
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
      className={`env-wrap absolute ${highlighted ? "env-shake" : ""}`}
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
          style={{ color: envelope.color.ink, fontSize: Math.max(14.5, 18 * fs) }}
        >
          {envelope.name}
        </span>
        {/* Gerçekleşti etiketi — SPONSORLU gibi kapak ucunda ortalı yeşil pill */}
        {envelope.realized && (
          <span
            className="absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 font-bold uppercase text-white shadow-md"
            style={{
              top: "30%",
              rotate: "-4deg",
              fontSize: Math.max(7.5, 8.5 * fs),
              letterSpacing: "0.1em",
              padding: `${2.5 * fs}px ${8 * fs}px`,
            }}
          >
            Gerçekleşti
          </span>
        )}
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
          <span
            className="pointer-events-none absolute inset-x-0 bottom-[23%] flex items-start justify-center leading-none"
            style={{ gap: 10 * fs }}
          >
            <span className="flex flex-col items-center gap-[1px]">
              <span
                className="opacity-70 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
                style={{ fontSize: Math.max(10, 9 * fs) }}
              >
                ⭐
              </span>
              <span
                className="font-medium opacity-80"
                style={{
                  color: envelope.color.ink,
                  fontSize: Math.max(11.5, 10 * fs),
                }}
              >
                {envelope.luck}
              </span>
            </span>
            {envelope.realized && (
              <span className="flex flex-col items-center gap-[1px]">
                <span
                  className="opacity-70 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
                  style={{ fontSize: Math.max(10, 9 * fs) }}
                >
                  👏
                </span>
                <span
                  className="font-medium opacity-80"
                  style={{
                    color: envelope.color.ink,
                    fontSize: Math.max(11.5, 10 * fs),
                  }}
                >
                  {envelope.cheers}
                </span>
              </span>
            )}
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


// ── Manifest Hediye Kutusu — 250+ şans ödülü ─────────────────────────────
// 250 şans barajını geçen manifest, duvarda tepeden görünen kurdeleli bir
// hediye kutusunda sergilenir. Tıklayınca zarf ve şişe gibi ekran ortasına
// uçar, kapağı yana savrulur ve içinden manifest kartı yükselir.
const GIFT_ENV = {
  name: "Magna Aliqua",
  code: "77777MD",
  luck: 268,
  date: "3 Mayıs 2026",
  manifest:
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
};


// Kutu popup'ı — zarf/şişe akışıyla aynı: duvardan ortaya uçar, kapağı
// sol üste savrulur, manifest kartı kutunun içinden yükselir
function GiftPopup({
  origin,
  onClose,
}: {
  origin: Origin;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<"origin" | "center" | "open">("origin");
  // Kapak uçarken kartın üstünde, kart yükseldikten sonra altında kalır
  const [lidZ, setLidZ] = useState(30);
  const [luck, setLuck] = useState(GIFT_ENV.luck);
  const [wished, setWished] = useState(false);
  const closingRef = useRef(false);

  const geo = useMemo(() => {
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const popW = Math.min(window.innerWidth * 0.92, 340);
    const k = popW / 340;
    // Kutu (340x450 birim) konteynerin alt kısmında: merkez farkı 90 birim.
    // Dönüş konteyner merkezinde olduğundan ofset 10°'lik açıyla döndürülerek
    // telafi edilir — kutu duvardaki pozuna birebir oturur, "tık" olmaz
    const off = (origin.w / 340) * 90;
    const rad = (10 * Math.PI) / 180;
    return {
      k,
      s: origin.w / popW,
      dx: origin.cx - vw / 2 + off * Math.sin(rad),
      dy: origin.cy - vh / 2 - off * Math.cos(rad),
    };
  }, [origin]);

  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setStage("center")),
    );
    // Varış ~300ms → kapak savrulur → kart 200ms gecikmeyle yükselir
    const t1 = setTimeout(() => setStage("open"), 340);
    const t2 = setTimeout(() => setLidZ(5), 700);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setStage("center"); // kart kutuya iner, kapak geri gelir
    setTimeout(() => setLidZ(30), 280);
    // Kapak tam oturduktan (120+420ms) sonra uçuş başlar — kapanış
    // uçuş sırasında bitmesin, yerine otururken kapak oynamasın
    setTimeout(() => setStage("origin"), 560);
    setTimeout(onClose, 890);
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
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200"
        style={{ opacity: atCenter ? 1 : 0 }}
      />
      <div
        className="fixed left-1/2 top-1/2 w-[min(92vw,340px)]"
        style={{
          transform: atCenter
            ? "translate(-50%, -50%)"
            : `translate(-50%, -50%) translate(${geo.dx}px, ${geo.dy}px) rotate(10deg) scale(${geo.s})`,
          transition: "transform 300ms cubic-bezier(0.3, 0.85, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative" style={{ height: 630 * geo.k }}>
          {/* Altın hale — kapak açılınca kutunun çevresinde belirir */}
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 transition-opacity duration-500"
            style={{
              bottom: -40 * geo.k,
              width: 560 * geo.k,
              height: 560 * geo.k,
              opacity: stage === "open" ? 1 : 0,
              background:
                "radial-gradient(circle, rgba(255,233,168,0.8) 0%, rgba(255,215,106,0.3) 55%, transparent 75%)",
            }}
          />

          {/* Manifest kartı — kutunun içinden yükselir */}
          <div
            className="absolute left-1/2 z-10 w-[88%]"
            style={{
              bottom: 40 * geo.k,
              transformOrigin: "bottom center",
              transform:
                stage === "open"
                  ? `translateX(-50%) translateY(${-60 * geo.k}px) scale(1)`
                  : "translateX(-50%) translateY(0) scale(0.45)",
              transition: `transform 320ms cubic-bezier(0.25, 0.9, 0.3, 1) ${
                stage === "open" ? "200ms" : "0ms"
              }`,
            }}
          >
            <div className="max-h-[58vh] overflow-y-auto rounded-[4px] bg-[#fffdf5] px-7 py-6 shadow-[0_16px_44px_rgba(0,0,0,0.35)] max-[520px]:px-5 max-[520px]:py-5">
              <p className="font-hand text-[26px] text-neutral-800 max-[520px]:text-[22px]">
                {GIFT_ENV.name}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400 max-[520px]:text-[9.5px]">
                  Manifest
                </p>
                <p className="font-mono text-[11px] tracking-wider text-neutral-400 max-[520px]:text-[9.5px]">
                  {GIFT_ENV.code}
                </p>
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-neutral-700 max-[520px]:text-[13px]">
                {GIFT_ENV.manifest}
              </p>
              <p className="mt-5 text-[11px] text-neutral-400">
                {GIFT_ENV.date} tarihinde eklendi
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 pt-3 text-[12px] font-medium text-neutral-500">
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
                      : "border-neutral-300 bg-white/80 text-neutral-600 hover:border-amber-400 hover:text-amber-700"
                  }`}
                >
                  {wished ? "⭐ Şans dilendi" : "☆ Şans dile"}
                </button>
              </div>
            </div>
          </div>

          {/* Gövde katmanları kapakla (GiftBoxVisual) aynı birimi kullanır:
              bu = 340k/150 — duvardaki görünümle birebir, inişte sıçrama yok */}
          {/* Kapak arasından sızan ışık — kutu kapalıyken duvardakiyle aynı */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 transition-opacity duration-500"
            style={{
              height: 450 * geo.k,
              opacity: stage === "open" ? 0 : 1,
            }}
          >
            <div
              className="absolute"
              style={{ inset: (-22 * 340 * geo.k) / 150 }}
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
          </div>

          {/* Kapak çevresinden sızan amber ışık — gövde ve kalınlığın
              üstünde (z6), kart ve kapağın altında; açılınca söner */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 transition-opacity duration-500"
            style={{
              height: 450 * geo.k,
              zIndex: 6,
              opacity: stage === "open" ? 0 : 1,
            }}
          >
            <div
              className="gift-leak absolute inset-0"
              style={{
                borderRadius: (5 * 340 * geo.k) / 150,
                boxShadow: `0 0 ${(9 * 340 * geo.k) / 150}px ${(1.5 * 340 * geo.k) / 150}px rgba(255,186,64,0.95), 0 0 ${(26 * 340 * geo.k) / 150}px ${(10 * 340 * geo.k) / 150}px rgba(255,170,45,0.5)`,
              }}
            />
          </div>

          {/* Karton kalınlığı — duvardaki kutuyla aynı: gövdeden sağa ve
              alta taşan tek parça, uçları 45° pahla gövde köşesinde biter */}
          <div
            className="absolute"
            style={{
              left: 0,
              right: (-8 * 340 * geo.k) / 150,
              bottom: (-8 * 340 * geo.k) / 150,
              height: 450 * geo.k + (8 * 340 * geo.k) / 150,
              borderRadius: (5 * 340 * geo.k) / 150,
              background: "linear-gradient(135deg, #a3865a, #7c6440)",
              clipPath: giftDepthClip(
                340 * geo.k,
                450 * geo.k,
                (340 * geo.k) / 150,
              ),
            }}
          />

          {/* Kutu gövdesi — içi, kapak kalkınca altın ışıkla dolar */}
          <div
            className="absolute inset-x-0 bottom-0 z-[5]"
            style={{
              height: 450 * geo.k,
              borderRadius: (5 * 340 * geo.k) / 150,
              background: "#a98b5c",
              boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
            }}
          >
            <div
              className="absolute rounded-[12px]"
              style={{ inset: 14 * geo.k, background: "#4a3a22" }}
            />
            <div
              className="absolute rounded-[12px] transition-opacity duration-500"
              style={{
                inset: 14 * geo.k,
                opacity: stage === "open" ? 1 : 0,
                background:
                  "radial-gradient(circle at 50% 45%, #ffe9a0 0%, #d89a52 45%, rgba(74,58,34,0) 85%)",
              }}
            />
          </div>

          {/* Kapak — açılınca sol üste savrulur, kutunun yanında bekler */}
          <div
            className="absolute bottom-0 left-0"
            style={{
              zIndex: lidZ,
              transform:
                stage === "open"
                  ? "translate(-72%, -48%) rotate(-15deg)"
                  : "none",
              transition: `transform 420ms cubic-bezier(0.3, 1.15, 0.4, 1) ${
                stage === "open" ? "0ms" : "120ms"
              }`,
            }}
          >
            <GiftBoxVisual
              size={340 * geo.k}
              name={GIFT_ENV.name}
              luck={luck}
              depth={false}
            />
          </div>

          {/* Kutudan yükselen ışıltılar */}
          {stage === "open" && (
            <>
              <span
                className="gift-spark pointer-events-none absolute left-[26%] top-[38%] text-[14px]"
                style={{ animationDelay: "0ms" }}
              >
                ✨
              </span>
              <span
                className="gift-spark pointer-events-none absolute left-[64%] top-[34%] text-[12px]"
                style={{ animationDelay: "800ms" }}
              >
                ⭐
              </span>
              <span
                className="gift-spark pointer-events-none absolute left-[46%] top-[30%] text-[11px]"
                style={{ animationDelay: "1500ms" }}
              >
                ✦
              </span>
            </>
          )}

          <button
            type="button"
            onClick={close}
            aria-label="Kapat"
            className="absolute -right-2 z-40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-xl text-neutral-600 shadow-lg transition-all hover:scale-110 max-[520px]:h-8 max-[520px]:w-8 max-[520px]:text-base"
            style={{ top: 120 * geo.k, opacity: atCenter ? 1 : 0 }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

// Şans dile'ye basınca buton etrafına saçılan yıldızlar — sabit desen,
// her yıldız kendi yönüne (--dx/--dy) uçarak döner ve söner
const WISH_STARS: {
  dx: number;
  dy: number;
  rot: number;
  size: number;
  delay: number;
  emoji: string;
}[] = [
  { dx: -54, dy: -36, rot: -40, size: 14, delay: 0, emoji: "⭐" },
  { dx: 46, dy: -50, rot: 30, size: 11, delay: 40, emoji: "✨" },
  { dx: -20, dy: -60, rot: -15, size: 12, delay: 80, emoji: "⭐" },
  { dx: 62, dy: -14, rot: 45, size: 13, delay: 20, emoji: "✨" },
  { dx: -64, dy: 6, rot: -30, size: 11, delay: 60, emoji: "✨" },
  { dx: 28, dy: 36, rot: 20, size: 12, delay: 100, emoji: "⭐" },
  { dx: -40, dy: 32, rot: -25, size: 10, delay: 50, emoji: "✨" },
  { dx: 8, dy: -68, rot: 10, size: 15, delay: 0, emoji: "⭐" },
  { dx: 68, dy: 24, rot: 35, size: 10, delay: 90, emoji: "✨" },
  { dx: -8, dy: 48, rot: -10, size: 11, delay: 70, emoji: "⭐" },
];

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
  // Şans dileme / tebrik (demo: yerel state, backend'de gerçek sayaca bağlanır)
  const [luck, setLuck] = useState(envelope.luck ?? 0);
  const [wished, setWished] = useState(false);
  const [cheers, setCheers] = useState(envelope.cheers ?? 0);
  const [cheered, setCheered] = useState(false);
  // Kapak, mektup dışarıdayken arkada (1), mektup içerideyken önde (30) durur
  const [flapZ, setFlapZ] = useState(30);
  const closingRef = useRef(false);
  // Mektup zarfa girerken üst kenarı ön cebin V yakasından görünecek kadar
  // küçülür; içerik boyu değişken olduğundan ölçek ölçülerek hesaplanır
  const letterRef = useRef<HTMLDivElement>(null);
  const [tuckScale, setTuckScale] = useState(0.5);

  // Duvardaki konumdan ekran ortasına taşınma geometrisi.
  // X ve Y ayrı ölçeklenir ki zarf, duvardaki kopyasıyla birebir çakışsın;
  // 110px'lik gövde ofseti de zarfın açısına göre döndürülerek hesaplanır.
  const geo = useMemo(() => {
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const popW = Math.min(window.innerWidth * 0.92, 460);
    // k: popup geometrisi genişlikle orantılı küçülür — mobilde de zarf
    // masaüstündeki gibi yatay dikdörtgen kalır
    const k = popW / 540;
    const sx = origin.w / popW;
    const sy = origin.h / (395 * k);
    const off = (origin.h / 395) * 82.5; // gövde merkez ofseti (ekran px)
    // Mobilde zarf orta-altta açılır; mektup orta-üste doğru çıkar
    const dropY = window.innerWidth <= 520 ? Math.round(vh * 0.1) : 0;
    const rad = (envelope.rotation * Math.PI) / 180;
    // Duvardaki süs, zarf genişliğinin ~%16'sı. Popup süsü bunun 1/sx katı
    // olur ki zarf küçülünce süs duvardakiyle aynı boyuta insin.
    return {
      k,
      dropY,
      sx,
      sy,
      stickerPx: (origin.w * (28 / 172)) / sx,
      dx: origin.cx - vw / 2 + off * Math.sin(rad),
      dy: origin.cy - vh / 2 - off * Math.cos(rad),
    };
  }, [origin, envelope.rotation]);

  // Hedef: kağıdın üst kenarı zarf içindeyken yaka üçgeninin üst bölgesinde
  // (≈230k) dursun — kapak kapanırken bu kısım görünür kalır
  useLayoutEffect(() => {
    const h = letterRef.current?.offsetHeight;
    if (h) setTuckScale(Math.min(0.85, (294 * geo.k) / h));
  }, [geo.k]);

  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setStage("center")),
    );
    // Ortaya varış ~300ms → kapak açılır → mektup 150ms gecikmeyle çıkar
    const t1 = setTimeout(() => setStage("open"), 340);
    const t2 = setTimeout(() => setFlapZ(1), 510);
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
    setTimeout(onClosingStart, 200); // komşu zarflar yer açmaya başlasın
    setTimeout(() => setFlapZ(30), 340);
    setTimeout(() => setStage("origin"), 380); // sonra zarf yerine uçar
    setTimeout(onClose, 720);
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
        className="fixed left-1/2 top-1/2 w-[min(92vw,460px)]"
        style={{
          transform: atCenter
            ? `translate(-50%, -50%) translate(0px, ${geo.dropY}px)`
            : `translate(-50%, -50%) translate(${geo.dx}px, ${geo.dy}px) rotate(${envelope.rotation}deg) scale(${geo.sx}, ${geo.sy})`,
          transition: "transform 300ms cubic-bezier(0.3, 0.85, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative"
          style={{ height: 560 * geo.k, perspective: "1100px" }}
        >
          {/* Zarf arka yüzeyi */}
          <div
            className="absolute inset-x-0 bottom-0 rounded-[6px]"
            style={{
              height: 395 * geo.k,
              ...(envelope.color.flapBg
                ? { background: envelope.color.flapBg }
                : { backgroundColor: envelope.color.dark }),
            }}
          />

          {/* Katlanma izi — kapağın menteşe çizgisi. Kapak kapalıyken (z:30)
              kapağın altında kalır, açılınca ortaya çıkar */}
          <div
            className="absolute inset-x-0 z-[5] h-px"
            style={{ top: 165 * geo.k, backgroundColor: "rgba(0,0,0,0.09)" }}
          />
          <div
            className="absolute inset-x-0 z-[5] h-[6px]"
            style={{
              top: 159 * geo.k,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.05), transparent)",
            }}
          />

          {/* Mektup — kapalıyken zarfın içine sığar, kapak açılınca büyüyerek çıkar */}
          <div
            className="absolute left-1/2 z-10 w-[86%]"
            style={{
              bottom: 36 * geo.k,
              transformOrigin: "bottom center",
              // Açıkken sabit piksel kadar yükselir: kağıdın ALT kenarı hep
              // aynı hizada durur, kağıt metin kadar uzar (boş alan kalmaz)
              transform:
                stage === "open"
                  ? `translateX(-50%) translateY(${-319 * geo.k}px) scale(1)`
                  : `translateX(-50%) translateY(0) scale(${tuckScale})`,
              transition: `transform 320ms cubic-bezier(0.25, 0.9, 0.3, 1) ${
                stage === "open" ? "150ms" : "0ms"
              }`,
            }}
          >
            <div
              ref={letterRef}
              className="max-h-[62vh] overflow-y-auto rounded-[4px] bg-[#fffdf5] px-8 py-7 shadow-[0_16px_44px_rgba(0,0,0,0.35)] max-[520px]:px-5 max-[520px]:py-5"
            >
              {envelope.sponsored ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/petimemama.png"
                  alt="Petimemama"
                  className="h-9 object-contain"
                />
              ) : (
                <p className="font-hand text-[26px] text-neutral-800 max-[520px]:text-[22px]">
                  {envelope.name}
                </p>
              )}
              <div className="mt-1 flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400 max-[520px]:text-[9.5px]">
                  {envelope.sponsored ? "Sponsorlu • Sürpriz" : "Manifest"}
                </p>
                <p className="flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-neutral-400 max-[520px]:text-[9.5px]">
                  {envelope.code}
                  <CopyBtn text={envelope.code} />
                </p>
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-neutral-700 max-[520px]:text-[13px]">
                {envelope.manifest}
              </p>
            </div>
          </div>

          {/* Zarf ön cebi (mektubun alt kısmını içine alır).
              translateZ(0): mobil tarayıcıda clip-path'in animasyon sırasında
              düşmemesi için kendi GPU katmanına zorlanır */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 rounded-[6px] shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
            style={{
              height: 395 * geo.k,
              clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)",
              transform: "translateZ(0)",
              ...(envelope.color.bodyBg
                ? { background: envelope.color.bodyBg }
                : { backgroundColor: envelope.color.base }),
            }}
          />
          {/* Parlak yüzey — özel seri, ön cep üzerinde */}
          {envelope.color.gloss && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[21] rounded-[6px]"
              style={{
                height: 395 * geo.k,
                clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)",
                transform: "translateZ(0)",
                background:
                  "linear-gradient(115deg, rgba(255,255,255,0.22) 8%, rgba(255,255,255,0.06) 30%, transparent 46%)",
              }}
            />
          )}

          {/* Eklenme tarihi + görüntülenme — zarf ön yüzü, sol alt */}
          <div
            className="absolute bottom-[16px] left-[22px] z-30 flex flex-col items-start gap-1 text-xs font-medium transition-opacity duration-200 max-[520px]:bottom-[12px] max-[520px]:left-[14px] max-[520px]:gap-0.5"
            style={{
              color: envelope.color.ink,
              opacity: stage === "open" ? 0.85 : 0,
              pointerEvents: "none",
            }}
          >
            {envelope.realized && (
              <>
                <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white shadow-sm max-[520px]:px-2.5 max-[520px]:py-0.5 max-[520px]:text-[8.5px]">
                  Gerçekleşti
                </span>
                <span className="flex items-center gap-1.5 text-[11px] opacity-90 max-[520px]:text-[9.5px] max-[520px]:gap-1">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 max-[520px]:h-3.5 max-[520px]:w-3.5"
                  >
                    <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    <path d="m16 19 2 2 4-4" />
                  </svg>
                  {envelope.realizedDate}&apos;da &quot;gerçekleşti&quot;
                  işaretlendi
                </span>
              </>
            )}
            <span className="flex items-center gap-1.5 text-[11px] opacity-90 max-[520px]:text-[9.5px] max-[520px]:gap-1">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 max-[520px]:h-3.5 max-[520px]:w-3.5"
              >
                <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                <path d="M19 16v6" />
                <path d="M16 19h6" />
              </svg>
              {envelope.date} tarihinde eklendi
            </span>
            {!envelope.realized && (
              <span className="h-px w-full bg-current opacity-25" />
            )}
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

          {/* Sağ alt — normal zarfta şans dile; gerçekleşende tebrik akışı */}
          <div
            className="absolute bottom-[14px] right-[20px] z-30 flex flex-col items-end gap-1.5 transition-opacity duration-200"
            style={{
              opacity: stage === "open" && !envelope.sponsored ? 1 : 0,
              pointerEvents:
                stage === "open" && !envelope.sponsored ? "auto" : "none",
            }}
          >
            <span
              className="flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-0.5 text-xs font-medium shadow-sm backdrop-blur-[1px] max-[520px]:px-2 max-[520px]:text-[10px]"
              style={{
                // Beyaz pill üstünde açık mürekkepler okunmaz (özel seri)
                color: envelope.color.gloss ? "#525252" : envelope.color.ink,
              }}
            >
              <span className="text-[11px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
                ⭐
              </span>
              <b className="font-semibold">{luck}</b> kişi şans{" "}
              {envelope.realized ? "dilemişti" : "diledi"}
            </span>
            {envelope.realized ? (
              <>
                <span
                  className="flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-0.5 text-xs font-medium shadow-sm backdrop-blur-[1px] max-[520px]:px-2 max-[520px]:text-[10px]"
                  style={{
                    color: envelope.color.gloss
                      ? "#525252"
                      : envelope.color.ink,
                  }}
                >
                  <span className="text-[11px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
                    👏
                  </span>
                  <b className="font-semibold">{cheers}</b> kişi tebrik etti
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (cheered) return;
                    setCheered(true);
                    setCheers((n) => n + 1);
                  }}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm transition-all max-[520px]:px-3 max-[520px]:py-1 max-[520px]:text-xs ${
                    cheered
                      ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                      : "border-neutral-200 bg-white/90 text-neutral-600 hover:border-emerald-300 hover:text-emerald-600"
                  }`}
                >
                  <span
                    className={`text-base transition-transform duration-300 ${
                      cheered ? "scale-125" : ""
                    }`}
                  >
                    👏
                  </span>
                  Tebrik et
                </button>
              </>
            ) : (
              <span className="relative">
                {wished && (
                  <span className="pointer-events-none absolute left-1/2 top-1/2 z-10">
                    {WISH_STARS.map((s, i) => (
                      <span
                        key={i}
                        className="wish-star absolute left-0 top-0 leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
                        style={
                          {
                            "--dx": `${s.dx}px`,
                            "--dy": `${s.dy}px`,
                            "--rot": `${s.rot}deg`,
                            fontSize: s.size,
                            animationDelay: `${s.delay}ms`,
                          } as CSSProperties
                        }
                      >
                        {s.emoji}
                      </span>
                    ))}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (wished) return;
                    setWished(true);
                    setLuck((n) => n + 1);
                  }}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm transition-all max-[520px]:px-3 max-[520px]:py-1 max-[520px]:text-xs ${
                    wished
                      ? "wish-yay border-amber-300 bg-amber-50 text-amber-600"
                      : "wish-btn border-neutral-200 bg-white/90 text-neutral-600 hover:border-amber-300 hover:text-amber-600"
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
              </span>
            )}
          </div>

          {/* Kapak — ortaya gelince yukarı açılır, kapanınca geri iner.
              Ucu, ön cebin V çizgisinin altına iner: kapalıyken aralık kalmaz */}
          {/* Dönüş dış katmanda, üçgen kesim iç katmanda: mobil tarayıcılarda
              clip-path + 3D animasyon aynı elemanda takılıyor */}
          <div
            className="absolute inset-x-0"
            style={{
              top: 165 * geo.k,
              height: 215 * geo.k,
              transformOrigin: "top center",
              transform: stage === "open" ? "rotateX(180deg)" : "rotateX(0deg)",
              // Açılırken hemen, kapanırken mektup içeri girdikten sonra
              transition: `transform 270ms ease ${
                stage === "open" ? "0ms" : "150ms"
              }`,
              zIndex: flapZ,
              willChange: "transform",
            }}
          >
            <div
              className="h-full w-full rounded-t-[6px]"
              style={{
                ...(envelope.color.flapBg
                  ? { background: envelope.color.flapBg }
                  : { backgroundColor: envelope.color.dark }),
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                transform: "translateZ(0)",
              }}
            />
          </div>

          {/* Süs — duvardaki zarfla aynı yerde, aynı açıyla */}
          {envelope.sticker && (
            <span
              className="pointer-events-none absolute z-[35] leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]"
              style={{
                left: `${envelope.sticker.left}%`,
                top: 380 * geo.k,
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
            className="absolute -right-2 z-40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-xl text-neutral-600 shadow-lg transition-all hover:scale-110 max-[520px]:h-8 max-[520px]:w-8 max-[520px]:text-base"
            style={{ top: 95 * geo.k, opacity: stage === "open" ? 1 : 0 }}
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
  const baseEnvelopes = useMemo(buildEnvelopes, []);

  // Üyelerin panelden yazdığı manifestler duvara eklenir (demo:
  // localStorage'dan; canlıda backend'den gelir). Baraj kuralları duvarla
  // aynı uygulanır: 20+ sticker, 50+ özel renk, 150+ şişe
  const [memberEnvs, setMemberEnvs] = useState<Envelope[]>([]);
  useEffect(() => {
    const list: Envelope[] = [];
    let id = MEMBER_ID_BASE;
    for (const u of getUsers()) {
      for (const m of u.manifests) {
        const seed = mulberry32(m.ts % 2147483647 || 1);
        const pc = PANEL_COLORS[m.colorIdx % PANEL_COLORS.length];
        const d = new Date(m.ts);
        const env: Envelope = {
          id: id++,
          name: m.name,
          manifest: m.manifest,
          jx: seed(),
          jy: seed(),
          zr: Math.floor(seed() * 4),
          rotation: -28 + seed() * 56,
          color: { base: pc.base, dark: pc.dark, ink: pc.ink },
          luck: m.luck,
          cheers: m.realized ? m.cheers : 0,
          views: m.views,
          code: m.code,
          date: m.date,
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          realized: m.realized,
          realizedDate: m.realizedDate,
          ts: m.ts,
        };
        // Sticker'ı üye panelden kendisi seçer; seçmediyse zarf süssüz kalır
        if (m.sticker)
          env.sticker = {
            emoji: m.sticker,
            left: seed() < 0.5 ? 24 : 76,
            rotation: -25 + seed() * 50,
          };
        // Özel rengi (50+ hak) üye panelden kendisi seçer; şişe kurdelesi
        // de aynı renk ailesini kullanır
        if (m.special != null) {
          env.color = SPECIALS[m.special % SPECIALS.length];
          env.ribbon = m.special;
        }
        // Şişeye koyma (150+ hak) da üyenin onayıyla olur
        if (m.bottled) env.bottled = true;
        list.push(env);
      }
    }
    setMemberEnvs(list);
  }, []);

  const envelopes = useMemo(
    () => [...baseEnvelopes, ...memberEnvs],
    [baseEnvelopes, memberEnvs],
  );
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
  // Hediye kutusu popup'ı (duvardaki kutunun uçuş başlangıç konumu)
  const [giftOrigin, setGiftOrigin] = useState<Origin | null>(null);
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

  // Şişedeki manifestler (150+ şans)
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

  // Aktif filtreye uyan manifest sayısı (şişeler dahil)
  const filteredCount = useMemo(
    () =>
      envelopes.filter(
        (e) =>
          (!fYear || e.year === fYear) && (!fMonth || e.month === fMonth),
      ).length,
    [envelopes, fYear, fMonth],
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

    // Günlük Fisher-Yates karıştırması — yalnızca duvarın kendi zarfları.
    // Üye zarfları karışıma girmez: yeni manifest eklendiğinde duvar
    // baştan karılmaz, aşağıda kendi sabit slotlarına sokulurlar
    const shuffleRand = mulberry32(daySeed);
    const memberOrder = visible.filter((e) => e.id >= MEMBER_ID_BASE);
    let order = visible.filter((e) => e.id < MEMBER_ID_BASE);
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

    // Üye zarfı, koduna bağlı sabit rastgele slota sokulur: o noktada yer
    // açılır, yalnızca sonrasındakiler bir hücre kayar — duvar karılmaz
    for (const m of memberOrder) {
      const slotRand = mulberry32(m.ts % 2147483647 || 1);
      const at = Math.floor(slotRand() * (order.length + 1));
      order.splice(at, 0, m);
    }

    const pos = new Map<number, Pos>();
    order.forEach((env, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      pos.set(env.id, {
        // Serpme payı iki yöne dağılır ki sol kenar da sağ gibi dolu görünsün
        x: 2 + col * m.colStep + (env.jx - 0.5) * m.jx,
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

    // Hediye kutusu bölgesi (duvar üstü, ortada; 10° dönüşün bbox'ı + pay).
    // Şişeler bu bölgeye giremez: çakışan şişe kutunun yanına, dar ekranda
    // altına taşınır — kutuyla şişe üst üste binip fiziği bozmasın
    // Korunan bölge kutu boyutundan türetilir (10° dönüş bbox'ı + pay)
    const giftW = Math.round(m.giftSize * 1.27);
    const giftH = Math.round(m.giftSize * 1.55);
    const gcx = wrapperW / 2;
    const gcy = 150 + Math.round(m.giftSize * 0.66);
    for (const bb of bottles) {
      const margin = 30;
      const overlapX =
        bb.x < gcx + giftW / 2 + margin &&
        bb.x + m.bottleW > gcx - giftW / 2 - margin;
      const overlapY =
        bb.y < gcy + giftH / 2 + margin &&
        bb.y + m.bottleH > gcy - giftH / 2 - margin;
      if (!(overlapX && overlapY)) continue;
      const leftX = gcx - giftW / 2 - m.bottleW - margin;
      const rightX = gcx + giftW / 2 + margin;
      const cand = bb.x + m.bottleW / 2 < gcx ? leftX : rightX;
      if (cand >= 0 && cand <= wrapperW - m.bottleW) bb.x = cand;
      else bb.y = gcy + giftH / 2 + margin;
    }

    const rx = m.bottleW / 2 + m.envW / 2 + 8;
    const ry = m.bottleH / 2 + m.envH / 2 + 12;
    // Kutu çevresinde zarflara nefes payı: elips içine düşen zarf dışarı itilir
    const grx = giftW / 2 + m.envW / 2 + 18;
    const gry = giftH / 2 + m.envH / 2 + 18;
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
      {
        let dx = ex - gcx;
        let dy = ey - gcy;
        const d = Math.hypot(dx / grx, dy / gry);
        if (d < 1) {
          const len = Math.hypot(dx, dy) || 1;
          dx /= len;
          dy /= len;
          const push = (1 - d) * m.envW * 0.34; // kutu az ezsin, biraz rahatla
          p.x += dx * push;
          p.y += dy * push;
        }
      }
      // Kenarlarda simetrik hafif taşmaya izin ver (iki taraf da dolu dursun)
      p.x = Math.min(wrapperW - m.envW + 8, Math.max(-8, p.x));
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

  // Kodu bul, konumuna kaydır ve zarfı parlat — arama formu ve panelden
  // "Duvara As" yönlendirmesi (?kod=) ortak kullanır
  const jumpToCode = (raw: string) => {
    const q = raw.trim().toUpperCase().replace(/[\s-]/g, "");
    if (!q) return;
    // Tam kod ("48213KT") veya yalnızca 5 rakamlı kısmı kabul edilir
    const num = /^\d{1,5}$/.test(q) ? q : null;
    const env = envelopes.find(
      (en) =>
        en.code === q || (num && en.code.slice(0, 5) === num.padStart(5, "0")),
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    jumpToCode(query);
  };

  // Panelden "Duvara As" ile gelindiyse (?kod=XXXXX): kod arama kutusuna
  // yazılır, zarf bulunup vurgulanır. Üye zarfları yüklendikten sonra çalışır
  const jumpedRef = useRef(false);
  useEffect(() => {
    if (jumpedRef.current) return;
    const kod = new URLSearchParams(window.location.search).get("kod");
    if (!kod) {
      jumpedRef.current = true;
      return;
    }
    if (!memberEnvs.length) return;
    jumpedRef.current = true;
    setQuery(kod.toUpperCase());
    // Yerleşim hesaplanıp zarf duvara oturduktan sonra kaydır
    const t = setTimeout(() => jumpToCode(kod), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberEnvs]);

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
    if (selected || bottleOpen || giftOrigin) {
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
  }, [selected, bottleOpen, giftOrigin]);

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

      {/* Header — ortak bileşen; arama paneli children olarak asılır */}
      <SiteHeader>

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
            <span className="max-[520px]:hidden">Ara</span>
          </button>
          <span className="mx-2 h-5 w-px shrink-0 bg-neutral-200" />
          <select
            value={fYear}
            onChange={(e) => setFYear(Number(e.target.value))}
            className="cursor-pointer bg-transparent py-1 text-sm text-neutral-600 outline-none"
            aria-label="Yıl filtresi"
          >
            <option value={0}>Tüm yıllar</option>
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
          {/* Seçime uyan manifest sayısı — filtrelerin hemen altında */}
          <span className="absolute right-2 top-[calc(100%+6px)] whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-neutral-500 shadow-sm backdrop-blur">
            {filteredCount.toLocaleString("tr-TR")} manifest
          </span>
        </form>
      </SiteHeader>

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
          {/* Manifest Kutusu — 250+ şans dilenen manifest, duvarın üstünde
              tepeden görünen kurdeleli hediye kutusunda sergilenir */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: 150,
              zIndex: 1400,
              visibility: giftOrigin ? "hidden" : "visible",
            }}
          >
            <button
              type="button"
              aria-label={`${GIFT_ENV.name} — hediye kutusundaki manifesti oku`}
              className="block cursor-pointer touch-manipulation transition-transform duration-200 hover:scale-110"
              onClick={(e) => {
                const el = e.currentTarget;
                const r = el.getBoundingClientRect();
                // Genişlik döndürülmemiş halinden alınır (bbox açıyla büyür)
                setGiftOrigin({
                  cx: r.left + r.width / 2,
                  cy: r.top + r.height / 2,
                  w: el.offsetWidth,
                  h: el.offsetHeight,
                });
              }}
            >
              {/* Duvarda hafif açıyla durur — popup uçuşu da bu açıdan başlar */}
              <div style={{ transform: "rotate(10deg)" }}>
                <GiftBoxVisual
                  size={layout.giftSize}
                  name={GIFT_ENV.name}
                  luck={GIFT_ENV.luck}
                  glow
                />
              </div>
            </button>
          </div>

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

          {/* Şişedeki Notlar — 150+ şans dilenmiş manifestler */}
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
                ribbon={b.env.ribbon ?? b.env.id % RIBBON_GRADS.length}
                sheenDelay={i * 0.9}
                realized={b.env.realized}
                bandFs={Math.max(8, 10 * (layout.bottleW / 160))}
                label={
                  <div className="flex flex-col items-center gap-[3px]">
                    <div
                      className="flex items-start justify-center"
                      style={{ gap: 8 * (layout.bottleW / 160) }}
                    >
                      <div className="flex flex-col items-center gap-[2px]">
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
                      </div>
                      {b.env.realized && (
                        <div className="flex flex-col items-center gap-[2px]">
                          <p
                            className="leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
                            style={{ fontSize: 11 * (layout.bottleW / 160) }}
                          >
                            👏
                          </p>
                          <p
                            className="leading-none font-semibold text-[#8a6d33]"
                            style={{ fontSize: 12 * (layout.bottleW / 160) }}
                          >
                            {b.env.cheers.toLocaleString("tr-TR")}
                          </p>
                        </div>
                      )}
                    </div>
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

      {giftOrigin && (
        <GiftPopup origin={giftOrigin} onClose={() => setGiftOrigin(null)} />
      )}

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
