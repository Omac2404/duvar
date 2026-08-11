"use client";

// ── Webreta zarfı — duvardaki tek sabit zarf ────────────────────────────
// Günlük karıştırmaya girmez, yeri hiç değişmez: duvarın üst bandında,
// yatayda ortada durur; masaüstünde de mobilde de ilk ekranda görünür.
// Boyutu sponsor zarfıyla aynıdır (envW * 1.35). Rengi Webreta mavisinin
// (#3c639f) parlak gradyanı, üzerinde beyaz amblem ve "Webreta Web
// Teknolojileri" yazısı. Admin panelden kapatılabilir (settings: webreta).

import { useEffect, useState } from "react";

export const WEBRETA_TEXT =
  "Çoğu dilek söylenmeden kaybolur. Bu duvarı kaybolmasınlar diye yaptık. " +
  "Buraya yazılan her dileğin bir gün gerçek olması ve duvarın herkese iyi " +
  "gelmesi dileğiyle. Geliştirici ekipten selamlar!";

const BLUE = "#3c639f";
// Parlak gradyan: açık maviden koyuya, ortada ışık bandı
const BODY_BG =
  "linear-gradient(135deg, #5b86c6 0%, #3c639f 46%, #2b4a7d 78%, #4370b4 100%)";
const FLAP_BG = "linear-gradient(180deg, #4f79b8, #2f527f)";

function Amblem({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/webreta-amblem.png"
      alt="Webreta"
      className={className}
      draggable={false}
    />
  );
}

// Duvardaki zarf — sponsor zarflarıyla aynı dil: hafifçe eğik durur,
// amblem ve yazı zarfın üstündedir (ayrı bir başlık satırı yok).
// Tıklanınca mektup açılır
export function WebretaCard({
  x,
  y,
  w,
  rot,
  z,
  likes,
  onOpen,
}: {
  x: number;
  y: number;
  w: number;
  rot: number;
  z: number;
  likes: number;
  onOpen: () => void;
}) {
  // Zarf içi ölçüler genişlikle orantılı — diğer zarflardaki fs ile aynı
  const fs = w / 172;
  return (
    <div className="absolute" style={{ left: x, top: y, width: w, zIndex: z }}>
      <button
        type="button"
        onClick={onOpen}
        style={{ background: BODY_BG, rotate: `${rot}deg` }}
        // Gölge parlak (özel seri) zarflarla birebir aynı: mavi zarf
        // kendi renginde yumuşak bir gölgeyle havada duruyor gibiydi,
        // sponsor zarfı gibi duvara oturması için aynı gölgeye çekildi
        className="relative block aspect-[4/3] w-full cursor-pointer touch-manipulation rounded-[3px] shadow-[0_4px_14px_rgba(0,0,0,0.35)] transition-all duration-200 hover:scale-135 hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)]"
        aria-label="Webreta Web Teknolojileri — mesajı oku"
      >
        {/* Kapak üçgeni */}
        <span
          className="absolute inset-x-0 top-0 h-[56%]"
          style={{
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            background: FLAP_BG,
          }}
        />
        {/* Parlaklık — üstten inen ışık */}
        <span
          className="pointer-events-none absolute inset-0 rounded-[3px]"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.06) 38%, rgba(255,255,255,0) 60%)",
          }}
        />
        {/* Beyaz amblem — sponsor logosuyla aynı yerde */}
        <Amblem className="pointer-events-none absolute left-1/2 top-[62%] w-[30%] -translate-x-1/2 -translate-y-1/2 select-none" />
        {/* Beğeni sayacı — diğer zarflardaki şans rozetinin yerinde */}
        <span
          className="pointer-events-none absolute inset-x-0 bottom-[22%] flex items-center justify-center leading-none text-white/90"
          style={{ gap: 3 * fs }}
        >
          <span style={{ fontSize: Math.max(8, 9.5 * fs) }}>♥</span>
          <span
            className="font-semibold"
            style={{ fontSize: Math.max(8.5, 10 * fs) }}
          >
            {likes.toLocaleString("tr-TR")}
          </span>
        </span>
        {/* Ad — sponsor zarfındaki gibi zarfın alt kenarında */}
        <span
          className="absolute inset-x-0 bottom-[4%] truncate px-1 text-center font-hand leading-none font-semibold text-white"
          style={{ fontSize: Math.max(9.5, 11.5 * fs) }}
        >
          Webreta Web Teknolojileri
        </span>
      </button>
    </div>
  );
}

// Mektup — zarfa tıklanınca açılan pencere. Şans dileme yok; yerine
// tek bir "Beğen" butonu var (aynı cihazdan bir kez sayılır)
export function WebretaPopup({
  likes,
  liked,
  onLike,
  onClose,
}: {
  likes: number;
  liked: boolean;
  onLike: () => void;
  onClose: () => void;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 10);
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[1700] flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300"
        style={{
          transform: shown ? "translateY(0) scale(1)" : "translateY(18px) scale(0.96)",
          opacity: shown ? 1 : 0,
        }}
      >
        {/* Başlık bandı — zarfın rengiyle aynı parlak mavi */}
        <div
          className="flex items-center gap-3 px-6 py-5"
          style={{ background: BODY_BG }}
        >
          <Amblem className="h-11 w-11 shrink-0" />
          <div className="min-w-0">
            <p className="text-[15px] font-extrabold leading-tight text-white">
              Webreta Web Teknolojileri
            </p>
            <p className="text-[11px] font-medium text-white/70">
              Geliştirici ekip
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="ml-auto flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/20 text-lg text-white transition-colors hover:bg-white/30"
          >
            ×
          </button>
        </div>
        {/* Mektup */}
        <div className="bg-[#fffdf5] px-7 py-6 max-[520px]:px-5">
          <p className="text-[15px] leading-relaxed text-neutral-700">
            {WEBRETA_TEXT}
          </p>
          <p
            className="mt-4 text-right text-2xl"
            style={{ fontFamily: "var(--font-caveat)", color: BLUE }}
          >
            Webreta
          </p>
          {/* Beğen — şans dileme yerine tek buton */}
          <div className="mt-5 flex items-center justify-center gap-3 border-t border-neutral-200/70 pt-4">
            <button
              type="button"
              onClick={onLike}
              disabled={liked}
              className={`flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all active:scale-[0.98] disabled:cursor-default ${
                liked
                  ? "bg-rose-50 text-rose-500"
                  : "text-white hover:brightness-110"
              }`}
              style={liked ? undefined : { background: BODY_BG }}
            >
              <span className="text-base">{liked ? "♥" : "♡"}</span>
              {liked ? "Beğendin" : "Beğen"}
            </button>
            <span className="text-sm font-semibold text-neutral-500">
              {likes.toLocaleString("tr-TR")} beğeni
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
