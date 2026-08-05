// ── Admin: manifest listesi — sunucu taraflı arama/filtre/sıralama ──────
// 100 bin+ kayıtta panel donmasın diye liste sayfalı gelir (50/sayfa).
// Demo manifestler de bu listededir; satırda "demo" etiketiyle görünür.

import { getDb, toClientManifest, type ManifestRow } from "../../../lib/server/db";
import { isAdmin } from "../../../lib/server/session";
import { bad } from "../../../lib/server/validate";

const PER_PAGE = 50;

export async function GET(req: Request) {
  if (!(await isAdmin())) return bad("Yetki yok.", 401);
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const filter = url.searchParams.get("filter") ?? "all";
  const sort = url.searchParams.get("sort") === "old" ? "ASC" : "DESC";
  const page = Math.max(0, Number(url.searchParams.get("page")) || 0);

  const where: string[] = [];
  const params: unknown[] = [];
  if (q) {
    params.push(`%${q}%`);
    where.push(
      `(m.code ILIKE $${params.length} OR m.name ILIKE $${params.length} OR u.name ILIKE $${params.length})`,
    );
  }
  switch (filter) {
    case "sticker": where.push("m.sticker IS NOT NULL"); break;
    case "special": where.push("m.special IS NOT NULL"); break;
    case "bottled": where.push("m.bottled AND NOT m.boxed"); break;
    case "boxed": where.push("m.boxed"); break;
    case "realized": where.push("m.realized"); break;
    case "demo": where.push("m.is_demo"); break;
    case "member": where.push("NOT m.is_demo"); break;
  }
  const cond = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const db = await getDb();
  const [rows, count, stats] = await Promise.all([
    db.query(
      `SELECT m.*, u.name AS owner_name FROM manifests m
       JOIN users u ON u.id = m.user_id
       ${cond} ORDER BY m.ts ${sort} LIMIT ${PER_PAGE} OFFSET ${page * PER_PAGE}`,
      params,
    ),
    db.query(
      `SELECT COUNT(*)::int AS n FROM manifests m JOIN users u ON u.id = m.user_id ${cond}`,
      params,
    ),
    db.query(
      `SELECT COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE sticker IS NOT NULL)::int AS sticker,
         COUNT(*) FILTER (WHERE special IS NOT NULL)::int AS special,
         COUNT(*) FILTER (WHERE bottled AND NOT boxed)::int AS bottled,
         COUNT(*) FILTER (WHERE boxed)::int AS boxed,
         COUNT(*) FILTER (WHERE realized)::int AS realized,
         COUNT(*) FILTER (WHERE is_demo)::int AS demo,
         COALESCE(SUM(luck), 0)::bigint AS total_luck
       FROM manifests`,
    ),
  ]);
  const s = stats.rows[0];
  return Response.json({
    items: rows.rows.map((r) => ({
      ...toClientManifest(r as ManifestRow),
      owner: r.owner_name as string,
      ownerId: r.user_id as string,
      demo: r.is_demo as boolean,
    })),
    filtered: count.rows[0].n as number,
    perPage: PER_PAGE,
    counts: {
      total: s.total,
      sticker: s.sticker,
      special: s.special,
      bottled: s.bottled,
      boxed: s.boxed,
      realized: s.realized,
      demo: s.demo,
      totalLuck: Number(s.total_luck),
    },
  });
}
