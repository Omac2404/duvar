// ── robots.txt — arama motorlarına site haritasını gösterir ─────────────

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: "https://manifestduvari.com/sitemap.xml",
  };
}
