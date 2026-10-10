"use client";

import React, { useState } from "react";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  Pin,
  Check,
  ExternalLink,
  Sparkles,
  Trash2,
} from "lucide-react";
import { PostType } from "@/lib/models/types";
import { SessionUser } from "@/lib/auth";

interface PostCardProps {
  post: PostType;
  onSelectPost: (post: PostType) => void;
  onVote: (postId: string, value: 1 | -1 | 0) => void;
  setActiveCommunity: (slug: string) => void;
  currentUser?: SessionUser | null;
  onDeletePost?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onSelectPost,
  onVote,
  setActiveCommunity,
  currentUser,
  onDeletePost,
}) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Optimistic vote state
  const [userVote, setUserVote] = useState<number>(post.userVote || 0);
  const [score, setScore] = useState<number>(post.score);

  const handleVote = (e: React.MouseEvent, targetValue: 1 | -1) => {
    e.stopPropagation();
    let newVote = targetValue;
    let scoreDelta = 0;

    if (userVote === targetValue) {
      // Toggle off / cancel vote
      newVote = 0 as any;
      scoreDelta = -targetValue;
    } else {
      scoreDelta = targetValue - userVote;
    }

    setUserVote(newVote);
    setScore((prev) => prev + scoreDelta);
    onVote(post.id, newVote as any);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <article
      onClick={() => onSelectPost(post)}
      className="group relative flex rounded-2xl border border-[#1e293b] bg-[#0f172a] hover:border-[#334155] transition-all duration-200 cursor-pointer overflow-hidden shadow-sm hover:shadow-md mb-3"
    >
      {/* Left Voting Pillar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-11 sm:w-12 shrink-0 flex-col items-center justify-start bg-[#0b0f17] py-3 border-r border-[#1e293b]"
      >
        <button
          onClick={(e) => handleVote(e, 1)}
          title="Upvote"
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors vote-up cursor-pointer ${
            userVote === 1
              ? "text-emerald-400 bg-emerald-500/15"
              : "text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
          }`}
        >
          <ArrowBigUp className={`h-6 w-6 ${userVote === 1 ? "fill-emerald-400" : ""}`} />
        </button>

        <span
          className={`my-1 text-xs sm:text-sm font-bold font-mono tracking-tight ${
            userVote === 1
              ? "text-emerald-400"
              : userVote === -1
              ? "text-blue-400"
              : "text-slate-200"
          }`}
        >
          {score}
        </span>

        <button
          onClick={(e) => handleVote(e, -1)}
          title="Downvote"
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors vote-down cursor-pointer ${
            userVote === -1
              ? "text-blue-400 bg-blue-500/15"
              : "text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
          }`}
        >
          <ArrowBigDown className={`h-6 w-6 ${userVote === -1 ? "fill-blue-400" : ""}`} />
        </button>
      </div>

      {/* Main Post Card Body */}
      <div className="flex-1 p-3.5 sm:p-4 min-w-0">
        {/* Post Metadata Header */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
          {post.isPinned && (
            <span className="flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/25">
              <Pin className="h-3 w-3" /> Pinned
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveCommunity(post.communitySlug);
            }}
            className="font-bold text-gray-100 hover:text-emerald-400 hover:underline transition-colors"
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
            <span className="hover:underline">u/{post.author.username}</span>
          </div>

          <span>•</span>
          <span className="text-gray-400">{formatTimeAgo(post.createdAt)}</span>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 ml-auto">
              {post.tags.slice(0, 2).map((t, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-500/20"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Post Title */}
        <h2 className="text-base sm:text-lg font-bold text-gray-100 leading-snug group-hover:text-emerald-300 transition-colors mb-2.5">
          {post.title}
        </h2>

        {/* Photo / Image Content */}
        {post.images && post.images.length > 0 && (
          <div className="my-3 overflow-hidden rounded-xl border border-[#2b3145] bg-[#0c0e14]">
            {post.images.length === 1 ? (
              <div className="relative max-h-[500px] overflow-hidden flex items-center justify-center bg-black/40">
                <img
                  src={post.images[0]}
                  alt={post.title}
                  className="w-full max-h-[480px] object-contain hover:scale-[1.01] transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 p-1.5">
                {post.images.slice(0, 4).map((img, idx) => (
                  <div key={idx} className="relative aspect-video overflow-hidden rounded-lg bg-black/50">
                    <img
                      src={img}
                      alt={`${post.title} ${idx + 1}`}
                      className="h-full w-full object-cover hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Text / Markdown Body Content */}
        {post.content && (
          <div className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-3 mb-3 whitespace-pre-line font-sans">
            {post.content}
          </div>
        )}

        {/* Footer Actions Bar */}
        <div className="flex items-center gap-2 sm:gap-4 pt-2 border-t border-[#1f2433] text-xs text-gray-400">
          <button
            onClick={() => onSelectPost(post)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium hover:bg-[#202535] hover:text-gray-200 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.commentsCount} Comments</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium hover:bg-[#202535] hover:text-gray-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSaved(!saved);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
              saved
                ? "text-emerald-400 bg-emerald-500/10"
                : "hover:bg-[#162238] hover:text-slate-200"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${saved ? "fill-emerald-400" : ""}`} />
            <span>{saved ? "Saved" : "Save"}</span>
          </button>

          {currentUser && (currentUser.role === "admin" || currentUser.id === post.author?.id) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Delete this post?")) {
                  if (onDeletePost) onDeletePost(post.id);
                }
              }}
              title="Delete post"
              className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-red-400/80 hover:text-red-300 hover:bg-red-500/15 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
