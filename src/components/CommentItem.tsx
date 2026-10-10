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
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  return (
    <div className={`relative ${level > 0 ? "ml-3 sm:ml-5 mt-2.5 border-l border-[#eff3f4] pl-3" : "mt-3"}`}>
      {/* Comment Header */}
      <div className="flex items-center gap-2 text-xs text-[#536471] mb-1">
        <img
          src={comment.author.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${comment.author.username}`}
          alt=""
          className="h-4 w-4 rounded-full object-cover"
        />
        <span className="font-semibold text-[#0f1419]">u/{comment.author.username}</span>
        <span>•</span>
        <span>{formatTimeAgo(comment.createdAt)}</span>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-[#536471] hover:text-[#0f1419] cursor-pointer"
        >
          {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Comment Body */}
          <div className="text-xs sm:text-sm text-[#374151] leading-relaxed whitespace-pre-line mb-1.5">
            {comment.content}
          </div>

          {/* Voting & Actions */}
          <div className="flex items-center gap-3 text-xs text-[#536471] mb-1.5">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleVote(1)}
                className={`p-0.5 hover:text-[#0f1419] transition-colors cursor-pointer ${userVote === 1 ? "text-[#0f1419]" : ""}`}
              >
                <ArrowBigUp className={`h-4 w-4 ${userVote === 1 ? "fill-[#0f1419]" : ""}`} />
              </button>
              <span className={`text-[11px] font-mono font-bold ${userVote === 1 ? "text-[#0f1419]" : userVote === -1 ? "text-blue-600" : "text-[#536471]"}`}>
                {score}
              </span>
              <button
                onClick={() => handleVote(-1)}
                className={`p-0.5 hover:text-blue-600 transition-colors cursor-pointer ${userVote === -1 ? "text-blue-600" : ""}`}
              >
                <ArrowBigDown className={`h-4 w-4 ${userVote === -1 ? "fill-blue-600" : ""}`} />
              </button>
            </div>

            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="flex items-center gap-1 text-[11px] hover:text-[#0f1419] transition-colors cursor-pointer"
            >
              <MessageSquare className="h-3 w-3" />
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
                placeholder="Write a reply..."
                className="w-full rounded-xl border border-[#e1e8ed] bg-[#f7f9fa] p-2 text-xs text-[#0f1419] placeholder-[#8b98a5] focus:border-[#0f1419] focus:bg-white focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReplyBox(false)}
                  className="rounded-full px-3 py-1 text-xs text-[#536471] hover:text-[#0f1419] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="rounded-full bg-[#0f1419] hover:bg-[#272c30] px-3.5 py-1 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingReply ? "..." : "Reply"}
                </button>
              </div>
            </form>
          )}

          {/* Nested Replies */}
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
