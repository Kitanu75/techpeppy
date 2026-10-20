"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
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

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments?commentId=${commentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await fetchComments();
      } else {
        alert(data.error || "Failed to delete comment");
      }
    } catch (e) {
      console.error("Error deleting comment:", e);
    }
  };

  return (
    <div className="mt-5 pt-4 border-t border-zinc-100">
      {/* Top Comment Input */}
      <div className="mb-5">
        <form onSubmit={handleAddTopComment} className="space-y-2">
          <textarea
            rows={2}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Contribute architectural insight, ask a question, or reply..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 text-xs sm:text-sm text-zinc-950 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none resize-none font-normal"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="rounded-xl bg-zinc-950 hover:bg-zinc-800 px-4 py-1.5 text-xs font-semibold text-white shadow-2xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              {submitting ? "Posting..." : "Reply"}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 text-xs font-semibold text-zinc-950 font-mono">
          <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
          <span>
            Comments (
            {(() => {
              const countDeep = (list: CommentType[]): number => {
                let cnt = list.length;
                for (const c of list) {
                  if (c.replies && c.replies.length > 0) cnt += countDeep(c.replies);
                }
                return cnt;
              };
              return countDeep(comments);
            })()}
            )
          </span>
        </div>

        {loading ? (
          <div className="py-4 text-center text-xs text-zinc-400 font-mono">
            Loading discussion...
          </div>
        ) : comments.length === 0 ? (
          <div className="py-4 text-center text-xs text-zinc-400">
            No comments yet. Start the discussion!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onAddReply={handleAddReply}
              onDeleteComment={handleDeleteComment}
              currentUser={currentUser}
            />
          ))
        )}
      </div>
    </div>
  );
};
