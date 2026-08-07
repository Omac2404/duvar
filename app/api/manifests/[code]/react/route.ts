// ── Duvar tepkileri — şans dile / tebrik / görüntülenme sayaçları ────────
// Demo (seed) zarfları DB'de yoktur: ok:false döner, sayaç oturumluk kalır
// (mevcut davranışla birebir). Test modunda +10'luk artışa izin verilir.

import { getDb, getSetting } from "../../../../lib/server/db";
import {
  checkCheerMilestones,
  checkLuckMilestones,
} from "../../../../lib/server/mailer";
import { bad } from "../../../../lib/server/validate";

const COLUMNS = { luck: "luck", cheer: "cheers", view: "views" } as const;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const { type, delta } = (await req.json()) as {
    type?: keyof typeof COLUMNS;
    delta?: number;
  };
  if (!type || !(type in COLUMNS)) return bad("Geçersiz tepki.");

  const db = await getDb();
  const testMode = await getSetting(db, "testMode", false);
  const maxDelta = type !== "view" && testMode ? 10 : 1;
  const d = Math.min(Math.max(Math.floor(delta ?? 1), 1), maxDelta);

  const col = COLUMNS[type];
  const { rows, rowCount } = await db.query(
    `UPDATE manifests SET ${col} = ${col} + $1 WHERE code = $2 RETURNING ${col} AS val`,
    [d, code],
  );
  // Eşik bildirimleri (beklenmez): şans 20/50/150/250, tebrik her 100'de
  if (rows.length > 0) {
    const val = Number(rows[0].val);
    if (type === "luck")
      void checkLuckMilestones(db, code, val - d, val).catch(() => {});
    else if (type === "cheer")
      void checkCheerMilestones(db, code, val - d, val).catch(() => {});
  }
  return Response.json({ ok: (rowCount ?? 0) > 0, applied: d });
}
