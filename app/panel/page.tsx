"use client";

// ── Üye Paneli ───────────────────────────────────────────────────────────
// Profil özeti + istatistikler + "Manifestlerim" listesi + hesap ayarları.
// Yeni manifest yazma (manifest başına ayrı isim/rumuz), "gerçekleşti"
// işaretleme, manifest silme ve hesap silme buradan yapılır (demo:
// veriler localStorage'da; canlıda backend'e bağlanacak).

import { useEffect, useRef, useState } from "react";
import SiteHeader from "../components/SiteHeader";
import CopyBtn from "../components/CopyBtn";
import {
  BottleVisual,
  GiftBoxVisual,
  MiniEnvelope,
  PREVIEW_PASTEL,
  PREVIEW_SPECIAL,
  RIBBON_GRADS,
  SPECIAL_COLORS,
  STICKERS,
} from "../components/RewardVisuals";
import {
  PANEL_COLORS,
  currentUser,
  deleteAccount as apiDeleteAccount,
  logout as apiLogout,
  newManifestCode,
  passwordIssue,
  saveMyManifests,
  updateAccount,
  type MemberManifest,
  type User,
} from "../lib/auth";
import { fetchSettings } from "../lib/api";

const inputCls =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm " +
  "text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 " +
  "focus:border-amber-400 focus:ring-2 focus:ring-amber-100";

// ── Ödül adımı sıralaması — sticker → özel renk → şişe → kutu ────────────
// Üye hakları hangi sırada kazandıysa o sırada kullanmalı; sıradaki adım
// tamamlanmadan sonraki adımın popup'ı açılmaz
type RewardStep = "sticker" | "special" | "bottle" | "box";
const STEP_ORDER: RewardStep[] = ["sticker", "special", "bottle", "box"];

// Manifestin tamamlanmamış en erken ödül adımı (hak kazanılmışsa)
function firstPendingStep(m: MemberManifest): RewardStep | null {
  if (m.luck >= 20 && !m.sticker) return "sticker";
  if (m.luck >= 50 && m.special == null) return "special";
  if (m.luck >= 150 && !m.bottled && !m.boxed) return "bottle";
  if (m.luck >= 250 && !m.boxed) return "box";
  return null;
}

// Manifest metni düz metindir: emoji/ikon karakterleri yazarken ayıklanır
function stripEmoji(s: string): string {
  return s.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, "");
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

// Başarım etapları — duvardaki şans barajlarıyla birebir aynı
// (20+ sticker, 50+ özel renk, 150+ şişe, 250+ hediye kutusu)
const STAGES = [
  {
    title: "Sticker Yapıştırma",
    threshold: 20,
    desc: "20 şansa ulaşınca zarfının kapağına manifest türüne uygun bir süs sticker'ı yapıştırabilirsin.",
  },
  {
    title: "Özel Renk",
    threshold: 50,
    desc: "50 şansa ulaşınca zarfın için duvarda kendini belli eden parlak özel seri renklerden birini seçebilirsin.",
  },
  {
    title: "Şişedeki Not",
    threshold: 150,
    desc: "150 şansa ulaşınca manifestini zarftan çıkarıp duvarda cam şişenin içine koyabilirsin.",
  },
  {
    title: "Hediye Kutusu",
    threshold: 250,
    desc: "250 şansa ulaşınca manifestini duvardaki kurdeleli hediye kutusuna koyabilirsin.",
  },
];

// ── Paylaşım görseli — Instagram tarzı 1080×1350 kart, canvas ile çizilir ──
// Zarf açık ya da kapalı seçilebilir; zarf kodu görselin altında pill içinde

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Kelime bazlı satır sarma — canvas'ta metin genişliğine göre böler
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Yeşil "GERÇEKLEŞTİ" pill'i — kapalı zarfta kapağa, açıkta ön cebe çizilir
function drawRealizedPill(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  date?: string,
) {
  ctx.font = "700 30px Arial";
  const tw = ctx.measureText("GERÇEKLEŞTİ").width;
  const pw = tw + 76;
  roundRect(ctx, cx - pw / 2, cy - 33, pw, 66, 33);
  ctx.fillStyle = "#10b981";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GERÇEKLEŞTİ", cx, cy + 2);
  if (date) {
    ctx.font = "600 26px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillText(date, cx, cy + 62);
  }
  ctx.textBaseline = "alphabetic";
}

