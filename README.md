# Dytayse

## Yerel çalıştırma

```bash
npm install
npm run dev
```

Site: `http://localhost:3000` — dosyalar `public/` içinden servis edilir.

## Vercel

- Statik site kökü: **`public/`** (`vercel.json` içinde `outputDirectory`).
- Form API: `api/contact.js` (CallMeBot için `CALLMEBOT_PHONE`, `CALLMEBOT_APIKEY` env).
- Portre: `public/hakkimda.jpg`

Vercel panelinde **Framework Preset: Other**, **Output Directory** boş bırakılabilir (repo içindeki `vercel.json` kullanılır).
