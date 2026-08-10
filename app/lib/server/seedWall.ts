// ── Lansman duvarı tohumu — elle yazılmış 59 manifest ───────────────────
// Site açıldığında duvarın boş görünmemesi için hazırlanan içerik.
// Kurallar (talep edildiği gibi):
//   • Şansı 20 ve üstü olanlara manifest içeriğine uygun sticker
//   • 50+ şansı olan tek zarfa ayrıca parlak (özel renkli) zarf
//   • 20 altındakiler yalnızca rastgele pastel renk alır
//   • Görüntülenme her zaman şanstan büyüktür (mantık hatası olmasın)
//
// Bir kez koşar: settings'teki wallSeed2026 bayrağı ikinci kez eklemeyi
// engeller, admin silerse geri gelmez. Kayıtlar u-demo hesabına ve
// is_demo=TRUE ile yazılır; böylece otomatik şans döngüsü bunlara
// dokunmaz ve admin panelinde üye verisinden ayrılırlar.

import type { Pool } from "pg";

// Sticker emojileri RewardVisuals'taki STICKERS listesinden, özel renk
// indeksi SPECIAL_COLORS'tan (0 Vizyon · 1 Tutku · 2 Kararlılık · 3 Hayal)
type SeedRow = {
  name: string;
  manifest: string;
  luck: number;
  sticker?: string;
  special?: number;
};

