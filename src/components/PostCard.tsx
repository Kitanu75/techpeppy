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
      className="group relative flex rounded-2xl border border-[#E8E5DD] bg-white hover:border-[#D4D0C7] transition-all cursor-pointer overflow-hidden mb-4 shadow-xs"
    >
      {/* Left Voting Pillar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-12 sm:w-14 shrink-0 flex-col items-center justify-start bg-[#F8F7F4]/90 py-4 border-r border-[#E8E5DD]"
      >
        <button
          onClick={(e) => handleVote(e, 1)}
          title="Upvote"
          className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors cursor-pointer ${
            userVote === 1
              ? "text-emerald-700 bg-emerald-100/80"
              : "text-[#8C8A83] hover:text-emerald-700 hover:bg-emerald-50/70"
          }`}
        >
          <ArrowBigUp className={`h-5 w-5 ${userVote === 1 ? "fill-emerald-600" : ""}`} />
        </button>

        <span
          className={`my-1.5 text-xs font-bold font-mono tracking-tight ${
            userVote === 1 ? "text-emerald-700" : userVote === -1 ? "text-rose-600" : "text-[#4A4843]"
          }`}
        >
          {score}
        </span>

        <button
          onClick={(e) => handleVote(e, -1)}
          title="Downvote"
          className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors cursor-pointer ${
            userVote === -1
              ? "text-rose-600 bg-rose-100/80"
              : "text-[#8C8A83] hover:text-rose-600 hover:bg-rose-50/70"
          }`}
        >
          <ArrowBigDown className={`h-5 w-5 ${userVote === -1 ? "fill-rose-600" : ""}`} />
        </button>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 p-5 sm:p-6 min-w-0">
        {/* Post Metadata Header */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#8C8A83] mb-2.5">
          {post.isPinned && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
              <Pin className="h-3 w-3" /> Pinned Blueprint
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveCommunity(post.communitySlug);
            }}
            className="flex items-center gap-1.5 font-bold text-[#1C1B18] hover:text-emerald-700 transition-colors"
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
                className="h-4 w-4 rounded-full object-cover ring-1 ring-[#E8E5DD]"
              />
            )}
            <span className="font-medium text-[#1C1B18]">{post.author.name || `u/${post.author.username}`}</span>
          </div>

          <span>•</span>
          <span suppressHydrationWarning>{formatTimeAgo(post.createdAt)}</span>
        </div>

        {/* Post Title */}
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#1C1B18] leading-snug group-hover:text-emerald-700 transition-colors mb-2.5">
          {post.title}
        </h2>

        {/* Photo / Image Content */}
        {post.images && post.images.length > 0 && (
          <div className="my-3 overflow-hidden rounded-xl border border-[#E8E5DD] bg-[#F8F7F4]">
            {post.images.length === 1 ? (
              <div className="relative max-h-[480px] overflow-hidden flex items-center justify-center bg-[#F8F7F4]">
                <img
                  src={post.images[0]}
                  alt=""
                  className="w-full max-h-[480px] object-cover group-hover:scale-[1.01] transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 p-1.5">
                {post.images.slice(0, 4).map((img, idx) => (
                  <div key={idx} className="relative aspect-video overflow-hidden rounded-lg bg-[#F1EFE9]">
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
          <p className="text-xs sm:text-sm text-[#4A4843] leading-relaxed line-clamp-3 mb-3.5 whitespace-pre-line font-normal">
            {post.content}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {post.tags.map((t, idx) => (
              <span
                key={idx}
                className="rounded-lg bg-[#F1EFE9] border border-[#E8E5DD] px-2.5 py-0.5 text-[11px] font-medium text-[#4A4843]"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center gap-5 pt-3 border-t border-[#F1EFE9] text-xs text-[#8C8A83]">
          <button
            onClick={() => onSelectPost(post)}
            className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="font-medium">{post.commentsCount} Comments</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <span className="text-emerald-700 font-semibold">Copied link!</span>
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
            className={`flex items-center gap-1.5 hover:text-emerald-700 transition-colors cursor-pointer ${
              saved ? "text-emerald-700" : ""
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
              className="ml-auto text-rose-500 hover:text-rose-700 text-xs cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
