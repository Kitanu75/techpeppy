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
    <div className="space-y-3 mb-4">
      {/* Twitter / Threads style Quick Composer Box */}
      <div className="rounded-2xl border border-[#262626] bg-[#121212] p-3.5">
        <div className="flex items-center gap-3">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt=""
              className="h-9 w-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-400 text-xs font-bold">
              TP
            </div>
          )}

          <button
            onClick={() => openCreateModal("text")}
            className="flex-1 rounded-full bg-[#181818] border border-[#262626] px-4 py-2 text-left text-xs sm:text-sm text-[#71767b] hover:text-white transition-colors cursor-pointer"
          >
            {activeCommunity !== "all"
              ? `Post in t/${activeCommunity}...`
              : "Share a setup photo, architecture tip, or question..."}
          </button>

          <button
            onClick={() => openCreateModal("image")}
            title="Add photo"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-800 text-[#71767b] hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <ImageIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Sleek Minimal Sorting Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262626] pb-2 px-1">
        <button
          onClick={() => setSort("hot")}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
            sort === "hot"
              ? "bg-white text-black"
              : "text-[#71767b] hover:text-white hover:bg-neutral-900"
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          <span>Hot</span>
        </button>

        <button
          onClick={() => setSort("new")}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
            sort === "new"
              ? "bg-white text-black"
              : "text-[#71767b] hover:text-white hover:bg-neutral-900"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>New</span>
        </button>

        <button
          onClick={() => setSort("top")}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
            sort === "top"
              ? "bg-white text-black"
              : "text-[#71767b] hover:text-white hover:bg-neutral-900"
          }`}
        >
          <Trophy className="h-3.5 w-3.5" />
          <span>Top</span>
        </button>
      </div>
    </div>
  );
};
