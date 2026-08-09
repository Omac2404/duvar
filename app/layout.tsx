import type { Metadata, Viewport } from "next";
import { Geist, Caveat } from "next/font/google";
import "./globals.css";
import { effectiveYear, getDb, getSetting } from "./lib/server/db";
import { getLegal, getSeo } from "./lib/server/content";
import { sessionUserId } from "./lib/server/session";
import type { QuotaInfo } from "./lib/quota";
import HeadCode from "./components/HeadCode";
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
        {/* Yasal sayfa linkleri artık alt barda değil menüde: yüzen alt
            menüyle alt alta gelince ikisi de kullanılamaz oluyordu */}
        {/* Yüzen alt menü + duvarda "Sen de yaz!" butonu */}
        <BottomNav initialLoggedIn={loggedIn} initialQuota={quota} />
        <CookieConsent text={cookieBanner} />
      </body>
    </html>
  );
}
