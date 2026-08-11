// ── robots.txt — arama motorlarına site haritasını gösterir ─────────────

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    // Not: admin yolu bilerek listelenmez (robots.txt herkese açıktır).
    // /api/favicon açıkça serbest bırakılır: site ikonu oradan servis
    // ediliyor ve "/api/" yasağına takılınca Google ikonu hiç indiremiyor,
    // arama sonuçlarında favicon çıkmıyordu (daha uzun kural kazanır)
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/favicon"],
        disallow: ["/api/"],
      },
    ],
    sitemap: "https://manifestduvari.com/sitemap.xml",
  };
}
