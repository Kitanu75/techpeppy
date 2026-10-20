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
  Sparkles,
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
      <div className="sticky top-20 space-y-4">
        {/* Navigation Section */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
              Navigation
            </span>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
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
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-zinc-950 font-semibold border border-zinc-200 shadow-2xs"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 border border-transparent font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`h-4.5 w-4.5 shrink-0 ${
                        isActive ? "text-emerald-600" : "text-zinc-400"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-zinc-100 text-zinc-900 font-bold"
                        : "bg-zinc-100/60 text-zinc-500"
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
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Key Focus Areas
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {focusTopics.map((topic, i) => (
              <button
                key={i}
                onClick={() => setActiveCommunity(topic.tag)}
                className="text-[11px] font-mono text-zinc-600 bg-zinc-50 hover:bg-zinc-100 hover:text-zinc-950 border border-zinc-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                #{topic.name}
              </button>
            ))}
          </div>
        </div>

        {/* Community Info Card */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 text-xs text-zinc-500 space-y-1.5 shadow-xs">
          <p className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>TechPeppy Platform</span>
          </p>
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            An open publication for software architects, AI engineers, and workstation enthusiasts.
          </p>
        </div>
      </div>
    </aside>
  );
};
