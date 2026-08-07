"use client";

// ── Admin Paneli (demo) ──────────────────────────────────────────────────
// Test aracı: tüm üyeler, üye manifestleri ve duvarın demo (seed)
// manifestleri tek yerden izlenir; istenen üyeye istenen tipte manifest
// tanımlanır/düzenlenir. Ayarlardan reklam alanları açılır, üye verileri
// sıfırlanır. Demo: veriler localStorage'da, sayfa gizli (/admin), giriş
// istemez; canlıda gerçek yetkilendirme + backend'e bağlanacak.

import { useEffect, useMemo, useState } from "react";
import CopyBtn from "../components/CopyBtn";
import { SPECIAL_COLORS } from "../components/RewardVisuals";
import {
  PANEL_COLORS,
  type MemberManifest,
  type User,
} from "../lib/auth";
import {
  SPONSOR_FONTS,
  sponsorColor,
  type Report,
  type SponsorFont,
  type SponsorGradient,
} from "../lib/wallData";
import { sendTestMail, smtpReady, type MailConfig } from "../lib/mail";
import {
  adminAddLuck,
  adminCheck,
  adminDeleteDemos,
  adminDeleteManifest,
  adminDeleteUser,
  adminGenerateDemo,
  adminLogin,
  adminManifests,
  type AdminManifestItem,
  type AdminManifestList,
  adminModeration,
  adminModerationDecide,
  adminModerationRun,
  adminContactMessages,
  adminDeleteContact,
  adminDeleteSponsor,
  adminRemoveReport,
  adminReports,
  adminResetMembers,
  adminSaveSettings,
  adminSaveSponsor,
  adminSaveUser,
  adminSettings,
  adminSponsors,
  adminUsers,
  type ContactMessage,
  type FaqItem,
  type InstagramSetting,
  type SponsorCampaign,
} from "../lib/api";
import {
  MOD_CATEGORIES,
  type ModCategory,
  type ModProgress,
  type ModRun,
} from "../lib/moderation";
import { adminModerationProgress } from "../lib/api";

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

// Kontrol penceresi başlığı — "5 Ağustos · 14:00 – 15:00" biçiminde
function fmtWindow(startMs: number, endMs: number): string {
  const t = (ms: number) =>
    new Date(ms).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  const day = new Date(startMs).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
  });
  return `${day} · ${t(startMs)} – ${t(endMs)}`;
}

