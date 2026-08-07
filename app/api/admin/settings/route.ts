// ── Admin: ayarlar — SMTP/Google yapılandırması + reklam ve test modu ────

import {
  getDb,
  getMailSettings,
  getSetting,
  setSetting,
  type MailSettings,
} from "../../../lib/server/db";
import {
  getFaq,
  getInstagram,
  getMarquee,
  type FaqItem,
  type InstagramSetting,
  type MarqueeSetting,
} from "../../../lib/server/content";
import { isAdmin } from "../../../lib/server/session";
import { bad } from "../../../lib/server/validate";

export async function GET() {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const db = await getDb();
  return Response.json({
    mail: await getMailSettings(db),
    ads: await getSetting(db, "ads", false),
    testMode: await getSetting(db, "testMode", false),
    aiKey: await getSetting(db, "aiKey", ""),
    aiEnabled: await getSetting(db, "aiEnabled", false),
    faq: await getFaq(db),
    instagram: await getInstagram(db),
    marquee: await getMarquee(db),
  });
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const body = (await req.json()) as {
    mail?: Partial<MailSettings>;
    ads?: boolean;
    testMode?: boolean;
    aiKey?: string;
    aiEnabled?: boolean;
    faq?: FaqItem[];
    instagram?: InstagramSetting;
    marquee?: MarqueeSetting;
  };
  const db = await getDb();
  if (body.mail !== undefined) {
    const merged = { ...(await getMailSettings(db)), ...body.mail };
    await setSetting(db, "mail", merged);
  }
  if (body.ads !== undefined) await setSetting(db, "ads", !!body.ads);
  if (body.testMode !== undefined)
    await setSetting(db, "testMode", !!body.testMode);
  if (body.aiKey !== undefined)
    await setSetting(db, "aiKey", String(body.aiKey).trim());
  if (body.aiEnabled !== undefined)
    await setSetting(db, "aiEnabled", !!body.aiEnabled);
  if (body.faq !== undefined) {
    if (!Array.isArray(body.faq)) return bad("Geçersiz SSS listesi.");
    const faq = body.faq
      .slice(0, 100)
      .map((f) => ({
        q: String(f?.q ?? "").slice(0, 300),
        a: String(f?.a ?? "").slice(0, 3000),
      }))
      .filter((f) => f.q.trim() && f.a.trim());
    await setSetting(db, "faq", faq);
  }
  if (body.instagram !== undefined)
    await setSetting(db, "instagram", {
      text: String(body.instagram?.text ?? "").slice(0, 60),
      url: String(body.instagram?.url ?? "").slice(0, 300),
    });
  if (body.marquee !== undefined)
    await setSetting(db, "marquee", {
      text: String(body.marquee?.text ?? "").slice(0, 200),
      seconds: Math.min(300, Math.max(5, Number(body.marquee?.seconds) || 36)),
    });
  return Response.json({ ok: true });
}
