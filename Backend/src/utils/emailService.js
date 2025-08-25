const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    // ✅ FIXED: createTransport (not createTransporter)
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const sendOperatorCredentials = async (
  operatorEmail,
  operatorName,
  password
) => {
  try {
    console.log("📧 Creating Gmail transporter...");
    console.log("📧 Using email:", process.env.EMAIL);

    const transporter = createTransporter();

    // Test connection
    console.log("🔍 Testing Gmail connection...");
    await transporter.verify();
    console.log("✅ Gmail connection verified!");

    const mailOptions = {
      from: `"NHAI Admin" <${process.env.EMAIL}>`,
      to: operatorEmail,
      subject: "Your NHAI Operator Account Credentials",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🏛️ NHAI System</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Operator Account Created</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Dear <strong style="color: #667eea;">${operatorName}</strong>,</p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Your operator account has been successfully created! You can now access the NHAI system with the credentials below.
            </p>
            
            <!-- Credentials Box -->
            <div style="background: #f8f9ff; border: 2px solid #667eea; border-radius: 8px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #667eea; margin: 0 0 15px 0; font-size: 18px;">🔐 Your Login Credentials</h3>
              <div style="background: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                <p style="margin: 5px 0;"><strong>📧 Email:</strong> <code style="background: #e9ecef; padding: 3px 6px; border-radius: 3px; color: #495057;">${operatorEmail}</code></p>
                <p style="margin: 5px 0;"><strong>🔑 Password:</strong> <code style="background: #fff3cd; padding: 3px 6px; border-radius: 3px; color: #856404; font-weight: bold;">${password}</code></p>
              </div>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 25px; display: inline-block; font-weight: bold;">
                🚀 Ready to Get Started!
              </div>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
            <p style="font-size: 12px; color: #6c757d; margin: 0;">
              🔒 This is an automated security email. Please do not reply to this message.<br>
              © ${new Date().getFullYear()} NHAI - All rights reserved
            </p>
          </div>
        </div>
      `,
    };

    console.log("📤 Sending email to:", operatorEmail);
    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully! Message ID:", result.messageId);

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error("❌ Gmail sending error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = { sendOperatorCredentials };
