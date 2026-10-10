"use client";

import React, { useState } from "react";
import {
  X,
  ArrowBigUp,
  ArrowBigDown,
  Share2,
  Bookmark,
  Check,
} from "lucide-react";
import { PostType } from "@/lib/models/types";
import { CommentTree } from "./CommentTree";
import { SessionUser } from "@/lib/auth";

interface PostDetailModalProps {
  post: PostType | null;
  onClose: () => void;
  onVote: (postId: string, value: 1 | -1 | 0) => void;
  setActiveCommunity: (slug: string) => void;
  currentUser?: SessionUser | null;
  onRequireAuth?: () => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  onClose,
  onVote,
  setActiveCommunity,
  currentUser,
  onRequireAuth,
}) => {
  if (!post) return null;

  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userVote, setUserVote] = useState<number>(post.userVote || 0);
  const [score, setScore] = useState<number>(post.score);
  const [activePhoto, setActivePhoto] = useState<string | null>(
    post.images && post.images.length > 0 ? post.images[0] : null
  );

  const handleVote = (targetValue: 1 | -1) => {
    let newVote = targetValue;
    let scoreDelta = 0;

    if (userVote === targetValue) {
      newVote = 0 as any;
      scoreDelta = -targetValue;
    } else {
      scoreDelta = targetValue - userVote;
    }

    setUserVote(newVote);
    setScore((prev) => prev + scoreDelta);
    onVote(post.id, newVote as any);
  };

  const handleShare = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}?post=${post.id}` : "";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diffSeconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diffSeconds < 60) return "just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-[#eff3f4] bg-white shadow-xl my-6 flex flex-col max-h-[92vh] text-[#0f1419]">
        {/* Sticky Top Header */}
        <div className="flex items-center justify-between border-b border-[#eff3f4] bg-[#ffffff]/95 px-4 sm:px-6 py-3 rounded-t-2xl">
          <div className="flex items-center gap-3 text-xs text-[#536471]">
            {/* Voting Pills in Header */}
            <div className="flex items-center gap-1 rounded-full bg-[#f7f9fa] px-2 py-0.5 border border-[#eff3f4]">
              <button
                onClick={() => handleVote(1)}
                className={`p-0.5 hover:text-[#0f1419] transition-colors cursor-pointer ${userVote === 1 ? "text-[#0f1419]" : "text-[#536471]"}`}
              >
                <ArrowBigUp className={`h-4 w-4 ${userVote === 1 ? "fill-[#0f1419]" : ""}`} />
              </button>
              <span className={`text-xs font-bold font-mono ${userVote === 1 ? "text-[#0f1419]" : userVote === -1 ? "text-blue-600" : "text-[#0f1419]"}`}>
                {score}
              </span>
              <button
                onClick={() => handleVote(-1)}
                className={`p-0.5 hover:text-blue-600 transition-colors cursor-pointer ${userVote === -1 ? "text-blue-600" : "text-[#536471]"}`}
              >
                <ArrowBigDown className={`h-4 w-4 ${userVote === -1 ? "fill-blue-600" : ""}`} />
              </button>
            </div>

            <button
              onClick={() => {
                setActiveCommunity(post.communitySlug);
                onClose();
              }}
              className="font-bold text-[#0f1419] hover:underline transition-colors cursor-pointer"
            >
              t/{post.communitySlug}
            </button>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              {post.author.avatar && (
                <img
                  src={post.author.avatar}
                  alt=""
                  className="h-4 w-4 rounded-full object-cover"
                />
              )}
              <span>u/{post.author.username}</span>
            </div>
            <span>•</span>
            <span>{formatTimeAgo(post.createdAt)}</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[#536471] hover:bg-[#f7f9fa] hover:text-[#0f1419] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <h1 className="text-lg sm:text-xl font-bold text-[#0f1419] leading-tight mb-3">
            {post.title}
          </h1>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-[#f7f9fa] border border-[#eff3f4] px-2.5 py-0.5 text-xs text-[#536471]"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="my-3 space-y-2">
              <div className="overflow-hidden rounded-xl border border-[#eff3f4] bg-neutral-50 flex items-center justify-center max-h-[500px]">
                <img
                  src={activePhoto || post.images[0]}
                  alt=""
                  className="w-full h-auto max-h-[490px] object-contain"
                />
              </div>

              {post.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {post.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhoto(img)}
                      className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition-all cursor-pointer ${
                        activePhoto === img
                          ? "border-[#0f1419]"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Body Content */}
          {post.content && (
            <div className="text-xs sm:text-sm text-[#374151] leading-relaxed whitespace-pre-line mb-4">
              {post.content}
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center gap-3 pt-3 border-t border-[#eff3f4] text-xs text-[#536471]">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-[#0f1419] transition-colors cursor-pointer"
            >
              {copied ? (
                <span className="text-[#0f1419] font-semibold">Copied!</span>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </>
              )}
            </button>

            <button
              onClick={() => setSaved(!saved)}
              className={`flex items-center gap-1.5 hover:text-[#0f1419] transition-colors cursor-pointer ${
                saved ? "text-[#0f1419]" : ""
              }`}
            >
              <Bookmark className={`h-4 w-4 ${saved ? "fill-[#0f1419]" : ""}`} />
              <span>{saved ? "Saved" : "Save"}</span>
            </button>
          </div>

          {/* Comment Tree */}
          <CommentTree
            postId={post.id}
            currentUser={currentUser}
            onRequireAuth={onRequireAuth}
          />
        </div>
      </div>
    </div>
  );
};
