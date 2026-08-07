"use client";

import {
  memo,
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
import { currentUser, PANEL_COLORS, type MemberManifest } from "./lib/auth";
import {
  BottleVisual,
  GiftBoxVisual,
  giftDepthClip,
  RIBBON_GRADS,
} from "./components/RewardVisuals";
import {
  mulberry32,
  REPORT_REASONS,
  SPECIALS,
  SPONSOR_FONTS,
  sponsorColor,
  type Envelope,
} from "./lib/wallData";
import {
  fetchReportedCodes,
  fetchSettings,
  fetchWallMeta,
  fetchWallSlice,
  findWallCode,
  react as apiReact,
  submitReport,
  trackSponsor,
  type WallMeta,
} from "./lib/api";

// Site Ağustos 2026'da yayına çıktı — lansman yılında önceki ayların
// filtrede görünmesi anlamsız olur (o aylara ait manifest olamaz)
const LAUNCH_YEAR = 2026;
const LAUNCH_MONTH = 8;

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
  realizedDate?: string;
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
    realizedDate: env.realizedDate,
    cheers: env.cheers,
  };
}

// Şans dileği backend'e yazılır (demo zarflarında sunucu no-op döner,
// sayaç oturumluk kalır) — panel ödül akışları duvardan test edilebilsin
function persistLuck(code: string, delta: number) {
  apiReact(code, "luck", delta);
}

// Tebrik de backend'e yazılır (demo zarflarında no-op)
function persistCheer(code: string, delta: number) {
  apiReact(code, "cheer", delta);
}

// Görüntülenme: aynı cihaz aynı manifesti günde 1 kez sayar — zarfı
// aç-kapa yaparak sayaç şişirilemez. Sayılan artışı (0/1) döndürür;
// üye manifestine kalıcı yazılır (demo zarflarında oturumluk kalır)
const VIEWED_KEY = "mw_viewed";
function registerView(code: string, notify = true): number {
  try {
    const day = new Date().toLocaleDateString("sv-SE"); // YYYY-AA-GG (yerel)
    let rec: { day: string; codes: Record<string, 1> };
    try {
      rec = JSON.parse(localStorage.getItem(VIEWED_KEY) ?? "");
    } catch {
      rec = { day, codes: {} };
    }
    if (rec.day !== day || !rec.codes) rec = { day, codes: {} };
    if (rec.codes[code]) return 0;
    rec.codes[code] = 1;
    localStorage.setItem(VIEWED_KEY, JSON.stringify(rec));
    if (notify) apiReact(code, "view"); // üye manifestinde kalıcı; demo no-op
    return 1;
  } catch {
    return 0;
  }
}

// Kutu popup'ına giden veri — LetterCard'ın beklediği ortak biçim
function toGiftData(env: Envelope): LetterInfo {
  return {
    name: env.name,
    code: env.code,
    manifest: env.manifest,
    date: env.date,
    views: env.views,
    luck: env.luck,
    realized: !!env.realized,
    realizedDate: env.realizedDate,
    cheers: env.cheers,
  };
}

