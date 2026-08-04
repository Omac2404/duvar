// ── Üyelik sistemi — API istemci katmanı ─────────────────────────────────
// Veriler artık Postgres'te; bu modül app/api uçlarına konuşan ince bir
// istemcidir. Ekranlar buradaki async fonksiyonları await ile kullanır.
// Şifreler sunucuda bcrypt ile saklanır; oturum httpOnly cookie'dedir.

export type MemberManifest = {
  code: string; // 7 haneli arama kodu — 5 rakam + 2 harf (örn. 48213KT)
  name: string; // zarfın üstündeki isim/rumuz — her manifestte farklı olabilir
  manifest: string;
  date: string; // görünen tarih (ör. "12 Mart 2026")
  ts: number; // sıralama için timestamp
  luck: number;
  cheers: number;
  views: number;
  colorIdx: number; // PANEL_COLORS indeksi
  sticker?: string; // 20+ şans hakkı: üyenin seçtiği süs emojisi
  special?: number; // 50+ şans hakkı: seçilen özel renk (SPECIAL_COLORS idx)
  bottled?: boolean; // 150+ şans hakkı: üye onayıyla manifest şişeye konur
  boxed?: boolean; // 250+ şans hakkı: üye onayıyla manifest hediye kutusuna taşınır
  realized: boolean;
  realizedDate?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  provider: "email" | "google";
  verified: boolean;
  createdAt: string; // üyelik tarihi (görünen)
  manifests: MemberManifest[];
};

// Google ile girişte (Client ID tanımlı değilken) demo hesap seçici
export const DEMO_GOOGLE = {
  name: "Deniz Yılmaz",
  email: "deniz.yilmaz@gmail.com",
};

async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  return (await res.json()) as T;
}

// ── Oturum ───────────────────────────────────────────────────────────────

export async function currentUser(): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/me");
    const data = (await res.json()) as { user: User | null };
    return data.user;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await post("/api/auth/logout");
}

// ── Kayıt / giriş akışları ───────────────────────────────────────────────

export function registerUser(name: string, email: string, password: string) {
  return post<{ ok: boolean; error?: string }>("/api/auth/register", {
    name,
    email,
    pass: password,
  });
}

export function login(email: string, pass: string) {
  return post<{ ok: boolean; error?: string; unverified?: boolean }>(
    "/api/auth/login",
    { email, pass },
  );
}

// Kod gönderimi: SMTP yapılandırıldıysa gerçek e-posta; değilse demoCode
// döner ve ekranda "gelen e-posta" bildirimi gösterilir
export function sendCode(email: string, requireUser = false) {
  return post<
    | { ok: true; sent: boolean; demoCode?: string; error?: string }
    | { ok: false; waitSec?: number; error?: string }
  >("/api/auth/send-code", { email, requireUser });
}

export function verifyCode(
  email: string,
  code: string,
  purpose: "register" | "reset" = "register",
) {
  return post<{
    ok: boolean;
    error?: string;
    left?: number;
    resetToken?: string;
  }>("/api/auth/verify", { email, code, purpose });
}

export function resetPassword(email: string, token: string, newPass: string) {
  return post<{ ok: boolean; error?: string }>("/api/auth/reset", {
    email,
    token,
    newPass,
  });
}

export function googleLogin(credential: string) {
  return post<{ ok: boolean; error?: string }>("/api/auth/google", {
    credential,
  });
}

export function googleDemoLogin() {
  return post<{ ok: boolean; error?: string }>("/api/auth/google", {
    demo: true,
  });
}

// ── Hesap ve manifest işlemleri (oturum gerekir) ─────────────────────────

export function updateAccount(patch: {
  name: string;
  oldPass?: string;
  newPass?: string;
}) {
  return fetch("/api/account", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  }).then((r) => r.json() as Promise<{ ok: boolean; error?: string }>);
}

export function deleteAccount() {
  return fetch("/api/account", { method: "DELETE" }).then(
    (r) => r.json() as Promise<{ ok: boolean }>,
  );
}

// Panel update() deseni: üyenin tüm manifest listesi tek seferde yazılır
export function saveMyManifests(manifests: MemberManifest[]) {
  return fetch("/api/account/manifests", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ manifests }),
  }).then((r) => r.json() as Promise<{ ok: boolean; error?: string }>);
}

// Yeni manifest kodu — yazma modalı açılırken sunucudan peşin alınır
export async function newManifestCode(): Promise<string> {
  const res = await fetch("/api/manifests/new-code");
  const data = (await res.json()) as { code?: string };
  return data.code ?? "";
}

// ── Doğrulamalar ─────────────────────────────────────────────────────────

export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function passwordIssue(pass: string): string | null {
  if (pass.length < 8) return "Şifre en az 8 karakter olmalı.";
  if (!/[a-zA-ZğüşıöçĞÜŞİÖÇ]/.test(pass) || !/\d/.test(pass))
    return "Şifre en az bir harf ve bir rakam içermeli.";
  return null;
}

// Panel ve avatar için pastel renkler (duvar paletiyle birebir triple'lar:
// base gövde, dark kapak, ink yazı)
export const PANEL_COLORS = [
  { base: "#FFC8CD", dark: "#F7ABB2", ink: "#8E3B47" }, // pastel pembe
  { base: "#FFE8CD", dark: "#F9D4B0", ink: "#8A5A2A" }, // pastel şeftali
  { base: "#FFFFCD", dark: "#F4F3AD", ink: "#7A7420" }, // pastel sarı
  { base: "#CDFFD8", dark: "#AEEFC0", ink: "#2E7C48" }, // pastel nane yeşili
  { base: "#CDEAFF", dark: "#AED6F6", ink: "#2F5E8C" }, // pastel bebek mavisi
  { base: "#EBCDFF", dark: "#DAB2F7", ink: "#6D3A96" }, // pastel lila
  { base: "#FFD7E6", dark: "#F7BDD4", ink: "#94436A" }, // pastel gül kurusu
  { base: "#C9F0E2", dark: "#ACE3CF", ink: "#2F6E58" }, // pastel su yeşili
];
