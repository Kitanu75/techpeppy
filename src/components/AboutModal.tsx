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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#262626] bg-[#121212] shadow-2xl p-6 sm:p-7 my-8 text-[#f7f9f9]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-1.5 text-[#71767b] hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-xl font-bold text-white">About TechPeppy</h2>
          <p className="text-xs text-[#71767b] mt-1">
            Community for software architecture, AI systems, and workspace setups.
          </p>
        </div>

        {/* Short & Direct Bio */}
        <div className="space-y-3 text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6">
          <p>
            Founded by <span className="text-white font-semibold">Sandeep Kumar</span>. Built as a focused space for developers to discuss system design, local AI models, database performance, and share real workstation setups.
          </p>
          <p className="text-xs text-[#71767b]">
            Direct discussions, no sponsored clutter, high-signal engineering.
          </p>
        </div>

        {/* Direct Action */}
        <div className="flex items-center justify-between pt-4 border-t border-[#262626]">
          <span className="text-xs text-[#71767b]">Have a question or feedback?</span>
          <button
            onClick={() => {
              onClose();
              openContactModal();
            }}
            className="flex items-center gap-1.5 rounded-full bg-white hover:bg-neutral-200 px-4 py-1.5 text-xs font-semibold text-black transition-colors cursor-pointer"
          >
            <span>Contact Us</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
