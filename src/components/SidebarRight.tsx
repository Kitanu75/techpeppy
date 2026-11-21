"use client";

import React, { useMemo, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { SessionUser } from "@/lib/auth";
import { PostType } from "@/lib/models/types";

interface SidebarRightProps {
  openAboutModal?: () => void;
  openContactModal?: () => void;
  setActiveCommunity: (slug: string) => void;
  onSelectTag?: (tag: string) => void;
  posts?: PostType[];
  isPublicationSubscribed?: boolean;
  subscriberCount?: number;
  onSubscribePublication?: (email?: string) => Promise<void> | void;
  currentUser?: SessionUser | null;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({
  openAboutModal,
  openContactModal,
  onSelectTag,
  posts = [],
  isPublicationSubscribed = false,
  subscriberCount = 0,
  onSubscribePublication,
  currentUser,
}) => {
  const [emailInput, setEmailInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Compute real tag counts from currently loaded posts — zero fake numbers
  const activeTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const rawTag of post.tags || []) {
        const tag = rawTag.trim();
        if (!tag) continue;
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  const handleToggleSubscribe = async () => {
    if (!onSubscribePublication || submitting) return;
    setEmailError("");
    setSubmitting(true);
    try {
      await onSubscribePublication();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubscribePublication || submitting) return;
    const trimmed = emailInput.trim();
    if (!trimmed) {
      await handleToggleSubscribe();
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
    <aside className="hidden xl:block w-72 shrink-0 pl-8">
      <div className="sticky top-20 divide-y divide-[#E2E8F0]">
        {/* About & Subscribe */}
        <section className="pb-6">
          <h2 className="text-sm font-semibold text-[#0F172A]">About TechPeppy</h2>
          <p className="mt-2 text-[13px] text-[#475569] leading-relaxed">
            An open engineering publication by{" "}
            <span className="font-medium text-[#0F172A]">Sandeep Kumar</span> covering
            software architecture, applied AI, data systems, and workspaces.
          </p>

          <p className="mt-2.5 text-xs text-[#64748B] tabular-nums">
            {subscriberCount > 0
              ? `${subscriberCount} ${subscriberCount === 1 ? "subscriber" : "subscribers"} · Free & open`
              : "100% Free & open"}
          </p>

          {/* Subscribe Control */}
          <div className="mt-4">
            {isPublicationSubscribed ? (
              <div className="flex items-center justify-between rounded-md border border-[#10B981]/30 bg-[#ECFDF5] px-3 py-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium text-[#059669]">
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  Subscribed to updates
                </span>
                <button
                  type="button"
                  onClick={handleToggleSubscribe}
                  disabled={submitting}
                  className="text-[#475569] hover:text-[#0F172A] cursor-pointer"
                >
                  Unsubscribe
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailSubscribe} className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    placeholder={currentUser ? currentUser.email : "you@example.com"}
                    aria-label="Email address for newsletter updates"
                    className="flex-1 min-w-0 h-8.5 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:bg-white focus:border-[#0F172A] focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-8.5 rounded-md bg-[#0F172A] hover:bg-[#1E293B] px-3 text-xs font-medium text-white transition-colors cursor-pointer shrink-0"
                  >
                    {submitting ? "..." : "Subscribe"}
                  </button>
                </div>
                {emailError && <p className="text-xs text-[#DC2626]">{emailError}</p>}
              </form>
            )}
          </div>
        </section>

        {/* Active Tags from Real Posts */}
        {activeTags.length > 0 && (
          <section className="py-6">
            <h2 className="text-xs font-medium text-[#64748B] mb-3">Popular tags</h2>
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {activeTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onSelectTag?.(tag)}
                  className="text-[13px] text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer"
                >
                  #{tag}
                  <span className="ml-1 text-xs text-[#94A3B8] tabular-nums">{count}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Direct Links & Footer */}
        <section className="pt-6 space-y-3">
          {openContactModal && (
            <button
              type="button"
              onClick={openContactModal}
              className="inline-flex items-center gap-1 text-[13px] font-medium text-[#0F172A] hover:text-[#059669] transition-colors cursor-pointer"
            >
              <span>Consulting & inquiries</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          )}

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#64748B]">
            {openAboutModal && (
              <>
                <button
                  type="button"
                  onClick={openAboutModal}
                  className="hover:text-[#0F172A] cursor-pointer"
                >
                  About
                </button>
                <span aria-hidden>·</span>
              </>
            )}
            {openContactModal && (
              <>
                <button
                  type="button"
                  onClick={openContactModal}
                  className="hover:text-[#0F172A] cursor-pointer"
                >
                  Contact
                </button>
                <span aria-hidden>·</span>
              </>
            )}
            <a href="mailto:admin@techpeppy.com" className="hover:text-[#0F172A]">
              Support
            </a>
          </div>

          <p className="text-xs text-[#94A3B8]">© 2026 TechPeppy · Sandeep Kumar</p>
        </section>
      </div>
    </aside>
  );
};
