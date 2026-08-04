// ── Duvar verisi — tüm üye manifestleri (herkese açık) ───────────────────

import { getDb, toClientManifest, type ManifestRow } from "../../lib/server/db";

export async function GET() {
  const db = await getDb();
  const { rows } = await db.query("SELECT * FROM manifests ORDER BY ts DESC");
  return Response.json({
    manifests: (rows as ManifestRow[]).map(toClientManifest),
  });
}
