"use client";

import React from "react";
import { Home, Sparkles, Plus, Code2, BrainCircuit, Database, Laptop, Newspaper } from "lucide-react";
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
      <div className="sticky top-20 space-y-5">
        {/* Navigation Feeds */}
        <div className="rounded-2xl border border-[#1e293b] bg-[#0f172a] p-3 shadow-sm">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </p>
          <div className="space-y-1">
            <button
              onClick={() => setActiveCommunity("all")}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                activeCommunity === "all"
                  ? "bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20"
                  : "text-slate-300 hover:bg-[#162238] hover:text-white"
              }`}
            >
              <Home className="h-4 w-4 text-emerald-400" />
              <span>All Discussions</span>
            </button>
            <button
              onClick={() => setActiveCommunity("software-architecture")}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                activeCommunity === "software-architecture"
                  ? "bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20"
                  : "text-slate-300 hover:bg-[#162238] hover:text-white"
              }`}
            >
              <Code2 className="h-4 w-4 text-teal-400" />
              <span>Software Engineering</span>
            </button>
            <button
              onClick={() => setActiveCommunity("ai-learning")}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                activeCommunity === "ai-learning"
                  ? "bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20"
                  : "text-slate-300 hover:bg-[#162238] hover:text-white"
              }`}
            >
              <BrainCircuit className="h-4 w-4 text-blue-400" />
              <span>AI Learning & RAG</span>
            </button>
            <button
              onClick={() => setActiveCommunity("desk-setups")}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                activeCommunity === "desk-setups"
                  ? "bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20"
                  : "text-slate-300 hover:bg-[#162238] hover:text-white"
              }`}
            >
              <Laptop className="h-4 w-4 text-indigo-400" />
              <span>Workstation Setups</span>
            </button>
          </div>
        </div>

        {/* Real Topic Channels */}
        <div className="rounded-2xl border border-[#1e293b] bg-[#0f172a] p-3 shadow-sm">
          <div className="flex items-center justify-between px-3 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Topics
            </p>
            <span className="text-[10px] text-emerald-400 font-semibold">
              Live Hub
            </span>
          </div>

          <div className="space-y-1">
            {communities.map((c) => {
              const isActive = activeCommunity === c.slug;
              return (
                <button
                  key={c.id || c.slug}
                  onClick={() => setActiveCommunity(c.slug)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-300 font-semibold border-l-2 border-emerald-500"
                      : "text-slate-300 hover:bg-[#162238] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-sm">{c.icon || "💻"}</span>
                    <span className="truncate">{c.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                    t/{c.slug.split("-")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 mt-2 border-t border-[#1e293b]">
            <button
              onClick={openCreateModal}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#2d3a50] py-2 text-xs font-semibold text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Share Discussion / Setup</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
