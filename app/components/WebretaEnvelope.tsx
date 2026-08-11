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

// Webreta mavisi (#3c639f) üzerinden açık, parlak bir gradyan — duvardaki
// pastel zarfların yanında koyu bir leke gibi durmasın diye açıldı
export const WEBRETA_COLOR: EnvelopeColor = {
  base: "#6d97d4",
  dark: "#4f7ab8",
  ink: "#ffffff",
  bodyBg:
    "linear-gradient(135deg, #8fb4e6 0%, #6d97d4 45%, #4f7ab8 78%, #7ea9de 100%)",
  flapBg: "linear-gradient(180deg, #7ea9de, #4f7ab8)",
  gloss: true,
};
