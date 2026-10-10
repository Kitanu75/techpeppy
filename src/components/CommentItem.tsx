"use client";

import React, { useState } from "react";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { CommentType } from "@/lib/models/types";

interface CommentItemProps {
  comment: CommentType;
  onAddReply: (parentId: string, content: string) => Promise<void>;
  level?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onAddReply,
  level = 0,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Optimistic comment vote
  const [userVote, setUserVote] = useState<number>(comment.userVote || 0);
  const [score, setScore] = useState<number>(comment.score);

  const handleVote = (target: 1 | -1) => {
    let delta = 0;
    if (userVote === target) {
      setUserVote(0);
      delta = -target;
    } else {
      delta = target - userVote;
      setUserVote(target);
    }
    setScore((prev) => prev + delta);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      await onAddReply(comment.id, replyText.trim());
      setReplyText("");
      setShowReplyBox(false);
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diffSeconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diffSeconds < 60) return "just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className={`relative ${level > 0 ? "ml-3 sm:ml-6 mt-3 border-l-2 border-[#1e293b] pl-3 sm:pl-4" : "mt-4"}`}>
      {/* Comment Header */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
        <img
          src={comment.author.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${comment.author.username}`}
          alt={comment.author.name}
          className="h-5 w-5 rounded-full object-cover ring-1 ring-slate-700"
        />
        <span className="font-semibold text-slate-200">u/{comment.author.username}</span>
        {comment.author.karma !== undefined && (
          <span className="text-[10px] text-emerald-400 font-mono">⚡ {comment.author.karma}</span>
        )}
        <span>•</span>
        <span>{formatTimeAgo(comment.createdAt)}</span>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-slate-400 hover:text-slate-200 cursor-pointer"
          title={collapsed ? "Expand thread" : "Collapse thread"}
        >
          {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Comment Body */}
          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line mb-2">
            {comment.content}
          </div>

          {/* Voting & Actions */}
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
            <div className="flex items-center gap-1 rounded-lg bg-[#111726] px-1.5 py-0.5 border border-[#1e293b]">
              <button
                onClick={() => handleVote(1)}
                className={`p-0.5 hover:text-emerald-400 transition-colors cursor-pointer ${userVote === 1 ? "text-emerald-400" : ""}`}
              >
                <ArrowBigUp className={`h-4 w-4 ${userVote === 1 ? "fill-emerald-400" : ""}`} />
              </button>
              <span className={`text-[11px] font-bold font-mono ${userVote === 1 ? "text-emerald-400" : userVote === -1 ? "text-blue-400" : "text-slate-300"}`}>
                {score}
              </span>
              <button
                onClick={() => handleVote(-1)}
                className={`p-0.5 hover:text-blue-400 transition-colors cursor-pointer ${userVote === -1 ? "text-blue-400" : ""}`}
              >
                <ArrowBigDown className={`h-4 w-4 ${userVote === -1 ? "fill-blue-400" : ""}`} />
              </button>
            </div>

            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Reply</span>
            </button>
          </div>

          {/* Inline Reply Input */}
          {showReplyBox && (
            <form onSubmit={handleReplySubmit} className="my-2 space-y-2">
              <textarea
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Replying to u/${comment.author.username}...`}
                className="w-full rounded-xl border border-[#1e293b] bg-[#111726] p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReplyBox(false)}
                  className="rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:bg-[#1e293b] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {submittingReply ? "Posting..." : "Reply"}
                </button>
              </div>
            </form>
          )}

          {/* Recursive Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-1">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onAddReply={onAddReply}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
