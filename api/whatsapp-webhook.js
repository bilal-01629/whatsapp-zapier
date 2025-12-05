// api/whatsapp-webhook.js

// Vercel Serverless Function: WhatsApp Cloud API -> Zapier

export default async function handler(req, res) {
  const ZAPIER_HOOK_URL = process.env.ZAPIER_HOOK_URL;
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  if (!ZAPIER_HOOK_URL || !VERIFY_TOKEN) {
    console.error("Missing env vars ZAPIER_HOOK_URL or VERIFY_TOKEN");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  if (req.method === "GET") {
    // Meta webhook verification
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("Verification request:", req.query);

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Webhook verified successfully");
      return res.status(200).send(challenge);
    } else {
      console.log("❌ Webhook verification failed");
      return res.sendStatus(403);
    }
  }

  if (req.method === "POST") {
    // Incoming WhatsApp message / button click
    console.log(
      "Incoming WhatsApp webhook:",
      JSON.stringify(req.body, null, 2)
    );

    try {
      const zapierRes = await fetch(ZAPIER_HOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });

      console.log("Forwarded to Zapier, status:", zapierRes.status);
    } catch (err) {
      console.error("Error forwarding to Zapier:", err.message);
    }

    // Always reply 200 so Meta is happy
    return res.sendStatus(200);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
