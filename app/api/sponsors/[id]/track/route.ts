// ── Sponsor metriği — zarf açılma / link tıklama / kod kopyalama ────────
// Duvar popup'ından beklenmeden gönderilir; kampanya satırındaki sayaç
// artar. Görüntülenme istemcide cihaz başına günde 1 ile sınırlanır.

import { getDb } from "../../../../lib/server/db";
import { bad } from "../../../../lib/server/validate";

const COLS: Record<string, string> = {
  view: "views",
  link: "link_clicks",
  coupon: "coupon_clicks",
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = Math.floor(Number((await params).id));
  if (!Number.isFinite(id) || id < 1) return bad("Geçersiz kampanya.");
  const body = (await req.json().catch(() => ({}))) as { type?: string };
  const col = COLS[body.type ?? ""];
  if (!col) return bad("Geçersiz tip.");
  const db = await getDb();
  await db.query(`UPDATE sponsors SET ${col} = ${col} + 1 WHERE id = $1`, [id]);
  return Response.json({ ok: true });
}
