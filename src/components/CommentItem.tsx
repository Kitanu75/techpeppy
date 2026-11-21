"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp, MessageSquare, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { CommentType } from "@/lib/models/types";
import { SessionUser } from "@/lib/auth";

interface CommentItemProps {
  comment: CommentType;
  onAddReply: (parentId: string, content: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  level?: number;
  currentUser?: SessionUser | null;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onAddReply,
  onDeleteComment,
  level = 0,
  currentUser,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [userVote, setUserVote] = useState<number>(comment.userVote || 0);
  const [score, setScore] = useState<number>(comment.score);
  const [nowMs, setNowMs] = useState<number>(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setNowMs(Date.now());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleUpvote = () => {
    const nextVote = userVote === 1 ? 0 : 1;
    const delta = nextVote - userVote;
    setUserVote(nextVote);
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
    if (!nowMs) return "";
    const diffSeconds = Math.max(0, Math.floor((nowMs - new Date(dateStr).getTime()) / 1000));
    if (diffSeconds < 60) return "just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  const canDelete =
    currentUser &&
    (currentUser.role === "admin" ||
      currentUser.id === comment.author?.id ||
      currentUser.username === comment.author?.username);

  return (
    <div
      className={`relative ${
        level > 0 ? "ml-3 sm:ml-5 mt-3 border-l border-[#E4E4E7] pl-3.5" : "mt-4"
      }`}
    >
      <div className="flex items-center gap-2 text-xs text-[#71717A] mb-1.5">
        <img
          src={
            comment.author.avatar ||
            `https://api.dicebear.com/7.x/identicon/svg?seed=${comment.author.username}`
          }
          alt=""
          className="h-4.5 w-4.5 rounded-full object-cover"
        />
        <span className="font-medium text-[#111315]">
          {comment.author.name || comment.author.username}
        </span>
        <span aria-hidden>·</span>
        <span suppressHydrationWarning className="tabular-nums">
          {formatTimeAgo(comment.createdAt)}
        </span>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand comment" : "Collapse comment"}
          className="ml-auto text-[#A1A1AA] hover:text-[#111315] cursor-pointer"
        >
          {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="text-sm text-[#27272A] leading-relaxed whitespace-pre-line mb-2">
            {comment.content}
          </div>

          <div className="flex items-center gap-3 text-xs text-[#71717A] mb-2">
            <button
              type="button"
              onClick={handleUpvote}
              className={`inline-flex items-center gap-1 tabular-nums cursor-pointer transition-colors ${
                userVote === 1 ? "text-[#0F766E] font-semibold" : "hover:text-[#111315]"
              }`}
            >
              <ArrowUp className="h-3.5 w-3.5" />
              <span>{score}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="inline-flex items-center gap-1 hover:text-[#111315] transition-colors cursor-pointer font-medium"
            >
              <MessageSquare className="h-3 w-3" />
              <span>Reply</span>
            </button>

            {canDelete && onDeleteComment && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Delete this comment?")) {
                    void onDeleteComment(comment.id);
                  }
                }}
                title="Delete comment"
                className="ml-auto text-[#A1A1AA] hover:text-[#DC2626] cursor-pointer p-0.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {showReplyBox && (
            <form onSubmit={handleReplySubmit} className="my-2.5 space-y-2">
              <textarea
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full rounded-lg border border-[#D4D4D8] bg-[#F4F4F5]/60 p-2.5 text-xs text-[#111315] placeholder-[#71717A] focus:border-[#0F766E] focus:bg-white focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReplyBox(false)}
                  className="rounded-lg px-3 py-1 text-xs text-[#71717A] hover:text-[#111315] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="rounded-lg bg-[#111315] hover:bg-[#0F766E] px-3.5 py-1 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingReply ? "..." : "Reply"}
                </button>
              </div>
            </form>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-1">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onAddReply={onAddReply}
                  onDeleteComment={onDeleteComment}
                  level={level + 1}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
