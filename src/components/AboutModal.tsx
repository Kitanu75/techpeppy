"use client";

import React from "react";
import { X, Code2, Database, BrainCircuit, ArrowRight, ShieldCheck, Mail, Sparkles } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  openContactModal: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  openContactModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#1e293b] bg-[#0f172a] shadow-2xl p-6 sm:p-8 my-8 text-[#f8fafc]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-xl p-1.5 text-gray-400 hover:bg-[#1e293b] hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              About TechPeppy
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Engineering Clarity & Systems
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            A developer platform and engineering publication dedicated to robust software patterns, modern AI orchestration, and production data pipelines.
          </p>
        </div>

        {/* Bio / Core Philosophy */}
        <div className="rounded-xl border border-[#1e293b] bg-[#141e33] p-4 sm:p-5 mb-6 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3">
          <p>
            My background spans classic software engineering patterns, deep data analysis, and modern AI orchestration. Whether it is writing custom React components for a decoupled headless stack, optimizing a SQL query, or engineering a vector database retrieval pipeline, the goal remains the same: <strong className="text-emerald-400 font-semibold">build reliable, maintainable software.</strong>
          </p>
          <p className="text-xs text-slate-400">
            TechPeppy was created to eliminate hype and focus on genuine technical execution — from architectural trade-offs to ergonomics in workspace setups.
          </p>
        </div>

        {/* What I Work On */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            What I Work On
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Pillar 1 */}
            <div className="rounded-xl border border-[#1e293b] bg-[#141e33] p-4 hover:border-emerald-500/30 transition-colors">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Code2 className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Software Architecture</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Decoupled headless CMS, Next.js fullstack, system scalability, performance.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-xl border border-[#1e293b] bg-[#141e33] p-4 hover:border-emerald-500/30 transition-colors">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
                <Database className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Data Science</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                ETL pipelines, analytics modeling, data warehouses, streaming systems.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-xl border border-[#1e293b] bg-[#141e33] p-4 hover:border-emerald-500/30 transition-colors">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">AI Learning</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Production RAG pipelines, fine-tuning, autonomous agents, LLMOps.
              </p>
            </div>
          </div>
        </div>

        {/* Collaboration Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 sm:p-5">
          <div>
            <h4 className="text-sm font-bold text-emerald-300">Want to collaborate?</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Let&apos;s talk about your software engineering challenge or technical project.
            </p>
          </div>
          <button
            onClick={() => {
              onClose();
              openContactModal();
            }}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer shrink-0"
          >
            <span>Get in touch</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
