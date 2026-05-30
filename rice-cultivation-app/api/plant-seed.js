import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { email } = req.body;

  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Rice Cultivation",
          email: email
        },
        to: [{ email }],
        subject: "🌱 Your seed has been planted",
        htmlContent: `
          <h2>Thank you for participating</h2>
          <p>Your rice seed has been added to the collective field.</p>
        `
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Email failed" });
  }
}