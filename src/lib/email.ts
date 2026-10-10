import nodemailer from "nodemailer";

const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.titan.email";
const EMAIL_PORT = Number(process.env.EMAIL_PORT) || 465;
const EMAIL_USER = process.env.EMAIL_USER || "admin@techpeppy.com";
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = EMAIL_PASS
  ? nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    })
  : null;

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  if (!transporter) {
    console.log(`[Email Preview / No SMTP configured yet] To: ${to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"TechPeppy Community" <${EMAIL_USER}>`,
      to,
      subject,
      text: text || "",
      html: html || `<p>${text}</p>`,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(toEmail: string, username: string) {
  return sendEmail({
    to: toEmail,
    subject: "Welcome to TechPeppy — Where Developers & Creators Connect!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f1117; color: #f3f4f6; padding: 24px; border-radius: 12px;">
        <h1 style="color: #ff4500; margin-bottom: 8px;">Welcome to TechPeppy, u/${username}! 🔥</h1>
        <p style="font-size: 14px; line-height: 1.6; color: #d1d5db;">
          We're excited to have you in our tech community. You can now:
        </p>
        <ul style="font-size: 14px; line-height: 1.8; color: #9ca3af;">
          <li>📸 Share photos of your desk setups & hardware gear</li>
          <li>📝 Write tech articles, reviews, and questions</li>
          <li>⚡ Upvote posts and earn community Karma points</li>
        </ul>
        <p style="margin-top: 24px;">
          <a href="https://techpeppy.com" style="background: #ff4500; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Visit TechPeppy.com
          </a>
        </p>
        <hr style="border: 0; border-top: 1px solid #232838; margin: 24px 0;" />
        <p style="font-size: 11px; color: #6b7280;">TechPeppy.com • Support: admin@techpeppy.com</p>
      </div>
    `,
  });
}
