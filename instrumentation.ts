// ── Sunucu açılış kancası — saatlik AI moderasyon zamanlayıcısını kurar ──
// Next.js her sunucu örneği başlarken register()'ı bir kez çağırır.

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startModerationScheduler } = await import(
    "./app/lib/server/moderation"
  );
  startModerationScheduler();
}
