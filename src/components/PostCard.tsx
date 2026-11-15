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
  Check,
  Plus,
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
  isSubscribed?: boolean;
  onSubscribeChannel?: (channelSlug: string, authorId?: string, authorName?: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onSelectPost,
  onVote,
  setActiveCommunity,
  currentUser,
  onDeletePost,
  isSubscribed = false,
  onSubscribeChannel,
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
      className="group relative rounded-lg border border-[#E2E0D8] bg-white p-5 sm:p-6 hover:border-[#CFCBC0] hover:shadow-card-hover transition-all cursor-pointer overflow-hidden mb-3.5"
    >
      {/* Top Header: Metadata + Subscribe on Left, Upvote Badge on Right */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#686763]">
          {post.isPinned && (
            <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#10B981]/30">
              <Pin className="h-3 w-3" /> Pinned
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveCommunity(post.communitySlug);
            }}
            className="flex items-center gap-1.5 font-mono font-semibold text-[#141413] hover:text-[#10B981] transition-colors cursor-pointer"
          >
            <CommunityIcon slug={post.communitySlug} className="h-3.5 w-3.5" />
            <span>t/{post.communitySlug}</span>
          </button>

          <span className="text-[#8A8A95]">•</span>

          <div className="flex items-center gap-1.5">
            {post.author.avatar && (
              <img
                src={post.author.avatar}
                alt=""
                className="h-4 w-4 rounded-full object-cover ring-1 ring-[#E2E0D8]"
              />
            )}
            <span className="font-medium text-[#141413]">
              {post.author.name || `u/${post.author.username}`}
            </span>
          </div>

          {onSubscribeChannel && (
            <>
              <span className="text-[#8A8A95]">•</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSubscribeChannel(
                    post.communitySlug,
                    post.author?.id,
                    post.author?.name || post.author?.username
                  );
                }}
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                  isSubscribed
                    ? "border-[#10B981]/40 bg-[#ECFDF5] text-[#059669]"
                    : "border-[#E2E0D8] bg-[#F6F5F0] text-[#141413] hover:border-[#141413] hover:bg-[#141413] hover:text-white"
                }`}
              >
                {isSubscribed ? (
                  <>
                    <Check className="h-3 w-3 stroke-[2.5]" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3 stroke-[2.5]" />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            </>
          )}

          <span className="text-[#8A8A95]">•</span>
          <span suppressHydrationWarning className="font-mono text-[11px] text-[#8A8A95] tabular-nums">
            {formatTimeAgo(post.createdAt)}
          </span>
        </div>

        {/* Tactile Upvote Pill */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center rounded-md border border-[#E2E0D8] bg-[#F6F5F0] p-0.5 shrink-0"
        >
          <button
            onClick={(e) => handleVote(e, 1)}
            title="Upvote"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              userVote === 1
                ? "bg-[#10B981] text-white shadow-2xs"
                : "text-[#141413] hover:bg-[#EFECE6]"
            }`}
          >
            <ArrowBigUp className={`h-4 w-4 ${userVote === 1 ? "fill-white" : ""}`} />
            <span className="font-mono tabular-nums">{score}</span>
          </button>

          <button
            onClick={(e) => handleVote(e, -1)}
            title="Downvote"
            className={`p-1 rounded transition-colors cursor-pointer ${
              userVote === -1
                ? "text-[#DC2626] bg-red-50"
                : "text-[#8A8A95] hover:text-[#DC2626] hover:bg-[#EFECE6]"
            }`}
          >
            <ArrowBigDown className={`h-4 w-4 ${userVote === -1 ? "fill-[#DC2626]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Post Title */}
      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#141413] leading-snug group-hover:text-[#059669] transition-colors mb-2.5">
        {post.title}
      </h2>

      {/* Photo / Image Content */}
      {post.images && post.images.length > 0 && (
        <div className="my-3.5 overflow-hidden rounded-md border border-[#E2E0D8] bg-[#F6F5F0]">
          {post.images.length === 1 ? (
            <div className="relative max-h-[480px] overflow-hidden flex items-center justify-center bg-[#F6F5F0]">
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
                <div key={idx} className="relative aspect-video overflow-hidden rounded bg-[#EFECE6]">
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
        <p className="text-xs sm:text-sm text-[#686763] leading-relaxed line-clamp-3 mb-3.5 whitespace-pre-line font-normal">
          {post.content}
        </p>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {post.tags.map((t, idx) => (
            <span
              key={idx}
              className="rounded border border-[#E2E0D8] bg-[#F6F5F0] px-2 py-0.5 text-[11px] font-mono font-medium text-[#686763]"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center gap-5 pt-3 border-t border-[#E2E0D8] text-xs text-[#686763]">
        <button
          onClick={() => onSelectPost(post)}
          className="flex items-center gap-1.5 hover:text-[#141413] transition-colors cursor-pointer"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="font-medium tabular-nums">{post.commentsCount} Comments</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 hover:text-[#141413] transition-colors cursor-pointer"
        >
          {copied ? (
            <span className="text-[#059669] font-semibold">Copied!</span>
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
          className={`flex items-center gap-1.5 hover:text-[#141413] transition-colors cursor-pointer ${
            saved ? "text-[#059669] font-semibold" : ""
          }`}
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-[#059669]" : ""}`} />
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
            className="ml-auto text-[#DC2626] hover:text-red-800 text-xs cursor-pointer p-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </article>
  );
};
