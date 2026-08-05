// ── Moderasyon kategorileri — sunucu ve admin panel ortak kullanır ───────
// AI denetimi manifestleri bu kategorilere göre ayıklar; rozet renkleri
// admin paneldeki görünüm içindir.

export const MOD_CATEGORIES = {
  hakaret: {
    label: "Hakaret",
    desc: "Kişiye veya gruba hakaret, alay, aşağılama, küçümseme",
    chip: "bg-red-100 text-red-700",
  },
  kufur_argo: {
    label: "Küfür / Argo",
    desc: "Açık veya sansürlenmiş küfür, kaba argo ifadeler",
    chip: "bg-orange-100 text-orange-700",
  },
  nefret: {
    label: "Nefret Söylemi",
    desc: "Irk, din, dil, cinsiyet, kimlik üzerinden ayrımcılık ve nefret",
    chip: "bg-rose-100 text-rose-800",
  },
  tehdit_kotu_niyet: {
    label: "Tehdit / Kötü Niyet",
    desc: "Şiddet iması, tehdit, beddua, birinin kötülüğünü dileme",
    chip: "bg-purple-100 text-purple-700",
  },
  iletisim_bilgisi: {
    label: "İletişim Bilgisi",
    desc: "Telefon, e-posta, sosyal medya hesabı, adres, link, kişisel veri",
    chip: "bg-sky-100 text-sky-700",
  },
  reklam_spam: {
    label: "Reklam / Spam",
    desc: "Ürün-hizmet tanıtımı, yönlendirme, anlamsız veya tekrarlı içerik",
    chip: "bg-amber-100 text-amber-700",
  },
  mustehcen: {
    label: "Müstehcen",
    desc: "Cinsel içerik, müstehcen ifade ve imalar",
    chip: "bg-pink-100 text-pink-700",
  },
  olumsuz: {
    label: "Olumsuz Nitelik",
    desc: "Manifest ruhuna aykırı umutsuzluk, karamsarlık, olumsuz dilek",
    chip: "bg-neutral-200 text-neutral-600",
  },
} as const;

export type ModCategory = keyof typeof MOD_CATEGORIES;

export function modCategoryLabel(cat: string): string {
  return MOD_CATEGORIES[cat as ModCategory]?.label ?? cat;
}

// ── Admin panel için client tipleri ──────────────────────────────────────

export type ModFlag = {
  id: number;
  code: string;
  name: string;
  manifest: string;
  category: string;
  confidence: number;
  reason: string;
  excerpt: string;
  selfHarm: boolean;
  status: "pending" | "approved" | "deleted";
};

// Süren denetimin anlık durumu — panel ilerleme çubuğu bunu yoklar
export type ModProgress = {
  active: boolean;
  startedAt: number;
  totalWindows: number;
  doneWindows: number;
  scanning: number; // aktif pencerede AI'ya gönderilen manifest sayısı
};

export type ModRun = {
  id: number;
  windowStart: number;
  windowEnd: number;
  scanned: number;
  flagged: number;
  status: "ok" | "failed";
  kind: "auto" | "range";
  error?: string;
  flags: ModFlag[];
};
