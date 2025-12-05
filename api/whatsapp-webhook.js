// api/whatsapp-webhook.js

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL;

// Vercel Node serverless function (CommonJS style)
module.exports = async (req, res) => {
  const method = req.method;

  // 1) Verification request (GET)
  if (method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("Verification request:", { mode, token, challenge });

    if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
      // Meta expects the hub.challenge string in the response body
      return res.status(200).send(challenge);
    }

    console.warn("Verification failed");
    return res.sendStatus(403);
  }

  // 2) Real webhook message (POST)
  if (method === "POST") {
    console.log("Incoming webhook body:", JSON.stringify(req.body, null, 2));

    try {
      // Forward the payload to Zapier
      const zapierRes = await fetch(ZAPIER_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body || {}),
      });

      console.log("Forwarded to Zapier, status:", zapierRes.status);
    } catch (err) {
      console.error("Error forwarding to Zapier:", err.message);
    }

    // Always return 200 so Meta is happy
    return res.sendStatus(200);
  }

  // 3) Any other method
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
};
