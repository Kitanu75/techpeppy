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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#E8E5DD] bg-white shadow-2xl p-6 sm:p-7 my-8 text-[#1C1B18]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-1.5 text-[#8C8A83] hover:bg-[#F1EFE9] hover:text-[#1C1B18] transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[#1C1B18]">About TechPeppy</h2>
          <p className="text-xs text-[#8C8A83] mt-0.5">
            Community for software architecture, AI systems, and workspace setups.
          </p>
        </div>

        {/* Bio */}
        <div className="space-y-2.5 text-xs sm:text-sm text-[#4A4843] leading-relaxed mb-6">
          <p>
            Founded by <span className="text-[#1C1B18] font-semibold">Sandeep Kumar</span>. Built as a focused space for developers to discuss system design, local AI models, database performance, and share real workstation setups.
          </p>
          <p className="text-xs text-[#8C8A83]">
            Direct discussions, high-signal engineering, zero clutter.
          </p>
        </div>

        {/* Action */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8E5DD]">
          <span className="text-xs text-[#8C8A83]">Have a question or feedback?</span>
          <button
            onClick={() => {
              onClose();
              openContactModal();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <span>Contact Us</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
