"use client";

// Manifest kodunun yanındaki kopyalama ikonu — tıklayınca panoya kopyalar,
// kısa süre ✓ gösterir. Duvar (mektup) ve üye paneli ortak kullanır.

import { useState } from "react";

export default function CopyBtn({
  text,
  className = "",
  children,
}: {
  text: string;
  className?: string;
  // Verilirse butonun içinde kodun kendisi de görünür: metnin herhangi bir
  // yerine basmak kopyalar (renkler className'den gelir)
  children?: React.ReactNode;
}) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      aria-label={`${text} kodunu kopyala`}
      title="Kodu kopyala"
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          setTimeout(() => setOk(false), 2000);
        } catch {
          // pano izni yoksa sessiz geç (demo)
        }
      }}
      className={`relative inline-flex cursor-pointer items-center gap-1.5 transition-colors ${
        children ? "" : "text-neutral-400 hover:text-neutral-600"
      } ${className}`}
    >
      {/* Kopyalandı balonu — butonun altında 2 sn görünüp kaybolur
          (üstte açılınca kartların overflow-hidden kenarında kırpılıyordu) */}
      {ok && (
        <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2">
          <span className="report-pop block whitespace-nowrap rounded-md bg-neutral-800 px-2 py-1 text-[10px] font-medium normal-case tracking-normal text-white shadow-md">
            Kopyalandı
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-neutral-800" />
          </span>
        </span>
      )}
      {children}
      {ok ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5 text-emerald-500"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
        >
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      )}
    </button>
  );
}
