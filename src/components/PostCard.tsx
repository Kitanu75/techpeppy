"use client";

import React, { useState } from "react";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  Pin,
  Trash2,
} from "lucide-react";
import { PostType } from "@/lib/models/types";
import { SessionUser } from "@/lib/auth";
import { CommunityIcon } from "./CommunityIcon";

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
  const [userVote, setUserVote] = useState<number>(post.userVote || 0);
  const [score, setScore] = useState<number>(post.score);

  const handleVote = (e: React.MouseEvent, targetValue: 1 | -1) => {
    e.stopPropagation();
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
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  return (
    <article
      onClick={() => onSelectPost(post)}
      className="group relative rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 hover:border-zinc-300 hover:shadow-card transition-all cursor-pointer overflow-hidden mb-4"
    >
      {/* Top Header: Metadata on Left, Upvote Badge on Right */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          {post.isPinned && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
              <Pin className="h-3 w-3" /> Pinned
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveCommunity(post.communitySlug);
            }}
            className="flex items-center gap-1.5 font-semibold text-zinc-900 hover:text-emerald-600 transition-colors"
          >
            <CommunityIcon slug={post.communitySlug} className="h-3.5 w-3.5" />
            <span>t/{post.communitySlug}</span>
          </button>

          <span>•</span>

          <div className="flex items-center gap-1.5">
            {post.author.avatar && (
              <img
                src={post.author.avatar}
                alt=""
                className="h-4 w-4 rounded-full object-cover ring-1 ring-zinc-200"
              />
            )}
            <span className="font-medium text-zinc-700">{post.author.name || `u/${post.author.username}`}</span>
          </div>

          <span>•</span>
          <span suppressHydrationWarning>{formatTimeAgo(post.createdAt)}</span>
        </div>

        {/* Tactile Upvote Pill (Product Hunt & GitHub Discussions Style) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center rounded-xl border border-zinc-200/90 bg-zinc-50/70 p-0.5"
        >
          <button
            onClick={(e) => handleVote(e, 1)}
            title="Upvote"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              userVote === 1
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-zinc-700 hover:bg-zinc-200/60 hover:text-zinc-950"
            }`}
          >
            <ArrowBigUp className={`h-4 w-4 ${userVote === 1 ? "fill-white" : ""}`} />
            <span className="font-mono">{score}</span>
          </button>

          <button
            onClick={(e) => handleVote(e, -1)}
            title="Downvote"
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              userVote === -1
                ? "text-rose-600 bg-rose-50"
                : "text-zinc-400 hover:text-rose-600 hover:bg-zinc-200/60"
            }`}
          >
            <ArrowBigDown className={`h-4 w-4 ${userVote === -1 ? "fill-rose-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Post Title */}
      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950 leading-snug group-hover:text-emerald-600 transition-colors mb-2.5">
        {post.title}
      </h2>

      {/* Photo / Image Content */}
      {post.images && post.images.length > 0 && (
        <div className="my-3.5 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-50">
          {post.images.length === 1 ? (
            <div className="relative max-h-[480px] overflow-hidden flex items-center justify-center bg-zinc-50">
              <img
                src={post.images[0]}
                alt=""
                className="w-full max-h-[480px] object-cover group-hover:scale-[1.008] transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 p-1.5">
              {post.images.slice(0, 4).map((img, idx) => (
                <div key={idx} className="relative aspect-video overflow-hidden rounded-lg bg-zinc-100">
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content text preview */}
      {post.content && (
        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed line-clamp-3 mb-3.5 whitespace-pre-line font-normal">
          {post.content}
        </p>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {post.tags.map((t, idx) => (
            <span
              key={idx}
              className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-mono font-medium text-zinc-600 border border-zinc-200/60"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center gap-5 pt-3 border-t border-zinc-100 text-xs text-zinc-500">
        <button
          onClick={() => onSelectPost(post)}
          className="flex items-center gap-1.5 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="font-medium">{post.commentsCount} Comments</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          {copied ? (
            <span className="text-emerald-600 font-semibold">Copied!</span>
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
          className={`flex items-center gap-1.5 hover:text-zinc-900 transition-colors cursor-pointer ${
            saved ? "text-emerald-600 font-semibold" : ""
          }`}
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-emerald-600" : ""}`} />
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
            className="ml-auto text-rose-500 hover:text-rose-700 text-xs cursor-pointer p-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </article>
  );
};
