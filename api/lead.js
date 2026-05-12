module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  const subject = process.env.LEAD_SUBJECT || "LEAD|FacebookAds|pub_odars";

  if (!webhookUrl) {
    return res.status(500).json({ error: "Missing MAKE_WEBHOOK_URL" });
  }

  const {
    nom = "",
    prenom = "",
    email = "",
    telephone = "",
    secteur_recherche = "",
    message = "",
    landing_page = ""
  } = req.body || {};

  const ipHeader = req.headers["x-forwarded-for"];
  const ip =
    (Array.isArray(ipHeader) ? ipHeader[0] : ipHeader || "").split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "";

  const emailBody = [
    "Nouveau lead Meta Ads - Odars",
    "",
    `Nom : ${nom}`,
    `Prenom : ${prenom}`,
    `Email : ${email}`,
    `Telephone : ${telephone}`,
    `Secteur de recherche : ${secteur_recherche}`,
    `Message : ${message}`,
    `Landing page : ${landing_page}`,
    `IP : ${ip}`
  ].join("\n");

  const payload = {
    nom,
    prenom,
    email,
    telephone,
    secteur_recherche,
    message,
    landing_page,
    IP: ip,
    subject,
    email_body: emailBody
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const details = await response.text();
      return res.status(502).json({
        error: "Webhook request failed",
        details
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      error: "Unexpected server error",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};
