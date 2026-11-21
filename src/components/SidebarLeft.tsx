"use client";

import React from "react";
import { CommunityType } from "@/lib/models/types";

interface SidebarLeftProps {
  communities: CommunityType[];
  activeCommunity: string;
  setActiveCommunity: (slug: string) => void;
  openCreateModal: () => void;
}

const FALLBACK_TOPICS: { slug: string; name: string }[] = [
  { slug: "software-architecture", name: "Software Architecture" },
  { slug: "ai-learning", name: "AI & Models" },
  { slug: "data-science", name: "Data Science" },
  { slug: "desk-setups", name: "Desk Setups" },
  { slug: "tech-news", name: "Tech News" },
];

export function getTopicList(communities: CommunityType[]) {
  const topics =
    communities.length > 0
      ? communities.map((c) => ({ slug: c.slug, name: c.name }))
      : FALLBACK_TOPICS;
  return [{ slug: "all", name: "All posts" }, ...topics];
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  communities,
  activeCommunity,
  setActiveCommunity,
  openCreateModal,
}) => {
  const topics = getTopicList(communities);

  return (
    <aside className="hidden lg:block w-56 shrink-0 pr-8">
      <nav className="sticky top-20" aria-label="Topics">
        <p className="px-3 mb-2 text-xs font-medium text-[#64748B]">Topics</p>
        <ul className="space-y-px">
          {topics.map((topic) => {
            const isActive = activeCommunity === topic.slug;
            return (
              <li key={topic.slug}>
                <button
                  onClick={() => setActiveCommunity(topic.slug)}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full text-left rounded-md px-3 py-1.5 text-sm cursor-pointer ${
                    isActive
                      ? "bg-[#E2E8F0]/70 text-[#0F172A] font-semibold"
                      : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                  }`}
                >
                  {topic.name}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 pt-6 border-t border-[#E2E8F0] px-3">
          <button
            onClick={openCreateModal}
            className="text-sm font-medium text-[#059669] hover:text-[#047857] cursor-pointer"
          >
            Write a post
          </button>
        </div>
      </nav>
    </aside>
  );
};
