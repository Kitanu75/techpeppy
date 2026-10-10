"use client";

import React from "react";
import { Home, Flame, Sparkles, Plus, Users, Hash, ShieldCheck } from "lucide-react";
import { CommunityType } from "@/lib/models/types";

interface SidebarLeftProps {
  communities: CommunityType[];
  activeCommunity: string;
  setActiveCommunity: (slug: string) => void;
  openCreateModal: () => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  communities,
  activeCommunity,
  setActiveCommunity,
  openCreateModal,
}) => {
  return (
    <aside className="hidden lg:block w-64 shrink-0 pr-4">
      <div className="sticky top-20 space-y-6">
        {/* Main Feeds */}
        <div className="rounded-2xl border border-[#232838] bg-[#151822] p-3 shadow-sm">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Feeds
          </p>
          <div className="space-y-1">
            <button
              onClick={() => setActiveCommunity("all")}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                activeCommunity === "all"
                  ? "bg-orange-500/15 text-orange-400 font-semibold border border-orange-500/20"
                  : "text-gray-300 hover:bg-[#1f2331] hover:text-white"
              }`}
            >
              <Home className="h-4 w-4" />
              <span>All Feeds</span>
            </button>
            <button
              onClick={() => setActiveCommunity("all")}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-300 hover:bg-[#1f2331] hover:text-white transition-all"
            >
              <Flame className="h-4 w-4 text-orange-400" />
              <span>Popular Today</span>
            </button>
            <button
              onClick={() => setActiveCommunity("desk-setups")}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                activeCommunity === "desk-setups"
                  ? "bg-purple-500/15 text-purple-400 font-semibold border border-purple-500/20"
                  : "text-gray-300 hover:bg-[#1f2331] hover:text-white"
              }`}
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>Photo Showcase</span>
            </button>
          </div>
        </div>

        {/* Communities */}
        <div className="rounded-2xl border border-[#232838] bg-[#151822] p-3 shadow-sm">
          <div className="flex items-center justify-between px-3 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Communities
            </p>
            <span className="text-[10px] text-gray-400 font-medium">
              {communities.length} Active
            </span>
          </div>

          <div className="space-y-1">
            {communities.map((c) => {
              const isActive = activeCommunity === c.slug;
              return (
                <button
                  key={c.id || c.slug}
                  onClick={() => setActiveCommunity(c.slug)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500/20 to-transparent text-white font-semibold border-l-2 border-orange-500"
                      : "text-gray-300 hover:bg-[#1f2331] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base">{c.icon || "🔥"}</span>
                    <span className="truncate">{c.name}</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {c.membersCount > 1000
                      ? `${(c.membersCount / 1000).toFixed(1)}k`
                      : c.membersCount}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 mt-2 border-t border-[#232838]">
            <button
              onClick={openCreateModal}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#343b52] py-2 text-xs font-semibold text-gray-300 hover:border-orange-500 hover:text-orange-400 hover:bg-orange-500/5 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Post in Community</span>
            </button>
          </div>
        </div>

        {/* Community Info Box */}
        <div className="rounded-2xl border border-[#232838] bg-gradient-to-b from-[#171b26] to-[#12141c] p-4 text-xs text-gray-400">
          <div className="flex items-center gap-2 text-white font-semibold mb-1.5">
            <ShieldCheck className="h-4 w-4 text-orange-400" />
            <span>TechPeppy Platform</span>
          </div>
          <p className="leading-relaxed">
            A developer & gadget community powered by MongoDB Atlas. Share high-res photos, setups & tech discussions.
          </p>
        </div>
      </div>
    </aside>
  );
};
