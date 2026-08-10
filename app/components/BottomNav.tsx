"use client";

// ── Yüzen alt menü + "Sen de yaz!" çağrısı ──────────────────────────────
// Geri bildirim: ziyaretçilerin çoğu üye olma yolunu bulamadı (sağ üstteki
// hamburgere tıklanacağı anlaşılmıyor), 6-7 kişi manifestini iletişim
// formundan gönderdi. Bu yüzden üyelik yolu artık ekranın altında sabit.
//
// Menü kenarlara yaslanmaz, ortada dar bir ada gibi yüzer. Yazma çağrısı
// yalnızca duvarda (/) görünür; diğer sayfalarda yalnızca menü kalır.
// Girişsizde /uye'ye davet eder, girişlide yıllık hakkı gösterip panelde
// yazma penceresini açar, hak dolduğunda "3/3" bilgisine döner.

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { currentUser } from "../lib/auth";
import { MANIFEST_QUOTA, quotaBadge, type QuotaInfo } from "../lib/quota";

function IconInfo() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px] shrink-0 max-[430px]:h-4 max-[430px]:w-4"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function IconWall() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px] shrink-0 max-[430px]:h-4 max-[430px]:w-4"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px] shrink-0 max-[430px]:h-4 max-[430px]:w-4"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

function IconPen() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[19px] w-[19px] shrink-0"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

// Oturum ve hak durumu sunucuda okunup buraya geçirilir; buton daha ilk
// boyamada doğru etiketle çizilir, sonradan değişip zıplamaz
export default function BottomNav({
  initialLoggedIn,
  initialQuota,
}: {
  initialLoggedIn: boolean;
  initialQuota: QuotaInfo | null;
}) {
  const [loggedIn, setLoggedIn] = useState(initialLoggedIn);
  const [quota, setQuota] = useState(initialQuota);
  const pathname = usePathname();

  // İstemci tarafı gezinmede (giriş/çıkış, yeni manifest) durum tazelenir
  useEffect(() => {
    currentUser().then((u) => {
      setLoggedIn(!!u);
      setQuota((q) => {
        if (!u) return null;
        const year = q?.year ?? new Date().getFullYear();
        return {
          year,
          used: u.manifests.filter(
            (m) => new Date(m.ts).getFullYear() === year,
          ).length,
        };
      });
    });
  }, [pathname]);

  // Üyelik ekranında kendi kendine gönderen buton anlamsız; admin paneli
  // de ziyaretçi menüsünün yeri değil (orada üyelik çağrısı hiç olmamalı)
  if (pathname === "/uye" || pathname.startsWith("/mnfstdvr-admn"))
    return null;

  const quotaFull = !!quota && quota.used >= MANIFEST_QUOTA;
  // Yazma çağrısı yalnızca duvarda: diğer sayfalarda gereksiz yer kaplıyor
  const showCta = pathname === "/";

  // whitespace-nowrap: "Merak Edilenler" dar ekranda alt satıra kaçınca
  // bar iki kat yükseliyor ve butonun altına giriyordu
  const item =
    "flex flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2 py-2 text-[12px] font-semibold transition-colors max-[430px]:gap-1 max-[430px]:px-1 max-[430px]:text-[10.5px]";
  const active = "bg-amber-50 text-amber-700";
  const idle = "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800";

  return (
    <>
      {/* Yüzen öğeler içeriğin son satırını örtmesin diye ayrılan pay.
          Menü yalnızca dar ekranda olduğundan geniş ekranda yalnızca
          butonun payı kadar (buton yoksa hiç) boşluk bırakılır */}
      <div
        aria-hidden
        className={`shrink-0 ${
          showCta
            ? "h-[114px] min-[900px]:h-[76px]"
            : "h-[68px] min-[900px]:h-0"
        }`}
      />

      {/* Yazma çağrısı — barın hemen üstünde, arada küçük bir boşlukla.
          Girişsiz: /uye'ye davet, dikkat çeksin diye canlandırılır.
          Girişli + hak varsa: hak rozetiyle panele gider ve manifest
          yazma penceresini kendiliğinden açar (?yaz=1).
          Hak dolduysa: bilgi verir, panele götürür, canlandırma yok */}
      {showCta && (
        <a
          href={!loggedIn ? "/uye" : quotaFull ? "/panel" : "/panel?yaz=1"}
          className="fixed bottom-[64px] left-1/2 z-[1420] -translate-x-1/2 min-[900px]:bottom-5"
        >
          <span className="relative flex">
            {!loggedIn && (
              <span
                aria-hidden
                className="mw-cta-ring absolute inset-0 rounded-full bg-violet-500"
              />
            )}
            <span
              className={`relative flex items-center gap-2 whitespace-nowrap rounded-full bg-violet-600 px-5 py-2.5 text-[15px] font-extrabold text-white shadow-[0_8px_22px_rgba(124,58,237,0.45)] max-[380px]:gap-1.5 max-[380px]:px-4 max-[380px]:py-2 max-[380px]:text-[13px] ${
                loggedIn ? "" : "mw-cta"
              }`}
            >
              {!quotaFull && <IconPen />}
              {quotaFull && quota
                ? `${quota.year} haklarını kullandın`
                : "Sen de yaz!"}
              {quota && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold max-[380px]:text-[10px]">
                  {quotaFull
                    ? `${MANIFEST_QUOTA}/${MANIFEST_QUOTA}`
                    : quotaBadge(quota)}
                </span>
              )}
            </span>
          </span>
        </a>
      )}

      {/* Yüzen menü — kenarlara yaslanmaz, ortada dar bir ada gibi durur.
          Yalnızca dar ekranda: geniş ekranda aynı bağlantılar zaten
          header'da duruyor, altta ikinci bir menü fazlalık oluyordu */}
      <nav className="fixed bottom-[max(10px,env(safe-area-inset-bottom))] left-1/2 z-[1410] flex w-[min(94vw,420px)] -translate-x-1/2 items-stretch gap-1 rounded-full border border-neutral-200/80 bg-white/95 p-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.14)] backdrop-blur min-[900px]:hidden">
        <Link
          href="/merak-edilenler"
          className={`${item} ${pathname === "/merak-edilenler" ? active : idle}`}
        >
          <IconInfo />
          Merak Edilenler
        </Link>
        <Link href="/" className={`${item} ${pathname === "/" ? active : idle}`}>
          <IconWall />
          Duvar
        </Link>
        <Link
          href={loggedIn ? "/panel" : "/uye"}
          className={`${item} ${pathname === "/panel" ? active : idle}`}
        >
          <IconUser />
          {loggedIn ? "Hesabım" : "Giriş Yap"}
        </Link>
      </nav>
    </>
  );
}
