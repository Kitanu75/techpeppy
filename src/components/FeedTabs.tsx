"use client";

import React from "react";
import { Flame, Sparkles, Trophy, TrendingUp, Image as ImageIcon, Plus } from "lucide-react";

interface FeedTabsProps {
  sort: string;
  setSort: (s: string) => void;
  openCreateModal: (defaultType?: "text" | "image") => void;
  activeCommunity: string;
  communityName?: string;
}

export const FeedTabs: React.FC<FeedTabsProps> = ({
  sort,
  setSort,
  openCreateModal,
  activeCommunity,
  communityName,
}) => {
  return (
    <div className="space-y-3 mb-4">
      {/* Reddit-style Quick Post Creator Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-[#232838] bg-[#151822] p-3 shadow-sm">
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
          alt="Avatar"
          className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-700"
        />
        <button
          onClick={() => openCreateModal("text")}
          className="flex-1 rounded-xl border border-[#2b3145] bg-[#191c28] px-4 py-2 text-left text-xs sm:text-sm text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors cursor-pointer"
        >
          {activeCommunity !== "all"
            ? `Create a post in t/${activeCommunity}...`
            : "Share a setup photo, tech review, or discussion..."}
        </button>
        <button
          onClick={() => openCreateModal("image")}
          title="Create Photo Post"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2b3145] bg-[#191c28] text-gray-300 hover:border-orange-500 hover:text-orange-400 hover:bg-orange-500/10 transition-all cursor-pointer"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Sorting Tabs Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-[#232838] bg-[#151822] px-3 py-2 shadow-sm">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setSort("hot")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              sort === "hot"
                ? "bg-orange-500/15 text-orange-400 border border-orange-500/25"
                : "text-gray-400 hover:bg-[#1f2331] hover:text-gray-200"
            }`}
          >
            <Flame className="h-4 w-4" />
            <span>Hot</span>
          </button>

          <button
            onClick={() => setSort("new")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              sort === "new"
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                : "text-gray-400 hover:bg-[#1f2331] hover:text-gray-200"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>New</span>
          </button>

          <button
            onClick={() => setSort("top")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              sort === "top"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                : "text-gray-400 hover:bg-[#1f2331] hover:text-gray-200"
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>Top</span>
          </button>

          <button
            onClick={() => setSort("trending")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              sort === "trending"
                ? "bg-purple-500/15 text-purple-400 border border-purple-500/25"
                : "text-gray-400 hover:bg-[#1f2331] hover:text-gray-200"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Trending</span>
          </button>
        </div>

        {communityName && activeCommunity !== "all" && (
          <span className="hidden sm:inline-flex text-xs font-medium text-gray-400 bg-[#1c202e] px-2.5 py-1 rounded-lg">
            t/{activeCommunity}
          </span>
        )}
      </div>
    </div>
  );
};
