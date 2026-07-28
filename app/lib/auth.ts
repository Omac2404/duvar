// ── Üyelik sistemi — demo katmanı ────────────────────────────────────────
// Tüm veriler tarayıcının localStorage'ında tutulur. Canlıya çıkarken bu
// dosyadaki fonksiyonlar gerçek bir backend'e (DB + e-posta servisi +
// Google OAuth) bağlanacak; ekranlar hiç değişmeden çalışmaya devam eder.

export type MemberManifest = {
  code: string; // 7 haneli arama kodu — 5 rakam + 2 harf (örn. 48213KT)
  name: string; // zarfın üstündeki isim/rumuz — her manifestte farklı olabilir
  manifest: string;
  date: string; // görünen tarih (ör. "12 Mart 2026")
  ts: number; // sıralama için timestamp
  luck: number;
  cheers: number;
  views: number;
  colorIdx: number; // PANEL_COLORS indeksi
  sticker?: string; // 20+ şans hakkı: üyenin seçtiği süs emojisi
  special?: number; // 50+ şans hakkı: seçilen özel renk (SPECIAL_COLORS idx)
  bottled?: boolean; // 150+ şans hakkı: üye onayıyla manifest şişeye konur
  realized: boolean;
  realizedDate?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  passHash: string; // demo hash — canlıda bcrypt/argon2 backend'de
  provider: "email" | "google";
  verified: boolean; // e-posta doğrulaması tamamlandı mı
  createdAt: string; // üyelik tarihi (görünen)
  manifests: MemberManifest[];
};

type CodeEntry = {
  code: string;
  expires: number; // timestamp
  attempts: number; // kalan deneme hakkı
  lastSent: number; // yeniden gönderme bekleme süresi için
};

const USERS_KEY = "mw_users";
const SESSION_KEY = "mw_session";
const CODES_KEY = "mw_codes";

export const CODE_TTL_MS = 10 * 60 * 1000; // kod 10 dakika geçerli
export const CODE_RESEND_MS = 60 * 1000; // 60 sn'de bir yeniden gönderilebilir
export const CODE_MAX_ATTEMPTS = 3;

// Demo şifre "hash"i — yalnızca düz metin saklamamak için (canlıda backend)
export function demoHash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return "h" + (h >>> 0).toString(36) + s.length.toString(36);
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Test hesabı — ilk açılışta otomatik tanımlanır ───────────────────────
const TEST_USER: User = {
  id: "u-test",
  name: "Deniz Yılmaz",
  email: "deniz@test.com",
  passHash: demoHash("Manifest123"),
  provider: "email",
  verified: true,
  createdAt: "12 Mart 2026",
  manifests: [
    {
      code: "90184AK",
      name: "Deniz Y.",
      manifest:
        "2026 bitmeden kendi kahve dükkanımı açacağım. Küçük ama sıcacık, " +
        "mahallenin buluşma noktası olacak bir yer.",
      date: "12 Mart 2026",
      ts: 1773262800000,
      luck: 184,
      cheers: 0, // tebrik yalnızca gerçekleşen manifestte olur
      views: 963,
      colorIdx: 0,
      realized: false,
    },
    {
      // Sticker barajını (20+) geçmiş ama süsünü henüz seçmemiş örnek —
      // panelde "Sticker'ını Ekle" butonu bu manifestte görünür
      code: "90267MZ",
      name: "Maratoncu Deniz",
      manifest:
        "Bu yıl ilk maratonumu koşacağım. 42 kilometre, adım adım, " +
        "vazgeçmeden.",
      date: "3 Nisan 2026",
      ts: 1775163600000,
      luck: 32,
      cheers: 0, // tebrik yalnızca gerçekleşen manifestte olur
      views: 508,
      colorIdx: 4,
      realized: false,
    },
    {
      code: "90311RT",
      name: "Deniz",
      manifest: "Annemi hep hayalini kurduğu Roma tatiline götüreceğim.",
      date: "18 Mayıs 2026",
      ts: 1779051600000,
      luck: 246,
      cheers: 73,
      views: 1204,
      colorIdx: 6,
      sticker: "✈️", // süsünü seçmiş örnek
      realized: true,
      realizedDate: "9 Temmuz 2026",
    },
  ],
};

