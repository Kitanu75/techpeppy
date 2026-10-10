"use client";

import React from "react";
import { TrendingUp } from "lucide-react";

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
    { tag: "DeskSetup", category: "Hardware", count: "34 posts", slug: "desk-setups" },
    { tag: "NextJS", category: "Web Architecture", count: "28 posts", slug: "software-architecture" },
    { tag: "LocalLLM", category: "AI Systems", count: "19 posts", slug: "ai-learning" },
    { tag: "VectorDB", category: "Data Science", count: "14 posts", slug: "data-science" },
    { tag: "MechanicalKeyboards", category: "Gear", count: "11 posts", slug: "desk-setups" },
  ];

  return (
    <aside className="hidden xl:block w-72 shrink-0 pl-4 space-y-4">
      {/* What's Happening / Trending (Twitter style) */}
      <div className="rounded-2xl border border-[#262626] bg-[#121212] p-4">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#71767b]" />
          <span>Trending in Tech</span>
        </h3>

        <div className="space-y-3">
          {trends.map((t, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCommunity(t.slug)}
              className="w-full text-left group cursor-pointer"
            >
              <p className="text-[11px] text-[#71767b]">{t.category}</p>
              <p className="text-xs font-semibold text-white group-hover:underline">
                #{t.tag}
              </p>
              <p className="text-[10px] text-[#71767b]">{t.count}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Minimal Footer Links */}
      <div className="px-3 text-[11px] text-[#71767b] space-y-1">
        <div className="flex gap-2">
          {openAboutModal && (
            <button
              onClick={openAboutModal}
              className="hover:underline cursor-pointer"
            >
              About
            </button>
          )}
          <span>•</span>
          {openContactModal && (
            <button
              onClick={openContactModal}
              className="hover:underline cursor-pointer"
            >
              Contact
            </button>
          )}
          <span>•</span>
          <a href="mailto:admin@techpeppy.com" className="hover:underline">
            Support
          </a>
        </div>
        <p>© 2026 TechPeppy</p>
      </div>
    </aside>
  );
};
