// ── Oturumdaki üye — manifestleriyle birlikte (yoksa user: null) ─────────

import { sessionUser } from "../../../lib/server/session";

export async function GET() {
  return Response.json({ user: await sessionUser() });
}
