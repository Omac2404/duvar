// ── Sunucu açılış kancası — zamanlayıcıları kurar ────────────────────────
// Next.js her sunucu örneği başlarken register()'ı bir kez çağırır.
// Kurulanlar: saatlik AI moderasyonu ve otomatik şans döngüsü.

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startModerationScheduler } = await import(
    "./app/lib/server/moderation"
  );
  startModerationScheduler();
  const { startAutoLuckScheduler } = await import("./app/lib/server/autoLuck");
  startAutoLuckScheduler();
}
