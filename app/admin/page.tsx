"use client";

// ── Admin Paneli (demo) ──────────────────────────────────────────────────
// Test aracı: tüm üyeler, üye manifestleri ve duvarın demo (seed)
// manifestleri tek yerden izlenir; istenen üyeye istenen tipte manifest
// tanımlanır/düzenlenir. Ayarlardan reklam alanları açılır, üye verileri
// sıfırlanır. Demo: veriler localStorage'da, sayfa gizli (/admin), giriş
// istemez; canlıda gerçek yetkilendirme + backend'e bağlanacak.

import { useEffect, useMemo, useState } from "react";
import CopyBtn from "../components/CopyBtn";
import {
  GiftBoxVisual,
  MiniEnvelope,
  SPECIAL_COLORS,
  STICKERS,
} from "../components/RewardVisuals";
import {
  PANEL_COLORS,
  deleteUser,
  getUsers,
  saveUser,
  type MemberManifest,
  type User,
} from "../lib/auth";
import {
  ADS_KEY,
  buildEnvelopes,
  getReports,
  removeReport,
  TEST_KEY,
  TOTAL,
  type Report,
} from "../lib/wallData";
import {
  getMailConfig,
  saveMailConfig,
  sendMail,
  smtpReady,
  type MailConfig,
} from "../lib/mail";

const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm " +
  "text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 " +
  "focus:border-amber-400 focus:ring-2 focus:ring-amber-100";

const thCls =
  "px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-400";
const tdCls = "px-3 py-2.5 align-middle text-sm text-neutral-700";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

