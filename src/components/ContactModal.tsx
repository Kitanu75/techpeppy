"use client";

import React, { useState } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to send message");

      setSent(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111315]/70 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-xl border border-[#E4E4E7] bg-white shadow-2xl p-6 sm:p-7 my-8 text-[#111315]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 rounded-lg p-1.5 text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#111315] transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5">
          <span className="text-xs font-semibold text-[#0F766E]">Direct Inquiry</span>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-[-0.02em] text-[#111315]">
            Contact &amp; Consulting
          </h2>
          <p className="text-xs text-[#71717A] mt-1">
            Messages go directly to{" "}
            <span className="font-medium text-[#111315]">admin@techpeppy.com</span>
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg border border-[#E4E4E7] bg-[#F4F4F5]/60 p-6 text-center">
            <CheckCircle2 className="mx-auto mb-2.5 h-8 w-8 text-[#0F766E]" />
            <h3 className="text-sm font-semibold text-[#111315] mb-1">Message Sent</h3>
            <p className="text-xs text-[#52525B] mb-5">
              Thanks for reaching out. We&apos;ll get back to you shortly.
            </p>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                onClose();
              }}
              className="rounded-lg bg-[#111315] hover:bg-[#0F766E] px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-[#DC2626]">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#52525B] mb-1.5">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full rounded-lg border border-[#D4D4D8] bg-white py-2 px-3 text-sm text-[#111315] placeholder-[#71717A] focus:border-[#0F766E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#52525B] mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-[#D4D4D8] bg-white py-2 px-3 text-sm text-[#111315] placeholder-[#71717A] focus:border-[#0F766E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#52525B] mb-1.5">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Topic or question"
                className="w-full rounded-lg border border-[#D4D4D8] bg-white py-2 px-3 text-sm text-[#111315] placeholder-[#71717A] focus:border-[#0F766E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#52525B] mb-1.5">Message</label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message..."
                className="w-full rounded-lg border border-[#D4D4D8] bg-white py-2 px-3 text-sm text-[#111315] placeholder-[#71717A] focus:border-[#0F766E] focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#111315] hover:bg-[#0F766E] py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-colors cursor-pointer mt-2"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
