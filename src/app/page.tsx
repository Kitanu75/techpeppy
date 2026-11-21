"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { FeaturedStoryHero } from "@/components/FeaturedStoryHero";
import { FeedTabs } from "@/components/FeedTabs";
import { PostCard } from "@/components/PostCard";
import { DispatchSection } from "@/components/DispatchSection";
import { CommunityIcon } from "@/components/CommunityIcon";
import { CreatePostModal } from "@/components/CreatePostModal";
import { PostDetailModal } from "@/components/PostDetailModal";
import { AuthModal } from "@/components/AuthModal";
import { AboutModal } from "@/components/AboutModal";
import { ContactModal } from "@/components/ContactModal";
import { CommunityType, PostType } from "@/lib/models/types";
import { SessionUser } from "@/lib/auth";

export default function Home() {
  const [communities, setCommunities] = useState<CommunityType[]>([]);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<SessionUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<"login" | "register">("login");

  const [activeCommunity, setActiveCommunity] = useState<string>("all");
  const [sort, setSort] = useState<string>("hot");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [subscribedChannels, setSubscribedChannels] = useState<string[]>([]);
  const [subscribedAuthors, setSubscribedAuthors] = useState<string[]>([]);
  const [toast, setToast] = useState<{ title: string; subtitle?: string } | null>(null);

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
          if (Array.isArray(data.subscribedAuthors)) {
            setSubscribedAuthors(data.subscribedAuthors);
          }
        }
      } catch (err) {
        console.error("Failed to fetch subscriptions:", err);
      }
    }
    void loadSubscriptions();
  }, [getOrCreateClientId, user?.id]);

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

  // Instagram-style Author Subscribe: subscribing to an author notifies you whenever THAT author posts anything new
  const handleSubscribeAuthor = async (authorId: string, authorName: string) => {
    const previousAuthors = [...subscribedAuthors];
    const isCurrentlySubscribed = subscribedAuthors.includes(authorId);
    const shouldSubscribe = !isCurrentlySubscribed;

    if (shouldSubscribe) {
      setSubscribedAuthors((prev) => [...prev, authorId]);
      showToast(
        `Subscribed to ${authorName}`,
        `You'll get notified whenever ${authorName} publishes a new post`
      );
    } else {
      setSubscribedAuthors((prev) => prev.filter((id) => id !== authorId));
      showToast(`Unsubscribed from ${authorName}`);
    }

    try {
      const cid = getOrCreateClientId();
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelSlug: "author",
          targetUserId: authorId,
          clientId: cid,
          action: "toggle",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Subscription failed");
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
      setSubscribedAuthors(previousAuthors);
      showToast("Subscription error", message);
    }
  };

  // Publication email newsletter subscribe
  const handleSubscribePublication = async (email?: string) => {
    const previousChannels = [...subscribedChannels];
    const isCurrentlySubscribed = subscribedChannels.includes("publication");
    const shouldSubscribe = email ? true : !isCurrentlySubscribed;

    if (shouldSubscribe) {
      if (!isCurrentlySubscribed) {
        setSubscribedChannels((prev) => [...prev, "publication"]);
      }
      showToast("Subscribed to TechPeppy");
    } else {
      setSubscribedChannels((prev) => prev.filter((ch) => ch !== "publication"));
      showToast("Unsubscribed from TechPeppy");
    }

    try {
      const cid = getOrCreateClientId();
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelSlug: "publication",
          targetUserId: "usr_sandeep_author",
          subscriberEmail: email,
          clientId: cid,
          action: email ? "subscribe" : "toggle",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Subscription failed");
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
      setSubscribedChannels(previousChannels);
      showToast("Subscription error", message);
    }
  };

  const handleOpenPostById = async (postId: string) => {
    const existing = posts.find((p) => p.id === postId || p.slug === postId);
    if (existing) {
      setSelectedPost(existing);
      return;
    }
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}`);
      const data = await res.json();
      if (data.success && data.post) {
        setSelectedPost(data.post);
      }
    } catch (err) {
      console.error("Failed to open post from notification:", err);
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

  const openWriteFlow = (type: "text" | "image" = "text") => {
    if (!user) {
      setAuthDefaultMode("login");
      setIsAuthOpen(true);
    } else {
      setCreateDefaultType(type);
      setIsCreateOpen(true);
    }
  };

  const currentCommunityObj = communities.find((c) => c.slug === activeCommunity);

  const isFrontPage =
    !loading && activeCommunity === "all" && !searchQuery.trim() && posts.length > 0;
  const leadPost = isFrontPage ? posts[0] : null;
  const gridPosts = isFrontPage ? posts.slice(1) : posts;

  const selectedPostAuthorId = selectedPost
    ? selectedPost.author?.id || selectedPost.author?.username || "usr_sandeep_author"
    : "";

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111315]">
      <Navbar
        communities={communities}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openCreateModal={() => openWriteFlow("text")}
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
        onSelectPostById={handleOpenPostById}
      />

      {/* Full-Bleed Dark Contrast Top Band (Featured Story OR Filtered Section Header) */}
      {loading ? (
        <section className="w-full bg-[#111315]">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-9 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="h-6 w-32 rounded-md skeleton-pulse-dark" />
              <div className="h-10 w-full rounded-lg skeleton-pulse-dark" />
              <div className="h-10 w-4/5 rounded-lg skeleton-pulse-dark" />
              <div className="h-7 w-48 rounded-full skeleton-pulse-dark" />
            </div>
            <div className="lg:col-span-6 aspect-[16/10] rounded-xl skeleton-pulse-dark" />
          </div>
        </section>
      ) : searchQuery.trim() ? (
        <section className="w-full bg-[#111315] text-white">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-7 flex items-center justify-between gap-4">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.03em]">
              &ldquo;{searchQuery.trim()}&rdquo;
            </h1>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="rounded-lg border border-[#272A30] bg-[#191C20] hover:bg-[#23272D] px-3.5 py-1.5 text-xs font-medium text-[#FAFAFA] transition-colors cursor-pointer shrink-0"
            >
              Clear
            </button>
          </div>
        </section>
      ) : activeCommunity !== "all" && currentCommunityObj ? (
        <section className="w-full bg-[#111315] text-white">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-7 flex items-center justify-between gap-4">
            <h1 className="inline-flex items-center gap-3 font-display text-2xl sm:text-3xl font-bold tracking-[-0.03em]">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F766E] text-white shrink-0">
                <CommunityIcon slug={currentCommunityObj.slug} className="h-4.5 w-4.5" />
              </span>
              <span>{currentCommunityObj.name}</span>
            </h1>
            <button
              type="button"
              onClick={() => openWriteFlow("text")}
              className="rounded-lg bg-white hover:bg-[#E4E4E7] px-4 py-1.5 text-xs font-semibold text-[#111315] transition-colors cursor-pointer shrink-0"
            >
              Write
            </button>
          </div>
        </section>
      ) : leadPost ? (
        <FeaturedStoryHero
          leadPost={leadPost}
          onSelectPost={(p) => setSelectedPost(p)}
          onVote={handleVote}
          setActiveCommunity={setActiveCommunity}
          currentUser={user}
          onDeletePost={handleDeletePost}
          subscribedAuthors={subscribedAuthors}
          onSubscribeAuthor={handleSubscribeAuthor}
        />
      ) : null}

      {/* Crisp Pure White Visual Card Grid */}
      <main className="w-full flex-1 mx-auto max-w-[1240px] px-5 sm:px-8">
        {loading ? (
          <div className="py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-[#E4E4E7] overflow-hidden bg-white"
              >
                <div className="aspect-[16/10] skeleton-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-24 rounded skeleton-pulse" />
                  <div className="h-6 w-full rounded skeleton-pulse" />
                  <div className="h-4 w-3/4 rounded skeleton-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <FeedTabs
              title={isFrontPage ? "Latest Stories" : "Stories"}
              sort={sort}
              setSort={setSort}
            />

            <section className="w-full pt-5 pb-10">
              {gridPosts.length === 0 ? (
                <div className="py-16 text-center rounded-xl border border-[#E4E4E7] bg-[#F4F4F5]/50">
                  <p className="font-display text-lg font-semibold text-[#111315] mb-4">
                    No posts yet
                  </p>
                  <button
                    type="button"
                    onClick={() => openWriteFlow("text")}
                    className="rounded-lg bg-[#111315] hover:bg-[#0F766E] px-5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    Write a post
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridPosts.map((post) => {
                    const authorKey =
                      post.author?.id || post.author?.username || "usr_sandeep_author";
                    return (
                      <PostCard
                        key={post.id}
                        post={post}
                        onSelectPost={(p) => setSelectedPost(p)}
                        onVote={handleVote}
                        setActiveCommunity={setActiveCommunity}
                        currentUser={user}
                        onDeletePost={handleDeletePost}
                        isAuthorSubscribed={subscribedAuthors.includes(authorKey)}
                        onSubscribeAuthor={handleSubscribeAuthor}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        <DispatchSection
          isPublicationSubscribed={subscribedChannels.includes("publication")}
          onSubscribePublication={handleSubscribePublication}
          currentUser={user}
        />
      </main>

      <footer className="w-full border-t border-[#E4E4E7] bg-white mt-auto">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A]">
          <span className="font-display text-sm font-bold text-[#111315]">
            TechPeppy · © 2026
          </span>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-[#111315] transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => setIsContactOpen(true)}
              className="hover:text-[#111315] transition-colors cursor-pointer"
            >
              Contact
            </button>
            <a
              href="mailto:admin@techpeppy.com"
              className="hover:text-[#111315] transition-colors"
            >
              admin@techpeppy.com
            </a>
          </div>
        </div>
      </footer>

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-start gap-3 rounded-xl border border-[#272A30] bg-[#111315] px-4 py-3 text-[#FAFAFA] shadow-2xl max-w-sm"
        >
          <CheckCircle2 className="h-4 w-4 text-[#2DD4BF] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold leading-snug">{toast.title}</p>
            {toast.subtitle && (
              <p className="mt-0.5 text-xs text-[#A1A1AA] leading-snug">{toast.subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-[#71717A] hover:text-white cursor-pointer"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(newUser) => setUser(newUser)}
        defaultMode={authDefaultMode}
      />

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        communities={communities}
        defaultType={createDefaultType}
        onPostCreated={handlePostCreated}
      />

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
        isAuthorSubscribed={Boolean(
          selectedPostAuthorId && subscribedAuthors.includes(selectedPostAuthorId)
        )}
        onSubscribeAuthor={handleSubscribeAuthor}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        openContactModal={() => setIsContactOpen(true)}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}
