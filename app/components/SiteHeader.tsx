"use client";

// ── Ortak header — duvar, üyelik ve panel sayfalarının hepsinde görünür ──
// Üç bölgeli esnek düzen: solda Instagram daveti (yazı+link admin
// Ayarlar'dan), ortada ana sayfaya dönen logo, sağda Merak Ettikleriniz /
// Bize Yazın linkleri ve üyelik durumu. Bölgeler flex olduğundan ekran
// daraldıkça içerikler logoyla asla çakışmaz; 900px altında linkler
// sağdan kayan hamburger paneline taşınır, Instagram ikona düşer.
// Duvar sayfası arama panelini children olarak içine asar.

import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PANEL_COLORS, currentUser } from "../lib/auth";
import { fetchSettings, type InstagramSetting } from "../lib/api";

// Üyelik ve Instagram bilgisi API'den gelene kadar son bilinen durum
// gösterilir — sayfa yenilendikçe butonların kaybolup gelmesini önler
const HEADER_CACHE = "mw_header";

type HeaderCache = {
  name: string | null; // girişli üyenin adı (null: girişsiz)
  insta: InstagramSetting | null;
};

function readCache(): HeaderCache | null {
  try {
    return JSON.parse(localStorage.getItem(HEADER_CACHE) ?? "");
  } catch {
    return null;
  }
}

function writeCache(patch: Partial<HeaderCache>) {
  try {
    localStorage.setItem(
      HEADER_CACHE,
      JSON.stringify({ ...(readCache() ?? {}), ...patch }),
    );
  } catch {}
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
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
  const [me, setMe] = useState<{ name: string } | null>(null);
  const [insta, setInsta] = useState<InstagramSetting | null>(null);
  // Hamburger menüsü (ss100) — 900px altında linkler buraya taşınır
  const [menuOpen, setMenuOpen] = useState(false);

  // Önce önbellekten boya (ilk kareden itibaren doğru görünüm)...
  useLayoutEffect(() => {
    const c = readCache();
    if (c) {
      if (c.name) setMe({ name: c.name });
      if (c.insta) setInsta(c.insta);
    }
  }, []);

  // ...sonra gerçek durumla sessizce güncelle
  useEffect(() => {
    currentUser().then((u) => {
      setMe(u ? { name: u.name } : null);
      writeCache({ name: u ? u.name : null });
    });
    fetchSettings().then((s) => {
      setInsta(s.instagram);
      writeCache({ insta: s.instagram });
    });
  }, []);

  return (
    <header className="sticky top-0 z-[1500] flex h-16 shrink-0 items-center border-b border-neutral-300/70 bg-white/70 px-4 backdrop-blur md:h-18 min-[900px]:px-[6%]">
      {/* Sol bölge — Instagram daveti. Geniş ekranda kendi yarısında
          ortalanır: kenara da logoya da yaslanmaz, ekranla orantılı
          nefes alır. Dar ekranda yalnızca ikon, sola yaslı */}
      <div className="flex flex-1 items-center min-[900px]:justify-center">
        {insta?.url && (
          <>
            <a
              href={insta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 whitespace-nowrap text-base font-semibold text-[#d62976] transition-opacity hover:opacity-75 min-[900px]:flex"
            >
              <InstagramIcon />
              {insta.text || "bizi instagramda takip et"}
            </a>
            <a
              href={insta.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={insta.text || "bizi instagramda takip et"}
              className="text-[#d62976] transition-opacity hover:opacity-75 min-[900px]:hidden"
            >
              <InstagramIcon />
            </a>
          </>
        )}
      </div>

      <a
        href="/"
        className="flex shrink-0 items-center"
        aria-label="Manifest Duvarı — ana sayfa"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Manifest Duvarı"
          className="h-14 w-auto md:h-16"
          draggable={false}
        />
      </a>

      {/* Sağ bölge: sayfa linkleri + üyelik durumu / hamburger — geniş
          ekranda sol bölge gibi kendi yarısında ortalanır */}
      <nav className="flex flex-1 items-center justify-end gap-2 min-[900px]:justify-center">
        <a
          href="/merak-edilenler"
          className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 max-[900px]:hidden"
        >
          Merak Ettikleriniz
        </a>
        <a
          href="/bize-ulasin"
          className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 max-[900px]:hidden"
        >
          Bize Yazın
        </a>
        {me ? (
          <a
            href="/panel"
            className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-1 pl-1 pr-3.5 shadow-sm transition-colors hover:bg-neutral-50 max-[900px]:hidden"
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
            <span className="max-w-32 truncate text-sm font-semibold text-neutral-700">
              Hesabım
            </span>
          </a>
        ) : (
          <a
            href="/uye"
            className="whitespace-nowrap rounded-full bg-neutral-800 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-700 max-[900px]:hidden"
          >
            Giriş Yap / Üye Ol
          </a>
        )}

        {/* Dar ekran: hamburger — linkler ve üyelik panelde toplanır */}
        <button
          type="button"
          aria-label="Menü"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          className="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm transition-colors hover:bg-neutral-50 max-[900px]:flex"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-4.5 w-4.5 text-neutral-700"
          >
            {menuOpen ? (
              <>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </>
            ) : (
              <>
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </>
            )}
          </svg>
        </button>
        {/* Sağdan kayan menü paneli. Header'ın backdrop-blur'u fixed
            konumu kendine bağladığı için body'ye portallanır */}
        {menuOpen &&
          createPortal(
            <div className="hidden max-[900px]:block">
              <div
                className="fixed inset-0 z-[1600] bg-black/40 backdrop-blur-[2px]"
                onClick={() => setMenuOpen(false)}
              />
              <aside className="mw-slidein fixed right-0 top-0 z-[1610] flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
                  <span className="text-sm font-bold text-neutral-800">
                    Menü
                  </span>
                  <button
                    type="button"
                    aria-label="Menüyü kapat"
                    onClick={() => setMenuOpen(false)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-lg text-neutral-500 transition-colors hover:bg-neutral-100"
                  >
                    ×
                  </button>
                </div>
                <nav className="flex-1 space-y-1 px-3 py-3">
                  <a
                    href="/merak-edilenler"
                    className="block rounded-xl px-4 py-3 text-[15px] font-semibold text-neutral-800 hover:bg-neutral-50"
                  >
                    Merak Ettikleriniz
                  </a>
                  <a
                    href="/bize-ulasin"
                    className="block rounded-xl px-4 py-3 text-[15px] font-semibold text-neutral-800 hover:bg-neutral-50"
                  >
                    Bize Yazın
                  </a>
                  <span className="mx-3 my-2 block h-px bg-neutral-100" />
                  <a
                    href={me ? "/panel" : "/uye"}
                    className="block rounded-xl bg-neutral-800 px-4 py-3 text-center text-[15px] font-bold text-white transition-colors hover:bg-neutral-700"
                  >
                    {me ? "Hesabım" : "Giriş Yap / Üye Ol"}
                  </a>
                </nav>
                {insta?.url && (
                  <a
                    href={insta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 border-t border-neutral-100 px-5 py-4 text-sm font-semibold text-[#d62976]"
                  >
                    <InstagramIcon />
                    {insta.text || "bizi instagramda takip et"}
                  </a>
                )}
              </aside>
            </div>,
            document.body,
          )}
      </nav>

      {children}
    </header>
  );
}
