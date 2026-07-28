"use client";

// ── Üye Paneli ───────────────────────────────────────────────────────────
// Profil özeti + istatistikler + "Manifestlerim" listesi + hesap ayarları.
// Yeni manifest yazma (manifest başına ayrı isim/rumuz), "gerçekleşti"
// işaretleme, manifest silme ve hesap silme buradan yapılır (demo:
// veriler localStorage'da; canlıda backend'e bağlanacak).

import { useEffect, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import CopyBtn from "../components/CopyBtn";
import {
  BottleVisual,
  GiftBoxVisual,
  MiniEnvelope,
  PREVIEW_PASTEL,
  PREVIEW_SPECIAL,
  SPECIAL_COLORS,
  STICKERS,
} from "../components/RewardVisuals";
import {
  PANEL_COLORS,
  currentUser,
  deleteUser,
  demoHash,
  endSession,
  passwordIssue,
  saveUser,
  type MemberManifest,
  type User,
} from "../lib/auth";

const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm " +
  "text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 " +
  "focus:border-amber-400 focus:ring-2 focus:ring-amber-100";

// Manifest metni düz metindir: emoji/ikon karakterleri yazarken ayıklanır
function stripEmoji(s: string): string {
  return s.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, "");
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

// Başarım etapları — duvardaki şans barajlarıyla birebir aynı
// (20+ sticker, 50+ özel renk, 150+ şişe, 250+ hediye kutusu)
const STAGES = [
  {
    title: "Sticker Yapıştırma",
    threshold: 20,
    desc: "20 şansa ulaşan zarfın kapağına manifest türüne uygun bir süs sticker'ı yapıştırılır.",
  },
  {
    title: "Özel Renk",
    threshold: 50,
    desc: "50 şansa ulaşan zarf, duvarda kendini belli eden parlak özel seri renge bürünür.",
  },
  {
    title: "Şişedeki Not",
    threshold: 150,
    desc: "150 şansa ulaşan manifest zarftan çıkar, duvarda cam şişe içinde sergilenir.",
  },
  {
    title: "Hediye Kutusu",
    threshold: 250,
    desc: "250 şansa ulaşan manifest duvarın tepesindeki kurdeleli hediye kutusunda sergilenir.",
  },
];

// Manifest kartı — zarftan çıkan mektupla aynı dil: rumuz el yazısı,
// manifest metni okunaklı düz font
// Mavi etiket ikonu — "Sticker'ını Ekle" butonunda
function TagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="#38bdf8"
      stroke="#0284c7"
      strokeWidth="1.5"
      className="h-3.5 w-3.5 shrink-0"
    >
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8 8a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828l-8-8Z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="#ffffff" stroke="none" />
    </svg>
  );
}