// Test hesabına boş slot varsa eklenen ek örnekler (ödül akışı denemeleri)
const EXTRA_SAMPLES: MemberManifest[] = [
  {
    // Özel renk barajını (50+) geçmiş ama rengini seçmemiş örnek —
    // panelde "Özel Rengini Seç" butonu bu manifestte görünür
    code: "90355KB",
    name: "Şef Deniz",
    manifest:
      "Kendi restoranımda ilk servisimi açacağım. Menü baştan sona bana " +
      "ait olacak.",
    date: "22 Haziran 2026",
    ts: 1782086400000,
    luck: 61,
    cheers: 0,
    views: 289,
    colorIdx: 1,
    sticker: "💼", // sticker'ını seçmiş; sıradaki hak özel renk
    realized: false,
  },
  {
    // Şişe barajını (150+) geçmiş örnek: sticker ve özel renk seçili,
    // şişeye koyma onayı bekliyor — "Şişeye Koy" butonu bu manifestte çıkar
    code: "90418TN",
    name: "Yazar Deniz",
    manifest:
      "İlk romanımı bitirip yayınevine göndereceğim. Kapağında adımı " +
      "göreceğim.",
    date: "9 Mayıs 2026",
    ts: 1778284800000,
    luck: 172,
    cheers: 0,
    views: 861,
    colorIdx: 5,
    sticker: "⭐",
    special: 1, // Tutku (bordo) — şişe kurdelesi de bu renkte olur
    realized: false,
  },
];

// Google ile girişte kullanılacak örnek Google kimliği (demo)
export const DEMO_GOOGLE = {
  name: "Deniz Yılmaz",
  email: "deniz.yilmaz@gmail.com",
};

export function getUsers(): User[] {
  const users = read<User[]>(USERS_KEY, []);
  let dirty = false;
  // Test hesabı ilk açılışta tohumlanır; kullanıcı sildiyse geri gelmez
  if (
    !users.some((u) => u.id === TEST_USER.id) &&
    !read<boolean>("mw_test_deleted", false)
  ) {
    users.unshift(TEST_USER);
    dirty = true;
  }
  // Test hesabında ödül akışlarını denemek için örnek manifestler eksikse
  // ve boş slot varsa ekle: sticker hakkı (20+) ve özel renk hakkı (50+)
  const t = users.find((u) => u.id === TEST_USER.id);
  if (t) {
    const pool = [...TEST_USER.manifests, ...EXTRA_SAMPLES];
    for (const code of ["90267MZ", "90355KB", "90418TN"]) {
      const sample = pool.find((m) => m.code === code);
      if (
        sample &&
        !t.manifests.some((m) => m.code === code) &&
        t.manifests.length < 3
      ) {
        t.manifests.push({ ...sample });
        dirty = true;
      }
    }
  }
  if (dirty) write(USERS_KEY, users);
  return users;
}

export function saveUser(user: User) {
  const users = getUsers().map((u) => (u.id === user.id ? user : u));
  write(USERS_KEY, users);
}

// Hesabı kalıcı siler: üyelik, manifestler ve oturum birlikte gider
export function deleteUser(id: string) {
  write(
    USERS_KEY,
    getUsers().filter((u) => u.id !== id),
  );
  if (id === "u-test") write("mw_test_deleted", true);
  endSession();
}

export function findUser(email: string): User | undefined {
  const norm = email.trim().toLowerCase();
  return getUsers().find((u) => u.email.toLowerCase() === norm);
}

export function registerUser(
  name: string,
  email: string,
  password: string,
): { ok: true; user: User } | { ok: false; error: string } {
  if (findUser(email))
    return { ok: false, error: "Bu e-posta ile zaten bir üyelik var." };
  const user: User = {
    id: "u" + Date.now().toString(36),
    name: name.trim(),
    email: email.trim(),
    passHash: demoHash(password),
    provider: "email",
    verified: false,
    createdAt: new Date().toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    manifests: [],
  };
  const users = getUsers();
  users.push(user);
  write(USERS_KEY, users);
  return { ok: true, user };
}

