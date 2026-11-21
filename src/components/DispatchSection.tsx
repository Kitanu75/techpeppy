"use client";

import React, { useState } from "react";
import { Mail, Check } from "lucide-react";
import { SessionUser } from "@/lib/auth";

interface DispatchSectionProps {
  isPublicationSubscribed?: boolean;
  onSubscribePublication?: (email?: string) => Promise<void> | void;
  currentUser?: SessionUser | null;
}

export const DispatchSection: React.FC<DispatchSectionProps> = ({
  isPublicationSubscribed = false,
  onSubscribePublication,
  currentUser,
}) => {
  const [emailInput, setEmailInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleToggle = async () => {
    if (!onSubscribePublication || submitting) return;
    setEmailError("");
    setSubmitting(true);
    try {
      await onSubscribePublication();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubscribePublication || submitting) return;
    const trimmed = emailInput.trim();
    if (!trimmed) {
      await handleToggle();
      return;
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(trimmed)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setEmailError("");
    setSubmitting(true);
    try {
      await onSubscribePublication(trimmed);
      setEmailInput("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full py-8">
      <div className="rounded-xl border border-[#E4E4E7] bg-[#F4F4F5] px-5 py-6 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111315] text-white shrink-0">
            <Mail className="h-4 w-4 text-[#2DD4BF]" />
          </span>
          <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-[#111315]">
            Get new stories by email
          </h2>
        </div>

        <div className="w-full sm:w-auto">
          {isPublicationSubscribed ? (
            <div className="inline-flex items-center gap-4 rounded-lg border border-[#0F766E]/25 bg-[#F0FDFA] px-4 py-2 text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#0F766E]">
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                Subscribed
              </span>
              <button
                type="button"
                onClick={handleToggle}
                disabled={submitting}
                className="text-[#52525B] hover:text-[#111315] cursor-pointer"
              >
                Unsubscribe
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-1.5">
              <div className="flex gap-2">
                <label htmlFor="dispatch-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="dispatch-email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  placeholder={currentUser ? currentUser.email : "you@example.com"}
                  className="flex-1 sm:w-64 h-9.5 rounded-lg border border-[#D4D4D8] bg-white px-3 text-sm text-[#111315] placeholder-[#71717A] focus:border-[#0F766E] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-9.5 rounded-lg bg-[#111315] hover:bg-[#0F766E] px-4 text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
                >
                  {submitting ? "..." : "Subscribe"}
                </button>
              </div>
              {emailError && <p className="text-xs text-[#DC2626]">{emailError}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