function ManifestCard({
  m,
  onRealized,
  onDelete,
  onPickSticker,
  onPickSpecial,
  onBottle,
}: {
  m: MemberManifest;
  onRealized: () => void;
  onDelete: () => void;
  onPickSticker: () => void;
  onPickSpecial: () => void;
  onBottle: () => void;
}) {
  const c = PANEL_COLORS[m.colorIdx % PANEL_COLORS.length];
  // Özel renk seçildiyse kart şeridi ve rozet o renge döner
  const sp = m.special != null ? SPECIAL_COLORS[m.special % SPECIAL_COLORS.length] : null;
  return (
    <article
      className="relative overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
      style={{ borderTop: `6px solid ${sp ? sp.color.base : c.base}` }}
    >
      <div className="p-5">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span
            className="text-xl leading-none text-neutral-800"
            style={{ fontFamily: "var(--font-caveat)" }}
          >
            {m.name}
          </span>
          <span className="text-xs text-neutral-400">{m.date}</span>
          {/* Seçilen sticker rumuzun yanında görünür */}
          {m.sticker && (
            <span
              className="text-lg leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]"
              title="Zarfının sticker'ı"
            >
              {m.sticker}
            </span>
          )}
          {/* Şişede sergileniyor rozeti */}
          {m.bottled && (
            <span
              className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700"
              title="Manifest duvarda şişede sergileniyor"
            >
              🍾 Şişede
            </span>
          )}
          {/* Seçilen özel renk rozeti */}
          {sp && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
              style={{ background: sp.color.bodyBg, color: sp.color.ink }}
              title="Zarfının özel rengi"
            >
              {sp.label}
            </span>
          )}
          {m.realized && (
            <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">
              ✓ Gerçekleşti{m.realizedDate ? ` · ${m.realizedDate}` : ""}
            </span>
          )}
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-neutral-700">
          {m.manifest}
        </p>
        {/* Zarf kodu — metnin altında, tüm kartlarda mavi etiket (ss55) */}
        <p className="mt-2.5 flex items-center gap-1.5 text-xs text-neutral-400">
          zarf kodu:
          <span className="flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-sky-700">
            {m.code}
            <CopyBtn text={m.code} />
          </span>
        </p>
        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500">
          <span title="Şans dileyenler">⭐ {m.luck.toLocaleString("tr-TR")}</span>
          {/* Tebrik yalnızca gerçekleşen manifestte olur */}
          {m.realized && (
            <span title="Tebrikler">👏 {m.cheers.toLocaleString("tr-TR")}</span>
          )}
          <span title="Görüntülenme">👁️ {m.views.toLocaleString("tr-TR")}</span>
          <span className="ml-auto flex items-center gap-2">
            {/* 20+ şans: sticker hakkı kazanıldı, üye süsünü kendisi seçer.
                Dolu amber buton + yanıp sönen halka ile dikkat çeker */}
            {m.luck >= 20 && !m.sticker && (
              <button
                type="button"
                onClick={onPickSticker}
                className="sticker-pulse flex cursor-pointer items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 font-semibold text-white transition-colors hover:bg-amber-600"
              >
                <TagIcon />
                Sticker&apos;ını Ekle
              </button>
            )}
            {/* 50+ şans: özel renk hakkı kazanıldı, üye rengini kendisi seçer */}
            {m.luck >= 50 && m.special == null && (
              <button
                type="button"
                onClick={onPickSpecial}
                className="special-pulse cursor-pointer rounded-full px-3 py-1 font-semibold text-[#E5C15C] transition-opacity hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(135deg, #3d3d3d, #101010 55%, #2c2c2c)",
                }}
              >
                🎨 Özel Rengini Seç
              </button>
            )}
            {/* 150+ şans: şişe hakkı kazanıldı, üye onayıyla şişeye konur */}
            {m.luck >= 150 && !m.bottled && (
              <button
                type="button"
                onClick={onBottle}
                className="bottle-pulse cursor-pointer rounded-full bg-[#4c8ba1] px-3 py-1 font-semibold text-white transition-colors hover:bg-[#3f7a8f]"
              >
                🍾 Şişeye Koy
              </button>
            )}
            {!m.realized && (
              <button
                type="button"
                onClick={onRealized}
                className="cursor-pointer rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-600 transition-colors hover:bg-emerald-100"
              >
                Gerçekleşti mi?
              </button>
            )}
            <button
              type="button"
              onClick={onDelete}
              className="cursor-pointer rounded-full border border-red-200 bg-red-50 px-3 py-1 font-medium text-red-500 transition-colors hover:bg-red-100"
            >
              Sil
            </button>
          </span>
        </div>
      </div>
    </article>
  );
}

