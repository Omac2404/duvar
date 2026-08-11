// ── Site alt barı — çok ince, ortada yasal sayfa linkleri (ss111) ───────
// Yalnızca geniş ekranda: dar ekranda yüzen alt menüyle alt alta gelip
// ikisini de kullanılamaz hale getiriyordu, orada linkler hamburger
// menünün altında duruyor. KVKK/çerez metinlerine her iki ekranda da
// erişilebilir olması gerektiği için tamamen kaldırılmadı.

export default function SiteFooter() {
  return (
    // Zemin ve çerçeve yok: bar gibi durmasın, sayfanın arka planını alsın
    <footer className="mt-auto flex min-h-9 flex-wrap items-center justify-center gap-x-5 gap-y-1 bg-transparent px-4 py-1.5 max-[900px]:hidden">
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
