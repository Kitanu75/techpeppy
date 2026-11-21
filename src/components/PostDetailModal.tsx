"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowUp, Share2, Bookmark, Check, UserPlus } from "lucide-react";
import { PostType } from "@/lib/models/types";
import { CommentTree } from "./CommentTree";
import { SessionUser } from "@/lib/auth";
import { CommunityIcon } from "./CommunityIcon";

interface PostDetailModalProps {
  post: PostType | null;
  onClose: () => void;
  onVote: (postId: string, value: 1 | -1 | 0) => void;
  setActiveCommunity: (slug: string) => void;
  currentUser?: SessionUser | null;
  onRequireAuth?: () => void;
  isAuthorSubscribed?: boolean;
  onSubscribeAuthor?: (authorId: string, authorName: string) => void;
}

const PostDetailContent: React.FC<Omit<PostDetailModalProps, "post"> & { post: PostType }> = ({
  post,
  onClose,
  onVote,
  setActiveCommunity,
  currentUser,
  onRequireAuth,
  isAuthorSubscribed = false,
  onSubscribeAuthor,
}) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [userVote, setUserVote] = useState<number>(post.userVote || 0);
  const [score, setScore] = useState<number>(post.score);
  const [activePhoto, setActivePhoto] = useState<string | null>(
    post.images && post.images.length > 0 ? post.images[0] : null
  );
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setFormattedDate(
        new Date(post.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [post.createdAt]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleUpvote = () => {
    const nextVote: 1 | 0 = userVote === 1 ? 0 : 1;
    const delta = nextVote - userVote;
    setUserVote(nextVote);
    setScore((prev) => prev + delta);
    onVote(post.id, nextVote);
  };

  const handleShare = () => {
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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111315]/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl rounded-xl border border-[#272A30] bg-white shadow-2xl my-6 flex flex-col max-h-[92vh] text-[#111315] overflow-hidden"
      >
        {/* Top Dark Contrast Author + Subscribe Bar */}
        <div className="flex items-center justify-between border-b border-[#272A30] bg-[#111315] text-white px-5 sm:px-8 py-3.5 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {post.author.avatar && (
              <img
                src={post.author.avatar}
                alt={authorName}
                className="h-8 w-8 rounded-full object-cover border border-[#272A30] shrink-0"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white truncate">{authorName}</span>
                {onSubscribeAuthor && !isOwn && (
                  <button
                    type="button"
                    onClick={() => onSubscribeAuthor(authorId, authorName)}
                    aria-pressed={isAuthorSubscribed}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                      isAuthorSubscribed
                        ? "border border-[#272A30] bg-[#191C20] text-[#2DD4BF]"
                        : "bg-white text-[#111315] hover:bg-[#E4E4E7]"
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
              <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCommunity(post.communitySlug);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1 font-medium text-[#2DD4BF] hover:underline cursor-pointer"
                >
                  <CommunityIcon slug={post.communitySlug} className="h-3 w-3" />
                  <span>{post.communityName || post.communitySlug}</span>
                </button>
                {formattedDate && (
                  <>
                    <span aria-hidden>·</span>
                    <span suppressHydrationWarning>{formattedDate}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-[#A1A1AA] hover:bg-[#191C20] hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Razor-thin reading progress indicator */}
        <div className="h-[2px] w-full bg-[#272A30] shrink-0" aria-hidden>
          <div
            className="h-full bg-[#2DD4BF] transition-[width] duration-150 ease-out"
            style={{ width: `${readProgress}%` }}
          />
        </div>

        {/* Scrollable Post Reading Canvas */}
        <div
          onScroll={(e) => {
            const el = e.currentTarget;
            const maxScroll = el.scrollHeight - el.clientHeight;
            setReadProgress(maxScroll > 0 ? Math.min(100, Math.round((el.scrollTop / maxScroll) * 100)) : 0);
          }}
          className="flex-1 overflow-y-auto px-5 sm:px-8 py-7 bg-white"
        >
          <h1 className="font-display text-2xl sm:text-[32px] font-bold tracking-[-0.03em] text-[#111315] leading-[1.16]">
            {post.title}
          </h1>

          {post.images && post.images.length > 0 && (
            <div className="my-6 space-y-2.5">
              <div className="overflow-hidden rounded-xl border border-[#E4E4E7] bg-[#F4F4F5] flex items-center justify-center max-h-[480px]">
                <img
                  src={activePhoto || post.images[0]}
                  alt={post.title}
                  className="w-full h-auto max-h-[470px] object-contain"
                />
              </div>

              {post.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {post.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhoto(img)}
                      className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition-all cursor-pointer ${
                        activePhoto === img
                          ? "border-[#0F766E] ring-1 ring-[#0F766E]"
                          : "border-[#E4E4E7] opacity-65 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {post.content && (
            <div className="mt-5 text-[15.5px] text-[#27272A] leading-[1.8] whitespace-pre-line">
              {post.content}
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-[#52525B]">
              {post.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-[#F4F4F5] px-2.5 py-0.5 text-[11px] font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Minimal Icon Action Row */}
          <div className="mt-7 pt-4 border-t border-[#E4E4E7] flex items-center gap-5 text-sm text-[#71717A]">
            <button
              type="button"
              onClick={handleUpvote}
              aria-label="Upvote"
              aria-pressed={userVote === 1}
              className={`inline-flex items-center gap-1.5 tabular-nums transition-colors cursor-pointer ${
                userVote === 1 ? "text-[#0F766E] font-semibold" : "hover:text-[#111315]"
              }`}
            >
              <ArrowUp className="h-4 w-4" />
              <span>{score}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              aria-label="Share"
              title="Copy link"
              className="inline-flex items-center gap-1.5 hover:text-[#111315] transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="h-4 w-4 text-[#0F766E]" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setSaved(!saved)}
              aria-label={saved ? "Saved" : "Save"}
              aria-pressed={saved}
              className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                saved ? "text-[#0F766E]" : "hover:text-[#111315]"
              }`}
            >
              <Bookmark className={`h-4 w-4 ${saved ? "fill-[#0F766E]" : ""}`} />
            </button>
          </div>

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

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, ...rest }) => {
  if (!post) return null;
  return <PostDetailContent key={post.id} post={post} {...rest} />;
};
