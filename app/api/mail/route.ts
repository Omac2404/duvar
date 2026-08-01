// ── E-posta gönderim ucu ─────────────────────────────────────────────────
// SMTP ayarları admin panelde tutulduğu için istekle birlikte gelir (demo
// katmanı — canlıda ayarlar sunucu config'inde saklanır, istekten alınmaz).

import nodemailer from "nodemailer";

type MailBody = {
  smtp?: {
    host?: string;
    port?: number;
    secure?: boolean;
    user?: string;
    pass?: string;
    fromName?: string;
    fromEmail?: string;
  };
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
};

export async function POST(req: Request) {
  try {
    const { smtp, to, subject, text, html } = (await req.json()) as MailBody;
    if (!smtp?.host || !smtp.fromEmail || !to || !subject)
      return Response.json(
        { ok: false, error: "Eksik SMTP ayarı veya alıcı" },
        { status: 400 },
      );

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: Number(smtp.port) || 587,
      secure: Boolean(smtp.secure),
      auth: smtp.user ? { user: smtp.user, pass: smtp.pass ?? "" } : undefined,
    });

    await transporter.sendMail({
      from: smtp.fromName
        ? `"${smtp.fromName}" <${smtp.fromEmail}>`
        : smtp.fromEmail,
      to,
      subject,
      text: text ?? "",
      html: html || undefined,
    });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Gönderim hatası" },
      { status: 500 },
    );
  }
}
