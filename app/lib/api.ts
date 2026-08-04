// ── Duvar / bildirim / ayar / admin API istemcisi ────────────────────────
// auth.ts üyelik uçlarını kapsar; buradakiler duvar verisi, ziyaretçi
// tepkileri, herkese açık ayarlar ve admin panel uçlarıdır.

import type { MemberManifest, User } from "./auth";
import type { Report, ReportReason } from "./wallData";
import type { MailConfig } from "./mail";

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
  return post<{ ok: boolean; error?: string }>(
    `/api/admin/users/${encodeURIComponent(u.id)}`,
    { name: u.name, verified: u.verified, manifests: u.manifests },
    "PUT",
  );
}

export function adminDeleteUser(id: string) {
  return post<{ ok: boolean }>(
    `/api/admin/users/${encodeURIComponent(id)}`,
    undefined,
    "DELETE",
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

export type AdminSettings = {
  mail: MailConfig;
  ads: boolean;
  testMode: boolean;
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
}) {
  return post<{ ok: boolean }>("/api/admin/settings", patch, "PUT");
}

export function adminResetMembers() {
  return post<{ ok: boolean }>("/api/admin/reset");
}
