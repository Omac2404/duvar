// ── Herkese açık ayarlar — duvar ve üye ekranı okur ──────────────────────

import {
  effectiveYear,
  getDb,
  getMailSettings,
  getSetting,
} from "../../lib/server/db";
import { getInstagram, getMarquee } from "../../lib/server/content";
import { smtpConfigured } from "../../lib/server/mailer";

// Admin panelden değişen her ayar (şerit yazısı, Google Client ID, yıl
// simülasyonu, Webreta zarfı…) anında yansımalı; önbelleklenmemeli
export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();
  const mail = await getMailSettings(db);
  return Response.json(
    {
      ads: await getSetting(db, "ads", false),
      testMode: await getSetting(db, "testMode", false),
      webreta: await getSetting(db, "webreta", true),
      googleClientId: mail.googleClientId,
      smtpConfigured: await smtpConfigured(db),
      instagram: await getInstagram(db),
      marquee: await getMarquee(db),
      year: await effectiveYear(db),
      // İçinde bulunulan ay (TR) — duvar ay filtresi gelecek ayları gizler
      month: Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "Europe/Istanbul",
          month: "numeric",
        }).format(new Date()),
      ),
    },
    { headers: { "Cache-Control": "no-store, must-revalidate" } },
  );
}
