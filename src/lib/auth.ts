import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import connectToDatabase from "./mongodb";
import { UserModel } from "./models/schemas";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "techpeppy-secret-key-2026";
const COOKIE_NAME = "techpeppy_auth";

export interface SessionUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role: "user" | "admin";
  karma: number;
}

export function signToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