// Aralık taraması başlığı — "12 Mart 2026 – 5 Ağustos 2026"
function fmtRange(startMs: number, endMs: number): string {
  const d = (ms: number) =>
    new Date(ms).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  return `${d(startMs)} – ${d(endMs)}`;
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

// ── Reklam sekmesi yardımcıları ──────────────────────────────────────────

const BLANK_SPONSOR: SponsorCampaign = {
  id: 0,
  brand: "",
  startLabel: "",
  endLabel: "",
  label: "Sponsorlu",
  labelBg: "#f97316",
  labelColor: "#ffffff",
  subText: "Sürpriz",
  subColor: "#5b2d9c",
  subFont: "hand",
  labelY: 44,
  logoW: 62,
  bodyColor: "#ffffff",
  bodyColor2: "",
  flapColor: "#5b2d9c",
  flapColor2: "",
  gradient: "diagonal",
  gloss: true,
  letter: "",
  coupon: "",
  linkUrl: "",
  linkLabel: "",
  logo: "",
  rawLogo: "",
  active: true,
  startTs: null,
  endTs: null,
  freq: 50,
  views: 0,
  linkClicks: 0,
  couponClicks: 0,
};

// ms ↔ datetime-local ("2026-08-07T14:30") çevirimleri — yerel saatte
function tsToLocal(ts: number | null): string {
  if (!ts) return "";
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(
    d.getHours(),
  )}:${p(d.getMinutes())}`;
}

function localToTs(s: string): number | null {
  if (!s) return null;
  const t = new Date(s).getTime();
  return Number.isFinite(t) ? t : null;
}

// Kampanyanın yayın durumu — liste rozetinde gösterilir
function sponsorStatus(c: SponsorCampaign): {
  label: string;
  tone: "emerald" | "neutral" | "sky" | "red";
} {
  if (!c.active) return { label: "Pasif", tone: "neutral" };
  const now = Date.now();
  if (c.startTs && c.startTs > now) return { label: "Planlandı", tone: "sky" };
  if (c.endTs && c.endTs < now) return { label: "Süresi doldu", tone: "red" };
  return { label: "Yayında", tone: "emerald" };
}

// Renk alanı — renk seçici + elle hex girişi birlikte, ikisi senkron
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const valid = /^#[0-9a-fA-F]{6}$/.test(value);
  return (
    <label className="flex items-center gap-2 text-xs font-medium text-neutral-600">
      <input
        type="color"
        value={valid ? value : "#ffffff"}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-10 shrink-0 cursor-pointer rounded border border-neutral-200 bg-white p-0.5"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        placeholder="#rrggbb"
        spellCheck={false}
        className={`w-[84px] rounded-lg border bg-white px-2 py-1.5 font-mono text-xs text-neutral-700 outline-none transition-colors focus:border-amber-400 ${
          value && !valid ? "border-red-300" : "border-neutral-200"
        }`}
      />
      {label}
    </label>
  );
}

// Duvardaki zarfın birebir küçüğü — düzenleyici canlı önizlemesi
function SponsorEnvelopePreview({
  c,
  w = 210,
}: {
  c: SponsorCampaign;
  w?: number;
}) {
  const col = sponsorColor(c);
  const logo = c.rawLogo || c.logo;
  const fs = w / 172;
  return (
    <div
      className="relative aspect-[4/3] shrink-0 rounded-[3px] shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
      style={{
        width: w,
        ...(col.bodyBg
          ? { background: col.bodyBg }
          : { backgroundColor: col.base }),
      }}
    >
      <span
        className="absolute inset-x-0 top-0 h-[56%]"
        style={{
          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          ...(col.flapBg
            ? { background: col.flapBg }
            : { backgroundColor: col.dark }),
        }}
      />
      {col.gloss && (
        <span
          className="pointer-events-none absolute inset-0 rounded-[3px]"
          style={{
            background:
              "linear-gradient(115deg, rgba(255,255,255,0.25) 8%, rgba(255,255,255,0.06) 30%, transparent 46%)",
          }}
        />
      )}
      <span
        className="absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full font-bold uppercase shadow-md"
        style={{
          top: `${c.labelY}%`,
          rotate: "-4deg",
          fontSize: 8.5 * fs,
          letterSpacing: "0.12em",
          padding: `${2.5 * fs}px ${8 * fs}px`,
          backgroundColor: c.labelBg,
          color: c.labelColor,
        }}
      >
        {c.label || "Sponsorlu"}
      </span>
      {logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={c.brand}
          className="pointer-events-none absolute left-1/2 top-[71%] -translate-x-1/2 -translate-y-1/2 object-contain"
          style={{ width: `${c.logoW}%` }}
        />
      )}
      <span
        className="absolute inset-x-0 bottom-[4%] truncate px-1 text-center font-hand font-semibold leading-none"
        style={{
          color: c.subColor,
          fontSize: Math.max(13, 18 * fs),
          fontFamily: SPONSOR_FONTS[c.subFont].css,
        }}
      >
        {c.subText}
      </span>
    </div>
  );
}

// Zarftan çıkan mektubun önizlemesi — duvar popup'ındaki düzenin küçüğü
function SponsorLetterPreview({ c }: { c: SponsorCampaign }) {
  const logo = c.rawLogo || c.logo;
  return (
    <div className="rounded-[4px] border border-neutral-200 bg-[#fffdf5] px-5 py-4">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={c.brand} className="h-8 object-contain" />
      ) : (
        <p className="text-sm font-bold text-neutral-800">
          {c.brand || "Marka"}
        </p>
      )}
      <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">
        {c.label || "Sponsorlu"}
        {c.subText ? ` • ${c.subText}` : ""}
      </p>
      <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-neutral-700">
        {c.letter || "Mektup metni burada görünecek…"}
      </p>
      {c.coupon && (
        <div className="mt-3 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-2">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Hediye kodu
          </p>
          <p className="font-mono text-[14px] font-bold tracking-wider text-neutral-800">
            {c.coupon}
          </p>
        </div>
      )}
      {c.linkUrl && (
        <span
          className="mt-3 block rounded-xl px-4 py-2 text-center text-[13px] font-bold text-white shadow-sm"
          style={{ backgroundColor: c.labelBg }}
        >
          {c.linkLabel || c.brand || "Siteye git"}
        </span>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [ready, setReady] = useState(false);
  // Admin girişi — ADMIN_PASSWORD ortam değişkeniyle, cookie 7 gün geçerli
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [adminPass, setAdminPass] = useState("");
  const [adminErr, setAdminErr] = useState("");
  const [tab, setTab] = useState<
    | "overview"
    | "members"
    | "manifests"
    | "reports"
    | "sponsors"
    | "content"
    | "mail"
  >("overview");

  // Ziyaretçi bildirimleri (şikâyetler) — duvar popup'larından gelir
  const [reports, setReports] = useState<Report[]>([]);

  // Saatlik AI kontrolü — koşular ve takılan manifestler
  const [modRuns, setModRuns] = useState<ModRun[]>([]);
  const [openRun, setOpenRun] = useState<number | null>(null);
  const [modBusy, setModBusy] = useState(false);
  const [flagBusy, setFlagBusy] = useState<number | null>(null);

  // Reklam alanları + test modu bayrakları (duvar sayfası bunları okur)
  const [ads, setAds] = useState(false);
  const [testMode, setTestMode] = useState(false);

  // Sponsor kampanyaları (Reklam sekmesi) — düzenleyici + liste
  const [sponsors, setSponsors] = useState<SponsorCampaign[]>([]);
  const [spEdit, setSpEdit] = useState<SponsorCampaign | null>(null);
  const [spBusy, setSpBusy] = useState(false);
  const [spErr, setSpErr] = useState("");
  const [spDelId, setSpDelId] = useState<number | null>(null);

  // İçerik sekmesi: SSS editörü + Bize Yazılanlar gelen kutusu
  const [faq, setFaq] = useState<FaqItem[]>([]);
  const [faqSaved, setFaqSaved] = useState(false);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [contactOpen, setContactOpen] = useState<number | null>(null);

  // Instagram (Ayarlar) — header'daki davet yazısı ve linki
  const [insta, setInsta] = useState<InstagramSetting>({ text: "", url: "" });
  const [instaSaved, setInstaSaved] = useState(false);

  // Arama alanları — üyeler (isim/e-posta) ve üye manifestleri (kod/rumuz)
  const [mSearch, setMSearch] = useState("");
  const [mSort, setMSort] = useState<"new" | "old">("new");
  const [manSearch, setManSearch] = useState("");

  // Üye manifestleri: sunucu taraflı sayfalı liste (100 bin+ kayıt için)
  const [manSort, setManSort] = useState<"new" | "old">("new");
  const [manFilter, setManFilter] = useState("all");
  const [manPage, setManPage] = useState(0);
  const [manList, setManList] = useState<AdminManifestList | null>(null);
  const [luckAmt, setLuckAmt] = useState<Record<string, string>>({});

  // Silme gerekçesi — modaldaki seçim ("none" = gerekçesiz bildirim)
  const [delReason, setDelReason] = useState("none");

  // Demo üretimi (Ayarlar) — ölçek testleri için toplu demo manifest
  const [demoCount, setDemoCount] = useState("1000");
  const [demoBusy, setDemoBusy] = useState(false);
  const [demoMsg, setDemoMsg] = useState("");

  // Yapay zeka denetim anahtarı — Ayarlar sekmesinden girilir
  const [aiKey, setAiKey] = useState("");
  const [aiSaved, setAiSaved] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);

  // Süren denetimin ilerlemesi — "Şimdi kontrol et" sırasında yoklanır
  const [modProg, setModProg] = useState<ModProgress | null>(null);
  const [modAnim, setModAnim] = useState(0); // aktif pencerede geçen ~saniye
  const [modErr, setModErr] = useState("");

  // Tarih+saat aralığı taraması — admin istediği aralıktaki her şeyi taratır
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");

  // Koşu listesi: tarihe göre filtre + 20'şerli sayfalama
  const [modSearch, setModSearch] = useState("");
  const [modPage, setModPage] = useState(0);

  // Bildirim ayarları — SMTP + Google Client ID (üye ekranı bunları okur)
  const [mailCfg, setMailCfg] = useState<MailConfig | null>(null);
  const [mailSaved, setMailSaved] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);
  const [testBusy, setTestBusy] = useState(false);

  // Önce oturum kontrolü; yetki varsa veriler backend'den yüklenir
  useEffect(() => {
    adminCheck().then(setAuthed);
  }, []);

  useEffect(() => {
    if (!authed) return;
    Promise.all([
      adminUsers(),
      adminReports(),
      adminSettings(),
      adminModeration(),
      adminSponsors(),
      adminContactMessages(),
    ]).then(([u, r, s, m, sp, cm]) => {
      setUsers(u);
      setReports(r);
      setModRuns(m);
      setSponsors(sp);
      setContacts(cm);
      if (s) {
        setAds(s.ads);
        setTestMode(s.testMode);
        setMailCfg(s.mail);
        setAiKey(s.aiKey ?? "");
        setAiEnabled(!!s.aiEnabled);
        setFaq(s.faq ?? []);
        setInsta(s.instagram ?? { text: "", url: "" });
      }
      setReady(true);
    });
  }, [authed]);

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setAdminErr("");
    const r = await adminLogin(adminPass);
    if (!r.ok) return setAdminErr("Şifre hatalı.");
    setAuthed(true);
  }

  function patchMail(p: Partial<MailConfig>) {
    setMailSaved(false);
    setMailCfg((c) => (c ? { ...c, ...p } : c));
  }

  function reload() {
    adminUsers().then(setUsers);
  }

  // ── Sponsor kampanyaları ───────────────────────────────────────────────

  function patchSp(p: Partial<SponsorCampaign>) {
    setSpErr("");
    setSpEdit((e) => (e ? { ...e, ...p } : e));
  }

  // Logo dosyası → küçültülmüş PNG data URL (en fazla 600px genişlik)
  function onLogoFile(file: File) {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 600 / img.width);
      const cv = document.createElement("canvas");
      cv.width = Math.max(1, Math.round(img.width * scale));
      cv.height = Math.max(1, Math.round(img.height * scale));
      cv.getContext("2d")!.drawImage(img, 0, 0, cv.width, cv.height);
      patchSp({ rawLogo: cv.toDataURL("image/png") });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setSpErr("Görsel okunamadı — PNG/JPG/SVG deneyin.");
    };
    img.src = url;
  }

  async function saveSponsor() {
    if (!spEdit) return;
    if (!spEdit.brand.trim()) return setSpErr("Marka adı gerekli.");
    if (!spEdit.freq || spEdit.freq < 2)
      return setSpErr("Sıklık en az 2 olmalı (her 2 zarfta 1).");
    setSpBusy(true);
    const r = await adminSaveSponsor(spEdit).catch(() => null);
    setSpBusy(false);
    if (!r?.ok) return setSpErr(r?.error ?? "Kaydedilemedi.");
    setSponsors(await adminSponsors());
    setSpEdit(null);
  }

  async function deleteSponsor(id: number) {
    await adminDeleteSponsor(id).catch(() => null);
    setSpDelId(null);
    if (spEdit?.id === id) setSpEdit(null);
    setSponsors(await adminSponsors());
  }

  // Durdur / devam ettir — kampanyayı silmeden yayından alıp geri getirir
  async function toggleSponsor(c: SponsorCampaign) {
    await adminSaveSponsor({ ...c, active: !c.active }).catch(() => null);
    // Aynı kampanya düzenleyicide açıksa bayrağı orada da güncelle
    if (spEdit?.id === c.id) patchSp({ active: !c.active });
    setSponsors(await adminSponsors());
  }

  // ── Saatlik AI kontrolü ────────────────────────────────────────────────

  function refreshModeration() {
    void adminModeration().then(setModRuns);
  }

  function generateDemos() {
    const n = Number(demoCount);
    if (!n || n < 1) return setDemoMsg("Geçerli bir adet girin.");
    setDemoBusy(true);
    setDemoMsg("Üretiliyor… (büyük adetlerde ~30 sn sürebilir)");
    void adminGenerateDemo(n)
      .then((r) => {
        setDemoMsg(
          r.ok
            ? `${(r.inserted ?? 0).toLocaleString("tr-TR")} demo üretildi — toplam ${(r.totalDemo ?? 0).toLocaleString("tr-TR")} demo var.`
            : (r.error ?? "Üretim başarısız."),
        );
        refreshManifests();
        reload();
      })
      .finally(() => setDemoBusy(false));
  }

  function deleteDemos() {
    if (!window.confirm("Tüm demo manifestler silinsin mi?")) return;
    setDemoBusy(true);
    void adminDeleteDemos()
      .then((r) => {
        setDemoMsg(
          `${(r.deleted ?? 0).toLocaleString("tr-TR")} demo manifest silindi.`,
        );
        refreshManifests();
        reload();
      })
      .finally(() => setDemoBusy(false));
  }

  function saveAiKey() {
    void adminSaveSettings({ aiKey: aiKey.trim() }).then(() =>
      setAiSaved(true),
    );
  }

  function toggleAiEnabled() {
    const next = !aiEnabled;
    setAiEnabled(next);
    void adminSaveSettings({ aiEnabled: next });
  }

  function startModeration(range?: { from: number; to: number }) {
    setModBusy(true);
    setModErr("");
    setModProg({
      active: true,
      startedAt: Date.now(),
      totalWindows: 0,
      doneWindows: 0,
      scanning: 0,
    });
    // Sunucudaki gerçek ilerleme ~saniyede bir yoklanır; aynı pencerede
    // beklerken çubuk zamanla yumuşakça ilerlesin diye modAnim sayılır
    let anim = 0;
    let lastDone = -1;
    const iv = setInterval(() => {
      void adminModerationProgress().then((p) => {
        if (!p) return;
        if (p.doneWindows !== lastDone) {
          lastDone = p.doneWindows;
          anim = 0;
        } else {
          anim += 0.8;
        }
        setModAnim(anim);
        setModProg(p);
      });
    }, 800);
    void adminModerationRun(range)
      .then((r) => {
        if (r?.error) setModErr(r.error);
        refreshModeration();
      })
      .finally(() => {
        clearInterval(iv);
        setModProg(null);
        setModAnim(0);
        setModBusy(false);
      });
  }

  function runRangeScanNow() {
    if (!rangeFrom || !rangeTo)
      return setModErr("Başlangıç ve bitiş tarih-saatini seçin.");
    const from = new Date(rangeFrom).getTime();
    const to = new Date(rangeTo).getTime();
    if (isNaN(from) || isNaN(to) || from >= to)
      return setModErr("Tarih aralığı geçersiz.");
    startModeration({ from, to });
  }

  // Çubuk doluluğu: biten pencereler + aktif pencerenin zaman tahmini
  // (tek pencere ~20 sn varsayımıyla, %95'te bekletilir)
  const modBarFrac = modProg?.active
    ? (modProg.doneWindows + Math.min(modAnim / 20, 0.95)) /
      Math.max(1, modProg.totalWindows)
    : modBusy
      ? 0.05
      : 0;

  function decideFlag(id: number, action: "approve" | "delete") {
    setFlagBusy(id);
    void adminModerationDecide(id, action)
      .then(() => {
        refreshModeration();
        if (action === "delete") reload(); // üyenin manifest listesi de değişti
      })
      .finally(() => setFlagBusy(null));
  }

  const modPending = modRuns.reduce(
    (n, r) => n + r.flags.filter((f) => f.status === "pending").length,
    0,
  );

  // Tarihe göre filtre: seçilen günle kesişen koşular gösterilir
  const modFiltered = modSearch
    ? modRuns.filter((r) => {
        const d0 = new Date(modSearch + "T00:00:00").getTime();
        return r.windowEnd >= d0 && r.windowStart < d0 + 86400000;
      })
    : modRuns;
  const MOD_PER_PAGE = 20;
  const modPages = Math.max(1, Math.ceil(modFiltered.length / MOD_PER_PAGE));
  const modPageSafe = Math.min(modPage, modPages - 1);
  const modPageRuns = modFiltered.slice(
    modPageSafe * MOD_PER_PAGE,
    (modPageSafe + 1) * MOD_PER_PAGE,
  );

  // saveUser karşılığı: üyeyi backend'e yazar, listeyi tazeler
  function saveUser(next: User) {
    void adminSaveUser(next).then(reload);
  }


  // ── Onaylar ────────────────────────────────────────────────────────────
  const [confirmDelUser, setConfirmDelUser] = useState<User | null>(null);
  const [confirmDelMan, setConfirmDelMan] =
    useState<AdminManifestItem | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  function toggleVerified(u: User) {
    saveUser({ ...u, verified: !u.verified });
    reload();
  }

  // Manifest listesi sunucudan gelir; arama yazarken kısa debounce
  function refreshManifests() {
    void adminManifests({
      q: manSearch.trim(),
      filter: manFilter,
      sort: manSort,
      page: manPage,
    }).then((r) => r && setManList(r));
  }
  useEffect(() => {
    if (!authed) return;
    const t = setTimeout(refreshManifests, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, manSearch, manFilter, manSort, manPage]);

  const manPages = Math.max(
    1,
    Math.ceil((manList?.filtered ?? 0) / (manList?.perPage ?? 50)),
  );
  const EMPTY_COUNTS = {
    total: 0, sticker: 0, special: 0, bottled: 0,
    boxed: 0, realized: 0, demo: 0, totalLuck: 0,
  };
  const manCounts = manList?.counts ?? EMPTY_COUNTS;

  // Gerekçeli silme — manifest kaldırılır, sahibine bilgilendirme maili
  // gider (delReason "none" ise gerekçesiz bildirim)
  function delManifestWithReason() {
    if (!confirmDelMan) return;
    void adminDeleteManifest(
      confirmDelMan.code,
      delReason === "none" ? null : delReason,
    ).then(() => {
      refreshManifests();
      reload();
      refreshModeration();
    });
    setConfirmDelMan(null);
  }

  // Şans gönderme — girilen miktar manifestin şansına eklenir
  function sendLuck(code: string) {
    const amt = Number(luckAmt[code] ?? "");
    if (!amt || amt <= 0) return;
    void adminAddLuck(code, amt).then(refreshManifests);
    setLuckAmt((s) => ({ ...s, [code]: "" }));
  }

  function toggleAds() {
    const next = !ads;
    setAds(next);
    void adminSaveSettings({ ads: next });
  }

  function toggleTestMode() {
    const next = !testMode;
    setTestMode(next);
    void adminSaveSettings({ testMode: next });
  }

  function resetMemberData() {
    // Tüm üye verileri silinir, test hesabı yeniden tohumlanır
    void adminResetMembers().then(reload);
    setConfirmReset(false);
  }

  // ── Genel bakış istatistikleri — manifest sayıları sunucudan gelir ─────
  const stats = useMemo(
    () => ({
      members: users.length,
      verified: users.filter((u) => u.verified).length,
      manifests: manCounts.total,
      realized: manCounts.realized,
      bottled: manCounts.bottled,
      boxed: manCounts.boxed,
      demo: manCounts.demo,
      totalLuck: manCounts.totalLuck,
    }),
    [users, manCounts],
  );

  // Yetki yokken şifre ekranı; kontrol sürerken boş ekran
  if (authed === false)
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
        <form
          onSubmit={handleAdminLogin}
          className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        >
          <h1 className="text-lg font-bold text-neutral-800">
            🛠️ Admin Paneli
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Devam etmek için admin şifresini gir.
          </p>
          <input
            type="password"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            placeholder="Admin şifresi"
            className={`${inputCls} mt-4`}
            autoFocus
          />
          {adminErr && (
            <p className="mt-2 text-xs font-medium text-red-500">{adminErr}</p>
          )}
          <button
            type="submit"
            className="mt-4 w-full cursor-pointer rounded-xl bg-neutral-800 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
          >
            Giriş Yap
          </button>
        </form>
      </main>
    );

  if (!ready) return null;


  // Üye araması: isim veya e-posta; kayıt tarihine göre sıralanır
  const mQ = mSearch.trim().toLocaleLowerCase("tr");
  const usersFiltered = (
    mQ
      ? users.filter(
          (u) =>
            u.name.toLocaleLowerCase("tr").includes(mQ) ||
            u.email.toLowerCase().includes(mQ),
        )
      : [...users]
  ).sort((a, b) =>
    mSort === "new"
      ? (b.createdTs ?? 0) - (a.createdTs ?? 0)
      : (a.createdTs ?? 0) - (b.createdTs ?? 0),
  );


  const TABS = [
    { key: "overview", label: "Genel Bakış" },
    { key: "members", label: "Üyeler" },
    { key: "manifests", label: "Manifestler" },
    { key: "reports", label: "Bildirilenler" },
    { key: "sponsors", label: "Reklam" },
    { key: "content", label: "İçerik" },
    { key: "mail", label: "Ayarlar" },
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
            <select
              value={mSort}
              onChange={(e) => setMSort(e.target.value as "new" | "old")}
              className="cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none"
            >
              <option value="new">En yeniden en eskiye</option>
              <option value="old">En eskiden en yeniye</option>
            </select>
            <span className="ml-auto text-xs font-semibold text-neutral-500">
              {usersFiltered.length} / {users.length} üye
            </span>
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
                      <td className={tdCls}>{u.manifestCount ?? 0}</td>
                      <td className={`${tdCls} text-right`}>
                        <button
                          type="button"
                          onClick={() => setConfirmDelUser(u)}
                          className="cursor-pointer rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-100"
                        >
                          Sil
                        </button>
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

        {/* ── Üye Manifestleri — sunucu taraflı sayfalı liste ── */}
        {tab === "manifests" && (
          <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              value={manSearch}
              onChange={(e) => { setManSearch(e.target.value); setManPage(0); }}
              placeholder="Zarf kodu, rumuz veya sahip ara…"
              className={`${inputCls} max-w-64`}
            />
            <select
              value={manSort}
              onChange={(e) => { setManSort(e.target.value as "new" | "old"); setManPage(0); }}
              className="cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none"
            >
              <option value="new">En yeniden en eskiye</option>
              <option value="old">En eskiden en yeniye</option>
            </select>
            <select
              value={manFilter}
              onChange={(e) => { setManFilter(e.target.value); setManPage(0); }}
              className="cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none"
            >
              <option value="all">Tümü ({manCounts.total.toLocaleString("tr-TR")})</option>
              <option value="member">Üye ({(manCounts.total - manCounts.demo).toLocaleString("tr-TR")})</option>
              <option value="demo">Demo ({manCounts.demo.toLocaleString("tr-TR")})</option>
              <option value="sticker">Sticker&apos;lı ({manCounts.sticker.toLocaleString("tr-TR")})</option>
              <option value="special">Özel renkli ({manCounts.special.toLocaleString("tr-TR")})</option>
              <option value="bottled">Şişede ({manCounts.bottled.toLocaleString("tr-TR")})</option>
              <option value="boxed">Kutuda ({manCounts.boxed.toLocaleString("tr-TR")})</option>
              <option value="realized">Gerçekleşmiş ({manCounts.realized.toLocaleString("tr-TR")})</option>
            </select>
            <span className="ml-auto text-xs font-semibold text-neutral-500">
              {(manList?.filtered ?? 0).toLocaleString("tr-TR")} / {manCounts.total.toLocaleString("tr-TR")} manifest
            </span>
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
                {(manList?.items ?? []).map((m) => (
                  <tr
                    key={m.code}
                    className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/60"
                  >
                    <td className={`${tdCls} whitespace-nowrap`}>
                      <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-sky-700">
                        {m.code}
                        <CopyBtn text={m.code} />
                        {m.demo && (
                          <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-sans text-[9px] font-semibold uppercase text-neutral-400">
                            demo
                          </span>
                        )}
                      </span>
                    </td>
                    <td className={`${tdCls} max-w-28 truncate text-xs`}>{m.owner}</td>
                    <td className={`${tdCls} max-w-32 truncate font-semibold`}>{m.name}</td>
                    <td className={`${tdCls} max-w-56`}>
                      <span className="block truncate text-xs text-neutral-500">{m.manifest}</span>
                    </td>
                    <td className={`${tdCls} whitespace-nowrap`}>
                      {/* Şans gönder — girilen miktar mevcut şansa eklenir */}
                      <span className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-amber-600">⭐ {m.luck}</span>
                        <input
                          value={luckAmt[m.code] ?? ""}
                          onChange={(e) =>
                            setLuckAmt((s) => ({ ...s, [m.code]: e.target.value.replace(/\D/g, "") }))
                          }
                          placeholder="miktar"
                          inputMode="numeric"
                          className="w-16 rounded-lg border border-neutral-200 bg-white px-1.5 py-1 text-xs text-neutral-700 outline-none placeholder:text-neutral-300"
                        />
                        <button
                          type="button"
                          onClick={() => sendLuck(m.code)}
                          disabled={!Number(luckAmt[m.code] ?? "")}
                          className="cursor-pointer rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700 transition-colors hover:bg-amber-200 disabled:cursor-default disabled:opacity-40"
                        >
                          Gönder
                        </button>
                      </span>
                    </td>
                    <td className={tdCls}>
                      <ManifestChips m={m} />
                      {pendingRewards(m).map((w) => (
                        <Chip key={w} tone="neutral" title="Üye onayı bekliyor">
                          {w}
                        </Chip>
                      ))}
                    </td>
                    <td className={`${tdCls} whitespace-nowrap text-xs`}>{m.date}</td>
                    <td className={`${tdCls} text-right`}>
                      <button
                        type="button"
                        onClick={() => { setDelReason("none"); setConfirmDelMan(m); }}
                        className="cursor-pointer rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-100"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
                {(manList?.items ?? []).length === 0 && (
                  <tr>
                    <td className={`${tdCls} text-neutral-400`} colSpan={8}>
                      Kayıt yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
          {manPages > 1 && (
            <div className="flex items-center justify-center gap-3 text-sm">
              <button
                type="button"
                disabled={manPage === 0}
                onClick={() => setManPage(manPage - 1)}
                className="cursor-pointer rounded-full bg-white px-4 py-1.5 font-medium text-neutral-600 shadow-sm transition-colors hover:bg-neutral-50 disabled:cursor-default disabled:opacity-40"
              >
                ← Önceki
              </button>
              <span className="text-xs text-neutral-500">
                Sayfa {manPage + 1} / {manPages}
              </span>
              <button
                type="button"
                disabled={manPage >= manPages - 1}
                onClick={() => setManPage(manPage + 1)}
                className="cursor-pointer rounded-full bg-white px-4 py-1.5 font-medium text-neutral-600 shadow-sm transition-colors hover:bg-neutral-50 disabled:cursor-default disabled:opacity-40"
              >
                Sonraki →
              </button>
            </div>
          )}
          </div>
        )}

        {/* ── Bildirilenler — AI kontrolü + duvardan gelen şikâyetler ── */}
        {tab === "reports" && (
          <div className="mt-5 space-y-4">
            {/* ── Saatlik kontrole takılanlar — AI denetimi ── */}
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-neutral-700">
                  🕐 Saatlik Kontrole Takılanlar
                  {modPending > 0 && (
                    <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-600">
                      {modPending} bekliyor
                    </span>
                  )}
                </h2>
              </div>
              {/* Tarih+saat aralığı denetimi */}
              <div className="mt-3 flex flex-wrap items-end gap-2 rounded-xl bg-neutral-50 px-3.5 py-3">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    Başlangıç
                  </span>
                  <input
                    type="datetime-local"
                    value={rangeFrom}
                    onChange={(e) => setRangeFrom(e.target.value)}
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    Bitiş
                  </span>
                  <input
                    type="datetime-local"
                    value={rangeTo}
                    onChange={(e) => setRangeTo(e.target.value)}
                    className={inputCls}
                  />
                </label>
                <button
                  type="button"
                  onClick={runRangeScanNow}
                  disabled={modBusy}
                  className="cursor-pointer rounded-full bg-neutral-800 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-neutral-700 disabled:cursor-default disabled:opacity-50"
                >
                  {modBusy
                    ? "Denetleniyor…"
                    : "🔍 Aralıktaki manifestleri denetle"}
                </button>
              </div>
              {modErr && (
                <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-semibold leading-relaxed text-red-600">
                  {modErr}
                </p>
              )}
              {!aiKey.trim() && (
                <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-700">
                  ⚠︎ API anahtarı tanımlı değil — &quot;⚙️ Ayarlar&quot;
                  sekmesinden ekleyin.
                </p>
              )}
              {aiKey.trim() !== "" && !aiEnabled && (
                <p className="mt-3 rounded-xl bg-sky-50 px-4 py-2.5 text-xs leading-relaxed text-sky-700">
                  💤 Otomatik saatlik kontrol kapalı — &quot;⚙️ Ayarlar&quot;
                  sekmesinden açabilirsiniz.
                </p>
              )}

              {/* İlerleme çubuğu — denetim sürerken gerçek durumla dolar */}
              {(modBusy || modProg?.active) && (
                <div className="mt-4">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.round(Math.max(0.05, Math.min(modBarFrac, 0.98)) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] font-medium text-neutral-400">
                    {modProg && modProg.totalWindows > 0 ? (
                      <>
                        Denetleniyor… {modProg.doneWindows}/
                        {modProg.totalWindows} pencere tamamlandı
                        {modProg.scanning > 0 &&
                          ` · ${modProg.scanning} manifest AI tarafından inceleniyor`}
                        {" · %"}
                        {Math.round(Math.min(modBarFrac, 0.98) * 100)}
                      </>
                    ) : (
                      "Denetim başlatılıyor…"
                    )}
                  </p>
                </div>
              )}

              {/* Tarama geçmişinde tarihe göre arama */}
              {modRuns.length > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    Tarihe git
                  </span>
                  <input
                    type="date"
                    value={modSearch}
                    onChange={(e) => {
                      setModSearch(e.target.value);
                      setModPage(0);
                    }}
                    className={`${inputCls} max-w-44`}
                  />
                  {modSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setModSearch("");
                        setModPage(0);
                      }}
                      className="cursor-pointer rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
                    >
                      Temizle
                    </button>
                  )}
                </div>
              )}

              {modFiltered.length === 0 ? (
                <p className="mt-4 rounded-xl bg-neutral-50 px-4 py-3 text-center text-xs text-neutral-400">
                  {modSearch
                    ? "Bu tarihte tarama yok."
                    : "Henüz kontrol yapılmadı."}
                </p>
              ) : (
                <div className="mt-4 space-y-1.5">
                  {modPageRuns.map((run) => {
                    const pending = run.flags.filter(
                      (f) => f.status === "pending",
                    ).length;
                    const open = openRun === run.id;
                    return (
                      <div
                        key={run.id}
                        className="overflow-hidden rounded-xl border border-neutral-100"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenRun(open ? null : run.id)
                          }
                          disabled={run.flags.length === 0 && run.status === "ok"}
                          className={`flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-xs transition-colors ${
                            run.flags.length > 0
                              ? "cursor-pointer hover:bg-neutral-50"
                              : "cursor-default"
                          }`}
                        >
                          <span className="font-semibold text-neutral-600">
                            {run.kind === "range"
                              ? fmtRange(run.windowStart, run.windowEnd)
                              : fmtWindow(run.windowStart, run.windowEnd)}
                          </span>
                          {run.kind === "range" && (
                            <Chip tone="sky">🔍 aralık taraması</Chip>
                          )}
                          <span className="text-neutral-400">
                            · {run.scanned} manifest tarandı
                          </span>
                          {run.status === "failed" ? (
                            <Chip tone="red" title={run.error}>
                              hata — yeniden denenecek
                            </Chip>
                          ) : run.flags.length === 0 ? (
                            <Chip tone="emerald">temiz ✓</Chip>
                          ) : (
                            <Chip tone={pending > 0 ? "red" : "neutral"}>
                              {run.flags.length} takıldı
                              {pending > 0 ? ` · ${pending} bekliyor` : ""}
                            </Chip>
                          )}
                          {run.flags.length > 0 && (
                            <span className="ml-auto text-neutral-300">
                              {open ? "▲" : "▼"}
                            </span>
                          )}
                        </button>

                        {open && run.flags.length > 0 && (
                          <div className="space-y-3 border-t border-neutral-100 bg-neutral-50/50 p-3.5">
                            {run.flags.map((f) => {
                              const cat =
                                MOD_CATEGORIES[f.category as ModCategory];
                              return (
                                <div
                                  key={f.id}
                                  className="rounded-xl bg-white p-3.5 shadow-sm"
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cat?.chip ?? "bg-neutral-100 text-neutral-600"}`}
                                      title={cat?.desc}
                                    >
                                      {cat?.label ?? f.category}
                                    </span>
                                    {f.selfHarm && (
                                      <Chip
                                        tone="violet"
                                        title="İçerikte kendine zarar iması tespit edildi — silseniz bile standart kural maili gönderilmez."
                                      >
                                        ⚠︎ hassas içerik
                                      </Chip>
                                    )}
                                    <span className="text-[11px] text-neutral-400">
                                      güven %{Math.round(f.confidence * 100)}
                                    </span>
                                    <span className="ml-auto flex items-center gap-1 font-mono text-[11px] font-bold text-sky-700">
                                      {f.code}
                                      <CopyBtn text={f.code} />
                                    </span>
                                    <span className="text-xs font-semibold text-neutral-600">
                                      {f.name}
                                    </span>
                                  </div>
                                  <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                                    {f.manifest}
                                  </p>
                                  <p className="mt-1.5 text-[11.5px] italic text-neutral-400">
                                    AI gerekçesi: {f.reason}
                                  </p>
                                  <div className="mt-2.5 flex items-center gap-2">
                                    {f.status === "pending" ? (
                                      <>
                                        <button
                                          type="button"
                                          disabled={flagBusy === f.id}
                                          onClick={() =>
                                            decideFlag(f.id, "approve")
                                          }
                                          className="cursor-pointer rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-default disabled:opacity-50"
                                        >
                                          ✓ Onayla — duvarda kalsın
                                        </button>
                                        <button
                                          type="button"
                                          disabled={flagBusy === f.id}
                                          onClick={() =>
                                            decideFlag(f.id, "delete")
                                          }
                                          className="cursor-pointer rounded-full border border-red-200 bg-red-50 px-3.5 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-default disabled:opacity-50"
                                        >
                                          🗑 Sil{f.selfHarm ? "" : " ve bildir"}
                                        </button>
                                      </>
                                    ) : f.status === "approved" ? (
                                      <Chip tone="emerald">
                                        onaylandı — duvarda
                                      </Chip>
                                    ) : (
                                      <Chip tone="neutral">
                                        silindi ve duvardan kaldırıldı
                                      </Chip>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Sayfalama — 20 tarama / sayfa */}
              {modPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-3 text-sm">
                  <button
                    type="button"
                    disabled={modPageSafe === 0}
                    onClick={() => setModPage(modPageSafe - 1)}
                    className="cursor-pointer rounded-full bg-white px-4 py-1.5 font-medium text-neutral-600 shadow-sm transition-colors hover:bg-neutral-50 disabled:cursor-default disabled:opacity-40"
                  >
                    ← Önceki
                  </button>
                  <span className="text-xs text-neutral-500">
                    Sayfa {modPageSafe + 1} / {modPages}
                  </span>
                  <button
                    type="button"
                    disabled={modPageSafe >= modPages - 1}
                    onClick={() => setModPage(modPageSafe + 1)}
                    className="cursor-pointer rounded-full bg-white px-4 py-1.5 font-medium text-neutral-600 shadow-sm transition-colors hover:bg-neutral-50 disabled:cursor-default disabled:opacity-40"
                  >
                    Sonraki →
                  </button>
                </div>
              )}
            </section>

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
                              void adminRemoveReport(r.code, r.ts).then(() =>
                                adminReports().then(setReports),
                              );
                              setReports((list) =>
                                list.filter(
                                  (x) => !(x.code === r.code && x.ts === r.ts),
                                ),
                              );
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

        {/* ── Reklam: sponsorlu zarf kampanyaları ── */}
        {tab === "sponsors" && (
          <div className="mt-5 space-y-5">
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-neutral-700">
                    📣 Sponsorlu Zarf Kampanyaları
                  </h2>
                  <p className="mt-1 text-xs text-neutral-400">
                    Marka zarfları duvardaki zarfların arasına, seçtiğin
                    sıklıkla serpiştirilir; normal zarflardan ~%35 büyük
                    görünür. Konumlar her gece 02:00&apos;da yeniden dağılır.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSpErr("");
                    setSpEdit({ ...BLANK_SPONSOR });
                  }}
                  className="cursor-pointer rounded-xl bg-neutral-800 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-700"
                >
                  + Yeni Kampanya
                </button>
              </div>

              {sponsors.length === 0 ? (
                <p className="mt-4 rounded-xl bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-400">
                  Henüz kampanya yok — &quot;Yeni Kampanya&quot; ile ilk marka
                  zarfını oluştur.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {sponsors.map((c) => {
                    const st = sponsorStatus(c);
                    return (
                      <div
                        key={c.id}
                        className="flex flex-wrap items-center gap-4 rounded-xl bg-neutral-50 p-3"
                      >
                        <SponsorEnvelopePreview c={c} w={104} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-neutral-800">
                              {c.brand}
                            </p>
                            <Chip tone={st.tone}>{st.label}</Chip>
                            <Chip tone="neutral">
                              her {c.freq.toLocaleString("tr-TR")} zarfta 1
                            </Chip>
                          </div>
                          <p className="mt-1 text-xs text-neutral-400">
                            {c.startTs
                              ? `${new Date(c.startTs).toLocaleString("tr-TR", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })} →`
                              : "Hemen →"}{" "}
                            {c.endTs
                              ? new Date(c.endTs).toLocaleString("tr-TR", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "süresiz"}
                            {c.coupon && ` · Kod: ${c.coupon}`}
                          </p>
                          {/* Metrikler: açılma / link / kod (cihaz başına
                              günde 1 açılma sayılır) */}
                          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-neutral-500">
                            <span title="Kaç kişi zarfı açtı">
                              ✉️ {c.views.toLocaleString("tr-TR")} açılma
                            </span>
                            <span title="Kaç kişi link butonuna tıkladı">
                              🔗 {c.linkClicks.toLocaleString("tr-TR")} link
                              tıklaması
                            </span>
                            <span title="Kaç kişi hediye kodunu kopyaladı">
                              🎟️ {c.couponClicks.toLocaleString("tr-TR")} kod
                              kopyalama
                            </span>
                            {c.views > 0 && (
                              <span
                                title="Link tıklama / açılma oranı"
                                className="text-emerald-600"
                              >
                                %{Math.round((c.linkClicks / c.views) * 100)}{" "}
                                dönüşüm
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {c.active ? (
                            <button
                              type="button"
                              onClick={() => void toggleSponsor(c)}
                              title="Zarflar duvardan kalkar; kampanya ve metrikler silinmez"
                              className="cursor-pointer rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-600 transition-colors hover:bg-amber-100"
                            >
                              ⏸ Durdur
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => void toggleSponsor(c)}
                              title="Zarflar duvara geri gelir (tarih penceresi de uygunsa)"
                              className="cursor-pointer rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-100"
                            >
                              ▶ Devam Ettir
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSpErr("");
                              setSpDelId(null);
                              setSpEdit({ ...c });
                            }}
                            className="cursor-pointer rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:border-neutral-400"
                          >
                            Düzenle
                          </button>
                          {spDelId === c.id ? (
                            <button
                              type="button"
                              onClick={() => void deleteSponsor(c.id)}
                              className="cursor-pointer rounded-full bg-red-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600"
                            >
                              Emin misin?
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSpDelId(c.id)}
                              className="cursor-pointer rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:border-red-300 hover:text-red-500"
                            >
                              Sil
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Düzenleyici — canlı önizlemeli */}
            {spEdit && (
              <section className="rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold text-neutral-700">
                  {spEdit.id > 0
                    ? `✏️ ${spEdit.brand} kampanyasını düzenle`
                    : "✨ Yeni kampanya"}
                </h2>
                <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_280px]">
                  <div className="space-y-5">
                    {/* Genel */}
                    <div className="rounded-xl bg-neutral-50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                        Genel
                      </p>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1 block text-xs font-medium text-neutral-500">
                            Marka adı
                          </span>
                          <input
                            className={inputCls}
                            value={spEdit.brand}
                            onChange={(e) => patchSp({ brand: e.target.value })}
                            placeholder="Petimemama"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-xs font-medium text-neutral-500">
                            Sıklık — her kaç zarfta 1?
                          </span>
                          <input
                            type="number"
                            min={2}
                            className={inputCls}
                            value={spEdit.freq}
                            onChange={(e) =>
                              patchSp({ freq: Math.floor(Number(e.target.value)) })
                            }
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-xs font-medium text-neutral-500">
                            Yayın başlangıcı (boş: hemen)
                          </span>
                          <input
                            type="datetime-local"
                            className={inputCls}
                            value={tsToLocal(spEdit.startTs)}
                            onChange={(e) =>
                              patchSp({ startTs: localToTs(e.target.value) })
                            }
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-xs font-medium text-neutral-500">
                            Yayın bitişi (boş: süresiz)
                          </span>
                          <input
                            type="datetime-local"
                            className={inputCls}
                            value={tsToLocal(spEdit.endTs)}
                            onChange={(e) =>
                              patchSp({ endTs: localToTs(e.target.value) })
                            }
                          />
                        </label>
                      </div>
                      <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-600">
                        <input
                          type="checkbox"
                          checked={spEdit.active}
                          onChange={(e) => patchSp({ active: e.target.checked })}
                          className="h-4 w-4 accent-emerald-500"
                        />
                        Kampanya aktif (tarih penceresiyle birlikte değerlendirilir)
                      </label>
                    </div>

                    {/* Zarf görünümü */}
                    <div className="rounded-xl bg-neutral-50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                        Zarf görünümü
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
                        <ColorField
                          label="Zarf içi (gövde)"
                          value={spEdit.bodyColor}
                          onChange={(v) => patchSp({ bodyColor: v })}
                        />
                        <ColorField
                          label="Kapak (dış)"
                          value={spEdit.flapColor}
                          onChange={(v) => patchSp({ flapColor: v })}
                        />
                        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-neutral-600">
                          <input
                            type="checkbox"
                            checked={!!(spEdit.bodyColor2 || spEdit.flapColor2)}
                            onChange={(e) =>
                              e.target.checked
                                ? patchSp({
                                    bodyColor2: spEdit.bodyColor,
                                    flapColor2: spEdit.flapColor,
                                  })
                                : patchSp({ bodyColor2: "", flapColor2: "" })
                            }
                            className="h-4 w-4 accent-violet-500"
                          />
                          Degrade (gradient)
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-neutral-600">
                          <input
                            type="checkbox"
                            checked={spEdit.gloss}
                            onChange={(e) => patchSp({ gloss: e.target.checked })}
                            className="h-4 w-4 accent-violet-500"
                          />
                          Parlak yüzey
                        </label>
                      </div>
                      {(spEdit.bodyColor2 || spEdit.flapColor2) && (
                        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg bg-white px-3 py-2.5">
                          <ColorField
                            label="Gövde 2. renk"
                            value={spEdit.bodyColor2}
                            onChange={(v) => patchSp({ bodyColor2: v })}
                          />
                          <ColorField
                            label="Kapak 2. renk"
                            value={spEdit.flapColor2}
                            onChange={(v) => patchSp({ flapColor2: v })}
                          />
                          <label className="flex items-center gap-2 text-xs font-medium text-neutral-600">
                            Degrade tarzı
                            <select
                              value={spEdit.gradient}
                              onChange={(e) =>
                                patchSp({
                                  gradient: e.target.value as SponsorGradient,
                                })
                              }
                              className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs"
                            >
                              <option value="linear">Dikey geçiş</option>
                              <option value="diagonal">Çapraz geçiş</option>
                              <option value="radial">Dairesel geçiş</option>
                            </select>
                          </label>
                        </div>
                      )}
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <label className="block">
                          <span className="mb-1 block text-xs font-medium text-neutral-500">
                            Etiket yazısı
                          </span>
                          <input
                            className={inputCls}
                            value={spEdit.label}
                            onChange={(e) => patchSp({ label: e.target.value })}
                            placeholder="Sponsorlu"
                          />
                        </label>
                        <label className="block sm:col-span-2">
                          <span className="mb-1 block text-xs font-medium text-neutral-500">
                            Etiket yüksekliği — üstten %{spEdit.labelY}
                          </span>
                          <input
                            type="range"
                            min={5}
                            max={85}
                            value={spEdit.labelY}
                            onChange={(e) =>
                              patchSp({ labelY: Number(e.target.value) })
                            }
                            className="mt-2.5 w-full cursor-pointer accent-violet-500"
                          />
                        </label>
                        <div className="flex items-end pb-1">
                          <ColorField
                            label="Etiket zemini"
                            value={spEdit.labelBg}
                            onChange={(v) => patchSp({ labelBg: v })}
                          />
                        </div>
                        <div className="flex items-end pb-1">
                          <ColorField
                            label="Etiket yazı rengi"
                            value={spEdit.labelColor}
                            onChange={(v) => patchSp({ labelColor: v })}
                          />
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <label className="block sm:col-span-1">
                          <span className="mb-1 block text-xs font-medium text-neutral-500">
                            Logo (PNG/JPG — şeffaf PNG önerilir)
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) onLogoFile(f);
                            }}
                            className="block w-full cursor-pointer text-xs text-neutral-500 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-neutral-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-neutral-700"
                          />
                        </label>
                        <label className="block sm:col-span-2">
                          <span className="mb-1 block text-xs font-medium text-neutral-500">
                            Logo boyutu — zarf genişliğinin %{spEdit.logoW}&apos;i
                          </span>
                          <input
                            type="range"
                            min={15}
                            max={95}
                            value={spEdit.logoW}
                            onChange={(e) =>
                              patchSp({ logoW: Number(e.target.value) })
                            }
                            className="mt-2.5 w-full cursor-pointer accent-violet-500"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-xs font-medium text-neutral-500">
                            Logo altı yazı
                          </span>
                          <input
                            className={inputCls}
                            value={spEdit.subText}
                            onChange={(e) => patchSp({ subText: e.target.value })}
                            placeholder="Sürpriz"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-xs font-medium text-neutral-500">
                            Logo altı yazı fontu
                          </span>
                          <select
                            value={spEdit.subFont}
                            onChange={(e) =>
                              patchSp({ subFont: e.target.value as SponsorFont })
                            }
                            className={`${inputCls} cursor-pointer`}
                          >
                            {(
                              Object.keys(SPONSOR_FONTS) as SponsorFont[]
                            ).map((f) => (
                              <option key={f} value={f}>
                                {SPONSOR_FONTS[f].label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className="flex items-end pb-1">
                          <ColorField
                            label="Logo altı yazı rengi"
                            value={spEdit.subColor}
                            onChange={(v) => patchSp({ subColor: v })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mektup içeriği */}
                    <div className="rounded-xl bg-neutral-50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                        Zarftan çıkan mektup
                      </p>
                      <label className="mt-2 block">
                        <span className="mb-1 block text-xs font-medium text-neutral-500">
                          Metin
                        </span>
                        <textarea
                          rows={4}
                          className={inputCls}
                          value={spEdit.letter}
                          onChange={(e) => patchSp({ letter: e.target.value })}
                          placeholder="Markadan duvara özel mesaj…"
                        />
                      </label>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <label className="block">
                          <span className="mb-1 block text-xs font-medium text-neutral-500">
                            Takip / hediye kodu
                          </span>
                          <input
                            className={inputCls}
                            value={spEdit.coupon}
                            onChange={(e) => patchSp({ coupon: e.target.value })}
                            placeholder="PETI-SURPRIZ"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-xs font-medium text-neutral-500">
                            Link (https://…)
                          </span>
                          <input
                            className={inputCls}
                            value={spEdit.linkUrl}
                            onChange={(e) => patchSp({ linkUrl: e.target.value })}
                            placeholder="https://www.marka.com"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-xs font-medium text-neutral-500">
                            Buton yazısı
                          </span>
                          <input
                            className={inputCls}
                            value={spEdit.linkLabel}
                            onChange={(e) =>
                              patchSp({ linkLabel: e.target.value })
                            }
                            placeholder="Markayı keşfet"
                          />
                        </label>
                      </div>
                    </div>

                    {spErr && (
                      <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
                        {spErr}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={spBusy}
                        onClick={() => void saveSponsor()}
                        className="cursor-pointer rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                      >
                        {spBusy
                          ? "Kaydediliyor…"
                          : spEdit.id > 0
                            ? "Kaydet"
                            : "Kampanyayı Oluştur"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSpEdit(null)}
                        className="cursor-pointer rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-500 transition-colors hover:bg-neutral-50"
                      >
                        Vazgeç
                      </button>
                    </div>
                  </div>

                  {/* Canlı önizleme */}
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                        Duvardaki zarf
                      </p>
                      <SponsorEnvelopePreview c={spEdit} w={240} />
                    </div>
                    <div>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                        Zarftan çıkan mektup
                      </p>
                      <SponsorLetterPreview c={spEdit} />
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── İçerik: Merak Edilenler (SSS) + Bize Yazılanlar ── */}
        {tab === "content" && (
          <div className="mt-5 space-y-5">
            {/* SSS editörü */}
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-neutral-700">
                    ❓ Merak Edilenler (SSS)
                  </h2>
                  <p className="mt-1 text-xs text-neutral-400">
                    /merak-edilenler sayfasında görünen sorular. Sıralama
                    buradaki sırayla aynıdır; boş bırakılan satırlar
                    kaydedilmez.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFaqSaved(false);
                    setFaq((f) => [...f, { q: "", a: "" }]);
                  }}
                  className="cursor-pointer rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-600 transition-colors hover:border-neutral-400"
                >
                  + Soru Ekle
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {faq.map((f, i) => (
                  <div key={i} className="rounded-xl bg-neutral-50 p-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-2 w-6 shrink-0 text-center text-xs font-bold text-neutral-400">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1 space-y-2">
                        <input
                          className={inputCls}
                          value={f.q}
                          placeholder="Soru"
                          maxLength={300}
                          onChange={(e) => {
                            setFaqSaved(false);
                            setFaq((list) =>
                              list.map((x, j) =>
                                j === i ? { ...x, q: e.target.value } : x,
                              ),
                            );
                          }}
                        />
                        <textarea
                          rows={3}
                          className={inputCls}
                          value={f.a}
                          placeholder="Cevap"
                          maxLength={3000}
                          onChange={(e) => {
                            setFaqSaved(false);
                            setFaq((list) =>
                              list.map((x, j) =>
                                j === i ? { ...x, a: e.target.value } : x,
                              ),
                            );
                          }}
                        />
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          type="button"
                          disabled={i === 0}
                          onClick={() => {
                            setFaqSaved(false);
                            setFaq((list) => {
                              const c = [...list];
                              [c[i - 1], c[i]] = [c[i], c[i - 1]];
                              return c;
                            });
                          }}
                          aria-label="Yukarı taşı"
                          className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-500 transition-colors hover:border-neutral-400 disabled:cursor-default disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={i === faq.length - 1}
                          onClick={() => {
                            setFaqSaved(false);
                            setFaq((list) => {
                              const c = [...list];
                              [c[i], c[i + 1]] = [c[i + 1], c[i]];
                              return c;
                            });
                          }}
                          aria-label="Aşağı taşı"
                          className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-500 transition-colors hover:border-neutral-400 disabled:cursor-default disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFaqSaved(false);
                            setFaq((list) => list.filter((_, j) => j !== i));
                          }}
                          aria-label="Soruyu sil"
                          className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-500 transition-colors hover:border-red-300 hover:text-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    void adminSaveSettings({ faq }).then((r) => {
                      if (r.ok) setFaqSaved(true);
                    });
                  }}
                  className="cursor-pointer rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-600"
                >
                  Kaydet
                </button>
                {faqSaved && (
                  <span className="text-sm font-medium text-emerald-600">
                    ✓ Kaydedildi
                  </span>
                )}
                <a
                  href="/merak-edilenler"
                  target="_blank"
                  className="ml-auto text-xs font-semibold text-sky-600 hover:underline"
                >
                  Sayfayı gör →
                </a>
              </div>
            </section>

            {/* Bize Yazılanlar */}
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-neutral-700">
                📬 Bize Yazılanlar
                {contacts.length > 0 && (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                    {contacts.length}
                  </span>
                )}
              </h2>
              <p className="mt-1 text-xs text-neutral-400">
                /bize-ulasin sayfasındaki iletişim formundan gelen mesajlar.
                Doğrudan e-posta kutusu: bilgi@manifestduvari.com
              </p>

              {contacts.length === 0 ? (
                <p className="mt-4 rounded-xl bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-400">
                  Henüz mesaj yok.
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  {contacts.map((m) => (
                    <div key={m.id} className="rounded-xl bg-neutral-50 p-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <button
                          type="button"
                          onClick={() =>
                            setContactOpen(contactOpen === m.id ? null : m.id)
                          }
                          className="cursor-pointer text-sm font-bold text-neutral-800 hover:underline"
                        >
                          {m.firstName} {m.lastName}
                        </button>
                        <a
                          href={`mailto:${m.email}`}
                          className="text-xs font-medium text-sky-600 hover:underline"
                        >
                          {m.email}
                        </a>
                        {m.phone && (
                          <span className="text-xs text-neutral-500">
                            📞 {m.phone}
                          </span>
                        )}
                        <span className="ml-auto text-[11px] text-neutral-400">
                          {new Date(m.ts).toLocaleString("tr-TR", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            void adminDeleteContact(m.id).then(() => {
                              setContacts((list) =>
                                list.filter((x) => x.id !== m.id),
                              );
                            });
                          }}
                          className="cursor-pointer rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-500 transition-colors hover:border-red-300 hover:text-red-500"
                        >
                          Sil
                        </button>
                      </div>
                      <p
                        className={`mt-2 whitespace-pre-wrap text-sm text-neutral-600 ${
                          contactOpen === m.id ? "" : "line-clamp-2"
                        }`}
                      >
                        {m.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── Ayarlar: AI denetim anahtarı + SMTP + Google ile giriş ── */}
        {tab === "mail" && mailCfg && (
          <div className="mt-5 space-y-5">
            {/* ── Instagram — header'daki davet yazısı ve linki ── */}
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-neutral-700">
                📸 Instagram
              </h2>
              <p className="mt-1 text-xs text-neutral-400">
                Sitenin sol üst köşesinde görünen davet. Link boş bırakılırsa
                header&apos;da gösterilmez.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-neutral-500">
                    Yazı
                  </span>
                  <input
                    className={inputCls}
                    value={insta.text}
                    maxLength={60}
                    placeholder="bizi instagramda takip et"
                    onChange={(e) => {
                      setInstaSaved(false);
                      setInsta((s) => ({ ...s, text: e.target.value }));
                    }}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-neutral-500">
                    Link
                  </span>
                  <input
                    className={inputCls}
                    value={insta.url}
                    maxLength={300}
                    placeholder="https://instagram.com/manifestduvari"
                    onChange={(e) => {
                      setInstaSaved(false);
                      setInsta((s) => ({ ...s, url: e.target.value.trim() }));
                    }}
                  />
                </label>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    void adminSaveSettings({ instagram: insta }).then((r) => {
                      if (r.ok) setInstaSaved(true);
                    });
                  }}
                  className="cursor-pointer rounded-xl bg-emerald-500 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-600"
                >
                  Kaydet
                </button>
                {instaSaved && (
                  <span className="text-sm font-medium text-emerald-600">
                    ✓ Kaydedildi
                  </span>
                )}
              </div>
            </section>

            {/* ── Yapay zeka denetimi: Anthropic API anahtarı ── */}
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-neutral-700">
                🤖 Yapay Zeka Denetimi
              </h2>
              <p className="mt-1 text-xs text-neutral-400">
                Anahtar:{" "}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-sky-600 hover:underline"
                >
                  console.anthropic.com
                </a>
              </p>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <label className="block min-w-64 flex-1">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    Anthropic API Anahtarı
                  </span>
                  <input
                    type="password"
                    value={aiKey}
                    onChange={(e) => {
                      setAiKey(e.target.value);
                      setAiSaved(false);
                    }}
                    placeholder="sk-ant-api03-..."
                    className={inputCls}
                    autoComplete="new-password"
                  />
                </label>
                <button
                  type="button"
                  onClick={saveAiKey}
                  className="cursor-pointer rounded-full bg-neutral-800 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-neutral-700"
                >
                  Kaydet
                </button>
              </div>
              {aiSaved && (
                <p className="mt-2 text-xs font-semibold text-emerald-600">
                  Kaydedildi ✓ — bir sonraki kontrolde bu anahtar kullanılacak.
                </p>
              )}
              <div className="mt-5 flex items-center gap-3 border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={toggleAiEnabled}
                  aria-label="Saatlik otomatik kontrolü aç/kapat"
                  className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors ${
                    aiEnabled ? "bg-emerald-500" : "bg-neutral-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                      aiEnabled ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
                <div>
                  <p className="text-xs font-bold text-neutral-700">
                    Saatlik otomatik kontrol{" "}
                    {aiEnabled ? (
                      <span className="text-emerald-600">açık</span>
                    ) : (
                      <span className="text-neutral-400">kapalı</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    Kapalıyken saat başı denetim ve harcama olmaz.
                  </p>
                </div>
              </div>
            </section>

            {/* ── Demo manifest yönetimi — ölçek testleri ── */}
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-neutral-700">
                🧪 Demo Manifestler
              </h2>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    Adet
                  </span>
                  <input
                    value={demoCount}
                    onChange={(e) =>
                      setDemoCount(e.target.value.replace(/\D/g, ""))
                    }
                    inputMode="numeric"
                    placeholder="100000"
                    className={`${inputCls} max-w-36`}
                  />
                </label>
                <button
                  type="button"
                  onClick={generateDemos}
                  disabled={demoBusy}
                  className="cursor-pointer rounded-full bg-neutral-800 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-neutral-700 disabled:cursor-default disabled:opacity-50"
                >
                  {demoBusy ? "Çalışıyor…" : "Demo Üret"}
                </button>
                <button
                  type="button"
                  onClick={deleteDemos}
                  disabled={demoBusy}
                  className="cursor-pointer rounded-full border border-red-200 bg-red-50 px-5 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-default disabled:opacity-50"
                >
                  Demoları Sil
                </button>
              </div>
              {demoMsg && (
                <p className="mt-2 text-xs font-semibold text-neutral-500">
                  {demoMsg}
                </p>
              )}
            </section>

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
                  void adminSaveSettings({ mail: mailCfg });
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
                    const r = await sendTestMail(
                      mailCfg,
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
              kalıcı olarak silinecek. Üyeye &quot;hesabınız silinmiştir&quot;
              e-postası gönderilecek.
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
                  void adminDeleteUser(confirmDelUser.id).then(reload);
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
              <b className="text-neutral-700">{confirmDelMan.code}</b> kodlu
              manifest ({confirmDelMan.owner} üyesinin) duvardan kaldırılacak
              ve sahibine bilgilendirme e-postası gönderilecek.
            </p>
            <label className="mt-4 block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                Kaldırma gerekçesi
              </span>
              <select
                value={delReason}
                onChange={(e) => setDelReason(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none"
              >
                <option value="none">Gerekçe belirtme (yalnızca bildir)</option>
                {(Object.keys(MOD_CATEGORIES) as ModCategory[]).map((k) => (
                  <option key={k} value={k}>
                    {MOD_CATEGORIES[k].label}
                  </option>
                ))}
              </select>
            </label>
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
                onClick={delManifestWithReason}
                className="flex-1 cursor-pointer rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                Sil ve Bildir
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
