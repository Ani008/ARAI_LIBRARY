const nodemailer = require("nodemailer");
const fs = require("fs");
require("dotenv").config();

// SMTP Configuration (from .env)
const emailConfig = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
};

console.log("SMTP HOST USED:", process.env.SMTP_HOST);
console.log("SMTP PORT USED:", process.env.SMTP_PORT);

// Create transporter
const createTransporter = () => {
  const isLocal = process.env.EMAIL_MODE === "local";

  if (isLocal) {
    console.log("Using LOCAL SMTP");

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      tls: {
        rejectUnauthorized: false,
      },
    });
  } else {
    console.log("Using GMAIL SMTP");

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
};

// =========================
// 📩 SEND REVIEWER EMAIL
// =========================
const sendReviewerEmail = async (
  reviewerEmail,
  reviewerName,
  paperData,
  paperFilePath,
  customSubject = null,
  customBody = null,
) => {
  try {
    // Check file exists
    if (!fs.existsSync(paperFilePath)) {
      throw new Error("Paper file not found");
    }

    const transporter = createTransporter();

    const emailSubject =
      customSubject || `Research Paper Review Request: ${paperData.paperTitle}`;


    const mailOptions = {
      from: `"AJMT Journal" <${process.env.MAIL_FROM_AUTHORS}>`,
      to: reviewerEmail,
      subject: emailSubject,
      html: customBody, // ✅ FIXED
      attachments: [
        {
          filename: paperData.paperFileName || "research-paper.pdf",
          path: paperFilePath,
          contentType: "application/pdf",
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      message: "Reviewer email sent successfully",
    };
  } catch (error) {
    console.error("Reviewer Email Error:", error);
    throw error;
  }
};

// =========================
// 📰 SEND NEWS EMAIL
// =========================
const sendNewsEmail = async (to, subject, body) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Knowledge Centre" <${process.env.MAIL_FROM_NEWS}>`,
      to,
      subject,
      html: body,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      message: "News email sent successfully",
    };
  } catch (error) {
    console.error("News Email Error:", error);
    throw error;
  }
};

// =========================
// 🔍 TEST SMTP CONNECTION
// =========================
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();

    return {
      success: true,
      message: "SMTP configuration is valid",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

// =========================
// 👨‍🎓 SEND AUTHORS EMAIL (BULK)
// =========================
const sendAuthorsEmail = async (emails, subject, body) => {
  try {
    const transporter = createTransporter();

    const htmlContent = `
    <html>
      <body style="font-family: Arial; padding: 20px;">
        ${(body || "").replace(/\n/g, "<br>")}
      </body>
    </html>
    `;

    const mailOptions = {
      from: `"AJMT Editorial Team" <${process.env.MAIL_FROM_AUTHORS}>`,
      bcc: emails, // ✅ IMPORTANT (not "to")
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      message: "Authors email sent successfully",
    };
  } catch (error) {
    console.error("Authors Email Error:", error);
    throw error;
  }
};

// =========================
// 📦 EXPORTS
// =========================
module.exports = {
  sendReviewerEmail,
  sendNewsEmail,
  sendAuthorsEmail, // ✅ ADD THIS
  testEmailConfig,
};
