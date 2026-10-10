import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px;">
        <h2 style="color: #10b981; margin-bottom: 4px;">New Contact / Consulting Inquiry</h2>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 0;">Received via TechPeppy.com</p>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 16px 0;" />
        
        <table style="width: 100%; font-size: 14px; color: #e2e8f0; line-height: 1.6;">
          <tr>
            <td style="width: 100px; color: #94a3b8; font-weight: bold;">Name:</td>
            <td>${name}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8; font-weight: bold;">Email:</td>
            <td><a href="mailto:${email}" style="color: #10b981;">${email}</a></td>
          </tr>
          <tr>
            <td style="color: #94a3b8; font-weight: bold;">Subject:</td>
            <td>${subject || "General Inquiry"}</td>
          </tr>
        </table>
        
        <div style="margin-top: 20px; padding: 16px; background: #1e293b; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #f1f5f9; white-space: pre-wrap;">${message}</p>
        </div>
        
        <p style="margin-top: 24px; font-size: 11px; color: #64748b;">
          TechPeppy Platform • Direct Inquiries: admin@techpeppy.com
        </p>
      </div>
    `;

    const res = await sendEmail({
      to: "admin@techpeppy.com",
      subject: `[TechPeppy Inquiry] ${subject || "New Message"} from ${name}`,
      html: emailHtml,
      text: `From: ${name} (${email})\nSubject: ${subject}\n\nMessage:\n${message}`,
    });

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully. We will get back to you shortly!",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
