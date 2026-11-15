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
      {/* Quick Post Composer */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-3 shadow-card transition-all hover:border-[#CBD5E1]">
        <div className="flex items-center gap-3">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt=""
              className="h-9 w-9 rounded-md object-cover shrink-0 border border-[#E2E8F0]"
            />
          ) : (
            <div className="h-9 w-9 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0 text-[#0F172A] text-xs font-mono font-bold">
              TP
            </div>
          )}

          <button
            onClick={() => openCreateModal("text")}
            className="flex-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] px-3.5 py-2 text-left text-xs sm:text-sm text-[#475569] hover:text-[#0F172A] hover:border-[#CBD5E1] hover:bg-[#F1F5F9] transition-all cursor-pointer"
          >
            {activeCommunity !== "all"
              ? `Post in t/${activeCommunity}...`
              : "Share an architectural blueprint, system review, or setup..."}
          </button>

          <button
            onClick={() => openCreateModal("image")}
            title="Add photo"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-transparent hover:border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer shrink-0"
          >
            <ImageIcon className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Feed Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#E2E8F0] pb-2.5 px-0.5">
        <button
          onClick={() => setSort("hot")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            sort === "hot"
              ? "bg-[#0F172A] text-white border border-[#0F172A]"
              : "text-[#475569] border border-transparent hover:text-[#0F172A] hover:bg-[#F1F5F9]"
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          <span>Hot</span>
        </button>

        <button
          onClick={() => setSort("new")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            sort === "new"
              ? "bg-[#0F172A] text-white border border-[#0F172A]"
              : "text-[#475569] border border-transparent hover:text-[#0F172A] hover:bg-[#F1F5F9]"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>New</span>
        </button>

        <button
          onClick={() => setSort("top")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            sort === "top"
              ? "bg-[#0F172A] text-white border border-[#0F172A]"
              : "text-[#475569] border border-transparent hover:text-[#0F172A] hover:bg-[#F1F5F9]"
          }`}
        >
          <Trophy className="h-3.5 w-3.5" />
          <span>Top</span>
        </button>
      </div>
    </div>
  );
};
