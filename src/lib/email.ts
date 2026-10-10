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
