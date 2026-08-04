// ── Sunucu veri katmanı — Postgres bağlantısı + şema + seed ─────────────
// Tüm API route'ları buradaki getDb() üzerinden konuşur. Şema idempotent
// kurulur (CREATE TABLE IF NOT EXISTS); ilk açılışta test hesabı tohumlanır.
// DATABASE_URL: lokalde docker-compose'daki Postgres, canlıda EasyPanel.

import { Pool } from "pg";
import bcrypt from "bcryptjs";

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

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

-- Saatlik yapay zeka denetimi için hazır tablo (akış sonra bağlanacak)
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

// Şema + seed süreç başına bir kez koşar; tüm route'lar bunu bekler
export async function getDb(): Promise<Pool> {
  const p = pool();
  if (!g.mwInit) {
    g.mwInit = (async () => {
      await p.query(SCHEMA);
      await seed(p);
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
};

export function toClientUser(u: UserRow, manifests: ManifestRow[]) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    provider: u.provider as "email" | "google",
    verified: u.verified,
    createdAt: u.created_label,
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
