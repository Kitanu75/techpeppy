"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Send, Sparkles } from "lucide-react";
import { CommentType } from "@/lib/models/types";
import { CommentItem } from "./CommentItem";

interface CommentTreeProps {
  postId: string;
}

export const CommentTree: React.FC<CommentTreeProps> = ({ postId }) => {
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

    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentText.trim(),
          parentId: null,
          author: {
            name: "Sandeep Kumar",
            username: "sandeep_tech",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
            karma: 3420,
          },
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
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          parentId,
          author: {
            name: "Sandeep Kumar",
            username: "sandeep_tech",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
            karma: 3420,
          },
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
    <div className="mt-6 pt-6 border-t border-[#232838]">
      {/* Top Comment Input */}
      <div className="mb-6">
        <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
          <span>Comment as</span>
          <span className="font-bold text-gray-200">u/sandeep_tech</span>
        </p>
        <form onSubmit={handleAddTopComment} className="space-y-2">
          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="What are your thoughts on this tech post?"
            className="w-full rounded-2xl border border-[#2b3145] bg-[#11131a] p-3.5 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:border-orange-500 focus:outline-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#ff4500] to-[#ff6333] px-4 py-2 text-xs font-bold text-white shadow-md hover:from-[#e03d00] hover:to-[#eb5323] disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submitting ? "Posting..." : "Comment"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#202534] text-xs font-bold uppercase tracking-wider text-gray-400">
          <MessageSquare className="h-4 w-4 text-orange-400" />
          <span>Discussion Thread ({comments.length})</span>
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs text-gray-500">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500">
            No comments yet. Be the first to start the discussion!
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
