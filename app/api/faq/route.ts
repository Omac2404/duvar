// ── Merak Edilenler (SSS) — herkese açık liste ──────────────────────────
// Admin panelden düzenlendiği anda yansımalı. Yanıtta hiç Cache-Control
// yokken tarayıcı/ara katman eski cevabı tutabiliyor ve düzenleme
// görünmüyordu; bu yüzden önbellekleme açıkça kapatılır.

import { getDb } from "../../lib/server/db";
import { getFaq } from "../../lib/server/content";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();
  return Response.json(
    { faq: await getFaq(db) },
    { headers: { "Cache-Control": "no-store, must-revalidate" } },
  );
}
