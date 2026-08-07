# Canlıya Çıkış — EasyPanel + Docker

Alan adı: **manifestduvari.com** (sitemap, robots ve e-postalarda hazır).

## 1. EasyPanel'de Postgres servisi

- Yeni servis → **Postgres** (17 önerilir).
- Veritabanı/kullanıcı/şifre belirle; içerideki bağlantı adresini not al:
  `postgres://KULLANICI:SIFRE@SERVIS-ADI:5432/VERITABANI`

## 2. Uygulama servisi (GitHub + Dockerfile)

- Yeni servis → **App** → kaynak: bu GitHub deposu (`master`).
- Build yöntemi: **Dockerfile** (repo kökünde hazır; Next standalone,
  build sırasında veritabanı GEREKMEZ).
- Ortam değişkeni: `DATABASE_URL` = 1. adımdaki Postgres adresi.
- Port: **3000**.
- Domain: `manifestduvari.com` (+ `www`) bağla, SSL'i (Let's Encrypt) aç.

Şema ve tohum veriler ilk istekte otomatik kurulur: süper admin,
Petimemama örnek kampanyası, test hesabı, SSS/yasal varsayılan metinler.

## 3. İlk açılış kontrol listesi

1. `manifestduvari.com/mnfstdvr-admn` → süper admin ile gir
   (webreta.digital@gmail.com — giriş başta tek adımlıdır).
2. **Ayarlar → SMTP** bilgilerini gir, test maili gönder.
3. SMTP çalışınca **Bildirimler → "Admin giriş doğrulaması"** switch'ini aç
   (girişler artık iki adımlı e-posta koduyla olur).
4. **Ayarlar → Genel → Üye verilerini sıfırla** ile demo üyeleri temizle;
   ardından **Reklam/demo** ihtiyacına göre demo zarf üret (Ağustos+).
5. Ayarlar → SEO: Search Console doğrulama kodunu yapıştır,
   `https://manifestduvari.com/sitemap.xml` adresini Search Console'a gönder.
6. Yıl simülasyonunun kapalı olduğunu doğrula (Ayarlar → Yıl Simülasyonu boş).

## Yerel geliştirme

```bash
docker start manifest-db   # postgres:17-alpine, port 5432
npm run dev                # http://localhost:3000
```
