"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  BookOpen,
  ShieldCheck,
  ArrowUpRight,
  BellPlus,
  Check,
  Mail,
} from "lucide-react";
import { SessionUser } from "@/lib/auth";

interface SidebarRightProps {
  openAboutModal?: () => void;
  openContactModal?: () => void;
  setActiveCommunity: (slug: string) => void;
  isPublicationSubscribed?: boolean;
  subscriberCount?: number;
  onSubscribePublication?: (email?: string) => Promise<void> | void;
  currentUser?: SessionUser | null;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({
  openAboutModal,
  openContactModal,
  setActiveCommunity,
  isPublicationSubscribed = false,
  subscriberCount = 0,
  onSubscribePublication,
  currentUser,
}) => {
  const [emailInput, setEmailInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");

  const trends = [
    { tag: "DeskSetup", category: "Hardware & Gear", count: "34 posts", slug: "desk-setups" },
    { tag: "NextJS", category: "Web Architecture", count: "28 posts", slug: "software-architecture" },
    { tag: "LocalLLM", category: "AI Systems", count: "19 posts", slug: "ai-learning" },
    { tag: "VectorDB", category: "Data Science", count: "14 posts", slug: "data-science" },
    { tag: "MechanicalKeyboards", category: "Hardware & Gear", count: "11 posts", slug: "desk-setups" },
  ];

  const standards = [
    { code: "SPEC-01", text: "Technical rationale backed by benchmarks" },
    { code: "SPEC-02", text: "Clean, reproducible architectural code" },
    { code: "SPEC-03", text: "Original developer setups & ergonomic gear" },
  ];

  const handleOneClickSubscribe = async () => {
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
      await handleOneClickSubscribe();
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
    <aside className="hidden xl:block w-80 shrink-0 pl-5 space-y-4">
      {/* Publication Overview & Subscribe Widget */}
      <div className="rounded-md border border-[#E2E0D8] bg-white p-4">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#E2E0D8]">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-[#10B981]" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#141413] font-mono">
              About Publication
            </h3>
          </div>
          <span className="font-mono text-[10px] text-[#686763] bg-[#F6F5F0] border border-[#E2E0D8] px-1.5 py-0.5 rounded tabular-nums">
            {subscriberCount} {subscriberCount === 1 ? "subscriber" : "subscribers"}
          </span>
        </div>

        <p className="text-xs text-[#686763] leading-relaxed mb-3.5">
          TechPeppy is an engineering publication founded by{" "}
          <span className="font-semibold text-[#141413]">Sandeep Kumar</span>, focused on
          decoupled software architecture, production RAG pipelines, and ergonomic workstations.
        </p>

        {/* High-Craft Subscribe Widget */}
        <div className="rounded-md border border-[#E2E0D8] bg-[#F6F5F0] p-3 mb-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#141413]">
              Dispatch & Updates
            </span>
            <button
              type="button"
              onClick={handleOneClickSubscribe}
              disabled={submitting}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                isPublicationSubscribed
                  ? "border-[#10B981]/40 bg-[#ECFDF5] text-[#059669]"
                  : "border-[#141413] bg-[#141413] text-white hover:bg-[#27272A]"
              }`}
            >
              {isPublicationSubscribed ? (
                <>
                  <Check className="h-3 w-3 stroke-[2.5]" />
                  <span>Subscribed</span>
                </>
              ) : (
                <>
                  <BellPlus className="h-3 w-3" />
                  <span>{currentUser ? "1-Click Subscribe" : "Subscribe"}</span>
                </>
              )}
            </button>
          </div>

          <form onSubmit={handleEmailSubscribe} className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#8A8A95]" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (emailError) setEmailError("");
                }}
                placeholder={currentUser ? currentUser.email : "reader@domain.com"}
                className="w-full h-8 rounded-md border border-[#E2E0D8] bg-white pl-7 pr-2 text-[11px] text-[#141413] placeholder-[#8A8A95] focus:border-[#141413] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="h-8 rounded-md border border-[#E2E0D8] bg-white hover:bg-[#EFECE6] px-2.5 text-[11px] font-mono font-semibold text-[#141413] transition-colors cursor-pointer shrink-0"
            >
              {submitting ? "..." : "Join"}
            </button>
          </form>

          {emailError && (
            <p className="text-[11px] font-mono text-[#DC2626]">{emailError}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-[#E2E0D8]">
          {openContactModal && (
            <button
              onClick={openContactModal}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#141413] hover:text-[#10B981] transition-colors cursor-pointer"
            >
              <span>Consulting & Inquiries</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          )}
          <span className="font-mono text-[10px] text-[#8A8A95]">Direct</span>
        </div>
      </div>

      {/* Trending in Tech - Ledger-Style Leaderboard */}
      <div className="rounded-md border border-[#E2E0D8] bg-white p-4">
        <div className="flex items-center justify-between pb-2.5 mb-1 border-b border-[#E2E0D8]">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#141413] font-mono flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-[#10B981]" />
            <span>Trending in Tech</span>
          </h3>
          <span className="font-mono text-[10px] text-[#8A8A95]">INDEX</span>
        </div>

        <div className="divide-y divide-[#E2E0D8]">
          {trends.map((t, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCommunity(t.slug)}
              className="w-full text-left group cursor-pointer flex items-center gap-3 py-2.5 px-1.5 -mx-1.5 rounded-md hover:bg-[#EFECE6] transition-colors"
            >
              <span className="font-mono text-xs font-bold text-[#8A8A95] group-hover:text-[#FF5500] tabular-nums w-5 shrink-0">
                0{idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-wide text-[#686763] leading-none mb-1">
                  {t.category}
                </p>
                <p className="text-xs font-bold text-[#141413] group-hover:text-[#059669] transition-colors truncate">
                  #{t.tag}
                </p>
              </div>
              <span className="font-mono text-[10px] tabular-nums text-[#686763] bg-[#F6F5F0] border border-[#E2E0D8] px-1.5 py-0.5 rounded shrink-0">
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Editorial Standards - Engineering Spec Checklist */}
      <div className="rounded-md border border-[#E2E0D8] bg-white p-4">
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#E2E0D8]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#141413] font-mono">
              Editorial Standards
            </h3>
          </div>
          <span className="font-mono text-[10px] text-[#059669]">VERIFIED</span>
        </div>
        <ul className="space-y-2 text-xs text-[#686763]">
          {standards.map((s) => (
            <li
              key={s.code}
              className="flex items-start gap-2 rounded-md border border-[#E2E0D8] bg-[#F6F5F0] px-2.5 py-2"
            >
              <span className="font-mono text-[10px] font-bold text-[#059669] shrink-0 mt-0.5">
                [✓]
              </span>
              <div className="min-w-0">
                <span className="block font-mono text-[9px] uppercase tracking-wider text-[#8A8A95]">
                  {s.code}
                </span>
                <span className="leading-snug text-[#141413] font-medium">{s.text}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Minimal Footer Links */}
      <div className="px-2 text-xs text-[#686763] space-y-1.5">
        <div className="flex items-center gap-2">
          {openAboutModal && (
            <button
              onClick={openAboutModal}
              className="hover:text-[#141413] hover:underline cursor-pointer"
            >
              About
            </button>
          )}
          <span>•</span>
          {openContactModal && (
            <button
              onClick={openContactModal}
              className="hover:text-[#141413] hover:underline cursor-pointer"
            >
              Contact
            </button>
          )}
          <span>•</span>
          <a href="mailto:admin@techpeppy.com" className="hover:text-[#141413] hover:underline">
            Support
          </a>
        </div>
        <p className="text-[11px] font-mono text-[#8A8A95]">© 2026 TechPeppy • Sandeep Kumar</p>
      </div>
    </aside>
  );
};
