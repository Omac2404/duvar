// ── Site haritası — /sitemap.xml ────────────────────────────────────────
// Hangi sayfaların listeleneceği admin panelin Ayarlar > SEO bölümünden
// yönetilir (hariç tutulanlar settings: seo.sitemapExclude). Ana sayfa
// her zaman listelenir.

import type { MetadataRoute } from "next";
import { getDb } from "./lib/server/db";
import { getSeo, SITE_PAGES } from "./lib/server/content";

const BASE = "https://manifestduvari.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await getDb();
  const seo = await getSeo(db);
  return SITE_PAGES.filter(
    (p) => p.path === "/" || !seo.sitemapExclude.includes(p.path),
  ).map((p) => ({
    url: p.path === "/" ? BASE : `${BASE}${p.path}`,
    lastModified: new Date(),
    changeFrequency: p.path === "/" ? "daily" : "monthly",
    priority: p.path === "/" ? 1 : 0.6,
  }));
}