const ROWS: SeedRow[] = [
  {
    name: "aslan10",
    manifest: "Galatasaray bu sene de şampiyon 💛❤️",
    luck: 27,
    sticker: "⭐", // Başarı
  },
  {
    name: "kader",
    manifest:
      "Çok büyük bir şey istemiyorum evrenden sadece küçük bir adalet. Bu ara çok ihtiyacım var.",
    luck: 24,
    sticker: "🧿", // Nazar
  },
  {
    name: "MertBusy",
    manifest: "2026 bitmeden banka hesabımda 7 haneli bir rakam göreceğim.",
    luck: 13,
  },
  {
    name: "Elif",
    manifest:
      "Kirasız bir hayat manifest ediyorum. Kendi evim, kendi mutfağım, duvarına istediğim çiviyi çakabildiğim kendi huzurum",
    luck: 23,
    sticker: "🏡", // Ev
  },
  {
    name: "Mertcan",
    manifest:
      "Loto falan çıksın çıkarsa bu siteye bağış yapacağım, buradan söz veriyorum. Şahidim bu duvar 😂",
    luck: 32,
    sticker: "💎", // Zenginlik
  },
  {
    name: "Ayşe T.",
    manifest: "Annemin tahlil sonuçları tertemiz çıksın amin.",
    luck: 28,
    sticker: "🌿", // Sağlık
  },
  {
    name: "UmuT",
    manifest:
      "Zam istemeye cesaretimiz yok evren bunu artık sen hallet lütfen plsss",
    luck: 25,
    sticker: "💼", // Kariyer
  },
  {
    name: "SelinTcher",
    manifest:
      "KPSS'den 90 üstü alıyorum ve sonraki atamada kadroya yerleşiyorum. Öğrencilerim beni bekliyor, geliyorum!",
    luck: 22,
    sticker: "🎓", // Eğitim
  },
  {
    name: "melekk34",
    manifest:
      "Söylemeye korma artık. Bu ay cesaretini toplayıp bana açılmasını manifest ediyorum 💕",
    luck: 21,
    sticker: "❤️", // Aşk
  },
  {
    name: "Deniz Feneri",
    manifest:
      "Lütfen artık çok bekledim. 2027 yazında sırt çantamı alıp Avrupa turuna çıkıyorum.",
    luck: 20,
    sticker: "✈️", // Seyahat
  },
  {
    name: "beyza.gunes",
    manifest: "Sene sonuna kadar en az 10 kilo vereceğim",
    luck: 17,
  },
  {
    name: "Aylincee",
    manifest: "Ehliyet sınavından bu sefer geçicem. Sakin, relaxx...",
    luck: 14,
  },
  {
    name: "luna",
    manifest:
      "Toksik insanlar hayatımdan tek tek çıkıyor ve yerlerine bana iyi gelen insanlar geliyor kapı orada güle güle 👋",
    luck: 18,
  },
  {
    name: "xmem",
    manifest: "İzmir'e taşınayım artık yeter çok sıkıldım buradan ya!",
    luck: 15,
  },
  {
    name: "Zeynepp",
    manifest:
      "Freelance işlerim o kadar artsın ki 2026 bitene kadar istifamı verebileyim.",
    luck: 19,
  },
  {
    name: "BahadırK",
    manifest:
      "Babamla aramız düzelecek. İkimiz de inatçıyız ikimiz de ilk adımı atamıyoruz.",
    luck: 16,
  },
  {
    name: "Taner",
    manifest:
      "Şeker hastalığım kontrol altına girsin tatlıya da arada sırada izin olsun ama 😅",
    luck: 12,
  },
  {
    name: "Nebaht",
    manifest: "Oğlum bu sene istediği üniversiteyi kazanacak inşallah",
    luck: 18,
  },
  {
    name: "Merve",
    manifest:
      "Nişanlımla eylülde düğünümüz var. Her şey yolunda gitsin lütfennn",
    luck: 15,
  },
  {
    name: "profesyonelhayalci",
    manifest:
      "4 büyük şirketten ayrı ayrı dönüş bekliyorum 2 hafta oldu. Biri olumlu olacak inanıyorum.",
    luck: 17,
  },
  {
    name: "Selin Y.",
    manifest:
      "Allahım tezimi bu dönem bitiriyorum. Bir de tüm sevdiklerime sağlık, huzur, mutluluk ty.",
    luck: 16,
  },
  {
    name: "beyza",
    manifest: "Kredi kartı borçlarımın hepsi bu sene kapanıyor",
    luck: 18,
  },
  {
    name: "mavikelebek",
    manifest:
      "Kızıma güzel bir gelecek manifest ediyorum. Benim yaşadığım zorlukları yaşamasın. hep gülsün hep sevilsin",
    luck: 19,
  },
  {
    name: "Stajyer",
    manifest: "Staj yaptığım şirket stajım biterken beni işe alacak.",
    luck: 15,
  },
  {
    name: "Burak F.",
    manifest:
      "Bi tekne lazım lüks olmasın, motoru çalışsın, gitsin yeter. Sabah çayımı dalgada içeceğim.",
    luck: 11,
  },
  {
    name: "patimom",
    manifest: "Sokaktaki bütün canlar bu kış sıcacık birer yuva bulsun.",
    luck: 16,
  },
  {
    name: "Emre",
    manifest:
      "33 yaş yeni bir şeye başlamak için geç değil kendime inanıyorum. 2027 de yeni bir ben olacak",
    luck: 14,
  },
  {
    name: "huzurarayan",
    manifest:
      "Panik ataklarım her geçen ay azalıyor, nefesim açılıyor, kalbim sakinleşiyor.",
    luck: 12,
  },
  {
    name: "Kaan",
    manifest:
      "Saçlarım dökülmesin nolur. Fazla bir şey istemiyorum, sadece ön taraf. Arka zaten idare ediyor.",
    luck: 9,
  },
  {
    name: "sessizharf",
    manifest:
      "okuduğum kitapları unutmayan bir hafıza istiyorum. bir de okuyacak vakit. bir de alınacak kitaplara yetecek bütçe. tamam çok şey istedim",
    luck: 6,
  },
  {
    name: "hypeMelo",
    manifest:
      "Herşey çok güzel olacak. Buna bütün kalbimle inanıyorum ve bekliyorum.",
    luck: 4,
  },
  {
    name: "wanderlust",
    manifest: "Doğum günümde Kapadokya'da balona binmek istiyorum!",
    luck: 9,
  },
  {
    name: "minix",
    manifest:
      "üniversitede bölümümü sevmeyi manifest ediyorum çünkü değiştirmek için biraz geç kaldım galiba 😅",
    luck: 7,
  },
  {
    name: "lodoscarpti",
    manifest:
      "Ev sahibim bu sene insaflı zam yapacak. Geçen sene içimizden geçtin abi lütfen. Tutsun bu dilek.",
    luck: 10,
  },
  {
    name: "Hüseyin",
    manifest: "Emekliliğime 3 yıl kaldı inşallah biz de dinleneceğiz",
    luck: 8,
  },
  { name: "papatyafalı", manifest: "O bana yazacak.", luck: 9 },
  {
    name: "Kadercim",
    manifest:
      "Bu duvara yazdığım her şey birer birer gerçek olacak, içimde öyle güzel bir his var ki. Hepinizinki de olsun",
    luck: 7,
  },
  {
    name: "deryagibi",
    manifest:
      "32 yaşındayım ve ayağım yerden kesilince hala panikliyorum. Uçak fobimi yenmek istiyorum.",
    luck: 6,
  },
  {
    name: "Aslı Dmr",
    manifest: "Kayınvalidemle aramız düzelsin çok yıprandık",
    luck: 5,
  },
  {
    name: "Talha",
    manifest: "2027'de kendi işimi kuruyorum. Şimdiden buraya yazıyorum",
    luck: 9,
  },
  {
    name: "bulutlarinüstü",
    manifest:
      "Pilot olma hayalim var. Biliyorum zor ve pahalı, ama buraya yazmak umarım bana şans getirir.",
    luck: 8,
  },
  {
    name: "Mustafa",
    manifest:
      "2026 bitmeden sigarayı bırakıyorum. Bu manifesti de şahit tutuyorum",
    luck: 10,
  },
  {
    name: "saklı",
    manifest:
      "İçimde yıllardır taşıdığım kırgınlıkları bu sene bırakıyorum. Affetmek onları haklı çıkarmak değil, kendimi özgürleştirmek. Öğrendim.",
    luck: 5,
  },
  { name: "gizem", manifest: "Hayatımın aşkıyla tanıştım", luck: 9 },
  {
    name: "Yiğit",
    manifest: "Boyum uzasın istiyorum basket ve yüzme yapıyorum",
    luck: 5,
  },
  {
    name: "issss",
    manifest:
      "CV'm güzel, network fena değil, ben hazırım, telefon çalsın artık.",
    luck: 10,
  },
  {
    name: "menekşe",
    manifest: "Depresyonu yeniyorum. Yavaş yavaş ama yeniyorum.",
    luck: 9,
  },
  {
    name: "Zeynep A.",
    manifest:
      "Pilates eğitmenliği sertifikamı bu sene alıyorum ve iki sene içinde kendi küçük stüdyomu açıyorum.",
    luck: 7,
  },
  {
    name: "Ahmedo",
    manifest: "Beklemediğim bir yerden para gelecek. miras falan olur okeyim.",
    luck: 8,
  },
  {
    name: "hlyknc",
    manifest:
      "kimse anlamıyo beni ama evren anlıyo. güzel günler geliyo, hissediyorum. az kaldı",
    luck: 4,
  },
  {
    name: "Seher",
    manifest:
      "Dengeli bir hayat istiyorum iş, aile, spor, uyku, sosyal hayat hepsine yetebilmek.",
    luck: 5,
  },
  { name: "linağğ", manifest: "TUS'u kazanmak", luck: 8 },
  {
    name: "M.E.T.",
    manifest:
      "Bu manifest tüm plaza çalışanlarına duyurumdur. Hepinizden uzakta daha samimi ve huzurlu bir iş diliyorum kendime.",
    luck: 8,
  },
  { name: "sevgii", manifest: "Erasmusa gidiyoruuuuuuuuuummm", luck: 7 },
  {
    name: "sabırtaşı",
    manifest: "Daha sabırlı bir insan olacağım. Hemen olsun ama.",
    luck: 53,
    sticker: "🦋", // Dönüşüm
    special: 2, // Kararlılık — parlak zarf
  },
  {
    name: "Şeyma",
    manifest: "2026'da ehliyeti aldım. 2027'de sıra arabada.",
    luck: 7,
  },
  {
    name: "Sezai",
    manifest: "Geçmiş geçmişte kaldı, önüme bakıyorum.",
    luck: 4,
  },
  {
    name: "melekk34",
    manifest: "Hayatımda her şey çok güzel gidiyor ve hep böyle kalacak 🧿",
    luck: 9,
  },
  { name: "Kemal O.", manifest: "Güzel olacak dediler. beklemedeyiz.", luck: 2 },
];

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const PASTEL_COUNT = 8; // app/lib/auth.ts → PANEL_COLORS

