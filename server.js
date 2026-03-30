const path = require("path");
const express = require("express");

require("dotenv").config();

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "50kb" }));

// Static site (index.html, css/, js/, images, etc.)
app.use(express.static(path.resolve(__dirname)));

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function normalizePhone(input) {
  // Keep digits only (works for both CallMeBot and WA Cloud API)
  return String(input).replace(/[^\d]/g, "");
}

function buildWhatsAppMessage({ ad, soyad, email, mesaj, pageUrl }) {
  const now = new Date();
  const parts = [
    "Yeni iletişim formu",
    "",
    `Ad: ${ad}`,
    `Soyad: ${soyad}`,
    `E-posta: ${email}`,
    "",
    "Mesaj:",
    mesaj,
    "",
    `Sayfa: ${pageUrl || "-"}`,
    `Tarih: ${now.toLocaleString("tr-TR")}`,
  ];
  return parts.join("\n");
}

app.post("/api/contact", async (req, res) => {
  try {
    const { ad, soyad, email, mesaj, pageUrl } = req.body || {};

    if (!ad || !soyad || !email || !mesaj) {
      return res.status(400).json({ ok: false, error: "Eksik alanlar var." });
    }

    if (String(mesaj).length > 2000) {
      return res.status(400).json({ ok: false, error: "Mesaj çok uzun." });
    }

    const bodyText = buildWhatsAppMessage({ ad, soyad, email, mesaj, pageUrl });
    const phone = normalizePhone(requiredEnv("CALLMEBOT_PHONE"));
    const apiKey = requiredEnv("CALLMEBOT_APIKEY");

    const url =
      "https://api.callmebot.com/whatsapp.php" +
      `?phone=${encodeURIComponent(phone)}` +
      `&text=${encodeURIComponent(bodyText)}` +
      `&apikey=${encodeURIComponent(apiKey)}`;

    const r = await fetch(url, { method: "GET" });
    const text = await r.text().catch(() => "");

    if (!r.ok) {
      return res.status(502).json({
        ok: false,
        error: "CallMeBot gönderimi başarısız.",
        status: r.status,
        details: text?.slice(0, 300) || undefined,
      });
    }

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || "Sunucu hatası." });
  }
});

app.get("/healthz", (req, res) => res.json({ ok: true }));

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

