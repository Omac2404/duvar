// ── Site favicon'u — admin'in yüklediği görseli servis eder ─────────────
// Ayarlar > SEO bölümünden yüklenir (settings: favicon, data URL).
// Yüklenmemişse 404 döner; layout bu durumda varsayılan ikonu kullanır.

import { getDb, getSetting } from "../../lib/server/db";

export async function GET() {
  const db = await getDb();
  const fav = await getSetting<string>(db, "favicon", "");
  const m = /^data:([\w/+.-]+);base64,(.+)$/.exec(fav);
  if (!m) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(m[2], "base64"), {
    headers: {
      "Content-Type": m[1],
      "Cache-Control": "public, max-age=300",
    },
  });
}
