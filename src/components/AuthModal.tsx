"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { SessionUser } from "@/lib/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: SessionUser) => void;
  defaultMode?: "login" | "register";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultMode = "login",
}) => {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginInput, setLoginInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Password Strength Calculator (Cybersecurity standard)
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "bg-[#E8E5DD]" };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score <= 2) {
      return { score: 1, label: "Weak (add numbers & length)", color: "bg-rose-500", width: "w-1/3" };
    } else if (score <= 3) {
      return { score: 2, label: "Medium (good)", color: "bg-amber-500", width: "w-2/3" };
    } else {
      return { score: 3, label: "Strong & Secure", color: "bg-emerald-600", width: "w-full" };
    }
  }, [password]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side Cybersecurity Pre-checks
    if (mode === "register") {
      if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
      if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
        setError("Password must include both letters and numbers.");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { login: loginInput.trim(), usernameOrEmail: loginInput.trim(), password }
          : { name: name.trim(), username: username.trim(), email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Authentication failed");
      }

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-sm rounded-2xl border border-[#E8E5DD] bg-white shadow-2xl p-6 my-8 text-[#1C1B18] transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 rounded-full p-1.5 text-[#8C8A83] hover:bg-[#F1EFE9] hover:text-[#1C1B18] transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center mb-5">
          <h2 className="text-lg font-bold text-[#1C1B18]">
            {mode === "login" ? "Sign In to TechPeppy" : "Create Developer Account"}
          </h2>
          <p className="text-xs text-[#8C8A83] mt-0.5">
            {mode === "login"
              ? "Access your architectural feeds & discussions"
              : "Join our developer & engineering community"}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-[#F1EFE9] p-1 border border-[#E8E5DD] mb-4">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              mode === "login"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[#4A4843] hover:text-[#1C1B18]"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              mode === "register"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-[#4A4843] hover:text-[#1C1B18]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert with Icon */}
        {error && (
          <div className="mb-3.5 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#8C8A83] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8C8A83]" />
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Henderson"
                    className="w-full rounded-xl border border-[#E8E5DD] bg-[#F8F7F4] py-2 pl-9 pr-3 text-xs sm:text-sm text-[#1C1B18] placeholder-[#ACA9A2] focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8C8A83] mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#8C8A83]">
                    u/
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={25}
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                    }
                    placeholder="alex_dev"
                    className="w-full rounded-xl border border-[#E8E5DD] bg-[#F8F7F4] py-2 pl-8 pr-3 text-xs sm:text-sm text-[#1C1B18] placeholder-[#ACA9A2] focus:border-emerald-500 focus:bg-white focus:outline-none font-mono transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8C8A83] mb-1">
                  Work / Personal Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8C8A83]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full rounded-xl border border-[#E8E5DD] bg-[#F8F7F4] py-2 pl-9 pr-3 text-xs sm:text-sm text-[#1C1B18] placeholder-[#ACA9A2] focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {mode === "login" && (
            <div>
              <label className="block text-xs font-medium text-[#8C8A83] mb-1">
                Email or Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8C8A83]" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="Enter your email or username"
                  className="w-full rounded-xl border border-[#E8E5DD] bg-[#F8F7F4] py-2 pl-9 pr-3 text-xs sm:text-sm text-[#1C1B18] placeholder-[#ACA9A2] focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#8C8A83]">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8C8A83]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "login" ? "Enter your password" : "At least 8 characters"}
                className="w-full rounded-xl border border-[#E8E5DD] bg-[#F8F7F4] py-2 pl-9 pr-9 text-xs sm:text-sm text-[#1C1B18] placeholder-[#ACA9A2] focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8A83] hover:text-[#1C1B18] cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Password Strength Indicator (For Registration) */}
            {mode === "register" && password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-[#F1EFE9] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#8C8A83]">
                  <span>Strength: {passwordStrength.label}</span>
                  {password.length >= 8 && /\d/.test(password) && (
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="h-3 w-3" /> Valid
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs disabled:opacity-50 transition-all cursor-pointer mt-3"
          >
            {loading ? "Authenticating..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Security / Cybersecurity Trust Footer */}
        <div className="mt-5 pt-3.5 border-t border-[#E8E5DD] flex items-center justify-center gap-1.5 text-[11px] text-[#8C8A83]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>256-bit SSL encrypted • Brute-force protected</span>
        </div>
      </div>
    </div>
  );
};
