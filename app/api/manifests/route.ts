// ── (Eski uç) üye manifestleri — duvar artık /api/wall/* dilimlerini
// kullanır. Geriye dönük uyumluluk için kalır: demolar hariç, sınırlı ──

import { getDb, toClientManifest, type ManifestRow } from "../../lib/server/db";

export async function GET() {
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT * FROM manifests WHERE NOT is_demo ORDER BY ts DESC LIMIT 5000",
  );
  return Response.json({
    manifests: (rows as ManifestRow[]).map(toClientManifest),
  });
}
