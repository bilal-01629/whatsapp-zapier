// api/whatsapp-webhook.js

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL;

// Vercel Node Serverless Function (CommonJS)
module.exports = async (req, res) => {
  const method = req.method;

  // 1) Verification request (GET) from Meta
  if (method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("Verification request:", { mode, token, challenge });

    if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
      // Meta expects the plain challenge string
      return res.status(200).send(challenge);
    }

    console.warn("Verification failed");
    return res.sendStatus(403);
  }

  // 2) Real webhook notification (POST)
  if (method === "POST") {
    console.log("Incoming webhook body:", JSON.stringify(req.body, null, 2));

    try {
      const zapierRes = await fetch(ZAPIER_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body || {}),
      });

      console.log("Forwarded to Zapier, status:", zapierRes.status);
    } catch (err) {
      console.error("Error forwarding to Zapier:", err.message);
    }

    // Always reply 200 so Meta is happy
    return res.sendStatus(200);
  }

  // 3) Any other HTTP method
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
};
