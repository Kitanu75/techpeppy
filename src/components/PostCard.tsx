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
      className="group relative flex rounded-2xl border border-[#262626] bg-[#121212] hover:border-[#383838] transition-colors cursor-pointer overflow-hidden mb-3"
    >
      {/* Left Minimal Voting Pillar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-10 sm:w-11 shrink-0 flex-col items-center justify-start bg-[#0a0a0a] py-3 border-r border-[#262626]"
      >
        <button
          onClick={(e) => handleVote(e, 1)}
          title="Upvote"
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors cursor-pointer ${
            userVote === 1
              ? "text-white bg-neutral-800"
              : "text-[#71767b] hover:text-white hover:bg-neutral-900"
          }`}
        >
          <ArrowBigUp className={`h-5 w-5 ${userVote === 1 ? "fill-white" : ""}`} />
        </button>

        <span
          className={`my-1 text-xs font-bold font-mono tracking-tight ${
            userVote === 1 ? "text-white" : userVote === -1 ? "text-blue-400" : "text-[#71767b]"
          }`}
        >
          {score}
        </span>

        <button
          onClick={(e) => handleVote(e, -1)}
          title="Downvote"
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors cursor-pointer ${
            userVote === -1
              ? "text-blue-400 bg-neutral-800"
              : "text-[#71767b] hover:text-blue-400 hover:bg-neutral-900"
          }`}
        >
          <ArrowBigDown className={`h-5 w-5 ${userVote === -1 ? "fill-blue-400" : ""}`} />
        </button>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 p-3.5 sm:p-4 min-w-0">
        {/* Post Metadata Header */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#71767b] mb-2">
          {post.isPinned && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-white">
              <Pin className="h-3 w-3" /> Pinned
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveCommunity(post.communitySlug);
            }}
            className="font-bold text-white hover:underline transition-colors"
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

        {/* Post Title */}
        <h2 className="text-base font-bold text-white leading-snug group-hover:underline transition-colors mb-2">
          {post.title}
        </h2>

        {/* Photo / Image Content */}
        {post.images && post.images.length > 0 && (
          <div className="my-2.5 overflow-hidden rounded-xl border border-[#262626] bg-black">
            {post.images.length === 1 ? (
              <div className="relative max-h-[460px] overflow-hidden flex items-center justify-center bg-black">
                <img
                  src={post.images[0]}
                  alt=""
                  className="w-full max-h-[450px] object-contain"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1 p-1">
                {post.images.slice(0, 4).map((img, idx) => (
                  <div key={idx} className="relative aspect-video overflow-hidden rounded-lg bg-black">
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
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed line-clamp-3 mb-3 whitespace-pre-line">
            {post.content}
          </p>
        )}

        {/* Footer Actions */}
        <div className="flex items-center gap-4 pt-2 border-t border-[#262626] text-xs text-[#71767b]">
          <button
            onClick={() => onSelectPost(post)}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.commentsCount} Comments</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? (
              <span className="text-white font-semibold">Copied!</span>
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
            className={`flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer ${
              saved ? "text-white" : ""
            }`}
          >
            <Bookmark className={`h-4 w-4 ${saved ? "fill-white" : ""}`} />
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
              className="ml-auto text-red-400 hover:text-red-300 text-xs cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
