"use client";

// ── Merak Edilenler — sıkça sorulan sorular ─────────────────────────────
// İçerik admin panelin İçerik sekmesinden düzenlenir (settings: faq).
// Sorular akordeon olarak açılıp kapanır.

import { useEffect, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import { fetchFaq, type FaqItem } from "../lib/api";

export default function FaqPage() {
  const [faq, setFaq] = useState<FaqItem[] | null>(null);
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    fetchFaq().then(setFaq);
  }, []);

  return (
    <main className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <div className="mx-auto w-full max-w-2xl px-4 pb-20 pt-10">
        <h1 className="text-center text-2xl font-bold text-neutral-800">
          Merak Ettikleriniz
        </h1>
        <p className="mt-2 text-center text-sm text-neutral-500">
          Manifest Duvarı hakkında en çok sorulan sorular
        </p>

        <div className="mt-8 space-y-3">
          {faq === null ? (
            <p className="py-10 text-center text-sm text-neutral-400">
              Yükleniyor…
            </p>
          ) : faq.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-400">
              Henüz soru eklenmemiş.
            </p>
          ) : (
            faq.map((f, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left"
                  aria-expanded={open === i}
                >
                  <span className="text-sm font-semibold text-neutral-800">
                    {f.q}
                  </span>
                  <span
                    className={`shrink-0 text-neutral-400 transition-transform duration-200 ${
                      open === i ? "rotate-180" : ""
                    }`}
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
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </button>
                {open === i && (
                  <p className="whitespace-pre-wrap border-t border-neutral-100 px-5 py-4 text-sm leading-relaxed text-neutral-600">
                    {f.a}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        <p className="mt-10 text-center text-sm text-neutral-500">
          Aradığın cevabı bulamadın mı?{" "}
          <a
            href="/bize-ulasin"
            className="font-semibold text-amber-600 hover:underline"
          >
            Bize yaz
          </a>
        </p>
      </div>
    </main>
  );
}
