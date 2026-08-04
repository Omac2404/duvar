// ── Yeni manifest kodu — panel yazma modalı açılırken peşin atanır ───────

import { generateCode, getDb } from "../../../lib/server/db";
import { sessionUserId } from "../../../lib/server/session";
import { bad } from "../../../lib/server/validate";

export async function GET() {
  if (!(await sessionUserId())) return bad("Oturum bulunamadı.", 401);
  const db = await getDb();
  return Response.json({ code: await generateCode(db) });
}
