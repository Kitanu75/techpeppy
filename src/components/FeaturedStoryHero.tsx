"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp, MessageSquare, Bookmark, Share2, Check, UserPlus, Trash2 } from "lucide-react";
import { PostType } from "@/lib/models/types";
import { SessionUser } from "@/lib/auth";
import { CommunityIcon } from "./CommunityIcon";

interface FeaturedStoryHeroProps {
  leadPost: PostType;
  onSelectPost: (post: PostType) => void;
  onVote: (postId: string, value: 1 | -1 | 0) => void;
  setActiveCommunity: (slug: string) => void;
  currentUser?: SessionUser | null;
  onDeletePost?: (postId: string) => void;
  subscribedAuthors: string[];
  onSubscribeAuthor?: (authorId: string, authorName: string) => void;
}

function getAuthorKey(post: PostType): string {
  return post.author?.id || post.author?.username || "usr_sandeep_author";
}

export const FeaturedStoryHero: React.FC<FeaturedStoryHeroProps> = ({
  leadPost,
  onSelectPost,
  onVote,
  setActiveCommunity,
  currentUser,
  onDeletePost,
  subscribedAuthors,
  onSubscribeAuthor,
}) => {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userVote, setUserVote] = useState<number>(leadPost.userVote || 0);
  const [score, setScore] = useState<number>(leadPost.score);
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

  const handleLeadUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVote: 1 | 0 = userVote === 1 ? 0 : 1;
    const delta = nextVote - userVote;
    setUserVote(nextVote);
    setScore((prev) => prev + delta);
    onVote(leadPost.id, nextVote);
  };

  const handleLeadShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url =
      typeof window !== "undefined" ? `${window.location.origin}?post=${leadPost.id}` : "";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const leadCover = leadPost.images && leadPost.images.length > 0 ? leadPost.images[0] : null;
  const leadAuthorId = getAuthorKey(leadPost);
  const leadAuthorName = leadPost.author.name || leadPost.author.username;
  const isLeadAuthorSubscribed = subscribedAuthors.includes(leadAuthorId);
  const isOwnLeadPost = Boolean(
    currentUser && (currentUser.id === leadAuthorId || currentUser.username === leadPost.author?.username)
  );
  const canDeleteLead =
    currentUser && (currentUser.role === "admin" || currentUser.id === leadPost.author?.id);

  return (
    <section className="w-full bg-[#111315] text-[#FAFAFA]">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-8 sm:py-11">
        <article
          onClick={() => onSelectPost(leadPost)}
          className="group grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-center cursor-pointer"
        >
          {/* Left Column: Bold Media Display Headline + Author Subscribe */}
          <div className={`${leadCover ? "lg:col-span-6" : "lg:col-span-9"} space-y-4`}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveCommunity(leadPost.communitySlug);
              }}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#0F766E] hover:bg-[#115E59] px-2.5 py-1 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <CommunityIcon slug={leadPost.communitySlug} className="h-3.5 w-3.5" />
              <span>{leadPost.communityName || leadPost.communitySlug}</span>
            </button>

            <h1 className="font-display text-2xl sm:text-4xl lg:text-[40px] font-bold tracking-[-0.03em] leading-[1.12] text-white group-hover:text-[#E4E4E7] transition-colors">
              {leadPost.title}
            </h1>

            {leadPost.content && (
              <p className="text-[15px] text-[#A1A1AA] leading-[1.6] line-clamp-2 max-w-xl">
                {leadPost.content}
              </p>
            )}

            {/* Instagram-style Author + Subscribe Row */}
            <div
              className="pt-1 flex flex-wrap items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {leadPost.author.avatar && (
                  <img
                    src={leadPost.author.avatar}
                    alt={leadAuthorName}
                    className="h-7 w-7 rounded-full object-cover border border-[#272A30] shrink-0"
                  />
                )}
                <div className="flex items-center gap-1.5 text-[13px] min-w-0">
                  <span className="font-medium text-[#FAFAFA] truncate">{leadAuthorName}</span>
                  {formatTimeAgo(leadPost.createdAt) && (
                    <>
                      <span className="text-[#52525B]" aria-hidden>
                        ·
                      </span>
                      <span suppressHydrationWarning className="text-[#A1A1AA] tabular-nums shrink-0">
                        {formatTimeAgo(leadPost.createdAt)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {onSubscribeAuthor && !isOwnLeadPost && (
                <button
                  type="button"
                  onClick={() => onSubscribeAuthor(leadAuthorId, leadAuthorName)}
                  aria-pressed={isLeadAuthorSubscribed}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                    isLeadAuthorSubscribed
                      ? "border border-[#272A30] bg-[#191C20] text-[#2DD4BF]"
                      : "bg-white text-[#111315] hover:bg-[#E4E4E7]"
                  }`}
                >
                  {isLeadAuthorSubscribed ? (
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

            {/* Minimal Icon Action Bar */}
            <div
              className="pt-4 border-t border-[#272A30] flex items-center gap-5 text-[13px] text-[#A1A1AA]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleLeadUpvote}
                aria-label="Upvote"
                aria-pressed={userVote === 1}
                className={`inline-flex items-center gap-1.5 tabular-nums transition-colors cursor-pointer ${
                  userVote === 1 ? "text-[#2DD4BF] font-semibold" : "hover:text-white"
                }`}
              >
                <ArrowUp className="h-4 w-4" />
                <span>{score}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectPost(leadPost)}
                aria-label="Comments"
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors tabular-nums cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{leadPost.commentsCount}</span>
              </button>

              <button
                type="button"
                onClick={() => setSaved(!saved)}
                aria-label={saved ? "Saved" : "Save"}
                aria-pressed={saved}
                className={`transition-colors cursor-pointer ${
                  saved ? "text-[#2DD4BF]" : "hover:text-white"
                }`}
              >
                <Bookmark className={`h-4 w-4 ${saved ? "fill-[#2DD4BF]" : ""}`} />
              </button>

              <button
                type="button"
                onClick={handleLeadShare}
                aria-label="Copy link"
                title="Copy link"
                className="hover:text-white transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-[#2DD4BF]" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
              </button>

              {canDeleteLead && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Delete this post?")) {
                      onDeletePost?.(leadPost.id);
                    }
                  }}
                  title="Delete"
                  aria-label="Delete"
                  className="ml-auto text-[#71717A] hover:text-[#F87171] transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Bold Edge-to-Edge Cover Photo */}
          {leadCover && (
            <div className="lg:col-span-6 overflow-hidden rounded-xl border border-[#272A30] bg-[#191C20]">
              <div className="aspect-[16/10] w-full overflow-hidden">
                <img
                  src={leadCover}
                  alt={leadPost.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
};
