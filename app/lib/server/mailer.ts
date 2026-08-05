// ── Sunucu tarafı e-posta gönderimi ──────────────────────────────────────
// SMTP ayarları artık DB'deki settings tablosunda tutulur (admin panelden
// düzenlenir). Doğrulama kodu e-postası buradan gönderilir; SMTP hazır
// değilse gönderim yapılmaz ve akış demo bildirimine düşer (kod API
// yanıtında döner, üye ekranı ekranda gösterir).

import nodemailer from "nodemailer";
import type { Pool } from "pg";
import { getMailSettings } from "./db";

export async function smtpConfigured(p: Pool): Promise<boolean> {
  const cfg = await getMailSettings(p);
  return Boolean(cfg.host.trim() && (cfg.fromEmail.trim() || cfg.user.trim()));
}

export async function sendMail(
  p: Pool,
  to: string,
  subject: string,
  text: string,
  html?: string,
): Promise<{ ok: boolean; error?: string }> {
  const cfg = await getMailSettings(p);
  if (!cfg.host.trim() || !(cfg.fromEmail.trim() || cfg.user.trim()))
    return { ok: false, error: "SMTP yapılandırılmamış" };
  try {
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: Number(cfg.port) || 587,
      secure: Boolean(cfg.secure),
      auth: cfg.user ? { user: cfg.user, pass: cfg.pass ?? "" } : undefined,
    });
    const fromEmail = cfg.fromEmail.trim() || cfg.user.trim();
    await transporter.sendMail({
      from: cfg.fromName ? `"${cfg.fromName}" <${fromEmail}>` : fromEmail,
      to,
      subject,
      text,
      html: html || undefined,
    });
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Gönderim hatası",
    };
  }
}

// Moderasyon: kaldırılan manifest için yumuşak tonlu bilgilendirme maili.
// Amaç üyeyi kaybetmeden davranışı düzeltmek — suçlayıcı değil, davetkâr.
// reason boş verilirse sebep cümlesi atlanır ("kaldırılmıştır" bildirimi).
export function sendModerationMail(
  p: Pool,
  to: string,
  name: string,
  manifestText: string,
  reason: string,
) {
  const firstName = name.split(/\s+/)[0] || name;
  const short =
    manifestText.length > 140 ? manifestText.slice(0, 140) + "…" : manifestText;
  const reasonClause = reason.trim() ? `${reason.trim()} ` : "";
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `
  <div style="margin:0;padding:32px 16px;background-color:#f4f1ea;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:440px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,0.08);">
      <div style="height:6px;background-color:#FFE8CD;background-image:linear-gradient(90deg,#FFC8CD,#FFE8CD,#FFFFCD,#CDFFD8,#CDEAFF,#EBCDFF);"></div>
      <div style="padding:28px 32px;">
        <p style="margin:0;font-size:20px;font-weight:bold;color:#262626;">Manifest Duvar&#305;</p>
        <p style="margin:14px 0 0;font-size:14px;line-height:1.7;color:#525252;">
          Merhaba ${esc(firstName)},
        </p>
        <p style="margin:12px 0 0;font-size:14px;line-height:1.7;color:#525252;">
          Duvara ekledi&#287;in a&#351;a&#287;&#305;daki manifest, ${esc(reasonClause)}duvar&#305;m&#305;z&#305;n pozitif ruhunu korumak ad&#305;na yay&#305;ndan kald&#305;r&#305;ld&#305;.
        </p>
        <div style="margin:18px 0;padding:14px 18px;background-color:#fafaf9;border-left:4px solid #e7e5e4;border-radius:8px;">
          <p style="margin:0;font-size:13px;line-height:1.6;color:#78716c;font-style:italic;">&#8220;${esc(short)}&#8221;</p>
        </div>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#525252;">
          Bu bir ceza de&#287;il &#128153; Hayalini toplulu&#287;umuzun kurallar&#305;na uygun bir dille yeniden yazmay&#305; &#231;ok isteriz &#8212; duvar&#305;m&#305;zda sana her zaman yer var.
        </p>
        <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#a3a3a3;">
          Bir yanl&#305;&#351;l&#305;k oldu&#287;unu d&#252;&#351;&#252;n&#252;yorsan bu e-postay&#305; yan&#305;tlayarak bize ula&#351;abilirsin.
        </p>
      </div>
    </div>
    <p style="max-width:440px;margin:14px auto 0;text-align:center;font-size:11px;color:#a3a3a3;">Manifest Duvar&#305; &#10024;</p>
  </div>`;
  return sendMail(
    p,
    to,
    "Manifest Duvarı — Manifestin Hakkında Küçük Bir Not",
    `Merhaba ${firstName},\n\n` +
      `Duvara eklediğin şu manifest, ${reasonClause}duvarımızın pozitif ruhunu ` +
      `korumak adına yayından kaldırıldı:\n\n"${short}"\n\n` +
      `Bu bir ceza değil! Hayalini topluluğumuzun kurallarına uygun bir dille ` +
      `yeniden yazmayı çok isteriz — duvarımızda sana her zaman yer var.\n\n` +
      `Bir yanlışlık olduğunu düşünüyorsan bu e-postayı yanıtlayarak bize ` +
      `ulaşabilirsin.\n\nManifest Duvarı ✨`,
    html,
  );
}

