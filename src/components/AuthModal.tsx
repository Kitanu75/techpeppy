"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User, Shield, AlertCircle } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { usernameOrEmail: loginInput.trim(), password }
          : { name, username, email, password };

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
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setMode("login");
    setLoginInput("admin@techpeppy.com");
    setPassword("Techpeppy2026");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-sm rounded-2xl border border-[#eff3f4] bg-white shadow-xl p-6 my-8 text-[#0f1419]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-[#536471] hover:bg-[#f7f9fa] hover:text-[#0f1419] transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center mb-5">
          <h2 className="text-lg font-bold text-[#0f1419]">
            {mode === "login" ? "Sign In to TechPeppy" : "Create an Account"}
          </h2>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-[#f7f9fa] p-1 border border-[#eff3f4] mb-4">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              mode === "login"
                ? "bg-[#0f1419] text-white"
                : "text-[#536471] hover:text-[#0f1419]"
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
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              mode === "register"
                ? "bg-[#0f1419] text-white"
                : "text-[#536471] hover:text-[#0f1419]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-3.5 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#536471] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full rounded-xl border border-[#e1e8ed] bg-[#f7f9fa] py-2 px-3 text-xs sm:text-sm text-[#0f1419] placeholder-[#8b98a5] focus:border-[#0f1419] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#536471] mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full rounded-xl border border-[#e1e8ed] bg-[#f7f9fa] py-2 px-3 text-xs sm:text-sm text-[#0f1419] placeholder-[#8b98a5] focus:border-[#0f1419] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#536471] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full rounded-xl border border-[#e1e8ed] bg-[#f7f9fa] py-2 px-3 text-xs sm:text-sm text-[#0f1419] placeholder-[#8b98a5] focus:border-[#0f1419] focus:bg-white focus:outline-none"
                />
              </div>
            </>
          )}

          {mode === "login" && (
            <div>
              <label className="block text-xs font-medium text-[#536471] mb-1">Email or Username</label>
              <input
                type="text"
                required
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="admin@techpeppy.com"
                className="w-full rounded-xl border border-[#e1e8ed] bg-[#f7f9fa] py-2 px-3 text-xs sm:text-sm text-[#0f1419] placeholder-[#8b98a5] focus:border-[#0f1419] focus:bg-white focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#536471] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#e1e8ed] bg-[#f7f9fa] py-2 px-3 text-xs sm:text-sm text-[#0f1419] placeholder-[#8b98a5] focus:border-[#0f1419] focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#0f1419] hover:bg-[#272c30] py-2 text-xs sm:text-sm font-semibold text-white disabled:opacity-50 transition-colors cursor-pointer mt-3"
          >
            {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-[#eff3f4] flex items-center justify-between text-[11px] text-[#536471]">
          <span>Need admin test?</span>
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="font-semibold text-[#0f1419] hover:underline transition-colors cursor-pointer"
          >
            Auto-fill Admin
          </button>
        </div>
      </div>
    </div>
  );
};