export default function PanelPage() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // Aktif sekme: manifestler / başarımlar
  const [tab, setTab] = useState<"manifests" | "achievements">("manifests");

  // Yeni manifest modalı — duvardaki açık zarf sahnesinde yazılır
  const [writeOpen, setWriteOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState(0);
  const [draftCode, setDraftCode] = useState("");
  // Duvara As sonrası: mektup zarfa girer, sahne küçülüp solar, yönlenir
  const [closing, setClosing] = useState(false);

  // Modal açılırken manifeste kodu peşin atanır — mektupta görünür
  function openWrite() {
    const L = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    setDraftCode(
      String(10000 + Math.floor(Math.random() * 90000)) +
        L[Math.floor(Math.random() * 26)] +
        L[Math.floor(Math.random() * 26)],
    );
    setDraft("");
    setDraftName(""); // rumuz boş başlar — kullanıcı ismi ön tanımlı gelmez
    setClosing(false);
    setWriteOpen(true);
  }

  // Silme / gerçekleşti onayları
  const [confirmDel, setConfirmDel] = useState<MemberManifest | null>(null);
  const [confirmAccount, setConfirmAccount] = useState(false);
  const [confirmRealized, setConfirmRealized] = useState<MemberManifest | null>(
    null,
  );
  // Sticker seçme popup'ı (20+ şans hakkı)
  const [pickFor, setPickFor] = useState<MemberManifest | null>(null);
  // Özel renk seçme popup'ı (50+ şans hakkı)
  const [pickColorFor, setPickColorFor] = useState<MemberManifest | null>(null);
  // Seçim onayları — sticker/renk uygulanmadan önce "geri alınamaz" uyarısı
  const [pendingSticker, setPendingSticker] = useState<{
    m: MemberManifest;
    emoji: string;
    label: string;
  } | null>(null);
  const [pendingSpecial, setPendingSpecial] = useState<{
    m: MemberManifest;
    idx: number;
  } | null>(null);
  // Şişeye koyma onayı (150+ şans hakkı) — önizleme + onay, geri alınamaz
  const [pendingBottle, setPendingBottle] = useState<MemberManifest | null>(
    null,
  );

  // Ayarlar
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [setErr, setSetErrMsg] = useState("");
  const [setOk, setSetOk] = useState("");

  useEffect(() => {
    const u = currentUser();
    if (!u) {
      window.location.href = "/uye";
      return;
    }
    setUser(u);
    setNewName(u.name);
    setReady(true);
  }, []);

  if (!ready || !user) return null;

  function update(mutate: (u: User) => void) {
    const next = { ...user!, manifests: [...user!.manifests] };
    mutate(next);
    saveUser(next);
    setUser(next);
  }

  function addManifest() {
    const text = draft.trim();
    const nm = draftName.trim();
    if (text.length < 10 || nm.length < 2) return;
    const m: MemberManifest = {
      code: draftCode,
      name: nm,
      manifest: text,
      date: new Date().toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      ts: Date.now(),
      luck: 0,
      cheers: 0,
      views: 0,
      colorIdx: draftColor,
      realized: false,
    };
    update((u) => u.manifests.unshift(m));
    // Zarf kapanır (mektup içeri girer), sahne hafifçe küçülüp solar,
    // ardından ana sayfaya gidilir: kod arama kutusuna girilmiş gelir,
    // zarf duvarda bulunup vurgulanır (ss53)
    setClosing(true);
    setTimeout(() => {
      window.location.href = "/?kod=" + m.code;
    }, 900);
  }

  // Seçilen sticker'ı manifeste yapıştırır — duvardaki zarfa/şişeye yansır
  function setSticker(code: string, emoji: string) {
    update((u) => {
      const m = u.manifests.find((x) => x.code === code);
      if (m) m.sticker = emoji;
    });
    setPendingSticker(null);
  }

  // Seçilen özel rengi manifeste işler — duvardaki zarf o renge bürünür
  function setSpecial(code: string, idx: number) {
    update((u) => {
      const m = u.manifests.find((x) => x.code === code);
      if (m) m.special = idx;
    });
    setPendingSpecial(null);
  }

  // Manifesti şişeye koyar — duvarda zarf yerine cam şişede sergilenir
  function setBottled(code: string) {
    update((u) => {
      const m = u.manifests.find((x) => x.code === code);
      if (m) m.bottled = true;
    });
    setPendingBottle(null);
  }

  function markRealized(code: string) {
    update((u) => {
      const m = u.manifests.find((x) => x.code === code);
      if (m) {
        m.realized = true;
        m.realizedDate = new Date().toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    });
  }

  // Manifesti kalıcı siler: duvardaki slot boşalır, zarf kaldırılır,
  // şans dilekleri ve başarımlar iptal olur
  function deleteManifest(code: string) {
    update((u) => {
      u.manifests = u.manifests.filter((x) => x.code !== code);
    });
    setConfirmDel(null);
  }

  function deleteAccount() {
    deleteUser(user!.id);
    window.location.href = "/";
  }

  function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSetErrMsg("");
    setSetOk("");
    const nm = newName.trim();
    if (nm.length < 3 || !nm.includes(" "))
      return setSetErrMsg("İsim ve soyisim birlikte yazılmalı.");
    // Şifre alanları doluysa şifre de değişir (Google üyeliğinde gizli)
    if (user!.provider === "email" && (oldPass || newPass)) {
      if (user!.passHash !== demoHash(oldPass))
        return setSetErrMsg("Mevcut şifre hatalı.");
      const issue = passwordIssue(newPass);
      if (issue) return setSetErrMsg(issue);
      update((u) => {
        u.name = nm;
        u.passHash = demoHash(newPass);
      });
    } else {
      update((u) => {
        u.name = nm;
      });
    }
    setOldPass("");
    setNewPass("");
    setSetOk("Bilgilerin güncellendi. ✓");
  }

  function logout() {
    endSession();
    window.location.href = "/";
  }

  const avatarColor = PANEL_COLORS[user.name.length % PANEL_COLORS.length];

  // Yıllık manifest hakkı: her üyeye yıl başına 3 manifest. Silinen
  // manifest slotu boşaltır; 2027'de 3 yeni hak tanımlanır
  const QUOTA_YEAR = 2026;
  const QUOTA = 3;
  const usedQuota = user.manifests.filter(
    (m) => new Date(m.ts).getFullYear() === QUOTA_YEAR,
  ).length;
  const quotaLeft = Math.max(0, QUOTA - usedQuota);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-16 pt-6">
        {/* Üst şerit */}
        <div className="mb-6 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700"
          >
            <span aria-hidden>←</span> Manifest Duvarı
          </a>
          <button
            type="button"
            onClick={logout}
            className="cursor-pointer rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
          >
            Çıkış Yap
          </button>
        </div>

        {/* Profil kartı */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="h-2.5 w-full bg-[linear-gradient(90deg,#FFC8CD,#FFE8CD,#FFFFCD,#CDFFD8,#CDEAFF,#EBCDFF)]" />
          <div className="flex flex-wrap items-center gap-4 p-6">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold shadow-inner"
              style={{ background: avatarColor.base, color: avatarColor.ink }}
            >
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <h1
                className="text-3xl font-bold leading-tight text-neutral-800"
                style={{ fontFamily: "var(--font-caveat)" }}
              >
                {user.name}
              </h1>
              <p className="truncate text-sm text-neutral-500">{user.email}</p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                Katılım: {user.createdAt}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSettingsOpen((v) => !v);
                setSetErrMsg("");
                setSetOk("");
              }}
              className="ml-auto cursor-pointer rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50"
            >
              ⚙️ Hesap Ayarları
            </button>
          </div>

          {/* Ayarlar — profil kartının altında açılır */}
          {settingsOpen && (
            <form
              onSubmit={saveSettings}
              className="space-y-4 border-t border-neutral-100 bg-neutral-50/60 p-6"
            >
              {setErr && (
                <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
                  {setErr}
                </p>
              )}
              {setOk && (
                <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-600">
                  {setOk}
                </p>
              )}
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  İsim Soyisim
                </span>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={inputCls}
                />
              </label>
              {user.provider === "email" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Mevcut Şifre
                    </span>
                    <input
                      type="password"
                      value={oldPass}
                      onChange={(e) => setOldPass(e.target.value)}
                      placeholder="Değişmeyecekse boş bırak"
                      className={inputCls}
                      autoComplete="current-password"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Yeni Şifre
                    </span>
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="En az 8 karakter, harf + rakam"
                      className={inputCls}
                      autoComplete="new-password"
                    />
                  </label>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="cursor-pointer rounded-xl bg-neutral-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAccount(true)}
                  className="ml-auto cursor-pointer rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50"
                >
                  Hesabı Sil
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Sekmeler: Manifestlerim / Başarımlar */}
        <div className="mt-8 flex gap-2">
          <button
            type="button"
            onClick={() => setTab("manifests")}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "manifests"
                ? "bg-neutral-800 text-white"
                : "bg-white text-neutral-500 shadow-sm hover:bg-neutral-50"
            }`}
          >
            💌 Manifestlerim
          </button>
          <button
            type="button"
            onClick={() => setTab("achievements")}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "achievements"
                ? "bg-neutral-800 text-white"
                : "bg-white text-neutral-500 shadow-sm hover:bg-neutral-50"
            }`}
          >
            🏆 Başarımlar
          </button>
        </div>

        {/* Manifestlerim */}
        {tab === "manifests" && (
        <section className="mt-5">
          <div className="mb-3.5 flex flex-wrap items-center gap-3">
            <h2
              className="text-2xl font-bold text-neutral-800"
              style={{ fontFamily: "var(--font-caveat)" }}
            >
              2026 Manifestlerim
            </h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                quotaLeft > 0
                  ? "bg-amber-50 text-amber-600"
                  : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {usedQuota}/{QUOTA} hak kullanıldı
            </span>
            <button
              type="button"
              onClick={openWrite}
              disabled={quotaLeft === 0}
              className="ml-auto cursor-pointer rounded-full bg-neutral-800 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-neutral-700 active:scale-[0.98] disabled:cursor-default disabled:opacity-40"
            >
              ✍️ Yeni Manifest Yaz
            </button>
          </div>

          {user.manifests.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-white/60 px-6 py-12 text-center">
              <p className="text-4xl">💌</p>
              <p
                className="mt-2 text-2xl text-neutral-600"
                style={{ fontFamily: "var(--font-caveat)" }}
              >
                Henüz duvara asılmış bir manifestin yok
              </p>
              <p className="mt-1 text-sm text-neutral-400">
                İlk manifestini yaz, zarfına koyalım ve duvara asalım.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {user.manifests.map((m) => (
                <ManifestCard
                  key={m.code}
                  m={m}
                  onRealized={() => setConfirmRealized(m)}
                  onDelete={() => setConfirmDel(m)}
                  onPickSticker={() => setPickFor(m)}
                  onPickSpecial={() => setPickColorFor(m)}
                  onBottle={() => setPendingBottle(m)}
                />
              ))}
            </div>
          )}
        </section>
        )}

        {/* Başarımlar — 4 etap: sticker, özel renk, şişe, kutu */}
        {tab === "achievements" && (
          <section className="mt-5 grid gap-3.5 sm:grid-cols-2">
            {STAGES.map((s, i) => {
              const achieved = user.manifests
                .filter((m) => m.luck >= s.threshold)
                .sort((a, b) => b.luck - a.luck);
              // Önizlemede kazanan manifest, yoksa örnek değerler kullanılır
              const pName = achieved[0]?.name ?? "Rumuz";
              const pLuck = achieved[0]?.luck ?? s.threshold;
              const unlocked = achieved.length > 0;
              // Önizleme sayıları: zarf etaplarında barajın hemen üstünde
              // örnek değerler gösterilir (ss48), şişe/kutu kazanan değeri alır
              const shownLuck = i === 0 ? 32 : i === 1 ? 54 : pLuck;
              return (
                <article
                  key={s.title}
                  className={`flex flex-col rounded-2xl bg-white p-5 shadow-sm ${
                    unlocked ? "" : "opacity-80"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2.5 text-sm font-extrabold uppercase tracking-wider text-neutral-700">
                      {i + 1}. Etap
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-amber-600">
                        {s.threshold}+ şans
                      </span>
                    </p>
                    <h3 className="mt-1 truncate text-xl font-bold text-neutral-800">
                      {s.title}
                    </h3>
                  </div>
                  {/* Gerçek görünüm — duvardaki birebir görseller, orijinal
                      masaüstü boyutlarında (zarf 180, şişe 149×387, kutu 158) */}
                  <div
                    className={`mt-3 flex items-center justify-center overflow-hidden rounded-xl bg-[#f1efe9] ${
                      i === 2
                        ? "h-[430px]"
                        : i === 3
                          ? "min-h-[280px] flex-1"
                          : "h-56"
                    }`}
                  >
                    {i === 0 && (
                      <MiniEnvelope
                        color={PREVIEW_PASTEL}
                        name={pName}
                        luck={shownLuck}
                        sticker="✈️"
                        width={180}
                      />
                    )}
                    {i === 1 && (
                      <MiniEnvelope
                        color={PREVIEW_SPECIAL}
                        name={pName}
                        luck={shownLuck}
                        width={180}
                      />
                    )}
                    {i === 2 && (
                      <div className="h-[387px] w-[149px] shrink-0">
                        <BottleVisual
                          ribbon={1}
                          sticker="✈️"
                          bandFs={Math.max(8, 10 * (149 / 160))}
                          label={
                            <div className="flex flex-col items-center gap-[3px]">
                              <div
                                className="flex items-start justify-center"
                                style={{ gap: 8 * (149 / 160) }}
                              >
                                <div className="flex flex-col items-center gap-[2px]">
                                  <p
                                    className="leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
                                    style={{ fontSize: 11 * (149 / 160) }}
                                  >
                                    ⭐
                                  </p>
                                  <p
                                    className="leading-none font-semibold text-[#8a6d33]"
                                    style={{ fontSize: 12 * (149 / 160) }}
                                  >
                                    {pLuck.toLocaleString("tr-TR")}
                                  </p>
                                </div>
                              </div>
                              <p
                                className="truncate font-hand leading-none font-semibold text-[#6b5426]"
                                style={{ fontSize: 17 * (149 / 160) }}
                              >
                                {pName}
                              </p>
                            </div>
                          }
                        />
                      </div>
                    )}
                    {i === 3 && (
                      <div className="pr-9">
                        <GiftBoxVisual
                          size={158}
                          name={pName}
                          luck={pLuck}
                          glow
                        />
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-neutral-500">
                    {s.desc}
                  </p>
                </article>
              );
            })}
          </section>
        )}

        {/* ── Yeni manifest modalı — duvardaki açık zarf popup'ının birebir
            sahnesi: rumuz ve metin mektubun üstüne yazılır, renk zarfın alt
            şeridindeki bardan seçilir (ref: ss45) ── */}
        {writeOpen && (() => {
          const c = PANEL_COLORS[draftColor % PANEL_COLORS.length];
          return (
          <div
            className="fixed inset-0 z-[2100] overflow-y-auto bg-black/45 backdrop-blur-[2px]"
            onClick={() => {
              if (!closing) setWriteOpen(false);
            }}
          >
            <div
              className="mx-auto flex min-h-full w-[min(92vw,460px)] flex-col justify-center py-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sahne — mektup zarfın üstünden çıkık durur. Ölçüler duvarda
                  açılan zarf popup'ıyla birebir: k = 460/540 ≈ 0.85.
                  Kapanışta: mektup içeri girdikten sonra küçülüp solar */}
              <div
                className="relative mt-48"
                style={{
                  height: 477,
                  opacity: closing ? 0 : 1,
                  transform: closing ? "scale(0.88)" : "none",
                  transition:
                    "opacity 320ms ease 380ms, transform 320ms ease 380ms",
                }}
              >
                {/* Kapat ✕ — sahnenin sağında (ss45'teki gibi) */}
                <button
                  type="button"
                  aria-label="Kapat"
                  onClick={() => {
                    if (!closing) setWriteOpen(false);
                  }}
                  className="absolute -right-2 top-[8%] z-40 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-lg text-neutral-600 shadow-lg transition-colors hover:bg-neutral-100 sm:-right-14"
                >
                  ✕
                </button>

                {/* Zarf arka yüzeyi */}
                <div
                  className="absolute inset-x-0 bottom-0 rounded-[6px]"
                  style={{ height: 337, backgroundColor: c.dark }}
                />
                {/* Katlanma izi — kapağın menteşe çizgisi */}
                <div
                  className="absolute inset-x-0 z-[5] h-px"
                  style={{ top: 141, backgroundColor: "rgba(0,0,0,0.09)" }}
                />
                <div
                  className="absolute inset-x-0 z-[5] h-[6px]"
                  style={{
                    top: 135,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.05), transparent)",
                  }}
                />

                {/* Mektup — açık konumda, üzerine yazılır */}
                <div
                  className="absolute left-1/2 z-10 w-[86%]"
                  style={{
                    bottom: 31,
                    transformOrigin: "bottom center",
                    // Kapanışta mektup küçülerek zarfın içine girer
                    transform: closing
                      ? "translateX(-50%) translateY(0) scale(0.55)"
                      : "translateX(-50%) translateY(-272px)",
                    transition:
                      "transform 340ms cubic-bezier(0.25, 0.9, 0.3, 1)",
                  }}
                >
                  <div className="rounded-[4px] bg-[#fffdf5] px-8 py-7 shadow-[0_16px_44px_rgba(0,0,0,0.35)] max-[520px]:px-5 max-[520px]:py-5">
                    {/* Rumuz — mektubun başlığına yazılır (maks 25 karakter),
                        modal açılınca imleç burada başlar */}
                    <div className="flex items-end gap-2">
                      <input
                        value={draftName}
                        onChange={(e) =>
                          setDraftName(e.target.value.slice(0, 25))
                        }
                        autoFocus
                        placeholder="Rumuzun…"
                        className="w-full bg-transparent font-hand text-[26px] text-neutral-800 outline-none placeholder:text-neutral-300 max-[520px]:text-[22px]"
                      />
                      <span className="shrink-0 pb-1 text-[10px] text-neutral-300">
                        {draftName.length}/25
                      </span>
                    </div>
                    {/* Kod — sağda tek başına ("Manifest" etiketi yok) */}
                    <p className="mt-1 text-right font-mono text-[11px] tracking-wider text-neutral-400 max-[520px]:text-[9.5px]">
                      {draftCode}
                    </p>
                    {/* Manifest metni — mektubun gövdesine yazılır */}
                    <textarea
                      value={draft}
                      onChange={(e) =>
                        setDraft(stripEmoji(e.target.value).slice(0, 250))
                      }
                      rows={7}
                      placeholder="Manifestini buraya yaz… (en az 10 karakter)"
                      className="mt-4 w-full resize-none bg-transparent text-[14px] leading-relaxed text-neutral-700 outline-none placeholder:text-neutral-300 max-[520px]:text-[13px]"
                    />
                    <div className="text-right text-[10px] text-neutral-300">
                      {draft.length}/250
                    </div>
                  </div>
                </div>

                {/* Zarf ön cebi (mektubun alt kısmını içine alır) */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-20 rounded-[6px] shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
                  style={{
                    height: 337,
                    clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)",
                    transform: "translateZ(0)",
                    backgroundColor: c.base,
                  }}
                />

                {/* Zarf rengi barı — ön yüzün alt şeridi (ss45) */}
                <div className="absolute inset-x-0 bottom-[18px] z-30 flex items-center justify-center">
                  <div className="flex items-center gap-2.5 rounded-full bg-white/85 px-4 py-2.5 shadow-md backdrop-blur">
                    {PANEL_COLORS.map((pc, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Zarf rengi ${i + 1}`}
                        onClick={() => setDraftColor(i)}
                        className={`h-6 w-6 cursor-pointer rounded-full transition-transform hover:scale-115 ${
                          draftColor === i
                            ? "scale-110 ring-2 ring-neutral-700 ring-offset-1"
                            : "ring-1 ring-black/10"
                        }`}
                        style={{ background: pc.base }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Aksiyonlar — kapanışta sahneyle birlikte solar */}
              <div
                className="mt-5 flex gap-2.5"
                style={{
                  opacity: closing ? 0 : 1,
                  transition: "opacity 320ms ease 380ms",
                }}
              >
                <button
                  type="button"
                  onClick={() => setWriteOpen(false)}
                  disabled={closing}
                  className="flex-1 cursor-pointer rounded-xl border border-white/30 bg-white/10 py-2.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20 disabled:cursor-default"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={addManifest}
                  disabled={
                    closing ||
                    draft.trim().length < 10 ||
                    draftName.trim().length < 2
                  }
                  className="flex-1 cursor-pointer rounded-xl bg-white py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-100 disabled:cursor-default disabled:opacity-50"
                >
                  Duvara As 💌
                </button>
              </div>
            </div>
          </div>
          );
        })()}

        {/* ── Sticker seçme popup'ı — 20+ şans hakkı ── */}
        {pickFor && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setPickFor(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="text-2xl font-bold text-neutral-800"
                style={{ fontFamily: "var(--font-caveat)" }}
              >
                Sticker&apos;ını Seç 🏷️
              </h3>
              <p className="mb-4 mt-0.5 text-xs leading-relaxed text-neutral-400">
                <b className="text-neutral-600">{pickFor.code}</b> kodlu
                manifestin 20 şans barajını geçti. Manifest türüne uygun süsü
                seç, zarfının kapağına yapıştıralım.
              </p>
              <div className="grid grid-cols-5 gap-2">
                {STICKERS.map((s) => (
                  <button
                    key={s.emoji}
                    type="button"
                    aria-label={`${s.label} sticker'ını seç`}
                    onClick={() => {
                      setPendingSticker({
                        m: pickFor,
                        emoji: s.emoji,
                        label: s.label,
                      });
                      setPickFor(null);
                    }}
                    className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl bg-neutral-50 py-2.5 transition-all hover:scale-110 hover:bg-amber-50 hover:shadow-md"
                  >
                    <span className="text-3xl leading-none">{s.emoji}</span>
                    <span className="text-[10px] font-medium text-neutral-500">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPickFor(null)}
                className="mt-4 w-full cursor-pointer rounded-xl py-2 text-center text-xs font-medium text-neutral-500 hover:bg-neutral-50"
              >
                Vazgeç
              </button>
            </div>
          </div>
        )}

        {/* ── Özel renk seçme popup'ı — 50+ şans hakkı ── */}
        {pickColorFor && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setPickColorFor(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="text-2xl font-bold text-neutral-800"
                style={{ fontFamily: "var(--font-caveat)" }}
              >
                Özel Rengini Seç 🎨
              </h3>
              <p className="mb-4 mt-0.5 text-xs leading-relaxed text-neutral-400">
                <b className="text-neutral-600">{pickColorFor.code}</b> kodlu
                manifestin 50 şans barajını geçti. Zarfın duvarda kendini belli
                eden özel seri renklerden birine bürünecek. Rengini seç.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {SPECIAL_COLORS.map((s, idx) => (
                  <button
                    key={s.label}
                    type="button"
                    aria-label={`${s.label} rengini seç`}
                    onClick={() => {
                      setPendingSpecial({ m: pickColorFor, idx });
                      setPickColorFor(null);
                    }}
                    className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl bg-neutral-50 p-2 transition-all hover:scale-105 hover:bg-neutral-100 hover:shadow-md"
                  >
                    <MiniEnvelope
                      color={s.color}
                      name={pickColorFor.name}
                      luck={pickColorFor.luck}
                      sticker={pickColorFor.sticker}
                      width={142}
                    />
                    <span className="text-xs font-semibold text-neutral-600">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPickColorFor(null)}
                className="mt-4 w-full cursor-pointer rounded-xl py-2 text-center text-xs font-medium text-neutral-500 hover:bg-neutral-50"
              >
                Vazgeç
              </button>
            </div>
          </div>
        )}

        {/* ── Sticker seçimi onayı — geri alınamaz ── */}
        {pendingSticker && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setPendingSticker(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-neutral-800">
                Emin misin?
              </h3>
              <div className="mt-3 flex items-center justify-center">
                <span className="flex flex-col items-center gap-1 rounded-xl bg-amber-50 px-6 py-3">
                  <span className="text-4xl leading-none">
                    {pendingSticker.emoji}
                  </span>
                  <span className="text-[11px] font-medium text-neutral-500">
                    {pendingSticker.label}
                  </span>
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                Bu sticker{" "}
                <b className="text-neutral-700">{pendingSticker.m.code}</b>{" "}
                kodlu manifestin zarfına yapıştırılacak.{" "}
                <b className="text-red-500">Bu seçim geri alınamaz.</b>
              </p>
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setPickFor(pendingSticker.m); // seçime geri dön
                    setPendingSticker(null);
                  }}
                  className="flex-1 cursor-pointer rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSticker(pendingSticker.m.code, pendingSticker.emoji)
                  }
                  className="flex-1 cursor-pointer rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                >
                  Evet, Yapıştır
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Özel renk seçimi onayı — geri alınamaz ── */}
        {pendingSpecial && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setPendingSpecial(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-neutral-800">
                Emin misin?
              </h3>
              <div className="mt-3 flex flex-col items-center gap-1.5">
                <MiniEnvelope
                  color={SPECIAL_COLORS[pendingSpecial.idx].color}
                  name={pendingSpecial.m.name}
                  luck={pendingSpecial.m.luck}
                  sticker={pendingSpecial.m.sticker}
                  width={130}
                />
                <span className="text-xs font-semibold text-neutral-600">
                  {SPECIAL_COLORS[pendingSpecial.idx].label}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                <b className="text-neutral-700">{pendingSpecial.m.code}</b>{" "}
                kodlu manifestin zarfı bu renge bürünecek.{" "}
                <b className="text-red-500">Bu seçim geri alınamaz.</b>
              </p>
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setPickColorFor(pendingSpecial.m); // seçime geri dön
                    setPendingSpecial(null);
                  }}
                  className="flex-1 cursor-pointer rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSpecial(pendingSpecial.m.code, pendingSpecial.idx)
                  }
                  className="flex-1 cursor-pointer rounded-xl py-2.5 text-sm font-semibold text-[#E5C15C] transition-opacity hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(135deg, #3d3d3d, #101010 55%, #2c2c2c)",
                  }}
                >
                  Evet, Bu Renk
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Şişeye koyma onayı — şişe önizlemesi + geri alınamaz ── */}
        {pendingBottle && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setPendingBottle(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="text-2xl font-bold text-neutral-800"
                style={{ fontFamily: "var(--font-caveat)" }}
              >
                Şişeye Koy 🍾
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-neutral-400">
                <b className="text-neutral-600">{pendingBottle.code}</b> kodlu
                manifestin 150 şans barajını geçti. Duvarda böyle
                sergilenecek:
              </p>
              {/* Şişe önizlemesi: seçilen sticker camda, kurdele seçilen
                  özel renkte */}
              <div className="mt-3 flex items-center justify-center rounded-xl bg-[#f1efe9] py-4">
                <div className="h-[330px] w-[127px] shrink-0">
                  <BottleVisual
                    sticker={pendingBottle.sticker ?? "🦋"}
                    ribbon={pendingBottle.special ?? 0}
                    bandFs={8}
                    label={
                      <div className="flex flex-col items-center gap-[3px]">
                        <div className="flex flex-col items-center gap-[2px]">
                          <p className="text-[10px] leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
                            ⭐
                          </p>
                          <p className="text-[11px] leading-none font-semibold text-[#8a6d33]">
                            {pendingBottle.luck.toLocaleString("tr-TR")}
                          </p>
                        </div>
                        <p className="truncate font-hand text-[15px] leading-none font-semibold text-[#6b5426]">
                          {pendingBottle.name}
                        </p>
                      </div>
                    }
                  />
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                Manifest zarftan çıkıp duvarda cam şişe içinde sergilenecek.{" "}
                <b className="text-red-500">Bu işlem geri alınamaz.</b>
              </p>
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setPendingBottle(null)}
                  className="flex-1 cursor-pointer rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() => setBottled(pendingBottle.code)}
                  className="flex-1 cursor-pointer rounded-xl bg-[#4c8ba1] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3f7a8f]"
                >
                  Onayla 🍾
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Gerçekleşti onayı — etiket geri alınamaz ── */}
        {confirmRealized && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setConfirmRealized(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-neutral-800">
                Gerçekleşti olarak işaretlensin mi?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                <b className="text-neutral-700">{confirmRealized.code}</b>{" "}
                kodlu manifestin duvarda yeşil &quot;Gerçekleşti&quot; rozeti
                taşıyacak, şans dilemeye kapanıp tebrik almaya başlayacak.{" "}
                <b className="text-red-500">Bu etiket geri alınamaz.</b>
              </p>
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmRealized(null)}
                  className="flex-1 cursor-pointer rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() => {
                    markRealized(confirmRealized.code);
                    setConfirmRealized(null);
                  }}
                  className="flex-1 cursor-pointer rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
                >
                  Evet, Gerçekleşti ✓
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Manifest silme onayı ── */}
        {confirmDel && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setConfirmDel(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-neutral-800">
                Manifesti sil?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                <b className="text-neutral-700">{confirmDel.code}</b> kodlu
                manifestin duvardan kaldırılacak, slotu boşalacak.{" "}
                <b className="text-red-500">
                  {confirmDel.luck.toLocaleString("tr-TR")} şans dileği
                </b>
                , tebrikler ve başarımlar iptal edilecek. Bu işlem geri
                alınamaz.
              </p>
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmDel(null)}
                  className="flex-1 cursor-pointer rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() => deleteManifest(confirmDel.code)}
                  className="flex-1 cursor-pointer rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                >
                  Evet, Sil
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Hesap silme onayı ── */}
        {confirmAccount && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setConfirmAccount(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-neutral-800">
                Hesabını silmek istediğine emin misin?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                Üyeliğin ve duvardaki{" "}
                <b className="text-red-500">
                  {user.manifests.length} manifestin
                </b>{" "}
                kalıcı olarak silinecek; tüm şans dilekleri, tebrikler ve
                başarımlar iptal edilecek. Bu işlem geri alınamaz.
              </p>
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmAccount(false)}
                  className="flex-1 cursor-pointer rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={deleteAccount}
                  className="flex-1 cursor-pointer rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                >
                  Hesabı Kalıcı Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
