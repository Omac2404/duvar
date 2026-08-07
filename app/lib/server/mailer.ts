// ── Sunucu tarafı e-posta gönderimi ──────────────────────────────────────
// SMTP ayarları artık DB'deki settings tablosunda tutulur (admin panelden
// düzenlenir). Doğrulama kodu e-postası buradan gönderilir; SMTP hazır
// değilse gönderim yapılmaz ve akış demo bildirimine düşer (kod API
// yanıtında döner, üye ekranı ekranda gösterir).

import nodemailer from "nodemailer";
import type { Pool } from "pg";
import { getMailSettings } from "./db";
import { getNotify } from "./content";

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
export async function sendModerationMail(
  p: Pool,
  to: string,
  name: string,
  manifestText: string,
  reason: string,
) {
  // Bildirim anahtarı kapalıysa (admin > Bildirimler) mail gönderilmez
  if (!(await getNotify(p)).moderation)
    return { ok: false, error: "Bildirim kapalı (admin)" };
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
export async function sendAccountDeletedMail(p: Pool, to: string, name: string) {
  if (!(await getNotify(p)).accountDeleted)
    return { ok: false, error: "Bildirim kapalı (admin)" };
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

// ── Başarım (şans eşiği) bildirimleri ───────────────────────────────────
// Manifest 20/50/150/250 şansa ulaştığında sahibine kutlama maili gider;
// her eşik admin panelin Bildirimler sekmesinden ayrı ayrı açılıp kapanır.

export const MILESTONES = [
  {
    threshold: 20,
    key: "milestone20",
    reward: "Sticker Hakkı",
    desc:
      "Zarfının kapağına manifest türüne uygun bir süs sticker'ı " +
      "yapıştırabilirsin.",
  },
  {
    threshold: 50,
    key: "milestone50",
    reward: "Özel Renk Hakkı",
    desc:
      "Zarfın için duvarda kendini belli eden parlak özel seri " +
      "renklerden birini seçebilirsin.",
  },
  {
    threshold: 150,
    key: "milestone150",
    reward: "Şişedeki Not Hakkı",
    desc:
      "Manifestini zarftan çıkarıp duvarda cam şişenin içinde " +
      "sergileyebilirsin.",
  },
  {
    threshold: 250,
    key: "milestone250",
    reward: "Hediye Kutusu Hakkı",
    desc:
      "Manifestini şişeden çıkarıp duvardaki kurdeleli hediye kutusuna " +
      "koyabilirsin.",
  },
] as const;

function sendMilestoneMail(
  p: Pool,
  to: string,
  name: string,
  manifestText: string,
  m: (typeof MILESTONES)[number],
) {
  const firstName = name.split(/\s+/)[0] || name;
  const short =
    manifestText.length > 120 ? manifestText.slice(0, 120) + "…" : manifestText;
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `
  <div style="margin:0;padding:32px 16px;background-color:#f4f1ea;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:440px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,0.08);">
      <div style="height:6px;background-color:#FFE8CD;background-image:linear-gradient(90deg,#FFC8CD,#FFE8CD,#FFFFCD,#CDFFD8,#CDEAFF,#EBCDFF);"></div>
      <div style="padding:28px 32px;">
        <p style="margin:0;font-size:20px;font-weight:bold;color:#262626;">Manifest Duvar&#305;</p>
        <p style="margin:14px 0 0;font-size:14px;line-height:1.7;color:#525252;">
          Merhaba ${esc(firstName)}, m&#252;jde! &#127881;
        </p>
        <p style="margin:12px 0 0;font-size:14px;line-height:1.7;color:#525252;">
          A&#351;a&#287;&#305;daki manifestin <b>${m.threshold} &#351;ansa</b> ula&#351;t&#305; ve <b>${esc(m.reward)}</b> kazand&#305;n!
        </p>
        <div style="margin:18px 0;padding:14px 18px;background-color:#fafaf9;border-left:4px solid #fbbf24;border-radius:8px;">
          <p style="margin:0;font-size:13px;line-height:1.6;color:#78716c;font-style:italic;">&#8220;${esc(short)}&#8221;</p>
        </div>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#525252;">${esc(m.desc)}</p>
        <div style="margin:22px 0 0;text-align:center;">
          <a href="https://manifestduvari.com/panel" style="display:inline-block;padding:12px 28px;background-color:#262626;border-radius:12px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;">Hakk&#305;n&#305; Kullan</a>
        </div>
        <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#a3a3a3;">
          Sana &#351;ans dileyen herkese sevgiler; hayaline bir ad&#305;m daha yakla&#351;t&#305;n. &#10024;
        </p>
      </div>
    </div>
    <p style="max-width:440px;margin:14px auto 0;text-align:center;font-size:11px;color:#a3a3a3;">Manifest Duvar&#305; &#10024;</p>
  </div>`;
  return sendMail(
    p,
    to,
    `Manifest Duvarı: Zarfın ${m.threshold} Şansa Ulaştı! 🎉`,
    `Merhaba ${firstName}, müjde!\n\n` +
      `Şu manifestin ${m.threshold} şansa ulaştı ve ${m.reward} kazandın:\n\n` +
      `"${short}"\n\n${m.desc}\n\n` +
      "Üye panelinden hakkını hemen kullanabilirsin: " +
      "https://manifestduvari.com/panel\n\n" +
      "Sana şans dileyen herkese sevgiler; hayaline bir adım daha " +
      "yaklaştın. ✨\n\nManifest Duvarı",
    html,
  );
}

// Şans artışı eşik geçtiyse ilgili başarım maillerini gönderir. Çağıran
// beklemeden (void) kullanır; demo zarfları ve e-postasız hesaplar atlanır
export async function checkLuckMilestones(
  p: Pool,
  code: string,
  oldLuck: number,
  newLuck: number,
) {
  if (newLuck <= oldLuck) return;
  const crossed = MILESTONES.filter(
    (m) => oldLuck < m.threshold && newLuck >= m.threshold,
  );
  if (crossed.length === 0) return;
  const { rows } = await p.query(
    `SELECT m.manifest, m.is_demo, u.email, u.name
     FROM manifests m JOIN users u ON u.id = m.user_id
     WHERE m.code = $1`,
    [code],
  );
  const r = rows[0];
  if (!r || r.is_demo || !r.email) return;
  const notify = await getNotify(p);
  for (const m of crossed) {
    if (!notify[m.key]) continue;
    try {
      await sendMilestoneMail(p, r.email, r.name, r.manifest, m);
    } catch {
      // Mail hatası şans akışını etkilemez
    }
  }
}

// ── Tebrik eşiği bildirimi — her 100 tebrikte bir kutlama maili ─────────
function sendCheerMail(
  p: Pool,
  to: string,
  name: string,
  manifestText: string,
  hundred: number,
) {
  const firstName = name.split(/\s+/)[0] || name;
  const short =
    manifestText.length > 120 ? manifestText.slice(0, 120) + "…" : manifestText;
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `
  <div style="margin:0;padding:32px 16px;background-color:#f4f1ea;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:440px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,0.08);">
      <div style="height:6px;background-color:#FFE8CD;background-image:linear-gradient(90deg,#FFC8CD,#FFE8CD,#FFFFCD,#CDFFD8,#CDEAFF,#EBCDFF);"></div>
      <div style="padding:28px 32px;">
        <p style="margin:0;font-size:20px;font-weight:bold;color:#262626;">Manifest Duvar&#305;</p>
        <p style="margin:14px 0 0;font-size:14px;line-height:1.7;color:#525252;">
          Merhaba ${esc(firstName)}, harika haber! &#128079;
        </p>
        <p style="margin:12px 0 0;font-size:14px;line-height:1.7;color:#525252;">
          Ger&#231;ekle&#351;en manifestin i&#231;in ald&#305;&#287;&#305;n tebrik say&#305;s&#305; <b>${hundred}</b>&#39;e ula&#351;t&#305;!
        </p>
        <div style="margin:18px 0;padding:14px 18px;background-color:#f0fdf4;border-left:4px solid #34d399;border-radius:8px;">
          <p style="margin:0;font-size:13px;line-height:1.6;color:#78716c;font-style:italic;">&#8220;${esc(short)}&#8221;</p>
        </div>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#525252;">
          Bu hayali hem kurdu&#287;un hem de ger&#231;ekle&#351;tirdi&#287;in i&#231;in bir tur da biz tebrik ediyoruz; iyi ki yazd&#305;n, iyi ki ger&#231;ekle&#351;tirdin. &#128079;&#10024;
        </p>
        <div style="margin:22px 0 0;text-align:center;">
          <a href="https://manifestduvari.com/panel" style="display:inline-block;padding:12px 28px;background-color:#059669;border-radius:12px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;">Manifestini G&#246;r</a>
        </div>
      </div>
    </div>
    <p style="max-width:440px;margin:14px auto 0;text-align:center;font-size:11px;color:#a3a3a3;">Manifest Duvar&#305; &#10024;</p>
  </div>`;
  return sendMail(
    p,
    to,
    `Manifest Duvarı: Tebrik Sayın ${hundred}'e Ulaştı! 👏`,
    `Merhaba ${firstName}, harika haber!\n\n` +
      `Gerçekleşen manifestin için aldığın tebrik sayısı ${hundred}'e ulaştı:\n\n` +
      `"${short}"\n\n` +
      "Bu hayali hem kurduğun hem de gerçekleştirdiğin için bir tur da biz " +
      "tebrik ediyoruz; iyi ki yazdın, iyi ki gerçekleştirdin. 👏✨\n\n" +
      "https://manifestduvari.com/panel\n\nManifest Duvarı",
    html,
  );
}

// Tebrik artışı 100'lük eşiği geçtiyse kutlama maili gönderir (beklenmez)
export async function checkCheerMilestones(
  p: Pool,
  code: string,
  oldCheers: number,
  newCheers: number,
) {
  if (Math.floor(newCheers / 100) <= Math.floor(oldCheers / 100)) return;
  const { rows } = await p.query(
    `SELECT m.manifest, m.is_demo, u.email, u.name
     FROM manifests m JOIN users u ON u.id = m.user_id
     WHERE m.code = $1`,
    [code],
  );
  const r = rows[0];
  if (!r || r.is_demo || !r.email) return;
  if (!(await getNotify(p)).cheer100) return;
  try {
    await sendCheerMail(
      p,
      r.email,
      r.name,
      r.manifest,
      Math.floor(newCheers / 100) * 100,
    );
  } catch {
    // Mail hatası tebrik akışını etkilemez
  }
}

// Doğrulama / şifre sıfırlama kodu — site kimliğiyle uyumlu HTML şablon.
// Anahtar kapalıysa gönderilmez; akış demo bildirimine düşer (kod ekranda).
// purpose: üyelik doğrulaması mı şifre sıfırlama mı (ayrı anahtarlar)
export async function sendCodeMail(
  p: Pool,
  to: string,
  code: string,
  purpose: "verify" | "reset" = "verify",
) {
  const notify = await getNotify(p);
  if (!(purpose === "reset" ? notify.resetCode : notify.verifyCode))
    return { ok: false, error: "Bildirim kapalı (admin)" };
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
