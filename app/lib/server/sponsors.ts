// ── Sponsorlu zarflar — kampanyalar + duvara serpiştirme matematiği ─────
// Aktif kampanyaların zarfları gerçek zarfların ARASINA eklenir (yerine
// geçmez): kampanya sıklığı N ise her N gerçek zarfa bir sponsor düşer.
// Konumlar günlük tohumla deterministiktir; dilim istekleri arasında
// tutarlı kalır. Görüntü uzayı = gerçek sıralar + araya giren sponsorlar;
// meta/plain, dilim aralıkları ve find rank'i hep görüntü uzayındadır.

import type { Pool } from "pg";
import type { MemberManifest } from "../auth";
import type { SponsorGradient, SponsorPub } from "../wallData";

export type SponsorRow = {
  id: number;
  name: string;
  active: boolean;
  start_ts: string | null; // BIGINT string döner
  end_ts: string | null;
  freq: number;
  logo: string;
  config: Record<string, unknown>;
};

// Admin panelin okuduğu/yazdığı tam kampanya biçimi
export type SponsorCampaign = SponsorPub & {
  active: boolean;
  startTs: number | null;
  endTs: number | null;
  freq: number;
  rawLogo: string; // data URL ya da statik yol (düzenleyici için)
};

const DEFAULT_CONFIG = {
  label: "Sponsorlu",
  labelBg: "#f97316",
  labelColor: "#ffffff",
  subText: "",
  subColor: "#5b2d9c",
  bodyColor: "#ffffff",
  bodyColor2: "",
  flapColor: "#5b2d9c",
  flapColor2: "",
  gradient: "diagonal" as SponsorGradient,
  gloss: true,
  letter: "",
  coupon: "",
  linkUrl: "",
  linkLabel: "",
};

// Logo data URL ise küçük uçtan servis edilir; statik yol ise aynen kalır
function logoSrc(r: SponsorRow): string {
  return r.logo.startsWith("data:") ? `/api/sponsors/${r.id}/logo` : r.logo;
}

export function toSponsorPub(r: SponsorRow): SponsorPub {
  const c = { ...DEFAULT_CONFIG, ...r.config };
  return {
    id: r.id,
    brand: r.name,
    label: String(c.label),
    labelBg: String(c.labelBg),
    labelColor: String(c.labelColor),
    subText: String(c.subText),
    subColor: String(c.subColor),
    bodyColor: String(c.bodyColor),
    bodyColor2: String(c.bodyColor2),
    flapColor: String(c.flapColor),
    flapColor2: String(c.flapColor2),
    gradient: c.gradient as SponsorGradient,
    gloss: !!c.gloss,
    letter: String(c.letter),
    coupon: String(c.coupon),
    linkUrl: String(c.linkUrl),
    linkLabel: String(c.linkLabel),
    logo: logoSrc(r),
  };
}

export function toSponsorCampaign(r: SponsorRow): SponsorCampaign {
  return {
    ...toSponsorPub(r),
    active: r.active,
    startTs: r.start_ts === null ? null : Number(r.start_ts),
    endTs: r.end_ts === null ? null : Number(r.end_ts),
    freq: r.freq,
    rawLogo: r.logo,
  };
}

