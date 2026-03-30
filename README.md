# Dytayse Website

Statik landing page + iletişim formu backend’i.

## Kurulum

1) Node.js 18+ kurulu olsun.

2) Paketleri yükleyin:

```bash
npm install
```

3) Ortam değişkenleri:

- `.env.example` dosyasını `.env` olarak kopyalayın
- CallMeBot bilgilerinizi girin: `CALLMEBOT_PHONE`, `CALLMEBOT_APIKEY`

4) Çalıştırın:

```bash
npm run dev
```

Site: `http://localhost:3000`

## Form akışı

`index.html` içindeki form, `POST /api/contact` endpoint’ine JSON gönderir. Sunucu da CallMeBot WhatsApp API ile belirtilen numaraya metin mesajı yollar.

## Önemli not (CallMeBot)

CallMeBot üzerinden WhatsApp mesajı gönderebilmek için CallMeBot’un istediği aktivasyon adımlarını tamamlayıp `CALLMEBOT_APIKEY` almanız gerekir.

