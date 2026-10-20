"use client";

import React from "react";
import { X, ArrowRight } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200/90 bg-white shadow-2xl p-6 sm:p-7 my-8 text-zinc-950">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-zinc-950">About TechPeppy</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Community for software architecture, AI systems, and workspace setups.
          </p>
        </div>

        {/* Bio */}
        <div className="space-y-2.5 text-xs sm:text-sm text-zinc-600 leading-relaxed mb-6 font-normal">
          <p>
            Founded by <span className="text-zinc-950 font-semibold">Sandeep Kumar</span>. Built as a focused space for developers to discuss system design, local AI models, database performance, and share real workstation setups.
          </p>
          <p className="text-xs text-zinc-400">
            Direct discussions, high-signal engineering, zero clutter.
          </p>
        </div>

        {/* Action */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
          <span className="text-xs text-zinc-500">Have a question or feedback?</span>
          <button
            onClick={() => {
              onClose();
              openContactModal();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
          >
            <span>Contact Us</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
