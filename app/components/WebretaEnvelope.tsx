// ── Webreta zarfının içeriği ve rengi ───────────────────────────────────
// Zarfın kendisi duvardaki sıradan zarflarla birebir aynı bileşenle
// (EnvelopeCard) çizilir ve aynı animasyonla açılır; buradan yalnızca
// metni ve rengi gelir. Tek farkı yerinin sabit olması ve şans yerine
// beğeni toplaması.

import type { EnvelopeColor } from "../lib/wallData";

export const WEBRETA_TEXT =
  "Çoğu dilek söylenmeden kaybolur. Bu duvarı kaybolmasınlar diye yaptık. " +
  "Buraya yazılan her dileğin bir gün gerçek olması ve duvarın herkese iyi " +
  "gelmesi dileğiyle. Geliştirici ekipten selamlar!";

// Webreta mavisi (#3c639f) üzerinden parlak gradyan
export const WEBRETA_COLOR: EnvelopeColor = {
  base: "#3c639f",
  dark: "#2f527f",
  ink: "#ffffff",
  bodyBg:
    "linear-gradient(135deg, #5b86c6 0%, #3c639f 46%, #2b4a7d 78%, #4370b4 100%)",
  flapBg: "linear-gradient(180deg, #4f79b8, #2f527f)",
  gloss: true,
};
