import type { Metadata, Viewport } from "next";
import { Geist, Caveat } from "next/font/google";
import "./globals.css";
import { getDb, getSetting } from "./lib/server/db";
import { getLegal, getSeo } from "./lib/server/content";
import HeadCode from "./components/HeadCode";
import SiteFooter from "./components/SiteFooter";
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

// Başlık, açıklama ve favicon admin panelin Ayarlar > SEO bölümünden gelir
export async function generateMetadata(): Promise<Metadata> {
  try {
    const db = await getDb();
    const seo = await getSeo(db);
    const fav = await getSetting<string>(db, "favicon", "");
    return {
      title: seo.title,
      description: seo.description,
      // Favicon admin'den yüklendiyse o, yoksa site logosu kullanılır
      icons: { icon: fav ? `/api/favicon?v=${fav.length}` : "/logo.png" },
    };
  } catch {
    // DB'ye ulaşılamazsa varsayılanlarla açılır
    return { title: "Manifest Duvarı", description: "Manifest Duvarı" };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let headCode = "";
  let cookieBanner = "";
  try {
    const db = await getDb();
    headCode = (await getSeo(db)).headCode;
    cookieBanner = (await getLegal(db)).cookieBanner;
  } catch {}
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <HeadCode code={headCode} />
        {children}
        {/* Sitenin en altında ince yasal bar (ss111) + çerez kutusu */}
        <SiteFooter />
        <CookieConsent text={cookieBanner} />
      </body>
    </html>
  );
}
