"use client";

import React from "react";
import { TrendingUp, BookOpen, ShieldCheck, Mail, ArrowUpRight } from "lucide-react";

interface SidebarRightProps {
  openAboutModal?: () => void;
  openContactModal?: () => void;
  setActiveCommunity: (slug: string) => void;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({
  openAboutModal,
  openContactModal,
  setActiveCommunity,
}) => {
  const trends = [
    { tag: "DeskSetup", category: "Hardware & Gear", count: "34 posts", slug: "desk-setups" },
    { tag: "NextJS", category: "Web Architecture", count: "28 posts", slug: "software-architecture" },
    { tag: "LocalLLM", category: "AI Systems", count: "19 posts", slug: "ai-learning" },
    { tag: "VectorDB", category: "Data Science", count: "14 posts", slug: "data-science" },
    { tag: "MechanicalKeyboards", category: "Hardware & Gear", count: "11 posts", slug: "desk-setups" },
  ];

  const standards = [
    "Technical rationale backed by benchmarks",
    "Clean, reproducible architectural code",
    "Original developer setups & ergonomic gear",
  ];

  return (
    <aside className="hidden xl:block w-80 shrink-0 pl-6 space-y-4">
      {/* Publication Overview Card */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-emerald-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950 font-mono">
            About Publication
          </h3>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed mb-3">
          TechPeppy is an engineering publication founded by <span className="font-semibold text-zinc-950">Sandeep Kumar</span>, focused on decoupled software architecture, production RAG pipelines, and ergonomic workstations.
        </p>
        <div className="flex items-center gap-2 pt-3 border-t border-zinc-100">
          {openContactModal && (
            <button
              onClick={openContactModal}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
            >
              <span>Consulting & Inquiries</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Trending in Tech - Editorial Leaderboard */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950 font-mono mb-3.5 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <span>Trending in Tech</span>
        </h3>

        <div className="space-y-2.5">
          {trends.map((t, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCommunity(t.slug)}
              className="w-full text-left group cursor-pointer flex items-start gap-3 p-1.5 -mx-1.5 rounded-xl hover:bg-zinc-50 transition-colors"
            >
              <span className="font-mono text-xs font-semibold text-zinc-400 group-hover:text-emerald-600 pt-0.5 w-5">
                0{idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-zinc-400 leading-none mb-1">{t.category}</p>
                <p className="text-xs font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors truncate">
                  #{t.tag}
                </p>
                <p className="text-[10px] font-mono text-zinc-400 mt-0.5">{t.count}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Technical Standards Card */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950 font-mono">
            Editorial Standards
          </h3>
        </div>
        <ul className="space-y-2 text-xs text-zinc-600">
          {standards.map((s, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span className="leading-tight">{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Minimal Footer Links */}
      <div className="px-3 text-xs text-zinc-400 space-y-1.5">
        <div className="flex items-center gap-2">
          {openAboutModal && (
            <button
              onClick={openAboutModal}
              className="hover:text-zinc-900 hover:underline cursor-pointer"
            >
              About
            </button>
          )}
          <span>•</span>
          {openContactModal && (
            <button
              onClick={openContactModal}
              className="hover:text-zinc-900 hover:underline cursor-pointer"
            >
              Contact
            </button>
          )}
          <span>•</span>
          <a href="mailto:admin@techpeppy.com" className="hover:text-zinc-900 hover:underline">
            Support
          </a>
        </div>
        <p className="text-[11px] font-mono">© 2026 TechPeppy • Sandeep Kumar</p>
      </div>
    </aside>
  );
};
