# Manifest Duvarı

Ziyaretçilerin manifest (dilek) yazıp zarf olarak duvara astığı Next.js
uygulaması. Üyelik, üye paneli, ödül akışları (sticker → özel renk → şişe →
hediye kutusu), admin paneli ve Postgres backend içerir.

## Geliştirme ortamı

Gereksinimler: Node.js 22+, Docker (lokal Postgres için).

```bash
# 1. Bağımlılıklar
npm install

# 2. Postgres'i kaldır (ilk istekte şema + test hesabı otomatik kurulur)
docker compose up -d

# 3. Ortam değişkenleri
copy .env.example .env.local

# 4. Geliştirme sunucusu
npm run dev
```

- Duvar: http://localhost:3000 • Üyelik: `/uye` • Panel: `/panel` • Admin: `/admin`
- Test hesabı: `deniz@test.com` / `Manifest123`
- Admin şifresi: `.env.local` içindeki `ADMIN_PASSWORD` (varsayılan `manifest-admin`)

## Mimari

- **Veri**: Postgres (`pg`) — şema `app/lib/server/db.ts` içinde idempotent
  kurulur; tablolar: `users`, `manifests`, `sessions`, `verification_codes`,
  `reset_tokens`, `reports`, `settings`, `moderation_flags`.
- **API**: `app/api/*` route handler'ları — üyelik (bcrypt + httpOnly cookie
  oturumu), manifest CRUD + sayaçlar, bildirimler, admin uçları.
- **İstemci**: `app/lib/auth.ts` ve `app/lib/api.ts` API'ye konuşan ince
  katmandır; ekranlar buradaki async fonksiyonları kullanır.
- **E-posta**: SMTP ayarları admin panelden girilir, `settings` tablosunda
  saklanır; doğrulama kodları sunucudan gönderilir. SMTP yoksa kod ekrana
  demo bildirimi olarak düşer.
- **Duvarın demo zarfları** (1000 adet) deterministik olarak istemcide
  üretilir (`app/lib/wallData.ts`); üye manifestleri backend'den gelir.

## Deploy (EasyPanel / Docker)

1. EasyPanel'de bir Postgres servisi aç, `DATABASE_URL`'i ona göre ayarla.
2. Uygulama servisini bu repodaki `Dockerfile` ile kur (Next standalone).
3. Ortam değişkenleri: `DATABASE_URL`, `ADMIN_PASSWORD`, `NODE_ENV=production`.
