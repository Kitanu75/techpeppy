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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-sm rounded-2xl border border-[#262626] bg-[#121212] shadow-2xl p-6 my-8 text-neutral-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-[#71767b] hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center mb-5">
          <h2 className="text-lg font-bold text-white">
            {mode === "login" ? "Sign In to TechPeppy" : "Create an Account"}
          </h2>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-[#181818] p-1 border border-[#262626] mb-4">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              mode === "login"
                ? "bg-white text-black"
                : "text-[#71767b] hover:text-white"
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
                ? "bg-white text-black"
                : "text-[#71767b] hover:text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-3.5 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <>
              <div>
                <label className="block text-xs text-[#71767b] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full rounded-xl border border-[#262626] bg-[#181818] py-2 px-3 text-xs sm:text-sm text-white placeholder-[#71767b] focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#71767b] mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full rounded-xl border border-[#262626] bg-[#181818] py-2 px-3 text-xs sm:text-sm text-white placeholder-[#71767b] focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#71767b] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full rounded-xl border border-[#262626] bg-[#181818] py-2 px-3 text-xs sm:text-sm text-white placeholder-[#71767b] focus:border-white focus:outline-none"
                />
              </div>
            </>
          )}

          {mode === "login" && (
            <div>
              <label className="block text-xs text-[#71767b] mb-1">Email or Username</label>
              <input
                type="text"
                required
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="admin@techpeppy.com"
                className="w-full rounded-xl border border-[#262626] bg-[#181818] py-2 px-3 text-xs sm:text-sm text-white placeholder-[#71767b] focus:border-white focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-[#71767b] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#262626] bg-[#181818] py-2 px-3 text-xs sm:text-sm text-white placeholder-[#71767b] focus:border-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white hover:bg-neutral-200 py-2 text-xs sm:text-sm font-semibold text-black disabled:opacity-50 transition-colors cursor-pointer mt-3"
          >
            {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-[#262626] flex items-center justify-between text-[11px] text-[#71767b]">
          <span>Need admin test?</span>
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Auto-fill Admin
          </button>
        </div>
      </div>
    </div>
  );
};
