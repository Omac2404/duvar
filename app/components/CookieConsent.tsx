"use client";

// ── Çerez kabul kutusu — ilk ziyarette altta belirir ────────────────────
// Metin admin panelin İçerik > Yasal Sayfalar bölümünden düzenlenir.
// Tamam'a basılınca tercih yerel depolamaya yazılır ve kutu bir daha
// gösterilmez.

import { useEffect, useState } from "react";

const KEY = "mw_cookie_ok";

export default function CookieConsent({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {}
  }, []);
  if (!show || !text.trim()) return null;
  return (
    // bottom: yüzen alt menüyü ve onun üstündeki "Sen de yaz!" butonunu
    // örtmeyecek yükseklikte durur
    <div className="fixed bottom-[126px] left-4 z-[1900] w-[min(92vw,340px)] rounded-2xl border border-neutral-200 bg-white/95 p-4 shadow-2xl backdrop-blur max-[640px]:left-1/2 max-[640px]:-translate-x-1/2">
      <p className="text-xs leading-relaxed text-neutral-600">
        🍪 {text}{" "}
        <a
          href="/cerez-politikasi"
          className="font-semibold text-neutral-800 underline underline-offset-2"
        >
          Çerez Politikası
        </a>
      </p>
      <button
        type="button"
        onClick={() => {
          try {
            localStorage.setItem(KEY, "1");
          } catch {}
          setShow(false);
        }}
        className="mt-3 w-full cursor-pointer rounded-xl bg-neutral-800 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-700"
      >
        Tamam
      </button>
    </div>
  );
}
