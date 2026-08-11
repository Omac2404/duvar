import type { Metadata, Viewport } from "next";
import { Geist, Caveat } from "next/font/google";
import "./globals.css";
import { effectiveYear, getDb, getSetting } from "./lib/server/db";
import { getLegal, getSeo } from "./lib/server/content";
import { sessionUserId } from "./lib/server/session";
import type { QuotaInfo } from "./lib/quota";
import HeadCode from "./components/HeadCode";
import SiteFooter from "./components/SiteFooter";
import BottomNav from "./components/BottomNav";
import CookieConsent from "./components/CookieConsent";

// Tüm sayfalar istek anında sunulur: SEO/head kodu/çerez metni/yasal
// içerikler admin panelden değiştirilir değişmez yansır ve `next build`
// sırasında veritabanı bağlantısı gerekmez (Docker imajı DB'siz derlenir)
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

// Google arama sonuçlarında favicon göstermek için ikonun en az 48x48
// olması ve <link rel="icon" ... sizes> ile boyutunun bildirilmesi
// gerekiyor (16x16/32x32 klasik favicon'lar kullanılmıyor). Admin'in
// yüklediği ikon 192x192 kare saklanır — 48'in katı; hiç yüklenmemişse
// public/icon.png (192x192) devreye girer. /favicon.ico da statik olarak
// aynı kare ikonu döndürür ki doğrudan açıldığında boş kalmasın
function iconLinks(src: string) {
  return {
    icon: [
      { url: src, sizes: "48x48", type: "image/png" },
      { url: src, sizes: "192x192", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [{ url: src, sizes: "180x180", type: "image/png" }],
  };
}

// Başlık, açıklama ve favicon admin panelin Ayarlar > SEO bölümünden gelir
export async function generateMetadata(): Promise<Metadata> {
  try {
    const db = await getDb();
    const seo = await getSeo(db);
    const fav = await getSetting<string>(db, "favicon", "");
    return {
      title: seo.title,
      description: seo.description,
      metadataBase: new URL("https://manifestduvari.com"),
      // Favicon admin'den yüklendiyse o, yoksa kare site ikonu kullanılır
      icons: iconLinks(fav ? `/api/favicon?v=${fav.length}` : "/icon.png"),
    };
  } catch {
    // DB'ye ulaşılamazsa varsayılanlarla açılır
    return {
      title: "Manifest Duvarı",
      description: "Manifest Duvarı",
      icons: iconLinks("/icon.png"),
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let headCode = "";
  let cookieBanner = "";
  // Oturum ve yıllık hak durumu burada okunur ki alt bardaki "Sen de yaz!"
  // butonu daha ilk boyamada doğru etiketle çizilsin (girişsizde davet,
  // girişlide "2026 manifest 3/1", hak dolduğunda "3/3")
  let loggedIn = false;
  let quota: QuotaInfo | null = null;
  try {
    const db = await getDb();
    headCode = (await getSeo(db)).headCode;
    cookieBanner = (await getLegal(db)).cookieBanner;
    const uid = await sessionUserId();
    loggedIn = uid !== null;
    if (uid) {
      const year = await effectiveYear(db);
      const { rows } = await db.query(
        "SELECT count(*)::int AS n FROM manifests WHERE user_id = $1 AND y = $2",
        [uid, year],
      );
      quota = { year, used: rows[0].n as number };
    }
  } catch {}
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <HeadCode code={headCode} />
        {children}
        {/* Yasal link barı yalnızca geniş ekranda; dar ekranda aynı
            linkler hamburger menünün altında (yüzen menüyle çakışmasın) */}
        <SiteFooter />
        {/* Yüzen alt menü + duvarda "Sen de yaz!" butonu */}
        <BottomNav initialLoggedIn={loggedIn} initialQuota={quota} />
        <CookieConsent text={cookieBanner} />
      </body>
    </html>
  );
}
