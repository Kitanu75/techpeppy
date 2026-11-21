"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp, MessageSquare, Share2, Bookmark, Trash2, Check, UserPlus } from "lucide-react";
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
  isAuthorSubscribed?: boolean;
  onSubscribeAuthor?: (authorId: string, authorName: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onSelectPost,
  onVote,
  setActiveCommunity,
  currentUser,
  onDeletePost,
  isAuthorSubscribed = false,
  onSubscribeAuthor,
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

  const formatTimeAgo = (dateStr: string) => {
    if (!nowMs) return "";
    const diffSeconds = Math.max(0, Math.floor((nowMs - new Date(dateStr).getTime()) / 1000));
    if (diffSeconds < 60) return "now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 14) return `${diffDays}d`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVote: 1 | 0 = userVote === 1 ? 0 : 1;
    const delta = nextVote - userVote;
    setUserVote(nextVote);
    setScore((prev) => prev + delta);
    onVote(post.id, nextVote);
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

  const authorId = post.author?.id || post.author?.username || "usr_sandeep_author";
  const authorName = post.author.name || post.author.username;
  const isOwn = Boolean(
    currentUser && (currentUser.id === authorId || currentUser.username === post.author?.username)
  );
  const canDelete =
    currentUser && (currentUser.role === "admin" || currentUser.id === post.author?.id);
  const coverImage = post.images && post.images.length > 0 ? post.images[0] : null;

  return (
    <article
      tabIndex={0}
      onClick={() => onSelectPost(post)}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelectPost(post);
        }
      }}
      className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#E4E4E7] bg-white hover:border-[#A1A1AA] hover:shadow-md active:scale-[0.995] transition-all duration-200 cursor-pointer"
    >
      <div>
        {/* Edge-to-Edge Cover Photo */}
        {coverImage && (
          <div className="aspect-[16/10] w-full overflow-hidden bg-[#F4F4F5] border-b border-[#E4E4E7]">
            <img
              src={coverImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
        )}

        <div className="p-4 sm:p-5">
          {/* Topic Badge (Non-AI Section Icon + Name) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveCommunity(post.communitySlug);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] hover:text-[#115E59] cursor-pointer"
          >
            <CommunityIcon slug={post.communitySlug} className="h-3.5 w-3.5" />
            <span>{post.communityName || post.communitySlug}</span>
          </button>

          {/* Bold Modern Display Title */}
          <h3 className="mt-2 font-display text-[18px] sm:text-[19px] font-bold tracking-[-0.02em] leading-[1.28] text-[#111315] group-hover:text-[#0F766E] transition-colors">
            {post.title}
          </h3>

          {/* Restrained Post Excerpt (Only 2 lines on photo cards, 3 lines on text-only posts) */}
          {post.content && (
            <p
              className={`mt-2 text-[13.5px] text-[#52525B] leading-[1.55] whitespace-pre-line ${
                coverImage ? "line-clamp-2" : "line-clamp-3"
              }`}
            >
              {post.content}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Author + Subscribe + Compact Icon Metrics */}
      <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-[#F4F4F5] space-y-3">
        {/* Instagram-style Author Row + Subscribe */}
        <div
          className="flex items-center justify-between gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 min-w-0 text-xs">
            {post.author.avatar && (
              <img
                src={post.author.avatar}
                alt={authorName}
                className="h-6 w-6 rounded-full object-cover border border-[#E4E4E7] shrink-0"
              />
            )}
            <span className="font-medium text-[#111315] truncate">{authorName}</span>
            {formatTimeAgo(post.createdAt) && (
              <span suppressHydrationWarning className="text-[#71717A] tabular-nums shrink-0">
                · {formatTimeAgo(post.createdAt)}
              </span>
            )}
          </div>

          {onSubscribeAuthor && !isOwn && (
            <button
              type="button"
              onClick={() => onSubscribeAuthor(authorId, authorName)}
              aria-pressed={isAuthorSubscribed}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                isAuthorSubscribed
                  ? "border border-[#0F766E]/25 bg-[#F0FDFA] text-[#0F766E]"
                  : "bg-[#111315] text-white hover:bg-[#0F766E]"
              }`}
            >
              {isAuthorSubscribed ? (
                <>
                  <Check className="h-3 w-3 stroke-[2.5]" />
                  <span>Subscribed</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-3 w-3" />
                  <span>Subscribe</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Minimal Icon Footer */}
        <div
          className="flex items-center gap-4 text-xs text-[#71717A]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleUpvote}
            aria-label="Upvote"
            aria-pressed={userVote === 1}
            className={`inline-flex items-center gap-1 tabular-nums transition-colors cursor-pointer ${
              userVote === 1 ? "text-[#0F766E] font-semibold" : "hover:text-[#111315]"
            }`}
          >
            <ArrowUp className="h-3.5 w-3.5" />
            <span>{score}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectPost(post)}
            aria-label="Comments"
            className="inline-flex items-center gap-1 hover:text-[#111315] tabular-nums transition-colors cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{post.commentsCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setSaved(!saved)}
            aria-label={saved ? "Saved" : "Save"}
            aria-pressed={saved}
            className={`transition-colors cursor-pointer ${
              saved ? "text-[#0F766E]" : "hover:text-[#111315]"
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-[#0F766E]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Copy link"
            title="Copy link"
            className="hover:text-[#111315] transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-[#0F766E]" />
            ) : (
              <Share2 className="h-3.5 w-3.5" />
            )}
          </button>

          {canDelete && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Delete this post?")) {
                  onDeletePost?.(post.id);
                }
              }}
              aria-label="Delete"
              title="Delete"
              className="ml-auto text-[#A1A1AA] hover:text-[#DC2626] transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
