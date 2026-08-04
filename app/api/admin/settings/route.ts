// ── Admin: ayarlar — SMTP/Google yapılandırması + reklam ve test modu ────

import {
  getDb,
  getMailSettings,
  getSetting,
  setSetting,
  type MailSettings,
} from "../../../lib/server/db";
import { isAdmin } from "../../../lib/server/session";
import { bad } from "../../../lib/server/validate";

export async function GET() {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const db = await getDb();
  return Response.json({
    mail: await getMailSettings(db),
    ads: await getSetting(db, "ads", false),
    testMode: await getSetting(db, "testMode", false),
  });
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const body = (await req.json()) as {
    mail?: Partial<MailSettings>;
    ads?: boolean;
    testMode?: boolean;
  };
  const db = await getDb();
  if (body.mail !== undefined) {
    const merged = { ...(await getMailSettings(db)), ...body.mail };
    await setSetting(db, "mail", merged);
  }
  if (body.ads !== undefined) await setSetting(db, "ads", !!body.ads);
  if (body.testMode !== undefined)
    await setSetting(db, "testMode", !!body.testMode);
  return Response.json({ ok: true });
}
