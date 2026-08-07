"use client";

// ── Ortak header — duvar, üyelik ve panel sayfalarının hepsinde görünür ──
// Solda Instagram daveti (yazı+link admin Ayarlar'dan), ortada ana
// sayfaya dönen logo; sağda Merak Ettikleriniz / Bize Yazın linkleri ve
// üyelik durumu (girişliyse avatarlı panel kısayolu, değilse giriş
// butonu). Duvar sayfası arama panelini children olarak içine asar.

import { useEffect, useState } from "react";
import { PANEL_COLORS, currentUser, type User } from "../lib/auth";
import { fetchSettings, type InstagramSetting } from "../lib/api";

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function SiteHeader({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [me, setMe] = useState<User | null>(null);
  const [insta, setInsta] = useState<InstagramSetting | null>(null);
  useEffect(() => {
    currentUser().then(setMe);
    fetchSettings().then((s) => setInsta(s.instagram));
  }, []);

  return (
    <header className="sticky top-0 z-[1500] flex h-16 shrink-0 items-center justify-center border-b border-neutral-300/70 bg-white/70 backdrop-blur md:h-18">
      {/* Instagram daveti — sol (yazı ve link admin Ayarlar'dan) */}
      {insta?.url && (
        <a
          href={insta.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute left-4 flex items-center gap-2 text-xs font-semibold text-neutral-500 transition-colors hover:text-[#d62976] max-[900px]:hidden"
        >
          <InstagramIcon />
          {insta.text || "bizi instagramda takip et"}
        </a>
      )}

      <a href="/" className="flex items-center" aria-label="Manifest Duvarı — ana sayfa">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Manifest Duvarı"
          className="h-14 w-auto md:h-16"
          draggable={false}
        />
      </a>

      {/* Sağ: sayfa linkleri + üyelik durumu */}
      <nav className="absolute right-3 flex items-center gap-2">
        <a
          href="/merak-edilenler"
          className="rounded-full px-2.5 py-1.5 text-xs font-semibold text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 max-[640px]:hidden"
        >
          Merak Ettikleriniz
        </a>
        <a
          href="/bize-ulasin"
          className="rounded-full px-2.5 py-1.5 text-xs font-semibold text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 max-[640px]:hidden"
        >
          Bize Yazın
        </a>
        {me ? (
          <a
            href="/panel"
            className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-1 pl-1 pr-3.5 shadow-sm transition-colors hover:bg-neutral-50"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
              style={{
                background: PANEL_COLORS[me.name.length % PANEL_COLORS.length].base,
                color: PANEL_COLORS[me.name.length % PANEL_COLORS.length].ink,
              }}
            >
              {me.name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0].toUpperCase())
                .join("")}
            </span>
            <span className="max-w-32 truncate text-xs font-semibold text-neutral-700 max-[520px]:hidden">
              {me.name.split(" ")[0]}
            </span>
          </a>
        ) : (
          <a
            href="/uye"
            className="rounded-full bg-neutral-800 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-neutral-700"
          >
            Giriş Yap / Üye Ol
          </a>
        )}
      </nav>

      {children}
    </header>
  );
}
