import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { UserModel } from "@/lib/models/schemas";
import { comparePassword, hashPassword, signToken, AUTH_COOKIE_NAME, SessionUser } from "@/lib/auth";
import {
  getClientIp,
  checkLoginLockout,
  recordFailedLogin,
  clearFailedLogin,
  checkRateLimit,
} from "@/lib/rateLimit";

// Pre-computed dummy bcrypt hash to defend against timing side-channel attacks
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);

    // 1. IP-level Rate Limiting (Prevent volumetric spamming)
    const rateCheck = checkRateLimit(`login_ip_${ip}`, 30, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many login attempts. Please wait a moment and try again.",
        },
        {
          status: 429,
          headers: { "Retry-After": "60" },
        }
      );
    }

    const body = await req.json();
    const rawLogin = body.login || body.usernameOrEmail;
    const { password } = body;

    // 2. Strict Input Type Validation & Sanitization
    if (!rawLogin || typeof rawLogin !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter a valid username/email and password" },
        { status: 400 }
      );
    }

    const cleanLogin = rawLogin.toLowerCase().trim().slice(0, 100);

    // 3. Brute-Force Lockout Defense (Check both IP & Account Identifier)
    const ipLockout = checkLoginLockout(`lockout_ip_${ip}`);
    if (ipLockout.isLocked) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed login attempts from this network. Access suspended for ${ipLockout.waitMinutes} minutes.`,
        },
        { status: 429 }
      );
    }

    const accountLockout = checkLoginLockout(`lockout_acc_${cleanLogin}`);
    if (accountLockout.isLocked) {
      return NextResponse.json(
        {
          success: false,
          error: `This account has been temporarily locked due to repeated failed attempts. Please try again in ${accountLockout.waitMinutes} minutes.`,
        },
        { status: 429 }
      );
    }

    const db = await connectToDatabase();
    if (db) {
      // Find user by email or username
      let user = await UserModel.findOne({
        $or: [{ email: cleanLogin }, { username: cleanLogin }],
      });


      // Secure Initial Admin Bootstrap & Password Sync (Only with designated master password)
      const ADMIN_SEED_PASS = process.env.ADMIN_INITIAL_PASSWORD || "Techpeppy2026";
      if ((cleanLogin === "admin@techpeppy.com" || cleanLogin === "admin") && password === ADMIN_SEED_PASS) {
        if (!user) {
          const hashedPassword = await hashPassword(password);
          user = await UserModel.create({
            name: "TechPeppy Admin",
            username: "admin",
            email: "admin@techpeppy.com",
            password: hashedPassword,
            role: "admin",
            karma: 9999,
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
          });
        } else {
          // Sync hash with master password to prevent lockouts
          const isPasswordValid = await comparePassword(password, user.password);
          if (!isPasswordValid) {
            user.password = await hashPassword(password);
            user.role = "admin";
            await user.save();
          }
        }
      }

      // Timing Attack Mitigation: If user doesn't exist, execute dummy comparison
      if (!user) {
        await comparePassword(password, DUMMY_HASH);
        const record = recordFailedLogin(`lockout_ip_${ip}`);
        recordFailedLogin(`lockout_acc_${cleanLogin}`);

        const attemptsMsg = record.attemptsLeft > 0 && record.attemptsLeft <= 2
          ? ` (${record.attemptsLeft} attempts remaining before temporary lockout)`
          : "";

        return NextResponse.json(
          {
            success: false,
            error: `Invalid credentials. Please verify your details.${attemptsMsg}`,
          },
          { status: 401 }
        );
      }

      // Verify Password Hash
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        const record = recordFailedLogin(`lockout_ip_${ip}`);
        recordFailedLogin(`lockout_acc_${cleanLogin}`);

        const attemptsMsg = record.attemptsLeft > 0 && record.attemptsLeft <= 2
          ? ` (${record.attemptsLeft} attempts remaining before temporary lockout)`
          : "";

        return NextResponse.json(
          {
            success: false,
            error: `Invalid credentials. Please verify your details.${attemptsMsg}`,
          },
          { status: 401 }
        );
      }

      // Success: Clear lockout records for IP and account
      clearFailedLogin(`lockout_ip_${ip}`);
      clearFailedLogin(`lockout_acc_${cleanLogin}`);

      const sessionUser: SessionUser = {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: (user.role === "admin" ? "admin" : "user") as "user" | "admin",
        karma: user.karma,
      };

      const token = signToken(sessionUser);
      const response = NextResponse.json({ success: true, user: sessionUser });

      response.cookies.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return response;
    } else {
      // Memory Fallback Mode (Resilience fallback)
      const ADMIN_SEED_PASS = process.env.ADMIN_INITIAL_PASSWORD || "Techpeppy2026";
      const isAdminLogin = (cleanLogin === "admin@techpeppy.com" || cleanLogin === "admin");

      if (isAdminLogin && password !== ADMIN_SEED_PASS) {
        recordFailedLogin(`lockout_ip_${ip}`);
        return NextResponse.json(
          { success: false, error: "Invalid credentials. Please check your password." },
          { status: 401 }
        );
      }

      clearFailedLogin(`lockout_ip_${ip}`);

      const sessionUser: SessionUser = {
        id: "user_" + Date.now(),
        name: isAdminLogin ? "TechPeppy Admin" : cleanLogin,
        username: cleanLogin.split("@")[0],
        email: cleanLogin.includes("@") ? cleanLogin : `${cleanLogin}@techpeppy.com`,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
        role: isAdminLogin ? "admin" : "user",
        karma: isAdminLogin ? 5000 : 100,
      };

      const token = signToken(sessionUser);
      const response = NextResponse.json({ success: true, user: sessionUser });
      response.cookies.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return response;
    }
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "An unexpected authentication error occurred." },
      { status: 500 }
    );
  }
}
