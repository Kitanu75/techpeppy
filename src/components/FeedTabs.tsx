"use client";

import React from "react";
import { Image as ImageIcon, Flame, Clock, Trophy } from "lucide-react";

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
  userAvatar,
}) => {
  return (
    <div className="space-y-3.5 mb-4">
      {/* Sleek Composer Box */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-3.5 shadow-xs transition-all hover:border-zinc-300">
        <div className="flex items-center gap-3">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt=""
              className="h-9 w-9 rounded-full object-cover shrink-0 ring-1 ring-zinc-200"
            />
          ) : (
            <div className="h-9 w-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-800 text-xs font-mono font-bold">
              TP
            </div>
          )}

          <button
            onClick={() => openCreateModal("text")}
            className="flex-1 rounded-xl bg-zinc-50/80 border border-zinc-200/80 px-4 py-2 text-left text-xs sm:text-sm text-zinc-500 hover:text-zinc-950 hover:border-zinc-300 hover:bg-white transition-all cursor-pointer"
          >
            {activeCommunity !== "all"
              ? `Post in t/${activeCommunity}...`
              : "Share an architectural blueprint, system review, or setup..."}
          </button>

          <button
            onClick={() => openCreateModal("image")}
            title="Add photo"
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer shrink-0"
          >
            <ImageIcon className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Sleek Sorting Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-200/80 pb-2.5 px-0.5">
        <button
          onClick={() => setSort("hot")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            sort === "hot"
              ? "bg-zinc-950 text-white shadow-xs"
              : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          <span>Hot</span>
        </button>

        <button
          onClick={() => setSort("new")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            sort === "new"
              ? "bg-zinc-950 text-white shadow-xs"
              : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>New</span>
        </button>

        <button
          onClick={() => setSort("top")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            sort === "top"
              ? "bg-zinc-950 text-white shadow-xs"
              : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
          }`}
        >
          <Trophy className="h-3.5 w-3.5" />
          <span>Top</span>
        </button>
      </div>
    </div>
  );
};
