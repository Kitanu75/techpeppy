"use client";

import React from "react";
import { Home, Code2, BrainCircuit, Database, Laptop, Zap } from "lucide-react";
import { CommunityType } from "@/lib/models/types";

interface SidebarLeftProps {
  communities: CommunityType[];
  activeCommunity: string;
  setActiveCommunity: (slug: string) => void;
  openCreateModal: () => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  activeCommunity,
  setActiveCommunity,
}) => {
  const navItems = [
    { slug: "all", label: "Home Feed", icon: Home },
    { slug: "software-architecture", label: "Architecture", icon: Code2 },
    { slug: "ai-learning", label: "AI & Models", icon: BrainCircuit },
    { slug: "data-science", label: "Data Science", icon: Database },
    { slug: "desk-setups", label: "Desk Setups", icon: Laptop },
    { slug: "tech-news", label: "Tech News", icon: Zap },
  ];

  return (
    <aside className="hidden lg:block w-56 shrink-0 pr-4">
      <div className="sticky top-20 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeCommunity === item.slug;
          return (
            <button
              key={item.slug}
              onClick={() => setActiveCommunity(item.slug)}
              className={`flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-neutral-900 text-white font-semibold"
                  : "text-[#71767b] hover:bg-[#16181c] hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-[#71767b]"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