// Deterministik sözde-rastgele: aynı girdi hep aynı çıktıyı verir, böylece
// tohum tekrar koşsa da renkler/sayılar değişmez
function hash(i: number, salt: number): number {
  let h = (i + 1) * 2654435761 + salt * 40503;
  h ^= h >>> 13;
  h = Math.imul(h, 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

function trLabel(d: Date): string {
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type Built = {
  code: string;
  name: string;
  manifest: string;
  dateLabel: string;
  ts: number;
  luck: number;
  views: number;
  colorIdx: number;
  sticker: string | null;
  special: number | null;
};

export function buildWallSeed(): Built[] {
  return ROWS.map((r, i) => {
    // Kodlar 31xxx bandında; tohumlanmış test zarfları 90xxx'te, çakışmaz
    const code =
      String(31000 + i * 13) +
      LETTERS[hash(i, 1) % 26] +
      LETTERS[hash(i, 2) % 26];

    // Görüntülenme her zaman şanstan büyük: şansın 3-6 katı + 12-60 taban.
    // Zarfı açan herkes şans dilemez, gerçek oran da böyle görünür
    const views =
      Math.round(r.luck * (3 + (hash(i, 3) % 300) / 100)) +
      12 +
      (hash(i, 4) % 49);

    // Ağustos 2026 (lansman ayı) içine yayılmış tarihler
    const day = 1 + (hash(i, 5) % 9);
    const ts = Date.UTC(2026, 7, day, 9 + (hash(i, 6) % 9), hash(i, 7) % 60);

    return {
      code,
      name: r.name,
      manifest: r.manifest,
      dateLabel: trLabel(new Date(ts)),
      ts,
      luck: r.luck,
      views,
      colorIdx: hash(i, 8) % PASTEL_COUNT,
      sticker: r.sticker ?? null,
      special: r.special ?? null,
    };
  });
}

export async function seedWallManifests(p: Pool) {
  const flag = await p.query(
    "SELECT 1 FROM settings WHERE key = 'wallSeed2026' AND value = 'true'::jsonb",
  );
  if (flag.rows.length > 0) return;

  await p.query(
    `INSERT INTO users (id, name, email, pass_hash, provider, verified, created_label)
     VALUES ('u-demo', 'Demo', 'demo@manifestduvari.local', '!', 'email', TRUE, $1)
     ON CONFLICT (id) DO NOTHING`,
    [trLabel(new Date())],
  );

  for (const m of buildWallSeed()) {
    await p.query(
      `INSERT INTO manifests (code, user_id, name, manifest, date_label, ts,
         luck, cheers, views, color_idx, sticker, special, bottled, boxed,
         realized, realized_label, is_demo)
       VALUES ($1, 'u-demo', $2, $3, $4, $5, $6, 0, $7, $8, $9, $10,
               FALSE, FALSE, FALSE, NULL, TRUE)
       ON CONFLICT (code) DO NOTHING`,
      [
        m.code,
        m.name,
        m.manifest,
        m.dateLabel,
        m.ts,
        m.luck,
        m.views,
        m.colorIdx,
        m.sticker,
        m.special,
      ],
    );
  }

  await p.query(
    `INSERT INTO settings (key, value) VALUES ('wallSeed2026', 'true'::jsonb)
     ON CONFLICT (key) DO UPDATE SET value = 'true'::jsonb`,
  );
}
