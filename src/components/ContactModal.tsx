"use client";

import React, { useState } from "react";
import { X, Send, CheckCircle2, AlertCircle } from "lucide-react";

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
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl border border-[#262626] bg-[#121212] shadow-2xl p-6 sm:p-7 my-8 text-[#f7f9f9]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-1.5 text-[#71767b] hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-xl font-bold text-white">Contact & Support</h2>
          <p className="text-xs text-[#71767b] mt-1">
            Direct inquiry to <span className="text-neutral-300">admin@techpeppy.com</span>
          </p>
        </div>

        {sent ? (
          <div className="rounded-xl border border-[#262626] bg-[#181818] p-6 text-center">
            <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-white" />
            <h3 className="text-sm font-bold text-white mb-1">Message Sent</h3>
            <p className="text-xs text-[#71767b] mb-4">
              Thanks for reaching out! We&apos;ll get back to you shortly.
            </p>
            <button
              onClick={() => {
                setSent(false);
                onClose();
              }}
              className="rounded-full bg-white hover:bg-neutral-200 px-4 py-1.5 text-xs font-semibold text-black transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full rounded-xl border border-[#262626] bg-[#181818] py-2 px-3 text-xs sm:text-sm text-white placeholder-[#71767b] focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full rounded-xl border border-[#262626] bg-[#181818] py-2 px-3 text-xs sm:text-sm text-white placeholder-[#71767b] focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Topic or question"
                className="w-full rounded-xl border border-[#262626] bg-[#181818] py-2 px-3 text-xs sm:text-sm text-white placeholder-[#71767b] focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Message
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message..."
                className="w-full rounded-xl border border-[#262626] bg-[#181818] py-2 px-3 text-xs sm:text-sm text-white placeholder-[#71767b] focus:border-white focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-white hover:bg-neutral-200 py-2 text-xs sm:text-sm font-semibold text-black disabled:opacity-50 transition-colors cursor-pointer mt-2"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
