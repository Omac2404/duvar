// ── Herkese açık ayarlar — duvar ve üye ekranı okur ──────────────────────

import { getDb, getMailSettings, getSetting } from "../../lib/server/db";
import { getInstagram } from "../../lib/server/content";
import { smtpConfigured } from "../../lib/server/mailer";

export async function GET() {
  const db = await getDb();
  const mail = await getMailSettings(db);
  return Response.json({
    ads: await getSetting(db, "ads", false),
    testMode: await getSetting(db, "testMode", false),
    googleClientId: mail.googleClientId,
    smtpConfigured: await smtpConfigured(db),
    instagram: await getInstagram(db),
  });
}
