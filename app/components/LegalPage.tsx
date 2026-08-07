// ── Yasal sayfa şablonu — Gizlilik/Çerez/Kullanım sayfalarının ortak
// görünümü. İçerik admin panelin İçerik > Yasal Sayfalar bölümünden gelir.

import SiteHeader from "./SiteHeader";

export default function LegalPage({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <main className="min-h-screen bg-neutral-100">
      <SiteHeader />
      <div className="mx-auto w-full max-w-2xl px-4 pb-20 pt-10">
        <h1 className="text-center text-2xl font-bold text-neutral-800">
          {title}
        </h1>
        <div className="mt-8 whitespace-pre-wrap rounded-2xl bg-white p-8 text-sm leading-relaxed text-neutral-700 shadow-sm max-[520px]:p-5">
          {content}
        </div>
      </div>
    </main>
  );
}
