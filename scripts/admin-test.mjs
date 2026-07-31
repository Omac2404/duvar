// Admin paneli + hediye kutusu (250+) akışı duman testi:
// admin'den üyeye "kutu bekliyor" manifesti tanımla → panelde Kutuya Koy →
// duvarın tepesindeki kutuda üye manifesti görünsün
import puppeteer from "puppeteer-core";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath:
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: "new",
  args: ["--window-size=1920,1080"],
  defaultViewport: { width: 1920, height: 1080 },
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

// Metnine göre buton/bağlantı tıkla
const clickText = async (txt) => {
  const ok = await page.evaluate((t) => {
    const el = [...document.querySelectorAll("button, a")].find((e) =>
      e.textContent.trim().includes(t),
    );
    if (el) {
      el.click();
      return true;
    }
    return false;
  }, txt);
  if (!ok) throw new Error("tiklanacak eleman bulunamadi: " + txt);
};

// Temiz başlangıç: üye verilerini sıfırla (test hesabı yeniden tohumlanır)
await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle0" });
await page.evaluate(() => {
  for (const k of [
    "mw_users",
    "mw_session",
    "mw_codes",
    "mw_test_deleted",
    "mw_ads",
  ])
    localStorage.removeItem(k);
});
await page.reload({ waitUntil: "networkidle0" });
await sleep(600);

// Üyeler sekmesi → test hesabına "kutu bekliyor" manifesti tanımla
await clickText("Üyeler (");
await sleep(300);
console.log(
  "uye satiri:",
  await page.$$eval("tbody tr", (r) => r.length),
);
await clickText("Manifest Tanımla");
await sleep(300);
await page.type(
  'input[placeholder="Zarfın üstündeki isim"]',
  "Kutu Testi",
);
await page.type(
  "textarea",
  "Bu manifest admin panelinden hediye kutusu akisini test etmek icin tanimlandi.",
);
await clickText("Kutu bekliyor (270");
await sleep(150);
await clickText("Üyeye Tanımla");
await sleep(400);

await clickText("Üye Manifestleri");
await sleep(300);
const rows = await page.$$eval("tbody tr", (r) => r.map((x) => x.textContent));
console.log(
  "admin'de manifest tanimlandi:",
  rows.some((t) => t.includes("Kutu Testi")),
);

// Panel: test hesabıyla oturum aç → Kutuya Koy → Onayla
await page.evaluate(() =>
  localStorage.setItem("mw_session", JSON.stringify("u-test")),
);
await page.goto("http://localhost:3000/panel", { waitUntil: "networkidle0" });
await sleep(600);
const hasBoxBtn = await page.evaluate(() =>
  [...document.querySelectorAll("button")].some((b) =>
    b.textContent.includes("Kutuya Koy"),
  ),
);
console.log("panelde Kutuya Koy butonu:", hasBoxBtn);
await clickText("Kutuya Koy");
await sleep(400);
await clickText("Onayla 🎁");
await sleep(400);
console.log(
  "panelde Kutuda rozeti:",
  await page.evaluate(() => document.body.textContent.includes("Kutuda")),
);

// Duvar: üye manifesti kendi kutusuyla duvara serpilmiş olmalı
await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
await sleep(1200);
const giftLabels = await page.$$eval(
  'button[aria-label*="hediye kutusundaki manifesti oku"]',
  (els) => els.map((b) => b.getAttribute("aria-label")),
);
console.log("duvardaki kutular:", giftLabels);
console.log(
  "uye kutusu duvarda:",
  giftLabels.some((l) => l.includes("Kutu Testi")),
);
console.log("konsol hatalari:", errors.length ? errors : "yok");

await browser.close();
