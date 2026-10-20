"use client";

import React from "react";
import {
  Home,
  Code2,
  BrainCircuit,
  Database,
  Laptop,
  Zap,
  Layers,
} from "lucide-react";
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
    { slug: "all", label: "All Feeds", icon: Home, count: "5" },
    { slug: "software-architecture", label: "Software Architecture", icon: Code2, count: "1" },
    { slug: "ai-learning", label: "AI & Models", icon: BrainCircuit, count: "1" },
    { slug: "data-science", label: "Data Science", icon: Database, count: "1" },
    { slug: "desk-setups", label: "Desk Setups", icon: Laptop, count: "1" },
    { slug: "tech-news", label: "Tech News", icon: Zap, count: "1" },
  ];

  const focusTopics = [
    { name: "Decoupled CMS", tag: "software-architecture" },
    { name: "Local 32B LLMs", tag: "ai-learning" },
    { name: "Vector Indexing", tag: "data-science" },
    { name: "Ergo Workstations", tag: "desk-setups" },
    { name: "Resilient Fallbacks", tag: "software-architecture" },
  ];

  return (
    <aside className="hidden lg:block w-64 shrink-0 pr-6">
      <div className="sticky top-20 space-y-5">
        {/* Navigation Section */}
        <div>
          <div className="px-3.5 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C8A83]">
              Channels
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
              Live
            </span>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeCommunity === item.slug;
              return (
                <button
                  key={item.slug}
                  onClick={() => setActiveCommunity(item.slug)}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80 shadow-xs"
                      : "text-[#4A4843] hover:bg-[#F1EFE9] hover:text-[#1C1B18] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`h-[18px] w-[18px] shrink-0 ${
                        isActive ? "text-emerald-700" : "text-[#8C8A83]"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-emerald-200/70 text-emerald-900 font-bold"
                        : "bg-[#F1EFE9] text-[#8C8A83]"
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Architectural Focus Areas */}
        <div className="rounded-2xl border border-[#E8E5DD] bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]">
              Key Architectures
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {focusTopics.map((topic, i) => (
              <button
                key={i}
                onClick={() => setActiveCommunity(topic.tag)}
                className="text-[11px] font-medium text-[#4A4843] bg-[#F8F7F4] hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-[#E8E5DD] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                #{topic.name}
              </button>
            ))}
          </div>
        </div>

        {/* Community Info Card */}
        <div className="rounded-2xl border border-[#E8E5DD] bg-[#F8F7F4] p-4 text-xs text-[#8C8A83] space-y-1.5">
          <p className="text-xs font-bold text-[#1C1B18]">TechPeppy Community</p>
          <p className="text-[11px] text-[#4A4843] leading-relaxed">
            An open platform for software architects, AI builders, and workstation enthusiasts.
          </p>
        </div>
      </div>
    </aside>
  );
};
