"use client";

// ── Ortak header — duvar, üyelik ve panel sayfalarının hepsinde görünür ──
// Ortada ana sayfaya dönen logo; sağda üyelik durumu (girişliyse
// avatarlı panel kısayolu, değilse giriş butonu). Duvar sayfası arama
// panelini children olarak içine asar.

import { useEffect, useState } from "react";
import { PANEL_COLORS, currentUser, type User } from "../lib/auth";

export default function SiteHeader({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [me, setMe] = useState<User | null>(null);
  useEffect(() => {
    currentUser().then(setMe);
  }, []);

  return (
    <header className="sticky top-0 z-[1500] flex h-16 shrink-0 items-center justify-center border-b border-neutral-300/70 bg-white/70 backdrop-blur md:h-18">
      <a href="/" className="flex items-center" aria-label="Manifest Duvarı — ana sayfa">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Manifest Duvarı"
          className="h-14 w-auto md:h-16"
          draggable={false}
        />
      </a>

      {me ? (
        <a
          href="/panel"
          className="absolute right-3 flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-1 pl-1 pr-3.5 shadow-sm transition-colors hover:bg-neutral-50"
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
          className="absolute right-3 rounded-full bg-neutral-800 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-neutral-700"
        >
          Giriş Yap / Üye Ol
        </a>
      )}

      {children}
    </header>
  );
}
