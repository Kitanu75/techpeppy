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

function evalPassword(pwd: string) {
  if (!pwd) return { score: 0, label: "", color: "bg-[#E4E4E7]", width: "w-0" };

  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (pwd.length >= 12) score += 1;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd)) score += 1;
  if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

  if (score <= 2) {
    return { score: 1, label: "Weak (add numbers & length)", color: "bg-red-600", width: "w-1/3" };
  } else if (score <= 3) {
    return { score: 2, label: "Medium (good)", color: "bg-amber-600", width: "w-2/3" };
  } else {
    return { score: 3, label: "Strong", color: "bg-[#0F766E]", width: "w-full" };
  }
}

const AuthModalContent: React.FC<Omit<AuthModalProps, "isOpen">> = ({
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

  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordStrength = useMemo(() => evalPassword(password), [password]);
  const newPasswordStrength = useMemo(() => evalPassword(newPassword), [newPassword]);

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111315]/70 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-xl border border-[#E4E4E7] bg-white shadow-2xl p-6 sm:p-7 my-8 text-[#111315]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 rounded-lg p-1.5 text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#111315] transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center mb-5">
          <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-[#111315]">
            {mode === "login" && "Sign in to TechPeppy"}
            {mode === "register" && "Create an account"}
            {mode === "forgot" && "Reset password"}
            {mode === "reset" && "Set new password"}
          </h2>
          <p className="text-xs text-[#71717A] mt-1">
            {mode === "login" && "Publish stories, vote, and join discussions"}
            {mode === "register" && "Free reader and contributor account"}
            {mode === "forgot" && "Enter your email to receive a 6-digit code"}
            {mode === "reset" && `Enter the 6-digit code sent to ${resetEmail}`}
          </p>
        </div>

        {(mode === "login" || mode === "register") && (
          <div className="flex rounded-lg bg-[#F4F4F5] p-1 border border-[#E4E4E7] mb-4">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                mode === "login"
                  ? "bg-white text-[#111315] shadow-2xs font-semibold"
                  : "text-[#52525B] hover:text-[#111315]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                mode === "register"
                  ? "bg-white text-[#111315] shadow-2xs font-semibold"
                  : "text-[#52525B] hover:text-[#111315]"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {error && (
          <div className="mb-3.5 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-[#DC2626]">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-3.5 flex items-start gap-2 rounded-lg bg-[#F0FDFA] border border-[#0F766E]/25 p-2.5 text-xs text-[#0F766E]">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-tight">{successMsg}</span>
          </div>
        )}

        {(mode === "login" || mode === "register") && (
          <form onSubmit={handleAuthSubmit} className="space-y-3">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-[#52525B] mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#71717A]" />
                    <input
                      type="text"
                      required
                      maxLength={50}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-lg border border-[#D4D4D8] bg-white py-2 pl-9 pr-3 text-sm text-[#111315] placeholder-[#71717A] focus:border-[#0F766E] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#52525B] mb-1">Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#71717A]">
                      @
                    </span>
                    <input
                      type="text"
                      required
                      maxLength={25}
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                      }
                      placeholder="username"
                      className="w-full rounded-lg border border-[#D4D4D8] bg-white py-2 pl-8 pr-3 text-sm text-[#111315] placeholder-[#71717A] focus:border-[#0F766E] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#52525B] mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#71717A]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-[#D4D4D8] bg-white py-2 pl-9 pr-3 text-sm text-[#111315] placeholder-[#71717A] focus:border-[#0F766E] focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {mode === "login" && (
              <div>
                <label className="block text-xs font-medium text-[#52525B] mb-1">
                  Email or Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#71717A]" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Enter your email or username"
                    className="w-full rounded-lg border border-[#D4D4D8] bg-white py-2 pl-9 pr-3 text-sm text-[#111315] placeholder-[#71717A] focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-[#52525B]">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(loginInput.trim());
                      setMode("forgot");
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] font-medium text-[#0F766E] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#71717A]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "login" ? "Enter your password" : "At least 8 characters"}
                  className="w-full rounded-lg border border-[#D4D4D8] bg-white py-2 pl-9 pr-9 text-sm text-[#111315] placeholder-[#71717A] focus:border-[#0F766E] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#111315] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              {mode === "register" && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-[#E4E4E7] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#71717A]">
                    <span>{passwordStrength.label}</span>
                    {password.length >= 8 && /\d/.test(password) && (
                      <span className="flex items-center gap-1 text-[#0F766E] font-medium">
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
              className="w-full rounded-lg bg-[#111315] hover:bg-[#0F766E] py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-colors cursor-pointer mt-3"
            >
              {loading ? "Authenticating..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleSendResetCode} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#52525B] mb-1">
                Account Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#71717A]" />
                <input
                  type="text"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full rounded-lg border border-[#D4D4D8] bg-white py-2 pl-9 pr-3 text-sm text-[#111315] placeholder-[#71717A] focus:border-[#0F766E] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#111315] hover:bg-[#0F766E] py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-colors cursor-pointer"
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
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#52525B] hover:text-[#111315] cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#52525B] mb-1">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#71717A]" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="w-full rounded-lg border border-[#D4D4D8] bg-white py-2 pl-9 pr-3 text-center text-sm tracking-widest text-[#111315] placeholder-[#A1A1AA] focus:border-[#0F766E] focus:outline-none tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#52525B] mb-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#71717A]" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-lg border border-[#D4D4D8] bg-white py-2 pl-9 pr-9 text-sm text-[#111315] placeholder-[#71717A] focus:border-[#0F766E] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#111315] cursor-pointer"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {newPassword.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-[#E4E4E7] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${newPasswordStrength.color} ${newPasswordStrength.width}`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#71717A]">
                    <span>{newPasswordStrength.label}</span>
                    {newPassword.length >= 8 && /\d/.test(newPassword) && (
                      <span className="flex items-center gap-1 text-[#0F766E] font-medium">
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
              className="w-full rounded-lg bg-[#111315] hover:bg-[#0F766E] py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-colors cursor-pointer mt-2"
            >
              {loading ? "Updating Password..." : "Reset Password & Sign In"}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={handleSendResetCode}
                className="font-medium text-[#0F766E] hover:underline cursor-pointer"
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
                className="inline-flex items-center gap-1 font-medium text-[#52525B] hover:text-[#111315] cursor-pointer"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 pt-4 border-t border-[#E4E4E7] flex items-center justify-center gap-1.5 text-[11px] text-[#71717A]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#0F766E]" />
          <span>Encrypted session cookie auth</span>
        </div>
      </div>
    </div>
  );
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, defaultMode = "login", ...rest }) => {
  if (!isOpen) return null;
  return <AuthModalContent key={defaultMode} defaultMode={defaultMode} {...rest} />;
};
