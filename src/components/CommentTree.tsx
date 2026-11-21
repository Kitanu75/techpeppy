"use client";

import React, { useState, useEffect, useCallback } from "react";
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

  const fetchComments = useCallback(async () => {
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
  }, [postId]);

  useEffect(() => {
    let active = true;
    async function loadInitial() {
      try {
        const res = await fetch(`/api/posts/${postId}/comments`);
        const data = await res.json();
        if (active && data.success) {
          setComments(data.comments || []);
        }
      } catch (e) {
        console.error("Error fetching comments:", e);
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadInitial();
    return () => {
      active = false;
    };
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

  const countDeep = (list: CommentType[]): number => {
    let cnt = list.length;
    for (const c of list) {
      if (c.replies && c.replies.length > 0) cnt += countDeep(c.replies);
    }
    return cnt;
  };

  return (
    <div className="mt-7 pt-6 border-t border-[#E4E4E7]">
      <form onSubmit={handleAddTopComment} className="mb-6 space-y-2.5">
        <textarea
          rows={3}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment or note..."
          className="w-full rounded-lg border border-[#D4D4D8] bg-[#F4F4F5]/60 p-3 text-sm text-[#111315] placeholder-[#71717A] focus:border-[#0F766E] focus:bg-white focus:outline-none resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !commentText.trim()}
            className="rounded-lg bg-[#111315] hover:bg-[#0F766E] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50 transition-colors cursor-pointer"
          >
            {submitting ? "Posting..." : "Post comment"}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2.5 border-b border-[#E4E4E7] text-xs font-semibold text-[#111315]">
          <MessageSquare className="h-3.5 w-3.5 text-[#0F766E]" />
          <span>Discussion ({countDeep(comments)})</span>
        </div>

        {loading ? (
          <div className="py-5 text-center text-xs text-[#71717A]">Loading discussion...</div>
        ) : comments.length === 0 ? (
          <div className="py-5 text-center text-xs text-[#71717A]">
            No comments yet. Start the discussion.
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
