"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SidebarLeft } from "@/components/SidebarLeft";
import { SidebarRight } from "@/components/SidebarRight";
import { FeedTabs } from "@/components/FeedTabs";
import { PostCard } from "@/components/PostCard";
import { CreatePostModal } from "@/components/CreatePostModal";
import { PostDetailModal } from "@/components/PostDetailModal";
import { AuthModal } from "@/components/AuthModal";
import { AboutModal } from "@/components/AboutModal";
import { ContactModal } from "@/components/ContactModal";
import { CommunityIcon } from "@/components/CommunityIcon";
import { CommunityType, PostType } from "@/lib/models/types";
import { SessionUser } from "@/lib/auth";

export default function Home() {
  const [communities, setCommunities] = useState<CommunityType[]>([]);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  // User Auth State
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<"login" | "register">("login");

  // Filters & Search
  const [activeCommunity, setActiveCommunity] = useState<string>("all");
  const [sort, setSort] = useState<string>("hot");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Subscriptions & Toast State
  const [subscribedChannels, setSubscribedChannels] = useState<string[]>([]);
  const [subscriberCount, setSubscriberCount] = useState<number>(0);
  const [toast, setToast] = useState<{ title: string; subtitle?: string } | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaultType, setCreateDefaultType] = useState<"text" | "image">("text");
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const getOrCreateClientId = useCallback((): string => {
    if (typeof window === "undefined") return "";
    try {
      let storedId = window.localStorage.getItem("techpeppy_client_id") || "";
      if (!storedId) {
        storedId =
          typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? `reader_${crypto.randomUUID()}`
            : `reader_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        window.localStorage.setItem("techpeppy_client_id", storedId);
      }
      return storedId;
    } catch {
      return `reader_${Date.now()}`;
    }
  }, []);

  const showToast = useCallback((title: string, subtitle?: string) => {
    setToast({ title, subtitle });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Check Current Logged-in User Session on Mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    }
    void checkAuth();
  }, []);

  // Fetch initial subscriptions
  useEffect(() => {
    async function loadSubscriptions() {
      try {
        const cid = getOrCreateClientId();
        const query = cid ? `?clientId=${encodeURIComponent(cid)}` : "";
        const res = await fetch(`/api/subscribe${query}`, { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.subscribedChannels)) {
            setSubscribedChannels(data.subscribedChannels);
          }
          if (typeof data.totalSubscribers === "number") {
            setSubscriberCount(data.totalSubscribers);
          }
        }
      } catch (err) {
        console.error("Failed to fetch subscriptions:", err);
      }
    }
    void loadSubscriptions();
  }, [getOrCreateClientId, user?.id]);

  // Fetch Communities
  useEffect(() => {
    async function loadCommunities() {
      try {
        const res = await fetch("/api/communities");
        const data = await res.json();
        if (data.success) {
          setCommunities(data.communities);
        }
      } catch (err) {
        console.error("Failed to fetch communities:", err);
      }
    }
    void loadCommunities();
  }, []);

  // Fetch Posts based on community, sort & search
  useEffect(() => {
    let active = true;
    async function loadPosts() {
      try {
        const params = new URLSearchParams();
        if (activeCommunity !== "all") params.append("community", activeCommunity);
        if (sort) params.append("sort", sort);
        if (searchQuery.trim()) params.append("q", searchQuery.trim());

        const res = await fetch(`/api/posts?${params.toString()}`);
        const data = await res.json();
        if (active && data.success) {
          setPosts(data.posts);
        }
      } catch (err) {
        console.error("Failed to load posts:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadPosts();
    return () => {
      active = false;
    };
  }, [activeCommunity, sort, searchQuery]);

  const handleSubscribe = async ({
    channelSlug = "publication",
    targetUserId = "usr_sandeep_author",
    targetAuthorName = "Sandeep Kumar",
    email,
  }: {
    channelSlug?: string;
    targetUserId?: string;
    targetAuthorName?: string;
    email?: string;
  }) => {
    const previousChannels = [...subscribedChannels];
    const previousCount = subscriberCount;
    const isCurrentlySubscribed = subscribedChannels.includes(channelSlug);
    const shouldSubscribe = email ? true : !isCurrentlySubscribed;

    // Optimistic state flip
    if (shouldSubscribe) {
      if (!isCurrentlySubscribed) {
        setSubscribedChannels((prev) => [...prev, channelSlug]);
        if (previousChannels.length === 0) {
          setSubscriberCount((c) => c + 1);
        }
      }
      const targetLabel =
        channelSlug === "publication" ? "TechPeppy Publication" : `t/${channelSlug}`;
      showToast(
        `Subscribed to ${targetLabel}`,
        `Real-time alert sent to ${targetAuthorName}`
      );
    } else {
      setSubscribedChannels((prev) => prev.filter((ch) => ch !== channelSlug));
      showToast(
        channelSlug === "publication"
          ? "Unsubscribed from TechPeppy"
          : `Unsubscribed from t/${channelSlug}`
      );
    }

    try {
      const cid = getOrCreateClientId();
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelSlug,
          targetUserId,
          subscriberEmail: email,
          clientId: cid,
          action: email ? "subscribe" : "toggle",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Subscription failed");
      }

      if (typeof data.totalSubscribers === "number") {
        setSubscriberCount(data.totalSubscribers);
      }

      if (data.subscribed && data.notification) {
        window.dispatchEvent(
          new CustomEvent("techpeppy:notification-created", {
            detail: data.notification,
          })
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Please try again";
      // Revert optimistic update on failure
      setSubscribedChannels(previousChannels);
      setSubscriberCount(previousCount);
      showToast("Subscription error", message);
    }
  };

  const handleVote = async (postId: string, value: 1 | -1 | 0) => {
    if (!user) {
      setAuthDefaultMode("login");
      setIsAuthOpen(true);
      return;
    }

    try {
      await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, userId: user.id }),
      });
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const handlePostCreated = (newPost: PostType) => {
    setPosts([newPost, ...posts]);
    setSelectedPost(newPost);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        if (selectedPost?.id === postId) {
          setSelectedPost(null);
        }
      } else {
        alert(data.error || "Failed to delete post");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const currentCommunityObj = communities.find((c) => c.slug === activeCommunity);

  return (
    <div className="min-h-screen bg-[#F6F5F0] text-[#141413]">
      {/* Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openCreateModal={() => {
          if (!user) {
            setAuthDefaultMode("login");
            setIsAuthOpen(true);
          } else {
            setCreateDefaultType("text");
            setIsCreateOpen(true);
          }
        }}
        activeCommunity={activeCommunity}
        setActiveCommunity={setActiveCommunity}
        user={user}
        openAuthModal={(mode) => {
          setAuthDefaultMode(mode);
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        openAboutModal={() => setIsAboutOpen(true)}
        openContactModal={() => setIsContactOpen(true)}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-[1360px] px-4 sm:px-8 py-6">
        <div className="flex items-start justify-center gap-2">
          {/* Left Sidebar */}
          <SidebarLeft
            communities={communities}
            activeCommunity={activeCommunity}
            setActiveCommunity={setActiveCommunity}
            openCreateModal={() => {
              if (!user) {
                setAuthDefaultMode("login");
                setIsAuthOpen(true);
              } else {
                setCreateDefaultType("text");
                setIsCreateOpen(true);
              }
            }}
          />

          {/* Central Main Feed (Preserved Structure & Data Flow) */}
          <section className="flex-1 max-w-[760px] min-w-0">
            {/* Publication Showcase Hero (When viewing All Feeds) */}
            {activeCommunity === "all" && !searchQuery && (
              <div className="mb-4 rounded-lg border border-[#E2E0D8] bg-white p-5 sm:p-6 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium bg-[#ECFDF5] text-[#059669] border border-[#10B981]/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    Engineering Publication & Architecture Hub
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#141413] mb-1.5">
                  Decoupled Systems, Production AI & Workstations
                </h1>
                <p className="text-xs sm:text-sm text-[#686763] leading-relaxed max-w-2xl">
                  High-signal technical rationale, microservice blueprints, local LLM orchestration, and ergonomic workspace gear curated by Sandeep Kumar.
                </p>
              </div>
            )}

            {/* Active Channel Header (if filtered) */}
            {activeCommunity !== "all" && currentCommunityObj && (
              <div className="mb-4 rounded-lg border border-[#E2E0D8] bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <CommunityIcon
                      slug={currentCommunityObj.slug}
                      variant="badge"
                      className="h-6 w-6"
                    />
                    <div>
                      <h1 className="text-lg font-bold text-[#141413]">
                        {currentCommunityObj.name}
                      </h1>
                      <p className="text-xs text-[#686763] mt-0.5 font-mono">
                        t/{currentCommunityObj.slug} • {currentCommunityObj.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!user) {
                        setAuthDefaultMode("login");
                        setIsAuthOpen(true);
                      } else {
                        setCreateDefaultType("text");
                        setIsCreateOpen(true);
                      }
                    }}
                    className="rounded-md bg-[#141413] hover:bg-[#27272A] px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
                  >
                    Post Here
                  </button>
                </div>
              </div>
            )}

            {/* Quick Post & Filter Bar */}
            <FeedTabs
              sort={sort}
              setSort={setSort}
              openCreateModal={(type) => {
                if (!user) {
                  setAuthDefaultMode("login");
                  setIsAuthOpen(true);
                } else {
                  setCreateDefaultType(type || "text");
                  setIsCreateOpen(true);
                }
              }}
              activeCommunity={activeCommunity}
              communityName={currentCommunityObj?.name}
              userAvatar={user?.avatar}
              userName={user?.name}
            />

            {/* Posts Feed */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-32 rounded-lg border border-[#E2E0D8] bg-white skeleton-pulse"
                  />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-lg border border-[#E2E0D8] bg-white p-8 text-center">
                <p className="text-sm font-semibold text-[#141413] mb-1">
                  No posts yet in this feed
                </p>
                <p className="text-xs text-[#686763] mb-4">
                  {searchQuery
                    ? `No matching results for "${searchQuery}".`
                    : "Be the first to share an architectural tip, discussion, or setup!"}
                </p>
                <button
                  onClick={() => {
                    if (!user) {
                      setAuthDefaultMode("login");
                      setIsAuthOpen(true);
                    } else {
                      setIsCreateOpen(true);
                    }
                  }}
                  className="rounded-md bg-[#141413] hover:bg-[#27272A] px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Create Post
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onSelectPost={(p) => setSelectedPost(p)}
                    onVote={handleVote}
                    setActiveCommunity={setActiveCommunity}
                    currentUser={user}
                    onDeletePost={handleDeletePost}
                    isSubscribed={subscribedChannels.includes(post.communitySlug)}
                    onSubscribeChannel={(channelSlug, authorId, authorName) =>
                      handleSubscribe({
                        channelSlug,
                        targetUserId: authorId || "usr_sandeep_author",
                        targetAuthorName: authorName || "Sandeep Kumar",
                      })
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {/* Right Sidebar */}
          <SidebarRight
            openAboutModal={() => setIsAboutOpen(true)}
            openContactModal={() => setIsContactOpen(true)}
            setActiveCommunity={setActiveCommunity}
            isPublicationSubscribed={subscribedChannels.includes("publication")}
            subscriberCount={subscriberCount}
            onSubscribePublication={(email) =>
              handleSubscribe({
                channelSlug: "publication",
                targetUserId: "usr_sandeep_author",
                targetAuthorName: "Sandeep Kumar",
                email,
              })
            }
            currentUser={user}
          />
        </div>
      </main>

      {/* Subtle Toast Confirmation */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-start gap-3 rounded-md border border-[#E2E0D8] bg-[#141413] px-4 py-3 text-white shadow-xl max-w-sm"
        >
          <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold leading-snug">{toast.title}</p>
            {toast.subtitle && (
              <p className="mt-0.5 font-mono text-[11px] text-[#A1A1AA] leading-snug">
                {toast.subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-[#8A8A95] hover:text-white cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(newUser) => setUser(newUser)}
        defaultMode={authDefaultMode}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        communities={communities}
        defaultType={createDefaultType}
        onPostCreated={handlePostCreated}
      />

      {/* Post Detail Modal */}
      <PostDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onVote={handleVote}
        setActiveCommunity={setActiveCommunity}
        currentUser={user}
        onRequireAuth={() => {
          setAuthDefaultMode("login");
          setIsAuthOpen(true);
        }}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        openContactModal={() => setIsContactOpen(true)}
      />

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}
