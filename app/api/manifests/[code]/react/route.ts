// ── Duvar tepkileri — şans dile / tebrik / görüntülenme sayaçları ────────
// Demo (seed) zarfları DB'de yoktur: ok:false döner, sayaç oturumluk kalır
// (mevcut davranışla birebir). Test modunda +10'luk artışa izin verilir.

import { getDb, getSetting } from "../../../../lib/server/db";
import { checkLuckMilestones } from "../../../../lib/server/mailer";
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
  // Şans 20/50/150/250 eşiğini geçtiyse sahibine başarım maili (beklenmez)
  if (type === "luck" && rows.length > 0) {
    const newLuck = Number(rows[0].val);
    void checkLuckMilestones(db, code, newLuck - d, newLuck).catch(() => {});
  }
  return Response.json({ ok: (rowCount ?? 0) > 0, applied: d });
}
