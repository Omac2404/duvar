// ── robots.txt — arama motorlarına site haritasını gösterir ─────────────

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    // Not: admin yolu bilerek listelenmez (robots.txt herkese açıktır)
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: "https://manifestduvari.com/sitemap.xml",
  };
}
