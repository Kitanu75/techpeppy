"use client";

import React from "react";
import { Flame, Sparkles, Trophy, TrendingUp, Image as ImageIcon, PenLine } from "lucide-react";

interface FeedTabsProps {
  sort: string;
  setSort: (s: string) => void;
  openCreateModal: (defaultType?: "text" | "image") => void;
  activeCommunity: string;
  communityName?: string;
  userAvatar?: string;
  userName?: string;
}

export const FeedTabs: React.FC<FeedTabsProps> = ({
  sort,
  setSort,
  openCreateModal,
  activeCommunity,
  communityName,
  userAvatar,
  userName,
}) => {
  return (
    <div className="space-y-3 mb-4">
      {/* Quick Post Creator Bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-[#1e293b] bg-[#0f172a] p-3 shadow-sm">
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={userName || "User"}
            className="h-8 w-8 rounded-full object-cover ring-1 ring-emerald-500/40"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <PenLine className="h-4 w-4" />
          </div>
        )}

        <button
          onClick={() => openCreateModal("text")}
          className="flex-1 rounded-xl border border-[#1e293b] bg-[#141e33] px-4 py-2 text-left text-xs sm:text-sm text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-colors cursor-pointer"
        >
          {activeCommunity !== "all"
            ? `Post to t/${activeCommunity}...`
            : "Share an engineering insight, architecture guide, or setup photo..."}
        </button>

        <button
          onClick={() => openCreateModal("image")}
          title="Share Photos & Hardware"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#1e293b] bg-[#141e33] text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Sorting Tabs Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-[#1e293b] bg-[#0f172a] px-3 py-2 shadow-sm">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setSort("hot")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              sort === "hot"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-slate-400 hover:bg-[#162238] hover:text-slate-200"
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-emerald-400" />
            <span>Hot</span>
          </button>

          <button
            onClick={() => setSort("new")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              sort === "new"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-slate-400 hover:bg-[#162238] hover:text-slate-200"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span>New</span>
          </button>

          <button
            onClick={() => setSort("top")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              sort === "top"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-slate-400 hover:bg-[#162238] hover:text-slate-200"
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>Top</span>
          </button>

          <button
            onClick={() => setSort("trending")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              sort === "trending"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-slate-400 hover:bg-[#162238] hover:text-slate-200"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
            <span>Trending</span>
          </button>
        </div>

        {communityName && (
          <span className="hidden sm:inline-block text-[11px] font-medium text-slate-400 font-mono">
            t/{activeCommunity}
          </span>
        )}
      </div>
    </div>
  );
};
