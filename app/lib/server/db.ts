// ── Sunucu veri katmanı — Postgres bağlantısı + şema + seed ─────────────
// Tüm API route'ları buradaki getDb() üzerinden konuşur. Şema idempotent
// kurulur (CREATE TABLE IF NOT EXISTS); ilk açılışta test hesabı tohumlanır.
// DATABASE_URL: lokalde docker-compose'daki Postgres, canlıda EasyPanel.

import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { cleanNickname } from "../text";

// Dev'de HMR her modül yeniden yüklemesinde yeni Pool açmasın diye
// globalThis üzerinde saklanır
const g = globalThis as unknown as {
  mwPool?: Pool;
  mwInit?: Promise<void>;
};

function pool(): Pool {
  if (!g.mwPool) {
    g.mwPool = new Pool({
      connectionString:
        process.env.DATABASE_URL ??
        "postgres://manifest:manifest@localhost:5432/manifest",
      max: 10,
    });
  }
  return g.mwPool;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  pass_hash TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'email',
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower ON users (LOWER(email));

CREATE TABLE IF NOT EXISTS manifests (
  code TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  manifest TEXT NOT NULL,
  date_label TEXT NOT NULL,
  ts BIGINT NOT NULL,
  luck INT NOT NULL DEFAULT 0,
  cheers INT NOT NULL DEFAULT 0,
  views INT NOT NULL DEFAULT 0,
  color_idx INT NOT NULL DEFAULT 0,
  sticker TEXT,
  special INT,
  bottled BOOLEAN NOT NULL DEFAULT FALSE,
  boxed BOOLEAN NOT NULL DEFAULT FALSE,
  realized BOOLEAN NOT NULL DEFAULT FALSE,
  realized_label TEXT
);
CREATE INDEX IF NOT EXISTS manifests_user ON manifests (user_id);
-- Ölçekleme: demo bayrağı + yıl/ay kolonları (duvar filtre/dilim sorguları)
ALTER TABLE manifests ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE manifests ADD COLUMN IF NOT EXISTS y INT NOT NULL DEFAULT 0;
ALTER TABLE manifests ADD COLUMN IF NOT EXISTS mo INT NOT NULL DEFAULT 0;
UPDATE manifests SET
  y = EXTRACT(YEAR FROM to_timestamp(ts / 1000.0) AT TIME ZONE 'Europe/Istanbul'),
  mo = EXTRACT(MONTH FROM to_timestamp(ts / 1000.0) AT TIME ZONE 'Europe/Istanbul')
  WHERE y = 0;
CREATE INDEX IF NOT EXISTS manifests_wall ON manifests (y, mo, bottled, boxed);
CREATE INDEX IF NOT EXISTS manifests_ts ON manifests (ts);
-- Otomatik şans (app/lib/server/autoLuck.ts): sistemin gönderdiği şans
-- sayısı ve son gönderim anı. luck = auto_luck olması "bu manifest hiç
-- dışarıdan şans almadı" demektir; ilk gerçek şansta eşitlik bozulur ve
-- döngü kapanır
ALTER TABLE manifests ADD COLUMN IF NOT EXISTS auto_luck INT NOT NULL DEFAULT 0;
ALTER TABLE manifests ADD COLUMN IF NOT EXISTS auto_luck_at TIMESTAMPTZ;
-- y/mo her ekleme/ts değişiminde tetikleyiciyle dolar
CREATE OR REPLACE FUNCTION mw_set_ym() RETURNS trigger AS $$
BEGIN
  NEW.y := EXTRACT(YEAR FROM to_timestamp(NEW.ts / 1000.0) AT TIME ZONE 'Europe/Istanbul');
  NEW.mo := EXTRACT(MONTH FROM to_timestamp(NEW.ts / 1000.0) AT TIME ZONE 'Europe/Istanbul');
  RETURN NEW;
END $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS mw_manifests_ym ON manifests;
CREATE TRIGGER mw_manifests_ym BEFORE INSERT OR UPDATE OF ts ON manifests
  FOR EACH ROW EXECUTE FUNCTION mw_set_ym();

-- Admin hesapları: tek süper admin + onun oluşturduğu adminler.
-- Giriş her seferinde e-posta kodu ile iki adımlıdır
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  pass_hash TEXT NOT NULL,
  is_super BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS admins_email ON admins (LOWER(email));

CREATE TABLE IF NOT EXISTS admin_sessions (
  token TEXT PRIMARY KEY,
  admin_id INT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Şans/tebrik tekilliği: bir üye bir zarfa her tepkiden yalnızca bir kez
-- verebilir. Birincil anahtar ikinci isteği reddeder, sayaç şişirilemez.
-- (code'a yabancı anahtar konmaz: demo zarflar manifests'te yer almaz)
CREATE TABLE IF NOT EXISTS manifest_reactions (
  code TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (code, user_id, type)
);
CREATE INDEX IF NOT EXISTS manifest_reactions_user ON manifest_reactions (user_id);

CREATE TABLE IF NOT EXISTS verification_codes (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires BIGINT NOT NULL,
  attempts INT NOT NULL,
  last_sent BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS reset_tokens (
  email TEXT PRIMARY KEY,
  token TEXT NOT NULL,
  expires BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  manifest TEXT NOT NULL,
  reason TEXT NOT NULL,
  ts BIGINT NOT NULL,
  date_label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Sponsorlu zarf kampanyaları — admin panelin Reklam sekmesinden yönetilir.
-- Görünüm/mektup ayrıntıları config JSONB'de (revizyonlarda şema değişmesin)
CREATE TABLE IF NOT EXISTS sponsors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  start_ts BIGINT,
  end_ts BIGINT,
  freq INT NOT NULL DEFAULT 50,
  logo TEXT NOT NULL DEFAULT '',
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Kampanya metrikleri: zarf açılma / link tıklama / kod kopyalama sayaçları
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS views INT NOT NULL DEFAULT 0;
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS link_clicks INT NOT NULL DEFAULT 0;
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS coupon_clicks INT NOT NULL DEFAULT 0;

-- Bize Ulaşın formundan gelen mesajlar — admin panelde Bize Yazılanlar
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Saatlik yapay zeka denetimi: her koşu bir zaman penceresini tarar
CREATE TABLE IF NOT EXISTS moderation_runs (
  id SERIAL PRIMARY KEY,
  window_start BIGINT NOT NULL,
  window_end BIGINT NOT NULL,
  scanned INT NOT NULL DEFAULT 0,
  flagged INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ok',
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- kind: 'auto' (saatlik akış) | 'range' (admin'in tarih aralığı taraması).
-- Saatlik akışın kaldığı-yer filigranı yalnızca auto koşulara bakar; bu
-- yüzden pencere tekilliği de yalnızca auto koşullarda aranır.
ALTER TABLE moderation_runs ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'auto';
DROP INDEX IF EXISTS moderation_runs_window;
CREATE UNIQUE INDEX IF NOT EXISTS moderation_runs_window_auto
  ON moderation_runs (window_start) WHERE kind = 'auto';

CREATE TABLE IF NOT EXISTS moderation_flags (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence REAL,
  reason TEXT,
  excerpt TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Sonradan eklenen kolonlar (tablo eski kurulumlarda kolonsuz olabilir)
ALTER TABLE moderation_flags ADD COLUMN IF NOT EXISTS run_id INT;
ALTER TABLE moderation_flags ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
ALTER TABLE moderation_flags ADD COLUMN IF NOT EXISTS manifest TEXT NOT NULL DEFAULT '';
ALTER TABLE moderation_flags ADD COLUMN IF NOT EXISTS self_harm BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE moderation_flags ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ;
-- Bir manifest yaşamı boyunca en fazla bir kez işaretlenir
CREATE UNIQUE INDEX IF NOT EXISTS moderation_flags_code
  ON moderation_flags (code);
`;

// Test hesabı — localStorage demosundaki TEST_USER ile birebir aynı içerik
const SEED_MANIFESTS = [
  {
    code: "90184AK",
    name: "Deniz Y.",
    manifest:
      "2026 bitmeden kendi kahve dükkanımı açacağım. Küçük ama sıcacık, " +
      "mahallenin buluşma noktası olacak bir yer.",
    date: "12 Mart 2026",
    ts: 1773262800000,
    luck: 184,
    cheers: 0,
    views: 963,
    colorIdx: 0,
    sticker: null as string | null,
    special: null as number | null,
    realized: false,
    realizedDate: null as string | null,
  },
  {
    code: "90267MZ",
    name: "Maratoncu Deniz",
    manifest:
      "Bu yıl ilk maratonumu koşacağım. 42 kilometre, adım adım, vazgeçmeden.",
    date: "3 Nisan 2026",
    ts: 1775163600000,
    luck: 32,
    cheers: 0,
    views: 508,
    colorIdx: 4,
    sticker: null,
    special: null,
    realized: false,
    realizedDate: null,
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
    sticker: "✈️",
    special: null,
    realized: true,
    realizedDate: "9 Temmuz 2026",
  },
];

async function seed(p: Pool) {
  const { rows } = await p.query("SELECT 1 FROM users WHERE id = 'u-test'");
  if (rows.length > 0) return;
  // Test hesabı bilerek silindiyse yeniden tohumlanmaz
  const flag = await p.query(
    "SELECT 1 FROM settings WHERE key = 'testDeleted' AND value = 'true'::jsonb",
  );
  if (flag.rows.length > 0) return;
  const hash = await bcrypt.hash("Manifest123", 10);
  await p.query(
    `INSERT INTO users (id, name, email, pass_hash, provider, verified, created_label)
     VALUES ('u-test', 'Deniz Yılmaz', 'deniz@test.com', $1, 'email', TRUE, '12 Mart 2026')
     ON CONFLICT (id) DO NOTHING`,
    [hash],
  );
  for (const m of SEED_MANIFESTS) {
    await p.query(
      `INSERT INTO manifests (code, user_id, name, manifest, date_label, ts, luck,
         cheers, views, color_idx, sticker, special, bottled, boxed, realized, realized_label)
       VALUES ($1, 'u-test', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, FALSE, FALSE, $12, $13)
       ON CONFLICT (code) DO NOTHING`,
      [
        m.code, m.name, m.manifest, m.date, m.ts, m.luck, m.cheers, m.views,
        m.colorIdx, m.sticker, m.special, m.realized, m.realizedDate,
      ],
    );
  }
}

// İlk kurulumda eski duvardaki Petimemama zarfı örnek kampanya olarak
// tohumlanır; admin silerse bir daha gelmez (sponsorSeeded bayrağı)
async function seedSponsors(p: Pool) {
  const flag = await p.query(
    "SELECT 1 FROM settings WHERE key = 'sponsorSeeded'",
  );
  if (flag.rows.length > 0) return;
  await p.query(
    `INSERT INTO sponsors (name, active, freq, logo, config)
     VALUES ('Petimemama', TRUE, 50, '/petimemama.png', $1)`,
    [
      JSON.stringify({
        label: "Sponsorlu",
        labelBg: "#f97316",
        labelColor: "#ffffff",
        subText: "Sürpriz",
        subColor: "#f97316",
        bodyColor: "#ffffff",
        bodyColor2: "#f1e8ff",
        flapColor: "#7c4ad0",
        flapColor2: "#4a2385",
        gradient: "diagonal",
        gloss: true,
        letter:
          "Petimemama'dan manifest duvarına özel bir sürpriz! Bu zarfa denk " +
          "gelen şanslı ziyaretçilere minik dostlarının mamalarında geçerli " +
          "özel bir hediye kodu bırakıyoruz. Manifestlerine şans, patili " +
          "dostlarına afiyet olsun! 🐾",
        coupon: "PETI-SURPRIZ",
        linkUrl: "https://www.petimemama.com",
        linkLabel: "Petimemama'yı keşfet",
      }),
    ],
  );
  await setSetting(p, "sponsorSeeded", true);
}

// Süper admin her açılışta garanti edilir (silinmişse yeniden oluşur)
const SUPER_ADMIN_EMAIL = "webreta.digital@gmail.com";
async function seedAdmins(p: Pool) {
  const { rows } = await p.query(
    "SELECT 1 FROM admins WHERE LOWER(email) = $1",
    [SUPER_ADMIN_EMAIL],
  );
  if (rows.length > 0) return;
  const hash = await bcrypt.hash("Webreta.2331", 10);
  await p.query(
    "INSERT INTO admins (email, pass_hash, is_super) VALUES ($1, $2, TRUE)",
    [SUPER_ADMIN_EMAIL, hash],
  );
}

// Rumuzda emoji artık kabul edilmiyor (metinde serbest). Kural konmadan
// önce yazılmış rumuzlardaki emojiler tek seferlik temizlenir; ayar
// bayrağı sayesinde bir daha koşmaz. Postgres regex'i emoji sınıfını
// tanımadığı için ayıklama JS tarafında yapılır
async function stripNicknameEmoji(p: Pool) {
  if (await getSetting(p, "nickEmojiStripped", false)) return;
  const { rows } = await p.query("SELECT code, name FROM manifests");
  for (const r of rows as { code: string; name: string }[]) {
    const clean = cleanNickname(r.name);
    if (clean !== r.name)
      await p.query("UPDATE manifests SET name = $1 WHERE code = $2", [
        clean,
        r.code,
      ]);
  }
  await setSetting(p, "nickEmojiStripped", true);
}

// Şema + seed süreç başına bir kez koşar; tüm route'lar bunu bekler
export async function getDb(): Promise<Pool> {
  const p = pool();
  if (!g.mwInit) {
    g.mwInit = (async () => {
      await p.query(SCHEMA);
      await seed(p);
      await seedSponsors(p);
      await seedAdmins(p);
      await stripNicknameEmoji(p);
    })();
  }
  await g.mwInit;
  return p;
}

// ── Ortak yardımcılar ────────────────────────────────────────────────────

export function trDate(d: Date = new Date()): string {
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// DB satırı → client'ın MemberManifest biçimi
export type ManifestRow = {
  code: string;
  user_id: string;
  name: string;
  manifest: string;
  date_label: string;
  ts: string; // BIGINT string döner
  luck: number;
  cheers: number;
  views: number;
  color_idx: number;
  sticker: string | null;
  special: number | null;
  bottled: boolean;
  boxed: boolean;
  realized: boolean;
  realized_label: string | null;
};

export function toClientManifest(r: ManifestRow) {
  return {
    code: r.code,
    name: r.name,
    manifest: r.manifest,
    date: r.date_label,
    ts: Number(r.ts),
    luck: r.luck,
    cheers: r.cheers,
    views: r.views,
    colorIdx: r.color_idx,
    ...(r.sticker ? { sticker: r.sticker } : {}),
    ...(r.special !== null ? { special: r.special } : {}),
    ...(r.bottled ? { bottled: true } : {}),
    ...(r.boxed ? { boxed: true } : {}),
    realized: r.realized,
    ...(r.realized_label ? { realizedDate: r.realized_label } : {}),
  };
}

type UserRow = {
  id: string;
  name: string;
  email: string;
  provider: string;
  verified: boolean;
  created_label: string;
  created_at?: string | Date; // seçildiyse createdTs olarak döner
};

export function toClientUser(u: UserRow, manifests: ManifestRow[]) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    provider: u.provider as "email" | "google",
    verified: u.verified,
    createdAt: u.created_label,
    ...(u.created_at
      ? { createdTs: new Date(u.created_at).getTime() }
      : {}),
    manifests: manifests.map(toClientManifest),
  };
}

// ── Manifest kodu üretimi — 5 rakam + 2 harf ─────────────────────────────
// Duvardaki seed zarflarının rakam kısmı deterministiktir:
// 10000 + (i*48611)%90000, i∈[0,1000). Çakışmasın diye o rakamlar elenir;
// üye kodlarına karşı benzersizlik DB'den kontrol edilir.
const CODE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let seedDigits: Set<string> | null = null;
function seedDigitSet(): Set<string> {
  if (!seedDigits) {
    seedDigits = new Set();
    for (let i = 0; i < 1000; i++)
      seedDigits.add(String(10000 + ((i * 48611) % 90000)));
  }
  return seedDigits;
}

export async function generateCode(p: Pool): Promise<string> {
  for (;;) {
    const digits = String(10000 + Math.floor(Math.random() * 90000));
    if (seedDigitSet().has(digits)) continue;
    const code =
      digits +
      CODE_LETTERS[Math.floor(Math.random() * 26)] +
      CODE_LETTERS[Math.floor(Math.random() * 26)];
    const { rows } = await p.query("SELECT 1 FROM manifests WHERE code = $1", [
      code,
    ]);
    if (rows.length === 0) return code;
  }
}

// ── Ayarlar ──────────────────────────────────────────────────────────────

export async function getSetting<T>(p: Pool, key: string, fallback: T): Promise<T> {
  const { rows } = await p.query("SELECT value FROM settings WHERE key = $1", [
    key,
  ]);
  return rows.length > 0 ? (rows[0].value as T) : fallback;
}

export async function setSetting(p: Pool, key: string, value: unknown) {
  await p.query(
    `INSERT INTO settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2`,
    [key, JSON.stringify(value)],
  );
}

// Etkin yıl — admin Ayarlar'daki yıl simülasyonu doluysa onu, yoksa
// gerçek yılı döndürür. Yıllık manifest hakları ve panel/duvar varsayılan
// yılı bunu okur; simülasyon 2027 davranışını canlıya çıkmadan test ettirir.
// Gerçek yıl Türkiye saatine göre hesaplanır: sunucu UTC'de çalışsa da
// yeni yıl 1 Ocak 00:00 TR'de döner
export async function effectiveYear(p: Pool): Promise<number> {
  const y = Number(await getSetting(p, "simYear", 0));
  if (y >= 2020 && y <= 2100) return y;
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
    }).format(new Date()),
  );
}

// Etkin yıla damgalanmış zaman: gerçek yıl simüle edilenle aynıysa şimdi;
// değilse aynı ay/gün-saat, yılı değiştirilmiş hali
export function stampForYear(y: number): number {
  const now = new Date();
  if (now.getFullYear() === y) return now.getTime();
  const d = new Date(now);
  d.setFullYear(y);
  return d.getTime();
}

export type MailSettings = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  googleClientId: string;
};

export const EMPTY_MAIL: MailSettings = {
  host: "",
  port: 587,
  secure: false,
  user: "",
  pass: "",
  fromName: "Manifest Duvarı",
  fromEmail: "",
  googleClientId: "",
};

export async function getMailSettings(p: Pool): Promise<MailSettings> {
  return { ...EMPTY_MAIL, ...(await getSetting(p, "mail", {})) };
}

// Moderasyon AI anahtarı — admin panelden (Ayarlar) girilir; panelde boşsa
// ANTHROPIC_API_KEY ortam değişkenine düşer
export async function getAiKey(p: Pool): Promise<string> {
  const v = await getSetting<string>(p, "aiKey", "");
  return (
    (typeof v === "string" ? v.trim() : "") ||
    process.env.ANTHROPIC_API_KEY ||
    ""
  );
}
