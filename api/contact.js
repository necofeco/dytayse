function normalizePhone(input) {
  return String(input || "").replace(/[^\d]/g, "");
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

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

module.exports = async function handler(req, res) {
  // CORS (optional but helpful)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const { ad, soyad, email, mesaj, pageUrl } = req.body || {};

    if (!ad || !soyad || !email || !mesaj) {
      return res.status(400).json({ ok: false, error: "Eksik alanlar var." });
    }

    if (String(mesaj).length > 2000) {
      return res.status(400).json({ ok: false, error: "Mesaj çok uzun." });
    }

    const phone = normalizePhone(requiredEnv("CALLMEBOT_PHONE"));
    const apiKey = requiredEnv("CALLMEBOT_APIKEY");
    const bodyText = buildWhatsAppMessage({ ad, soyad, email, mesaj, pageUrl });

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
}

