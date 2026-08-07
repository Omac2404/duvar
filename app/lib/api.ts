// ── Duvar / bildirim / ayar / admin API istemcisi ────────────────────────
// auth.ts üyelik uçlarını kapsar; buradakiler duvar verisi, ziyaretçi
// tepkileri, herkese açık ayarlar ve admin panel uçlarıdır.

import type { MemberManifest, User } from "./auth";
import type { Report, ReportReason, SponsorPub } from "./wallData";
import type { MailConfig } from "./mail";
import type { ModProgress, ModRun } from "./moderation";

async function json<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

function post<T>(url: string, body?: unknown, method = "POST"): Promise<T> {
  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then((r) => json<T>(r));
}

// ── Duvar ────────────────────────────────────────────────────────────────

// Tüm üye manifestleri — duvar, üye zarflarını bununla kurar
export async function fetchManifests(): Promise<MemberManifest[]> {
  try {
    const res = await fetch("/api/manifests");
    return (await json<{ manifests: MemberManifest[] }>(res)).manifests;
  } catch {
    return [];
  }
}

// Şans / tebrik / görüntülenme — beklenmeden gönderilir; demo (seed)
// zarflarında sunucu no-op döner, sayaç oturumluk kalır
export function react(
  code: string,
  type: "luck" | "cheer" | "view",
  delta = 1,
) {
  void post(`/api/manifests/${encodeURIComponent(code)}/react`, {
    type,
    delta,
  }).catch(() => {});
}

// ── Dilimli duvar ────────────────────────────────────────────────────────
// Duvar verisi artık topluca inmez: meta (sayılar + şişe/kutu listeleri),
// görünür bölge dilimleri ve sunucu taraflı kod arama.

export type WallMeta = {
  seed: string;
  plain: number;
  total: number;
  years: number[];
  bottles: MemberManifest[];
  gifts: MemberManifest[];
};

export async function fetchWallMeta(y: number, mo: number): Promise<WallMeta | null> {
  try {
    const res = await fetch(`/api/wall/meta?y=${y}&mo=${mo}`);
    return res.ok ? await json<WallMeta>(res) : null;
  } catch {
    return null;
  }
}

export async function fetchWallSlice(
  y: number,
  mo: number,
  from: number,
  to: number,
): Promise<{ from: number; items: MemberManifest[] } | null> {
  try {
    const res = await fetch(`/api/wall/slice?y=${y}&mo=${mo}&from=${from}&to=${to}`);
    return res.ok ? await json<{ from: number; items: MemberManifest[] }>(res) : null;
  } catch {
    return null;
  }
}

export type WallFind = {
  found: boolean;
  kind?: "plain" | "bottled" | "boxed";
  inFilter?: boolean;
  rank?: number;
  item?: MemberManifest;
};

export async function findWallCode(
  code: string,
  y: number,
  mo: number,
): Promise<WallFind | null> {
  try {
    const res = await fetch(
      `/api/wall/find?code=${encodeURIComponent(code)}&y=${y}&mo=${mo}`,
    );
    return res.ok ? await json<WallFind>(res) : null;
  } catch {
    return null;
  }
}

// ── Herkese açık ayarlar ─────────────────────────────────────────────────

export type InstagramSetting = { text: string; url: string };

// Duvardaki kayan bilgi şeridi — yazı boşsa gizlenir, seconds = tur süresi
export type MarqueeSetting = { text: string; seconds: number };

export type PublicSettings = {
  ads: boolean;
  testMode: boolean;
  googleClientId: string;
  smtpConfigured: boolean;
  instagram: InstagramSetting;
  marquee: MarqueeSetting;
  year: number; // etkin yıl (admin yıl simülasyonu doluysa o)
  month: number; // içinde bulunulan ay (TR, 1-12)
};

export async function fetchSettings(): Promise<PublicSettings> {
  try {
    const res = await fetch("/api/settings");
    return await json<PublicSettings>(res);
  } catch {
    return {
      ads: false,
      testMode: false,
      googleClientId: "",
      smtpConfigured: false,
      instagram: { text: "", url: "" },
      marquee: { text: "", seconds: 36 },
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    };
  }
}

// ── Merak Edilenler (SSS) + Bize Ulaşın ──────────────────────────────────

