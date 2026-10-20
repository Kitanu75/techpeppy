"use client";

import React, { useState, useEffect } from "react";
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

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaultType, setCreateDefaultType] = useState<"text" | "image">("text");
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

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
    checkAuth();
  }, []);

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
    loadCommunities();
  }, []);

  // Fetch Posts based on community, sort & search
  const loadPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCommunity !== "all") params.append("community", activeCommunity);
      if (sort) params.append("sort", sort);
      if (searchQuery.trim()) params.append("q", searchQuery.trim());

      const res = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [activeCommunity, sort, searchQuery]);

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
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-950">
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

          {/* Central Main Feed */}
          <section className="flex-1 max-w-[760px] min-w-0">
            {/* Publication Showcase Hero (When viewing All Feeds) */}
            {activeCommunity === "all" && !searchQuery && (
              <div className="mb-4 rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-xs relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Engineering Publication & Architecture Hub
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-950 mb-1.5">
                  Decoupled Systems, Production AI & Workstations
                </h1>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-2xl">
                  High-signal technical rationale, microservice blueprints, local LLM orchestration, and ergonomic workspace gear curated by Sandeep Kumar.
                </p>
              </div>
            )}

            {/* Active Channel Header (if filtered) */}
            {activeCommunity !== "all" && currentCommunityObj && (
              <div className="mb-4 rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <CommunityIcon
                      slug={currentCommunityObj.slug}
                      variant="badge"
                      className="h-6 w-6"
                    />
                    <div>
                      <h1 className="text-lg font-bold text-zinc-950">
                        {currentCommunityObj.name}
                      </h1>
                      <p className="text-xs text-zinc-500 mt-0.5">
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
                    className="rounded-xl bg-zinc-950 hover:bg-zinc-800 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer shrink-0"
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
                    className="h-32 rounded-2xl border border-zinc-200/80 bg-white skeleton-pulse"
                  />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200/90 bg-white p-8 text-center shadow-xs">
                <p className="text-sm font-semibold text-zinc-950 mb-1">
                  No posts yet in this feed
                </p>
                <p className="text-xs text-zinc-500 mb-4">
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
                  className="rounded-xl bg-zinc-950 hover:bg-zinc-800 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
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
          />
        </div>
      </main>

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
