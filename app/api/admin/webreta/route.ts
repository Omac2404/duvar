// ── Admin: Webreta zarfına toplu beğeni gönder ──────────────────────────
// Girilen miktar beğeni sayacına eklenir (bot beğeni). Eksi değer
// gönderilirse sayaç düşer ama sıfırın altına inmez.

import { getDb, getSetting, setSetting } from "../../../lib/server/db";
import { isAdmin } from "../../../lib/server/session";
import { bad } from "../../../lib/server/validate";

const KEY = "webretaLikes";

export async function POST(req: Request) {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const body = (await req.json().catch(() => ({}))) as { add?: number };
  const add = Math.floor(Number(body.add));
  if (!Number.isFinite(add) || add === 0 || Math.abs(add) > 1000000)
    return bad("Geçersiz miktar.");
  const db = await getDb();
  const cur = Number(await getSetting(db, KEY, 0)) || 0;
  const next = Math.max(0, cur + add);
  await setSetting(db, KEY, next);
  return Response.json({ ok: true, likes: next });
}
