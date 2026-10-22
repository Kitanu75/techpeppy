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
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f17; color: #f8fafc; padding: 28px; border-radius: 12px; border: 1px solid #1e293b;">
        <h1 style="color: #10b981; margin-bottom: 8px; font-size: 22px;">Welcome to TechPeppy, u/${username}!</h1>
        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
          We're excited to have you in our engineering community. You can now:
        </p>
        <ul style="font-size: 14px; line-height: 1.8; color: #94a3b8;">
          <li>📝 Share engineering insights, architecture guides, and benchmarks</li>
          <li>📸 Post workspace setups and hardware gear</li>
          <li>⚡ Upvote technical posts and participate in discussion threads</li>
        </ul>
        <p style="margin-top: 24px;">
          <a href="https://techpeppy.com" style="background: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            Explore TechPeppy
          </a>
        </p>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0;" />
        <p style="font-size: 11px; color: #64748b;">TechPeppy.com • Software & AI Systems • admin@techpeppy.com</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(toEmail: string, code: string, name?: string) {
  return sendEmail({
    to: toEmail,
    subject: `TechPeppy Password Reset Code: ${code}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; color: #09090b; padding: 32px; border-radius: 16px; border: 1px solid #e4e4e7;">
        <div style="margin-bottom: 24px;">
          <span style="background: #059669; color: #ffffff; font-weight: 700; font-size: 13px; padding: 4px 10px; border-radius: 6px;">TechPeppy</span>
          <span style="font-size: 13px; color: #71717a; margin-left: 8px;">Engineering Publication</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #09090b;">Password Reset Verification</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #52525b; margin-bottom: 20px;">
          Hello ${name || "Developer"},<br />
          We received a request to reset your TechPeppy account password. Enter this 6-digit verification code to choose a new password:
        </p>
        <div style="background: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #059669;">${code}</span>
        </div>
        <p style="font-size: 12px; color: #71717a; line-height: 1.5;">
          This code will expire in <strong>15 minutes</strong>. If you did not request a password reset, you can safely disregard this email.
        </p>
        <hr style="border: 0; border-top: 1px solid #f4f4f5; margin: 24px 0;" />
        <p style="font-size: 11px; color: #a1a1aa; margin: 0;">© 2026 TechPeppy • admin@techpeppy.com</p>
      </div>
    `,
    text: `Your TechPeppy password reset code is: ${code}. It expires in 15 minutes.`,
  });
}
