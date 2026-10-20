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
      {/* Sleek Composer Box */}
      <div className="rounded-2xl border border-[#E8E5DD] bg-white p-3.5 shadow-xs transition-all hover:border-[#D4D0C7]">
        <div className="flex items-center gap-3">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt=""
              className="h-9 w-9 rounded-full object-cover shrink-0 ring-1 ring-[#E8E5DD]"
            />
          ) : (
            <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 text-emerald-800 text-xs font-bold">
              TP
            </div>
          )}

          <button
            onClick={() => openCreateModal("text")}
            className="flex-1 rounded-xl bg-[#F8F7F4] border border-[#E8E5DD] px-4 py-2 text-left text-xs sm:text-sm text-[#8C8A83] hover:text-[#1C1B18] hover:border-[#D4D0C7] hover:bg-white transition-all cursor-pointer"
          >
            {activeCommunity !== "all"
              ? `Post in t/${activeCommunity}...`
              : "Share a system design tip, architecture review, or workstation setup..."}
          </button>

          <button
            onClick={() => openCreateModal("image")}
            title="Add photo"
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-emerald-50 text-[#8C8A83] hover:text-emerald-700 transition-colors cursor-pointer shrink-0"
          >
            <ImageIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Sleek Sorting Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#E8E5DD] pb-2.5 px-0.5">
        <button
          onClick={() => setSort("hot")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            sort === "hot"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-[#4A4843] hover:text-[#1C1B18] hover:bg-[#F1EFE9]"
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          <span>Hot</span>
        </button>

        <button
          onClick={() => setSort("new")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            sort === "new"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-[#4A4843] hover:text-[#1C1B18] hover:bg-[#F1EFE9]"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>New</span>
        </button>

        <button
          onClick={() => setSort("top")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            sort === "top"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-[#4A4843] hover:text-[#1C1B18] hover:bg-[#F1EFE9]"
          }`}
        >
          <Trophy className="h-3.5 w-3.5" />
          <span>Top</span>
        </button>
      </div>
    </div>
  );
};