// Şişe — duvardaki BottleVisual'ın canvas kopyası (aynı SVG path'leri).
// noteOut: açık sahne — rulo not dışarıda, mantar fırlamış
function drawBottle(
  ctx: CanvasRenderingContext2D,
  m: MemberManifest,
  hand: string,
  opts?: {
    cx?: number;
    cy?: number;
    s?: number;
    rot?: number;
    noteOut?: boolean;
  },
) {
  // Varsayılan: kapalı sahnenin dik şişesi (viewBox 200×520 → ~310×806)
  const { cx = 540, cy = 665, s = 1.55, rot = 0, noteOut = false } =
    opts ?? {};
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.translate(-100, -260);

  const glass = new Path2D(
    "M82 60 L82 140 C82 162 58 172 50 192 C42 210 40 222 40 242 L40 458 C40 492 62 502 100 502 C138 502 160 492 160 458 L160 242 C160 222 158 210 150 192 C142 172 118 162 118 140 L118 60 Z",
  );
  const gGrad = ctx.createLinearGradient(40, 0, 160, 0);
  gGrad.addColorStop(0, "#bfe4ee");
  gGrad.addColorStop(0.45, "#8ec7d8");
  gGrad.addColorStop(0.7, "#a9d8e5");
  gGrad.addColorStop(1, "#7db8cb");
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = gGrad;
  ctx.fill(glass);
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = "#5d98ab";
  ctx.lineWidth = 3;
  ctx.stroke(glass);
  ctx.globalAlpha = 1;

  // Rulo not — hafif eğik (açık sahnede not dışarıda, şişe boş)
  if (!noteOut) {
    ctx.save();
    ctx.translate(100, 335);
    ctx.rotate((-11 * Math.PI) / 180);
    ctx.translate(-100, -335);
    roundRect(ctx, 77, 196, 46, 274, 21);
    ctx.fillStyle = "#f3e6be";
    ctx.fill();
    ctx.strokeStyle = "#cdb583";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(100, 198, 23, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#f2e4ba";
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(100, 198, 12, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#e4d09e";
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(100, 468, 21, 6.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#d8c290";
    ctx.fill();
    ctx.restore();
  }

  // Cam parlamaları
  ctx.globalAlpha = 0.45;
  roundRect(ctx, 52, 215, 13, 240, 6.5);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.globalAlpha = 0.5;
  roundRect(ctx, 86, 70, 8, 70, 4);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Şişe ağzı + mantar
  ctx.beginPath();
  ctx.ellipse(100, 60, 20, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#cfeaf2";
  ctx.fill();
  ctx.strokeStyle = "rgba(93,152,171,0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();
  // Mantar — açık sahnede fırlamış: ağzın ilerisinde havada, eğik
  ctx.save();
  if (noteOut) {
    ctx.translate(148, -52);
    ctx.rotate((38 * Math.PI) / 180);
    ctx.translate(-100, -40);
  }
  const cork = ctx.createLinearGradient(0, 16, 0, 64);
  cork.addColorStop(0, "#c99a66");
  cork.addColorStop(1, "#8a5a2f");
  roundRect(ctx, 80, 16, 40, 48, 9);
  ctx.fillStyle = cork;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(100, 18, 19, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#a97b47";
  ctx.fill();
  ctx.restore();

  // Kurdele — üyenin özel rengi (yoksa siyah)
  const rg = RIBBON_GRADS[(m.special ?? 0) % RIBBON_GRADS.length];
  const rGrad = ctx.createLinearGradient(54, 98, 146, 150);
  rGrad.addColorStop(0, rg[0]);
  rGrad.addColorStop(0.55, rg[1]);
  rGrad.addColorStop(1, rg[2]);
  ctx.fillStyle = rGrad;
  roundRect(ctx, 76, 118, 48, 16, 5);
  ctx.fill();
  ctx.fill(new Path2D("M93 130 L70 172 L79 164 L86 174 L104 136 Z"));
  ctx.fill(new Path2D("M107 130 L130 172 L121 164 L114 174 L96 136 Z"));
  ctx.fill(
    new Path2D("M100 126 C80 98 46 104 54 128 C60 150 88 144 100 126 Z"),
  );
  ctx.fill(
    new Path2D("M100 126 C120 98 154 104 146 128 C140 150 112 144 100 126 Z"),
  );
  roundRect(ctx, 91, 117, 18, 17, 5);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Sticker — cama yapıştırılmış
  if (m.sticker) {
    ctx.save();
    ctx.translate(60, 240);
    ctx.rotate((-14 * Math.PI) / 180);
    ctx.font = "44px 'Segoe UI Emoji', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(m.sticker, 0, 0);
    ctx.restore();
  }

  // Kağıt etiket bandı — ⭐ şans + rumuz
  roundRect(ctx, 39, 268, 122, 64, 3);
  ctx.fillStyle = "#f5ecd4";
  ctx.fill();
  ctx.strokeStyle = "#dcc7a0";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(39, 268);
  ctx.lineTo(161, 268);
  ctx.moveTo(39, 332);
  ctx.lineTo(161, 332);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = "11px 'Segoe UI Emoji', serif";
  ctx.fillText("⭐", 100, 284);
  ctx.font = "700 13px Arial";
  ctx.fillStyle = "#8a6d33";
  ctx.fillText(m.luck.toLocaleString("tr-TR"), 100, 301);
  ctx.font = `600 19px ${hand}`;
  ctx.fillStyle = "#6b5426";
  ctx.fillText(m.name, 100, 324);

  // Gerçekleşti bandı — etiketin altında yeşil şerit
  if (m.realized) {
    const eGrad = ctx.createLinearGradient(39, 374, 161, 396);
    eGrad.addColorStop(0, "#34d399");
    eGrad.addColorStop(1, "#059669");
    roundRect(ctx, 39, 374, 122, 22, 3);
    ctx.fillStyle = eGrad;
    ctx.fill();
    ctx.font = "700 11px Arial";
    ctx.fillStyle = "#ffffff";
    try {
      ctx.letterSpacing = "1px";
    } catch {}
    ctx.fillText("GERÇEKLEŞTİ", 100, 389);
    try {
      ctx.letterSpacing = "0px";
    } catch {}
  }
  ctx.restore();
}

// Hediye kutusu — duvardaki GiftBoxVisual'ın canvas kopyası
function drawGiftBox(
  ctx: CanvasRenderingContext2D,
  m: MemberManifest,
  hand: string,
  opts?: {
    x?: number;
    y?: number;
    w?: number;
    depth?: boolean; // kapak tek başına çizilirken kalınlık kutuda kalır
    glow?: boolean;
    rot?: number; // savrulmuş kapak açısı
  },
) {
  const w = opts?.w ?? 460;
  const h = w * 1.32;
  const x = opts?.x ?? 540 - w / 2;
  const y = opts?.y ?? 330;
  const u = w / 150;
  const { depth = true, glow = true, rot = 0 } = opts ?? {};

  ctx.save();
  if (rot) {
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(rot);
    ctx.translate(-x - w / 2, -y - h / 2);
  }

  // Kapak arasından sızan amber ışık — yumuşak hare
  if (glow) {
    const halo = ctx.createRadialGradient(
      x + w / 2,
      y + h / 2,
      40,
      x + w / 2,
      y + h / 2,
      w * 0.85,
    );
    halo.addColorStop(0, "rgba(255,178,56,0.4)");
    halo.addColorStop(1, "rgba(255,178,56,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(x - 160, y - 160, w + 320, h + 320);
  }

  // Karton kalınlığı — sağ/alt taşma
  if (depth) {
    roundRect(ctx, x + 8 * u, y + 8 * u, w, h, 5 * u);
    ctx.fillStyle = "#8a6f49";
    ctx.fill();
  }

  // Gövde — kraft ambalaj
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 18 * u;
  ctx.shadowOffsetX = 6 * u;
  ctx.shadowOffsetY = 9 * u;
  roundRect(ctx, x, y, w, h, 5 * u);
  const kraft = ctx.createLinearGradient(x, y, x + w, y + h);
  kraft.addColorStop(0, "#dcc194");
  kraft.addColorStop(0.7, "#c6a575");
  kraft.addColorStop(1, "#b8955f");
  ctx.fillStyle = kraft;
  ctx.fill();
  ctx.restore();

  // Kurdeleler + ışık — gövdeye kırpılı
  ctx.save();
  roundRect(ctx, x, y, w, h, 5 * u);
  ctx.clip();
  const bordo = ctx.createLinearGradient(x, y, x + w, y + h);
  bordo.addColorStop(0, "#9e2439");
  bordo.addColorStop(0.55, "#5c0f1d");
  bordo.addColorStop(1, "#7b1526");
  ctx.fillStyle = bordo;
  ctx.fillRect(x + 0.38 * w - 8.5 * u, y, 17 * u, h);
  ctx.fillRect(x, y + 0.26 * h, w, 17 * u);
  const sheen = ctx.createLinearGradient(x, y, x + w * 0.9, y + h * 0.55);
  sheen.addColorStop(0, "rgba(255,255,255,0.22)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  // Fiyonk — kurdele kesişiminde
  ctx.save();
  const bu = 0.92 * u;
  ctx.translate(x + 0.38 * w - 50 * bu, y + 0.26 * h - 0.44 * 90 * bu);
  ctx.scale(bu, bu);
  const bowGrad = ctx.createLinearGradient(0, 0, 100, 90);
  bowGrad.addColorStop(0, "#9e2439");
  bowGrad.addColorStop(0.55, "#5c0f1d");
  bowGrad.addColorStop(1, "#7b1526");
  ctx.fillStyle = bowGrad;
  ctx.fill(
    new Path2D("M50 46 C40 60 28 68 18 82 L30 78 C38 66 46 58 50 46 Z"),
  );
  ctx.fill(new Path2D("M50 46 C58 58 70 64 80 74 L70 60 C62 54 54 50 50 46 Z"));
  ctx.fill(new Path2D("M52 44 C50 28 56 16 50 4 C64 12 60 30 58 44 Z"));
  ctx.fill(new Path2D("M50 46 C26 16 4 26 10 44 C15 58 36 56 50 46 Z"));
  ctx.fill(new Path2D("M50 46 C70 14 94 22 90 40 C86 55 64 54 50 46 Z"));
  ctx.beginPath();
  ctx.arc(50, 45, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Sticker — sol alt boş alanda
  if (m.sticker) {
    ctx.save();
    ctx.translate(x + 0.19 * w, y + 0.64 * h);
    ctx.rotate((-10 * Math.PI) / 180);
    ctx.font = `${26 * u}px 'Segoe UI Emoji', serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(m.sticker, 0, 0);
    ctx.restore();
  }

  // Gerçekleşti pill'i — sol alt bölgede hafif eğik
  if (m.realized) {
    ctx.save();
    ctx.translate(x + 0.3 * w, y + 0.82 * h);
    ctx.rotate((-5 * Math.PI) / 180);
    ctx.font = `700 ${9 * u}px Arial`;
    const tw = ctx.measureText("GERÇEKLEŞTİ").width;
    roundRect(
      ctx,
      -tw / 2 - 8 * u,
      -7 * u,
      tw + 16 * u,
      14 * u,
      7 * u,
    );
    ctx.fillStyle = "#10b981";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GERÇEKLEŞTİ", 0, 1);
    ctx.restore();
  }

  // Kağıt etiket — sağ kenarda dikine (-90°): ⭐ şans (+👏 tebrik) + rumuz
  ctx.save();
  ctx.translate(x + w - 30 * u, y + h - 62 * u);
  ctx.rotate((-90 * Math.PI) / 180);
  roundRect(ctx, -58 * u, -22 * u, 116 * u, 44 * u, 3);
  ctx.fillStyle = "#f5ecd4";
  ctx.fill();
  ctx.strokeStyle = "#dcc7a0";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-58 * u, -22 * u);
  ctx.lineTo(58 * u, -22 * u);
  ctx.moveTo(-58 * u, 22 * u);
  ctx.lineTo(58 * u, 22 * u);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const col = m.realized ? 14 * u : 0;
  ctx.font = `${9 * u}px 'Segoe UI Emoji', serif`;
  ctx.fillText("⭐", -col, -8 * u);
  if (m.realized) ctx.fillText("👏", col, -8 * u);
  ctx.font = `700 ${10 * u}px Arial`;
  ctx.fillStyle = "#8a6d33";
  ctx.fillText(m.luck.toLocaleString("tr-TR"), -col, 3 * u);
  if (m.realized) ctx.fillText(m.cheers.toLocaleString("tr-TR"), col, 3 * u);
  ctx.font = `600 ${15 * u}px ${hand}`;
  ctx.fillStyle = "#6b5426";
  ctx.fillText(m.name, 0, 17 * u);
  ctx.restore();
  ctx.restore(); // dış dönüş (rot) katmanı
}

// Mektup kağıdı — açık şişe/kutu sahnelerinde manifest metnini taşır
// (şans sayısı çizilmez; şişe bandı ve kutu etiketi zaten gösteriyor)
function drawLetter(
  ctx: CanvasRenderingContext2D,
  m: MemberManifest,
  hand: string,
  x: number,
  y: number,
  w: number,
  h: number,
  showSticker = true,
) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fillStyle = "#fffdf5";
  ctx.fill();
  ctx.restore();
  // Rumuz + kod
  ctx.textAlign = "left";
  ctx.fillStyle = "#2f2c28";
  ctx.font = `700 60px ${hand}`;
  ctx.fillText(m.name, x + 50, y + 92);
  ctx.textAlign = "right";
  ctx.font = "700 26px 'Courier New', monospace";
  ctx.fillStyle = "#a8a294";
  ctx.fillText(m.code, x + w - 50, y + 88);
  // Manifest metni — sarılır, kağıda sığmayan kısım … ile kesilir
  ctx.textAlign = "left";
  ctx.font = "400 31px 'Segoe UI', Arial";
  ctx.fillStyle = "#4b473f";
  const lines = wrapText(ctx, m.manifest, w - 100);
  const maxLines = Math.floor((h - 204) / 48);
  lines.slice(0, maxLines).forEach((ln, i) => {
    const last = i === maxLines - 1 && lines.length > maxLines;
    ctx.fillText(last ? `${ln}…` : ln, x + 50, y + 164 + i * 48);
  });
  // Sticker — normalde durduğu köşede: kağıdın sağ altında, hafif eğik
  if (m.sticker && showSticker) {
    ctx.save();
    ctx.translate(x + w - 78, y + h - 72);
    ctx.rotate((-10 * Math.PI) / 180);
    ctx.font = "64px 'Segoe UI Emoji', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(m.sticker, 0, 0);
    ctx.restore();
    ctx.textBaseline = "alphabetic";
  }
}

// Site logosu paylaşım kartının başlığına çizilir (bir kez yüklenir)
let logoImg: Promise<HTMLImageElement> | null = null;
function loadLogo(): Promise<HTMLImageElement> {
  if (!logoImg) {
    logoImg = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = "/logo.png";
    });
  }
  return logoImg;
}

async function drawShareImage(
  canvas: HTMLCanvasElement,
  m: MemberManifest,
  mode: "closed" | "open",
) {
  const W = 1080;
  const H = 1350;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const c = m.special != null
    ? SPECIAL_COLORS[m.special % SPECIAL_COLORS.length].color
    : PANEL_COLORS[m.colorIdx % PANEL_COLORS.length];
  const hand =
    getComputedStyle(document.body).getPropertyValue("--font-caveat").trim() ||
    "cursive";
  try {
    await document.fonts.ready;
  } catch {}

  // Zemin — krem, üstüne zarf renginin hafif pastel tonu
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#fdfbf6");
  bg.addColorStop(1, "#f2ede2");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = c.base;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  // Köşelere serpilmiş yıldızlar
  const sparks: [number, number, string, number][] = [
    [92, 190, "✨", 42],
    [986, 168, "⭐", 34],
    [116, 1116, "⭐", 34],
    [948, 1130, "✨", 44],
    [66, 660, "💫", 34],
    [1004, 700, "✨", 28],
  ];
  ctx.globalAlpha = 0.55;
  ctx.textAlign = "center";
  for (const [x, y, e, s] of sparks) {
    ctx.font = `${s}px 'Segoe UI Emoji', serif`;
    ctx.fillText(e, x, y);
  }
  ctx.globalAlpha = 1;

  // Başlık — site logosu + site adresi (ss102)
  try {
    const logo = await loadLogo();
    const lh = 150;
    const lw = (logo.width / logo.height) * lh;
    ctx.drawImage(logo, W / 2 - lw / 2, 42, lw, lh);
  } catch {
    // Logo yüklenemezse yazıya düşülür
    ctx.fillStyle = "#3d3a34";
    ctx.font = `700 86px ${hand}`;
    ctx.fillText("Manifest Duvarı", W / 2, 150);
  }
  // Site adresi — düz font, siyah (el yazısı değil)
  ctx.font = "700 44px Arial";
  ctx.fillStyle = "#171717";
  ctx.fillText("manifestduvari.com", W / 2, 250);

  const ex = 180;
  const ew = 720;

  if (mode === "closed" && m.boxed) {
    // ── Hediye kutusu — manifest kutuda sergileniyor ──
    drawGiftBox(ctx, m, hand);
  } else if (mode === "closed" && m.bottled) {
    // ── Şişe — manifest şişede sergileniyor ──
    drawBottle(ctx, m, hand);
  } else if (mode === "closed") {
    // ── Kapalı zarf ──
    const ey = 330;
    const eh = 520;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur = 44;
    ctx.shadowOffsetY = 26;
    roundRect(ctx, ex, ey, ew, eh, 16);
    ctx.fillStyle = c.base;
    ctx.fill();
    ctx.restore();
    // Kapak — üstten aşağı bakan üçgen
    ctx.beginPath();
    ctx.moveTo(ex + 2, ey + 2);
    ctx.lineTo(ex + ew - 2, ey + 2);
    ctx.lineTo(ex + ew / 2, ey + eh * 0.56);
    ctx.closePath();
    ctx.fillStyle = c.dark;
    ctx.fill();
    // Sticker — duvardaki slotunda: sol/sağ (%24/%76), kapak hizasında,
    // hafif dönük. Slot koddan türetilir ki her açılışta aynı yanda dursun
    if (m.sticker) {
      const slot = m.code.charCodeAt(0) % 2 ? 0.76 : 0.24;
      ctx.save();
      ctx.translate(ex + ew * slot, ey + eh * 0.56 - 52);
      ctx.rotate(((slot === 0.24 ? -12 : 10) * Math.PI) / 180);
      ctx.font = "104px 'Segoe UI Emoji', serif";
      ctx.textBaseline = "middle";
      ctx.fillText(m.sticker, 0, 0);
      ctx.restore();
      ctx.textBaseline = "alphabetic";
    }
    // Gerçekleşti — kapağın üst bölgesinde
    if (m.realized) drawRealizedPill(ctx, ex + ew / 2, ey + 120, m.realizedDate);
    // Rumuz — zarf ön yüzünde el yazısı
    ctx.fillStyle = c.ink;
    ctx.font = `700 72px ${hand}`;
    ctx.fillText(m.name, ex + ew / 2, ey + eh * 0.86);
    // Şans — zarfın altında
    ctx.font = "600 32px Arial";
    ctx.fillStyle = "#6f6a5e";
    ctx.fillText(
      `⭐ ${m.luck.toLocaleString("tr-TR")} kişi şans diledi`,
      W / 2,
      ey + eh + 92,
    );
  } else if (m.boxed) {
    // ── Açık kutu — kağıt ortada ve önde; üst kapak sol kenardan,
    // açık gövde sağ alt köşeden kağıdın altından eğik taşar ──
    const bw = 300;
    const bh = bw * 1.32; // ~396
    const bx = 660;
    const byy = 640;
    const bu = bw / 150;
    const bcx = bx + bw / 2;
    const bcy = byy + bh / 2;
    // Altın hale — kağıdın çevresinde
    const halo = ctx.createRadialGradient(540, 660, 40, 540, 660, 420);
    halo.addColorStop(0, "rgba(255,233,168,0.8)");
    halo.addColorStop(0.55, "rgba(255,215,106,0.3)");
    halo.addColorStop(1, "rgba(255,215,106,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(120, 240, 840, 840);
    // Gövde — kağıdın altında sağa yatık; sağ alt köşeden görünür
    ctx.save();
    ctx.translate(bcx, bcy);
    ctx.rotate((18 * Math.PI) / 180);
    ctx.translate(-bcx, -bcy);
    roundRect(ctx, bx + 8 * bu, byy + 8 * bu, bw, bh, 5 * bu);
    ctx.fillStyle = "#8a6f49";
    ctx.fill();
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 50;
    ctx.shadowOffsetY = 18;
    roundRect(ctx, bx, byy, bw, bh, 5 * bu);
    ctx.fillStyle = "#a98b5c";
    ctx.fill();
    ctx.restore();
    // Kutunun içi — sade karanlık zemin (parlama efekti yok)
    roundRect(ctx, bx + 13 * bu, byy + 13 * bu, bw - 26 * bu, bh - 26 * bu, 12);
    ctx.fillStyle = "#4a3a22";
    ctx.fill();
    ctx.restore();
    // Mektup — gövde kağıdın altından taşar; sticker kapakta zaten var
    drawLetter(ctx, m, hand, 230, 340, 620, 640, false);
    // Kapak — kağıdın üstüne biner, sola yatık; önde olduğu için büyük
    drawGiftBox(ctx, m, hand, {
      w: 350,
      x: 85,
      y: 570,
      depth: false,
      glow: false,
      rot: (-25 * Math.PI) / 180,
    });
    // Kutudan yükselen ışıltılar
    ctx.textAlign = "center";
    ctx.globalAlpha = 0.9;
    ctx.font = "34px 'Segoe UI Emoji', serif";
    ctx.fillText("✨", 262, 300);
    ctx.font = "28px 'Segoe UI Emoji', serif";
    ctx.fillText("⭐", 920, 440);
    ctx.font = "26px 'Segoe UI Emoji', serif";
    ctx.fillText("✦", 870, 320);
    ctx.globalAlpha = 1;
  } else if (m.bottled) {
    // ── Açık şişe — popup son karesi: şişe yatmış, mantar fırlamış
    // havada, not aşağıda açılmış; şişe mektubun üstüne hafifçe biner ──
    // Sticker şişenin üstünde zaten var — kağıtta tekrar çizilmez
    drawLetter(ctx, m, hand, 230, 460, 620, 590, false);
    drawBottle(ctx, m, hand, {
      cx: 470,
      cy: 350,
      s: 1.45,
      rot: (105 * Math.PI) / 180,
      noteOut: true,
    });
  } else {
    // ── Açık zarf: mektup zarftan çıkık ──
    const by = 640; // zarf gövdesinin üst kenarı
    const bh = 440;
    // Arka yüzey
    roundRect(ctx, ex, by, ew, bh, 16);
    ctx.fillStyle = c.dark;
    ctx.fill();
    // Açık kapak — yukarı bakan üçgen (mektubun arkasında)
    ctx.beginPath();
    ctx.moveTo(ex, by + 6);
    ctx.lineTo(ex + ew, by + 6);
    ctx.lineTo(ex + ew / 2, by - 240);
    ctx.closePath();
    ctx.fillStyle = c.dark;
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fill();
    // Mektup kağıdı
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.30)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 18;
    roundRect(ctx, 230, 268, 620, 626, 10);
    ctx.fillStyle = "#fffdf5";
    ctx.fill();
    ctx.restore();
    // Rumuz + kod
    ctx.textAlign = "left";
    ctx.fillStyle = "#2f2c28";
    ctx.font = `700 60px ${hand}`;
    ctx.fillText(m.name, 280, 360);
    ctx.textAlign = "right";
    ctx.font = "700 26px 'Courier New', monospace";
    ctx.fillStyle = "#a8a294";
    ctx.fillText(m.code, 800, 356);
    // Manifest metni — sarılır, kağıda sığmayan kısım … ile kesilir
    ctx.textAlign = "left";
    ctx.font = "400 31px 'Segoe UI', Arial";
    ctx.fillStyle = "#4b473f";
    const lines = wrapText(ctx, m.manifest, 530);
    const maxLines = 9;
    lines.slice(0, maxLines).forEach((ln, i) => {
      const last = i === maxLines - 1 && lines.length > maxLines;
      ctx.fillText(last ? `${ln}…` : ln, 280, 432 + i * 48);
    });
    // Ön cep — V kesimli, alt köşeleri yuvarlak
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 22;
    ctx.beginPath();
    ctx.moveTo(ex, by);
    ctx.lineTo(ex + ew / 2, by + bh * 0.52);
    ctx.lineTo(ex + ew, by);
    ctx.lineTo(ex + ew, by + bh - 16);
    ctx.arcTo(ex + ew, by + bh, ex + ew - 16, by + bh, 16);
    ctx.lineTo(ex + 16, by + bh);
    ctx.arcTo(ex, by + bh, ex, by + bh - 16, 16);
    ctx.closePath();
    ctx.fillStyle = c.base;
    ctx.fill();
    ctx.restore();
    // Sticker — ön cebin sağında
    if (m.sticker) {
      ctx.textAlign = "center";
      ctx.font = "78px 'Segoe UI Emoji', serif";
      ctx.fillText(m.sticker, ex + ew - 130, by + bh - 90);
    }
    // Gerçekleşti — ön cebin solunda
    if (m.realized)
      drawRealizedPill(ctx, ex + 190, by + bh - 150, m.realizedDate);
    // Şans — ön cebin alt ortasında
    ctx.textAlign = "center";
    ctx.font = "600 30px Arial";
    ctx.fillStyle = c.ink;
    ctx.fillText(
      `⭐ ${m.luck.toLocaleString("tr-TR")} kişi şans diledi`,
      ex + ew / 2,
      by + bh - 38,
    );
  }

  // ── Zarf kodu — altta beyaz pill ──
  ctx.textAlign = "center";
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.14)";
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 10;
  roundRect(ctx, W / 2 - 290, 1112, 580, 138, 69);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
  ctx.font = "700 26px Arial";
  ctx.fillStyle = "#9a9382";
  try {
    ctx.letterSpacing = "8px";
  } catch {}
  ctx.fillText("ZARF KODU", W / 2, 1162);
  try {
    ctx.letterSpacing = "4px";
  } catch {}
  ctx.font = "700 62px 'Courier New', monospace";
  ctx.fillStyle = "#0369a1";
  ctx.fillText(m.code, W / 2, 1228);
  try {
    ctx.letterSpacing = "0px";
  } catch {}
  // Alt not
  ctx.font = "500 30px Arial";
  ctx.fillStyle = "#7c7668";
  ctx.fillText("Bu kodla beni duvarda bulabilirsin ⭐", W / 2, 1316);
}

// Paylaşım modalı — önizleme + kapalı/açık seçimi + indir / paylaş
function ShareModal({
  m,
  onClose,
}: {
  m: MemberManifest;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"closed" | "open">("closed");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canNative, setCanNative] = useState(false);

  useEffect(() => {
    setCanNative(
      typeof navigator !== "undefined" &&
        "share" in navigator &&
        "canShare" in navigator,
    );
  }, []);

  useEffect(() => {
    if (canvasRef.current) void drawShareImage(canvasRef.current, m, mode);
  }, [m, mode]);

  function toBlob(): Promise<Blob | null> {
    return new Promise((res) =>
      canvasRef.current
        ? canvasRef.current.toBlob(res, "image/png")
        : res(null),
    );
  }

  async function download() {
    const b = await toBlob();
    if (!b) return;
    const url = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manifest-${m.code}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Mobilde sistem paylaşım menüsü (Instagram vb.); desteklenmezse indirir
  async function nativeShare() {
    const b = await toBlob();
    if (!b) return;
    const f = new File([b], `manifest-${m.code}.png`, { type: "image/png" });
    if (navigator.canShare?.({ files: [f] })) {
      try {
        await navigator.share({ files: [f], title: "Manifest Duvarı" });
      } catch {}
    } else {
      download();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[2100] overflow-y-auto bg-black/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="mx-auto w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-center text-2xl font-bold text-neutral-800"
          style={{ fontFamily: "var(--font-caveat)" }}
        >
          Manifestini Paylaş
        </h3>
        {/* Kapalı (zarf/şişe/kutu) / Açık mektup seçimi */}
        <div className="mt-4 flex gap-2">
          {(
            [
              ["closed", m.boxed ? "Kutu" : m.bottled ? "Şişe" : "Kapalı Zarf"],
              [
                "open",
                m.boxed ? "Açık Kutu" : m.bottled ? "Açık Şişe" : "Açık Zarf",
              ],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setMode(k)}
              className={`flex-1 cursor-pointer rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                mode === k
                  ? "bg-neutral-800 text-white"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {/* Önizleme — canvas doğrudan gösterilir */}
        <canvas
          ref={canvasRef}
          className="mt-4 w-full rounded-xl shadow-md ring-1 ring-black/5"
        />
        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={nativeShare}
            className="flex flex-[2] cursor-pointer items-center justify-center gap-2 rounded-xl bg-sky-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-600"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
              <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
            </svg>
            Paylaş
          </button>
          <button
            type="button"
            onClick={download}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            İndir
          </button>
        </div>
        {/* Doğrudan paylaşım desteklenmeyen tarayıcıda kısa bilgi kalır */}
        {!canNative && (
          <p className="mt-2 text-center text-[10px] leading-relaxed text-neutral-400">
            Bu tarayıcı doğrudan paylaşımı desteklemiyor; Paylaş görseli
            indirir, telefonda sistem menüsü açılır.
          </p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-2.5 w-full cursor-pointer rounded-xl py-2 text-center text-xs font-medium text-neutral-500 hover:bg-neutral-50"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}

// Manifest kartı — zarftan çıkan mektupla aynı dil: rumuz el yazısı,
// manifest metni okunaklı düz font
// Mavi etiket ikonu — "Sticker'ını Ekle" butonunda
function TagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="#38bdf8"
      stroke="#0284c7"
      strokeWidth="1.5"
      className="h-3.5 w-3.5 shrink-0"
    >
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8 8a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828l-8-8Z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="#ffffff" stroke="none" />
    </svg>
  );
}

// Başarım kutucuğu ikonları — duvardaki görsellerin minyatür SVG kopyaları

// Şeffaf cam şişe (BottleVisual silüeti: cam gövde + mantar + parlama)
function MiniBottleIcon({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 520" className={className}>
      <path
        d="M82 60 L82 140 C82 162 58 172 50 192 C42 210 40 222 40 242 L40 458 C40 492 62 502 100 502 C138 502 160 492 160 458 L160 242 C160 222 158 210 150 192 C142 172 118 162 118 140 L118 60 Z"
        fill="#8ec7d8"
        fillOpacity="0.45"
        stroke="#5d98ab"
        strokeOpacity="0.6"
        strokeWidth="10"
      />
      <ellipse cx="100" cy="60" rx="20" ry="6" fill="#cfeaf2" />
      <rect x="80" y="10" width="40" height="52" rx="10" fill="#a97b47" />
      <rect x="55" y="215" width="16" height="235" rx="8" fill="#ffffff" opacity="0.5" />
    </svg>
  );
}

// Kraft hediye kutusu (GiftBoxVisual: kahverengi gövde + bordo kurdele + fiyonk)
function MiniGiftBoxIcon({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 104 136" className={className}>
      <rect x="12" y="12" width="88" height="120" rx="7" fill="#8a6f49" />
      <rect x="2" y="4" width="88" height="120" rx="7" fill="#c6a575" />
      <rect x="29" y="4" width="13" height="120" fill="#7b1526" />
      <rect x="2" y="30" width="88" height="13" fill="#7b1526" />
      <ellipse cx="24" cy="32" rx="11" ry="7" fill="#7b1526" transform="rotate(-24 24 32)" />
      <ellipse cx="47" cy="32" rx="11" ry="7" fill="#7b1526" transform="rotate(24 47 32)" />
      <circle cx="35.5" cy="36" r="5" fill="#9e2439" />
    </svg>
  );
}

// Parlak zarf — seçilen özel serinin renginde, cilalı vurgu şeridiyle
function MiniGlossEnvelopeIcon({
  base,
  dark,
  className = "h-[18px] w-6",
  outline,
}: {
  base: string;
  dark: string;
  className?: string;
  outline?: string; // koyu buton zemininde kenar çizgisi
}) {
  return (
    <svg viewBox="0 0 24 18" className={className}>
      <rect
        width="24"
        height="18"
        rx="2"
        fill={base}
        stroke={outline}
        strokeWidth={outline ? 1.5 : 0}
      />
      <path d="M1 1 H23 L12 10.5 Z" fill={dark} />
      <path d="M3 18 L11 0 H15 L7 18 Z" fill="#ffffff" opacity="0.22" />
    </svg>
  );
}

function ManifestCard({
  m,
  onRealized,
  onDelete,
  onPickSticker,
  onPickSpecial,
  onBottle,
  onBox,
  onShare,
}: {
  m: MemberManifest;
  onRealized: () => void;
  onDelete: () => void;
  onPickSticker: () => void;
  onPickSpecial: () => void;
  onBottle: () => void;
  onBox: () => void;
  onShare: () => void;
}) {
  const c = PANEL_COLORS[m.colorIdx % PANEL_COLORS.length];
  // Özel renk seçildiyse kart şeridi ve rozet o renge döner
  const sp = m.special != null ? SPECIAL_COLORS[m.special % SPECIAL_COLORS.length] : null;
  // Ödül aksiyonları — masaüstünde alt satırın solunda (ss63), mobilde iki
  // çizgi arasında kendi satırında sağa yaslı (ss64)
  const hasRewards =
    (m.luck >= 20 && !m.sticker) ||
    (m.luck >= 50 && m.special == null) ||
    (m.luck >= 150 && !m.bottled && !m.boxed) ||
    (m.luck >= 250 && !m.boxed);
  const rewardButtons = (
    <>
      {/* 20+ şans: sticker hakkı kazanıldı, üye süsünü kendisi seçer.
          Dolu amber buton + yanıp sönen halka ile dikkat çeker */}
      {m.luck >= 20 && !m.sticker && (
        <button
          type="button"
          onClick={onPickSticker}
          className="sticker-pulse flex cursor-pointer items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 font-semibold text-white transition-colors hover:bg-amber-600"
        >
          <TagIcon />
          Sticker&apos;ını Ekle
        </button>
      )}
      {/* 50+ şans: özel renk hakkı kazanıldı, üye rengini kendisi seçer */}
      {m.luck >= 50 && m.special == null && (
        <button
          type="button"
          onClick={onPickSpecial}
          className="special-pulse flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-[#E5C15C] transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #3d3d3d, #101010 55%, #2c2c2c)",
          }}
        >
          <MiniGlossEnvelopeIcon
            base="#2c2c2c"
            dark="#000000"
            outline="#E5C15C"
            className="h-3 w-4"
          />
          Özel Rengini Seç
        </button>
      )}
      {/* 150+ şans: şişe hakkı kazanıldı, üye onayıyla şişeye konur */}
      {m.luck >= 150 && !m.bottled && !m.boxed && (
        <button
          type="button"
          onClick={onBottle}
          className="bottle-pulse flex cursor-pointer items-center gap-1.5 rounded-full bg-[#4c8ba1] px-3 py-1 font-semibold text-white transition-colors hover:bg-[#3f7a8f]"
        >
          <MiniBottleIcon className="h-4 w-auto" />
          Şişeye Koy
        </button>
      )}
      {/* 250+ şans: hediye kutusu hakkı kazanıldı, üye onayıyla
          kurdeleli hediye kutusuna taşınır */}
      {m.luck >= 250 && !m.boxed && (
        <button
          type="button"
          onClick={onBox}
          className="gift-pulse flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-white transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #d4a94f, #a97e2c)",
          }}
        >
          <MiniGiftBoxIcon className="h-4 w-auto" />
          Kutuya Koy
        </button>
      )}
    </>
  );
  return (
    <article
      className="relative overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
      style={{ borderTop: `6px solid ${sp ? sp.color.base : c.base}` }}
    >
      <div className="p-5">
        {/* Üst satır — zarf kodu solda; Paylaş masaüstünde sağ üstte (ss62),
            mobilde alt aksiyon satırının sol köşesine iner */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm text-neutral-400">
            zarf kodu:
            <CopyBtn
              text={m.code}
              className="rounded-full bg-sky-100 px-3 py-1 text-[15px] font-bold tracking-wide text-sky-700 hover:bg-sky-200"
            >
              {m.code}
            </CopyBtn>
          </p>
          <button
            type="button"
            onClick={onShare}
            className="hidden cursor-pointer items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-600 transition-colors hover:bg-sky-100 sm:flex"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
              <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
            </svg>
            Paylaş
          </button>
        </div>
        {/* Rumuz + tarih */}
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span
            className="text-xl leading-none text-neutral-800"
            style={{ fontFamily: "var(--font-caveat)" }}
          >
            {m.name}
          </span>
          <span className="text-xs text-neutral-400">{m.date}</span>
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-neutral-700">
          {m.manifest}
        </p>
        {/* İstatistikler + başarım kutucukları solda, ödül butonları sağda */}
        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500">
          <span title="Şans dileyenler">⭐ {m.luck.toLocaleString("tr-TR")}</span>
          {/* Tebrik yalnızca gerçekleşen manifestte olur */}
          {m.realized && (
            <span title="Tebrikler">👏 {m.cheers.toLocaleString("tr-TR")}</span>
          )}
          <span className="flex items-center gap-1" title="Görüntülenme">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {m.views.toLocaleString("tr-TR")}
          </span>
          {/* Başarımlar — kazanılan ödüller küçük kutucuklar halinde */}
          {(m.sticker || sp || m.bottled || m.boxed) && (
            <span className="flex items-center gap-1.5">
              {m.sticker && (
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-base leading-none"
                  title={`Zarfının sticker'ı${
                    STICKERS.find((s) => s.emoji === m.sticker)
                      ? `: ${STICKERS.find((s) => s.emoji === m.sticker)!.label}`
                      : ""
                  }`}
                >
                  {m.sticker}
                </span>
              )}
              {sp && (
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50"
                  title={`Özel rengin: ${sp.label}`}
                >
                  <MiniGlossEnvelopeIcon
                    base={sp.color.base}
                    dark={sp.color.dark}
                  />
                </span>
              )}
              {m.bottled && !m.boxed && (
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200 bg-sky-50"
                  title="Manifest duvarda şişede sergileniyor"
                >
                  <MiniBottleIcon />
                </span>
              )}
              {m.boxed && (
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50"
                  title="Manifest duvarda hediye kutusunda sergileniyor"
                >
                  <MiniGiftBoxIcon />
                </span>
              )}
            </span>
          )}
        </div>
        {/* Mobil: ödül aksiyonları iki çizgi arasında kendi satırında,
            sağa yaslı (ss64) */}
        {hasRewards && (
          <div className="mt-3.5 flex flex-wrap items-center justify-end gap-2 border-t border-neutral-100 pt-3 text-xs sm:hidden">
            {rewardButtons}
          </div>
        )}
        {/* Ayraç + alt satır: masaüstünde solda ödül aksiyonları (ss63),
            mobilde solda Paylaş; sağda Gerçekleşti mi? / Sil */}
        <div className="mt-3.5 flex flex-wrap items-center justify-end gap-2 border-t border-neutral-100 pt-3 text-xs">
          <span className="mr-auto hidden flex-wrap items-center gap-2 sm:flex">
            {rewardButtons}
          </span>
          <button
            type="button"
            onClick={onShare}
            className="mr-auto flex cursor-pointer items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-600 transition-colors hover:bg-sky-100 sm:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
              <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
            </svg>
            Paylaş
          </button>
          {m.realized && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">
              ✓ Gerçekleşti{m.realizedDate ? ` · ${m.realizedDate}` : ""}
            </span>
          )}
          {!m.realized && (
            <button
              type="button"
              onClick={onRealized}
              className="cursor-pointer rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 transition-colors hover:bg-emerald-100 sm:px-3 sm:py-1 sm:text-xs"
            >
              Gerçekleşti mi?
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="cursor-pointer rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-medium text-red-500 transition-colors hover:bg-red-100 sm:px-3 sm:py-1 sm:text-xs"
          >
            Sil
          </button>
        </div>
      </div>
    </article>
  );
}

export default function PanelPage() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // Aktif sekme: manifestler / başarımlar
  const [tab, setTab] = useState<"manifests" | "achievements">("manifests");

  // Yeni manifest modalı — duvardaki açık zarf sahnesinde yazılır
  const [writeOpen, setWriteOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState(0);
  const [draftCode, setDraftCode] = useState("");
  // Duvara As sonrası: mektup zarfa girer, sahne küçülüp solar, yönlenir
  const [closing, setClosing] = useState(false);

  // Modal açılırken manifeste kodu peşin atanır — mektupta görünür
  // (kod sunucudan gelir; modal beklemeden açılır, kod anında dolar)
  function openWrite() {
    setDraftCode("");
    newManifestCode().then(setDraftCode);
    setDraft("");
    setDraftName(""); // rumuz boş başlar — kullanıcı ismi ön tanımlı gelmez
    setClosing(false);
    setWriteOpen(true);
  }

  // Silme / gerçekleşti onayları
  const [confirmDel, setConfirmDel] = useState<MemberManifest | null>(null);
  const [confirmAccount, setConfirmAccount] = useState(false);
  const [confirmRealized, setConfirmRealized] = useState<MemberManifest | null>(
    null,
  );
  // Sticker seçme popup'ı (20+ şans hakkı)
  const [pickFor, setPickFor] = useState<MemberManifest | null>(null);
  // Özel renk seçme popup'ı (50+ şans hakkı)
  const [pickColorFor, setPickColorFor] = useState<MemberManifest | null>(null);
  // Seçim onayları — sticker/renk uygulanmadan önce "geri alınamaz" uyarısı
  const [pendingSticker, setPendingSticker] = useState<{
    m: MemberManifest;
    emoji: string;
    label: string;
  } | null>(null);
  const [pendingSpecial, setPendingSpecial] = useState<{
    m: MemberManifest;
    idx: number;
  } | null>(null);
  // Şişeye koyma onayı (150+ şans hakkı) — önizleme + onay, geri alınamaz
  const [pendingBottle, setPendingBottle] = useState<MemberManifest | null>(
    null,
  );
  // Hediye kutusuna koyma onayı (250+ şans hakkı) — önizleme + onay
  const [pendingBox, setPendingBox] = useState<MemberManifest | null>(null);
  // Paylaşım modalı — manifest için görsel üretilir (açık/kapalı zarf)
  const [shareFor, setShareFor] = useState<MemberManifest | null>(null);
  // Ödül adımları sırayla açılır: sticker → özel renk → şişe → kutu.
  // Sıradaki adım atlanmak istenirse bu modal yönlendirir
  const [stepGate, setStepGate] = useState<{
    m: MemberManifest;
    needed: RewardStep;
  } | null>(null);

  // Ayarlar
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [setErr, setSetErrMsg] = useState("");
  const [setOk, setSetOk] = useState("");

  // Etkin yıl (admin yıl simülasyonu dahil) + panelde gezilen yıl.
  // viewYear null iken etkin yıl gösterilir; oklar geçmiş yıllara götürür
  const [nowYear, setNowYear] = useState(new Date().getFullYear());
  const [viewYear, setViewYear] = useState<number | null>(null);

  useEffect(() => {
    currentUser().then((u) => {
      if (!u) {
        window.location.href = "/uye";
        return;
      }
      setUser(u);
      setNewName(u.name);
      setReady(true);
    });
    fetchSettings().then((s) => {
      if (s.year) setNowYear(s.year);
    });
  }, []);

  if (!ready || !user) return null;

  // İyimser güncelleme: ekran anında yenilenir, liste arkada API'ye yazılır
  function update(mutate: (u: User) => void) {
    const next = { ...user!, manifests: [...user!.manifests] };
    mutate(next);
    setUser(next);
    void saveMyManifests(next.manifests).catch(() => {});
  }

  function addManifest() {
    const text = draft.trim();
    const nm = draftName.trim();
    if (text.length < 10 || nm.length < 2) return;
    // Yeni manifest etkin yıla damgalanır (yıl simülasyonunda o yıl);
    // sunucu da aynı damgayı basar
    const stamp = new Date();
    stamp.setFullYear(nowYear);
    const m: MemberManifest = {
      code: draftCode,
      name: nm,
      manifest: text,
      date: stamp.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      ts: stamp.getTime(),
      luck: 0,
      cheers: 0,
      views: 0,
      colorIdx: draftColor,
      realized: false,
    };
    update((u) => u.manifests.unshift(m));
    // Zarf kapanır (mektup içeri girer), sahne hafifçe küçülüp solar,
    // ardından ana sayfaya gidilir: kod arama kutusuna girilmiş gelir,
    // zarf duvarda bulunup vurgulanır (ss53)
    setClosing(true);
    setTimeout(() => {
      window.location.href = "/?kod=" + m.code;
    }, 900);
  }

  // Ödül adımının popup'ını açar; sırada tamamlanmamış daha erken bir adım
  // varsa açmak yerine yönlendirme modalı gösterilir (sticker → renk →
  // şişe → kutu sırası atlanamaz)
  function openStep(m: MemberManifest, step: RewardStep) {
    const first = firstPendingStep(m);
    if (first && STEP_ORDER.indexOf(first) < STEP_ORDER.indexOf(step)) {
      setStepGate({ m, needed: first });
      return;
    }
    if (step === "sticker") setPickFor(m);
    else if (step === "special") setPickColorFor(m);
    else if (step === "bottle") setPendingBottle(m);
    else setPendingBox(m);
  }

  // Seçilen sticker'ı manifeste yapıştırır — duvardaki zarfa/şişeye yansır
  function setSticker(code: string, emoji: string) {
    update((u) => {
      const m = u.manifests.find((x) => x.code === code);
      if (m) m.sticker = emoji;
    });
    setPendingSticker(null);
  }

  // Seçilen özel rengi manifeste işler — duvardaki zarf o renge bürünür
  function setSpecial(code: string, idx: number) {
    update((u) => {
      const m = u.manifests.find((x) => x.code === code);
      if (m) m.special = idx;
    });
    setPendingSpecial(null);
  }

  // Manifesti şişeye koyar — duvarda zarf yerine cam şişede sergilenir
  function setBottled(code: string) {
    update((u) => {
      const m = u.manifests.find((x) => x.code === code);
      if (m) m.bottled = true;
    });
    setPendingBottle(null);
  }

  // Manifesti hediye kutusuna taşır — duvarda kurdeleli kutuda sergilenir
  function setBoxed(code: string) {
    update((u) => {
      const m = u.manifests.find((x) => x.code === code);
      if (m) m.boxed = true;
    });
    setPendingBox(null);
  }

  function markRealized(code: string) {
    update((u) => {
      const m = u.manifests.find((x) => x.code === code);
      if (m) {
        m.realized = true;
        m.realizedDate = new Date().toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    });
  }

  // Manifesti kalıcı siler: duvardaki slot boşalır, zarf kaldırılır,
  // şans dilekleri ve başarımlar iptal olur
  function deleteManifest(code: string) {
    update((u) => {
      u.manifests = u.manifests.filter((x) => x.code !== code);
    });
    setConfirmDel(null);
  }

  async function deleteAccount() {
    await apiDeleteAccount();
    window.location.href = "/";
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSetErrMsg("");
    setSetOk("");
    const nm = newName.trim();
    if (nm.length < 3 || !nm.includes(" "))
      return setSetErrMsg("İsim ve soyisim birlikte yazılmalı.");
    // Şifre alanları doluysa şifre de değişir (Google üyeliğinde gizli);
    // mevcut şifre kontrolü sunucuda yapılır
    const wantsPass = user!.provider === "email" && (oldPass || newPass);
    if (wantsPass) {
      const issue = passwordIssue(newPass);
      if (issue) return setSetErrMsg(issue);
    }
    const r = await updateAccount(
      wantsPass ? { name: nm, oldPass, newPass } : { name: nm },
    );
    if (!r.ok) return setSetErrMsg(r.error ?? "Güncelleme başarısız.");
    setUser({ ...user!, name: nm });
    setOldPass("");
    setNewPass("");
    setSetOk("Bilgilerin güncellendi. ✓");
  }

  async function logout() {
    await apiLogout();
    window.location.href = "/";
  }

  const avatarColor = PANEL_COLORS[user.name.length % PANEL_COLORS.length];

  // Yıllık manifest hakkı: her üyeye yıl başına 3 manifest. Yeni manifest
  // yalnızca etkin yıla yazılır; içinde bulunulan yılda silinen manifest
  // slotu boşaltır. Geçmiş yıl manifestleri korunur ya da silinir —
  // silmek geçmiş yıla slot açmaz (sunucu da aynı kuralı uygular)
  const QUOTA = 3;
  const usedQuota = user.manifests.filter(
    (m) => new Date(m.ts).getFullYear() === nowYear,
  ).length;
  const quotaLeft = Math.max(0, QUOTA - usedQuota);

  // Panelde gezilebilir yıllar: üyenin manifest yılları + etkin yıl
  const years = [
    ...new Set([
      ...user.manifests.map((m) => new Date(m.ts).getFullYear()),
      nowYear,
    ]),
  ].sort((a, b) => a - b);
  const viewY = viewYear ?? nowYear;
  const viewIdx = years.indexOf(viewY);
  const yearManifests = user.manifests.filter(
    (m) => new Date(m.ts).getFullYear() === viewY,
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-16 pt-6">
        {/* Üst şerit */}
        <div className="mb-6 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700"
          >
            <span aria-hidden>←</span> Manifest Duvarı
          </a>
          <button
            type="button"
            onClick={logout}
            className="cursor-pointer rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
          >
            Çıkış Yap
          </button>
        </div>

        {/* Profil kartı */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="h-2.5 w-full bg-[linear-gradient(90deg,#FFC8CD,#FFE8CD,#FFFFCD,#CDFFD8,#CDEAFF,#EBCDFF)]" />
          <div className="flex flex-wrap items-center gap-4 p-6">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold shadow-inner"
              style={{ background: avatarColor.base, color: avatarColor.ink }}
            >
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <h1
                className="text-3xl font-bold leading-tight text-neutral-800"
                style={{ fontFamily: "var(--font-caveat)" }}
              >
                {user.name}
              </h1>
              <p className="truncate text-sm text-neutral-500">{user.email}</p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                Katılım: {user.createdAt}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSettingsOpen((v) => !v);
                setSetErrMsg("");
                setSetOk("");
              }}
              className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50"
            >
              Hesap Ayarları
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-4 w-4 transition-transform duration-200 ${
                  settingsOpen ? "rotate-180" : ""
                }`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>

          {/* Ayarlar — profil kartının altında yumuşak açılır/kapanır
              (grid-rows 0fr→1fr yükseklik animasyonu) */}
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
              settingsOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
            <form
              onSubmit={saveSettings}
              className="space-y-4 border-t border-neutral-100 bg-neutral-50/60 p-6"
            >
              {setErr && (
                <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
                  {setErr}
                </p>
              )}
              {setOk && (
                <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-600">
                  {setOk}
                </p>
              )}
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  İsim Soyisim
                </span>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={inputCls}
                />
              </label>
              {user.provider === "email" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Mevcut Şifre
                    </span>
                    <input
                      type="password"
                      value={oldPass}
                      onChange={(e) => setOldPass(e.target.value)}
                      placeholder="Değişmeyecekse boş bırak"
                      className={inputCls}
                      autoComplete="current-password"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Yeni Şifre
                    </span>
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="En az 8 karakter, harf + rakam"
                      className={inputCls}
                      autoComplete="new-password"
                    />
                  </label>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="cursor-pointer rounded-xl bg-neutral-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAccount(true)}
                  className="ml-auto cursor-pointer rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50"
                >
                  Hesabı Sil
                </button>
              </div>
            </form>
            </div>
          </div>
        </section>

        {/* Sekmeler: Manifestlerim / Başarımlar — mobilde satırı eşit bölen
            iki buton (kenarlardan hafif boşluklu), masaüstünde içerik kadar */}
        <div className="mt-8 flex gap-2 px-2 sm:px-0">
          <button
            type="button"
            onClick={() => setTab("manifests")}
            className={`flex-1 cursor-pointer rounded-full px-4 py-2 text-center text-sm font-semibold transition-colors sm:flex-none ${
              tab === "manifests"
                ? "bg-neutral-800 text-white"
                : "bg-white text-neutral-500 shadow-sm hover:bg-neutral-50"
            }`}
          >
            Manifestlerim
          </button>
          <button
            type="button"
            onClick={() => setTab("achievements")}
            className={`flex-1 cursor-pointer rounded-full px-4 py-2 text-center text-sm font-semibold transition-colors sm:flex-none ${
              tab === "achievements"
                ? "bg-neutral-800 text-white"
                : "bg-white text-neutral-500 shadow-sm hover:bg-neutral-50"
            }`}
          >
            Başarımlar
          </button>
        </div>

        {/* Manifestlerim */}
        {tab === "manifests" && (
        <section className="mt-5">
          {/* Mobilde başlık ortalı, yıl okları hemen altında, hak rozeti
              sonra, buton en altta. Masaüstünde oklar başlığın solunda
              (ss103) */}
          <div className="mb-3.5 flex flex-wrap items-center gap-3 max-[520px]:flex-col max-[520px]:gap-2">
            {/* Yıl okları — üyenin yılları arasında ileri/geri */}
            {years.length > 1 && (
              <div className="flex items-center gap-1.5 max-[520px]:order-2">
                <button
                  type="button"
                  aria-label="Önceki yıl"
                  disabled={viewIdx <= 0}
                  onClick={() => setViewYear(years[viewIdx - 1])}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-colors hover:bg-neutral-50 disabled:cursor-default disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Sonraki yıl"
                  disabled={viewIdx >= years.length - 1}
                  onClick={() => setViewYear(years[viewIdx + 1])}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-colors hover:bg-neutral-50 disabled:cursor-default disabled:opacity-30"
                >
                  →
                </button>
              </div>
            )}
            <h2
              className="text-2xl font-bold text-neutral-800 max-[520px]:order-1"
              style={{ fontFamily: "var(--font-caveat)" }}
            >
              {viewY} Manifestlerim
            </h2>
            {viewY === nowYear ? (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold max-[520px]:order-3 ${
                  quotaLeft > 0
                    ? "bg-amber-50 text-amber-600"
                    : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {usedQuota}/{QUOTA} hak kullanıldı
              </span>
            ) : (
              <span
                className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-400 max-[520px]:order-3"
                title="Geçmiş yıla yeni manifest yazılamaz; mevcutlar korunur ya da silinir"
              >
                arşiv · yeni manifest yazılamaz
              </span>
            )}
            {viewY === nowYear && (
              <button
                type="button"
                onClick={openWrite}
                disabled={quotaLeft === 0}
                className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-full bg-neutral-800 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-neutral-700 active:scale-[0.98] disabled:cursor-default disabled:opacity-40 max-[520px]:order-4 max-[520px]:ml-0 max-[520px]:mt-1"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                >
                  <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                  <path d="m15 5 4 4" />
                </svg>
                Yeni Manifest Yaz
              </button>
            )}
          </div>

          {yearManifests.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-white/60 px-6 py-12 text-center">
              <p className="text-4xl">✉️</p>
              <p
                className="mt-2 text-2xl text-neutral-600"
                style={{ fontFamily: "var(--font-caveat)" }}
              >
                {viewY === nowYear
                  ? "Henüz duvara asılmış bir manifestin yok"
                  : `${viewY} yılına ait manifestin yok`}
              </p>
              {viewY === nowYear && (
                <p className="mt-1 text-sm text-neutral-400">
                  İlk manifestini yaz, zarfına koyalım ve duvara asalım.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3.5">
              {yearManifests.map((m) => (
                <ManifestCard
                  key={m.code}
                  m={m}
                  onRealized={() => setConfirmRealized(m)}
                  onDelete={() => setConfirmDel(m)}
                  onPickSticker={() => openStep(m, "sticker")}
                  onPickSpecial={() => openStep(m, "special")}
                  onBottle={() => openStep(m, "bottle")}
                  onBox={() => openStep(m, "box")}
                  onShare={() => setShareFor(m)}
                />
              ))}
            </div>
          )}
        </section>
        )}

        {/* Başarımlar — 4 etap: sticker, özel renk, şişe, kutu */}
        {tab === "achievements" && (
          <>
            {/* Amaç — başarımların ruhunu anlatan kısa metin (ss105) */}
            <section className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="h-1.5 w-full bg-[linear-gradient(90deg,#FFC8CD,#FFE8CD,#FFFFCD,#CDFFD8,#CDEAFF,#EBCDFF)]" />
              <div className="px-6 py-5">
                <p
                  className="text-2xl text-neutral-800"
                  style={{ fontFamily: "var(--font-caveat)" }}
                >
                  Dilekler paylaştıkça güçlenir ✨
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                  Duvarda sana dilenen her şans, hayaline omuz veren küçük bir
                  iyiliktir. İnsanlar zarfını açıp şans diledikçe evrene
                  bıraktığın niyet topluluğun pozitif enerjisiyle büyür;
                  manifestin önce süsünü, sonra parlak rengini kazanır, şişeye
                  konur, en sonunda hediye kutusuna taşınır. Her etapta zarfın
                  binlerce zarfın arasından biraz daha sıyrılır: sticker'ı
                  yapıştırdıkça, rengi parladıkça, şişeye ve kutuya taşındıkça
                  duvarda çok daha fazla fark edilir, çok daha fazla açılır ve
                  daha çok şans toplar. Sen de başkalarının zarfını açıp şans
                  dileyerek bu enerjiyi çoğaltabilirsin. 🌟
                </p>
              </div>
            </section>

            <section className="mt-3.5 grid gap-3.5 sm:grid-cols-2">
            {STAGES.map((s, i) => {
              const achieved = user.manifests
                .filter((m) => m.luck >= s.threshold)
                .sort((a, b) => b.luck - a.luck);
              // Önizlemede kazanan manifest, yoksa örnek değerler kullanılır
              const pName = achieved[0]?.name ?? "Deniz";
              const unlocked = achieved.length > 0;
              // Önizleme sayıları: barajın hemen üstünde örnek değerler
              // (zarf 32/54, şişe 164, kutu 251); kazanılmışsa gerçek değer
              const sample = [32, 54, 164, 251][i];
              const shownLuck =
                i <= 1 ? sample : (achieved[0]?.luck ?? sample);
              return (
                <article
                  key={s.title}
                  className={`flex flex-col rounded-2xl bg-white p-5 shadow-sm ${
                    unlocked ? "" : "opacity-80"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2.5 text-sm font-extrabold uppercase tracking-wider text-neutral-700">
                      {i + 1}. Etap
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-amber-600">
                        {s.threshold}+ şans
                      </span>
                    </p>
                    <h3 className="mt-1 truncate text-xl font-bold text-neutral-800">
                      {s.title}
                    </h3>
                  </div>
                  {/* Gerçek görünüm — duvardaki birebir görseller, orijinal
                      masaüstü boyutlarında (zarf 180, şişe 149×387, kutu 158) */}
                  <div
                    className={`mt-3 flex items-center justify-center overflow-hidden rounded-xl bg-[#f1efe9] ${
                      i === 2
                        ? "h-[430px]"
                        : i === 3
                          ? "min-h-[280px] flex-1"
                          : "h-56"
                    }`}
                  >
                    {i === 0 && (
                      <MiniEnvelope
                        color={PREVIEW_PASTEL}
                        name={pName}
                        luck={shownLuck}
                        sticker="✈️"
                        width={180}
                      />
                    )}
                    {i === 1 && (
                      <MiniEnvelope
                        color={PREVIEW_SPECIAL}
                        name={pName}
                        luck={shownLuck}
                        width={180}
                      />
                    )}
                    {i === 2 && (
                      <div className="h-[387px] w-[149px] shrink-0">
                        <BottleVisual
                          ribbon={1}
                          sticker="✈️"
                          bandFs={Math.max(8, 10 * (149 / 160))}
                          label={
                            <div className="flex flex-col items-center gap-[3px]">
                              <div
                                className="flex items-start justify-center"
                                style={{ gap: 8 * (149 / 160) }}
                              >
                                <div className="flex flex-col items-center gap-[2px]">
                                  <p
                                    className="leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
                                    style={{ fontSize: 11 * (149 / 160) }}
                                  >
                                    ⭐
                                  </p>
                                  <p
                                    className="leading-none font-semibold text-[#8a6d33]"
                                    style={{ fontSize: 12 * (149 / 160) }}
                                  >
                                    {shownLuck.toLocaleString("tr-TR")}
                                  </p>
                                </div>
                              </div>
                              <p
                                className="truncate font-hand leading-none font-semibold text-[#6b5426]"
                                style={{ fontSize: 17 * (149 / 160) }}
                              >
                                {pName}
                              </p>
                            </div>
                          }
                        />
                      </div>
                    )}
                    {i === 3 && (
                      <div className="pr-9">
                        <GiftBoxVisual
                          size={158}
                          name={pName}
                          luck={shownLuck}
                          sticker="✈️"
                          glow
                        />
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-center text-xs leading-relaxed text-neutral-800">
                    {s.desc}
                  </p>
                  {/* Manifest ilerlemeleri — her manifest kod olarak, bu
                      etabın barajına göre bar ile gösterilir */}
                  {user.manifests.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-neutral-100 pt-3">
                      {[...user.manifests]
                        .sort((a, b) => b.luck - a.luck)
                        .map((m) => {
                          const pct = Math.min(
                            100,
                            Math.round((m.luck / s.threshold) * 100),
                          );
                          const done = m.luck >= s.threshold;
                          return (
                            <div
                              key={m.code}
                              className="flex items-center gap-2.5"
                              title={`${m.name} — ⭐ ${m.luck.toLocaleString("tr-TR")} / baraj ${s.threshold}`}
                            >
                              <span className="w-[72px] shrink-0 font-mono text-[11px] font-bold text-sky-700">
                                {m.code}
                              </span>
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                                <div
                                  className={`h-full rounded-full transition-[width] duration-500 ${
                                    done
                                      ? "bg-emerald-400"
                                      : "bg-gradient-to-r from-amber-300 to-amber-400"
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span
                                className={`w-[84px] shrink-0 text-right text-[11px] font-semibold tabular-nums ${
                                  done ? "text-emerald-600" : "text-neutral-400"
                                }`}
                              >
                                {done ? "✓ " : ""}
                                {m.luck.toLocaleString("tr-TR")}/{s.threshold}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </article>
              );
            })}
            </section>
          </>
        )}

        {/* ── Yeni manifest modalı — duvardaki açık zarf popup'ının birebir
            sahnesi: rumuz ve metin mektubun üstüne yazılır, renk zarfın alt
            şeridindeki bardan seçilir (ref: ss45) ── */}
        {writeOpen && (() => {
          const c = PANEL_COLORS[draftColor % PANEL_COLORS.length];
          return (
          <div
            className="fixed inset-0 z-[2100] overflow-y-auto bg-black/45 backdrop-blur-[2px]"
            onClick={() => {
              if (!closing) setWriteOpen(false);
            }}
          >
            <div
              className="mx-auto flex min-h-full w-[min(92vw,460px)] flex-col justify-center py-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sahne — mektup zarfın üstünden çıkık durur. Ölçüler duvarda
                  açılan zarf popup'ıyla birebir: k = 460/540 ≈ 0.85.
                  Kapanışta: mektup içeri girdikten sonra küçülüp solar */}
              <div
                className="relative mt-48"
                style={{
                  height: 477,
                  opacity: closing ? 0 : 1,
                  transform: closing ? "scale(0.88)" : "none",
                  transition:
                    "opacity 320ms ease 380ms, transform 320ms ease 380ms",
                }}
              >
                {/* Kapat ✕ — sahnenin sağında (ss45'teki gibi) */}
                <button
                  type="button"
                  aria-label="Kapat"
                  onClick={() => {
                    if (!closing) setWriteOpen(false);
                  }}
                  className="absolute -right-2 top-[8%] z-40 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-lg text-neutral-600 shadow-lg transition-colors hover:bg-neutral-100 sm:-right-14"
                >
                  ✕
                </button>

                {/* Zarf arka yüzeyi */}
                <div
                  className="absolute inset-x-0 bottom-0 rounded-[6px]"
                  style={{ height: 337, backgroundColor: c.dark }}
                />
                {/* Katlanma izi — kapağın menteşe çizgisi */}
                <div
                  className="absolute inset-x-0 z-[5] h-px"
                  style={{ top: 141, backgroundColor: "rgba(0,0,0,0.09)" }}
                />
                <div
                  className="absolute inset-x-0 z-[5] h-[6px]"
                  style={{
                    top: 135,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.05), transparent)",
                  }}
                />

                {/* Mektup — açık konumda, üzerine yazılır */}
                <div
                  className="absolute left-1/2 z-10 w-[86%]"
                  style={{
                    bottom: 31,
                    transformOrigin: "bottom center",
                    // Kapanışta mektup küçülerek zarfın içine girer
                    transform: closing
                      ? "translateX(-50%) translateY(0) scale(0.55)"
                      : "translateX(-50%) translateY(-272px)",
                    transition:
                      "transform 340ms cubic-bezier(0.25, 0.9, 0.3, 1)",
                  }}
                >
                  <div className="rounded-[4px] bg-[#fffdf5] px-8 py-7 shadow-[0_16px_44px_rgba(0,0,0,0.35)] max-[520px]:px-5 max-[520px]:py-5">
                    {/* Rumuz — mektubun başlığına yazılır (maks 20 karakter),
                        modal açılınca imleç burada başlar */}
                    <div className="flex items-end gap-2">
                      <input
                        value={draftName}
                        onChange={(e) =>
                          setDraftName(e.target.value.slice(0, 20))
                        }
                        autoFocus
                        placeholder="Rumuzun…"
                        className="w-full bg-transparent font-hand text-[26px] text-neutral-800 outline-none placeholder:text-neutral-300 max-[520px]:text-[22px]"
                      />
                      <span className="shrink-0 pb-1 text-[10px] text-neutral-300">
                        {draftName.length}/20
                      </span>
                    </div>
                    {/* Kod — sağda tek başına ("Manifest" etiketi yok) */}
                    <p className="mt-1 text-right font-mono text-[11px] tracking-wider text-neutral-400 max-[520px]:text-[9.5px]">
                      {draftCode}
                    </p>
                    {/* Manifest metni — mektubun gövdesine yazılır */}
                    <textarea
                      value={draft}
                      onChange={(e) =>
                        setDraft(stripEmoji(e.target.value).slice(0, 250))
                      }
                      rows={7}
                      placeholder="Manifestini buraya yaz… (en az 10 karakter)"
                      className="mt-4 w-full resize-none bg-transparent text-[14px] leading-relaxed text-neutral-700 outline-none placeholder:text-neutral-300 max-[520px]:text-[13px]"
                    />
                    <div className="text-right text-[10px] text-neutral-300">
                      {draft.length}/250
                    </div>
                  </div>
                </div>

                {/* Zarf ön cebi (mektubun alt kısmını içine alır) */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-20 rounded-[6px] shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
                  style={{
                    height: 337,
                    clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)",
                    transform: "translateZ(0)",
                    backgroundColor: c.base,
                  }}
                />

                {/* Zarf rengi barı — ön yüzün alt şeridi (ss45) */}
                <div className="absolute inset-x-0 bottom-[18px] z-30 flex items-center justify-center">
                  <div className="flex items-center gap-2.5 rounded-full bg-white/85 px-4 py-2.5 shadow-md backdrop-blur">
                    {PANEL_COLORS.map((pc, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Zarf rengi ${i + 1}`}
                        onClick={() => setDraftColor(i)}
                        className={`h-6 w-6 cursor-pointer rounded-full transition-transform hover:scale-115 ${
                          draftColor === i
                            ? "scale-110 ring-2 ring-neutral-700 ring-offset-1"
                            : "ring-1 ring-black/10"
                        }`}
                        style={{ background: pc.base }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Aksiyonlar — kapanışta sahneyle birlikte solar */}
              <div
                className="mt-5 flex gap-2.5"
                style={{
                  opacity: closing ? 0 : 1,
                  transition: "opacity 320ms ease 380ms",
                }}
              >
                <button
                  type="button"
                  onClick={() => setWriteOpen(false)}
                  disabled={closing}
                  className="flex-1 cursor-pointer rounded-xl border border-white/30 bg-white/10 py-2.5 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/20 disabled:cursor-default"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={addManifest}
                  disabled={
                    closing ||
                    draft.trim().length < 10 ||
                    draftName.trim().length < 2
                  }
                  className="flex-1 cursor-pointer rounded-xl bg-white py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-100 disabled:cursor-default disabled:opacity-50"
                >
                  Duvara As
                </button>
              </div>
            </div>
          </div>
          );
        })()}

        {/* ── Paylaşım modalı — görsel üret, indir / paylaş ── */}
        {shareFor && (
          <ShareModal m={shareFor} onClose={() => setShareFor(null)} />
        )}

        {/* ── Adım sırası yönlendirmesi — atlanmak istenen adımdan önce
            tamamlanması gereken adımı gösterir ── */}
        {stepGate && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setStepGate(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-neutral-800">
                Sırayla ilerlemelisin
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {stepGate.needed === "sticker" && (
                  <>
                    Bu adıma geçmeden önce{" "}
                    <b className="text-neutral-700">
                      zarfının sticker&apos;ını seçmelisin
                    </b>
                    . Ödüller kazanıldıkları sırayla kullanılır.
                  </>
                )}
                {stepGate.needed === "special" && (
                  <>
                    Bu adıma geçmeden önce{" "}
                    <b className="text-neutral-700">
                      parlak zarfının rengini seçmelisin
                    </b>
                    . Ödüller kazanıldıkları sırayla kullanılır.
                  </>
                )}
                {stepGate.needed === "bottle" && (
                  <>
                    Bu adıma geçmeden önce{" "}
                    <b className="text-neutral-700">
                      manifestini şişeye koymalısın
                    </b>
                    . Ödüller kazanıldıkları sırayla kullanılır.
                  </>
                )}
              </p>
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setStepGate(null)}
                  className="flex-1 cursor-pointer rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const g = stepGate;
                    setStepGate(null);
                    openStep(g.m, g.needed);
                  }}
                  className="flex-1 cursor-pointer rounded-xl bg-neutral-800 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
                >
                  {stepGate.needed === "sticker" && "Sticker'ını Seç"}
                  {stepGate.needed === "special" && "Rengini Seç"}
                  {stepGate.needed === "bottle" && "Şişeye Koy"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Sticker seçme popup'ı — 20+ şans hakkı ── */}
        {pickFor && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setPickFor(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="text-center text-2xl font-bold text-neutral-800"
                style={{ fontFamily: "var(--font-caveat)" }}
              >
                Sticker&apos;ını Seç
              </h3>
              <p className="mb-4 mt-0.5 text-center text-xs leading-relaxed text-neutral-400">
                <b className="text-neutral-600">{pickFor.code}</b> kodlu
                manifestin 20 şans barajını geçti. Manifest türüne uygun süsü
                seç, zarfının kapağına yapıştıralım.
              </p>
              <div className="grid grid-cols-5 gap-2">
                {STICKERS.map((s) => (
                  <button
                    key={s.emoji}
                    type="button"
                    aria-label={`${s.label} sticker'ını seç`}
                    onClick={() => {
                      setPendingSticker({
                        m: pickFor,
                        emoji: s.emoji,
                        label: s.label,
                      });
                      setPickFor(null);
                    }}
                    className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl bg-neutral-50 py-2.5 transition-all hover:scale-110 hover:bg-amber-50 hover:shadow-md"
                  >
                    <span className="text-3xl leading-none">{s.emoji}</span>
                    <span className="text-[10px] font-medium text-neutral-500">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPickFor(null)}
                className="mt-4 w-full cursor-pointer rounded-xl py-2 text-center text-xs font-medium text-neutral-500 hover:bg-neutral-50"
              >
                Vazgeç
              </button>
            </div>
          </div>
        )}

        {/* ── Özel renk seçme popup'ı — 50+ şans hakkı ── */}
        {pickColorFor && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setPickColorFor(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="mb-4 text-center text-2xl font-bold text-neutral-800"
                style={{ fontFamily: "var(--font-caveat)" }}
              >
                Özel Rengini Seç
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {SPECIAL_COLORS.map((s, idx) => (
                  <button
                    key={s.label}
                    type="button"
                    aria-label={`${s.label} rengini seç`}
                    onClick={() => {
                      setPendingSpecial({ m: pickColorFor, idx });
                      setPickColorFor(null);
                    }}
                    className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl bg-neutral-50 p-2 transition-all hover:scale-105 hover:bg-neutral-100 hover:shadow-md"
                  >
                    <MiniEnvelope
                      color={s.color}
                      name={pickColorFor.name}
                      luck={pickColorFor.luck}
                      sticker={pickColorFor.sticker}
                      width={142}
                    />
                    <span className="text-xs font-semibold text-neutral-600">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPickColorFor(null)}
                className="mt-4 w-full cursor-pointer rounded-xl py-2 text-center text-xs font-medium text-neutral-500 hover:bg-neutral-50"
              >
                Vazgeç
              </button>
            </div>
          </div>
        )}

        {/* ── Sticker seçimi onayı — geri alınamaz ── */}
        {pendingSticker && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setPendingSticker(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-neutral-800">
                Emin misin?
              </h3>
              <div className="mt-3 flex items-center justify-center">
                <span className="flex flex-col items-center gap-1 rounded-xl bg-amber-50 px-6 py-3">
                  <span className="text-4xl leading-none">
                    {pendingSticker.emoji}
                  </span>
                  <span className="text-[11px] font-medium text-neutral-500">
                    {pendingSticker.label}
                  </span>
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                Bu sticker{" "}
                <b className="text-neutral-700">{pendingSticker.m.code}</b>{" "}
                kodlu manifestin zarfına yapıştırılacak.{" "}
                <b className="text-red-500">Bu seçim geri alınamaz.</b>
              </p>
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setPickFor(pendingSticker.m); // seçime geri dön
                    setPendingSticker(null);
                  }}
                  className="flex-1 cursor-pointer rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSticker(pendingSticker.m.code, pendingSticker.emoji)
                  }
                  className="flex-1 cursor-pointer rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                >
                  Evet, Yapıştır
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Özel renk seçimi onayı — geri alınamaz ── */}
        {pendingSpecial && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setPendingSpecial(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-neutral-800">
                Emin misin?
              </h3>
              <div className="mt-3 flex flex-col items-center gap-1.5">
                <MiniEnvelope
                  color={SPECIAL_COLORS[pendingSpecial.idx].color}
                  name={pendingSpecial.m.name}
                  luck={pendingSpecial.m.luck}
                  sticker={pendingSpecial.m.sticker}
                  width={130}
                />
                <span className="text-xs font-semibold text-neutral-600">
                  {SPECIAL_COLORS[pendingSpecial.idx].label}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                <b className="text-neutral-700">{pendingSpecial.m.code}</b>{" "}
                kodlu manifestin zarfı bu renge bürünecek.{" "}
                <b className="text-red-500">Bu seçim geri alınamaz.</b>
              </p>
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setPickColorFor(pendingSpecial.m); // seçime geri dön
                    setPendingSpecial(null);
                  }}
                  className="flex-1 cursor-pointer rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSpecial(pendingSpecial.m.code, pendingSpecial.idx)
                  }
                  className="flex-1 cursor-pointer rounded-xl py-2.5 text-sm font-semibold text-[#E5C15C] transition-opacity hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(135deg, #3d3d3d, #101010 55%, #2c2c2c)",
                  }}
                >
                  Evet, Bu Renk
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Şişeye koyma onayı — şişe önizlemesi + geri alınamaz ── */}
        {pendingBottle && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setPendingBottle(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="text-center text-2xl font-bold text-neutral-800"
                style={{ fontFamily: "var(--font-caveat)" }}
              >
                Şişeye Koy
              </h3>
              <p className="mt-0.5 text-center text-xs leading-relaxed text-neutral-400">
                <b className="text-neutral-600">{pendingBottle.code}</b> kodlu
                manifestin 150 şans barajını geçti. Duvarda böyle
                sergilenecek:
              </p>
              {/* Şişe önizlemesi: seçilen sticker camda, kurdele seçilen
                  özel renkte */}
              <div className="mt-3 flex items-center justify-center rounded-xl bg-[#f1efe9] py-4">
                <div className="h-[330px] w-[127px] shrink-0">
                  <BottleVisual
                    sticker={pendingBottle.sticker ?? "🦋"}
                    ribbon={pendingBottle.special ?? 0}
                    bandFs={8}
                    label={
                      <div className="flex flex-col items-center gap-[3px]">
                        <div className="flex flex-col items-center gap-[2px]">
                          <p className="text-[10px] leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
                            ⭐
                          </p>
                          <p className="text-[11px] leading-none font-semibold text-[#8a6d33]">
                            {pendingBottle.luck.toLocaleString("tr-TR")}
                          </p>
                        </div>
                        <p className="truncate font-hand text-[15px] leading-none font-semibold text-[#6b5426]">
                          {pendingBottle.name}
                        </p>
                      </div>
                    }
                  />
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                Manifest zarftan çıkıp duvarda cam şişe içinde sergilenecek.{" "}
                <b className="text-red-500">Bu işlem geri alınamaz.</b>
              </p>
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setPendingBottle(null)}
                  className="flex-1 cursor-pointer rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() => setBottled(pendingBottle.code)}
                  className="flex-1 cursor-pointer rounded-xl bg-[#4c8ba1] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3f7a8f]"
                >
                  Onayla 🍾
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Hediye kutusuna koyma onayı — kutu önizlemesi + geri alınamaz ── */}
        {pendingBox && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setPendingBox(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="text-center text-2xl font-bold text-neutral-800"
                style={{ fontFamily: "var(--font-caveat)" }}
              >
                Hediye Kutusuna Koy
              </h3>
              <p className="mt-0.5 text-center text-xs leading-relaxed text-neutral-400">
                <b className="text-neutral-600">{pendingBox.code}</b> kodlu
                manifestin 250 şans barajını geçti. Duvarda böyle
                sergilenecek:
              </p>
              {/* Kutu önizlemesi — duvardaki kurdeleli kutunun birebir görseli */}
              <div className="mt-3 flex items-center justify-center rounded-xl bg-[#f1efe9] py-6">
                <div className="pr-9">
                  <GiftBoxVisual
                    size={150}
                    name={pendingBox.name}
                    luck={pendingBox.luck}
                    sticker={pendingBox.sticker}
                    realized={pendingBox.realized}
                    cheers={pendingBox.cheers}
                    glow
                  />
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                Manifest {pendingBox.bottled ? "şişeden çıkıp" : "zarftan çıkıp"}{" "}
                duvarda kurdeleli hediye kutusunda sergilenecek.{" "}
                <b className="text-red-500">Bu işlem geri alınamaz.</b>
              </p>
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setPendingBox(null)}
                  className="flex-1 cursor-pointer rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() => setBoxed(pendingBox.code)}
                  className="flex-1 cursor-pointer rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #d4a94f, #a97e2c)",
                  }}
                >
                  Onayla 🎁
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Gerçekleşti onayı — etiket geri alınamaz ── */}
        {confirmRealized && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setConfirmRealized(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-neutral-800">
                Gerçekleşti olarak işaretlensin mi?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                <b className="text-neutral-700">{confirmRealized.code}</b>{" "}
                kodlu manifestin duvarda yeşil &quot;Gerçekleşti&quot; rozeti
                taşıyacak, şans dilemeye kapanıp tebrik almaya başlayacak.{" "}
                <b className="text-red-500">Bu etiket geri alınamaz.</b>
              </p>
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmRealized(null)}
                  className="flex-1 cursor-pointer rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() => {
                    markRealized(confirmRealized.code);
                    setConfirmRealized(null);
                  }}
                  className="flex-1 cursor-pointer rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
                >
                  Evet, Gerçekleşti ✓
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Manifest silme onayı ── */}
        {confirmDel && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setConfirmDel(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-neutral-800">
                Manifesti sil?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                <b className="text-neutral-700">{confirmDel.code}</b> kodlu
                manifestin duvardan kaldırılacak, slotu boşalacak.{" "}
                <b className="text-red-500">
                  {confirmDel.luck.toLocaleString("tr-TR")} şans dileği
                </b>
                , tebrikler ve başarımlar iptal edilecek. Bu işlem geri
                alınamaz.
              </p>
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmDel(null)}
                  className="flex-1 cursor-pointer rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() => deleteManifest(confirmDel.code)}
                  className="flex-1 cursor-pointer rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                >
                  Evet, Sil
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Hesap silme onayı ── */}
        {confirmAccount && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setConfirmAccount(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-neutral-800">
                Hesabını silmek istediğine emin misin?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                Üyeliğin ve duvardaki{" "}
                <b className="text-red-500">
                  {user.manifests.length} manifestin
                </b>{" "}
                kalıcı olarak silinecek; tüm şans dilekleri, tebrikler ve
                başarımlar iptal edilecek. Bu işlem geri alınamaz.
              </p>
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmAccount(false)}
                  className="flex-1 cursor-pointer rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={deleteAccount}
                  className="flex-1 cursor-pointer rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                >
                  Hesabı Kalıcı Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
