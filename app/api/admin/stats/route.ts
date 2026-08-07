// ── Admin: Genel Bakış istatistikleri ───────────────────────────────────
// Kartlar (bugün / son 7 gün / son 30 gün / toplam) ve son 30 günün
// günlük serileri. Gün sınırları Türkiye saatine göredir; üye metrikleri
// demo manifestleri dışarıda tutar.

import { getDb } from "../../../lib/server/db";
import { isAdmin } from "../../../lib/server/session";
import { bad } from "../../../lib/server/validate";

const TR_OFFSET_MS = 3 * 3600 * 1000; // Europe/Istanbul, DST yok

// Türkiye saatiyle bugünün başlangıcı (UTC ms)
function trMidnight(): number {
  return (
    Math.floor((Date.now() + TR_OFFSET_MS) / 86400000) * 86400000 -
    TR_OFFSET_MS
  );
}

export async function GET() {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const db = await getDb();

  const today = trMidnight();
  const week = today - 6 * 86400000; // bugün dahil son 7 gün
  const month = today - 29 * 86400000; // bugün dahil son 30 gün

  const [users, manifests, engage, ops, sponsors, mSeries, uSeries] =
    await Promise.all([
      db.query(
        `SELECT COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE created_at >= to_timestamp($1 / 1000.0))::int AS today,
           COUNT(*) FILTER (WHERE created_at >= to_timestamp($2 / 1000.0))::int AS week,
           COUNT(*) FILTER (WHERE created_at >= to_timestamp($3 / 1000.0))::int AS month,
           COUNT(*) FILTER (WHERE verified)::int AS verified
         FROM users`,
        [today, week, month],
      ),
      db.query(
        `SELECT COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE ts >= $1)::int AS today,
           COUNT(*) FILTER (WHERE ts >= $2)::int AS week,
           COUNT(*) FILTER (WHERE ts >= $3)::int AS month,
           COUNT(*) FILTER (WHERE sticker IS NOT NULL)::int AS sticker,
           COUNT(*) FILTER (WHERE special IS NOT NULL)::int AS special,
           COUNT(*) FILTER (WHERE bottled AND NOT boxed)::int AS bottled,
           COUNT(*) FILTER (WHERE boxed)::int AS boxed,
           COUNT(*) FILTER (WHERE realized)::int AS realized
         FROM manifests WHERE NOT is_demo`,
        [today, week, month],
      ),
      db.query(
        `SELECT COALESCE(SUM(luck), 0)::bigint AS luck,
           COALESCE(SUM(cheers), 0)::bigint AS cheers,
           COALESCE(SUM(views), 0)::bigint AS views,
           COUNT(*) FILTER (WHERE is_demo)::int AS demo
         FROM manifests`,
      ),
      db.query(
        `SELECT
           (SELECT COUNT(*) FROM moderation_flags WHERE status = 'pending')::int AS pending_flags,
           (SELECT COUNT(*) FROM reports)::int AS reports,
           (SELECT COUNT(*) FROM contact_messages)::int AS messages`,
      ),
      db.query(
        `SELECT COALESCE(SUM(views), 0)::int AS views,
           COALESCE(SUM(link_clicks), 0)::int AS links,
           COALESCE(SUM(coupon_clicks), 0)::int AS coupons
         FROM sponsors`,
      ),
      db.query(
        `SELECT FLOOR((ts + $2) / 86400000)::bigint AS day, COUNT(*)::int AS n
         FROM manifests WHERE NOT is_demo AND ts >= $1
         GROUP BY 1`,
        [month, TR_OFFSET_MS],
      ),
      db.query(
        `SELECT FLOOR((EXTRACT(EPOCH FROM created_at) * 1000 + $2) / 86400000)::bigint AS day,
           COUNT(*)::int AS n
         FROM users WHERE created_at >= to_timestamp($1 / 1000.0)
         GROUP BY 1`,
        [month, TR_OFFSET_MS],
      ),
    ]);

  // Son 30 günün eksiksiz gün listesi (boş günler 0)
  const mMap = new Map(mSeries.rows.map((r) => [Number(r.day), r.n as number]));
  const uMap = new Map(uSeries.rows.map((r) => [Number(r.day), r.n as number]));
  const days: { label: string; manifests: number; users: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const dayStart = today - i * 86400000;
    const dayNo = Math.floor((dayStart + TR_OFFSET_MS) / 86400000);
    days.push({
      label: new Date(dayStart + TR_OFFSET_MS).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }),
      manifests: mMap.get(dayNo) ?? 0,
      users: uMap.get(dayNo) ?? 0,
    });
  }

  const u = users.rows[0];
  const m = manifests.rows[0];
  const e = engage.rows[0];
  const o = ops.rows[0];
  const s = sponsors.rows[0];
  return Response.json({
    users: {
      today: u.today,
      week: u.week,
      month: u.month,
      total: u.total,
      verified: u.verified,
    },
    manifests: {
      today: m.today,
      week: m.week,
      month: m.month,
      total: m.total,
      sticker: m.sticker,
      special: m.special,
      bottled: m.bottled,
      boxed: m.boxed,
      realized: m.realized,
    },
    engage: {
      luck: Number(e.luck),
      cheers: Number(e.cheers),
      views: Number(e.views),
      demo: e.demo,
    },
    ops: {
      pendingFlags: o.pending_flags,
      reports: o.reports,
      messages: o.messages,
    },
    sponsors: { views: s.views, links: s.links, coupons: s.coupons },
    days,
  });
}
