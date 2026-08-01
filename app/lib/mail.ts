// ── Bildirim (e-posta + Google girişi) ayarları ──────────────────────────
// Admin panelin "Bildirim Ayarları" sekmesinden yapılandırılır; ayarlar
// localStorage'da tutulur (demo katmanı — canlıda backend config'e taşınır).
// Gönderim /api/mail route'u üzerinden nodemailer ile yapılır. SMTP
// yapılandırılmamışsa üyelik ekranı demo bildirimine (ekrana düşen kod)
// geri döner.

export type MailConfig = {
  host: string; // SMTP sunucusu (örn. smtp.gmail.com)
  port: number; // 465 (SSL) veya 587 (STARTTLS)
  secure: boolean; // 465 için true, 587 için false
  user: string; // SMTP kullanıcı adı (çoğunlukla e-posta adresi)
  pass: string; // SMTP şifresi / uygulama şifresi
  fromName: string; // gönderen görünen adı
  fromEmail: string; // gönderen adresi
  googleClientId: string; // Google ile giriş (GIS) — boşsa demo hesap seçici
};

export const MAIL_CFG_KEY = "mw_mail_cfg";

const EMPTY: MailConfig = {
  host: "",
  port: 587,
  secure: false,
  user: "",
  pass: "",
  fromName: "Manifest Duvarı",
  fromEmail: "",
  googleClientId: "",
};

export function getMailConfig(): MailConfig {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = localStorage.getItem(MAIL_CFG_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<MailConfig>) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function saveMailConfig(cfg: MailConfig) {
  localStorage.setItem(MAIL_CFG_KEY, JSON.stringify(cfg));
}

// SMTP gönderime hazır mı? Host zorunlu; gönderen adresi boşsa SMTP
// kullanıcı adı gönderen olarak kullanılır
export function smtpReady(cfg: MailConfig = getMailConfig()): boolean {
  return Boolean(cfg.host.trim() && (cfg.fromEmail.trim() || cfg.user.trim()));
}

export async function sendMail(
  to: string,
  subject: string,
  text: string,
  html?: string,
): Promise<{ ok: boolean; error?: string }> {
  const cfg = getMailConfig();
  if (!smtpReady(cfg)) return { ok: false, error: "SMTP yapılandırılmamış" };
  try {
    const res = await fetch("/api/mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        smtp: {
          host: cfg.host,
          port: cfg.port,
          secure: cfg.secure,
          user: cfg.user,
          pass: cfg.pass,
          fromName: cfg.fromName,
          fromEmail: cfg.fromEmail.trim() || cfg.user.trim(),
        },
        to,
        subject,
        text,
        html,
      }),
    });
    return (await res.json()) as { ok: boolean; error?: string };
  } catch {
    return { ok: false, error: "Sunucuya ulaşılamadı" };
  }
}

// Doğrulama / şifre sıfırlama kodu e-postası — kod büyük ve okunaklı,
// site kimliğiyle (pastel şerit + beyaz kart) uyumlu HTML şablon
export function sendCodeMail(to: string, code: string) {
  const html = `
  <div style="margin:0;padding:32px 16px;background-color:#f4f1ea;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:440px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,0.08);">
      <div style="height:6px;background-color:#FFE8CD;background-image:linear-gradient(90deg,#FFC8CD,#FFE8CD,#FFFFCD,#CDFFD8,#CDEAFF,#EBCDFF);"></div>
      <div style="padding:28px 32px;">
        <p style="margin:0;font-size:20px;font-weight:bold;color:#262626;">Manifest Duvar&#305;</p>
        <p style="margin:14px 0 0;font-size:14px;line-height:1.6;color:#525252;">
          Merhaba! Do&#287;rulama kodun a&#351;a&#287;&#305;da. Kod <b>10 dakika</b> ge&#231;erli.
        </p>
        <div style="margin:22px 0;padding:20px 0;background-color:#fffbeb;border:1px solid #fde68a;border-radius:12px;text-align:center;">
          <span style="display:inline-block;font-size:36px;font-weight:bold;letter-spacing:12px;padding-left:12px;color:#b45309;font-family:'Courier New',Courier,monospace;">${code}</span>
        </div>
        <p style="margin:0;font-size:12px;line-height:1.6;color:#a3a3a3;">
          Bu iste&#287;i sen yapmad&#305;ysan bu e-postay&#305; g&#246;rmezden gelebilirsin.
        </p>
      </div>
    </div>
    <p style="max-width:440px;margin:14px auto 0;text-align:center;font-size:11px;color:#a3a3a3;">Manifest Duvar&#305; &#10024;</p>
  </div>`;
  return sendMail(
    to,
    "Manifest Duvarı — Doğrulama Kodun",
    `Doğrulama kodun: ${code}\n\n` +
      "Kod 10 dakika geçerli. Bu isteği sen yapmadıysan bu e-postayı " +
      "görmezden gelebilirsin.\n\nManifest Duvarı ✨",
    html,
  );
}
