"use client";

// ── Üye Ol / Giriş Yap ekranı ────────────────────────────────────────────
// Akışlar: giriş • üye ol → e-posta doğrulama (ilk üyelikte bir kez) •
// şifremi unuttum → kod → yeni şifre • Google ile devam.
// Kod gönderimi: admin panelde SMTP yapılandırıldıysa gerçek e-posta
// gönderilir; yapılandırılmadıysa (veya gönderim başarısızsa) kod ekrana
// "gelen kutusu" demo bildirimi olarak düşer. Google girişi de admin
// panelde Client ID tanımlıysa gerçek Google (GIS) akışını kullanır.

import { useEffect, useRef, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import {
  DEMO_GOOGLE,
  currentUser,
  demoHash,
  findUser,
  passwordIssue,
  registerUser,
  saveUser,
  sendCode,
  startSession,
  validEmail,
  verifyCode,
} from "../lib/auth";
import { getMailConfig, sendCodeMail, smtpReady } from "../lib/mail";

// Google Identity Services (GIS) — sayfaya script ile yüklenir
type GsiButtonConfig = {
  theme: string;
  size: string;
  width: number;
  text: string;
  locale: string;
};
type Gsi = {
  accounts?: {
    id?: {
      initialize: (cfg: {
        client_id: string;
        callback: (resp: { credential: string }) => void;
      }) => void;
      renderButton: (el: HTMLElement, cfg: GsiButtonConfig) => void;
    };
  };
};

type Mode =
  | "login"
  | "register"
  | "verify" // üye olduktan sonra e-posta kodu
  | "forgot" // e-posta gir
  | "forgotCode" // kodu gir
  | "forgotReset"; // yeni şifre belirle

// Ekrana düşen sahte e-posta bildirimi (demo)
type Mail = { code: string; to: string } | null;

const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm " +
  "text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 " +
  "focus:border-amber-400 focus:ring-2 focus:ring-amber-100";

const primaryBtn =
  "w-full cursor-pointer rounded-xl bg-neutral-800 py-2.5 text-sm font-semibold " +
  "text-white transition-all hover:bg-neutral-700 active:scale-[0.99] " +
  "disabled:cursor-default disabled:opacity-50";

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

// Google "G" logosu
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 shrink-0">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.6 2.8c2.2-2 3.8-5 3.8-8.5z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 8-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.3 1.2-3.1 0-5.8-2.1-6.8-5l-3.9 2.9C3.3 21.3 7.3 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.2 14.4a7.3 7.3 0 0 1 0-4.7L1.3 6.7a12 12 0 0 0 0 10.7l3.9-3z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17 1 14.2 0 12 0 7.3 0 3.3 2.7 1.3 6.7l3.9 3c1-2.9 3.7-5 6.8-5z"
      />
    </svg>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [mail, setMail] = useState<Mail>(null);
  const [googleOpen, setGoogleOpen] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  // Form alanları
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [code, setCode] = useState("");
  const [resendIn, setResendIn] = useState(0);

  // Kod ekranındaki "yeniden gönder" sayacı
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  // Zaten girişliyse panele geç
  useEffect(() => {
    if (currentUser()) window.location.href = "/panel";
  }, []);

  const codeRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (mode === "verify" || mode === "forgotCode") codeRef.current?.focus();
  }, [mode]);

  function switchMode(m: Mode) {
    setMode(m);
    setErr("");
    setInfo("");
    setCode("");
  }

  // Kodu gönder: SMTP yapılandırıldıysa gerçek e-posta; değilse (veya
  // gönderim başarısız olursa) ekrana düşen demo bildirimi
  async function dispatchCode(to: string): Promise<boolean> {
    const r = sendCode(to);
    if (!r.ok) {
      setErr(`Yeni kod için ${r.waitSec} sn bekle.`);
      return false;
    }
    setResendIn(60);
    if (smtpReady()) {
      setBusy(true);
      const m = await sendCodeMail(to, r.code);
      setBusy(false);
      if (m.ok) {
        // Ek bilgi kutusu gösterilmez — kod ekranı başlığı zaten söylüyor
        setMail(null);
        setErr("");
        return true;
      }
      // Gerçek gönderim başarısız: nedeni göster, kod demoya düşsün ki
      // akış kilitlenmesin (SMTP ayarı buradan teşhis edilir)
      setErr(
        `E-posta gönderilemedi: ${m.error ?? "bilinmeyen hata"} — kod demo bildirimi olarak gösterildi.`,
      );
    }
    setMail({ code: r.code, to });
    return true;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const nm = name.trim();
    if (nm.length < 3 || !nm.includes(" "))
      return setErr("İsim ve soyisim birlikte yazılmalı.");
    if (!validEmail(email)) return setErr("Geçerli bir e-posta adresi gir.");
    const pIssue = passwordIssue(pass);
    if (pIssue) return setErr(pIssue);
    if (pass !== pass2) return setErr("Şifreler birbiriyle uyuşmuyor.");
    const r = registerUser(nm, email, pass);
    if (!r.ok) return setErr(r.error);
    // switchMode kullanılmaz: dispatchCode'un gönderim mesajları korunur
    if (await dispatchCode(email)) {
      setMode("verify");
      setCode("");
    }
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const r = verifyCode(email, code);
    if (!r.ok) {
      // Deneme hakkı bitti: "Yeniden gönder" beklemeden açılır
      if (r.left === 0) setResendIn(0);
      return setErr(r.error);
    }
    const user = findUser(email);
    if (!user) return setErr("Üyelik bulunamadı.");
    user.verified = true;
    saveUser(user);
    startSession(user.id);
    setBusy(true);
    window.location.href = "/panel";
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const user = findUser(email);
    if (!user || user.passHash !== demoHash(pass))
      return setErr("E-posta veya şifre hatalı.");
    // İlk üyelikte doğrulama yarım kaldıysa önce onu tamamlat
    if (!user.verified) {
      setInfo("E-postan henüz doğrulanmamış. Sana yeni bir kod gönderdik.");
      if (await dispatchCode(email)) setMode("verify");
      return;
    }
    startSession(user.id);
    setBusy(true);
    window.location.href = "/panel";
  }

  async function handleForgotSend(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!validEmail(email)) return setErr("Geçerli bir e-posta adresi gir.");
    if (!findUser(email))
      return setErr("Bu e-posta ile kayıtlı bir üyelik yok.");
    if (await dispatchCode(email)) {
      setMode("forgotCode");
      setCode("");
    }
  }

  function handleForgotCode(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const r = verifyCode(email, code);
    if (!r.ok) {
      // Deneme hakkı bitti: "Yeniden gönder" beklemeden açılır
      if (r.left === 0) setResendIn(0);
      return setErr(r.error);
    }
    switchMode("forgotReset");
  }

  function handleForgotReset(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const pIssue = passwordIssue(pass);
    if (pIssue) return setErr(pIssue);
    if (pass !== pass2) return setErr("Şifreler birbiriyle uyuşmuyor.");
    const user = findUser(email);
    if (!user) return setErr("Üyelik bulunamadı.");
    user.passHash = demoHash(pass);
    saveUser(user);
    startSession(user.id);
    setBusy(true);
    window.location.href = "/panel";
  }

  // Gerçek Google girişi (GIS) — admin panelde Client ID tanımlıysa resmi
  // Google butonu basılır; kimlik jetonundaki e-posta ile üyelik açılır/girilir
  const [googleClientId, setGoogleClientId] = useState("");
  useEffect(() => setGoogleClientId(getMailConfig().googleClientId), []);
  const gisBtnRef = useRef<HTMLDivElement>(null);

  function finishGoogle(credential: string) {
    try {
      const payload = JSON.parse(
        atob(credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      ) as { email?: string; name?: string };
      if (!payload.email)
        return setErr("Google hesabından e-posta alınamadı.");
      let user = findUser(payload.email);
      if (!user) {
        const r = registerUser(
          payload.name ?? payload.email.split("@")[0],
          payload.email,
          "google-" + Date.now(),
        );
        if (!r.ok) return setErr(r.error);
        user = r.user;
        user.provider = "google";
        user.verified = true; // Google e-postayı zaten doğrulamıştır
        saveUser(user);
      }
      startSession(user.id);
      setBusy(true);
      window.location.href = "/panel";
    } catch {
      setErr("Google girişi doğrulanamadı.");
    }
  }

  // GIS scriptini yükle ve resmi Google butonunu bas
  useEffect(() => {
    if (!googleClientId || !(mode === "login" || mode === "register")) return;
    const init = () => {
      const g = (window as unknown as { google?: Gsi }).google;
      const el = gisBtnRef.current;
      if (!g?.accounts?.id || !el) return;
      g.accounts.id.initialize({
        client_id: googleClientId,
        callback: (resp) => finishGoogle(resp.credential),
      });
      el.innerHTML = "";
      g.accounts.id.renderButton(el, {
        theme: "outline",
        size: "large",
        width: 352,
        text: mode === "login" ? "signin_with" : "signup_with",
        locale: "tr",
      });
    };
    if ((window as unknown as { google?: Gsi }).google) {
      init();
      return;
    }
    const existing = document.getElementById(
      "gsi-script",
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", init);
      return () => existing.removeEventListener("load", init);
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.id = "gsi-script";
    s.async = true;
    s.onload = init;
    document.head.appendChild(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleClientId, mode]);

  // Google ile devam (demo): hesap seçiciden onaylanınca üyelik açılır/girilir
  function handleGooglePick() {
    let user = findUser(DEMO_GOOGLE.email);
    if (!user) {
      const r = registerUser(DEMO_GOOGLE.name, DEMO_GOOGLE.email, "google-" + Date.now());
      if (!r.ok) return setErr(r.error);
      user = r.user;
      user.provider = "google";
      user.verified = true; // Google e-postayı zaten doğrulamıştır
      saveUser(user);
    }
    startSession(user.id);
    setBusy(true);
    window.location.href = "/panel";
  }

  const titles: Record<Mode, [string, string]> = {
    login: ["Hoş geldin", ""],
    register: ["Aramıza katıl", ""],
    verify: ["E-postanı doğrula", `${email} adresine 6 haneli kod gönderdik`],
    forgot: ["Şifreni mi unuttun?", ""],
    forgotCode: ["Kodu gir", `${email} adresine 6 haneli kod gönderdik`],
    forgotReset: ["Yeni şifreni belirle", "Bu sefer unutmayacağın bir şey seç"],
  };

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-screen flex-col items-center px-4 py-10">
      {/* Duvara dönüş */}
      <a
        href="/"
        className="mb-8 flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700"
      >
        <span aria-hidden>←</span> Manifest Duvarı&apos;na dön
      </a>

      {/* Kart — zarf esintili: üstte pastel kapak şeridi */}
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
        <div className="h-3 w-full bg-[linear-gradient(90deg,#FFC8CD,#FFE8CD,#FFFFCD,#CDFFD8,#CDEAFF,#EBCDFF)]" />
        <div className="p-7">
          <h1
            className="text-3xl font-bold text-neutral-800"
            style={{ fontFamily: "var(--font-caveat)" }}
          >
            {titles[mode][0]}
          </h1>
          {titles[mode][1] ? (
            <p className="mb-6 mt-1 text-sm text-neutral-500">
              {titles[mode][1]}
            </p>
          ) : (
            <div className="mb-6" />
          )}

          {info && (
            <p className="mb-4 rounded-xl bg-sky-50 px-4 py-2.5 text-sm text-sky-700">
              {info}
            </p>
          )}
          {err && (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {err}
            </p>
          )}

          {/* ── Giriş ── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field label="E-posta">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@eposta.com"
                  className={inputCls}
                  autoComplete="email"
                />
              </Field>
              <Field label="Şifre">
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="••••••••"
                  className={inputCls}
                  autoComplete="current-password"
                />
              </Field>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="cursor-pointer text-xs font-medium text-neutral-500 underline-offset-2 hover:underline"
                >
                  Şifremi unuttum
                </button>
              </div>
              <button type="submit" disabled={busy} className={primaryBtn}>
                Giriş Yap
              </button>
            </form>
          )}

          {/* ── Üye ol ── */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <Field label="İsim Soyisim">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adın Soyadın"
                  className={inputCls}
                  autoComplete="name"
                />
              </Field>
              <Field label="E-posta">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@eposta.com"
                  className={inputCls}
                  autoComplete="email"
                />
              </Field>
              <Field label="Şifre">
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="En az 8 karakter, harf + rakam"
                  className={inputCls}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Şifreyi Onayla">
                <input
                  type="password"
                  value={pass2}
                  onChange={(e) => setPass2(e.target.value)}
                  placeholder="Şifreni tekrar yaz"
                  className={inputCls}
                  autoComplete="new-password"
                />
              </Field>
              <button type="submit" disabled={busy} className={primaryBtn}>
                Üye Ol
              </button>
            </form>
          )}

          {/* ── E-posta doğrulama (üyelik + şifre sıfırlama ortak görünüm) ── */}
          {(mode === "verify" || mode === "forgotCode") && (
            <form
              onSubmit={mode === "verify" ? handleVerify : handleForgotCode}
              className="space-y-4"
            >
              <Field label="Doğrulama Kodu">
                <input
                  ref={codeRef}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="······"
                  inputMode="numeric"
                  className={`${inputCls} text-center text-2xl tracking-[0.6em] placeholder:tracking-[0.3em]`}
                />
              </Field>
              <button
                type="submit"
                disabled={busy || code.length !== 6}
                className={primaryBtn}
              >
                {mode === "verify" ? "Doğrula ve Giriş Yap" : "Kodu Onayla"}
              </button>
              <div className="text-xs text-neutral-500">
                <span>
                  Kod gelmedi mi?{" "}
                  {resendIn > 0 ? (
                    <span className="text-neutral-400">
                      {resendIn} sn sonra tekrar
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => dispatchCode(email)}
                      className="cursor-pointer font-semibold text-neutral-700 underline-offset-2 hover:underline"
                    >
                      Yeniden gönder
                    </button>
                  )}
                </span>
              </div>
            </form>
          )}

          {/* ── Şifremi unuttum: e-posta ── */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotSend} className="space-y-4">
              <Field label="Üyelikteki E-postan">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@eposta.com"
                  className={inputCls}
                  autoComplete="email"
                />
              </Field>
              <button type="submit" disabled={busy} className={primaryBtn}>
                Sıfırlama Kodu Gönder
              </button>
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="w-full cursor-pointer text-center text-xs font-medium text-neutral-500 underline-offset-2 hover:underline"
              >
                Girişe geri dön
              </button>
            </form>
          )}

          {/* ── Şifremi unuttum: yeni şifre ── */}
          {mode === "forgotReset" && (
            <form onSubmit={handleForgotReset} className="space-y-4">
              <Field label="Yeni Şifre">
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="En az 8 karakter, harf + rakam"
                  className={inputCls}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Yeni Şifreyi Onayla">
                <input
                  type="password"
                  value={pass2}
                  onChange={(e) => setPass2(e.target.value)}
                  placeholder="Şifreni tekrar yaz"
                  className={inputCls}
                  autoComplete="new-password"
                />
              </Field>
              <button type="submit" disabled={busy} className={primaryBtn}>
                Şifreyi Güncelle ve Giriş Yap
              </button>
            </form>
          )}

          {/* Google + mod değiştirici — kod ekranlarında gizli */}
          {(mode === "login" || mode === "register") && (
            <>
              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-neutral-200" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                  veya
                </span>
                <span className="h-px flex-1 bg-neutral-200" />
              </div>
              {googleClientId ? (
                // Gerçek Google butonu (GIS) — Client ID admin panelde tanımlı
                <div ref={gisBtnRef} className="flex min-h-11 justify-center" />
              ) : (
                <button
                  type="button"
                  onClick={() => setGoogleOpen(true)}
                  className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-neutral-300 bg-white py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  <GoogleIcon />
                  Google ile {mode === "login" ? "giriş yap" : "üye ol"}
                </button>
              )}
              <p className="mt-5 text-center text-sm text-neutral-500">
                {mode === "login" ? (
                  <>
                    Hesabın yok mu?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className="cursor-pointer font-semibold text-neutral-800 underline-offset-2 hover:underline"
                    >
                      Üye ol
                    </button>
                  </>
                ) : (
                  <>
                    Zaten üye misin?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="cursor-pointer font-semibold text-neutral-800 underline-offset-2 hover:underline"
                    >
                      Giriş yap
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Test hesabı hatırlatması (demo) */}
      <p className="mt-6 rounded-full bg-white/80 px-4 py-1.5 text-[11px] text-neutral-400 shadow-sm">
        Test hesabı: <b className="text-neutral-500">deniz@test.com</b> · şifre{" "}
        <b className="text-neutral-500">Manifest123</b>
      </p>

      {/* ── Demo "gelen e-posta" bildirimi — sağ üstten süzülür ── */}
      {mail && (
        <div className="fixed right-4 top-4 z-[2000] w-80 max-w-[92vw] overflow-hidden rounded-2xl bg-white shadow-[0_16px_50px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between bg-neutral-800 px-4 py-2.5">
            <span className="flex items-center gap-2 text-xs font-semibold text-white">
              📬 Gelen Kutusu
              <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
                DEMO
              </span>
            </span>
            <button
              type="button"
              onClick={() => setMail(null)}
              aria-label="Bildirimi kapat"
              className="cursor-pointer text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="px-4 py-3.5">
            <p className="text-xs text-neutral-400">
              Kime: <span className="text-neutral-600">{mail.to}</span>
            </p>
            <p className="mt-1 text-sm font-semibold text-neutral-800">
              Manifest Duvarı — Doğrulama Kodun
            </p>
            <p className="mt-2.5 rounded-xl bg-amber-50 py-2.5 text-center text-2xl font-bold tracking-[0.35em] text-amber-700">
              {mail.code}
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-neutral-400">
              Kod 10 dakika geçerli. Canlı sistemde bu kod gerçek e-posta
              olarak gönderilecek.
            </p>
          </div>
        </div>
      )}

      {/* ── Google hesap seçici (demo) ── */}
      {googleOpen && (
        <div
          className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setGoogleOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-center gap-2">
              <GoogleIcon />
              <span className="text-sm font-medium text-neutral-600">
                Google ile oturum aç
              </span>
              <span className="ml-auto rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400">
                DEMO
              </span>
            </div>
            <p className="mb-4 text-xs text-neutral-400">
              Manifest Duvarı&apos;na devam etmek için bir hesap seç
            </p>
            <button
              type="button"
              onClick={handleGooglePick}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3 text-left transition-colors hover:bg-neutral-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#CDEAFF] text-sm font-bold text-[#2F5E8C]">
                {DEMO_GOOGLE.name[0]}
              </span>
              <span>
                <span className="block text-sm font-medium text-neutral-800">
                  {DEMO_GOOGLE.name}
                </span>
                <span className="block text-xs text-neutral-500">
                  {DEMO_GOOGLE.email}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setGoogleOpen(false)}
              className="mt-3 w-full cursor-pointer rounded-xl py-2 text-center text-xs font-medium text-neutral-500 hover:bg-neutral-50"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}
      </main>
    </>
  );
}
