// ── Site alt barı — çok ince, ortada yasal sayfa linkleri (ss111) ───────

export default function SiteFooter() {
  return (
    <footer className="mt-auto flex min-h-9 flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-neutral-200 bg-white/80 px-4 py-1.5 backdrop-blur">
      <a
        href="/gizlilik"
        className="text-[11px] font-medium text-neutral-500 transition-colors hover:text-neutral-800"
      >
        Gizlilik ve KVKK Aydınlatma Metni
      </a>
      <a
        href="/cerez-politikasi"
        className="text-[11px] font-medium text-neutral-500 transition-colors hover:text-neutral-800"
      >
        Çerez Politikası
      </a>
      <a
        href="/kullanim-kosullari"
        className="text-[11px] font-medium text-neutral-500 transition-colors hover:text-neutral-800"
      >
        Kullanım Koşulları
      </a>
    </footer>
  );
}
