// ── Bildirim (e-posta + Google girişi) ayar tipi ─────────────────────────
// Ayarlar artık backend'de (settings tablosu) tutulur; admin panel
// /api/admin/settings üzerinden okur-yazar. Kod e-postaları sunucudan
// gönderilir. Burada kalanlar: tip tanımı, hazırlık kontrolü ve admin
// panelin kaydedilmemiş form değerleriyle yaptığı SMTP testi.

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

export const EMPTY_MAIL_CONFIG: MailConfig = {
  host: "",
  port: 587,
  secure: false,
  user: "",
  pass: "",
  fromName: "Manifest Duvarı",
  fromEmail: "",
  googleClientId: "",
};

// SMTP gönderime hazır mı? Host zorunlu; gönderen adresi boşsa SMTP
// kullanıcı adı gönderen olarak kullanılır
export function smtpReady(cfg: MailConfig): boolean {
  return Boolean(cfg.host.trim() && (cfg.fromEmail.trim() || cfg.user.trim()));
}

// Admin panel SMTP testi — formdaki (kaydedilmemiş olabilecek) ayarlarla
// /api/mail üzerinden deneme gönderimi yapar
export async function sendTestMail(
  cfg: MailConfig,
  to: string,
  subject: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
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
      }),
    });
    return (await res.json()) as { ok: boolean; error?: string };
  } catch {
    return { ok: false, error: "Sunucuya ulaşılamadı" };
  }
}
