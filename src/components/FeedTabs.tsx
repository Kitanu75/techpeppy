"use client";

import React from "react";

interface FeedTabsProps {
  title?: string;
  sort: string;
  setSort: (s: string) => void;
}

const SORT_OPTIONS = [
  { value: "hot", label: "Trending" },
  { value: "new", label: "Latest" },
  { value: "top", label: "Top" },
];

export const FeedTabs: React.FC<FeedTabsProps> = ({
  title = "Latest Stories",
  sort,
  setSort,
}) => {
  return (
    <section className="w-full pt-8 pb-3 border-b border-[#E4E4E7] flex items-center justify-between gap-4">
      <h2 className="font-display text-lg sm:text-xl font-bold tracking-[-0.02em] text-[#111315]">
        {title}
      </h2>

      <div
        role="tablist"
        aria-label="Sort"
        className="flex items-center gap-1 rounded-lg bg-[#F4F4F5] p-1 text-xs"
      >
        {SORT_OPTIONS.map((option) => {
          const isActive = sort === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setSort(option.value)}
              className={`rounded-md px-3 py-1 transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-[#111315] font-semibold shadow-2xs"
                  : "text-[#52525B] hover:text-[#111315]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
};
