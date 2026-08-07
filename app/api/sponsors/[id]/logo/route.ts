// ── Sponsor logosu — data URL'den görsel servis eder (herkese açık) ─────
// Kampanya logosu DB'de data URL olarak durur; duvar zarfları bu uçtan
// çeker (dilim yükünü şişirmemek için görsel dilime gömülmez).

import { getDb } from "../../../../lib/server/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = Math.floor(Number((await params).id));
  if (!Number.isFinite(id) || id < 1)
    return new Response("Not found", { status: 404 });
  const db = await getDb();
  const { rows } = await db.query("SELECT logo FROM sponsors WHERE id = $1", [
    id,
  ]);
  const logo: string = rows[0]?.logo ?? "";
  const m = /^data:([\w/+.-]+);base64,(.+)$/.exec(logo);
  if (!m) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(m[2], "base64"), {
    headers: {
      "Content-Type": m[1],
      "Cache-Control": "public, max-age=300",
    },
  });
}
