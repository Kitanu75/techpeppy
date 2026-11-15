"use client";

import React, { useState, useEffect } from "react";
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
  onSubscribeChannel?: (
    channelSlug: string,
    authorId?: string,
    authorName?: string,
    postId?: string,
    postTitle?: string
  ) => void;
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
  const [nowMs, setNowMs] = useState<number>(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setNowMs(Date.now());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleVote = (e: React.MouseEvent, targetValue: 1 | -1) => {
    e.stopPropagation();
    let newVote: 1 | -1 | 0 = targetValue;
    let scoreDelta = 0;

    if (userVote === targetValue) {
      newVote = 0;
      scoreDelta = -targetValue;
    } else {
      scoreDelta = targetValue - userVote;
    }

    setUserVote(newVote);
    setScore((prev) => prev + scoreDelta);
    onVote(post.id, newVote);
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
    if (!nowMs) return "";
    const diffSeconds = Math.max(0, Math.floor((nowMs - new Date(dateStr).getTime()) / 1000));
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
      className="group relative rounded-lg border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-card hover:border-[#CBD5E1] hover:shadow-card-hover transition-all cursor-pointer overflow-hidden mb-3.5"
    >
      {/* Top Header: Metadata + Subscribe on Left, Upvote Badge on Right */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#475569]">
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
            className="flex items-center gap-1.5 font-mono font-semibold text-[#0F172A] hover:text-[#10B981] transition-colors cursor-pointer"
          >
            <CommunityIcon slug={post.communitySlug} className="h-3.5 w-3.5" />
            <span>t/{post.communitySlug}</span>
          </button>

          <span className="text-[#64748B]">•</span>

          <div className="flex items-center gap-1.5">
            {post.author.avatar && (
              <img
                src={post.author.avatar}
                alt=""
                className="h-4 w-4 rounded-full object-cover ring-1 ring-[#E2E8F0]"
              />
            )}
            <span className="font-medium text-[#0F172A]">
              {post.author.name || `u/${post.author.username}`}
            </span>
          </div>

          {onSubscribeChannel && (
            <>
              <span className="text-[#64748B]">•</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSubscribeChannel(
                    post.communitySlug,
                    post.author?.id,
                    post.author?.name || post.author?.username,
                    post.id,
                    post.title
                  );
                }}
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                  isSubscribed
                    ? "border-[#10B981]/40 bg-[#ECFDF5] text-[#059669]"
                    : "border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] hover:border-[#10B981] hover:bg-[#ECFDF5] hover:text-[#059669]"
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

          <span className="text-[#64748B]">•</span>
          <span suppressHydrationWarning className="font-mono text-[11px] text-[#64748B] tabular-nums">
            {formatTimeAgo(post.createdAt)}
          </span>
        </div>

        {/* Tactile Upvote Pill */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-0.5 shrink-0"
        >
          <button
            onClick={(e) => handleVote(e, 1)}
            title="Upvote"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              userVote === 1
                ? "bg-[#10B981] text-white shadow-2xs"
                : "text-[#0F172A] hover:bg-[#F1F5F9]"
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
                : "text-[#64748B] hover:text-[#DC2626] hover:bg-[#F1F5F9]"
            }`}
          >
            <ArrowBigDown className={`h-4 w-4 ${userVote === -1 ? "fill-[#DC2626]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Post Title */}
      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0F172A] leading-snug group-hover:text-[#059669] transition-colors mb-2.5">
        {post.title}
      </h2>

      {/* Photo / Image Content */}
      {post.images && post.images.length > 0 && (
        <div className="my-3.5 overflow-hidden rounded-md border border-[#E2E8F0] bg-[#F8FAFC]">
          {post.images.length === 1 ? (
            <div className="relative max-h-[480px] overflow-hidden flex items-center justify-center bg-[#F8FAFC]">
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
                <div key={idx} className="relative aspect-video overflow-hidden rounded bg-[#F1F5F9]">
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
        <p className="text-xs sm:text-sm text-[#475569] leading-relaxed line-clamp-3 mb-3.5 whitespace-pre-line font-normal">
          {post.content}
        </p>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {post.tags.map((t, idx) => (
            <span
              key={idx}
              className="rounded border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-mono font-medium text-[#475569]"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center gap-5 pt-3 border-t border-[#E2E8F0] text-xs text-[#475569]">
        <button
          onClick={() => onSelectPost(post)}
          className="flex items-center gap-1.5 hover:text-[#0F172A] transition-colors cursor-pointer"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="font-medium tabular-nums">{post.commentsCount} Comments</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 hover:text-[#0F172A] transition-colors cursor-pointer"
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
          className={`flex items-center gap-1.5 hover:text-[#0F172A] transition-colors cursor-pointer ${
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
