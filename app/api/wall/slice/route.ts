// ── Duvar dilimi — [from, to) sıra aralığındaki zarflar ─────────────────

import { getDb } from "../../../lib/server/db";
import { bad } from "../../../lib/server/validate";
import { wallSlice } from "../../../lib/server/wall";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const y = Number(url.searchParams.get("y")) || 0;
  const mo = Number(url.searchParams.get("mo")) || 0;
  const from = Math.max(0, Number(url.searchParams.get("from")) || 0);
  const to = Number(url.searchParams.get("to")) || 0;
  if (to <= from || to - from > 1000) return bad("Geçersiz aralık.");
  const db = await getDb();
  const items = await wallSlice(db, y, mo, from, to);
  return Response.json({ from, items });
}
