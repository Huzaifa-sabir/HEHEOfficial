const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Hehe Aligners Account",
    text: `Your verification code is: ${otp}\n\nUse this code to verify your email address and complete your Hehe Aligners account setup. This code expires in 10 minutes.\n\nGet ready to smile with confidence!\n\nThank you,\nThe Hehe Aligners Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; color: #fafafa; line-height: 1.6; margin: 0; padding: 0; background-color: #0a0a0a; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #0a0a0a; border-radius: 8px; border: 1px solid #333; }
          .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #8abcb9 0%, #a4cbc8 100%); color: #0a0a0a; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
          .header .tagline { font-size: 14px; margin-top: 5px; opacity: 0.9; }
          .content { padding: 30px 20px; background: #0a0a0a; color: #fafafa; }
          .smile-emoji { font-size: 32px; text-align: center; margin: 15px 0; }
          .otp { font-size: 28px; font-weight: bold; color: #8abcb9; text-align: center; margin: 25px 0; padding: 15px; background: rgba(138, 188, 185, 0.1); border-radius: 8px; border: 2px dashed #8abcb9; }
          .features { background: rgba(138, 188, 185, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid rgba(138, 188, 185, 0.2); }
          .features h3 { color: #8abcb9; margin-top: 0; }
          .features ul { margin: 0; padding-left: 20px; }
          .features li { margin: 8px 0; color: #fafafa; }
          .footer { text-align: center; font-size: 12px; color: #aaa; padding: 20px 0; border-top: 1px solid #333; }
          .footer a { color: #8abcb9; text-decoration: none; }
          .footer a:hover { color: #a4cbc8; }
          .cta { background: #8abcb9; color: #0a0a0a; padding: 12px 24px; border-radius: 25px; text-decoration: none; display: inline-block; margin: 15px 0; font-weight: bold; }
          .cta:hover { background: #a4cbc8; }
          p { color: #fafafa; }
          h2 { color: #fafafa; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Hehe Aligners</h1>
            <div class="tagline">Smile with Confidence</div>
          </div>
          <div class="content">
            <h2>Welcome to Your Smile Journey!</h2>
            <p>Thank you for choosing Hehe Aligners - where perfect smiles begin! We're excited to help you achieve the confident smile you've always wanted.</p>
            <p>Please use the following One-Time Password (OTP) to verify your email address and start your transformation:</p>
            <div class="otp">${otp}</div>
            <div class="features">
              <h3>What's Next?</h3>
              <ul>
                <li>Complete your smile assessment</li>
                <li>Get your personalized treatment plan</li>
                <li>Start your journey to a perfect smile</li>
              </ul>
            </div>
            <p>This code expires in 10 minutes. If you did not request this, please ignore this email or contact our support team.</p>
            <p>Get ready to say "Hehe" to your new smile! 😊</p>
            <p>Best regards,<br>The Hehe Aligners Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Hehe Aligners. All rights reserved.</p>
            <p><a href="https://www.hehealigners.com/contact">Contact Support</a> | <a href="https://www.hehealigners.com">Visit Our Website</a> | <a href="https://www.hehealigners.com/faq">FAQ</a></p>
            <p>Transform your smile, transform your confidence</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  await transporter.sendMail(mailOptions);
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `"HeHe Aligners" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback plain text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

module.exports = { sendVerificationEmail, sendEmail };
