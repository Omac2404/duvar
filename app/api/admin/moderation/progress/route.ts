// ── Admin: süren AI denetiminin anlık ilerlemesi ─────────────────────────
// Panel "Şimdi kontrol et" sırasında bu ucu yoklayıp çubuğu doldurur.

import { isAdmin } from "../../../../lib/server/session";
import { bad } from "../../../../lib/server/validate";
import { getModProgress } from "../../../../lib/server/moderation";

export async function GET() {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  return Response.json(getModProgress());
}
