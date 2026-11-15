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
  Terminal,
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
    <aside className="hidden lg:block w-64 shrink-0 pr-5">
      <div className="sticky top-20 space-y-4">
        {/* Navigation Section */}
        <div className="rounded-md border border-[#E2E0D8] bg-white p-2.5">
          <div className="px-2 pb-2 mb-1.5 border-b border-[#E2E0D8] flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#686763]">
              Navigation
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded border border-[#10B981]/30">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              Live
            </span>
          </div>

          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeCommunity === item.slug;
              return (
                <button
                  key={item.slug}
                  onClick={() => setActiveCommunity(item.slug)}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs transition-all cursor-pointer ${
                    isActive
                      ? "border border-[#E2E0D8] border-l-2 border-l-[#10B981] bg-[#F6F5F0] text-[#141413] font-semibold"
                      : "border border-transparent text-[#686763] hover:bg-[#EFECE6] hover:text-[#141413] font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? "text-[#10B981]" : "text-[#8A8A95]"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded border ${
                      isActive
                        ? "bg-white border-[#E2E0D8] text-[#141413] font-bold"
                        : "bg-[#F6F5F0] border-[#E2E0D8]/70 text-[#686763]"
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Architectural Focus Areas - Technical Spec Chips */}
        <div className="rounded-md border border-[#E2E0D8] bg-white p-3.5">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#E2E0D8]">
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-[#10B981]" />
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#141413]">
                Key Focus Areas
              </h3>
            </div>
            <span className="font-mono text-[10px] text-[#8A8A95] tabular-nums">05</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {focusTopics.map((topic, i) => (
              <button
                key={i}
                onClick={() => setActiveCommunity(topic.tag)}
                className="text-[11px] font-mono text-[#141413] bg-[#F6F5F0] hover:bg-[#EFECE6] border border-[#E2E0D8] hover:border-[#141413]/40 px-2 py-1 rounded-md transition-colors cursor-pointer"
              >
                #{topic.name}
              </button>
            ))}
          </div>
        </div>

        {/* TechPeppy Platform Spec Card */}
        <div className="rounded-md border border-[#E2E0D8] bg-white p-3.5 text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E0D8]">
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#141413] flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-[#10B981]" />
              <span>TechPeppy Platform</span>
            </p>
            <span className="font-mono text-[10px] text-[#686763] bg-[#F6F5F0] border border-[#E2E0D8] px-1.5 py-0.5 rounded">
              v2.0
            </span>
          </div>
          <p className="text-[11px] text-[#686763] leading-relaxed">
            An open publication for software architects, AI engineers, and workstation enthusiasts.
          </p>
          <div className="mt-2.5 pt-2 border-t border-[#E2E0D8] flex items-center justify-between font-mono text-[10px] text-[#686763] tabular-nums">
            <span>ACCESS: OPEN</span>
            <span className="text-[#059669]">100% FREE</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
