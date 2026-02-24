const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Email configuration
// IMPORTANT: Update these with your actual email credentials
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    // Hardcode these JUST for this test to confirm it works
    user: 'aniketchakke63@gmail.com',
    pass: 'xjtkfiaphaladquv' 
  }
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport(emailConfig);
};

// Generate email template for reviewer
const generateReviewerEmailTemplate = (reviewerName, paperTitle, paperSubject, authorNames) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Research Paper Review Request</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #2c3e50;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: #f9f9f9;
      padding: 30px;
      border: 1px solid #ddd;
      border-radius: 0 0 5px 5px;
    }
    .paper-details {
      background-color: white;
      padding: 15px;
      margin: 20px 0;
      border-left: 4px solid #3498db;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #777;
    }
    h1 {
      margin: 0;
      font-size: 24px;
    }
    h2 {
      color: #2c3e50;
      font-size: 18px;
    }
    .highlight {
      color: #3498db;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Research Paper Review Request</h1>
  </div>
  
  <div class="content">
    <p>Dear <strong>${reviewerName}</strong>,</p>
    
    <p>We hope this email finds you well. We are writing to request your expertise in reviewing a research paper submitted to our journal.</p>
    
    <div class="paper-details">
      <h2>Paper Details:</h2>
      <p><strong>Title:</strong> ${paperTitle}</p>
      <p><strong>Subject:</strong> ${paperSubject}</p>
      <p><strong>Author(s):</strong> ${authorNames}</p>
    </div>
    
    <p>Please find the research paper attached to this email. We would greatly appreciate your review and feedback on the following aspects:</p>
    
    <ul>
      <li>Originality and significance of the research</li>
      <li>Methodology and approach</li>
      <li>Quality of analysis and results</li>
      <li>Clarity and organization of the paper</li>
      <li>Plagiarism check and proper citations</li>
    </ul>
    
    <p>We kindly request that you complete your review within <span class="highlight">2-3 weeks</span> from the date of this email.</p>
    
    <p>If you have any questions or need additional information, please do not hesitate to contact us.</p>
    
    <p>Thank you for your time and valuable contribution to academic research.</p>
    
    <p><strong>Best regards,</strong><br>
    AJMT Editorial Team<br>
    Academic Journal Management Tool</p>
    
    <div class="footer">
      <p>This is an automated email from the AJMT system. Please do not reply directly to this email.</p>
      <p>If you need assistance, please contact the editorial team.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Send email to reviewer with PDF attachment
const sendReviewerEmail = async (reviewerEmail, reviewerName, paperData, paperFilePath, customSubject = null, customBody = null) => {
  try {
    // Check if file exists
    if (!fs.existsSync(paperFilePath)) {
      throw new Error('Paper file not found');
    }

    // Get author names
    const authorNames = paperData.authors.map(a => a.authorName).join(', ');

    // Use custom template if provided, otherwise use default
    const emailSubject = customSubject || `Research Paper Review Request: ${paperData.paperTitle}`;
    const htmlContent = customBody 
      ? `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    ${customBody.replace(/\n/g, '<br>')}
  </div>
</body>
</html>`
      : generateReviewerEmailTemplate(reviewerName, paperData.paperTitle, paperData.titleSubject, authorNames);

    // Create transporter
    const transporter = createTransporter();

    // Email options
    const mailOptions = {
      from: `"AJMT Editorial Team" <${emailConfig.auth.user}>`,
      to: reviewerEmail,
      subject: emailSubject,
      html: htmlContent,
      attachments: [
        {
          filename: paperData.paperFileName || 'research-paper.pdf',
          path: paperFilePath,
          contentType: 'application/pdf'
        }
      ]
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    };

  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = {
  sendReviewerEmail,
  testEmailConfig,
  generateReviewerEmailTemplate
};