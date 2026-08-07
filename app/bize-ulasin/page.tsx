"use client";

// ── Bize Ulaşın — iletişim formu ────────────────────────────────────────
// Mesajlar contact_messages tablosuna düşer; admin panelin İçerik
// sekmesindeki "Bize Yazılanlar" listesinden okunur.

import { useState } from "react";
import SiteHeader from "../components/SiteHeader";
import { submitContact } from "../lib/api";

const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm " +
  "text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 " +
  "focus:border-amber-400 focus:ring-2 focus:ring-amber-100";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const r = await submitContact({
      firstName,
      lastName,
      email,
      phone,
      message,
    }).catch(() => null);
    setBusy(false);
    if (!r?.ok) return setErr(r?.error ?? "Mesaj gönderilemedi.");
    setSent(true);
  }

  return (
    <main className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <div className="mx-auto w-full max-w-xl px-4 pb-20 pt-10">
        <h1 className="text-center text-2xl font-bold text-neutral-800">
          Bize Ulaşın
        </h1>
        <p className="mt-2 text-center text-sm text-neutral-500">
          Soru, öneri ya da iş birliği — bize yazın, en kısa sürede dönelim.
        </p>

        {sent ? (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-4xl">💌</p>
            <p className="mt-3 text-lg font-bold text-neutral-800">
              Mesajın bize ulaştı!
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              En kısa sürede sana geri döneceğiz.
            </p>
            <a
              href="/"
              className="mt-6 inline-block rounded-xl bg-neutral-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
            >
              Duvara Dön
            </a>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-sm"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="İsim">
                <input
                  className={inputCls}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  maxLength={60}
                  placeholder="İsmin"
                />
              </Field>
              <Field label="Soyisim">
                <input
                  className={inputCls}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  maxLength={60}
                  placeholder="Soyismin"
                />
              </Field>
            </div>
            <Field label="E-posta">
              <input
                type="email"
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={120}
                placeholder="ornek@eposta.com"
              />
            </Field>
            <Field label="Telefon (isteğe bağlı)">
              <input
                type="tel"
                className={inputCls}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={30}
                placeholder="05xx xxx xx xx"
              />
            </Field>
            <Field label="Mesajınız">
              <textarea
                rows={5}
                className={inputCls}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                minLength={5}
                maxLength={3000}
                placeholder="Bize iletmek istediklerin…"
              />
            </Field>
            {err && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
                {err}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full cursor-pointer rounded-xl bg-neutral-800 py-2.5 text-sm font-semibold text-white transition-all hover:bg-neutral-700 active:scale-[0.99] disabled:cursor-default disabled:opacity-50"
            >
              {busy ? "Gönderiliyor…" : "Gönder"}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-neutral-500">
          Dilersen doğrudan e-posta da gönderebilirsin:{" "}
          <a
            href="mailto:bilgi@manifestduvari.com"
            className="font-semibold text-amber-600 hover:underline"
          >
            bilgi@manifestduvari.com
          </a>
        </p>
      </div>
    </main>
  );
}
