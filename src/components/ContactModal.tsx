"use client";

import React, { useState } from "react";
import { X, Mail, Send, CheckCircle2, AlertCircle, Building, User } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#1e293b] bg-[#0f172a] shadow-2xl p-6 sm:p-8 my-8 text-[#f8fafc]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-xl p-1.5 text-gray-400 hover:bg-[#1e293b] hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Mail className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Contact & Consulting
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Get in Touch
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Inquiries for software consulting, architecture advisory, or platform feedback. Direct to <span className="text-emerald-400 font-mono">admin@techpeppy.com</span>.
          </p>
        </div>

        {sent ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Message Sent Successfully!</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto mb-4">
              Thank you for reaching out. We have received your inquiry and will respond to your email shortly.
            </p>
            <button
              onClick={() => {
                setSent(false);
                onClose();
              }}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sandeep Kumar"
                    className="w-full rounded-xl border border-[#1e293b] bg-[#141e33] py-2.5 pl-10 pr-3.5 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-[#1e293b] bg-[#141e33] py-2.5 pl-10 pr-3.5 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Software Architecture Advisory / Consultation"
                className="w-full rounded-xl border border-[#1e293b] bg-[#141e33] py-2.5 px-3.5 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Message
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your engineering challenge, project scope, or questions..."
                className="w-full rounded-xl border border-[#1e293b] bg-[#141e33] py-2.5 px-3.5 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm disabled:opacity-50 transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <span>Sending Message...</span>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Message to TechPeppy</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