// Admin gövdesi → doğrulanmış kolon + config ayrımı. Renk/metin alanları
// admin girdisidir; yalnızca uzunluk ve tip sınırı uygulanır.
export function parseSponsorBody(body: Record<string, unknown>) {
  const str = (v: unknown, max: number) =>
    typeof v === "string" ? v.slice(0, max) : "";
  const name = str(body.brand ?? body.name, 60).trim();
  if (!name) return { error: "Marka adı gerekli." } as const;
  const freq = Math.floor(Number(body.freq));
  if (!Number.isFinite(freq) || freq < 2 || freq > 100000)
    return { error: "Sıklık 2 ile 100000 arasında olmalı." } as const;
  const logo = str(body.rawLogo, 700_000); // ~500KB görsel + base64 payı
  const gradient = ["linear", "diagonal", "radial"].includes(
    body.gradient as string,
  )
    ? (body.gradient as SponsorGradient)
    : "diagonal";
  const startTs = Number(body.startTs);
  const endTs = Number(body.endTs);
  return {
    name,
    active: !!body.active,
    startTs: Number.isFinite(startTs) && startTs > 0 ? startTs : null,
    endTs: Number.isFinite(endTs) && endTs > 0 ? endTs : null,
    freq,
    logo,
    config: {
      label: str(body.label, 24) || "Sponsorlu",
      labelBg: str(body.labelBg, 32) || "#f97316",
      labelColor: str(body.labelColor, 32) || "#ffffff",
      subText: str(body.subText, 40),
      subColor: str(body.subColor, 32) || "#5b2d9c",
      bodyColor: str(body.bodyColor, 32) || "#ffffff",
      bodyColor2: str(body.bodyColor2, 32),
      flapColor: str(body.flapColor, 32) || "#5b2d9c",
      flapColor2: str(body.flapColor2, 32),
      gradient,
      gloss: !!body.gloss,
      letter: str(body.letter, 2000),
      coupon: str(body.coupon, 60),
      linkUrl: str(body.linkUrl, 300),
      linkLabel: str(body.linkLabel, 60),
    },
  };
}

// Şu an yayında olan kampanyalar (aktif + tarih penceresi içinde)
export async function activeSponsors(db: Pool): Promise<SponsorRow[]> {
  const now = Date.now();
  const { rows } = await db.query(
    `SELECT * FROM sponsors
     WHERE active
       AND (start_ts IS NULL OR start_ts <= $1)
       AND (end_ts IS NULL OR end_ts >= $1)
     ORDER BY id`,
    [now],
  );
  return rows as SponsorRow[];
}

// Deterministik küçük hash — konum serpmesi için (md5 gerekmez)
function h32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Bir sponsor örneği: gerçek sıra `before`'dan hemen önce araya girer.
// slot: görüntü uzayındaki nihai konum (before + kendinden önceki örnekler)
export type SponsorSlot = {
  slot: number;
  before: number;
  row: SponsorRow;
  k: number; // kampanya içi örnek numarası
};

// Aktif kampanyaların tüm örnekleri, görüntü konumuna göre sıralı.
// plain: filtreye uyan gerçek (düz) zarf sayısı
export function sponsorSlots(
  rows: SponsorRow[],
  plain: number,
  seed: string,
): SponsorSlot[] {
  if (plain <= 0 || rows.length === 0) return [];
  const raw: { before: number; row: SponsorRow; k: number }[] = [];
  for (const row of rows) {
    const freq = Math.max(2, row.freq);
    const count = plain >= freq ? Math.floor(plain / freq) : 1;
    for (let k = 0; k < count; k++) {
      const jitter = h32(`${seed}:${row.id}:${k}`) % freq;
      raw.push({ before: Math.min(plain, k * freq + jitter), row, k });
    }
  }
  raw.sort((a, b) => a.before - b.before || a.row.id - b.row.id || a.k - b.k);
  return raw.map((r, i) => ({ ...r, slot: r.before + i }));
}

// Gerçek sıra → görüntü sırası (find rank'i için)
export function toDisplayRank(rank: number, slots: SponsorSlot[]): number {
  let n = 0;
  for (const s of slots) {
    if (s.before <= rank) n++;
    else break;
  }
  return rank + n;
}

// Sponsor örneği → dilim öğesi (MemberManifest biçiminde sahte kayıt)
export function sponsorItem(s: SponsorSlot): MemberManifest {
  const pub = toSponsorPub(s.row);
  return {
    code: `SP${s.row.id}-${s.k}`,
    name: pub.subText || pub.brand,
    manifest: pub.letter,
    date: "",
    ts: 0,
    luck: 0,
    cheers: 0,
    views: 0,
    colorIdx: 0,
    realized: false,
    sponsored: true,
    sponsor: pub,
  };
}
