import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { UserModel } from "@/lib/models/schemas";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { getClientIp, checkRateLimit } from "@/lib/rateLimit";

const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "root",
  "system",
  "techpeppy",
  "support",
  "help",
  "moderator",
  "mod",
]);

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,25}$/;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);

    // 1. IP-level Rate Limiting for Account Creation (Anti-bot & spam registration defense)
    const rateCheck = checkRateLimit(`register_ip_${ip}`, 5, 3600000); // Max 5 registrations per hour per IP
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Registration threshold exceeded. Please try again later.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, username, email, password } = body;

    // 2. Strict Field Validation
    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || typeof username !== "string" || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid input format" },
        { status: 400 }
      );
    }

    // 3. Name Sanitization
    const cleanName = name.trim().slice(0, 50).replace(/[<>]/g, "");
    if (cleanName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // 4. Username Validation & Reserved Check
    const cleanUsername = username.toLowerCase().trim();
    if (!USERNAME_REGEX.test(cleanUsername)) {
      return NextResponse.json(
        {
          success: false,
          error: "Username must be 3-25 characters long and contain only letters, numbers, and underscores.",
        },
        { status: 400 }
      );
    }

    if (RESERVED_USERNAMES.has(cleanUsername)) {
      return NextResponse.json(
        {
          success: false,
          error: "This username is reserved. Please select another username.",
        },
        { status: 400 }
      );
    }

    // 5. Strict Email Validation
    const cleanEmail = email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // 6. Strong Password Cybersecurity Policy
    // Min 8 characters, at least 1 number and 1 letter
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    if (!hasNumber || !hasLetter) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must contain both letters and numbers for enhanced security.",
        },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    if (db) {
      const existingUser = await UserModel.findOne({
        $or: [{ email: cleanEmail }, { username: cleanUsername }],
      });

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            error:
              existingUser.email === cleanEmail
                ? "An account with this email already exists"
                : "Username is already taken, please choose another",
          },
          { status: 400 }
        );
      }

      const hashedPassword = await hashPassword(password);

      // SECURITY RULE: Public sign-ups are ALWAYS standard users.
      // Admin privileges cannot be acquired through public registration.
      const newUser = await UserModel.create({
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        role: "user",
        karma: 50,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`,
      });

      const sessionUser = {
        id: newUser._id.toString(),
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        role: newUser.role,
        karma: newUser.karma,
      };

      const token = signToken(sessionUser);

      // Send welcome email via Titan Email SMTP (background non-blocking)
      sendWelcomeEmail(cleanEmail, cleanUsername).catch((e) => console.log("Email error:", e));

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
      // Local fallback without DB
      const sessionUser = {
        id: "user_" + Date.now(),
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`,
        role: "user" as const,
        karma: 50,
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
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
