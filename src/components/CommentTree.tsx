"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
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
    <div className="mt-5 pt-4 border-t border-[#262626]">
      {/* Top Comment Input */}
      <div className="mb-5">
        <form onSubmit={handleAddTopComment} className="space-y-2">
          <textarea
            rows={2}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="w-full rounded-xl border border-[#262626] bg-[#181818] p-3 text-xs sm:text-sm text-white placeholder-[#71767b] focus:border-white focus:outline-none resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="rounded-full bg-white hover:bg-neutral-200 px-4 py-1.5 text-xs font-semibold text-black disabled:opacity-50 transition-colors cursor-pointer"
            >
              {submitting ? "Posting..." : "Reply"}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#262626] text-xs font-semibold text-[#71767b]">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Comments ({comments.length})</span>
        </div>

        {loading ? (
          <div className="py-4 text-center text-xs text-[#71767b]">
            Loading...
          </div>
        ) : comments.length === 0 ? (
          <div className="py-4 text-center text-xs text-[#71767b]">
            No comments yet.
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
