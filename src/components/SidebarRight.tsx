"use client";

import React from "react";
import { Flame, Shield, TrendingUp, Info, ExternalLink, Mail, CheckCircle2 } from "lucide-react";
import { CommunityType } from "@/lib/models/types";

interface SidebarRightProps {
  communities: CommunityType[];
  openCreateModal: () => void;
  setActiveCommunity: (slug: string) => void;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({
  communities,
  openCreateModal,
  setActiveCommunity,
}) => {
  return (
    <aside className="hidden xl:block w-80 shrink-0 pl-4 space-y-5">
      {/* About TechPeppy Card */}
      <div className="rounded-2xl border border-[#232838] bg-[#151822] p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
            About TechPeppy
          </h3>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-3">
          The central hub for gadget reviews, desk setups, AI breakthroughs, and developer discussions.
        </p>

        {/* Community Quick Stats */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#1a1e2b] p-3 text-center mb-4">
          <div>
            <p className="text-base font-extrabold text-white">79.8k</p>
            <p className="text-[10px] text-gray-400 font-medium">Members</p>
          </div>
          <div>
            <p className="text-base font-extrabold text-orange-400">100%</p>
            <p className="text-[10px] text-gray-400 font-medium">Free & Open</p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="w-full rounded-xl bg-gradient-to-r from-[#ff4500] to-[#ff6333] py-2 text-xs font-bold text-white shadow-md hover:from-[#e03d00] hover:to-[#eb5323] transition-all cursor-pointer"
        >
          Create a Tech Post
        </button>
      </div>

      {/* Top Communities Leaderboard */}
      <div className="rounded-2xl border border-[#232838] bg-[#151822] p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#232838] mb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300">
            <TrendingUp className="h-4 w-4 text-orange-400" />
            <span>Top Communities</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {communities.slice(0, 4).map((c, idx) => (
            <div
              key={c.id || c.slug}
              onClick={() => setActiveCommunity(c.slug)}
              className="flex items-center justify-between rounded-xl p-2 hover:bg-[#1f2434] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-gray-400 w-4">
                  {idx + 1}
                </span>
                <span className="text-sm">{c.icon}</span>
                <div>
                  <p className="text-xs font-bold text-gray-200 group-hover:text-orange-400 transition-colors">
                    t/{c.slug}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {c.membersCount > 1000
                      ? `${(c.membersCount / 1000).toFixed(1)}k members`
                      : `${c.membersCount} members`}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-semibold text-orange-400 group-hover:underline">
                View
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Community Rules / Guidelines */}
      <div className="rounded-2xl border border-[#232838] bg-[#151822] p-4 shadow-sm text-xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300 mb-3">
          <Shield className="h-4 w-4 text-purple-400" />
          <span>Platform Rules</span>
        </div>
        <ul className="space-y-2 text-gray-400">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Post original photos and setups with source gear listed.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Provide accurate benchmarks and tech news citations.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Maintain constructive and respectful discussions.</span>
          </li>
        </ul>
      </div>

      {/* Footer Info */}
      <div className="px-2 text-[11px] text-gray-400 space-y-1.5 leading-relaxed">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Mail className="h-3.5 w-3.5" />
          <span>Support: admin@techpeppy.com</span>
        </div>
        <p>© 2026 TechPeppy.com • All Rights Reserved.</p>
      </div>
    </aside>
  );
};
