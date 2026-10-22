"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  KeyRound,
  ArrowLeft,
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
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset">(defaultMode);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginInput, setLoginInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Forgot / Reset Password state
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, defaultMode]);

  // Dynamic Password Strength Calculator (Cybersecurity standard)
  const evalPassword = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "bg-zinc-200", width: "w-0" };

    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

    if (score <= 2) {
      return { score: 1, label: "Weak (add numbers & length)", color: "bg-rose-500", width: "w-1/3" };
    } else if (score <= 3) {
      return { score: 2, label: "Medium (good)", color: "bg-amber-500", width: "w-2/3" };
    } else {
      return { score: 3, label: "Strong & Secure", color: "bg-emerald-600", width: "w-full" };
    }
  };

  const passwordStrength = useMemo(() => evalPassword(password), [password]);
  const newPasswordStrength = useMemo(() => evalPassword(newPassword), [newPassword]);

  if (!isOpen) return null;

  // Handle Login & Registration Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

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

  // Step 1: Send 6-digit OTP code to email
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const target = resetEmail.trim() || loginInput.trim();
    if (!target) {
      setError("Please enter your account email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: target }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to send reset code.");
      }

      setResetEmail(data.email || target);
      setSuccessMsg(`A 6-digit verification code has been sent to ${data.email || target}.`);
      setMode("reset");
    } catch (err: any) {
      setError(err.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and save new password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!resetCode.trim() || resetCode.trim().length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail.trim(),
          code: resetCode.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to reset password.");
      }

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-sm rounded-2xl border border-zinc-200/90 bg-white shadow-2xl p-6 my-8 text-zinc-950 transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Titles & Subtitles */}
        <div className="text-center mb-5">
          <h2 className="text-lg font-bold text-zinc-950">
            {mode === "login" && "Sign In to TechPeppy"}
            {mode === "register" && "Create Developer Account"}
            {mode === "forgot" && "Reset Password"}
            {mode === "reset" && "Set New Password"}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {mode === "login" && "Access your architectural feeds & discussions"}
            {mode === "register" && "Join our developer & engineering community"}
            {mode === "forgot" && "Enter your email to receive a 6-digit verification code"}
            {mode === "reset" && `Enter the 6-digit code sent to ${resetEmail}`}
          </p>
        </div>

        {/* Tab Toggle (Only visible in login & register modes) */}
        {(mode === "login" || mode === "register") && (
          <div className="flex rounded-xl bg-zinc-100 p-1 border border-zinc-200/60 mb-4">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-white text-zinc-950 shadow-xs border border-zinc-200/60"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-white text-zinc-950 shadow-xs border border-zinc-200/60"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-3.5 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-3.5 flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="leading-tight">{successMsg}</span>
          </div>
        )}

        {/* ===== MODE 1 & 2: LOGIN & REGISTER FORMS ===== */}
        {(mode === "login" || mode === "register") && (
          <form onSubmit={handleAuthSubmit} className="space-y-3">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      required
                      maxLength={50}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Henderson"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 py-2 pl-9 pr-3 text-xs sm:text-sm text-zinc-950 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">
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
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 py-2 pl-8 pr-3 text-xs sm:text-sm text-zinc-950 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none font-mono transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">
                    Work / Personal Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 py-2 pl-9 pr-3 text-xs sm:text-sm text-zinc-950 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {mode === "login" && (
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">
                  Email or Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Enter your email or username"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 py-2 pl-9 pr-3 text-xs sm:text-sm text-zinc-950 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-zinc-500">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(loginInput.trim());
                      setMode("forgot");
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "login" ? "Enter your password" : "At least 8 characters"}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 py-2 pl-9 pr-9 text-xs sm:text-sm text-zinc-950 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-950 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Password Strength Indicator (For Registration) */}
              {mode === "register" && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
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
              className="w-full rounded-xl bg-zinc-950 hover:bg-zinc-800 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs disabled:opacity-50 transition-all cursor-pointer mt-3"
            >
              {loading ? "Authenticating..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        )}

        {/* ===== MODE 3: FORGOT PASSWORD (STEP 1: REQUEST OTP) ===== */}
        {mode === "forgot" && (
          <form onSubmit={handleSendResetCode} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Account Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your registered email address"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 py-2 pl-9 pr-3 text-xs sm:text-sm text-zinc-950 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-zinc-950 hover:bg-zinc-800 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? "Sending Code..." : "Send Verification Code"}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 cursor-pointer transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* ===== MODE 4: RESET PASSWORD (STEP 2: VERIFY OTP & ENTER NEW PASSWORD) ===== */}
        {mode === "reset" && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 py-2 pl-9 pr-3 text-center text-sm font-mono tracking-widest text-zinc-950 placeholder-zinc-300 focus:border-zinc-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 py-2 pl-9 pr-9 text-xs sm:text-sm text-zinc-950 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-950 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Password strength meter */}
              {newPassword.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${newPasswordStrength.color} ${newPasswordStrength.width}`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Strength: {newPasswordStrength.label}</span>
                    {newPassword.length >= 8 && /\d/.test(newPassword) && (
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
              className="w-full rounded-xl bg-zinc-950 hover:bg-zinc-800 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs disabled:opacity-50 transition-all cursor-pointer mt-2"
            >
              {loading ? "Updating Password..." : "Reset Password & Sign In"}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={handleSendResetCode}
                className="font-medium text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
              >
                Resend code
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="inline-flex items-center gap-1 font-semibold text-zinc-600 hover:text-zinc-950 cursor-pointer transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* Security / Cybersecurity Trust Footer */}
        <div className="mt-5 pt-3.5 border-t border-zinc-100 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>256-bit SSL encrypted • Brute-force protected</span>
        </div>
      </div>
    </div>
  );
};
