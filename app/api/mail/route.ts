// ── E-posta test ucu (yalnızca admin) ────────────────────────────────────
// Admin panelin SMTP testi, formdaki kaydedilmemiş ayarlarla deneme
// gönderimi yapabilsin diye ayarlar istekle gelir. Üyelik kodları gibi
// gerçek gönderimler sunucudaki kayıtlı ayarlarla lib/server/mailer'dan
// yapılır.

import nodemailer from "nodemailer";
import { isAdmin } from "../../lib/server/session";

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
  if (!(await isAdmin()))
    return Response.json({ ok: false, error: "Yetki yok" }, { status: 401 });
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
