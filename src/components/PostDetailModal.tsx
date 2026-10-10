"use client";

import React, { useState } from "react";
import {
  X,
  ArrowBigUp,
  ArrowBigDown,
  Share2,
  Bookmark,
  Pin,
  Check,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { PostType } from "@/lib/models/types";
import { CommentTree } from "./CommentTree";

interface PostDetailModalProps {
  post: PostType | null;
  onClose: () => void;
  onVote: (postId: string, value: 1 | -1 | 0) => void;
  setActiveCommunity: (slug: string) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  onClose,
  onVote,
  setActiveCommunity,
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
      <div className="relative w-full max-w-4xl rounded-2xl border border-[#2b3248] bg-[#151824] shadow-2xl my-6 flex flex-col max-h-[92vh]">
        {/* Sticky Top Header */}
        <div className="flex items-center justify-between border-b border-[#232838] bg-[#12141c]/95 px-4 sm:px-6 py-3.5 rounded-t-2xl">
          <div className="flex items-center gap-3 text-xs text-gray-300">
            {/* Voting Pills in Header */}
            <div className="flex items-center gap-1 rounded-xl bg-[#1c202d] px-2 py-1 border border-[#2a3044]">
              <button
                onClick={() => handleVote(1)}
                className={`p-1 hover:text-orange-500 ${userVote === 1 ? "text-orange-500" : "text-gray-400"}`}
              >
                <ArrowBigUp className={`h-5 w-5 ${userVote === 1 ? "fill-orange-500" : ""}`} />
              </button>
              <span className={`text-xs font-bold font-mono ${userVote === 1 ? "text-orange-500" : userVote === -1 ? "text-blue-400" : "text-gray-200"}`}>
                {score}
              </span>
              <button
                onClick={() => handleVote(-1)}
                className={`p-1 hover:text-blue-400 ${userVote === -1 ? "text-blue-400" : "text-gray-400"}`}
              >
                <ArrowBigDown className={`h-5 w-5 ${userVote === -1 ? "fill-blue-400" : ""}`} />
              </button>
            </div>

            <button
              onClick={() => {
                setActiveCommunity(post.communitySlug);
                onClose();
              }}
              className="font-bold text-white hover:text-orange-400 transition-colors"
            >
              t/{post.communitySlug}
            </button>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              {post.author.avatar && (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
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
            className="rounded-xl p-1.5 text-gray-400 hover:bg-[#202534] hover:text-white transition-colors"
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
                  className="rounded-full bg-[#202534] px-2.5 py-0.5 text-xs font-medium text-orange-300 border border-orange-500/10"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* High-Resolution Photo Showcase */}
          {post.images && post.images.length > 0 && (
            <div className="my-5 space-y-3">
              <div className="overflow-hidden rounded-2xl border border-[#2c3348] bg-black flex items-center justify-center max-h-[560px]">
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
                      className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        activePhoto === img
                          ? "border-orange-500 scale-105"
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
            <div className="text-sm sm:text-base text-gray-200 leading-relaxed whitespace-pre-line font-sans mb-6">
              {post.content}
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center gap-3 pt-4 border-t border-[#232838] text-xs text-gray-400">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-lg bg-[#1a1e2b] px-3 py-1.5 font-medium hover:text-white transition-colors"
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
              className="flex items-center gap-1.5 rounded-lg bg-[#1a1e2b] px-3 py-1.5 font-medium hover:text-white transition-colors"
            >
              <Bookmark className={`h-4 w-4 ${saved ? "fill-orange-400 text-orange-400" : ""}`} />
              <span>{saved ? "Saved to Profile" : "Save"}</span>
            </button>
          </div>

          {/* Nested Reddit Comment Tree */}
          <CommentTree postId={post.id} />
        </div>
      </div>
    </div>
  );
};
