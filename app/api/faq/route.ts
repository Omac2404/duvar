// ── Merak Edilenler (SSS) — herkese açık liste ──────────────────────────

import { getDb } from "../../lib/server/db";
import { getFaq } from "../../lib/server/content";

export async function GET() {
  const db = await getDb();
  return Response.json({ faq: await getFaq(db) });
}