export type FaqItem = { q: string; a: string };

export async function fetchFaq(): Promise<FaqItem[]> {
  try {
    const res = await fetch("/api/faq");
    return (await json<{ faq: FaqItem[] }>(res)).faq;
  } catch {
    return [];
  }
}

export function submitContact(c: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}) {
  return post<{ ok: boolean; error?: string }>("/api/contact", c);
}

export type ContactMessage = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  ts: number;
};

export async function adminContactMessages(): Promise<ContactMessage[]> {
  const res = await fetch("/api/admin/contact");
  if (!res.ok) return [];
  return (await json<{ messages: ContactMessage[] }>(res)).messages;
}

export function adminDeleteContact(id: number) {
  return post<{ ok: boolean }>(`/api/admin/contact?id=${id}`, undefined, "DELETE");
}

// ── Bildirimler ──────────────────────────────────────────────────────────

export async function fetchReportedCodes(): Promise<string[]> {
  try {
    const res = await fetch("/api/reports");
    return (await json<{ codes: string[] }>(res)).codes;
  } catch {
    return [];
  }
}

export function submitReport(r: {
  code: string;
  name: string;
  manifest: string;
  reason: ReportReason;
}) {
  return post<{ ok: boolean }>("/api/reports", r);
}

// ── Admin ────────────────────────────────────────────────────────────────

// Oturum kontrolü — girişliyse admin kimliği de döner
export type AdminMe = { ok: boolean; email?: string; isSuper?: boolean };

export async function adminCheck(): Promise<AdminMe> {
  try {
    const res = await fetch("/api/admin/login");
    return await json<AdminMe>(res);
  } catch {
    return { ok: false };
  }
}

// 1. adım: e-posta + şifre → kod gönderilir (SMTP yoksa demoCode döner).
// Admin giriş doğrulaması kapalıysa direct: true ile oturum hemen açılır
export function adminLogin(email: string, password: string) {
  return post<{
    ok: boolean;
    direct?: boolean;
    sent?: boolean;
    demoCode?: string;
    waitSec?: number;
    error?: string;
  }>("/api/admin/login", { email, password });
}

// 2. adım: e-posta kodu → oturum açılır
export function adminVerifyLogin(email: string, code: string) {
  return post<{ ok: boolean; error?: string }>("/api/admin/login", {
    email,
    code,
  });
}

export function adminLogout() {
  return post<{ ok: boolean }>("/api/admin/login", undefined, "DELETE");
}

// ── Admin hesapları (yalnızca süper admin) ──────────────────────────────

export type AdminAccount = {
  id: number;
  email: string;
  isSuper: boolean;
  createdAt: number;
};

export async function adminAccounts(): Promise<AdminAccount[]> {
  const res = await fetch("/api/admin/admins");
  if (!res.ok) return [];
  return (await json<{ admins: AdminAccount[] }>(res)).admins;
}

export function adminCreateAccount(email: string, password: string) {
  return post<{ ok: boolean; error?: string }>("/api/admin/admins", {
    email,
    password,
  });
}

export function adminDeleteAccount(id: number) {
  return post<{ ok: boolean }>(`/api/admin/admins?id=${id}`, undefined, "DELETE");
}

export async function adminUsers(): Promise<User[]> {
  const res = await fetch("/api/admin/users");
  if (!res.ok) return [];
  return (await json<{ users: User[] }>(res)).users;
}

export function adminSaveUser(u: User) {
  // Manifestler artık bu uçtan yazılmaz — yalnızca isim/doğrulama
  return post<{ ok: boolean; error?: string }>(
    `/api/admin/users/${encodeURIComponent(u.id)}`,
    { name: u.name, verified: u.verified },
    "PUT",
  );
}

// ── Admin: sayfalı manifest listesi ─────────────────────────────────────

export type AdminManifestItem = MemberManifest & {
  owner: string;
  ownerId: string;
  demo: boolean;
};

export type AdminManifestList = {
  items: AdminManifestItem[];
  filtered: number;
  perPage: number;
  counts: {
    total: number;
    sticker: number;
    special: number;
    bottled: number;
    boxed: number;
    realized: number;
    demo: number;
    totalLuck: number;
  };
};

