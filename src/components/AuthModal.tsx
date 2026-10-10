"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User, Shield, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
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
  const [loginInput, setLoginInput] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, username, email, password }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Registration failed");
        onSuccess(data.user);
        onClose();
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login: loginInput, password }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Login failed");
        onSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setMode("login");
    setLoginInput("admin@techpeppy.com");
    setPassword("SupermanNoida@3364");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl border border-[#2b3248] bg-[#161924] shadow-2xl p-6 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-1 text-gray-400 hover:bg-[#202534] hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {mode === "login" ? "Welcome Back to TechPeppy" : "Join TechPeppy Platform"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === "login"
              ? "Sign in to post discussions, share setups, and upvote"
              : "Create an account to join the software & AI engineering community"}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-[#10121a] p-1 border border-[#232838] mb-5">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
              mode === "login"
                ? "bg-[#202535] text-white shadow-sm border border-[#2e374f]"
                : "text-gray-400 hover:text-gray-200"
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
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
              mode === "register"
                ? "bg-[#202535] text-white shadow-sm border border-[#2e374f]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sandeep Kumar"
                    className="w-full rounded-xl border border-[#1e293b] bg-[#141e33] py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Username (unique handle)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    u/
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="sandeep_tech"
                    className="w-full rounded-xl border border-[#1e293b] bg-[#141e33] py-2.5 pl-9 pr-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@techpeppy.com"
                    className="w-full rounded-xl border border-[#1e293b] bg-[#141e33] py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {mode === "login" && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Username or Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="admin@techpeppy.com or username"
                  className="w-full rounded-xl border border-[#1e293b] bg-[#141e33] py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#1e293b] bg-[#141e33] py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm disabled:opacity-50 transition-all cursor-pointer mt-4"
          >
            {loading
              ? "Authenticating..."
              : mode === "login"
              ? "Sign In to TechPeppy"
              : "Create Account"}
          </button>
        </form>

        {/* Quick Admin Credentials Hint */}
        <div className="mt-5 pt-4 border-t border-[#1e293b] flex items-center justify-between text-[11px] text-slate-400">
          <span>Admin login?</span>
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Use Admin Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
