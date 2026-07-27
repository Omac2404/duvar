module.exports = [
"[project]/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
// Sponsor zarf teması — Petimemama marka renkleri (canlı, parlak)
const SPONSOR_COLOR = {
    base: "#ffffff",
    dark: "#5b2d9c",
    ink: "#5b2d9c",
    bodyBg: "linear-gradient(135deg, #ffffff, #f1e8ff 45%, #ffffff 65%, #ffe9d4)",
    flapBg: "linear-gradient(135deg, #7c4ad0, #4a2385 60%, #6535ab)",
    gloss: true
};
const SPONSOR_TEXT = "Petimemama'dan manifest duvarına özel bir sürpriz! Bu zarfa denk gelen " + "şanslı ziyaretçilere minik dostlarının mamalarında geçerli özel bir " + "hediye kodu bırakıyoruz. Kod: PETI-SURPRIZ. Manifestlerine şans, " + "patili dostlarına afiyet olsun! 🐾";
// Pastel palet — tüm zarflar bu 12 renkten organik dağılır
// (orijinal tonların ~%28 beyaza çekilmiş, soluk hali)
const PALETTE = [
    {
        base: "#FFC8CD",
        dark: "#F7ABB2",
        ink: "#8E3B47"
    },
    {
        base: "#FFE8CD",
        dark: "#F9D4B0",
        ink: "#8A5A2A"
    },
    {
        base: "#FFFFCD",
        dark: "#F4F3AD",
        ink: "#7A7420"
    },
    {
        base: "#CDFFD8",
        dark: "#AEEFC0",
        ink: "#2E7C48"
    },
    {
        base: "#CDEAFF",
        dark: "#AED6F6",
        ink: "#2F5E8C"
    },
    {
        base: "#EBCDFF",
        dark: "#DAB2F7",
        ink: "#6D3A96"
    },
    {
        base: "#FFD7E6",
        dark: "#F7BDD4",
        ink: "#94436A"
    },
    {
        base: "#BCDFFF",
        dark: "#9ECCF4",
        ink: "#2A5A8C"
    },
    {
        base: "#DAC9E5",
        dark: "#C8B2D6",
        ink: "#5C3F70"
    },
    {
        base: "#C9F0E2",
        dark: "#ACE3CF",
        ink: "#2F6E58"
    },
    {
        base: "#FFE5D2",
        dark: "#F7CFB5",
        ink: "#8A5230"
    },
    {
        base: "#D6DBF0",
        dark: "#BEC5E4",
        ink: "#47517E"
    }
];
// Özel seri — parlak, gradientli, duvarda kendini belli eden 4 renk
const SPECIALS = [
    {
        base: "#1c1c1c",
        dark: "#000000",
        ink: "#E5C15C",
        bodyBg: "linear-gradient(135deg, #3d3d3d, #101010 55%, #2c2c2c)",
        flapBg: "linear-gradient(180deg, #262626, #000000)",
        gloss: true
    },
    {
        base: "#7b1526",
        dark: "#4a0d16",
        ink: "#E5C15C",
        bodyBg: "linear-gradient(135deg, #9e2439, #5c0f1d 55%, #7b1526)",
        flapBg: "linear-gradient(180deg, #6f1322, #3f0a12)",
        gloss: true
    },
    {
        base: "#1c3260",
        dark: "#0b1733",
        ink: "#E5C15C",
        bodyBg: "linear-gradient(135deg, #2a4a8b, #101f45 55%, #1d3567)",
        flapBg: "linear-gradient(180deg, #1c3260, #0b1733)",
        gloss: true
    },
    {
        base: "#552881",
        dark: "#2a0f47",
        ink: "#E5C15C",
        bodyBg: "linear-gradient(135deg, #6d3aa0, #3a1560 55%, #552881)",
        flapBg: "linear-gradient(180deg, #4d2178, #2a0f47)",
        gloss: true
    }
];
// Şişe kurdele gradyanları — özel seri renklerinin keskin geçişli halleri
const RIBBON_GRADS = [
    [
        "#3d3d3d",
        "#101010",
        "#2c2c2c"
    ],
    [
        "#9e2439",
        "#5c0f1d",
        "#7b1526"
    ],
    [
        "#2a4a8b",
        "#101f45",
        "#1d3567"
    ],
    [
        "#6d3aa0",
        "#3a1560",
        "#552881"
    ]
];
const WORDS = [
    "Lorem",
    "Ipsum",
    "Dolor",
    "Amet",
    "Consec",
    "Elit",
    "Tempor",
    "Magna",
    "Aliqua",
    "Veniam",
    "Nostrud",
    "Ullamco",
    "Nisi",
    "Aliquip",
    "Commodo",
    "Duis",
    "Aute",
    "Irure",
    "Velit",
    "Esse",
    "Cillum",
    "Fugiat",
    "Nulla",
    "Pariatur",
    "Culpa",
    "Officia",
    "Mollit",
    "Sed"
];
const SENTENCES = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    "Nisi ut aliquip ex ea commodo consequat, duis aute irure dolor.",
    "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
    "Deserunt mollit anim id est laborum, sed ut perspiciatis unde omnis.",
    "Iste natus error sit voluptatem accusantium doloremque laudantium.",
    "Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.",
    "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit."
];
// Seed'li rastgelelik: sunucu ve istemci aynı sonucu üretsin (hydration uyumu)
function mulberry32(seed) {
    let a = seed;
    return ()=>{
        a |= 0;
        a = a + 0x6d2b79f5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}
const TOTAL = 1000; // toplam zarf
// Reklam alanları (topbar + 2 banner) — admin panel yapılınca oradan
// açılıp kapatılacak; şimdilik kapalı kabul ediyoruz
const ADS_ENABLED = false;
const MONTHS_TR = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık"
];
// Orantılı yerleşim: zarf boyutu ekran genişliği / sütun sayısından türetilir.
// Monitörde 10'lu, tablette 6'lı, telefonda 3'lü — hepsi ekrana tam oturur.
function makeLayoutMetrics(vw, cols) {
    const colStep = Math.floor((vw - 8) / cols);
    const envW = Math.round(colStep * 0.945); // komşu sütunlar hafif örtüşür
    const envH = Math.round(envW * 0.75); // 4:3
    const rowStep = Math.round(envH * 0.91); // satırlar hafif biner
    return {
        colStep,
        envW,
        envH,
        rowStep,
        jx: colStep * 0.24,
        jy: rowStep * 0.15,
        bottleW: Math.round(colStep * 0.78),
        bottleH: Math.round(colStep * 0.78 * 2.6),
        // Hediye kutusu da zarf/şişe gibi sütun genişliğiyle ölçeklenir;
        // telefonda (3 sütun) bir tık daha iri durur
        giftSize: Math.round(colStep * (cols <= 3 ? 0.95 : 0.83))
    };
}
function buildEnvelopes() {
    const rand = mulberry32(20260726);
    const list = [];
    for(let i = 0; i < TOTAL; i++){
        // Sıralama konumu render'da sütun sayısına göre hesaplanır;
        // burada yalnızca "popülerlik sırası" için kaba satır kullanılır
        const row = Math.floor(i / 10);
        let name = WORDS[Math.floor(rand() * WORDS.length)];
        if (rand() > 0.55) {
            name += " " + WORDS[Math.floor(rand() * WORDS.length)];
        }
        const sentenceCount = 4 + Math.floor(rand() * 3);
        const sentences = [];
        for(let s = 0; s < sentenceCount; s++){
            sentences.push(SENTENCES[Math.floor(rand() * SENTENCES.length)]);
        }
        // Manifest metni en fazla 300 karakter (ürün kuralı)
        let manifest = "";
        for (const s of sentences){
            const next = manifest ? `${manifest} ${s}` : s;
            if (next.length > 300) break;
            manifest = next;
        }
        // Seed dizilimi bozulmasın diye eski palet seçiminin rand() çağrısı korunuyor
        rand();
        // Şans dağılımı — baraj bantlarına göre tasarlandı (oylar e-posta
        // onaylı üyelerden geldiği için barajlar düşük tutuldu):
        // %68 → 0-19 (sade) • %22 → 20-49 (sticker hakkı)
        // %9 → 50-149 (parlak renk hakkı) • %1 → 150+ (şişe hakkı)
        const lr = rand();
        const luck = Math.floor(lr < 0.68 ? lr / 0.68 * 19 : lr < 0.9 ? 20 + (lr - 0.68) / 0.22 * 29 : lr < 0.99 ? 50 + (lr - 0.9) / 0.09 * 99 : 150 + (lr - 0.99) / 0.01 * 550);
        // Tarih için "yaş" değeri (eski zarflar üst id'lerde)
        const t = (99 - row) / 99;
        // Görüntülenme, şans sayısının birkaç katı + rastgele pay
        const views = Math.floor(luck * (2.5 + rand() * 2) + rand() * 150);
        // Eklenme tarihi: üstteki (popüler) zarflar eski, alttakiler yeni
        // (sabit referans tarihinden geriye gidilir — deterministik)
        const daysAgo = Math.floor(4 + t * 160 + rand() * 25);
        const added = new Date(2026, 6, 26);
        added.setDate(added.getDate() - daysAgo);
        const date = added.toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
        list.push({
            luck,
            cheers: 0,
            views,
            ts: added.getTime(),
            date,
            year: added.getFullYear(),
            month: added.getMonth() + 1,
            code: `MF-${String(i + 1).padStart(3, "0")}`,
            id: i,
            name,
            manifest,
            jx: rand(),
            jy: rand(),
            rotation: -28 + rand() * 56,
            zr: Math.floor(rand() * 4),
            color: PALETTE[Math.floor(rand() * PALETTE.length)]
        });
    }
    // ~90 zarfa sticker paletinden süs kondur (manifest türlerinin karşılığı).
    // Süs, kapak ucu hizasında sol/sağ slotlardan birine oturur.
    const STICKER_EMOJIS = [
        "🏡",
        "🚗",
        "✈️",
        "💎",
        "💼",
        "🎓",
        "❤️",
        "👶",
        "💍",
        "🌿",
        "⭐",
        "🦋",
        "🍀",
        "🐞"
    ];
    // Baraj kuralları — barajı geçen herkes hakkını kullanmış kabul edilir
    // (e-posta bildirimi gider: "20/50/150 barajını geçtin!")
    const SLOTS = [
        24,
        76
    ];
    let sk = 0;
    for (const env of list){
        // 20+ şans → sticker
        if (env.luck >= 20) {
            env.sticker = {
                emoji: STICKER_EMOJIS[Math.floor(rand() * STICKER_EMOJIS.length)],
                left: SLOTS[Math.floor(rand() * SLOTS.length)],
                rotation: -25 + rand() * 50
            };
        }
        // 50+ şans → parlak renk (sırayla döner)
        if (env.luck >= 50) {
            env.color = SPECIALS[sk % SPECIALS.length];
            sk++;
        }
        // 150+ şans → manifest şişelenir
        if (env.luck >= 150) {
            env.bottled = true;
        }
    }
    // 10 sponsor zarfı (marka: Petimemama) — duvara serpiştirilir
    const sponsorSet = new Set();
    while(sponsorSet.size < 10){
        const idx = Math.floor(rand() * list.length);
        if (list[idx].bottled) continue;
        sponsorSet.add(idx);
    }
    for (const idx of sponsorSet){
        const env = list[idx];
        env.sponsored = true;
        env.name = "Sürpriz";
        env.color = SPONSOR_COLOR;
        env.sticker = undefined;
        env.manifest = SPONSOR_TEXT;
    }
    // Birkaç manifest gerçekleşmiş: yeşil rozet taşır, şans dilenemez
    const realizedSet = new Set();
    while(realizedSet.size < 8){
        const idx = Math.floor(rand() * list.length);
        if (list[idx].bottled || list[idx].sponsored) continue;
        realizedSet.add(idx);
    }
    for (const idx of realizedSet){
        list[idx].realized = true;
    }
    // 2 şişelenmiş manifest de gerçekleşmiş olsun
    let bottledRealized = 0;
    for (const env of list){
        if (env.bottled && bottledRealized < 2) {
            env.realized = true;
            bottledRealized++;
        }
    }
    // Tebrik sayısı yalnızca gerçekleşen manifestlerde olur; gerçekleşme
    // tarihi de eklenme ile bugün arasında rastgele bir güne düşer
    const REF_TS = new Date(2026, 6, 26).getTime();
    for (const env of list){
        env.cheers = env.realized ? Math.floor(env.luck * 0.6 + rand() * 60) : 0;
        if (env.realized) {
            const span = Math.max(0, REF_TS - env.ts);
            const at = new Date(env.ts + 5 * 86400000 + rand() * span * 0.9);
            env.realizedDate = at.toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        }
    }
    return list;
}
function toBottleData(env, rot) {
    return {
        code: env.code,
        name: env.name,
        date: env.date,
        manifest: env.manifest,
        views: env.views,
        luck: env.luck,
        rot,
        sticker: env.sticker?.emoji ?? "🦋",
        ribbon: env.id % RIBBON_GRADS.length,
        realized: !!env.realized,
        cheers: env.cheers
    };
}
// El yapımı cam şişe: mantar, ip, içinde rulo not, dipte kum, cam
// parlamaları ve gövdesinde kağıt etiket (içeriği dışarıdan gelir)
function BottleVisual({ noteOut = false, label, sticker = "🦋", ribbon = 0, sheenDelay = 0, realized = false, bandFs = 10 }) {
    const rg = RIBBON_GRADS[ribbon % RIBBON_GRADS.length];
    const ribbonFill = `url(#ribbonGrad${ribbon % RIBBON_GRADS.length})`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative h-full w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                viewBox: "0 0 200 520",
                className: "h-full w-full overflow-visible",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                id: "glass",
                                x1: "0",
                                y1: "0",
                                x2: "1",
                                y2: "0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                        offset: "0",
                                        stopColor: "#bfe4ee"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 443,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                        offset: "0.45",
                                        stopColor: "#8ec7d8"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 444,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                        offset: "0.7",
                                        stopColor: "#a9d8e5"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 445,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                        offset: "1",
                                        stopColor: "#7db8cb"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 446,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 442,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                id: "cork",
                                x1: "0",
                                y1: "0",
                                x2: "0",
                                y2: "1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                        offset: "0",
                                        stopColor: "#c99a66"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 449,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                        offset: "1",
                                        stopColor: "#8a5a2f"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 450,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 448,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                id: "sheenGrad",
                                x1: "0",
                                y1: "0",
                                x2: "1",
                                y2: "0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                        offset: "0",
                                        stopColor: "#ffffff",
                                        stopOpacity: "0"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 453,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                        offset: "0.5",
                                        stopColor: "#ffffff",
                                        stopOpacity: "0.55"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 454,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                        offset: "1",
                                        stopColor: "#ffffff",
                                        stopOpacity: "0"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 455,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 452,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("clipPath", {
                                id: "bottleClip",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M82 60 L82 140 C82 162 58 172 50 192 C42 210 40 222 40 242 L40 458 C40 492 62 502 100 502 C138 502 160 492 160 458 L160 242 C160 222 158 210 150 192 C142 172 118 162 118 140 L118 60 Z"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 458,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 457,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                id: `ribbonGrad${ribbon % RIBBON_GRADS.length}`,
                                x1: "0",
                                y1: "0",
                                x2: "1",
                                y2: "1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                        offset: "0",
                                        stopColor: rg[0]
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 467,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                        offset: "0.55",
                                        stopColor: rg[1]
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 468,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                        offset: "1",
                                        stopColor: rg[2]
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 469,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 460,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 441,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: "M82 60 L82 140 C82 162 58 172 50 192 C42 210 40 222 40 242 L40 458 C40 492 62 502 100 502 C138 502 160 492 160 458 L160 242 C160 222 158 210 150 192 C142 172 118 162 118 140 L118 60 Z",
                        fill: "url(#glass)",
                        fillOpacity: "0.5",
                        stroke: "#5d98ab",
                        strokeOpacity: "0.55",
                        strokeWidth: "3"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 474,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                        transform: "rotate(-11 100 335)",
                        style: {
                            opacity: noteOut ? 0 : 1,
                            transition: "opacity 300ms"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                    id: "paperRoll",
                                    x1: "0",
                                    y1: "0",
                                    x2: "1",
                                    y2: "0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                            offset: "0",
                                            stopColor: "#e3cf9f"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 489,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                            offset: "0.38",
                                            stopColor: "#f9efd0"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 490,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                            offset: "0.62",
                                            stopColor: "#f3e6be"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 491,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                            offset: "1",
                                            stopColor: "#dcc794"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 492,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 488,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 487,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                x: "77",
                                y: "196",
                                width: "46",
                                height: "274",
                                rx: "21",
                                fill: "url(#paperRoll)",
                                stroke: "#cdb583",
                                strokeWidth: "1.5"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 496,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M121 206 C126 270 119 380 117 460",
                                stroke: "#cdb583",
                                strokeWidth: "1.5",
                                fill: "none"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 507,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ellipse", {
                                cx: "100",
                                cy: "198",
                                rx: "23",
                                ry: "8",
                                fill: "#f2e4ba",
                                stroke: "#cdb583",
                                strokeWidth: "1.5"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 514,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ellipse", {
                                cx: "100",
                                cy: "198",
                                rx: "12",
                                ry: "4.5",
                                fill: "#e4d09e",
                                stroke: "#c4ab77",
                                strokeWidth: "1.2"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 515,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ellipse", {
                                cx: "100",
                                cy: "198",
                                rx: "4",
                                ry: "1.8",
                                fill: "#d4bd85"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 516,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ellipse", {
                                cx: "100",
                                cy: "468",
                                rx: "21",
                                ry: "6.5",
                                fill: "#d8c290"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 518,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 483,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: "52",
                        y: "215",
                        width: "13",
                        height: "240",
                        rx: "6.5",
                        fill: "#ffffff",
                        opacity: "0.45"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 521,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                        x: "86",
                        y: "70",
                        width: "8",
                        height: "70",
                        rx: "4",
                        fill: "#ffffff",
                        opacity: "0.5"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 522,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                        clipPath: "url(#bottleClip)",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                            className: "bottle-sheen",
                            x: "0",
                            y: "0",
                            width: "64",
                            height: "520",
                            fill: "url(#sheenGrad)",
                            style: {
                                animationDelay: `${sheenDelay}s`
                            }
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 525,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 524,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ellipse", {
                        cx: "100",
                        cy: "60",
                        rx: "20",
                        ry: "6",
                        fill: "#cfeaf2",
                        stroke: "#5d98ab",
                        strokeOpacity: "0.5",
                        strokeWidth: "2"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 536,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                        style: {
                            transformBox: "fill-box",
                            transformOrigin: "center",
                            transform: noteOut ? "translate(34px, -74px) rotate(38deg)" : "none",
                            opacity: noteOut ? 0 : 1,
                            transition: "transform 500ms ease, opacity 500ms ease"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                x: "80",
                                y: "16",
                                width: "40",
                                height: "48",
                                rx: "9",
                                fill: "url(#cork)"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 558,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ellipse", {
                                cx: "100",
                                cy: "18",
                                rx: "19",
                                ry: "5",
                                fill: "#a97b47"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 559,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 547,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                        strokeLinejoin: "round",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                x: "76",
                                y: "118",
                                width: "48",
                                height: "16",
                                rx: "5",
                                fill: ribbonFill
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 565,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M93 130 L70 172 L79 164 L86 174 L104 136 Z",
                                fill: ribbonFill
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 567,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M107 130 L130 172 L121 164 L114 174 L96 136 Z",
                                fill: ribbonFill
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 568,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M100 126 C80 98 46 104 54 128 C60 150 88 144 100 126 Z",
                                fill: ribbonFill
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 570,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M100 126 C120 98 154 104 146 128 C140 150 112 144 100 126 Z",
                                fill: ribbonFill
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 574,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M97 124 C84 110 66 112 62 124",
                                stroke: "rgba(255,255,255,0.28)",
                                strokeWidth: "3",
                                fill: "none",
                                strokeLinecap: "round"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 579,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                d: "M103 124 C116 110 134 112 138 124",
                                stroke: "rgba(255,255,255,0.28)",
                                strokeWidth: "3",
                                fill: "none",
                                strokeLinecap: "round"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 586,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                x: "91",
                                y: "117",
                                width: "18",
                                height: "17",
                                rx: "5",
                                fill: "#ffffff",
                                stroke: "rgba(0,0,0,0.15)",
                                strokeWidth: "1"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 594,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 563,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                        x: "60",
                        y: "240",
                        fontSize: "44",
                        textAnchor: "middle",
                        dominantBaseline: "central",
                        transform: "rotate(-14 60 240)",
                        children: sticker
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 606,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 440,
                columnNumber: 7
            }, this),
            label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute left-[19.5%] top-[52%] w-[61%] rounded-[3px] border-y border-[#dcc7a0] px-1.5 py-1.5 shadow-[0_3px_8px_rgba(0,0,0,0.15)]",
                style: {
                    background: "linear-gradient(90deg, rgba(90,70,30,0.22), rgba(90,70,30,0.04) 14%, rgba(90,70,30,0) 30%, rgba(90,70,30,0) 70%, rgba(90,70,30,0.05) 86%, rgba(90,70,30,0.24)), linear-gradient(165deg,#faf1dd,#efdfbc)"
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 620,
                columnNumber: 9
            }, this),
            realized && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute left-[19.5%] top-[72%] w-[61%] rounded-[3px] border-y border-emerald-700/30 text-center font-bold uppercase text-white shadow-[0_2px_6px_rgba(0,0,0,0.2)]",
                style: {
                    background: "linear-gradient(90deg, rgba(0,0,0,0.3), rgba(0,0,0,0.06) 14%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.08) 86%, rgba(0,0,0,0.32)), linear-gradient(165deg, #34d399, #059669)",
                    fontSize: bandFs,
                    letterSpacing: "0.1em",
                    padding: `${bandFs * 0.35}px 0`
                },
                children: "Gerçekleşti"
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 633,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 439,
        columnNumber: 5
    }, this);
}
function BottlePopup({ bottle, origin, onClose }) {
    const [stage, setStage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("origin");
    // Notun yolculuğu: şişenin içinde → boğazda (rulo) → ağzın üstünde açık
    const [notePhase, setNotePhase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("in");
    const closingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [luck, setLuck] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(bottle.luck);
    const [wished, setWished] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const geo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const vw = document.documentElement.clientWidth;
        const vh = document.documentElement.clientHeight;
        const popW = Math.min(window.innerWidth * 0.44, 235);
        return {
            s: origin.w / popW,
            dx: origin.cx - vw / 2,
            dy: origin.cy - vh / 2
        };
    }, [
        origin
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const raf = requestAnimationFrame(()=>requestAnimationFrame(()=>setStage("center")));
        // Varış → şişe yana yatar + mantar fırlar → not ağızdan kıvrılarak
        // çıkar → ekran ortasında açılır
        const t1 = setTimeout(()=>setStage("open"), 340);
        const t2 = setTimeout(()=>setNotePhase("neck"), 700);
        const t3 = setTimeout(()=>setNotePhase("open"), 1010);
        return ()=>{
            cancelAnimationFrame(raf);
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);
    const close = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (closingRef.current) return;
        closingRef.current = true;
        setNotePhase("neck"); // not kıvrılıp ağza döner
        setTimeout(()=>setNotePhase("in"), 330); // içeri girer
        setTimeout(()=>setStage("center"), 710); // şişe doğrulur, mantar kapanır
        setTimeout(()=>setStage("origin"), 900); // şişe yerine uçar
        setTimeout(onClose, 1300);
    }, [
        onClose
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const onKey = (e)=>{
            if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", onKey);
        return ()=>window.removeEventListener("keydown", onKey);
    }, [
        close
    ]);
    const atCenter = stage !== "origin";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[2000]",
        onClick: close,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300",
                style: {
                    opacity: atCenter ? 1 : 0
                }
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 716,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed left-1/2 top-1/2 w-[min(44vw,235px)]",
                style: {
                    transform: atCenter ? "translate(-50%, -46%)" : `translate(-50%, -46%) translate(${geo.dx}px, ${geo.dy}px) rotate(${bottle.rot}deg) scale(${geo.s})`,
                    transition: "transform 300ms cubic-bezier(0.3, 0.85, 0.3, 1)"
                },
                onClick: (e)=>e.stopPropagation(),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            transform: stage === "open" ? "translate(-170px, -240px) rotate(105deg)" : "none",
                            transition: "transform 490ms cubic-bezier(0.3, 0.8, 0.3, 1)"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "aspect-[200/520] w-full",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BottleVisual, {
                                noteOut: notePhase !== "in",
                                sticker: bottle.sticker,
                                ribbon: bottle.ribbon,
                                realized: bottle.realized,
                                bandFs: 12,
                                label: stage === "open" ? undefined : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col items-center gap-[3px]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start justify-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col items-center gap-[2px]",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[11px] leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]",
                                                            children: "⭐"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 752,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[12px] leading-none font-semibold text-[#8a6d33]",
                                                            children: luck.toLocaleString("tr-TR")
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 755,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 751,
                                                    columnNumber: 23
                                                }, this),
                                                bottle.realized && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col items-center gap-[2px]",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[11px] leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]",
                                                            children: "👏"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 761,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-[12px] leading-none font-semibold text-[#8a6d33]",
                                                            children: bottle.cheers.toLocaleString("tr-TR")
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 764,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 760,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 750,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "truncate font-hand text-[17px] leading-none font-semibold text-[#6b5426]",
                                            children: bottle.name
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 770,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 749,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 741,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 740,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 731,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute left-1/2 top-[46%] z-30 w-[min(88vw,430px)]",
                        style: {
                            transformOrigin: "center center",
                            transform: notePhase === "open" ? "translate(-50%, calc(-50% + 85px)) rotate(0deg) scale(1)" : notePhase === "neck" ? "translate(calc(-50% + 95px), calc(-50% - 165px)) rotate(75deg) scale(0.17)" : "translate(calc(-50% + 57px), calc(-50% - 179px)) rotate(105deg) scale(0.13)",
                            opacity: notePhase === "in" ? 0 : 1,
                            transition: "transform 370ms cubic-bezier(0.3, 0.8, 0.3, 1), opacity 200ms ease"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-h-[58vh] overflow-y-auto rounded-[10px] border border-[#e2cd9f] bg-[linear-gradient(160deg,#fdf3dd,#f1e0bd)] px-8 py-7 shadow-[0_20px_50px_rgba(0,0,0,0.4)]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[11px] font-semibold uppercase tracking-[0.25em] text-[#a3813f]",
                                            children: "🍾 Şişedeki Not"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 799,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-mono text-[11px] tracking-wider text-[#a3813f]",
                                            children: bottle.code
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 802,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 798,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-2 font-hand text-3xl text-[#5c4718]",
                                    children: bottle.name
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 806,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-4 text-[15px] leading-relaxed text-[#5f4d26]",
                                    children: bottle.manifest
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 809,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-6 text-[11px] text-[#a3813f]",
                                    children: [
                                        bottle.date,
                                        " tarihinde denize bırakıldı"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 812,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#dcc7a0] pt-3 text-[12px] font-medium text-[#8a6d33]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                "✉ ",
                                                bottle.views.toLocaleString("tr-TR"),
                                                " kişi notu okudu"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 817,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                "⭐ ",
                                                luck.toLocaleString("tr-TR"),
                                                " kişi şans diledi"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 818,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>{
                                                if (wished) return;
                                                setWished(true);
                                                setLuck((n)=>n + 1);
                                            },
                                            className: `cursor-pointer rounded-full border px-3 py-1 text-[12px] font-semibold transition-all ${wished ? "border-amber-400 bg-amber-100 text-amber-700" : "border-[#c9b384] bg-white/70 text-[#6b5426] hover:border-amber-400 hover:text-amber-700"}`,
                                            children: wished ? "⭐ Şans dilendi" : "☆ Şans dile"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 819,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 816,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 797,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 782,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: close,
                        className: "absolute -right-14 top-[10%] z-40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-xl text-neutral-600 shadow-lg transition-all hover:scale-110",
                        style: {
                            opacity: stage === "open" ? 1 : 0
                        },
                        "aria-label": "Kapat",
                        children: "×"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 838,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 720,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 715,
        columnNumber: 5
    }, this);
}
function EnvelopeCard({ envelope, pos, envW, onOpen, hidden, offset, highlighted }) {
    // Sponsor zarfı diğerlerinden belirgin şekilde büyük gösterilir
    const w = envelope.sponsored ? envW * 1.35 : envW;
    // Zarf içi yazı/süs boyutları zarf genişliğiyle orantılı
    const fs = w / 172;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        id: `env-${envelope.id}`,
        className: "env-wrap absolute",
        style: {
            width: w,
            left: pos.x - (w - envW) / 2,
            top: pos.y - (w - envW) * 0.75 / 2,
            zIndex: highlighted ? 1460 : pos.z,
            visibility: hidden ? "hidden" : undefined,
            // İnen zarfa yer açma / geri dönme — organik esneme
            transform: offset ? `translate(${offset.x}px, ${offset.y}px)` : "none",
            transition: "transform 300ms cubic-bezier(0.3, 0.8, 0.35, 1)"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            type: "button",
            onClick: (e)=>{
                const el = e.currentTarget;
                // Merkez döndürülmüş kutudan (rotasyondan etkilenmez), boyutlar ise
                // layout'tan alınır — döndürülmüş kutunun boyutu gerçeğinden büyüktür
                const r = el.getBoundingClientRect();
                onOpen(envelope, {
                    cx: r.left + r.width / 2,
                    cy: r.top + r.height / 2,
                    w: el.offsetWidth,
                    h: el.offsetHeight
                });
            },
            style: {
                rotate: `${envelope.rotation}deg`,
                ...envelope.color.bodyBg ? {
                    background: envelope.color.bodyBg
                } : {
                    backgroundColor: envelope.color.base
                }
            },
            className: `relative block w-full aspect-[4/3] cursor-pointer touch-manipulation rounded-[3px] transition-all duration-200 hover:scale-135 hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)] ${envelope.color.gloss ? "shadow-[0_4px_14px_rgba(0,0,0,0.35)]" : "shadow-[0_2px_6px_rgba(0,0,0,0.16)]"} ${highlighted ? "env-glow" : ""}`,
            "aria-label": `${envelope.name} — manifesti oku`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "absolute inset-x-0 top-0 h-[56%]",
                    style: {
                        clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                        ...envelope.color.flapBg ? {
                            background: envelope.color.flapBg
                        } : {
                            backgroundColor: envelope.color.dark
                        }
                    }
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 918,
                    columnNumber: 9
                }, this),
                envelope.color.gloss && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "pointer-events-none absolute inset-0 rounded-[3px]",
                    style: {
                        background: "linear-gradient(115deg, rgba(255,255,255,0.25) 8%, rgba(255,255,255,0.06) 30%, transparent 46%)"
                    }
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 929,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "absolute inset-x-0 bottom-[4%] truncate px-1 text-center font-hand leading-none font-semibold",
                    style: {
                        color: envelope.color.ink,
                        fontSize: Math.max(14.5, 18 * fs)
                    },
                    children: envelope.name
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 938,
                    columnNumber: 9
                }, this),
                envelope.realized && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 font-bold uppercase text-white shadow-md",
                    style: {
                        top: "30%",
                        rotate: "-4deg",
                        fontSize: Math.max(7.5, 8.5 * fs),
                        letterSpacing: "0.1em",
                        padding: `${2.5 * fs}px ${8 * fs}px`
                    },
                    children: "Gerçekleşti"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 946,
                    columnNumber: 11
                }, this),
                envelope.sponsored && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: "/petimemama.png",
                            alt: "Petimemama",
                            draggable: false,
                            className: "pointer-events-none absolute left-1/2 top-[71%] w-[62%] -translate-x-1/2 -translate-y-1/2 select-none object-contain"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 963,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "absolute left-1/2 -translate-x-1/2 rounded-full bg-[#f97316] font-bold uppercase text-white shadow-md",
                            style: {
                                top: "44%",
                                rotate: "-4deg",
                                fontSize: 8.5 * fs,
                                letterSpacing: "0.12em",
                                padding: `${2.5 * fs}px ${8 * fs}px`
                            },
                            children: "Sponsorlu"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 969,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true),
                !envelope.sponsored && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "pointer-events-none absolute inset-x-0 bottom-[23%] flex items-start justify-center leading-none",
                    style: {
                        gap: 10 * fs
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex flex-col items-center gap-[1px]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "opacity-70 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]",
                                    style: {
                                        fontSize: Math.max(10, 9 * fs)
                                    },
                                    children: "⭐"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 992,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium opacity-80",
                                    style: {
                                        color: envelope.color.ink,
                                        fontSize: Math.max(11.5, 10 * fs)
                                    },
                                    children: envelope.luck
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 998,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 991,
                            columnNumber: 13
                        }, this),
                        envelope.realized && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex flex-col items-center gap-[1px]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "opacity-70 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]",
                                    style: {
                                        fontSize: Math.max(10, 9 * fs)
                                    },
                                    children: "👏"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1010,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium opacity-80",
                                    style: {
                                        color: envelope.color.ink,
                                        fontSize: Math.max(11.5, 10 * fs)
                                    },
                                    children: envelope.cheers
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1016,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1009,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 987,
                    columnNumber: 11
                }, this),
                envelope.sticker && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "pointer-events-none absolute top-[56%] -translate-x-1/2 -translate-y-full leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]",
                    style: {
                        left: `${envelope.sticker.left}%`,
                        rotate: `${envelope.sticker.rotation}deg`,
                        fontSize: 28 * fs
                    },
                    children: envelope.sticker.emoji
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 1031,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 890,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 876,
        columnNumber: 5
    }, this);
}
// ── Manifest Hediye Kutusu — 250+ şans ödülü ─────────────────────────────
// 250 şans barajını geçen manifest, duvarda tepeden görünen kurdeleli bir
// hediye kutusunda sergilenir. Tıklayınca zarf ve şişe gibi ekran ortasına
// uçar, kapağı yana savrulur ve içinden manifest kartı yükselir.
const GIFT_ENV = {
    name: "Magna Aliqua",
    code: "MF-777",
    luck: 268,
    date: "3 Mayıs 2026",
    manifest: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt."
};
// Karton kalınlığı katmanının clip yolu: gövde + sağ/alt taşma, uçları 45°
// pahlı. Pah köşeleri küçük quadratic eğrilerle hafifçe yuvarlatılır.
// w/h gövde boyutu, u ölçü birimi (taşma 8u, pah 13u, yuvarlatma ~3u).
function giftDepthClip(w, h, u) {
    const W = w + 8 * u;
    const H = h + 8 * u;
    const C = 13 * u;
    const r = 3 * u;
    const q = 2.1 * u;
    return `path('M 0 0 L ${W - C - r} 0 Q ${W - C} 0 ${W - C + q} ${q} L ${W - q} ${C - q} Q ${W} ${C} ${W} ${C + r} L ${W} ${H} L ${C + q} ${H} Q ${C} ${H} ${C - q} ${H - q} L ${q} ${H - C + q} Q 0 ${H - C} 0 ${H - C - r} Z')`;
}
// Tepeden hediye kutusu — dikey dikdörtgen, kalp desenli kırmızı ambalaj,
// beyaz saten kurdele sol üstte kesişir ve fiyonkla bağlanır. Sağ kenardan
// görünen koyu yan yüz + ofsetli gölge, hafif açıyla bakılan 3D hissi verir.
// size = kutunun genişliği; yükseklik 1.32 katıdır.
function GiftBoxVisual({ size, name, luck, depth = true, glow = false, realized = false, cheers = 0 }) {
    const u = size / 150;
    const h = size * 1.32;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        style: {
            width: size,
            height: h
        },
        children: [
            glow && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "pointer-events-none absolute",
                    style: {
                        inset: -22 * u
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "gift-rays absolute inset-0",
                        style: {
                            background: "repeating-conic-gradient(from 0deg, rgba(255,178,56,0) 0deg, rgba(255,178,56,0.5) 4deg, rgba(255,178,56,0) 8deg 30deg)",
                            WebkitMaskImage: "radial-gradient(closest-side, rgba(0,0,0,1) 40%, rgba(0,0,0,0.4) 60%, transparent 72%)",
                            maskImage: "radial-gradient(closest-side, rgba(0,0,0,1) 40%, rgba(0,0,0,0.4) 60%, transparent 72%)"
                        }
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1108,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 1104,
                    columnNumber: 11
                }, this)
            }, void 0, false),
            depth && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute",
                style: {
                    top: 0,
                    left: 0,
                    right: -8 * u,
                    bottom: -8 * u,
                    borderRadius: 5 * u,
                    background: "linear-gradient(135deg, #a3865a, #7c6440)",
                    clipPath: giftDepthClip(size, h, u)
                }
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1126,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 overflow-hidden",
                style: {
                    borderRadius: 5 * u,
                    background: "linear-gradient(135deg, #dcc194, #c6a575 70%, #b8955f)",
                    boxShadow: `${6 * u}px ${9 * u}px ${18 * u}px rgba(0,0,0,0.3)`
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-y-0",
                        style: {
                            left: "38%",
                            width: 17 * u,
                            transform: "translateX(-50%)",
                            background: "linear-gradient(135deg, #9e2439, #5c0f1d 55%, #7b1526)"
                        }
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1151,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-x-0",
                        style: {
                            top: "26%",
                            height: 17 * u,
                            background: "linear-gradient(135deg, #9e2439, #5c0f1d 55%, #7b1526)"
                        }
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1161,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0",
                        style: {
                            background: "linear-gradient(125deg, rgba(255,255,255,0.22), transparent 55%)"
                        }
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1171,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1140,
                columnNumber: 7
            }, this),
            glow && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pointer-events-none absolute inset-0",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "gift-leak absolute inset-0",
                    style: {
                        borderRadius: 5 * u,
                        boxShadow: `0 0 ${9 * u}px ${1.5 * u}px rgba(255,186,64,0.95), 0 0 ${26 * u}px ${10 * u}px rgba(255,170,45,0.5)`
                    }
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 1183,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1182,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                viewBox: "0 0 100 90",
                className: "absolute",
                style: {
                    left: "38%",
                    top: "26%",
                    width: 92 * u,
                    transform: "translate(-50%, -44%)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                            id: "giftBowGrad",
                            x1: "0",
                            y1: "0",
                            x2: "1",
                            y2: "1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                    offset: "0",
                                    stopColor: "#9e2439"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1206,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                    offset: "0.55",
                                    stopColor: "#5c0f1d"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1207,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                    offset: "1",
                                    stopColor: "#7b1526"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1208,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1205,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1204,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: "M50 46 C40 60 28 68 18 82 L30 78 C38 66 46 58 50 46 Z",
                        fill: "url(#giftBowGrad)"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1212,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: "M50 46 C58 58 70 64 80 74 L70 60 C62 54 54 50 50 46 Z",
                        fill: "url(#giftBowGrad)"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1216,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: "M52 44 C50 28 56 16 50 4 C64 12 60 30 58 44 Z",
                        fill: "url(#giftBowGrad)"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1221,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: "M50 46 C26 16 4 26 10 44 C15 58 36 56 50 46 Z",
                        fill: "url(#giftBowGrad)"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1226,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        d: "M50 46 C70 14 94 22 90 40 C86 55 64 54 50 46 Z",
                        fill: "url(#giftBowGrad)"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1230,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                        cx: "50",
                        cy: "45",
                        r: "6.5",
                        fill: "url(#giftBowGrad)"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1234,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1194,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pointer-events-none absolute flex flex-col items-center rounded-[3px] border-y border-[#dcc7a0] shadow-[0_3px_8px_rgba(0,0,0,0.15)]",
                style: {
                    right: -25 * u,
                    bottom: 40 * u,
                    width: 116 * u,
                    gap: 3 * u,
                    padding: `${7 * u}px ${8 * u}px`,
                    background: "linear-gradient(90deg, rgba(90,70,30,0.22), rgba(90,70,30,0.04) 14%, rgba(90,70,30,0) 30%, rgba(90,70,30,0) 70%, rgba(90,70,30,0.05) 86%, rgba(90,70,30,0.24)), linear-gradient(165deg,#faf1dd,#efdfbc)",
                    transform: "rotate(-90deg)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex items-start justify-center",
                        style: {
                            gap: 8 * u
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex flex-col items-center gap-[2px]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]",
                                        style: {
                                            fontSize: Math.max(9, 10 * u)
                                        },
                                        children: "⭐"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1256,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-semibold leading-none",
                                        style: {
                                            color: "#8a6d33",
                                            fontSize: Math.max(10, 11 * u)
                                        },
                                        children: luck.toLocaleString("tr-TR")
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1262,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1255,
                                columnNumber: 11
                            }, this),
                            realized && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex flex-col items-center gap-[2px]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]",
                                        style: {
                                            fontSize: Math.max(9, 10 * u)
                                        },
                                        children: "👏"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1271,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-semibold leading-none",
                                        style: {
                                            color: "#8a6d33",
                                            fontSize: Math.max(10, 11 * u)
                                        },
                                        children: cheers.toLocaleString("tr-TR")
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1277,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1270,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1251,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "w-full truncate text-center font-hand font-semibold leading-none",
                        style: {
                            color: "#6b5426",
                            fontSize: Math.max(12, 15 * u)
                        },
                        children: name
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 1286,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1238,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 1100,
        columnNumber: 5
    }, this);
}
// Kutu popup'ı — zarf/şişe akışıyla aynı: duvardan ortaya uçar, kapağı
// sol üste savrulur, manifest kartı kutunun içinden yükselir
function GiftPopup({ origin, onClose }) {
    const [stage, setStage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("origin");
    // Kapak uçarken kartın üstünde, kart yükseldikten sonra altında kalır
    const [lidZ, setLidZ] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(30);
    const [luck, setLuck] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(GIFT_ENV.luck);
    const [wished, setWished] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const closingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const geo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const vw = document.documentElement.clientWidth;
        const vh = document.documentElement.clientHeight;
        const popW = Math.min(window.innerWidth * 0.92, 340);
        const k = popW / 340;
        // Kutu (340x450 birim) konteynerin alt kısmında: merkez farkı 90 birim.
        // Dönüş konteyner merkezinde olduğundan ofset 10°'lik açıyla döndürülerek
        // telafi edilir — kutu duvardaki pozuna birebir oturur, "tık" olmaz
        const off = origin.w / 340 * 90;
        const rad = 10 * Math.PI / 180;
        return {
            k,
            s: origin.w / popW,
            dx: origin.cx - vw / 2 + off * Math.sin(rad),
            dy: origin.cy - vh / 2 - off * Math.cos(rad)
        };
    }, [
        origin
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const raf = requestAnimationFrame(()=>requestAnimationFrame(()=>setStage("center")));
        // Varış ~300ms → kapak savrulur → kart 200ms gecikmeyle yükselir
        const t1 = setTimeout(()=>setStage("open"), 340);
        const t2 = setTimeout(()=>setLidZ(5), 700);
        return ()=>{
            cancelAnimationFrame(raf);
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);
    const close = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (closingRef.current) return;
        closingRef.current = true;
        setStage("center"); // kart kutuya iner, kapak geri gelir
        setTimeout(()=>setLidZ(30), 280);
        // Kapak tam oturduktan (120+420ms) sonra uçuş başlar — kapanış
        // uçuş sırasında bitmesin, yerine otururken kapak oynamasın
        setTimeout(()=>setStage("origin"), 560);
        setTimeout(onClose, 890);
    }, [
        onClose
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const onKey = (e)=>{
            if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", onKey);
        return ()=>window.removeEventListener("keydown", onKey);
    }, [
        close
    ]);
    const atCenter = stage !== "origin";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[2000]",
        onClick: close,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200",
                style: {
                    opacity: atCenter ? 1 : 0
                }
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1368,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed left-1/2 top-1/2 w-[min(92vw,340px)]",
                style: {
                    transform: atCenter ? "translate(-50%, -50%)" : `translate(-50%, -50%) translate(${geo.dx}px, ${geo.dy}px) rotate(10deg) scale(${geo.s})`,
                    transition: "transform 300ms cubic-bezier(0.3, 0.85, 0.3, 1)"
                },
                onClick: (e)=>e.stopPropagation(),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative",
                    style: {
                        height: 630 * geo.k
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "pointer-events-none absolute left-1/2 -translate-x-1/2 transition-opacity duration-500",
                            style: {
                                bottom: -40 * geo.k,
                                width: 560 * geo.k,
                                height: 560 * geo.k,
                                opacity: stage === "open" ? 1 : 0,
                                background: "radial-gradient(circle, rgba(255,233,168,0.8) 0%, rgba(255,215,106,0.3) 55%, transparent 75%)"
                            }
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1384,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute left-1/2 z-10 w-[88%]",
                            style: {
                                bottom: 40 * geo.k,
                                transformOrigin: "bottom center",
                                transform: stage === "open" ? `translateX(-50%) translateY(${-60 * geo.k}px) scale(1)` : "translateX(-50%) translateY(0) scale(0.45)",
                                transition: `transform 320ms cubic-bezier(0.25, 0.9, 0.3, 1) ${stage === "open" ? "200ms" : "0ms"}`
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "max-h-[58vh] overflow-y-auto rounded-[4px] bg-[#fffdf5] px-7 py-6 shadow-[0_16px_44px_rgba(0,0,0,0.35)] max-[520px]:px-5 max-[520px]:py-5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-hand text-[26px] text-neutral-800 max-[520px]:text-[22px]",
                                        children: GIFT_ENV.name
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1412,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-1 flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400 max-[520px]:text-[9.5px]",
                                                children: "Manifest"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1416,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "font-mono text-[11px] tracking-wider text-neutral-400 max-[520px]:text-[9.5px]",
                                                children: GIFT_ENV.code
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1419,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1415,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-4 text-[14px] leading-relaxed text-neutral-700 max-[520px]:text-[13px]",
                                        children: GIFT_ENV.manifest
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1423,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-5 text-[11px] text-neutral-400",
                                        children: [
                                            GIFT_ENV.date,
                                            " tarihinde eklendi"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1426,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 pt-3 text-[12px] font-medium text-neutral-500",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "⭐ ",
                                                    luck.toLocaleString("tr-TR"),
                                                    " kişi şans diledi"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1430,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>{
                                                    if (wished) return;
                                                    setWished(true);
                                                    setLuck((n)=>n + 1);
                                                },
                                                className: `cursor-pointer rounded-full border px-3 py-1 text-[12px] font-semibold transition-all ${wished ? "border-amber-400 bg-amber-100 text-amber-700" : "border-neutral-300 bg-white/80 text-neutral-600 hover:border-amber-400 hover:text-amber-700"}`,
                                                children: wished ? "⭐ Şans dilendi" : "☆ Şans dile"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1431,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1429,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1411,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1397,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "pointer-events-none absolute inset-x-0 bottom-0 transition-opacity duration-500",
                            style: {
                                height: 450 * geo.k,
                                opacity: stage === "open" ? 0 : 1
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute",
                                style: {
                                    inset: -22 * 340 * geo.k / 150
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "gift-rays absolute inset-0",
                                    style: {
                                        background: "repeating-conic-gradient(from 0deg, rgba(255,178,56,0) 0deg, rgba(255,178,56,0.5) 4deg, rgba(255,178,56,0) 8deg 30deg)",
                                        WebkitMaskImage: "radial-gradient(closest-side, rgba(0,0,0,1) 40%, rgba(0,0,0,0.4) 60%, transparent 72%)",
                                        maskImage: "radial-gradient(closest-side, rgba(0,0,0,1) 40%, rgba(0,0,0,0.4) 60%, transparent 72%)"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1464,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1460,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1453,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "pointer-events-none absolute inset-x-0 bottom-0 transition-opacity duration-500",
                            style: {
                                height: 450 * geo.k,
                                zIndex: 6,
                                opacity: stage === "open" ? 0 : 1
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "gift-leak absolute inset-0",
                                style: {
                                    borderRadius: 5 * 340 * geo.k / 150,
                                    boxShadow: `0 0 ${9 * 340 * geo.k / 150}px ${1.5 * 340 * geo.k / 150}px rgba(255,186,64,0.95), 0 0 ${26 * 340 * geo.k / 150}px ${10 * 340 * geo.k / 150}px rgba(255,170,45,0.5)`
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1488,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1480,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute",
                            style: {
                                left: 0,
                                right: -8 * 340 * geo.k / 150,
                                bottom: -8 * 340 * geo.k / 150,
                                height: 450 * geo.k + 8 * 340 * geo.k / 150,
                                borderRadius: 5 * 340 * geo.k / 150,
                                background: "linear-gradient(135deg, #a3865a, #7c6440)",
                                clipPath: giftDepthClip(340 * geo.k, 450 * geo.k, 340 * geo.k / 150)
                            }
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1499,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-x-0 bottom-0 z-[5]",
                            style: {
                                height: 450 * geo.k,
                                borderRadius: 5 * 340 * geo.k / 150,
                                background: "#a98b5c",
                                boxShadow: "0 18px 50px rgba(0,0,0,0.35)"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute rounded-[12px]",
                                    style: {
                                        inset: 14 * geo.k,
                                        background: "#4a3a22"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1526,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute rounded-[12px] transition-opacity duration-500",
                                    style: {
                                        inset: 14 * geo.k,
                                        opacity: stage === "open" ? 1 : 0,
                                        background: "radial-gradient(circle at 50% 45%, #ffe9a0 0%, #d89a52 45%, rgba(74,58,34,0) 85%)"
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1530,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1517,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute bottom-0 left-0",
                            style: {
                                zIndex: lidZ,
                                transform: stage === "open" ? "translate(-72%, -48%) rotate(-15deg)" : "none",
                                transition: `transform 420ms cubic-bezier(0.3, 1.15, 0.4, 1) ${stage === "open" ? "0ms" : "120ms"}`
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(GiftBoxVisual, {
                                size: 340 * geo.k,
                                name: GIFT_ENV.name,
                                luck: luck,
                                depth: false
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1555,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1542,
                            columnNumber: 11
                        }, this),
                        stage === "open" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "gift-spark pointer-events-none absolute left-[26%] top-[38%] text-[14px]",
                                    style: {
                                        animationDelay: "0ms"
                                    },
                                    children: "✨"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1566,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "gift-spark pointer-events-none absolute left-[64%] top-[34%] text-[12px]",
                                    style: {
                                        animationDelay: "800ms"
                                    },
                                    children: "⭐"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1572,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "gift-spark pointer-events-none absolute left-[46%] top-[30%] text-[11px]",
                                    style: {
                                        animationDelay: "1500ms"
                                    },
                                    children: "✦"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1578,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: close,
                            "aria-label": "Kapat",
                            className: "absolute -right-2 z-40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-xl text-neutral-600 shadow-lg transition-all hover:scale-110 max-[520px]:h-8 max-[520px]:w-8 max-[520px]:text-base",
                            style: {
                                top: 120 * geo.k,
                                opacity: atCenter ? 1 : 0
                            },
                            children: "×"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1587,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 1382,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1372,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 1367,
        columnNumber: 5
    }, this);
}
// Şans dile'ye basınca buton etrafına saçılan yıldızlar — sabit desen,
// her yıldız kendi yönüne (--dx/--dy) uçarak döner ve söner
const WISH_STARS = [
    {
        dx: -54,
        dy: -36,
        rot: -40,
        size: 14,
        delay: 0,
        emoji: "⭐"
    },
    {
        dx: 46,
        dy: -50,
        rot: 30,
        size: 11,
        delay: 40,
        emoji: "✨"
    },
    {
        dx: -20,
        dy: -60,
        rot: -15,
        size: 12,
        delay: 80,
        emoji: "⭐"
    },
    {
        dx: 62,
        dy: -14,
        rot: 45,
        size: 13,
        delay: 20,
        emoji: "✨"
    },
    {
        dx: -64,
        dy: 6,
        rot: -30,
        size: 11,
        delay: 60,
        emoji: "✨"
    },
    {
        dx: 28,
        dy: 36,
        rot: 20,
        size: 12,
        delay: 100,
        emoji: "⭐"
    },
    {
        dx: -40,
        dy: 32,
        rot: -25,
        size: 10,
        delay: 50,
        emoji: "✨"
    },
    {
        dx: 8,
        dy: -68,
        rot: 10,
        size: 15,
        delay: 0,
        emoji: "⭐"
    },
    {
        dx: 68,
        dy: 24,
        rot: 35,
        size: 10,
        delay: 90,
        emoji: "✨"
    },
    {
        dx: -8,
        dy: 48,
        rot: -10,
        size: 11,
        delay: 70,
        emoji: "⭐"
    }
];
function ManifestPopup({ envelope, origin, onClose, onClosingStart }) {
    // origin: zarf duvardaki yerinde • center: ekran ortasında • open: kapak açık
    const [stage, setStage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("origin");
    // Şans dileme / tebrik (demo: yerel state, backend'de gerçek sayaca bağlanır)
    const [luck, setLuck] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(envelope.luck ?? 0);
    const [wished, setWished] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [cheers, setCheers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(envelope.cheers ?? 0);
    const [cheered, setCheered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Kapak, mektup dışarıdayken arkada (1), mektup içerideyken önde (30) durur
    const [flapZ, setFlapZ] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(30);
    const closingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Mektup zarfa girerken üst kenarı ön cebin V yakasından görünecek kadar
    // küçülür; içerik boyu değişken olduğundan ölçek ölçülerek hesaplanır
    const letterRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [tuckScale, setTuckScale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0.5);
    // Duvardaki konumdan ekran ortasına taşınma geometrisi.
    // X ve Y ayrı ölçeklenir ki zarf, duvardaki kopyasıyla birebir çakışsın;
    // 110px'lik gövde ofseti de zarfın açısına göre döndürülerek hesaplanır.
    const geo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const vw = document.documentElement.clientWidth;
        const vh = document.documentElement.clientHeight;
        const popW = Math.min(window.innerWidth * 0.92, 460);
        // k: popup geometrisi genişlikle orantılı küçülür — mobilde de zarf
        // masaüstündeki gibi yatay dikdörtgen kalır
        const k = popW / 540;
        const sx = origin.w / popW;
        const sy = origin.h / (395 * k);
        const off = origin.h / 395 * 82.5; // gövde merkez ofseti (ekran px)
        // Mobilde zarf orta-altta açılır; mektup orta-üste doğru çıkar
        const dropY = window.innerWidth <= 520 ? Math.round(vh * 0.1) : 0;
        const rad = envelope.rotation * Math.PI / 180;
        // Duvardaki süs, zarf genişliğinin ~%16'sı. Popup süsü bunun 1/sx katı
        // olur ki zarf küçülünce süs duvardakiyle aynı boyuta insin.
        return {
            k,
            dropY,
            sx,
            sy,
            stickerPx: origin.w * (28 / 172) / sx,
            dx: origin.cx - vw / 2 + off * Math.sin(rad),
            dy: origin.cy - vh / 2 - off * Math.cos(rad)
        };
    }, [
        origin,
        envelope.rotation
    ]);
    // Hedef: kağıdın üst kenarı zarf içindeyken yaka üçgeninin üst bölgesinde
    // (≈230k) dursun — kapak kapanırken bu kısım görünür kalır
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"])(()=>{
        const h = letterRef.current?.offsetHeight;
        if (h) setTuckScale(Math.min(0.85, 294 * geo.k / h));
    }, [
        geo.k
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const raf = requestAnimationFrame(()=>requestAnimationFrame(()=>setStage("center")));
        // Ortaya varış ~300ms → kapak açılır → mektup 150ms gecikmeyle çıkar
        const t1 = setTimeout(()=>setStage("open"), 340);
        const t2 = setTimeout(()=>setFlapZ(1), 510);
        return ()=>{
            cancelAnimationFrame(raf);
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);
    const close = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (closingRef.current) return;
        closingRef.current = true;
        setStage("center"); // mektup içeri girer, ardından kapak kapanır
        setTimeout(onClosingStart, 200); // komşu zarflar yer açmaya başlasın
        setTimeout(()=>setFlapZ(30), 340);
        setTimeout(()=>setStage("origin"), 380); // sonra zarf yerine uçar
        setTimeout(onClose, 720);
    }, [
        onClose,
        onClosingStart
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const onKey = (e)=>{
            if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", onKey);
        return ()=>window.removeEventListener("keydown", onKey);
    }, [
        close
    ]);
    const atCenter = stage !== "origin";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[2000]",
        onClick: close,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200",
                style: {
                    opacity: atCenter ? 1 : 0
                }
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1723,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed left-1/2 top-1/2 w-[min(92vw,460px)]",
                style: {
                    transform: atCenter ? `translate(-50%, -50%) translate(0px, ${geo.dropY}px)` : `translate(-50%, -50%) translate(${geo.dx}px, ${geo.dy}px) rotate(${envelope.rotation}deg) scale(${geo.sx}, ${geo.sy})`,
                    transition: "transform 300ms cubic-bezier(0.3, 0.85, 0.3, 1)"
                },
                onClick: (e)=>e.stopPropagation(),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative",
                    style: {
                        height: 560 * geo.k,
                        perspective: "1100px"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-x-0 bottom-0 rounded-[6px]",
                            style: {
                                height: 395 * geo.k,
                                ...envelope.color.flapBg ? {
                                    background: envelope.color.flapBg
                                } : {
                                    backgroundColor: envelope.color.dark
                                }
                            }
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1742,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-x-0 z-[5] h-px",
                            style: {
                                top: 165 * geo.k,
                                backgroundColor: "rgba(0,0,0,0.09)"
                            }
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1754,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-x-0 z-[5] h-[6px]",
                            style: {
                                top: 159 * geo.k,
                                background: "linear-gradient(to top, rgba(0,0,0,0.05), transparent)"
                            }
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1758,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute left-1/2 z-10 w-[86%]",
                            style: {
                                bottom: 36 * geo.k,
                                transformOrigin: "bottom center",
                                // Açıkken sabit piksel kadar yükselir: kağıdın ALT kenarı hep
                                // aynı hizada durur, kağıt metin kadar uzar (boş alan kalmaz)
                                transform: stage === "open" ? `translateX(-50%) translateY(${-319 * geo.k}px) scale(1)` : `translateX(-50%) translateY(0) scale(${tuckScale})`,
                                transition: `transform 320ms cubic-bezier(0.25, 0.9, 0.3, 1) ${stage === "open" ? "150ms" : "0ms"}`
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                ref: letterRef,
                                className: "max-h-[62vh] overflow-y-auto rounded-[4px] bg-[#fffdf5] px-8 py-7 shadow-[0_16px_44px_rgba(0,0,0,0.35)] max-[520px]:px-5 max-[520px]:py-5",
                                children: [
                                    envelope.sponsored ? // eslint-disable-next-line @next/next/no-img-element
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: "/petimemama.png",
                                        alt: "Petimemama",
                                        className: "h-9 object-contain"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1790,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-hand text-[26px] text-neutral-800 max-[520px]:text-[22px]",
                                        children: envelope.name
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1796,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-1 flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400 max-[520px]:text-[9.5px]",
                                                children: envelope.sponsored ? "Sponsorlu • Sürpriz" : "Manifest"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1801,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "font-mono text-[11px] tracking-wider text-neutral-400 max-[520px]:text-[9.5px]",
                                                children: envelope.code
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 1804,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1800,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-4 text-[14px] leading-relaxed text-neutral-700 max-[520px]:text-[13px]",
                                        children: envelope.manifest
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 1808,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 1784,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1768,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "pointer-events-none absolute inset-x-0 bottom-0 z-20 rounded-[6px] shadow-[0_18px_50px_rgba(0,0,0,0.35)]",
                            style: {
                                height: 395 * geo.k,
                                clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)",
                                transform: "translateZ(0)",
                                ...envelope.color.bodyBg ? {
                                    background: envelope.color.bodyBg
                                } : {
                                    backgroundColor: envelope.color.base
                                }
                            }
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1817,
                            columnNumber: 11
                        }, this),
                        envelope.color.gloss && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "pointer-events-none absolute inset-x-0 bottom-0 z-[21] rounded-[6px]",
                            style: {
                                height: 395 * geo.k,
                                clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)",
                                transform: "translateZ(0)",
                                background: "linear-gradient(115deg, rgba(255,255,255,0.22) 8%, rgba(255,255,255,0.06) 30%, transparent 46%)"
                            }
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1830,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute bottom-[16px] left-[22px] z-30 flex flex-col items-start gap-1 text-xs font-medium transition-opacity duration-200 max-[520px]:bottom-[12px] max-[520px]:left-[14px] max-[520px]:gap-0.5",
                            style: {
                                color: envelope.color.ink,
                                opacity: stage === "open" ? 0.85 : 0,
                                pointerEvents: "none"
                            },
                            children: [
                                envelope.realized && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white shadow-sm max-[520px]:px-2.5 max-[520px]:py-0.5 max-[520px]:text-[8.5px]",
                                            children: "Gerçekleşti"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1853,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "flex items-center gap-1.5 text-[11px] opacity-90 max-[520px]:text-[9.5px] max-[520px]:gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    viewBox: "0 0 24 24",
                                                    fill: "none",
                                                    stroke: "currentColor",
                                                    strokeWidth: "2",
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    className: "h-4 w-4 max-[520px]:h-3.5 max-[520px]:w-3.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            d: "M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 1866,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 1867,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            d: "m16 19 2 2 4-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/page.tsx",
                                                            lineNumber: 1868,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1857,
                                                    columnNumber: 19
                                                }, this),
                                                envelope.realizedDate,
                                                '\'da "gerçekleşti"                 işaretlendi'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1856,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-1.5 text-[11px] opacity-90 max-[520px]:text-[9.5px] max-[520px]:gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            className: "h-4 w-4 max-[520px]:h-3.5 max-[520px]:w-3.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1885,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1886,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M19 16v6"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1887,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M16 19h6"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1888,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1876,
                                            columnNumber: 15
                                        }, this),
                                        envelope.date,
                                        " tarihinde eklendi"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1875,
                                    columnNumber: 13
                                }, this),
                                !envelope.realized && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "h-px w-full bg-current opacity-25"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1893,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: "2",
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            className: "h-4 w-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1905,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1906,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1896,
                                            columnNumber: 13
                                        }, this),
                                        envelope.views.toLocaleString("tr-TR"),
                                        " kişi zarfı açtı"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1895,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1843,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute bottom-[14px] right-[20px] z-30 flex flex-col items-end gap-1.5 transition-opacity duration-200",
                            style: {
                                opacity: stage === "open" && !envelope.sponsored ? 1 : 0,
                                pointerEvents: stage === "open" && !envelope.sponsored ? "auto" : "none"
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-0.5 text-xs font-medium shadow-sm backdrop-blur-[1px] max-[520px]:px-2 max-[520px]:text-[10px]",
                                    style: {
                                        // Beyaz pill üstünde açık mürekkepler okunmaz (özel seri)
                                        color: envelope.color.gloss ? "#525252" : envelope.color.ink
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[11px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]",
                                            children: "⭐"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1928,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                            className: "font-semibold",
                                            children: luck
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1931,
                                            columnNumber: 15
                                        }, this),
                                        " kişi şans",
                                        " ",
                                        envelope.realized ? "dilemişti" : "diledi"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1921,
                                    columnNumber: 13
                                }, this),
                                envelope.realized ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-0.5 text-xs font-medium shadow-sm backdrop-blur-[1px] max-[520px]:px-2 max-[520px]:text-[10px]",
                                            style: {
                                                color: envelope.color.gloss ? "#525252" : envelope.color.ink
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[11px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]",
                                                    children: "👏"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1944,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                    className: "font-semibold",
                                                    children: cheers
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1947,
                                                    columnNumber: 19
                                                }, this),
                                                " kişi tebrik etti"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1936,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>{
                                                if (cheered) return;
                                                setCheered(true);
                                                setCheers((n)=>n + 1);
                                            },
                                            className: `flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm transition-all max-[520px]:px-3 max-[520px]:py-1 max-[520px]:text-xs ${cheered ? "border-emerald-300 bg-emerald-50 text-emerald-600" : "border-neutral-200 bg-white/90 text-neutral-600 hover:border-emerald-300 hover:text-emerald-600"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `text-base transition-transform duration-300 ${cheered ? "scale-125" : ""}`,
                                                    children: "👏"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1962,
                                                    columnNumber: 19
                                                }, this),
                                                "Tebrik et"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1949,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "relative",
                                    children: [
                                        wished && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "pointer-events-none absolute left-1/2 top-1/2 z-10",
                                            children: WISH_STARS.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "wish-star absolute left-0 top-0 leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]",
                                                    style: {
                                                        "--dx": `${s.dx}px`,
                                                        "--dy": `${s.dy}px`,
                                                        "--rot": `${s.rot}deg`,
                                                        fontSize: s.size,
                                                        animationDelay: `${s.delay}ms`
                                                    },
                                                    children: s.emoji
                                                }, i, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 1977,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1975,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>{
                                                if (wished) return;
                                                setWished(true);
                                                setLuck((n)=>n + 1);
                                            },
                                            className: `flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm transition-all max-[520px]:px-3 max-[520px]:py-1 max-[520px]:text-xs ${wished ? "wish-yay border-amber-300 bg-amber-50 text-amber-600" : "wish-btn border-neutral-200 bg-white/90 text-neutral-600 hover:border-amber-300 hover:text-amber-600"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `text-base transition-transform duration-300 ${wished ? "scale-125" : ""}`,
                                                    children: wished ? "⭐" : "☆"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/page.tsx",
                                                    lineNumber: 2008,
                                                    columnNumber: 19
                                                }, this),
                                                "Şans dile"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 1995,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 1973,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 1913,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-x-0",
                            style: {
                                top: 165 * geo.k,
                                height: 215 * geo.k,
                                transformOrigin: "top center",
                                transform: stage === "open" ? "rotateX(180deg)" : "rotateX(0deg)",
                                // Açılırken hemen, kapanırken mektup içeri girdikten sonra
                                transition: `transform 270ms ease ${stage === "open" ? "0ms" : "150ms"}`,
                                zIndex: flapZ,
                                willChange: "transform"
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-full w-full rounded-t-[6px]",
                                style: {
                                    ...envelope.color.flapBg ? {
                                        background: envelope.color.flapBg
                                    } : {
                                        backgroundColor: envelope.color.dark
                                    },
                                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                                    transform: "translateZ(0)"
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2040,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 2025,
                            columnNumber: 11
                        }, this),
                        envelope.sticker && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "pointer-events-none absolute z-[35] leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]",
                            style: {
                                left: `${envelope.sticker.left}%`,
                                top: 380 * geo.k,
                                fontSize: `${geo.stickerPx}px`,
                                transform: `translate(-50%, -100%) rotate(${envelope.sticker.rotation}deg)`
                            },
                            children: envelope.sticker.emoji
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 2054,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: close,
                            className: "absolute -right-2 z-40 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-xl text-neutral-600 shadow-lg transition-all hover:scale-110 max-[520px]:h-8 max-[520px]:w-8 max-[520px]:text-base",
                            style: {
                                top: 95 * geo.k,
                                opacity: stage === "open" ? 1 : 0
                            },
                            "aria-label": "Kapat",
                            children: "×"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 2067,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 1737,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 1727,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 1721,
        columnNumber: 5
    }, this);
}
function Home() {
    const envelopes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(buildEnvelopes, []);
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // İnişte yer açan zarf: inen zarfın id'si
    const [partingId, setPartingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Şişedeki not popup'ı (zarf id'si ile)
    const [bottleOpen, setBottleOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Hediye kutusu popup'ı (duvardaki kutunun uçuş başlangıç konumu)
    const [giftOrigin, setGiftOrigin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const sectionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Ekran genişliği + cihaz tipine göre sütun sayısı:
    // telefon → 3, tablet → 6, laptop/monitör → 10 (zarf boyutu ekrana uyar)
    const [vwPx, setVwPx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1920);
    const [phone, setPhone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const update = ()=>{
            setVwPx(document.documentElement.clientWidth);
            const ua = navigator.userAgent;
            setPhone(/iPhone|iPod|Windows Phone/i.test(ua) || /Android/i.test(ua) && /Mobile/i.test(ua));
        };
        update();
        window.addEventListener("resize", update);
        window.addEventListener("orientationchange", update);
        return ()=>{
            window.removeEventListener("resize", update);
            window.removeEventListener("orientationchange", update);
        };
    }, []);
    const cols = phone ? 3 : vwPx < 700 ? 3 : vwPx < 1100 ? 6 : 10;
    // Yıl / ay filtresi (0 = tümü) — yıl, mevcut tek yıl olan 2026 seçili gelir
    const [fYear, setFYear] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(2026);
    const [fMonth, setFMonth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const visible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>envelopes.filter((e)=>!e.bottled && (!fYear || e.year === fYear) && (!fMonth || e.month === fMonth)), [
        envelopes,
        fYear,
        fMonth
    ]);
    // Şişedeki manifestler (150+ şans)
    const bottledEnvs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>envelopes.filter((e)=>e.bottled), [
        envelopes
    ]);
    // Günlük karıştırma tohumu: her gece 02:00'da değişir. Sıralama satılmaz;
    // tüm konumlar her gün bu tohumla rastgele yeniden dağıtılır
    const daySeed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>Math.floor((Date.now() - 2 * 3600 * 1000) / 86400000), []);
    const years = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>[
            ...new Set(envelopes.map((e)=>e.year))
        ].sort(), [
        envelopes
    ]);
    // Aktif filtreye uyan manifest sayısı (şişeler dahil)
    const filteredCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>envelopes.filter((e)=>(!fYear || e.year === fYear) && (!fMonth || e.month === fMonth)).length, [
        envelopes,
        fYear,
        fMonth
    ]);
    // Yerleşim: tamamen orantılı piksel konumları (zoom yok, ölçek yok).
    // Konum sırası her gün 02:00'da daySeed ile rastgele karılır;
    // filtre aktifken görünür zarflar baştan itibaren yeniden dizilir
    const layout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const m = makeLayoutMetrics(vwPx, cols);
        const rows = Math.max(1, Math.ceil(visible.length / cols));
        const wrapperW = cols * m.colStep;
        // Reklam banner alanları — tam genişlik. Masaüstünde yan yana iki
        // şerit, mobilde (3 sütun) alt alta. ADS_ENABLED kapalıysa hiç yoklar
        const bannerGap = 14;
        const bannerH = Math.max(110, m.envH * 1.35);
        const stacked = cols === 3;
        const banners = ("TURBOPACK compile-time truthy", 1) ? [] : "TURBOPACK unreachable";
        // Zarflar banner bölgesinin hemen altından (reklam kapalıysa tepeden) başlar
        const topOffset = banners.length ? banners[banners.length - 1].y + bannerH + 26 : 8;
        const sectionH = topOffset + rows * m.rowStep + m.envH + 40;
        // Günlük Fisher-Yates karıştırması
        const shuffleRand = mulberry32(daySeed);
        let order = [
            ...visible
        ];
        for(let i = order.length - 1; i > 0; i--){
            const j = Math.floor(shuffleRand() * (i + 1));
            [order[i], order[j]] = [
                order[j],
                order[i]
            ];
        }
        // Sponsor zarfları eşit yayılır: her ~100 zarflık blokta en fazla 1
        const sponsors = order.filter((e)=>e.sponsored);
        if (sponsors.length) {
            const rest = order.filter((e)=>!e.sponsored);
            const block = Math.max(1, Math.floor(rest.length / sponsors.length));
            sponsors.forEach((s, i)=>{
                const at = Math.min(rest.length, i * block + Math.floor(shuffleRand() * block));
                rest.splice(at, 0, s);
            });
            order = rest;
        }
        const pos = new Map();
        order.forEach((env, i)=>{
            const col = i % cols;
            const row = Math.floor(i / cols);
            pos.set(env.id, {
                // Serpme payı iki yöne dağılır ki sol kenar da sağ gibi dolu görünsün
                x: 2 + col * m.colStep + (env.jx - 0.5) * m.jx,
                y: topOffset + row * m.rowStep + env.jy * m.jy,
                // Sponsor zarfı komşularının önünde durur (etiketi kapanmasın)
                z: (rows - row) * 4 + env.zr + (env.sponsored ? 6 : 0)
            });
        });
        // Şişe konumları da her gün rastgele dağılır (dikeyde bantlara yayılı,
        // banner bölgesinin altından başlarlar)
        const bRand = mulberry32(daySeed + 999);
        const bottles = bottledEnvs.map((env, i)=>({
                env,
                x: bRand() * Math.max(1, wrapperW - m.bottleW - 8),
                y: topOffset + (i + 0.1 + bRand() * 0.8) / Math.max(1, bottledEnvs.length) * Math.max(1, sectionH - topOffset - m.bottleH - 100),
                rot: -18 + bRand() * 36
            }));
        // Hediye kutusu bölgesi (duvar üstü, ortada; 10° dönüşün bbox'ı + pay).
        // Şişeler bu bölgeye giremez: çakışan şişe kutunun yanına, dar ekranda
        // altına taşınır — kutuyla şişe üst üste binip fiziği bozmasın
        // Korunan bölge kutu boyutundan türetilir (10° dönüş bbox'ı + pay)
        const giftW = Math.round(m.giftSize * 1.27);
        const giftH = Math.round(m.giftSize * 1.55);
        const gcx = wrapperW / 2;
        const gcy = 150 + Math.round(m.giftSize * 0.66);
        for (const bb of bottles){
            const margin = 30;
            const overlapX = bb.x < gcx + giftW / 2 + margin && bb.x + m.bottleW > gcx - giftW / 2 - margin;
            const overlapY = bb.y < gcy + giftH / 2 + margin && bb.y + m.bottleH > gcy - giftH / 2 - margin;
            if (!(overlapX && overlapY)) continue;
            const leftX = gcx - giftW / 2 - m.bottleW - margin;
            const rightX = gcx + giftW / 2 + margin;
            const cand = bb.x + m.bottleW / 2 < gcx ? leftX : rightX;
            if (cand >= 0 && cand <= wrapperW - m.bottleW) bb.x = cand;
            else bb.y = gcy + giftH / 2 + margin;
        }
        const rx = m.bottleW / 2 + m.envW / 2 + 8;
        const ry = m.bottleH / 2 + m.envH / 2 + 12;
        // Kutu çevresinde zarflara nefes payı: elips içine düşen zarf dışarı itilir
        const grx = giftW / 2 + m.envW / 2 + 18;
        const gry = giftH / 2 + m.envH / 2 + 18;
        for (const p of pos.values()){
            const ex = p.x + m.envW / 2;
            const ey = p.y + m.envH / 2;
            for (const bb of bottles){
                const bx = bb.x + m.bottleW / 2;
                const by = bb.y + m.bottleH / 2;
                let dx = ex - bx;
                let dy = ey - by;
                const d = Math.hypot(dx / rx, dy / ry);
                if (d >= 1) continue;
                const len = Math.hypot(dx, dy) || 1;
                dx /= len;
                dy /= len;
                const push = (1 - d) * m.envW * 0.38; // hafif itme
                p.x += dx * push;
                p.y += dy * push;
            }
            {
                let dx = ex - gcx;
                let dy = ey - gcy;
                const d = Math.hypot(dx / grx, dy / gry);
                if (d < 1) {
                    const len = Math.hypot(dx, dy) || 1;
                    dx /= len;
                    dy /= len;
                    const push = (1 - d) * m.envW * 0.34; // kutu az ezsin, biraz rahatla
                    p.x += dx * push;
                    p.y += dy * push;
                }
            }
            // Kenarlarda simetrik hafif taşmaya izin ver (iki taraf da dolu dursun)
            p.x = Math.min(wrapperW - m.envW + 8, Math.max(-8, p.x));
            p.y = Math.max(2, p.y);
        }
        return {
            ...m,
            rows,
            wrapperW,
            sectionH,
            topOffset,
            pos,
            bottles,
            banners,
            order
        };
    }, [
        visible,
        bottledEnvs,
        cols,
        vwPx,
        daySeed
    ]);
    // Pencereleme: sadece görünür bölge ± tampon kadar satır render edilir,
    // 1000 zarfın tamamı asla aynı anda DOM'da durmaz
    const [range, setRange] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        start: 0,
        end: 30
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let raf = 0;
        const update = ()=>{
            raf = 0;
            const vh = window.innerHeight;
            const sectionTop = sectionRef.current?.offsetTop ?? 64;
            const y = window.scrollY - sectionTop - layout.topOffset;
            const buffer = 1.5 * vh; // her yönde 1.5 ekran tampon
            const start = Math.max(0, Math.floor((y - buffer) / layout.rowStep));
            const end = Math.min(layout.rows - 1, Math.ceil((y + vh + buffer) / layout.rowStep));
            setRange((prev)=>prev.start === start && prev.end === end ? prev : {
                    start,
                    end
                });
        };
        const onScroll = ()=>{
            if (!raf) raf = requestAnimationFrame(update);
        };
        update();
        window.addEventListener("scroll", onScroll, {
            passive: true
        });
        window.addEventListener("resize", onScroll);
        // Emniyet: olası kaçan scroll olaylarına karşı kendini periyodik onar
        const iv = setInterval(update, 700);
        return ()=>{
            if (raf) cancelAnimationFrame(raf);
            clearInterval(iv);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, [
        layout.rows,
        layout.rowStep,
        layout.topOffset
    ]);
    // Kod ile manifest arama
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [searchErr, setSearchErr] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [highlightId, setHighlightId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const highlightTimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const handleSearch = (e)=>{
        e.preventDefault();
        const q = query.trim().toUpperCase();
        if (!q) return;
        // "MF-042", "mf042" veya sadece "42" kabul edilir
        const num = q.match(/(\d+)/)?.[1];
        const env = envelopes.find((en)=>en.code === q || num && en.code === `MF-${num.padStart(3, "0")}`);
        if (!env) {
            setSearchErr(true);
            setTimeout(()=>setSearchErr(false), 1200);
            return;
        }
        // Şişedeki manifest arandıysa şişenin konumuna kaydır
        if (env.bottled) {
            const be = layout.bottles.find((b)=>b.env.id === env.id);
            const sec = sectionRef.current;
            if (be && sec) {
                window.scrollTo({
                    top: sec.offsetTop + be.y - window.innerHeight / 2 + 120,
                    behavior: "smooth"
                });
            }
            return;
        }
        const p = layout.pos.get(env.id);
        if (!p) {
            // Zarf aktif yıl/ay filtresinin dışında
            setSearchErr(true);
            setTimeout(()=>setSearchErr(false), 1200);
            return;
        }
        setHighlightId(env.id);
        // Hedef zarf henüz render edilmemiş olabilir (pencereleme) — konumu
        // matematiksel hesapla; kaydırınca görünür alana girip parlar
        const sec = sectionRef.current;
        if (sec) {
            const topPx = sec.offsetTop + p.y;
            window.scrollTo({
                top: topPx - window.innerHeight / 2 + 60,
                behavior: "smooth"
            });
        }
        if (highlightTimer.current) clearTimeout(highlightTimer.current);
        highlightTimer.current = setTimeout(()=>setHighlightId(null), 4000);
    };
    // İnen zarfla temas hâlindeki komşuları bul ve itme vektörlerini hesapla
    const displaced = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const map = new Map();
        if (partingId === null) return map;
        const target = layout.pos.get(partingId);
        if (!target) return map;
        const pad = 10;
        for (const e of visible){
            if (e.id === partingId) continue;
            const p = layout.pos.get(e.id);
            const touches = p.x < target.x + layout.envW + pad && target.x < p.x + layout.envW + pad && p.y < target.y + layout.envH + pad && target.y < p.y + layout.envH + pad;
            if (!touches) continue;
            let dx = p.x - target.x;
            let dy = p.y - target.y;
            const len = Math.hypot(dx, dy) || 1;
            dx /= len;
            dy /= len;
            const push = layout.envW * 0.6;
            map.set(e.id, {
                x: dx * push,
                y: dy * push
            });
        }
        return map;
    }, [
        partingId,
        visible,
        layout
    ]);
    // Popup açıkken sayfa kaymasın; kaybolan scrollbar kadar padding ekle ki
    // duvar yana kaymasın (yoksa zarf yerine dönerken hedef şaşar)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (selected || bottleOpen || giftOrigin) {
            const sbw = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = "hidden";
            document.body.style.paddingRight = `${sbw}px`;
        } else {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        }
        return ()=>{
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        };
    }, [
        selected,
        bottleOpen,
        giftOrigin
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "flex min-h-screen flex-col",
        children: [
            ADS_ENABLED && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-12 shrink-0 items-center justify-center border-b border-neutral-200 bg-white",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "rounded border border-dashed border-neutral-300 px-8 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-neutral-400",
                    children: "Topbar Reklam Alanı"
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 2468,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 2467,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "sticky top-0 z-[1500] flex h-16 shrink-0 items-center justify-center border-b border-neutral-300/70 bg-white/70 backdrop-blur",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "rounded border border-dashed border-neutral-400 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-neutral-400",
                        children: "Burası header alanı"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 2476,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        onSubmit: handleSearch,
                        className: `absolute left-1/2 top-full flex h-11 max-w-[96vw] -translate-x-1/2 items-center rounded-b-2xl border-x border-b bg-white/95 px-4 shadow-[0_8px_20px_rgba(0,0,0,0.1)] backdrop-blur transition-colors ${searchErr ? "border-red-400" : "border-neutral-200"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                value: query,
                                onChange: (e)=>setQuery(e.target.value),
                                placeholder: "Zarf kodu",
                                className: "w-40 min-w-0 bg-transparent px-2 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 max-[520px]:w-24"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2487,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                className: `flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors ${searchErr ? "bg-red-50 text-red-500" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        strokeWidth: "2",
                                        strokeLinecap: "round",
                                        className: "h-3.5 w-3.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                cx: "11",
                                                cy: "11",
                                                r: "8"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2509,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "m21 21-4.3-4.3"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2510,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2501,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "max-[520px]:hidden",
                                        children: "Ara"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2512,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2493,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "mx-2 h-5 w-px shrink-0 bg-neutral-200"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2514,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: fYear,
                                onChange: (e)=>setFYear(Number(e.target.value)),
                                className: "cursor-pointer bg-transparent py-1 text-sm text-neutral-600 outline-none",
                                "aria-label": "Yıl filtresi",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: 0,
                                        children: "Tüm yıllar"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2521,
                                        columnNumber: 13
                                    }, this),
                                    years.map((y)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: y,
                                            children: y
                                        }, y, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 2523,
                                            columnNumber: 15
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2515,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "mx-1 h-5 w-px shrink-0 bg-neutral-200"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2528,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: fMonth,
                                onChange: (e)=>setFMonth(Number(e.target.value)),
                                className: "cursor-pointer bg-transparent py-1 text-sm text-neutral-600 outline-none",
                                "aria-label": "Ay filtresi",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: 0,
                                        children: "Tüm aylar"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2535,
                                        columnNumber: 13
                                    }, this),
                                    MONTHS_TR.map((m, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: i + 1,
                                            children: m
                                        }, m, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 2537,
                                            columnNumber: 15
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2529,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "absolute right-2 top-[calc(100%+6px)] whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-neutral-500 shadow-sm backdrop-blur",
                                children: [
                                    filteredCount.toLocaleString("tr-TR"),
                                    " manifest"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2543,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 2481,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 2475,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                ref: sectionRef,
                className: "relative overflow-hidden",
                style: {
                    height: layout.sectionH
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative mx-auto h-full",
                    style: {
                        width: layout.wrapperW
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute left-1/2 -translate-x-1/2",
                            style: {
                                top: 150,
                                zIndex: 1400,
                                visibility: giftOrigin ? "hidden" : "visible"
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                "aria-label": `${GIFT_ENV.name} — hediye kutusundaki manifesti oku`,
                                className: "block cursor-pointer touch-manipulation transition-transform duration-200 hover:scale-110",
                                onClick: (e)=>{
                                    const el = e.currentTarget;
                                    const r = el.getBoundingClientRect();
                                    // Genişlik döndürülmemiş halinden alınır (bbox açıyla büyür)
                                    setGiftOrigin({
                                        cx: r.left + r.width / 2,
                                        cy: r.top + r.height / 2,
                                        w: el.offsetWidth,
                                        h: el.offsetHeight
                                    });
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        transform: "rotate(10deg)"
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(GiftBoxVisual, {
                                        size: layout.giftSize,
                                        name: GIFT_ENV.name,
                                        luck: GIFT_ENV.luck,
                                        glow: true
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2587,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 2586,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2569,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 2561,
                            columnNumber: 11
                        }, this),
                        layout.banners.map((bn, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute flex items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-white/90",
                                style: {
                                    left: bn.x,
                                    top: bn.y,
                                    width: bn.w,
                                    height: bn.h,
                                    zIndex: layout.rows * 4 + 30
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-center text-xs font-medium uppercase tracking-[0.25em] text-neutral-400",
                                    children: [
                                        "Reklam Alanı ",
                                        i + 1
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 2610,
                                    columnNumber: 15
                                }, this)
                            }, i, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2599,
                                columnNumber: 13
                            }, this)),
                        layout.bottles.map((b, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                "aria-label": `${b.env.name} — şişedeki notu oku`,
                                onClick: (e)=>{
                                    const el = e.currentTarget;
                                    const r = el.getBoundingClientRect();
                                    setBottleOpen({
                                        id: b.env.id,
                                        origin: {
                                            cx: r.left + r.width / 2,
                                            cy: r.top + r.height / 2,
                                            w: el.offsetWidth,
                                            h: el.offsetHeight
                                        }
                                    });
                                },
                                className: "absolute aspect-[200/520] cursor-pointer touch-manipulation transition-all duration-200 hover:scale-110",
                                style: {
                                    zIndex: layout.rows * 4 + 40,
                                    width: layout.bottleW,
                                    left: b.x,
                                    top: b.y,
                                    rotate: `${b.rot}deg`,
                                    visibility: bottleOpen?.id === b.env.id ? "hidden" : undefined
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BottleVisual, {
                                    sticker: b.env.sticker?.emoji ?? "🦋",
                                    ribbon: b.env.id % RIBBON_GRADS.length,
                                    sheenDelay: i * 0.9,
                                    realized: b.env.realized,
                                    bandFs: Math.max(8, 10 * (layout.bottleW / 160)),
                                    label: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col items-center gap-[3px]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-start justify-center",
                                                style: {
                                                    gap: 8 * (layout.bottleW / 160)
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-col items-center gap-[2px]",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]",
                                                                style: {
                                                                    fontSize: 11 * (layout.bottleW / 160)
                                                                },
                                                                children: "⭐"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 2658,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "leading-none font-semibold text-[#8a6d33]",
                                                                style: {
                                                                    fontSize: 12 * (layout.bottleW / 160)
                                                                },
                                                                children: b.env.luck.toLocaleString("tr-TR")
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 2664,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2657,
                                                        columnNumber: 23
                                                    }, this),
                                                    b.env.realized && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-col items-center gap-[2px]",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]",
                                                                style: {
                                                                    fontSize: 11 * (layout.bottleW / 160)
                                                                },
                                                                children: "👏"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 2673,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "leading-none font-semibold text-[#8a6d33]",
                                                                style: {
                                                                    fontSize: 12 * (layout.bottleW / 160)
                                                                },
                                                                children: b.env.cheers.toLocaleString("tr-TR")
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 2679,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 2672,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2653,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "truncate font-hand leading-none font-semibold text-[#6b5426]",
                                                style: {
                                                    fontSize: 17 * (layout.bottleW / 160)
                                                },
                                                children: b.env.name
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 2688,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 2652,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 2645,
                                    columnNumber: 15
                                }, this)
                            }, b.env.id, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2618,
                                columnNumber: 13
                            }, this)),
                        layout.order.filter((_, i)=>{
                            const row = Math.floor(i / cols);
                            return row >= range.start && row <= range.end;
                        }).map((env)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EnvelopeCard, {
                                envelope: env,
                                pos: layout.pos.get(env.id),
                                envW: layout.envW,
                                hidden: selected?.env.id === env.id,
                                offset: displaced.get(env.id),
                                highlighted: highlightId === env.id,
                                onOpen: (e, origin)=>setSelected({
                                        env: e,
                                        origin
                                    })
                            }, env.id, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 2706,
                                columnNumber: 15
                            }, this))
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 2555,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 2550,
                columnNumber: 7
            }, this),
            bottleOpen && (()=>{
                const be = layout.bottles.find((b)=>b.env.id === bottleOpen.id);
                return be ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BottlePopup, {
                    bottle: toBottleData(be.env, be.rot),
                    origin: bottleOpen.origin,
                    onClose: ()=>setBottleOpen(null)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 2724,
                    columnNumber: 13
                }, this) : null;
            })(),
            giftOrigin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(GiftPopup, {
                origin: giftOrigin,
                onClose: ()=>setGiftOrigin(null)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 2733,
                columnNumber: 9
            }, this),
            selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ManifestPopup, {
                envelope: selected.env,
                origin: selected.origin,
                onClosingStart: ()=>setPartingId(selected.env.id),
                onClose: ()=>{
                    setSelected(null);
                    // Zarf yerine oturduktan kısa bir süre sonra komşular geri dönsün
                    setTimeout(()=>setPartingId(null), 250);
                }
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 2737,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 2464,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=app_page_tsx_0pxmutw._.js.map