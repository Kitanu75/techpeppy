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
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-[#1e293b] bg-[#0f172a] shadow-2xl my-6 flex flex-col max-h-[92vh] text-[#f8fafc]">
        {/* Sticky Top Header */}
        <div className="flex items-center justify-between border-b border-[#1e293b] bg-[#0b0f17]/95 px-4 sm:px-6 py-3.5 rounded-t-2xl">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            {/* Voting Pills in Header */}
            <div className="flex items-center gap-1 rounded-xl bg-[#141e33] px-2 py-1 border border-[#1e293b]">
              <button
                onClick={() => handleVote(1)}
                className={`p-1 hover:text-emerald-400 transition-colors cursor-pointer ${userVote === 1 ? "text-emerald-400" : "text-slate-400"}`}
              >
                <ArrowBigUp className={`h-5 w-5 ${userVote === 1 ? "fill-emerald-400" : ""}`} />
              </button>
              <span className={`text-xs font-bold font-mono ${userVote === 1 ? "text-emerald-400" : userVote === -1 ? "text-blue-400" : "text-slate-200"}`}>
                {score}
              </span>
              <button
                onClick={() => handleVote(-1)}
                className={`p-1 hover:text-blue-400 transition-colors cursor-pointer ${userVote === -1 ? "text-blue-400" : "text-slate-400"}`}
              >
                <ArrowBigDown className={`h-5 w-5 ${userVote === -1 ? "fill-blue-400" : ""}`} />
              </button>
            </div>

            <button
              onClick={() => {
                setActiveCommunity(post.communitySlug);
                onClose();
              }}
              className="font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer"
            >
              t/{post.communitySlug}
            </button>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              {post.author.avatar && (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="h-4 w-4 rounded-full object-cover ring-1 ring-slate-700"
                />
              )}
              <span className="font-medium text-slate-300">u/{post.author.username}</span>
            </div>
            <span>•</span>
            <span>{formatTimeAgo(post.createdAt)}</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-[#1e293b] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5">
          {/* Post Title */}
          <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-4">
            {post.title}
          </h1>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300 border border-emerald-500/20"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* High-Resolution Photo Showcase */}
          {post.images && post.images.length > 0 && (
            <div className="my-5 space-y-3">
              <div className="overflow-hidden rounded-2xl border border-[#1e293b] bg-black/60 flex items-center justify-center max-h-[560px]">
                <img
                  src={activePhoto || post.images[0]}
                  alt={post.title}
                  className="w-full h-auto max-h-[550px] object-contain"
                />
              </div>

              {/* Multi-Photo Selector Thumbnails */}
              {post.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {post.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhoto(img)}
                      className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                        activePhoto === img
                          ? "border-emerald-500 scale-105"
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

          {/* Full Text / Article Body */}
          {post.content && (
            <div className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line font-sans mb-6">
              {post.content}
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center gap-3 pt-4 border-t border-[#1e293b] text-xs text-slate-400">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-lg bg-[#141e33] px-3 py-1.5 font-medium hover:text-white transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  <span>Share Post</span>
                </>
              )}
            </button>

            <button
              onClick={() => setSaved(!saved)}
              className="flex items-center gap-1.5 rounded-lg bg-[#141e33] px-3 py-1.5 font-medium hover:text-white transition-colors cursor-pointer"
            >
              <Bookmark className={`h-4 w-4 ${saved ? "fill-emerald-400 text-emerald-400" : ""}`} />
              <span>{saved ? "Saved to Profile" : "Save"}</span>
            </button>
          </div>

          {/* Nested Reddit Comment Tree */}
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
