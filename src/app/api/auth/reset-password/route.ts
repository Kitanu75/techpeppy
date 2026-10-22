import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { UserModel, PasswordResetTokenModel } from "@/lib/models/schemas";
import { hashPassword, signToken, AUTH_COOKIE_NAME, SessionUser } from "@/lib/auth";
import { clearFailedLogin, getClientIp, checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);

    // Rate limit: Max 10 reset verification attempts per 15 minutes per IP
    const rateCheck = checkRateLimit(`reset_ip_${ip}`, 10, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many verification attempts. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, code, newPassword } = body;

    if (!email || typeof email !== "string" || !code || typeof code !== "string" || !newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { success: false, error: "Email, 6-digit code, and new password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database connection unavailable." },
        { status: 503 }
      );
    }

    // Verify OTP code
    const tokenRecord = await PasswordResetTokenModel.findOne({
      email: cleanEmail,
      code: cleanCode,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification code. Please request a new one." },
        { status: 400 }
      );
    }

    // Find User
    const user = await UserModel.findOne({ email: cleanEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User account not found." },
        { status: 404 }
      );
    }

    // Update password
    user.password = await hashPassword(newPassword);
    await user.save();

    // Delete used OTP
    await PasswordResetTokenModel.deleteOne({ _id: tokenRecord._id });

    // Clear any lockouts on this account & IP
    clearFailedLogin(`lockout_acc_${cleanEmail}`);
    clearFailedLogin(`lockout_ip_${ip}`);

    // Create session user and JWT
    const sessionUser: SessionUser = {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      karma: user.karma,
    };

    const token = signToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      message: "Password reset successfully! You are now logged in.",
      user: sessionUser,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Password reset error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to reset password." },
      { status: 500 }
    );
  }
}
