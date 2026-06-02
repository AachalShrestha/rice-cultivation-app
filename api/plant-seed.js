import axios from "axios";

export default async function handler(req, res) {
  console.log("API HIT");
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const { email, name } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  try {
    // -------------------------------
    // 1. CHECK IF CONTACT EXISTS
    // -------------------------------
    let contactExists = false;

    try {
      await axios.get(
        `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY
          }
        }
      );

      contactExists = true;
    } catch (err) {
      // If 404 → contact does NOT exist (this is expected)
      if (err.response?.status === 404) {
        contactExists = false;
      } else {
        throw err;
      }
    }

    // -------------------------------
    // 2. CREATE CONTACT IF NOT EXISTS
    // -------------------------------
    if (!contactExists) {
      await axios.post(
        "https://api.brevo.com/v3/contacts",
        {
          email,
          attributes: {
            FIRSTNAME: name || ""
          },
          listIds: [2] // optional: add list ID later if you want automations
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // -------------------------------
    // 3. SEND EMAIL
    // -------------------------------
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "From Seed to Grain",
          email: "no-reply@fromseedtograin.online"
        },
        to: [{ email }],
        subject: "🌱 Your seed has been planted",
        htmlContent: `
          <h2>🌱 Your seed has been planted</h2>

          <p>Hi ${name || "farmer"},</p>

          <p>Your rice seed has entered the digital field.</p>
          <p>You can return anytime to follow its growth.</p>

          <br>

          <p>— From Seed to Grain</p>
        `
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    // -------------------------------
    // SUCCESS RESPONSE
    // -------------------------------
    return res.status(200).json({
      success: true,
      message: "Contact saved + email sent 🌱"
    });

  } catch (err) {
    console.log("BREVO ERROR:", err.response?.data || err.message);

    return res.status(500).json({
      error: "Email or contact creation failed"
    });
  }
}