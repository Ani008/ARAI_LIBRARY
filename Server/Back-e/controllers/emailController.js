const nodemailer = require("nodemailer");
const { sendNewsEmail } = require("../services/emailService");

exports.sendArrivalNewsEmail = async (req, res) => {
  try {
    const { email, html, subject } = req.body;

    // ✅ validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // ✅ Call service (SMTP-based)
    const result = await sendNewsEmail(
      email,
      subject || "ARAI Knowledge Center Modules",
      html
    );

    res.json({
      success: true,
      message: "News/Arrival email sent successfully",
      data: result,
    });

  } catch (err) {
    console.error("Arrival News Email Error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: err.message,
    });
  }
};