function BottlePopup({
  bottle,
  origin,
  onClose,
  onWish,
  onCheer,
}: {
  bottle: BottleData;
  origin: Origin;
  onClose: () => void;
  onWish?: (delta: number) => void;
  onCheer?: (delta: number) => void;
}) {
  const [stage, setStage] = useState<"origin" | "center" | "open">("origin");
  // Notun yolculuğu: şişenin içinde → boğazda (rulo) → ağzın üstünde açık
  const [notePhase, setNotePhase] = useState<"in" | "neck" | "open">("in");
  const closingRef = useRef(false);

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
                          {bottle.luck.toLocaleString("tr-TR")}
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

        {/* Not — yatık şişenin ağzından kıvrılarak çıkar, ekranın ortasında
            açılır. Kağıt, zarftan çıkan mektupla aynı biçim ve genişlikte */}
        <div
          className="absolute left-1/2 top-[46%] z-30 w-[min(92vw,460px)]"
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
          <LetterCard info={bottle} onWish={onWish} onCheer={onCheer} />
          {/* Mobil kapat — mektubun dışında, sağ üst köşesinde */}
          <button
            type="button"
            onClick={close}
            aria-label="Kapat"
            className="absolute -top-11 right-0 z-40 hidden h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-lg text-neutral-600 shadow-lg max-[520px]:flex"
            style={{ opacity: notePhase === "open" ? 1 : 0 }}
          >
            ×
          </button>
          {/* Masaüstü kapat — mektubun sağ üst köşesinin tam üstünde */}
          <button
            type="button"
            onClick={close}
            className="absolute -right-5 -top-5 z-40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-xl text-neutral-600 shadow-lg transition-all hover:scale-110 max-[520px]:hidden"
            style={{ opacity: notePhase === "open" ? 1 : 0 }}
            aria-label="Kapat"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

type Pos = { x: number; y: number; z: number };

// memo: duvarda ~300 kart var; alakasız state değişimlerinde (popup açma,
// vurgu, dilim gelişi) yalnızca props'u değişen kart yeniden çizilir
const EnvelopeCard = memo(function EnvelopeCard({
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
        // Sponsor zarfı her zaman komşularının üstünde durur (vurgu hariç)
        zIndex: highlighted ? 1460 : envelope.sponsored ? 1000 : pos.z,
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
        {/* Rumuz — sponsor zarfında logo altı yazı, seçilen fontla */}
        <span
          className="absolute inset-x-0 bottom-[4%] truncate px-1 text-center font-hand leading-none font-semibold"
          style={{
            color: envelope.color.ink,
            fontSize: Math.max(14.5, 18 * fs),
            ...(envelope.sponsored && envelope.sponsor
              ? { fontFamily: SPONSOR_FONTS[envelope.sponsor.subFont].css }
              : {}),
          }}
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
        {/* Sponsor zarfı: kampanya logosu + etiket pill'i (konum/boyut
            admin panelden ayarlanır) */}
        {envelope.sponsored && envelope.sponsor && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={envelope.sponsor.logo}
              alt={envelope.sponsor.brand}
              draggable={false}
              className="pointer-events-none absolute left-1/2 top-[71%] -translate-x-1/2 -translate-y-1/2 select-none object-contain"
              style={{ width: `${envelope.sponsor.logoW}%` }}
            />
            <span
              className="absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full font-bold uppercase shadow-md"
              style={{
                top: `${envelope.sponsor.labelY}%`,
                rotate: "-4deg",
                fontSize: 8.5 * fs,
                letterSpacing: "0.12em",
                padding: `${2.5 * fs}px ${8 * fs}px`,
                backgroundColor: envelope.sponsor.labelBg,
                color: envelope.sponsor.labelColor,
              }}
            >
              {envelope.sponsor.label}
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
},
// onOpen her render'da yeni closure olur — karşılaştırmaya girmez
(a, b) =>
  a.envelope === b.envelope &&
  a.pos === b.pos &&
  a.envW === b.envW &&
  a.hidden === b.hidden &&
  a.offset === b.offset &&
  a.highlighted === b.highlighted);


// ── Manifest Hediye Kutusu — 250+ şans ödülü ─────────────────────────────
// 250 şans barajını geçen manifest, duvarda tepeden görünen kurdeleli bir
// hediye kutusunda sergilenir. Tıklayınca zarf ve şişe gibi ekran ortasına
// uçar, kapağı yana savrulur ve içinden manifest kağıdı yükselir.

// Kutu popup'ı — zarf/şişe akışıyla aynı: duvardan ortaya uçar, kapağı
// sol üste savrulur, mektup kağıdı kutunun içinden yükselir
function GiftPopup({
  gift,
  rot,
  sticker,
  stickerRot,
  origin,
  onClose,
  onWish,
  onCheer,
}: {
  gift: LetterInfo;
  rot: number; // duvardaki kutunun açısı — uçuş bu açıdan başlar
  sticker?: string; // kapak üstündeki süs — duvardakiyle birebir
  stickerRot?: number;
  origin: Origin;
  onClose: () => void;
  onWish?: (delta: number) => void;
  onCheer?: (delta: number) => void;
}) {
  const [stage, setStage] = useState<"origin" | "center" | "open">("origin");
  // Kapak uçarken kağıdın üstünde, kağıt yükseldikten sonra altında kalır
  const [lidZ, setLidZ] = useState(30);
  const closingRef = useRef(false);

  const geo = useMemo(() => {
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const popW = Math.min(window.innerWidth * 0.92, 340);
    const k = popW / 340;
    // Kutu (340x450 birim) konteynerin alt kısmında: merkez farkı 90 birim.
    // Dönüş konteyner merkezinde olduğundan ofset kutunun duvardaki açısıyla
    // döndürülerek telafi edilir — kutu pozuna birebir oturur, "tık" olmaz
    const off = (origin.w / 340) * 90;
    const rad = (rot * Math.PI) / 180;
    return {
      k,
      s: origin.w / popW,
      dx: origin.cx - vw / 2 + off * Math.sin(rad),
      dy: origin.cy - vh / 2 - off * Math.cos(rad),
    };
  }, [origin, rot]);

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
            : `translate(-50%, -50%) translate(${geo.dx}px, ${geo.dy}px) rotate(${rot}deg) scale(${geo.s})`,
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

          {/* Mektup kağıdı — kutunun içinden yükselir; zarftan çıkan
              mektupla aynı biçimde, zarf popup'ı genişliğinde */}
          <div
            className="absolute left-1/2 z-10 w-[min(92vw,460px)]"
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
            <LetterCard info={gift} onWish={onWish} onCheer={onCheer} />
            {/* Mobil kapat — mektubun dışında, sağ üst köşesinde */}
            <button
              type="button"
              onClick={close}
              aria-label="Kapat"
              className="absolute -top-11 right-0 z-40 hidden h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-lg text-neutral-600 shadow-lg max-[520px]:flex"
              style={{ opacity: stage === "open" ? 1 : 0 }}
            >
              ×
            </button>
            {/* Masaüstü kapat — mektubun sağ üst köşesinin tam üstünde */}
            <button
              type="button"
              onClick={close}
              className="absolute -right-5 -top-5 z-40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-xl text-neutral-600 shadow-lg transition-all hover:scale-110 max-[520px]:hidden"
              style={{ opacity: stage === "open" ? 1 : 0 }}
              aria-label="Kapat"
            >
              ×
            </button>
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
              name={gift.name}
              luck={gift.luck}
              sticker={sticker}
              stickerRot={stickerRot}
              realized={gift.realized}
              cheers={gift.cheers}
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

// Tebrik et — basınca saçılan alkış/konfeti (şans yıldızlarıyla aynı düzen)
const CHEER_STARS: typeof WISH_STARS = [
  { dx: -54, dy: -36, rot: -40, size: 14, delay: 0, emoji: "👏" },
  { dx: 46, dy: -50, rot: 30, size: 11, delay: 40, emoji: "🎉" },
  { dx: -20, dy: -60, rot: -15, size: 12, delay: 80, emoji: "👏" },
  { dx: 62, dy: -14, rot: 45, size: 13, delay: 20, emoji: "🎉" },
  { dx: -64, dy: 6, rot: -30, size: 11, delay: 60, emoji: "🎊" },
  { dx: 28, dy: 36, rot: 20, size: 12, delay: 100, emoji: "👏" },
  { dx: -40, dy: 32, rot: -25, size: 10, delay: 50, emoji: "🎉" },
  { dx: 8, dy: -68, rot: 10, size: 15, delay: 0, emoji: "👏" },
  { dx: 68, dy: 24, rot: 35, size: 10, delay: 90, emoji: "🎊" },
  { dx: -8, dy: 48, rot: -10, size: 11, delay: 70, emoji: "🎉" },
];

// Basınca buton etrafına saçılan emoji demeti — şans ve tebrikte ortak
function BurstStars({ stars }: { stars: typeof WISH_STARS }) {
  return (
    <span className="pointer-events-none absolute left-1/2 top-1/2 z-10">
      {stars.map((s, i) => (
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
  );
}

// ── Bildir — manifesti şikâyet etme akışı ────────────────────────────────
// Butona basınca 4 sebep pill'i yukarı fışkırır; seçilen sebep localStorage'a
// yazılır ve admin paneldeki "Bildirilenler" sekmesine düşer
function ReportButton({
  code,
  name,
  manifest,
  below = false,
}: {
  code: string;
  name: string;
  manifest: string;
  // true: seçenekler butonun (zarfın) altında yatay sırada açılır (ss66);
  // false: butonun üstünde dikey sırada (mektup kağıdı içinde)
  below?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reported, setReported] = useState(false);
  useEffect(() => {
    fetchReportedCodes().then((codes) => setReported(codes.includes(code)));
  }, [code]);

  if (reported)
    return (
      <span className="pointer-events-auto mt-0.5 flex items-center gap-1.5 opacity-70">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Bildirildi
      </span>
    );

  const pills = REPORT_REASONS.map((r, i) => (
    <button
      key={r}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        void submitReport({ code, name, manifest, reason: r }).catch(() => {});
        setReported(true);
        setOpen(false);
      }}
      className="report-pop cursor-pointer whitespace-nowrap rounded-full border border-neutral-200 bg-white/95 px-2.5 py-1 text-[10px] font-medium text-neutral-600 shadow-sm transition-colors hover:border-red-300 hover:text-red-500"
      style={{ animationDelay: `${i * 45}ms` }}
    >
      {r}
    </button>
  ));

  return (
    <span className="pointer-events-auto relative mt-0.5 flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="flex cursor-pointer items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" x2="4" y1="22" y2="15" />
        </svg>
        Bildir
      </button>
      {/* Zarf popup'ında zarfın altında yatay sıra (ss66); mektup kağıdında
          butonun üstünde kompakt 2×2 ızgara — dar sütunda satır düzenini
          bozmadan, kaydırma alanının içinde kalır */}
      {open && below && (
        <span className="absolute left-0 top-full z-20 mt-6 flex items-center gap-1.5">
          {pills}
        </span>
      )}
      {open && !below && (
        <span className="absolute bottom-full left-0 z-20 mb-1.5 grid w-max grid-cols-2 gap-1.5">
          {pills}
        </span>
      )}
    </span>
  );
}

// ── Ortak mektup kağıdı — şişeden ve kutudan çıkan kağıtların tek biçimi ──
// Zarftan çıkan mektupla aynı format, genişlik zarf popup'ı kadar: rumuz +
// kod + metin;
// yazının sonunda zarf ön yüzündeki dizilimin aynısı — solda tarihler ve
// görüntülenme, sağda şans sayısı + şans dile (gerçekleşende tebrik akışı)
type LetterInfo = {
  name: string;
  code: string;
  manifest: string;
  date: string;
  views: number;
  luck: number;
  realized?: boolean;
  realizedDate?: string;
  cheers?: number;
};

function LetterCard({
  info,
  onWish,
  onCheer,
}: {
  info: LetterInfo;
  onWish?: (delta: number) => void; // dilek sayısını kalıcılaştırma kancası
  onCheer?: (delta: number) => void; // tebrik sayısını kalıcılaştırma kancası
}) {
  // Şans dileme / tebrik (demo: yerel state, backend'de gerçek sayaca bağlanır)
  const [luck, setLuck] = useState(info.luck);
  const [wished, setWished] = useState(false);
  const [cheers, setCheers] = useState(info.cheers ?? 0);
  const [cheered, setCheered] = useState(false);
  // Test modu (admin panelden): şans sınırsız ve +10'ar dilenir
  const [testMode, setTestMode] = useState(false);
  useEffect(() => {
    fetchSettings().then((s) => setTestMode(s.testMode));
  }, []);
  // Şans/tebrik yalnızca üye girişiyle dilenebilir (test modu hariç);
  // girişsiz tıklamada doğrudan üye giriş ekranına yönlendirilir
  const [member, setMember] = useState(false);
  useEffect(() => {
    currentUser().then((u) => setMember(!!u));
  }, []);
  return (
    <div className="max-h-[62vh] overflow-y-auto rounded-[4px] bg-[#fffdf5] px-8 py-7 shadow-[0_16px_44px_rgba(0,0,0,0.35)] max-[520px]:px-5 max-[520px]:py-5">
      <p className="font-hand text-[26px] text-neutral-800 max-[520px]:text-[22px]">
        {info.name}
      </p>
      <div className="mt-1 flex items-center justify-end">
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-neutral-400 max-[520px]:text-[8px]">
            Zarf kodu
          </span>
          <p className="flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-neutral-400 max-[520px]:text-[9.5px]">
            {info.code}
            <CopyBtn text={info.code} />
          </p>
        </div>
      </div>
      <p className="mt-4 text-[14px] leading-relaxed text-neutral-700 max-[520px]:text-[13px]">
        {info.manifest}
      </p>

      {/* Alt bilgi — solda tarihler + görüntülenme, sağda şans/tebrik */}
      <div className="mt-6 flex items-end justify-between gap-3 border-t border-neutral-200 pt-3.5">
        <div className="flex flex-col items-start gap-1 text-xs font-medium text-neutral-500 max-[520px]:gap-0.5">
          {info.realized && (
            <span className="mb-0.5 flex flex-col items-start gap-1 rounded-lg border border-emerald-300/70 bg-emerald-50/60 px-2.5 py-1.5 max-[520px]:px-2 max-[520px]:py-1">
              <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white shadow-sm max-[520px]:px-2.5 max-[520px]:py-0.5 max-[520px]:text-[8.5px]">
                Gerçekleşti
              </span>
              <span className="flex items-center gap-1.5 text-[11px] opacity-90 max-[520px]:gap-1 max-[520px]:text-[9.5px]">
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
                {info.realizedDate}
              </span>
            </span>
          )}
          <span className="flex items-center gap-1.5 text-[11px] opacity-90 max-[520px]:gap-1 max-[520px]:text-[9.5px]">
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
            {info.date}
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
            {info.views.toLocaleString("tr-TR")} kişi açtı
          </span>
          <ReportButton
            code={info.code}
            name={info.name}
            manifest={info.manifest}
          />
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium text-neutral-600 shadow-sm max-[520px]:px-2 max-[520px]:text-[10px]">
            <span className="text-[11px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
              ⭐
            </span>
            <b className="font-semibold">{luck.toLocaleString("tr-TR")}</b>{" "}
            kişi şans {info.realized ? "dilemişti" : "diledi"}
          </span>
          {info.realized ? (
            <>
              <span className="flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium text-neutral-600 shadow-sm max-[520px]:px-2 max-[520px]:text-[10px]">
                <span className="text-[11px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
                  👏
                </span>
                <b className="font-semibold">
                  {cheers.toLocaleString("tr-TR")}
                </b>{" "}
                kişi tebrik etti
              </span>
              <span className="relative">
                {cheered && <BurstStars stars={CHEER_STARS} />}
                <button
                  type="button"
                  onClick={() => {
                    if (!member && !testMode) {
                      window.location.href = "/uye";
                      return;
                    }
                    if (testMode) {
                      // Test modu: sınırsız, +10'ar tebrik
                      setCheered(true);
                      setCheers((n) => n + 10);
                      onCheer?.(10);
                      return;
                    }
                    if (cheered) return;
                    setCheered(true);
                    setCheers((n) => n + 1);
                    onCheer?.(1);
                  }}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm transition-all max-[520px]:px-3 max-[520px]:py-1 max-[520px]:text-xs ${
                    cheered
                      ? "wish-yay border-emerald-300 bg-emerald-50 text-emerald-600"
                      : "wish-btn border-neutral-200 bg-white/90 text-neutral-600 hover:border-emerald-300 hover:text-emerald-600"
                  }`}
                >
                  <span
                    className={`text-base transition-transform duration-300 ${
                      cheered ? "scale-125" : ""
                    }`}
                  >
                    👏
                  </span>
                  {testMode ? "Tebrik et +10" : "Tebrik et"}
                </button>
              </span>
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
                  if (!member && !testMode) {
                    window.location.href = "/uye";
                    return;
                  }
                  if (testMode) {
                    // Test modu: sınırsız, +10'ar — barajlar hızla denenir
                    setWished(true);
                    setLuck((n) => n + 10);
                    onWish?.(10);
                    return;
                  }
                  if (wished) return;
                  setWished(true);
                  setLuck((n) => n + 1);
                  onWish?.(1);
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
                {testMode ? "Şans dile +10" : "Şans dile"}
              </button>
            </span>
          )}
        </div>
      </div>
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
  // Şans dileme / tebrik (demo: yerel state, backend'de gerçek sayaca bağlanır)
  const [luck, setLuck] = useState(envelope.luck ?? 0);
  const [wished, setWished] = useState(false);
  const [cheers, setCheers] = useState(envelope.cheers ?? 0);
  const [cheered, setCheered] = useState(false);
  // Test modu (admin panelden): şans sınırsız ve +10'ar dilenir
  const [testMode, setTestMode] = useState(false);
  useEffect(() => {
    fetchSettings().then((s) => setTestMode(s.testMode));
  }, []);
  // Şans/tebrik yalnızca üye girişiyle dilenebilir (test modu hariç);
  // girişsiz tıklamada doğrudan üye giriş ekranına yönlendirilir
  const [member, setMember] = useState(false);
  useEffect(() => {
    currentUser().then((u) => setMember(!!u));
  }, []);
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
    // Mobilde zarf orta-altta açılır; mektup orta-üste doğru çıkar.
    // Masaüstünde sponsor zarfı da biraz aşağıda açılır: mektubu daha
    // uzun olduğundan üst kenarı ekranın tepesine dayanmasın
    const dropY =
      window.innerWidth <= 520
        ? Math.round(vh * 0.1)
        : envelope.sponsored
          ? Math.round(vh * 0.09)
          : 0;
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
  }, [origin, envelope.rotation, envelope.sponsored]);

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
            {/* Mobil kapat — mektubun dışında, sağ üst köşesinde */}
            <button
              type="button"
              onClick={close}
              aria-label="Kapat"
              className="absolute -top-11 right-0 z-40 hidden h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-lg text-neutral-600 shadow-lg max-[520px]:flex"
              style={{ opacity: stage === "open" ? 1 : 0 }}
            >
              ×
            </button>
            <div
              ref={letterRef}
              className="max-h-[62vh] overflow-y-auto rounded-[4px] bg-[#fffdf5] px-8 py-7 shadow-[0_16px_44px_rgba(0,0,0,0.35)] max-[520px]:px-5 max-[520px]:py-5"
            >
              {envelope.sponsored && envelope.sponsor ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={envelope.sponsor.logo}
                  alt={envelope.sponsor.brand}
                  className="h-9 object-contain"
                />
              ) : (
                <p className="font-hand text-[26px] text-neutral-800 max-[520px]:text-[22px]">
                  {envelope.name}
                </p>
              )}
              <div className="mt-1 flex items-center justify-between">
                {envelope.sponsored && envelope.sponsor && (
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400 max-[520px]:text-[9.5px]">
                    {envelope.sponsor.label}
                    {envelope.sponsor.subText
                      ? ` • ${envelope.sponsor.subText}`
                      : ""}
                  </p>
                )}
                {!envelope.sponsored && (
                  <div className="ml-auto flex flex-col items-end">
                    <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-neutral-400 max-[520px]:text-[8px]">
                      Zarf kodu
                    </span>
                    <p className="flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-neutral-400 max-[520px]:text-[9.5px]">
                      {envelope.code}
                      <CopyBtn text={envelope.code} />
                    </p>
                  </div>
                )}
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-neutral-700 max-[520px]:text-[13px]">
                {envelope.manifest}
              </p>
              {/* Sponsor mektubu: takip kodu kutusu + marka linki */}
              {envelope.sponsored && envelope.sponsor && (
                <div className="mt-4 space-y-3">
                  {envelope.sponsor.coupon && (
                    <div
                      className="flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-2.5"
                      onClickCapture={() =>
                        trackSponsor(envelope.sponsor!.id, "coupon")
                      }
                    >
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                          Hediye kodu
                        </p>
                        <p className="font-mono text-[15px] font-bold tracking-wider text-neutral-800 max-[520px]:text-[13px]">
                          {envelope.sponsor.coupon}
                        </p>
                      </div>
                      <CopyBtn text={envelope.sponsor.coupon} />
                    </div>
                  )}
                  {envelope.sponsor.linkUrl && (
                    <a
                      href={envelope.sponsor.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      onClick={() => trackSponsor(envelope.sponsor!.id, "link")}
                      className="block rounded-xl px-4 py-2.5 text-center text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
                      style={{ backgroundColor: envelope.sponsor.labelBg }}
                    >
                      {envelope.sponsor.linkLabel || envelope.sponsor.brand}
                    </a>
                  )}
                </div>
              )}
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

          {/* Eklenme/yayınlanma tarihi + görüntülenme — zarf ön yüzü, sol
              alt. Sponsor zarfında yalnızca yayınlanma tarihi görünür */}
          <div
            className="absolute bottom-[16px] left-[22px] z-30 flex flex-col items-start gap-1 text-xs font-medium transition-opacity duration-200 max-[520px]:bottom-[12px] max-[520px]:left-[14px] max-[520px]:gap-0.5"
            style={{
              color: envelope.color.ink,
              opacity: stage === "open" ? 0.85 : 0,
              pointerEvents: "none",
            }}
          >
            {envelope.realized && (
              <span className="mb-0.5 flex flex-col items-start gap-1 rounded-lg border border-emerald-300/70 bg-emerald-50/60 px-2.5 py-1.5 shadow-sm backdrop-blur-[1px] max-[520px]:px-2 max-[520px]:py-1">
                <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white shadow-sm max-[520px]:px-2.5 max-[520px]:py-0.5 max-[520px]:text-[8.5px]">
                  Gerçekleşti
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-900/80 max-[520px]:gap-1 max-[520px]:text-[9.5px]">
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
                  {envelope.realizedDate}
                </span>
              </span>
            )}
            {envelope.sponsored && envelope.sponsor ? (
              // Kampanya tarihleri — başlangıç her zaman, bitiş verildiyse
              <>
                <span className="text-[8.5px] font-semibold uppercase tracking-[0.16em] opacity-75 max-[520px]:text-[7.5px]">
                  Kampanya başlangıcı
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
                    <path d="M19 16v6" />
                    <path d="M16 19h6" />
                  </svg>
                  {envelope.sponsor.startLabel}
                </span>
                {envelope.sponsor.endLabel && (
                  <>
                    <span className="mt-1 text-[8.5px] font-semibold uppercase tracking-[0.16em] opacity-75 max-[520px]:text-[7.5px]">
                      Kampanya bitişi
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
                        <path d="m17 17 5 5" />
                        <path d="m22 17-5 5" />
                      </svg>
                      {envelope.sponsor.endLabel}
                    </span>
                  </>
                )}
              </>
            ) : (
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
                {envelope.date}
              </span>
            )}
            {!envelope.sponsored && (
              <>
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
              </>
            )}
            {!envelope.sponsored && (
              <ReportButton
                code={envelope.code}
                name={envelope.name}
                manifest={envelope.manifest}
                below
              />
            )}
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
                <span className="relative">
                  {cheered && <BurstStars stars={CHEER_STARS} />}
                  <button
                    type="button"
                    onClick={() => {
                      if (!member && !testMode) {
                        window.location.href = "/uye";
                        return;
                      }
                      if (testMode) {
                        // Test modu: sınırsız, +10'ar — üye manifestine
                        // kalıcı yazılır
                        setCheered(true);
                        setCheers((n) => n + 10);
                        envelope.cheers += 10;
                        persistCheer(envelope.code, 10);
                        return;
                      }
                      if (cheered) return;
                      setCheered(true);
                      setCheers((n) => n + 1);
                      envelope.cheers += 1;
                      persistCheer(envelope.code, 1);
                    }}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm transition-all max-[520px]:px-3 max-[520px]:py-1 max-[520px]:text-xs ${
                      cheered
                        ? "wish-yay border-emerald-300 bg-emerald-50 text-emerald-600"
                        : "wish-btn border-neutral-200 bg-white/90 text-neutral-600 hover:border-emerald-300 hover:text-emerald-600"
                    }`}
                  >
                    <span
                      className={`text-base transition-transform duration-300 ${
                        cheered ? "scale-125" : ""
                      }`}
                    >
                      👏
                    </span>
                    {testMode ? "Tebrik et +10" : "Tebrik et"}
                  </button>
                </span>
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
                    if (!member && !testMode) {
                      window.location.href = "/uye";
                      return;
                    }
                    if (testMode) {
                      // Test modu: sınırsız, +10'ar — üye manifestine
                      // kalıcı yazılır, panel ödül akışları tetiklenir
                      setWished(true);
                      setLuck((n) => n + 10);
                      envelope.luck += 10;
                      persistLuck(envelope.code, 10);
                      return;
                    }
                    if (wished) return;
                    setWished(true);
                    setLuck((n) => n + 1);
                    envelope.luck += 1;
                    persistLuck(envelope.code, 1);
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
                  {testMode ? "Şans dile +10" : "Şans dile"}
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
            className="absolute -right-2 z-40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-xl text-neutral-600 shadow-lg transition-all hover:scale-110 max-[520px]:hidden"
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

// Kod → deterministik görsel tohum: serpme/dönüş değerleri her yüklemede
// aynı kalır (dilimler tekrar çekilse de zarflar titremez)
function envRng(code: string) {
  let h = 2166136261;
  for (let i = 0; i < code.length; i++) {
    h ^= code.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return mulberry32((h >>> 0) % 2147483647 || 1);
}

// Sunucudan gelen duvar kaydı → Envelope (eski üye dönüşümüyle birebir)
function itemToEnvelope(m: MemberManifest, id: number): Envelope {
  const seed = envRng(m.code);
  const pc = PANEL_COLORS[m.colorIdx % PANEL_COLORS.length];
  const d = new Date(m.ts);
  const env: Envelope = {
    id,
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
  if (m.sticker)
    env.sticker = {
      emoji: m.sticker,
      left: seed() < 0.5 ? 24 : 76,
      rotation: -25 + seed() * 50,
    };
  if (m.special != null) {
    env.color = SPECIALS[m.special % SPECIALS.length];
    env.ribbon = m.special;
  }
  // Sponsorlu zarf: kampanya yükünden marka renkleri/logosu ile çizilir
  if (m.sponsored && m.sponsor) {
    env.sponsored = true;
    env.sponsor = m.sponsor;
    env.color = sponsorColor(m.sponsor);
    env.sticker = undefined;
  }
  if (m.bottled) env.bottled = true;
  if (m.boxed) env.boxed = true;
  return env;
}

const SLICE_CHUNK = 300;

export default function Home() {
  // ── Dilimli duvar verisi ───────────────────────────────────────────────
  // Meta (sayılar + şişe/kutu listeleri) tek istekte gelir; zarflar
  // görünür bölgeye göre dilim dilim çekilip rank→Envelope önbelleğinde
  // tutulur. Duvarın tamamı hiçbir zaman belleğe alınmaz — 100 bin
  // manifestte de açılış birkaç yüz KB'dir.
  const [fYear, setFYear] = useState(2026);
  const [fMonth, setFMonth] = useState(0);
  const [meta, setMeta] = useState<WallMeta | null>(null);
  const slicesRef = useRef<Map<number, Envelope>>(new Map());
  const pendingRef = useRef<Set<number>>(new Set());
  const filterKeyRef = useRef("");
  const [sliceVer, setSliceVer] = useState(0);

  useEffect(() => {
    const key = `${fYear}-${fMonth}`;
    filterKeyRef.current = key;
    slicesRef.current = new Map();
    pendingRef.current = new Set();
    setSliceVer((v) => v + 1);
    fetchWallMeta(fYear, fMonth).then((m) => {
      if (filterKeyRef.current === key && m) setMeta(m);
    });
  }, [fYear, fMonth]);

  // Reklam alanları — admin panelden açılıp kapatılır (backend ayarı)
  const [ads, setAds] = useState(false);
  // Kayan şerit — yazı ve tur süresi admin Ayarlar'dan; yazı boşsa gizli
  const [marquee, setMarquee] = useState<{ text: string; seconds: number }>({
    text: "",
    seconds: 36,
  });
  // Etkin yıl (yıl simülasyonu dahil) — duvar varsayılanı bu yılı gösterir
  const [nowYear, setNowYear] = useState(2026);
  useEffect(() => {
    fetchSettings().then((s) => {
      setAds(s.ads);
      if (s.marquee) setMarquee(s.marquee);
      if (s.year) {
        setNowYear(s.year);
        setFYear(s.year);
      }
    });
  }, []);
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
  // Hediye kutusu popup'ı (zarf id'si + uçuş başlangıç konumu)
  const [giftOpen, setGiftOpen] = useState<{
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

  // Şişe ve kutular meta ile tam liste gelir (150+/250+ şans — nadir)
  const bottledEnvs = useMemo(
    () => (meta?.bottles ?? []).map((m, i) => itemToEnvelope(m, 2000000 + i)),
    [meta],
  );
  const boxedEnvs = useMemo(
    () => (meta?.gifts ?? []).map((m, i) => itemToEnvelope(m, 3000000 + i)),
    [meta],
  );

  // Günlük karıştırma tohumu: her gece 00:00'da (Türkiye saati) değişir.
  // Sıralama satılmaz; tüm konumlar her gün bu tohumla yeniden dağıtılır
  // (sunucudaki wallSeed ile aynı formül)
  const daySeed = useMemo(
    () => Math.floor((Date.now() + 3 * 3600 * 1000) / 86400000),
    [],
  );

  // Filtre yılları: veritabanındaki yıllar + etkin yıl (yeni yılın ilk
  // günü henüz manifest yokken de seçilebilir kalsın)
  const years = useMemo(
    () => [...new Set([...(meta?.years ?? []), nowYear])].sort((a, b) => a - b),
    [meta, nowYear],
  );

  // Aktif filtreye uyan manifest sayısı (şişe ve kutular dahil)
  const filteredCount = meta?.total ?? 0;

  // Yerleşim: tamamen orantılı piksel konumları (zoom yok, ölçek yok).
  // Konum sırası her gece 00:00'da (TR) daySeed ile rastgele karılır;
  // filtre aktifken görünür zarflar baştan itibaren yeniden dizilir
  const layout = useMemo(() => {
    const m = makeLayoutMetrics(vwPx, cols);
    const rows = Math.max(1, Math.ceil((meta?.plain ?? 0) / cols));
    const wrapperW = cols * m.colStep;

    // Reklam banner alanları — tam genişlik. Masaüstünde yan yana iki
    // şerit, mobilde (3 sütun) alt alta. ADS_ENABLED kapalıysa hiç yoklar
    const bannerGap = 14;
    const bannerH = Math.max(110, m.envH * 1.35);
    const stacked = cols === 3;
    const banners = !ads
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

    // Sıralama artık sunucuda (md5(tohum+kod)) — burada yalnızca şişe ve
    // kutuların konumları hesaplanır; zarf konumları render aşamasında
    // rank'ten formülle türetilir

    // Şişe konumları her gün rastgele dağılır (dikeyde bantlara yayılı,
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

    // Hediye kutuları — şişeler gibi günlük seed'le duvara serpilir
    // (bbox, hafif dönüş payıyla kutu boyutundan türetilir)
    const gRand = mulberry32(daySeed + 1717);
    const giftW = Math.round(m.giftSize * 1.27);
    const giftH = Math.round(m.giftSize * 1.55);
    const gifts = boxedEnvs.map((env, i) => ({
      env,
      x: gRand() * Math.max(1, wrapperW - giftW - 8),
      y:
        topOffset +
        ((i + 0.15 + gRand() * 0.7) / Math.max(1, boxedEnvs.length)) *
          Math.max(1, sectionH - topOffset - giftH - 120),
      rot: -12 + gRand() * 24,
    }));

    // Şişe kutuya binmesin: çakışan şişe kutunun yanına, sığmazsa altına
    // taşınır — kutuyla şişe üst üste binip fiziği bozmasın
    for (const bb of bottles) {
      for (const g of gifts) {
        const margin = 30;
        const gcx = g.x + giftW / 2;
        const gcy = g.y + giftH / 2;
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
    }

    return {
      ...m,
      rows,
      wrapperW,
      sectionH,
      topOffset,
      bottles,
      gifts,
      giftW,
      giftH,
      banners,
    };
  }, [meta, bottledEnvs, boxedEnvs, cols, vwPx, daySeed, ads]);

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

  // ── Veri pencereleme: görünür bölgenin dilimleri sunucudan çekilir ─────
  useEffect(() => {
    if (!meta || meta.plain === 0) return;
    const key = filterKeyRef.current;
    // Veri, görünür alandan ~12 satır öteye kadar önden çekilir ki hızlı
    // kaydırmada zarflar geç kalmasın
    const startRank = Math.max(0, (range.start - 12) * cols);
    const endRank = Math.min(meta.plain, (range.end + 13) * cols);
    const c0 = Math.floor(startRank / SLICE_CHUNK);
    const c1 = Math.floor(Math.max(startRank, endRank - 1) / SLICE_CHUNK);
    for (let c = c0; c <= c1; c++) {
      const from = c * SLICE_CHUNK;
      if (from >= meta.plain) break;
      if (pendingRef.current.has(c) || slicesRef.current.has(from)) continue;
      pendingRef.current.add(c);
      void fetchWallSlice(
        fYear,
        fMonth,
        from,
        Math.min(meta.plain, from + SLICE_CHUNK),
      ).then((res) => {
        pendingRef.current.delete(c);
        // Filtre bu arada değiştiyse gelen dilim çöpe gider
        if (!res || filterKeyRef.current !== key) return;
        res.items.forEach((it, i) =>
          slicesRef.current.set(res.from + i, itemToEnvelope(it, res.from + i)),
        );
        setSliceVer((v) => v + 1);
      });
    }
  }, [meta, range, cols, fYear, fMonth]);

  // Şişe/kutu da pencerelenir: 100 binlik duvarda yüzlercesi olur; yalnızca
  // görünür bölgeye yakın olanlar DOM'a girer (ekran + tampon)
  const winY0 = layout.topOffset + range.start * layout.rowStep - 1200;
  const winY1 = layout.topOffset + (range.end + 1) * layout.rowStep + 1200;
  const visibleBottles = useMemo(
    () =>
      layout.bottles.filter(
        (b) => b.y + layout.bottleH >= winY0 && b.y <= winY1,
      ),
    [layout, winY0, winY1],
  );
  const visibleGifts = useMemo(
    () =>
      layout.gifts.filter((g) => g.y + layout.giftH >= winY0 && g.y <= winY1),
    [layout, winY0, winY1],
  );

  // Görünür dilimdeki zarflar + konumları. Konum formülü eski yerleşimle
  // birebir; şişe/kutu çevresindeki itmeler yalnızca render edilen ~50
  // zarf için hesaplanır
  const renderedEnvs = useMemo(() => {
    void sliceVer; // dilim geldikçe yeniden hesapla
    const out: { env: Envelope; pos: Pos }[] = [];
    if (!meta) return out;
    const m = layout;
    const startRank = range.start * cols;
    const endRank = Math.min(meta.plain, (range.end + 1) * cols);
    const rx = m.bottleW / 2 + m.envW / 2 + 8;
    const ry = m.bottleH / 2 + m.envH / 2 + 12;
    const grx = m.giftW / 2 + m.envW / 2 + 18;
    const gry = m.giftH / 2 + m.envH / 2 + 18;
    for (let rank = startRank; rank < endRank; rank++) {
      const env = slicesRef.current.get(rank);
      if (!env) continue;
      const col = rank % cols;
      const row = Math.floor(rank / cols);
      const p: Pos = {
        // Serpme payı iki yöne dağılır ki sol kenar da sağ gibi dolu görünsün
        x: 2 + col * m.colStep + (env.jx - 0.5) * m.jx,
        y: m.topOffset + row * m.rowStep + env.jy * m.jy,
        // z pencereye göre hesaplanır ki 10 binlerce satırda bile küçük
        // kalsın (header z:1500 ve vurgu z:1460'ın hep altında)
        z: (range.end + 2 - row) * 4 + env.zr,
      };
      const ex = p.x + m.envW / 2;
      const ey = p.y + m.envH / 2;
      for (const bb of visibleBottles) {
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
      for (const g of visibleGifts) {
        const gcx = g.x + m.giftW / 2;
        const gcy = g.y + m.giftH / 2;
        let dx = ex - gcx;
        let dy = ey - gcy;
        const d = Math.hypot(dx / grx, dy / gry);
        if (d >= 1) continue;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        const push = (1 - d) * m.envW * 0.34; // kutu az ezsin
        p.x += dx * push;
        p.y += dy * push;
      }
      // Kenarlarda simetrik hafif taşmaya izin ver
      p.x = Math.min(m.wrapperW - m.envW + 8, Math.max(-8, p.x));
      p.y = Math.max(2, p.y);
      out.push({ env, pos: p });
    }
    return out;
  }, [meta, layout, range, cols, sliceVer, visibleBottles, visibleGifts]);

  // Derin atlayışta (scrollbar'la 50 bin sıra ileri gibi) görünür dilim
  // henüz sunucudan gelmediyse kısa süreli yükleme örtüsü gösterilir
  const visStart = range.start * cols;
  const visEnd = Math.min(meta?.plain ?? 0, (range.end + 1) * cols);
  const wallLoading =
    !meta ||
    (visEnd > visStart && renderedEnvs.length < (visEnd - visStart) * 0.4);

  // Kod ile manifest arama
  const [query, setQuery] = useState("");
  const [searchErr, setSearchErr] = useState(false);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bulunan öğeyi (zarf/şişe/kutu) parlat + salla, 4 sn sonra söndür
  const flashItem = (id: number) => {
    setHighlightId(id);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightId(null), 4000);
  };

  // Uzak hedeflere animasyonsuz zıpla (600 bin piksellik smooth scroll
  // yerine) — yakın hedeflerde yumuşak kaydırma korunur
  const scrollJump = (top: number) => {
    const far = Math.abs(window.scrollY - top) > window.innerHeight * 6;
    window.scrollTo({ top, behavior: far ? "auto" : "smooth" });
  };

  const searchFail = () => {
    setSearchErr(true);
    setTimeout(() => setSearchErr(false), 1200);
  };

  // Kodu SUNUCUDA bul, konumuna kaydır ve parlat — 100 binlik duvarda da
  // tek indeksli sorgudur. Arama formu ve "?kod=" yönlendirmesi ortak
  const jumpToCode = (raw: string) => {
    const q = raw.trim().toUpperCase().replace(/[\s-]/g, "");
    if (!q) return;
    void findWallCode(q, fYear, fMonth).then((res) => {
      if (!res || !res.found || !res.inFilter || !res.item)
        return searchFail();
      const sec = sectionRef.current;
      // Kutu/şişe: meta ile tam liste zaten yüklü — konumuna kaydır
      if (res.kind === "boxed") {
        const ge = layout.gifts.find((g) => g.env.code === res.item!.code);
        if (ge && sec) {
          scrollJump(sec.offsetTop + ge.y - window.innerHeight / 2 + 120);
          flashItem(ge.env.id);
        } else searchFail();
        return;
      }
      if (res.kind === "bottled") {
        const be = layout.bottles.find((b) => b.env.code === res.item!.code);
        if (be && sec) {
          scrollJump(sec.offsetTop + be.y - window.innerHeight / 2 + 120);
          flashItem(be.env.id);
        } else searchFail();
        return;
      }
      // Zarf: rank → satır → piksel; dilim kaydırınca yüklenip parlar
      if (res.rank == null || res.rank < 0) return searchFail();
      flashItem(res.rank);
      if (sec) {
        const row = Math.floor(res.rank / cols);
        scrollJump(
          sec.offsetTop +
            layout.topOffset +
            row * layout.rowStep -
            window.innerHeight / 2 +
            60,
        );
      }
    });
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
    if (!meta) return;
    jumpedRef.current = true;
    setQuery(kod.toUpperCase());
    // Yerleşim hesaplanıp duvar oturduktan sonra kaydır
    const t = setTimeout(() => jumpToCode(kod), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta]);

  // İnen zarfla temas hâlindeki komşuları bul ve itme vektörlerini hesapla
  // (yalnızca render edilen zarflar arasında — komşular zaten oradadır)
  const displaced = useMemo(() => {
    const map = new Map<number, { x: number; y: number }>();
    if (partingId === null) return map;
    const target = renderedEnvs.find((r) => r.env.id === partingId)?.pos;
    if (!target) return map;
    const pad = 10;
    for (const { env: e, pos: p } of renderedEnvs) {
      if (e.id === partingId) continue;
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
  }, [partingId, renderedEnvs, layout]);

  // Popup açıkken sayfa kaymasın; kaybolan scrollbar kadar padding ekle ki
  // duvar yana kaymasın (yoksa zarf yerine dönerken hedef şaşar)
  useEffect(() => {
    if (selected || bottleOpen || giftOpen) {
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
  }, [selected, bottleOpen, giftOpen]);

  return (
    <main className="flex min-h-screen flex-col">
      {/* Topbar reklam alanı — şerit (admin panelden açılıp kapatılır) */}
      {ads && (
        <div className="flex h-12 shrink-0 items-center justify-center border-b border-neutral-200 bg-white">
          <span className="rounded border border-dashed border-neutral-300 px-8 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-neutral-400">
            Topbar Reklam Alanı
          </span>
        </div>
      )}

      {/* Header — ortak bileşen; arama paneli children olarak asılır */}
      <SiteHeader>

        {/* Arama paneli — üstünde aynı genişlikte kayan bilgi şeridiyle
            tek parça halinde header'dan sarkar (ss98) */}
        <div
          className={`absolute left-1/2 top-full w-max max-w-[96vw] -translate-x-1/2 rounded-b-2xl border-x border-b bg-white/95 shadow-[0_8px_20px_rgba(0,0,0,0.1)] backdrop-blur transition-colors ${
            searchErr ? "border-red-400" : "border-neutral-200"
          }`}
        >
          {/* Kayan şerit — panelin üst kenarı. Yazı ve tur süresi admin
              Ayarlar'dan gelir; yazı boşsa şerit hiç çizilmez. Panel
              genişliğini yalnızca arama formu belirler; kayan içerik
              mutlak konumludur ki paneli esnetmesin */}
          {marquee.text.trim() && (
            <div className="relative h-[22px] w-full overflow-hidden border-b border-amber-200/60 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50">
              <div
                className="mw-marquee absolute left-0 top-0 flex h-full w-max items-center whitespace-nowrap"
                style={{ animationDuration: `${marquee.seconds}s` }}
              >
                {Array.from({ length: 2 }, (_, half) => (
                  <span key={half} className="flex items-center">
                    {Array.from({ length: 4 }, (_, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 pr-10 text-[10.5px] font-semibold tracking-wide text-amber-700"
                      >
                        <span aria-hidden>✨</span>
                        {marquee.text}
                      </span>
                    ))}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Manifest arama + yıl/ay filtresi */}
          <form
            onSubmit={handleSearch}
            className="relative flex h-11 items-center px-4"
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
            onChange={(e) => {
              const y = Number(e.target.value);
              setFYear(y);
              // 2026'ya dönüldüyse Ağustos öncesi ay seçimi geçersizleşir
              if (y === LAUNCH_YEAR && fMonth && fMonth < LAUNCH_MONTH)
                setFMonth(0);
            }}
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
            {MONTHS_TR.map((m, i) =>
              // Lansman yılında (2026) Ağustos öncesi aylar listelenmez
              fYear === LAUNCH_YEAR && i + 1 < LAUNCH_MONTH ? null : (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ),
            )}
          </select>
          {/* Seçime uyan manifest sayısı — filtrelerin hemen altında */}
          <span className="absolute right-2 top-[calc(100%+8px)] whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-neutral-500 shadow-sm backdrop-blur">
            {filteredCount.toLocaleString("tr-TR")} manifest
          </span>
          </form>
        </div>
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
          {/* Hediye Kutuları — 250+ şans dilenmiş manifestler, şişeler gibi
              duvara serpilmiş kurdeleli kutularda sergilenir */}
          {visibleGifts.map((g) => (
            <div
              key={g.env.id}
              className="absolute"
              style={{
                left: g.x,
                top: g.y,
                zIndex: highlightId === g.env.id ? 1460 : 940,
                visibility:
                  giftOpen?.id === g.env.id ? "hidden" : "visible",
              }}
            >
              <button
                type="button"
                aria-label={`${g.env.name} — hediye kutusundaki manifesti oku`}
                className={`block cursor-pointer touch-manipulation transition-transform duration-200 hover:scale-110 ${
                  highlightId === g.env.id ? "item-flash" : ""
                }`}
                onClick={(e) => {
                  const el = e.currentTarget;
                  const r = el.getBoundingClientRect();
                  g.env.views += registerView(g.env.code);
                  // Genişlik döndürülmemiş halinden alınır (bbox açıyla büyür)
                  setGiftOpen({
                    id: g.env.id,
                    origin: {
                      cx: r.left + r.width / 2,
                      cy: r.top + r.height / 2,
                      w: el.offsetWidth,
                      h: el.offsetHeight,
                    },
                  });
                }}
              >
                {/* Duvarda hafif açıyla durur — popup uçuşu bu açıdan başlar */}
                <div style={{ transform: `rotate(${g.rot}deg)` }}>
                  <GiftBoxVisual
                    size={layout.giftSize}
                    name={g.env.name}
                    luck={g.env.luck}
                    sticker={g.env.sticker?.emoji}
                    stickerRot={g.env.sticker?.rotation}
                    realized={g.env.realized}
                    cheers={g.env.cheers}
                    glow
                  />
                </div>
              </button>
            </div>
          ))}

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
                zIndex: 920,
              }}
            >
              <span className="text-center text-xs font-medium uppercase tracking-[0.25em] text-neutral-400">
                Reklam Alanı {i + 1}
              </span>
            </div>
          ))}

          {/* Şişedeki Notlar — 150+ şans dilenmiş manifestler */}
          {visibleBottles.map((b, i) => (
            <button
              key={b.env.id}
              type="button"
              aria-label={`${b.env.name} — şişedeki notu oku`}
              onClick={(e) => {
                const el = e.currentTarget;
                const r = el.getBoundingClientRect();
                b.env.views += registerView(b.env.code);
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
              className={`absolute aspect-[200/520] cursor-pointer touch-manipulation transition-all duration-200 hover:scale-110 ${
                highlightId === b.env.id ? "item-flash" : ""
              }`}
              style={{
                zIndex: highlightId === b.env.id ? 1460 : 940,
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

          {renderedEnvs.map(({ env, pos }) => (
            <EnvelopeCard
              key={env.code}
              envelope={env}
              pos={pos}
              envW={layout.envW}
              hidden={selected?.env.id === env.id}
              offset={displaced.get(env.id)}
              highlighted={highlightId === env.id}
              onOpen={(e, origin) => {
                // Sponsor: kampanya başına günde 1 açılma sayılır
                if (e.sponsored && e.sponsor) {
                  if (registerView(`SP${e.sponsor.id}`, false))
                    trackSponsor(e.sponsor.id, "view");
                } else e.views += registerView(e.code);
                setSelected({ env: e, origin });
              }}
            />
          ))}
        </div>
      </section>

      {/* Yükleme örtüsü — dilim beklerken logo + dönen halka */}
      <div
        aria-hidden={!wallLoading}
        className={`pointer-events-none fixed inset-0 z-[1400] flex flex-col items-center justify-center gap-4 bg-[#f1efe9]/70 backdrop-blur-[2px] transition-opacity duration-300 ${
          wallLoading ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Manifest Duvarı"
          className="h-14 w-auto drop-shadow-sm"
          draggable={false}
        />
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-neutral-300 border-t-amber-500" />
        <p className="text-sm font-semibold text-neutral-500">Yükleniyor…</p>
      </div>

      {bottleOpen &&
        (() => {
          const be = layout.bottles.find((b) => b.env.id === bottleOpen.id);
          return be ? (
            <BottlePopup
              bottle={toBottleData(be.env, be.rot)}
              origin={bottleOpen.origin}
              onClose={() => setBottleOpen(null)}
              onWish={(d) => {
                be.env.luck += d;
                persistLuck(be.env.code, d);
              }}
              onCheer={(d) => {
                be.env.cheers += d;
                persistCheer(be.env.code, d);
              }}
            />
          ) : null;
        })()}

      {giftOpen &&
        (() => {
          const ge = layout.gifts.find((g) => g.env.id === giftOpen.id);
          return ge ? (
            <GiftPopup
              gift={toGiftData(ge.env)}
              rot={ge.rot}
              sticker={ge.env.sticker?.emoji}
              stickerRot={ge.env.sticker?.rotation}
              origin={giftOpen.origin}
              onClose={() => setGiftOpen(null)}
              onWish={(d) => {
                ge.env.luck += d;
                persistLuck(ge.env.code, d);
              }}
              onCheer={(d) => {
                ge.env.cheers += d;
                persistCheer(ge.env.code, d);
              }}
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
