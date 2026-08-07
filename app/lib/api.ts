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

export type PublicSettings = {
  ads: boolean;
  testMode: boolean;
  googleClientId: string;
  smtpConfigured: boolean;
};

export async function fetchSettings(): Promise<PublicSettings> {
  try {
    const res = await fetch("/api/settings");
    return await json<PublicSettings>(res);
  } catch {
    return { ads: false, testMode: false, googleClientId: "", smtpConfigured: false };
  }
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

export async function adminCheck(): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/login");
    return (await json<{ ok: boolean }>(res)).ok;
  } catch {
    return false;
  }
}

export function adminLogin(password: string) {
  return post<{ ok: boolean; error?: string }>("/api/admin/login", { password });
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

export function adminRemoveReport(code: string, ts: number) {
  return post<{ ok: boolean }>(
    `/api/admin/reports?code=${encodeURIComponent(code)}&ts=${ts}`,
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
}) {
  return post<{ ok: boolean }>("/api/admin/settings", patch, "PUT");
}

export function adminResetMembers() {
  return post<{ ok: boolean }>("/api/admin/reset");
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
