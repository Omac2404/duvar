"use client";

// Manifest kodunun yanındaki kopyalama ikonu — tıklayınca panoya kopyalar,
// kısa süre ✓ gösterir. Duvar (mektup) ve üye paneli ortak kullanır.

import { useState } from "react";

export default function CopyBtn({
  text,
  className = "",
}: {
  text: string;
  className?: string;
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
          setTimeout(() => setOk(false), 1200);
        } catch {
          // pano izni yoksa sessiz geç (demo)
        }
      }}
      className={`inline-flex cursor-pointer items-center text-neutral-400 transition-colors hover:text-neutral-600 ${className}`}
    >
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
