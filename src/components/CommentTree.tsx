"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Send, PenLine } from "lucide-react";
import { CommentType } from "@/lib/models/types";
import { CommentItem } from "./CommentItem";
import { SessionUser } from "@/lib/auth";

interface CommentTreeProps {
  postId: string;
  currentUser?: SessionUser | null;
  onRequireAuth?: () => void;
}

export const CommentTree: React.FC<CommentTreeProps> = ({
  postId,
  currentUser,
  onRequireAuth,
}) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      const data = await res.json();
      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (e) {
      console.error("Error fetching comments:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleAddTopComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!currentUser && onRequireAuth) {
      onRequireAuth();
      return;
    }

    setSubmitting(true);
    try {
      const authorData = currentUser
        ? {
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar,
            karma: currentUser.karma,
          }
        : {
            name: "Community Member",
            username: "guest_dev",
            avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=guest_dev",
            karma: 10,
          };

      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentText.trim(),
          parentId: null,
          author: authorData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCommentText("");
        await fetchComments();
      }
    } catch (e) {
      console.error("Error adding comment:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (parentId: string, content: string) => {
    if (!currentUser && onRequireAuth) {
      onRequireAuth();
      return;
    }

    try {
      const authorData = currentUser
        ? {
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar,
            karma: currentUser.karma,
          }
        : {
            name: "Community Member",
            username: "guest_dev",
            avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=guest_dev",
            karma: 10,
          };

      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          parentId,
          author: authorData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchComments();
      }
    } catch (e) {
      console.error("Error adding reply:", e);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-[#1e293b]">
      {/* Top Comment Input */}
      <div className="mb-6">
        <p className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
          <span>Comment as</span>
          <span className="font-semibold text-slate-200">
            {currentUser ? `u/${currentUser.username}` : "Guest / Community Dev"}
          </span>
        </p>
        <form onSubmit={handleAddTopComment} className="space-y-2">
          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share technical feedback, benchmark questions, or insights..."
            className="w-full rounded-2xl border border-[#1e293b] bg-[#111726] p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submitting ? "Posting..." : "Comment"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#1e293b] text-xs font-semibold uppercase tracking-wider text-slate-400">
          <MessageSquare className="h-4 w-4 text-emerald-400" />
          <span>Discussion Thread ({comments.length})</span>
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs text-slate-500">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No comments yet. Start the technical discussion!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onAddReply={handleAddReply}
            />
          ))
        )}
      </div>
    </div>
  );
};
