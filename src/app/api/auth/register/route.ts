import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { UserModel } from "@/lib/models/schemas";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, username, email, password } = await req.json();

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, "");
    const cleanEmail = email.toLowerCase().trim();

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
      const isAdmin = cleanEmail === "admin@techpeppy.com" || cleanUsername === "admin";

      const newUser = await UserModel.create({
        name: name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        role: isAdmin ? "admin" : "user",
        karma: isAdmin ? 5000 : 50,
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

      // Send welcome email via Titan Email SMTP (runs in background without blocking response)
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
      const isAdmin = cleanEmail === "admin@techpeppy.com" || cleanUsername === "admin";
      const sessionUser = {
        id: "user_" + Date.now(),
        name: name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`,
        role: isAdmin ? "admin" : "user" as any,
        karma: isAdmin ? 5000 : 50,
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
