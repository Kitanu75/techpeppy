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
import { CommunityType, PostType } from "@/lib/models/types";
import { SessionUser } from "@/lib/auth";
import { Sparkles, Image as ImageIcon, Flame } from "lucide-react";

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
    <div className="min-h-screen bg-[#0d0f15] text-[#ededed]">
      {/* Navbar with Auth State */}
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
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 py-5">
        <div className="flex items-start justify-center">
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
          <section className="flex-1 max-w-3xl min-w-0">
            {/* Active Community Banner (if filtered) */}
            {activeCommunity !== "all" && currentCommunityObj && (
              <div className="mb-4 overflow-hidden rounded-2xl border border-[#2b3145] bg-[#151824] shadow-md">
                <div
                  className="h-20 w-full"
                  style={{
                    backgroundColor: currentCommunityObj.bannerColor || "#2563EB",
                    backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.4) 100%)",
                  }}
                />
                <div className="p-4 sm:p-5 -mt-8 flex items-end justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#191c28] text-2xl border-2 border-[#2b3145] shadow-lg">
                      {currentCommunityObj.icon}
                    </div>
                    <div>
                      <h1 className="text-xl font-extrabold text-white">
                        {currentCommunityObj.name}
                      </h1>
                      <p className="text-xs text-orange-400 font-semibold font-mono">
                        t/{currentCommunityObj.slug}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!user) {
                        setAuthDefaultMode("login");
                        setIsAuthOpen(true);
                      } else {
                        setCreateDefaultType("image");
                        setIsCreateOpen(true);
                      }
                    }}
                    className="rounded-xl bg-orange-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-700 transition-colors shadow-sm cursor-pointer"
                  >
                    Post Here
                  </button>
                </div>
                <div className="px-5 pb-4 text-xs text-gray-300">
                  {currentCommunityObj.description}
                </div>
              </div>
            )}

            {/* Reddit Feed Tabs & Quick Post Bar */}
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
            />

            {/* Posts List */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-44 rounded-2xl border border-[#202534] bg-[#141620] animate-pulse p-4"
                  />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-2xl border border-[#232838] bg-[#151822] p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400 mb-3">
                  <Flame className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  No Posts Yet
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                  {searchQuery
                    ? `No matching posts for "${searchQuery}". Try different keywords.`
                    : "Be the first to share an inspiring setup photo or tech discussion!"}
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
                  className="rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-700 transition-colors shadow-md cursor-pointer"
                >
                  Create First Post
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
                  />
                ))}
              </div>
            )}
          </section>

          {/* Right Sidebar */}
          <SidebarRight
            communities={communities}
            openCreateModal={() => {
              if (!user) {
                setAuthDefaultMode("login");
                setIsAuthOpen(true);
              } else {
                setCreateDefaultType("text");
                setIsCreateOpen(true);
              }
            }}
            setActiveCommunity={setActiveCommunity}
          />
        </div>
      </main>

      {/* Auth Modal (Login / Sign Up / Admin) */}
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
      />
    </div>
  );
}
