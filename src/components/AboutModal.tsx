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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111315]/70 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-xl border border-[#E4E4E7] bg-white shadow-2xl p-6 sm:p-8 my-8 text-[#111315]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 rounded-lg p-1.5 text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#111315] transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <span className="text-xs font-semibold text-[#0F766E]">Publication</span>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.02em] text-[#111315]">
            About TechPeppy
          </h2>
          <p className="text-xs text-[#71717A] mt-1">
            Independent engineering publication on architecture, AI systems, and workstations.
          </p>
        </div>

        <div className="space-y-3 text-sm text-[#52525B] leading-relaxed mb-6">
          <p>
            Founded by <span className="text-[#111315] font-semibold">Sandeep Kumar</span>. Built as
            a focused space for developers to share system design breakdowns, local AI notes,
            database architecture, and real desk setups.
          </p>
          <p className="text-xs text-[#71717A]">
            Practical engineering notes and open discussions. Free and open to all readers.
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#E4E4E7]">
          <span className="text-xs text-[#71717A]">Questions or consulting inquiries?</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              openContactModal();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#111315] hover:bg-[#0F766E] px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            <span>Contact Us</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
