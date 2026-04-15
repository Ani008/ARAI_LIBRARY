const nodemailer = require("nodemailer");

exports.sendArrivalNewsEmail = async (req, res) => {
  try {
    const { email, html, subject } = req.body;

    // ✅ validation
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // ✅ USE FRONTEND HTML (NOT generateHTML)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject || "ARAI Knowledge Center Modules",
      html: html, // 🔥 IMPORTANT CHANGE
    });

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};