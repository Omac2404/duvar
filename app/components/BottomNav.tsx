"use client";

// ── Alt menü + "Sen de yaz!" çağrısı ────────────────────────────────────
// Geri bildirim: ziyaretçilerin çoğu üye olma yolunu bulamadı (sağ üstteki
// hamburgere tıklanacağı anlaşılmıyor), 6-7 kişi manifestini iletişim
// formundan gönderdi. Bu yüzden üyelik yolu artık ekranın altında sabit:
// girişsiz ziyaretçi büyük, hareketli mor bir "Sen de yaz!" butonu görür,
// alt barın sağ ucu da /uye'ye çıkar. Giriş yapılınca buton kalkar ve
// "Giriş Yap" yazısı "Hesabım"a döner.

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
      className="h-[18px] w-[18px] shrink-0"
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
      className="h-[18px] w-[18px] shrink-0"
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
      className="h-[18px] w-[18px] shrink-0"
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

  const item =
    "flex flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition-colors";
  const active = "bg-amber-50 text-amber-700";
  const idle = "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800";

  return (
    <>
      {/* Sabit bar içeriğin son satırını örtmesin diye ayrılan pay */}
      <div aria-hidden className="h-[76px] shrink-0" />

      {/* Asıl çağrı — bardan yukarı taşar, her durumda görünür.
          Girişsiz: /uye'ye davet, dikkat çeksin diye canlandırılır.
          Girişli + hak varsa: hak rozetiyle birlikte panele gider ve
          manifest yazma penceresini kendiliğinden açar (?yaz=1).
          Hak dolduysa: bilgi verir, panele götürür, canlandırma yok */}
      <a
        href={
          !loggedIn ? "/uye" : quotaFull ? "/panel" : "/panel?yaz=1"
        }
        className="fixed bottom-[58px] left-1/2 z-[1420] -translate-x-1/2"
      >
        <span className="relative flex">
          {!loggedIn && (
            <span
              aria-hidden
              className="mw-cta-ring absolute inset-0 rounded-full bg-violet-500"
            />
          )}
          <span
            className={`relative flex items-center gap-2.5 whitespace-nowrap rounded-full bg-violet-600 px-7 py-3.5 text-[17px] font-extrabold text-white shadow-[0_10px_28px_rgba(124,58,237,0.5)] max-[420px]:gap-2 max-[420px]:px-5 max-[420px]:py-3 max-[420px]:text-[14px] ${
              loggedIn ? "" : "mw-cta"
            }`}
          >
            {!quotaFull && <IconPen />}
            {quotaFull && quota
              ? `${quota.year} haklarını kullandın`
              : "Sen de yaz!"}
            {quota && (
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-bold max-[420px]:px-2 max-[420px]:text-[11px]">
                {quotaFull
                  ? `${MANIFEST_QUOTA}/${MANIFEST_QUOTA}`
                  : quotaBadge(quota)}
              </span>
            )}
          </span>
        </span>
      </a>

      <nav className="fixed bottom-0 left-0 right-0 z-[1410] flex items-stretch gap-1 border-t border-neutral-200 bg-white/95 px-3 pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-6px_24px_rgba(0,0,0,0.10)] backdrop-blur">
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