function trDate(d: Date): string {
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Benzersiz zarf kodu — üye + demo kodlarının tamamına karşı kontrol edilir
function genCode(taken: Set<string>): string {
  const L = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  do {
    code =
      String(10000 + Math.floor(Math.random() * 90000)) +
      L[Math.floor(Math.random() * 26)] +
      L[Math.floor(Math.random() * 26)];
  } while (taken.has(code));
  return code;
}

// Rozet çipi — manifest durum etiketleri
function Chip({
  children,
  tone,
  title,
}: {
  children: React.ReactNode;
  tone: "sky" | "amber" | "emerald" | "violet" | "neutral" | "red";
  title?: string;
}) {
  const tones: Record<string, string> = {
    sky: "bg-sky-100 text-sky-700",
    amber: "bg-amber-100 text-amber-700",
    emerald: "bg-emerald-100 text-emerald-700",
    violet: "bg-violet-100 text-violet-700",
    neutral: "bg-neutral-100 text-neutral-500",
    red: "bg-red-100 text-red-600",
  };
  return (
    <span
      title={title}
      className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

// Manifest durum rozetleri — üye (sticker: emoji string) ve demo
// (sticker: {emoji,...}) manifestlerinin ortak görünümü
type ChipData = {
  sticker?: string | { emoji: string };
  special?: number;
  luck?: number;
  bottled?: boolean;
  boxed?: boolean;
  realized?: boolean;
  sponsored?: boolean;
  demo?: boolean; // demo zarfı: özel renk luck>=50'den türetilir
};

function ManifestChips({ m }: { m: ChipData }) {
  const special =
    typeof m.special === "number" && m.special >= 0
      ? SPECIAL_COLORS[m.special % SPECIAL_COLORS.length]?.label
      : null;
  const stickerEmoji =
    typeof m.sticker === "string" ? m.sticker : m.sticker?.emoji;
  // Demo zarflarında özel renk luck>=50 ile atanır (special alanı yok)
  const demoSpecial = m.demo && (m.luck ?? 0) >= 50 && !m.sponsored;
  return (
    <span className="flex flex-wrap items-center gap-1">
      {stickerEmoji && (
        <Chip tone="amber" title="Sticker seçilmiş">
          {stickerEmoji}
        </Chip>
      )}
      {special && (
        <Chip tone="violet" title="Özel renk">
          🎨 {special}
        </Chip>
      )}
      {demoSpecial && (
        <Chip tone="violet" title="Özel renk (50+ şans)">
          🎨 Özel renk
        </Chip>
      )}
      {m.bottled && !m.boxed && <Chip tone="sky">🍾 Şişede</Chip>}
      {m.boxed && <Chip tone="amber">🎁 Kutuda</Chip>}
      {m.realized && <Chip tone="emerald">✓ Gerçekleşti</Chip>}
      {m.sponsored && <Chip tone="violet">Sponsorlu</Chip>}
    </span>
  );
}

// Bekleyen ödül hakları — barajı geçmiş ama üyenin onayı/seçimi eksik
function pendingRewards(m: MemberManifest): string[] {
  const p: string[] = [];
  if (m.luck >= 20 && !m.sticker) p.push("🏷️ Sticker bekliyor");
  if (m.luck >= 50 && m.special == null) p.push("🎨 Özel renk bekliyor");
  if (m.luck >= 150 && !m.bottled && !m.boxed) p.push("🍾 Şişe onayı bekliyor");
  if (m.luck >= 250 && !m.boxed) p.push("🎁 Kutu onayı bekliyor");
  return p;
}

// ── Manifest editörü form durumu ─────────────────────────────────────────
type Form = {
  name: string;
  text: string;
  date: string; // yyyy-mm-dd
  luck: number;
  cheers: number;
  views: number;
  colorIdx: number;
  sticker: string; // "" = seçilmemiş
  special: number; // -1 = seçilmemiş
  bottled: boolean;
  boxed: boolean;
  realized: boolean;
};

function emptyForm(): Form {
  return {
    name: "",
    text: "",
    date: new Date().toISOString().slice(0, 10),
    luck: 0,
    cheers: 0,
    views: 0,
    colorIdx: 0,
    sticker: "",
    special: -1,
    bottled: false,
    boxed: false,
    realized: false,
  };
}

// Hazır senaryolar — tek tıkla test edilecek duruma getirir
const PRESETS: { label: string; patch: Partial<Form> }[] = [
  {
    label: "Sade (5⭐)",
    patch: { luck: 5, sticker: "", special: -1, bottled: false, boxed: false },
  },
  {
    label: "Sticker bekliyor (25⭐)",
    patch: { luck: 25, sticker: "", special: -1, bottled: false, boxed: false },
  },
  {
    label: "Renk bekliyor (60⭐)",
    patch: { luck: 60, sticker: "⭐", special: -1, bottled: false, boxed: false },
  },
  {
    label: "Şişe bekliyor (170⭐)",
    patch: { luck: 170, sticker: "⭐", special: 0, bottled: false, boxed: false },
  },
  {
    label: "Kutu bekliyor (270⭐)",
    patch: { luck: 270, sticker: "⭐", special: 1, bottled: true, boxed: false },
  },
  {
    label: "Tam donanım (300⭐)",
    patch: { luck: 300, sticker: "🍀", special: 2, bottled: true, boxed: true },
  },
];

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<
    "overview" | "members" | "manifests" | "demo" | "reports" | "mail"
  >("overview");

  // Ziyaretçi bildirimleri (şikâyetler) — duvar popup'larından gelir
  const [reports, setReports] = useState<Report[]>([]);

  // Reklam alanları + test modu bayrakları (duvar sayfası bunları okur)
  const [ads, setAds] = useState(false);
  const [testMode, setTestMode] = useState(false);

  // Arama alanları — üyeler (isim/e-posta) ve üye manifestleri (kod/rumuz)
  const [mSearch, setMSearch] = useState("");
  const [manSearch, setManSearch] = useState("");

  // Bildirim ayarları — SMTP + Google Client ID (üye ekranı bunları okur)
  const [mailCfg, setMailCfg] = useState<MailConfig | null>(null);
  const [mailSaved, setMailSaved] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);
  const [testBusy, setTestBusy] = useState(false);

  useEffect(() => {
    setUsers(getUsers());
    setReports(getReports());
    setAds(localStorage.getItem(ADS_KEY) === "1");
    setTestMode(localStorage.getItem(TEST_KEY) === "1");
    setMailCfg(getMailConfig());
    setReady(true);
  }, []);

  function patchMail(p: Partial<MailConfig>) {
    setMailSaved(false);
    setMailCfg((c) => (c ? { ...c, ...p } : c));
  }

  function reload() {
    setUsers(getUsers());
  }

  // Demo (seed) zarflar — duvarla birebir aynı üretim
  const demoEnvs = useMemo(buildEnvelopes, []);

  // ── Editör ─────────────────────────────────────────────────────────────
  // userId + code=null → yeni manifest; code dolu → düzenleme
  const [editor, setEditor] = useState<{
    userId: string;
    code: string | null;
  } | null>(null);
  const [form, setForm] = useState<Form>(emptyForm());
  const [formErr, setFormErr] = useState("");

  function patch(p: Partial<Form>) {
    setForm((f) => ({ ...f, ...p }));
  }

  function openCreate(userId: string) {
    setForm(emptyForm());
    setFormErr("");
    setEditor({ userId, code: null });
  }

  function openEdit(u: User, m: MemberManifest) {
    setForm({
      name: m.name,
      text: m.manifest,
      date: new Date(m.ts).toISOString().slice(0, 10),
      luck: m.luck,
      cheers: m.cheers,
      views: m.views,
      colorIdx: m.colorIdx,
      sticker: m.sticker ?? "",
      special: m.special ?? -1,
      bottled: !!m.bottled,
      boxed: !!m.boxed,
      realized: m.realized,
    });
    setFormErr("");
    setEditor({ userId: u.id, code: m.code });
  }

  function saveEditor() {
    if (!editor) return;
    const u = users.find((x) => x.id === editor.userId);
    if (!u) return;
    if (form.name.trim().length < 2)
      return setFormErr("Rumuz en az 2 karakter olmalı.");
    if (form.text.trim().length < 10)
      return setFormErr("Manifest en az 10 karakter olmalı.");
    const d = new Date(form.date + "T12:00:00");
    if (isNaN(d.getTime())) return setFormErr("Tarih geçersiz.");

    const next: User = { ...u, manifests: [...u.manifests] };
    const existing = editor.code
      ? next.manifests.find((m) => m.code === editor.code)
      : undefined;

    // Kod: düzenlemede korunur; yeni manifestte tüm kodlara karşı benzersiz
    let code = editor.code;
    if (!code) {
      const taken = new Set<string>([
        ...demoEnvs.map((e) => e.code),
        ...users.flatMap((x) => x.manifests.map((m) => m.code)),
      ]);
      code = genCode(taken);
    }

    const m: MemberManifest = {
      code,
      name: form.name.trim(),
      manifest: form.text.trim(),
      date: trDate(d),
      ts: d.getTime(),
      luck: Math.max(0, form.luck),
      cheers: Math.max(0, form.cheers),
      views: Math.max(0, form.views),
      colorIdx: form.colorIdx,
      realized: form.realized,
    };
    if (form.sticker) m.sticker = form.sticker;
    if (form.special >= 0) m.special = form.special;
    if (form.bottled) m.bottled = true;
    if (form.boxed) m.boxed = true;
    if (form.realized)
      m.realizedDate = existing?.realizedDate ?? trDate(new Date());

    if (existing) {
      next.manifests = next.manifests.map((x) => (x.code === code ? m : x));
    } else {
      next.manifests.unshift(m); // admin tanımında yıllık kota uygulanmaz
    }
    saveUser(next);
    reload();
    setEditor(null);
  }

  // ── Onaylar ────────────────────────────────────────────────────────────
  const [confirmDelUser, setConfirmDelUser] = useState<User | null>(null);
  const [confirmDelMan, setConfirmDelMan] = useState<{
    u: User;
    m: MemberManifest;
  } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  function toggleVerified(u: User) {
    saveUser({ ...u, verified: !u.verified });
    reload();
  }

  function delManifest(u: User, code: string) {
    saveUser({ ...u, manifests: u.manifests.filter((m) => m.code !== code) });
    reload();
    setConfirmDelMan(null);
  }

  function setLuckQuick(u: User, code: string, luck: number) {
    saveUser({
      ...u,
      manifests: u.manifests.map((m) => (m.code === code ? { ...m, luck } : m)),
    });
    reload();
  }

  function toggleAds() {
    const next = !ads;
    localStorage.setItem(ADS_KEY, next ? "1" : "0");
    setAds(next);
  }

  function toggleTestMode() {
    const next = !testMode;
    localStorage.setItem(TEST_KEY, next ? "1" : "0");
    setTestMode(next);
  }

  function resetMemberData() {
    for (const k of ["mw_users", "mw_session", "mw_codes", "mw_test_deleted"])
      localStorage.removeItem(k);
    reload(); // test hesabı yeniden tohumlanır
    setConfirmReset(false);
  }

  // ── Demo sekmesi: arama + filtre + sayfalama ───────────────────────────
  const [dSearch, setDSearch] = useState("");
  const [dFilter, setDFilter] = useState("all");
  const [dPage, setDPage] = useState(0);
  const PER_PAGE = 50;

  const demoFiltered = useMemo(() => {
    const q = dSearch.trim().toUpperCase();
    return demoEnvs.filter((e) => {
      if (q && !e.code.includes(q) && !e.name.toUpperCase().includes(q))
        return false;
      switch (dFilter) {
        case "sticker":
          return !!e.sticker && !e.sponsored;
        case "special":
          return e.luck >= 50 && !e.sponsored;
        case "bottled":
          return !!e.bottled && !e.boxed;
        case "boxed":
          return !!e.boxed;
        case "sponsored":
          return !!e.sponsored;
        case "realized":
          return !!e.realized;
        default:
          return true;
      }
    });
  }, [demoEnvs, dSearch, dFilter]);

  const dPages = Math.max(1, Math.ceil(demoFiltered.length / PER_PAGE));
  const dPageSafe = Math.min(dPage, dPages - 1);

  // ── Genel bakış istatistikleri ─────────────────────────────────────────
  const stats = useMemo(() => {
    const all = users.flatMap((u) => u.manifests.map((m) => ({ u, m })));
    return {
      members: users.length,
      verified: users.filter((u) => u.verified).length,
      google: users.filter((u) => u.provider === "google").length,
      manifests: all.length,
      realized: all.filter((x) => x.m.realized).length,
      bottled: all.filter((x) => x.m.bottled && !x.m.boxed).length,
      boxed: all.filter((x) => x.m.boxed).length,
      totalLuck: all.reduce((s, x) => s + x.m.luck, 0),
      demoBottled: demoEnvs.filter((e) => e.bottled && !e.boxed).length,
      demoBoxed: demoEnvs.filter((e) => e.boxed).length,
      demoSponsored: demoEnvs.filter((e) => e.sponsored).length,
      demoRealized: demoEnvs.filter((e) => e.realized).length,
      demoSpecial: demoEnvs.filter((e) => e.luck >= 50 && !e.sponsored).length,
    };
  }, [users, demoEnvs]);

  if (!ready) return null;

  const allManifests = users.flatMap((u) => u.manifests.map((m) => ({ u, m })));

  // Üye araması: isim veya e-posta
  const mQ = mSearch.trim().toLocaleLowerCase("tr");
  const usersFiltered = mQ
    ? users.filter(
        (u) =>
          u.name.toLocaleLowerCase("tr").includes(mQ) ||
          u.email.toLowerCase().includes(mQ),
      )
    : users;

  // Manifest araması: zarf kodu, rumuz veya sahibinin adı
  const manQ = manSearch.trim();
  const manFiltered = manQ
    ? allManifests.filter(
        ({ u, m }) =>
          m.code.toUpperCase().includes(manQ.toUpperCase()) ||
          m.name
            .toLocaleLowerCase("tr")
            .includes(manQ.toLocaleLowerCase("tr")) ||
          u.name
            .toLocaleLowerCase("tr")
            .includes(manQ.toLocaleLowerCase("tr")),
      )
    : allManifests;

  const TABS = [
    { key: "overview", label: "📊 Genel Bakış" },
    { key: "members", label: `👥 Üyeler (${users.length})` },
    { key: "manifests", label: `💌 Üye Manifestleri (${allManifests.length})` },
    { key: "demo", label: `🧪 Demo Manifestler (${TOTAL})` },
    { key: "reports", label: `🚩 Bildirilenler (${reports.length})` },
    { key: "mail", label: "🔔 Bildirim Ayarları" },
  ] as const;

  return (
    <main className="min-h-screen bg-neutral-100 pb-16">
      {/* Admin üst şeridi — koyu, siteden ayrışır */}
      <header className="sticky top-0 z-[1500] flex h-14 items-center gap-3 border-b border-neutral-700 bg-neutral-900 px-4 text-white">
        <span className="text-sm font-bold tracking-wide">
          🛠️ Admin Paneli
        </span>
        <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
          DEMO
        </span>
        <nav className="ml-auto flex items-center gap-2 text-xs">
          <a
            href="/"
            className="rounded-full border border-white/25 px-3 py-1.5 font-medium text-white/90 transition-colors hover:bg-white/10"
          >
            Duvar
          </a>
          <a
            href="/panel"
            className="rounded-full border border-white/25 px-3 py-1.5 font-medium text-white/90 transition-colors hover:bg-white/10"
          >
            Üye Paneli
          </a>
        </nav>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Sekmeler */}
        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t.key
                  ? "bg-neutral-800 text-white"
                  : "bg-white text-neutral-500 shadow-sm hover:bg-neutral-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Genel Bakış ── */}
        {tab === "overview" && (
          <div className="mt-5 space-y-5">
            {/* Üye istatistikleri */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Üye", stats.members, `${stats.verified} doğrulanmış`],
                [
                  "Üye Manifesti",
                  stats.manifests,
                  `${stats.realized} gerçekleşmiş`,
                ],
                [
                  "Şişede / Kutuda",
                  `${stats.bottled} / ${stats.boxed}`,
                  "üye manifestleri",
                ],
                [
                  "Toplam Şans",
                  stats.totalLuck.toLocaleString("tr-TR"),
                  "üye manifestlerinde ⭐",
                ],
              ].map(([label, value, sub]) => (
                <div
                  key={String(label)}
                  className="rounded-2xl bg-white p-4 shadow-sm"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                    {label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-neutral-800">
                    {value}
                  </p>
                  <p className="text-[11px] text-neutral-400">{sub}</p>
                </div>
              ))}
            </section>

            {/* Demo duvar istatistikleri */}
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-neutral-700">
                🧱 Demo Duvar (seed)
              </h2>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-600">
                <span>✉️ {TOTAL.toLocaleString("tr-TR")} zarf</span>
                <span>🍾 {stats.demoBottled} şişede</span>
                <span>🎁 {stats.demoBoxed} kutuda</span>
                <span>🎨 {stats.demoSpecial} özel renk</span>
                <span>📣 {stats.demoSponsored} sponsorlu</span>
                <span>✓ {stats.demoRealized} gerçekleşmiş</span>
              </div>
            </section>

            {/* Ayarlar */}
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-neutral-700">⚙️ Ayarlar</h2>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-neutral-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-700">
                    Reklam alanları
                  </p>
                  <p className="text-xs text-neutral-400">
                    Duvarda topbar şeridi + 2 banner açılır; zarflar banner
                    bölgesinin altından başlar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleAds}
                  aria-label="Reklam alanlarını aç/kapat"
                  className={`relative h-7 w-12 cursor-pointer rounded-full transition-colors ${
                    ads ? "bg-emerald-500" : "bg-neutral-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                      ads ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50/70 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-700">
                    Test modu
                  </p>
                  <p className="text-xs text-neutral-400">
                    Duvar popup&apos;larında şans dileme sınırsız ve
                    +10&apos;ar olur; üye manifestlerine kalıcı yazılır —
                    sticker, parlak renk, şişe ve kutu barajları hızla
                    test edilir.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleTestMode}
                  aria-label="Test modunu aç/kapat"
                  className={`relative h-7 w-12 cursor-pointer rounded-full transition-colors ${
                    testMode ? "bg-amber-500" : "bg-neutral-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                      testMode ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50/60 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-700">
                    Üye verilerini sıfırla
                  </p>
                  <p className="text-xs text-neutral-400">
                    Tüm üyeler, manifestler, oturum ve kodlar silinir; test
                    hesabı ilk haliyle geri gelir.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="cursor-pointer rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50"
                >
                  Sıfırla
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ── Üyeler ── */}
        {tab === "members" && (
          <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              value={mSearch}
              onChange={(e) => setMSearch(e.target.value)}
              placeholder="İsim veya e-posta ara…"
              className={`${inputCls} max-w-64`}
            />
            {mQ && (
              <span className="text-xs text-neutral-400">
                {usersFiltered.length} sonuç
              </span>
            )}
          </div>
          <section className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full min-w-[760px] border-collapse">
              <thead className="border-b border-neutral-100">
                <tr>
                  <th className={thCls}>Üye</th>
                  <th className={thCls}>Tip</th>
                  <th className={thCls}>Doğrulama</th>
                  <th className={thCls}>Katılım</th>
                  <th className={thCls}>Manifest</th>
                  <th className={`${thCls} text-right`}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {usersFiltered.map((u) => {
                  const c = PANEL_COLORS[u.name.length % PANEL_COLORS.length];
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/60"
                    >
                      <td className={tdCls}>
                        <span className="flex items-center gap-2.5">
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                            style={{ background: c.base, color: c.ink }}
                          >
                            {initials(u.name)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-neutral-800">
                              {u.name}
                              {u.id === "u-test" && (
                                <span className="ml-1.5 rounded bg-neutral-100 px-1 py-0.5 text-[9px] font-medium text-neutral-400">
                                  TEST
                                </span>
                              )}
                            </span>
                            <span className="block truncate text-xs text-neutral-400">
                              {u.email}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td className={tdCls}>
                        <Chip tone={u.provider === "google" ? "sky" : "neutral"}>
                          {u.provider === "google" ? "Google" : "E-posta"}
                        </Chip>
                      </td>
                      <td className={tdCls}>
                        <button
                          type="button"
                          onClick={() => toggleVerified(u)}
                          title="Tıkla: doğrulama durumunu değiştir"
                          className="cursor-pointer"
                        >
                          {u.verified ? (
                            <Chip tone="emerald">✓ Doğrulanmış</Chip>
                          ) : (
                            <Chip tone="red">✗ Doğrulanmamış</Chip>
                          )}
                        </button>
                      </td>
                      <td className={`${tdCls} whitespace-nowrap text-xs`}>
                        {u.createdAt}
                      </td>
                      <td className={tdCls}>{u.manifests.length}</td>
                      <td className={`${tdCls} text-right`}>
                        <span className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openCreate(u.id)}
                            className="cursor-pointer whitespace-nowrap rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-neutral-700"
                          >
                            ✍️ Manifest Tanımla
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelUser(u)}
                            className="cursor-pointer rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-100"
                          >
                            Sil
                          </button>
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {usersFiltered.length === 0 && (
                  <tr>
                    <td className={`${tdCls} text-neutral-400`} colSpan={6}>
                      {mQ ? "Aramaya uyan üye yok." : "Kayıtlı üye yok."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
          </div>
        )}

        {/* ── Üye Manifestleri ── */}
        {tab === "manifests" && (
          <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              value={manSearch}
              onChange={(e) => setManSearch(e.target.value)}
              placeholder="Zarf kodu, rumuz veya sahip ara…"
              className={`${inputCls} max-w-64`}
            />
            {manQ && (
              <span className="text-xs text-neutral-400">
                {manFiltered.length} sonuç
              </span>
            )}
          </div>
          <section className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full min-w-[900px] border-collapse">
              <thead className="border-b border-neutral-100">
                <tr>
                  <th className={thCls}>Kod</th>
                  <th className={thCls}>Sahibi</th>
                  <th className={thCls}>Rumuz</th>
                  <th className={thCls}>Manifest</th>
                  <th className={thCls}>Şans</th>
                  <th className={thCls}>Durum</th>
                  <th className={thCls}>Tarih</th>
                  <th className={`${thCls} text-right`}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {manFiltered.map(({ u, m }) => (
                  <tr
                    key={m.code}
                    className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/60"
                  >
                    <td className={`${tdCls} whitespace-nowrap`}>
                      <span className="flex items-center gap-1 font-mono text-xs font-bold text-sky-700">
                        {m.code}
                        <CopyBtn text={m.code} />
                      </span>
                    </td>
                    <td className={`${tdCls} max-w-28 truncate text-xs`}>
                      {u.name}
                    </td>
                    <td
                      className={`${tdCls} max-w-32 truncate font-semibold`}
                    >
                      {m.name}
                    </td>
                    <td className={`${tdCls} max-w-56`}>
                      <span className="block truncate text-xs text-neutral-500">
                        {m.manifest}
                      </span>
                    </td>
                    <td className={`${tdCls} whitespace-nowrap`}>
                      {/* Hızlı şans ayarı — barajları tek tıkla test et */}
                      <select
                        value={m.luck}
                        onChange={(e) =>
                          setLuckQuick(u, m.code, Number(e.target.value))
                        }
                        title="Şansı hızlı ayarla (barajlar: 20/50/150/250)"
                        className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-1.5 py-1 text-xs text-neutral-700 outline-none"
                      >
                        {![0, 5, 25, 60, 170, 270, 500].includes(m.luck) && (
                          <option value={m.luck}>⭐ {m.luck}</option>
                        )}
                        {[0, 5, 25, 60, 170, 270, 500].map((v) => (
                          <option key={v} value={v}>
                            ⭐ {v}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className={tdCls}>
                      <ManifestChips m={m} />
                      {pendingRewards(m).map((w) => (
                        <Chip key={w} tone="neutral" title="Üye onayı bekliyor">
                          {w}
                        </Chip>
                      ))}
                    </td>
                    <td className={`${tdCls} whitespace-nowrap text-xs`}>
                      {m.date}
                    </td>
                    <td className={`${tdCls} text-right`}>
                      <span className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(u, m)}
                          className="cursor-pointer rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
                        >
                          Düzenle
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelMan({ u, m })}
                          className="cursor-pointer rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-100"
                        >
                          Sil
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
                {manFiltered.length === 0 && (
                  <tr>
                    <td className={`${tdCls} text-neutral-400`} colSpan={8}>
                      {manQ
                        ? "Aramaya uyan manifest yok."
                        : "Üye manifesti yok. Üyeler sekmesinden tanımlayabilirsin."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
          </div>
        )}

        {/* ── Demo Manifestler ── */}
        {tab === "demo" && (
          <div className="mt-5 space-y-4">
            <p className="rounded-xl bg-sky-50 px-4 py-2.5 text-xs leading-relaxed text-sky-700">
              Demo zarflar sabit tohumdan (seed 20260726) deterministik üretilir
              — burada salt okunur listelenir, düzenlenemez. Şans piramidi:
              çoğunluk sade, sonra sticker&apos;lı (20+), özel renkli (50+),
              şişedekiler (150+) ve en nadiren kutudakiler (250+).
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <input
                value={dSearch}
                onChange={(e) => {
                  setDSearch(e.target.value);
                  setDPage(0);
                }}
                placeholder="Kod veya rumuz ara…"
                className={`${inputCls} max-w-56`}
              />
              <select
                value={dFilter}
                onChange={(e) => {
                  setDFilter(e.target.value);
                  setDPage(0);
                }}
                className="cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none"
              >
                <option value="all">Tümü</option>
                <option value="sticker">Sticker&apos;lı (20+)</option>
                <option value="special">Özel renkli (50+)</option>
                <option value="bottled">Şişede (150+)</option>
                <option value="boxed">Kutuda (250+)</option>
                <option value="sponsored">Sponsorlu</option>
                <option value="realized">Gerçekleşmiş</option>
              </select>
              <span className="text-xs text-neutral-400">
                {demoFiltered.length.toLocaleString("tr-TR")} sonuç
              </span>
            </div>
            <section className="overflow-x-auto rounded-2xl bg-white shadow-sm">
              <table className="w-full min-w-[700px] border-collapse">
                <thead className="border-b border-neutral-100">
                  <tr>
                    <th className={thCls}>Kod</th>
                    <th className={thCls}>Rumuz</th>
                    <th className={thCls}>Şans</th>
                    <th className={thCls}>Görüntülenme</th>
                    <th className={thCls}>Tarih</th>
                    <th className={thCls}>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {demoFiltered
                    .slice(dPageSafe * PER_PAGE, (dPageSafe + 1) * PER_PAGE)
                    .map((e) => (
                      <tr
                        key={e.id}
                        className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/60"
                      >
                        <td className={`${tdCls} whitespace-nowrap`}>
                          <span className="flex items-center gap-1 font-mono text-xs font-bold text-sky-700">
                            {e.code}
                            <CopyBtn text={e.code} />
                          </span>
                        </td>
                        <td className={`${tdCls} font-semibold`}>{e.name}</td>
                        <td className={tdCls}>
                          ⭐ {e.luck.toLocaleString("tr-TR")}
                        </td>
                        <td className={tdCls}>
                          👁️ {e.views.toLocaleString("tr-TR")}
                        </td>
                        <td className={`${tdCls} whitespace-nowrap text-xs`}>
                          {e.date}
                        </td>
                        <td className={tdCls}>
                          <ManifestChips m={{ ...e, demo: true }} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </section>
            {/* Sayfalama */}
            <div className="flex items-center justify-center gap-3 text-sm">
              <button
                type="button"
                disabled={dPageSafe === 0}
                onClick={() => setDPage(dPageSafe - 1)}
                className="cursor-pointer rounded-full bg-white px-4 py-1.5 font-medium text-neutral-600 shadow-sm transition-colors hover:bg-neutral-50 disabled:cursor-default disabled:opacity-40"
              >
                ← Önceki
              </button>
              <span className="text-xs text-neutral-500">
                Sayfa {dPageSafe + 1} / {dPages}
              </span>
              <button
                type="button"
                disabled={dPageSafe >= dPages - 1}
                onClick={() => setDPage(dPageSafe + 1)}
                className="cursor-pointer rounded-full bg-white px-4 py-1.5 font-medium text-neutral-600 shadow-sm transition-colors hover:bg-neutral-50 disabled:cursor-default disabled:opacity-40"
              >
                Sonraki →
              </button>
            </div>
          </div>
        )}

        {/* ── Bildirilenler — duvardan gelen şikâyetler ── */}
        {tab === "reports" && (
          <div className="mt-5 space-y-4">
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs leading-relaxed text-red-700">
              Ziyaretçilerin duvar popup&apos;larındaki &quot;Bildir&quot;
              butonuyla işaretlediği manifestler. Kaldır, yalnızca bildirimi
              siler; manifest duvarda kalır.
            </p>
            {reports.length === 0 ? (
              <section className="rounded-2xl bg-white p-10 text-center text-sm text-neutral-400 shadow-sm">
                Henüz bildirilen manifest yok. 🎉
              </section>
            ) : (
              <section className="overflow-x-auto rounded-2xl bg-white shadow-sm">
                <table className="w-full min-w-[700px] border-collapse">
                  <thead className="border-b border-neutral-100">
                    <tr>
                      <th className={thCls}>Sebep</th>
                      <th className={thCls}>Kod</th>
                      <th className={thCls}>Rumuz</th>
                      <th className={thCls}>Manifest</th>
                      <th className={thCls}>Tarih</th>
                      <th className={thCls}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr
                        key={`${r.code}-${r.ts}`}
                        className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/60"
                      >
                        <td className={tdCls}>
                          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                            {r.reason}
                          </span>
                        </td>
                        <td className={`${tdCls} whitespace-nowrap`}>
                          <span className="flex items-center gap-1 font-mono text-xs font-bold text-sky-700">
                            {r.code}
                            <CopyBtn text={r.code} />
                          </span>
                        </td>
                        <td className={`${tdCls} font-semibold`}>{r.name}</td>
                        <td className={`${tdCls} max-w-[280px]`}>
                          <span className="line-clamp-2 text-xs text-neutral-500">
                            {r.manifest}
                          </span>
                        </td>
                        <td className={`${tdCls} whitespace-nowrap text-xs`}>
                          {r.date}
                        </td>
                        <td className={`${tdCls} text-right`}>
                          <button
                            type="button"
                            onClick={() => {
                              removeReport(r.code, r.ts);
                              setReports(getReports());
                            }}
                            className="cursor-pointer rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-500 transition-colors hover:border-red-300 hover:text-red-500"
                          >
                            Kaldır
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
          </div>
        )}

        {/* ── Bildirim Ayarları: SMTP + Google ile giriş ── */}
        {tab === "mail" && mailCfg && (
          <div className="mt-5 space-y-5">
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-neutral-700">
                📮 SMTP (E-posta) Ayarları
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                Üye olurken gönderilen doğrulama kodu ve şifre sıfırlama kodu
                bu SMTP hesabından yollanır. Ayarlar boş bırakılırsa kodlar
                ekrana demo bildirimi olarak düşer.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    SMTP Sunucusu
                  </span>
                  <input
                    value={mailCfg.host}
                    onChange={(e) => patchMail({ host: e.target.value })}
                    placeholder="smtp.gmail.com"
                    className={inputCls}
                  />
                </label>
                <div className="flex gap-3">
                  <label className="block flex-1">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                      Port
                    </span>
                    <input
                      value={mailCfg.port || ""}
                      onChange={(e) =>
                        patchMail({
                          port: Number(e.target.value.replace(/\D/g, "")) || 0,
                        })
                      }
                      placeholder="587"
                      inputMode="numeric"
                      className={inputCls}
                    />
                  </label>
                  <label className="flex shrink-0 cursor-pointer flex-col items-start">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                      SSL (465)
                    </span>
                    <button
                      type="button"
                      onClick={() => patchMail({ secure: !mailCfg.secure })}
                      aria-label="SSL bağlantısını aç/kapat"
                      className={`relative mt-1.5 h-7 w-12 cursor-pointer rounded-full transition-colors ${
                        mailCfg.secure ? "bg-emerald-500" : "bg-neutral-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                          mailCfg.secure ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </label>
                </div>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    Kullanıcı Adı
                  </span>
                  <input
                    value={mailCfg.user}
                    onChange={(e) => patchMail({ user: e.target.value })}
                    placeholder="bildirim@site.com"
                    className={inputCls}
                    autoComplete="off"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    Şifre / Uygulama Şifresi
                  </span>
                  <input
                    type="password"
                    value={mailCfg.pass}
                    onChange={(e) => patchMail({ pass: e.target.value })}
                    placeholder="••••••••"
                    className={inputCls}
                    autoComplete="new-password"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    Gönderen Adı
                  </span>
                  <input
                    value={mailCfg.fromName}
                    onChange={(e) => patchMail({ fromName: e.target.value })}
                    placeholder="Manifest Duvarı"
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    Gönderen E-posta
                  </span>
                  <input
                    type="email"
                    value={mailCfg.fromEmail}
                    onChange={(e) => patchMail({ fromEmail: e.target.value })}
                    placeholder="bildirim@site.com"
                    className={inputCls}
                  />
                </label>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-neutral-700">
                🔑 Google ile Giriş
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                Google Cloud Console&apos;dan alınan OAuth Client ID buraya
                girildiğinde üye ekranındaki &quot;Google ile devam&quot;
                butonu gerçek Google hesap seçiciyi kullanır; boşsa demo
                seçici gösterilir.
              </p>
              <label className="mt-3 block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                  Google Client ID
                </span>
                <input
                  value={mailCfg.googleClientId}
                  onChange={(e) =>
                    patchMail({ googleClientId: e.target.value.trim() })
                  }
                  placeholder="123456789-abc.apps.googleusercontent.com"
                  className={inputCls}
                  autoComplete="off"
                />
              </label>
            </section>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  saveMailConfig(mailCfg);
                  setMailSaved(true);
                }}
                className="cursor-pointer rounded-xl bg-neutral-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
              >
                Ayarları Kaydet
              </button>
              {mailSaved && (
                <span className="text-xs font-medium text-emerald-600">
                  ✓ Kaydedildi
                </span>
              )}
            </div>

            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-neutral-700">
                ✉️ Test E-postası
              </h2>
              <p className="mt-1 text-xs text-neutral-400">
                Kayıtlı SMTP ayarlarıyla deneme gönderimi yapar (önce
                kaydet).
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  type="email"
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  placeholder="alici@eposta.com"
                  className={`${inputCls} max-w-xs`}
                />
                <button
                  type="button"
                  disabled={testBusy || !testTo.trim() || !smtpReady(mailCfg)}
                  onClick={async () => {
                    setTestBusy(true);
                    setTestResult(null);
                    const r = await sendMail(
                      testTo.trim(),
                      "Manifest Duvarı — SMTP Testi",
                      "SMTP ayarların çalışıyor! Bu bir test e-postasıdır. ✨",
                    );
                    setTestBusy(false);
                    setTestResult(
                      r.ok
                        ? { ok: true, msg: "Gönderildi ✓" }
                        : { ok: false, msg: r.error ?? "Gönderilemedi" },
                    );
                  }}
                  className="cursor-pointer rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-default disabled:opacity-40"
                >
                  {testBusy ? "Gönderiliyor…" : "Test Gönder"}
                </button>
                {testResult && (
                  <span
                    className={`text-xs font-medium ${
                      testResult.ok ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {testResult.msg}
                  </span>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* ── Manifest editörü — tanımla / düzenle ── */}
      {editor && (
        <div
          className="fixed inset-0 z-[2100] overflow-y-auto bg-black/40 px-4 py-8"
          onClick={() => setEditor(null)}
        >
          <div
            className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className="text-2xl font-bold text-neutral-800"
                  style={{ fontFamily: "var(--font-caveat)" }}
                >
                  {editor.code ? "Manifesti Düzenle ✏️" : "Manifest Tanımla ✍️"}
                </h3>
                <p className="mt-0.5 text-xs text-neutral-400">
                  Üye:{" "}
                  <b className="text-neutral-600">
                    {users.find((u) => u.id === editor.userId)?.name}
                  </b>
                  {editor.code && (
                    <>
                      {" "}
                      · Kod: <b className="text-neutral-600">{editor.code}</b>
                    </>
                  )}{" "}
                  · Yıllık kota admin tanımında uygulanmaz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditor(null)}
                aria-label="Kapat"
                className="cursor-pointer text-lg text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            {/* Hazır senaryolar */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => patch(p.patch)}
                  className="cursor-pointer rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-medium text-neutral-600 transition-colors hover:bg-amber-100 hover:text-amber-700"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {formErr && (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {formErr}
              </p>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Rumuz
                </span>
                <input
                  value={form.name}
                  onChange={(e) => patch({ name: e.target.value.slice(0, 20) })}
                  placeholder="Zarfın üstündeki isim"
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Eklenme Tarihi
                </span>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => patch({ date: e.target.value })}
                  className={inputCls}
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Manifest Metni ({form.text.length}/300)
              </span>
              <textarea
                value={form.text}
                onChange={(e) => patch({ text: e.target.value.slice(0, 300) })}
                rows={3}
                placeholder="Manifest… (en az 10 karakter)"
                className={`${inputCls} resize-none`}
              />
            </label>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {(
                [
                  ["Şans ⭐", "luck"],
                  ["Tebrik 👏", "cheers"],
                  ["Görüntülenme 👁️", "views"],
                ] as const
              ).map(([label, key]) => (
                <label key={key} className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {label}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={form[key]}
                    onChange={(e) =>
                      patch({ [key]: Number(e.target.value) } as Partial<Form>)
                    }
                    className={inputCls}
                  />
                </label>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-neutral-400">
              Barajlar: 20+ sticker · 50+ özel renk · 150+ şişe · 250+ hediye
              kutusu. Tebrik yalnızca gerçekleşen manifestte görünür.
            </p>

            {/* Zarf rengi */}
            <div className="mt-4">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Zarf Rengi
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {PANEL_COLORS.map((pc, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Zarf rengi ${i + 1}`}
                    onClick={() => patch({ colorIdx: i })}
                    className={`h-7 w-7 cursor-pointer rounded-full transition-transform hover:scale-110 ${
                      form.colorIdx === i
                        ? "scale-110 ring-2 ring-neutral-700 ring-offset-1"
                        : "ring-1 ring-black/10"
                    }`}
                    style={{ background: pc.base }}
                  />
                ))}
              </div>
            </div>

            {/* Sticker */}
            <div className="mt-4">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Sticker (20+ hak)
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => patch({ sticker: "" })}
                  className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    form.sticker === ""
                      ? "bg-neutral-800 text-white"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  }`}
                >
                  Yok
                </button>
                {STICKERS.map((s) => (
                  <button
                    key={s.emoji}
                    type="button"
                    title={s.label}
                    onClick={() => patch({ sticker: s.emoji })}
                    className={`cursor-pointer rounded-lg px-2 py-1 text-lg leading-none transition-all hover:scale-110 ${
                      form.sticker === s.emoji
                        ? "bg-amber-100 ring-2 ring-amber-400"
                        : "bg-neutral-50 hover:bg-neutral-100"
                    }`}
                  >
                    {s.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Özel renk */}
            <div className="mt-4">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Özel Renk (50+ hak)
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => patch({ special: -1 })}
                  className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    form.special < 0
                      ? "bg-neutral-800 text-white"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  }`}
                >
                  Yok
                </button>
                {SPECIAL_COLORS.map((s, i) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => patch({ special: i })}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold text-[#E5C15C] transition-all hover:scale-105 ${
                      form.special === i ? "ring-2 ring-amber-400" : ""
                    }`}
                    style={{ background: s.color.bodyBg }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Durum anahtarları */}
            <div className="mt-4 flex flex-wrap gap-2">
              {(
                [
                  ["🍾 Şişede (150+ hak)", "bottled"],
                  ["🎁 Kutuda (250+ hak)", "boxed"],
                  ["✓ Gerçekleşti", "realized"],
                ] as const
              ).map(([label, key]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => patch({ [key]: !form[key] } as Partial<Form>)}
                  className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    form[key]
                      ? "bg-neutral-800 text-white"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Önizleme — zarf veya kutu */}
            <div className="mt-4 flex items-center justify-center gap-6 rounded-xl bg-[#f1efe9] py-4">
              {form.boxed ? (
                <div className="pr-8">
                  <GiftBoxVisual
                    size={120}
                    name={form.name || "Rumuz"}
                    luck={form.luck}
                    sticker={form.sticker || undefined}
                    realized={form.realized}
                    cheers={form.cheers}
                    glow
                  />
                </div>
              ) : (
                <MiniEnvelope
                  color={
                    form.special >= 0
                      ? SPECIAL_COLORS[form.special % SPECIAL_COLORS.length]
                          .color
                      : PANEL_COLORS[form.colorIdx % PANEL_COLORS.length]
                  }
                  name={form.name || "Rumuz"}
                  luck={form.luck}
                  sticker={form.sticker || undefined}
                  width={150}
                />
              )}
            </div>

            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setEditor(null)}
                className="flex-1 cursor-pointer rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={saveEditor}
                className="flex-1 cursor-pointer rounded-xl bg-neutral-800 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
              >
                {editor.code ? "Kaydet" : "Üyeye Tanımla 💌"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Üye silme onayı ── */}
      {confirmDelUser && (
        <div
          className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setConfirmDelUser(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-neutral-800">Üyeyi sil?</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              <b className="text-neutral-700">{confirmDelUser.name}</b> (
              {confirmDelUser.email}) üyeliği ve duvardaki{" "}
              <b className="text-red-500">
                {confirmDelUser.manifests.length} manifesti
              </b>{" "}
              kalıcı olarak silinecek.
              {confirmDelUser.id === "u-test" &&
                " Test hesabı silinirse ancak veri sıfırlama ile geri gelir."}
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDelUser(null)}
                className="flex-1 cursor-pointer rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteUser(confirmDelUser.id);
                  reload();
                  setConfirmDelUser(null);
                }}
                className="flex-1 cursor-pointer rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Manifest silme onayı ── */}
      {confirmDelMan && (
        <div
          className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setConfirmDelMan(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-neutral-800">
              Manifesti sil?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              <b className="text-neutral-700">{confirmDelMan.m.code}</b> kodlu
              manifest ({confirmDelMan.u.name} üyesinin) duvardan kaldırılacak.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDelMan(null)}
                className="flex-1 cursor-pointer rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() =>
                  delManifest(confirmDelMan.u, confirmDelMan.m.code)
                }
                className="flex-1 cursor-pointer rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Veri sıfırlama onayı ── */}
      {confirmReset && (
        <div
          className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setConfirmReset(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-neutral-800">
              Tüm üye verileri sıfırlansın mı?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              Tüm üyeler, manifestleri, aktif oturum ve doğrulama kodları{" "}
              <b className="text-red-500">kalıcı olarak silinir</b>; test hesabı
              ilk haliyle yeniden tohumlanır. Demo duvar zarfları etkilenmez.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="flex-1 cursor-pointer rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={resetMemberData}
                className="flex-1 cursor-pointer rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                Evet, Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
