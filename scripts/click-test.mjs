// Zarf tıklama duman testi: zarfa tıkla, popup açılıyor mu bak
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath:
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: "new",
  args: ["--window-size=1920,1080"],
  defaultViewport: { width: 1920, height: 1080 },
});
const page = await browser.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 1200));

const envCount = await page.$$eval(".env-wrap", (els) => els.length);
console.log("render edilen zarf:", envCount);

// Ortadaki bir zarfa tıkla
await page.click(".env-wrap:nth-of-type(30) button");
await new Promise((r) => setTimeout(r, 1500));

const hasPopup = await page.evaluate(() =>
  Boolean(document.querySelector("div.fixed.inset-0")),
);
console.log("popup acildi mi:", hasPopup);
await page.screenshot({
  path: "C:\\Users\\deniz\\AppData\\Local\\Temp\\claude\\click-test.png",
});

// Mobil boyut testi
const mp = await browser.newPage();
await mp.emulate({
  viewport: { width: 412, height: 915, isMobile: true, hasTouch: true },
  userAgent:
    "Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
});
await mp.goto("http://localhost:3000", { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 1200));
const envCountM = await mp.$$eval(".env-wrap", (els) => els.length);
console.log("mobil render edilen zarf:", envCountM);
await mp.tap(".env-wrap:nth-of-type(10) button");
await new Promise((r) => setTimeout(r, 1500));
const hasPopupM = await mp.evaluate(() =>
  Boolean(document.querySelector("div.fixed.inset-0")),
);
console.log("mobil popup acildi mi:", hasPopupM);
await mp.screenshot({
  path: "C:\\Users\\deniz\\AppData\\Local\\Temp\\claude\\click-test-mobile.png",
});

// Mobilde asagi kaydir — pencereleme calisiyor mu
await mp.evaluate(() => window.scrollTo(0, 8000));
await new Promise((r) => setTimeout(r, 1500));
const envAfterScroll = await mp.$$eval(".env-wrap", (els) => els.length);
console.log("mobil scroll sonrasi zarf:", envAfterScroll);

await browser.close();
