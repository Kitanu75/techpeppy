import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { UserModel, PasswordResetTokenModel } from "@/lib/models/schemas";
import { sendPasswordResetEmail } from "@/lib/email";
import { getClientIp, checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);

    // Rate limit: Max 5 password reset requests per 15 minutes per IP
    const rateCheck = checkRateLimit(`forgot_ip_${ip}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many reset attempts. Please wait a few minutes before trying again.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database service temporarily unavailable." },
        { status: 503 }
      );
    }

    // Check if user exists
    const user = await UserModel.findOne({
      $or: [{ email: cleanEmail }, { username: cleanEmail }],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No account found with this email or username." },
        { status: 404 }
      );
    }

    const targetEmail = user.email;

    // Generate random 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    // Upsert into PasswordResetTokenModel
    await PasswordResetTokenModel.findOneAndUpdate(
      { email: targetEmail },
      { code, expiresAt },
      { upsert: true, new: true }
    );

    // Send email using Titan SMTP
    await sendPasswordResetEmail(targetEmail, code, user.name);

    return NextResponse.json({
      success: true,
      email: targetEmail,
      message: `A 6-digit verification code has been sent to ${targetEmail}.`,
    });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process password reset request." },
      { status: 500 }
    );
  }
}
