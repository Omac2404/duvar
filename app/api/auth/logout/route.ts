// ── Çıkış — oturum kaydı silinir, cookie düşer ───────────────────────────

import { endSession } from "../../../lib/server/session";

export async function POST() {
  await endSession();
  return Response.json({ ok: true });
}
