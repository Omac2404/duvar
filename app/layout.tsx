import type { Metadata, Viewport } from "next";
import { Geist, Caveat } from "next/font/google";
import "./globals.css";
import { getDb, getSetting } from "./lib/server/db";
import { getSeo } from "./lib/server/content";
import HeadCode from "./components/HeadCode";

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
      ...(fav
        ? { icons: { icon: `/api/favicon?v=${fav.length}` } }
        : {}),
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
  try {
    headCode = (await getSeo(await getDb())).headCode;
  } catch {}
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <HeadCode code={headCode} />
        {children}
      </body>
    </html>
  );
}