export async function adminManifests(p: {
  q?: string;
  filter?: string;
  sort?: string;
  page?: number;
}): Promise<AdminManifestList | null> {
  const qs = new URLSearchParams({
    q: p.q ?? "",
    filter: p.filter ?? "all",
    sort: p.sort ?? "new",
    page: String(p.page ?? 0),
  });
  const res = await fetch(`/api/admin/manifests?${qs}`);
  return res.ok ? await json<AdminManifestList>(res) : null;
}

export function adminAddLuck(code: string, addLuck: number) {
  return post<{ ok: boolean; luck?: number }>(
    `/api/admin/manifests/${encodeURIComponent(code)}`,
    { addLuck },
    "PUT",
  );
}

export function adminGenerateDemo(count: number) {
  return post<{ ok: boolean; inserted?: number; totalDemo?: number; error?: string }>(
    "/api/admin/demo",
    { count },
  );
}

export function adminDeleteDemos() {
  return post<{ ok: boolean; deleted?: number }>(
    "/api/admin/demo",
    undefined,
    "DELETE",
  );
}

export function adminDeleteUser(id: string) {
  return post<{ ok: boolean }>(
    `/api/admin/users/${encodeURIComponent(id)}`,
    undefined,
    "DELETE",
  );
}

// Manifesti gerekçeli siler; sahibine bilgilendirme maili gider
// (category null → gerekçesiz "kaldırıldı" bildirimi)
export function adminDeleteManifest(code: string, category: string | null) {
  return post<{ ok: boolean; mailSent: boolean; error?: string }>(
    `/api/admin/manifests/${encodeURIComponent(code)}`,
    { category },
  );
}

export async function adminReports(): Promise<Report[]> {
  const res = await fetch("/api/admin/reports");
  if (!res.ok) return [];
  return (await json<{ reports: Report[] }>(res)).reports;
}

// ts verilmezse koda ait tüm bildirimler silinir ("Tut" akışı)
export function adminRemoveReport(code: string, ts?: number) {
  return post<{ ok: boolean }>(
    `/api/admin/reports?code=${encodeURIComponent(code)}${
      ts !== undefined ? `&ts=${ts}` : ""
    }`,
    undefined,
    "DELETE",
  );
}

// ── Saatlik AI kontrolü ──────────────────────────────────────────────────

export async function adminModeration(): Promise<ModRun[]> {
  const res = await fetch("/api/admin/moderation");
  if (!res.ok) return [];
  return (await json<{ runs: ModRun[] }>(res)).runs;
}

// Gövdesiz: vadesi gelen pencereler + içinde bulunulan saat taranır.
// Aralık verilirse (ms): o aralıktaki tüm manifestler taranır.
export function adminModerationRun(range?: { from: number; to: number }) {
  return post<{ ok: boolean; error?: string }>("/api/admin/moderation", range);
}

export async function adminModerationProgress(): Promise<ModProgress | null> {
  try {
    const res = await fetch("/api/admin/moderation/progress");
    if (!res.ok) return null;
    return await json<ModProgress>(res);
  } catch {
    return null;
  }
}

export function adminModerationDecide(
  id: number,
  action: "approve" | "delete",
) {
  return post<{ ok: boolean; mailSent: boolean; error?: string }>(
    `/api/admin/moderation/${id}`,
    { action },
  );
}

export type AdminSettings = {
  mail: MailConfig;
  ads: boolean;
  testMode: boolean;
  aiKey: string;
  aiEnabled: boolean;
  faq: FaqItem[];
  instagram: InstagramSetting;
  marquee: MarqueeSetting;
  simYear: number; // 0 = kapalı (gerçek yıl)
  notify: NotifySettings;
  seo: SeoSettings;
  favicon: string; // data URL (boş: varsayılan ikon)
  legal: LegalSettings;
};

// Yasal sayfa metinleri (admin İçerik > Yasal Sayfalar)
export type LegalSettings = {
  privacy: string;
  cookies: string;
  terms: string;
  cookieBanner: string;
};

// SEO ayarları (admin Ayarlar > SEO bölümü)
export type SeoSettings = {
  title: string;
  description: string;
  headCode: string;
  sitemapExclude: string[];
};