// Üyelik silindi bildirimi — admin bir hesabı kaldırdığında gönderilir
export function sendAccountDeletedMail(p: Pool, to: string, name: string) {
  const firstName = name.split(/\s+/)[0] || name;
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `
  <div style="margin:0;padding:32px 16px;background-color:#f4f1ea;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:440px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,0.08);">
      <div style="height:6px;background-color:#FFE8CD;background-image:linear-gradient(90deg,#FFC8CD,#FFE8CD,#FFFFCD,#CDFFD8,#CDEAFF,#EBCDFF);"></div>
      <div style="padding:28px 32px;">
        <p style="margin:0;font-size:20px;font-weight:bold;color:#262626;">Manifest Duvar&#305;</p>
        <p style="margin:14px 0 0;font-size:14px;line-height:1.7;color:#525252;">
          Merhaba ${esc(firstName)},
        </p>
        <p style="margin:12px 0 0;font-size:14px;line-height:1.7;color:#525252;">
          Manifest Duvar&#305; hesab&#305;n&#305;z silinmi&#351;tir. Hesab&#305;n&#305;za ba&#287;l&#305; t&#252;m manifestler duvardan kald&#305;r&#305;ld&#305;.
        </p>
        <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#a3a3a3;">
          Bir yanl&#305;&#351;l&#305;k oldu&#287;unu d&#252;&#351;&#252;n&#252;yorsan&#305;z bu e-postay&#305; yan&#305;tlayarak bize ula&#351;abilirsiniz.
        </p>
      </div>
    </div>
    <p style="max-width:440px;margin:14px auto 0;text-align:center;font-size:11px;color:#a3a3a3;">Manifest Duvar&#305; &#10024;</p>
  </div>`;
  return sendMail(
    p,
    to,
    "Manifest Duvarı — Hesabınız Silindi",
    `Merhaba ${firstName},\n\n` +
      "Manifest Duvarı hesabınız silinmiştir. Hesabınıza bağlı tüm " +
      "manifestler duvardan kaldırıldı.\n\n" +
      "Bir yanlışlık olduğunu düşünüyorsanız bu e-postayı yanıtlayarak " +
      "bize ulaşabilirsiniz.\n\nManifest Duvarı ✨",
    html,
  );
}

// Doğrulama / şifre sıfırlama kodu — site kimliğiyle uyumlu HTML şablon
export function sendCodeMail(p: Pool, to: string, code: string) {
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
    p,
    to,
    "Manifest Duvarı — Doğrulama Kodun",
    `Doğrulama kodun: ${code}\n\n` +
      "Kod 10 dakika geçerli. Bu isteği sen yapmadıysan bu e-postayı " +
      "görmezden gelebilirsin.\n\nManifest Duvarı ✨",
    html,
  );
}