// ── Oturum ───────────────────────────────────────────────────────────────
export function currentUser(): User | null {
  const id = read<string | null>(SESSION_KEY, null);
  if (!id) return null;
  return getUsers().find((u) => u.id === id) ?? null;
}

export function startSession(userId: string) {
  write(SESSION_KEY, userId);
}

export function endSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ── E-posta doğrulama kodu (demo: kod ekranda "gelen e-posta" olarak
// gösterilir; canlıda gerçek e-posta servisi gönderir) ────────────────────
export function sendCode(
  email: string,
): { ok: true; code: string } | { ok: false; waitSec: number } {
  const codes = read<Record<string, CodeEntry>>(CODES_KEY, {});
  const key = email.trim().toLowerCase();
  const now = Date.now();
  const prev = codes[key];
  if (prev && now - prev.lastSent < CODE_RESEND_MS)
    return {
      ok: false,
      waitSec: Math.ceil((CODE_RESEND_MS - (now - prev.lastSent)) / 1000),
    };
  const code = String(Math.floor(100000 + Math.random() * 900000));
  codes[key] = {
    code,
    expires: now + CODE_TTL_MS,
    attempts: CODE_MAX_ATTEMPTS,
    lastSent: now,
  };
  write(CODES_KEY, codes);
  return { ok: true, code };
}

export function verifyCode(
  email: string,
  entered: string,
): { ok: true } | { ok: false; error: string; left?: number } {
  const codes = read<Record<string, CodeEntry>>(CODES_KEY, {});
  const key = email.trim().toLowerCase();
  const entry = codes[key];
  if (!entry)
    return { ok: false, error: "Kod bulunamadı, yeniden gönderin." };
  if (Date.now() > entry.expires)
    return { ok: false, error: "Kodun süresi doldu, yeniden gönderin." };
  if (entry.attempts <= 0)
    return { ok: false, error: "Deneme hakkı bitti, yeni kod isteyin." };
  if (entry.code !== entered.trim()) {
    entry.attempts--;
    write(CODES_KEY, codes);
    return {
      ok: false,
      error:
        entry.attempts > 0
          ? `Kod hatalı. ${entry.attempts} deneme hakkın kaldı.`
          : "Deneme hakkı bitti, yeni kod isteyin.",
      left: entry.attempts,
    };
  }
  delete codes[key];
  write(CODES_KEY, codes);
  return { ok: true };
}

// ── Doğrulamalar ─────────────────────────────────────────────────────────
export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function passwordIssue(pass: string): string | null {
  if (pass.length < 8) return "Şifre en az 8 karakter olmalı.";
  if (!/[a-zA-ZğüşıöçĞÜŞİÖÇ]/.test(pass) || !/\d/.test(pass))
    return "Şifre en az bir harf ve bir rakam içermeli.";
  return null;
}

// Panel ve avatar için pastel renkler (duvar paletiyle birebir triple'lar:
// base gövde, dark kapak, ink yazı)
export const PANEL_COLORS = [
  { base: "#FFC8CD", dark: "#F7ABB2", ink: "#8E3B47" }, // pastel pembe
  { base: "#FFE8CD", dark: "#F9D4B0", ink: "#8A5A2A" }, // pastel şeftali
  { base: "#FFFFCD", dark: "#F4F3AD", ink: "#7A7420" }, // pastel sarı
  { base: "#CDFFD8", dark: "#AEEFC0", ink: "#2E7C48" }, // pastel nane yeşili
  { base: "#CDEAFF", dark: "#AED6F6", ink: "#2F5E8C" }, // pastel bebek mavisi
  { base: "#EBCDFF", dark: "#DAB2F7", ink: "#6D3A96" }, // pastel lila
  { base: "#FFD7E6", dark: "#F7BDD4", ink: "#94436A" }, // pastel gül kurusu
  { base: "#C9F0E2", dark: "#ACE3CF", ink: "#2F6E58" }, // pastel su yeşili
];
