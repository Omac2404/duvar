// ── Otomatik şans — kimsenin görmediği manifest yalnız kalmasın ─────────
// Yazıldığından beri hiç şans almamış bir manifeste, 10 günde bir sistem
// 1 şans gönderir. Böylece hiç şans almayan bir manifest bir aylık
// pencerede 10-10-10 döngüsüyle en fazla 3 şansa çıkar.
//
// Döngü, manifest dışarıdan (üye ya da admin) tek bir şans alır almaz
// tamamen kapanır: uygunluk koşulu "sahip olduğu şansın tamamı sistemden
// gelmiş olmak" (luck = auto_luck). Dışarıdan gelen ilk şansta bu eşitlik
// bozulur ve manifest bir daha otomatik şans almaz.
//
// Sayaç ayrı gösterilmez: otomatik şans normal şans sayacına eklenir,
// zarfta ek bir işaret çıkmaz. Demo (seed) zarfları kapsam dışıdır.
//
// Zamanlama: instrumentation.ts açılışta startAutoLuckScheduler() çağırır,
// döngü saatte bir vadesi geleni tarar. 10 günlük eşik yanında saatlik
// tarama fazlasıyla yeterli; sunucu kapalı kaldıysa açılışta telafi olur.

import type { Pool } from "pg";
import { getDb } from "./db";

const DAYS = 10; // şanssız geçen her bu kadar günde 1 otomatik şans
const MAX_AUTO = 3; // bir manifestin alabileceği toplam otomatik şans
const LOCK_KEY = 714215; // moderation'ınkiyle çakışmayan advisory lock

const g = globalThis as unknown as {
  mwAutoLuckTimer?: ReturnType<typeof setInterval>;
};

// Vadesi gelen manifestlere birer şans yazar, işlenen kodları döndürür.
// Tek UPDATE ile atomik: aynı anda iki örnek koşsa da çift yazamaz
export async function runDueAutoLuck(db?: Pool): Promise<string[]> {
  const p = db ?? (await getDb());
  // Çok örnekli kurulumda yalnızca bir örnek çalışsın
  const lock = await p.query("SELECT pg_try_advisory_lock($1) AS ok", [
    LOCK_KEY,
  ]);
  if (!lock.rows[0]?.ok) return [];
  try {
    const { rows } = await p.query(
      `UPDATE manifests
         SET luck = luck + 1,
             auto_luck = auto_luck + 1,
             auto_luck_at = now()
       WHERE NOT is_demo
         AND auto_luck < $1
         AND luck = auto_luck
         AND COALESCE(auto_luck_at, to_timestamp(ts / 1000.0))
             <= now() - ($2 || ' days')::interval
       RETURNING code`,
      [MAX_AUTO, DAYS],
    );
    return rows.map((r) => r.code as string);
  } finally {
    await p.query("SELECT pg_advisory_unlock($1)", [LOCK_KEY]);
  }
}

export function startAutoLuckScheduler() {
  if (g.mwAutoLuckTimer) return; // HMR / çift kayıt koruması
  const tick = () =>
    runDueAutoLuck()
      .then((codes) => {
        if (codes.length > 0)
          console.log(`[oto-sans] ${codes.length} manifeste 1 sans gonderildi`);
      })
      .catch((e) => console.error("[oto-sans] hata:", e));
  // Açılışta kısa gecikmeyle ilk tarama; sonra saatte bir
  setTimeout(tick, 30000);
  g.mwAutoLuckTimer = setInterval(tick, 3600000);
}
