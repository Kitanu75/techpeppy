"use client";

import React from "react";
import { Shield, TrendingUp, Mail, CheckCircle2, ArrowRight, Code2, Database, BrainCircuit, Sparkles } from "lucide-react";
import { CommunityType } from "@/lib/models/types";

interface SidebarRightProps {
  communities: CommunityType[];
  openCreateModal: () => void;
  setActiveCommunity: (slug: string) => void;
  openAboutModal?: () => void;
  openContactModal?: () => void;
  totalPostsCount?: number;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({
  communities,
  openCreateModal,
  setActiveCommunity,
  openAboutModal,
  openContactModal,
  totalPostsCount = 0,
}) => {
  return (
    <aside className="hidden xl:block w-80 shrink-0 pl-4 space-y-5">
      {/* About TechPeppy Card */}
      <div className="rounded-2xl border border-[#1e293b] bg-[#0f172a] p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            About TechPeppy
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          The engineering publication and developer hub for software architecture, production AI orchestration, and workstation setups.
        </p>

        {/* Dynamic Verified Metrics (Zero Fake Stats) */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#141e33] p-3 text-center mb-4 border border-[#1e293b]">
          <div>
            <p className="text-base font-extrabold text-white">{totalPostsCount}</p>
            <p className="text-[10px] text-slate-400 font-medium">Community Posts</p>
          </div>
          <div>
            <p className="text-base font-extrabold text-emerald-400">100%</p>
            <p className="text-[10px] text-slate-400 font-medium">Free & Open</p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
        >
          Publish a Post or Setup
        </button>
      </div>

      {/* Engineering Consulting & Advisory (From Original Site) */}
      <div className="rounded-2xl border border-emerald-500/20 bg-[#0f1d2a]/80 p-4 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-[#1e293b] mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Consulting & Advisory</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          Engineering advisory for decoupled headless architectures, scalable systems, and LLMOps pipelines.
        </p>

        <div className="space-y-2 mb-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Headless CMS & Scalable Frontends</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Enterprise RAG & AI Agent Pipelines</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Database Performance & Latency Tuning</span>
          </div>
        </div>

        {openContactModal && (
          <button
            onClick={openContactModal}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 py-2 text-xs font-bold text-emerald-300 transition-colors cursor-pointer"
          >
            <span>Inquire for Consulting</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Platform Rules */}
      <div className="rounded-2xl border border-[#1e293b] bg-[#0f172a] p-4 shadow-sm text-xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
          <Shield className="h-4 w-4 text-teal-400" />
          <span>Platform Standards</span>
        </div>
        <ul className="space-y-2 text-slate-400">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Provide accurate technical benchmarks and source references.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Share original workspace photos with hardware gear listed.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Maintain constructive, high-signal engineering discussions.</span>
          </li>
        </ul>
      </div>

      {/* Footer Info */}
      <div className="px-2 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Mail className="h-3.5 w-3.5 text-emerald-400" />
          <span>Inquiries: <a href="mailto:admin@techpeppy.com" className="text-slate-300 hover:text-emerald-400">admin@techpeppy.com</a></span>
        </div>
        <p>© 2026 TechPeppy.com • Engineering & Architecture</p>
      </div>
    </aside>
  );
};