// Otomatik bildirim anahtarları (admin Bildirimler sekmesi)
export type NotifySettings = {
  moderation: boolean;
  accountDeleted: boolean;
  verifyCode: boolean; // üyelik doğrulama kodu
  resetCode: boolean; // şifre sıfırlama kodu
  milestone20: boolean; // 20 şans: sticker hakkı maili
  milestone50: boolean; // 50 şans: özel renk hakkı maili
  milestone150: boolean; // 150 şans: şişe hakkı maili
  milestone250: boolean; // 250 şans: hediye kutusu hakkı maili
  cheer100: boolean; // her 100 tebrikte kutlama maili
  contactForward: boolean; // form bildirimi (bize gelen) SMTP adresine
  adminLogin: boolean; // admin girişindeki doğrulama kodu maili
};

export async function adminSettings(): Promise<AdminSettings | null> {
  const res = await fetch("/api/admin/settings");
  if (!res.ok) return null;
  return await json<AdminSettings>(res);
}

export function adminSaveSettings(patch: {
  mail?: MailConfig;
  ads?: boolean;
  testMode?: boolean;
  aiKey?: string;
  aiEnabled?: boolean;
  faq?: FaqItem[];
  instagram?: InstagramSetting;
  marquee?: MarqueeSetting;
  simYear?: number;
  notify?: Partial<NotifySettings>;
  seo?: Partial<SeoSettings>;
  favicon?: string;
  legal?: Partial<LegalSettings>;
}) {
  return post<{ ok: boolean }>("/api/admin/settings", patch, "PUT");
}

export function adminResetMembers() {
  return post<{ ok: boolean }>("/api/admin/reset");
}

// ── Admin: Genel Bakış istatistikleri ───────────────────────────────────

export type AdminStats = {
  users: {
    today: number;
    week: number;
    month: number;
    total: number;
    verified: number;
  };
  manifests: {
    today: number;
    week: number;
    month: number;
    total: number;
    sticker: number;
    special: number;
    bottled: number;
    boxed: number;
    realized: number;
  };
  engage: { luck: number; cheers: number; views: number; demo: number };
  ops: { pendingFlags: number; reports: number; messages: number };
  sponsors: { views: number; links: number; coupons: number };
  days: { label: string; manifests: number; users: number }[];
};

export async function adminStats(): Promise<AdminStats | null> {
  const res = await fetch("/api/admin/stats");
  if (!res.ok) return null;
  return await json<AdminStats>(res);
}

// ── Admin: sponsor kampanyaları (Reklam sekmesi) ─────────────────────────

export type SponsorCampaign = SponsorPub & {
  active: boolean;
  startTs: number | null; // yayın başlangıcı (ms) — null: hemen
  endTs: number | null; // yayın bitişi (ms) — null: süresiz
  freq: number; // her N zarfta 1 sponsor zarfı
  rawLogo: string; // data URL ya da statik yol (düzenleyici yükler)
  views: number; // metrik: kaç kişi zarfı açtı
  linkClicks: number; // metrik: kaç kişi link butonuna tıkladı
  couponClicks: number; // metrik: kaç kişi kodu kopyaladı
};

// Sponsor metriği — beklenmeden gönderilir (görüntülenme: cihaz/gün 1)
export function trackSponsor(id: number, type: "view" | "link" | "coupon") {
  void post(`/api/sponsors/${id}/track`, { type }).catch(() => {});
}

export async function adminSponsors(): Promise<SponsorCampaign[]> {
  const res = await fetch("/api/admin/sponsors");
  if (!res.ok) return [];
  return (await json<{ sponsors: SponsorCampaign[] }>(res)).sponsors;
}

// id === 0 → yeni kampanya oluşturur
export function adminSaveSponsor(c: SponsorCampaign) {
  return post<{ ok: boolean; sponsor?: SponsorCampaign; error?: string }>(
    c.id > 0 ? `/api/admin/sponsors/${c.id}` : "/api/admin/sponsors",
    c,
    c.id > 0 ? "PUT" : "POST",
  );
}

export function adminDeleteSponsor(id: number) {
  return post<{ ok: boolean }>(`/api/admin/sponsors/${id}`, undefined, "DELETE");
}
