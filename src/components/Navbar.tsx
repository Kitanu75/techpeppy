"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, LogOut, Shield, Info, Mail, PenLine } from "lucide-react";
import { SessionUser } from "@/lib/auth";
import { CommunityType } from "@/lib/models/types";
import { NotificationBell } from "./NotificationBell";
import { CommunityIcon } from "./CommunityIcon";

interface NavbarProps {
  communities: CommunityType[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  openCreateModal: () => void;
  activeCommunity: string;
  setActiveCommunity: (c: string) => void;
  user: SessionUser | null;
  openAuthModal: (mode: "login" | "register") => void;
  onLogout: () => void;
  openAboutModal?: () => void;
  openContactModal?: () => void;
  onSelectPostById?: (postId: string) => void;
}

const DEFAULT_TOPICS = [
  { slug: "software-architecture", name: "Software Architecture" },
  { slug: "ai-learning", name: "AI & Models" },
  { slug: "data-science", name: "Data Science" },
  { slug: "desk-setups", name: "Desk Setups" },
  { slug: "tech-news", name: "Tech News" },
];

export const Navbar: React.FC<NavbarProps> = ({
  communities,
  searchQuery,
  setSearchQuery,
  openCreateModal,
  activeCommunity,
  setActiveCommunity,
  user,
  openAuthModal,
  onLogout,
  openAboutModal,
  openContactModal,
  onSelectPostById,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const topicTabs = [
    { slug: "all", name: "All" },
    ...(communities.length > 0
      ? communities.map((c) => ({ slug: c.slug, name: c.name }))
      : DEFAULT_TOPICS),
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#111315]/95 backdrop-blur-md text-[#FAFAFA]">
      {/* Primary Top Bar */}
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 h-15 flex items-center justify-between gap-4">
        {/* Left: Brand Wordmark + Compact Search */}
        <div className="flex items-center gap-5 min-w-0">
          <button
            type="button"
            onClick={() => {
              setActiveCommunity("all");
              setSearchQuery("");
            }}
            className="inline-flex items-center gap-2 font-display text-[21px] sm:text-[23px] font-extrabold tracking-[-0.04em] leading-none text-white hover:opacity-90 transition-opacity cursor-pointer shrink-0 focus:outline-none"
          >
            <span className="h-2.5 w-2.5 rounded-[2px] bg-[#0F766E] inline-block" aria-hidden />
            <span>TechPeppy</span>
          </button>

          <div className="relative hidden md:block w-56 lg:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#71717A]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories..."
              aria-label="Search posts"
              className="w-full h-8.5 rounded-lg border border-[#272A30] bg-[#191C20] pl-8.5 pr-12 text-[13px] text-[#FAFAFA] placeholder-[#71717A] hover:border-[#3F434D] focus:border-[#0F766E] focus:outline-none transition-colors"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white cursor-pointer"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd
                aria-hidden
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-[#272A30] bg-[#111315] px-1.5 py-0.5 text-[10px] font-medium text-[#71717A]"
              >
                ⌘K
              </kbd>
            )}
          </div>
        </div>

        {/* Right: Mobile Search, Write, Notifications, Account */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Search"
            className="md:hidden p-2 text-[#A1A1AA] hover:text-white cursor-pointer"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (!user) {
                openAuthModal("login");
              } else {
                openCreateModal();
              }
            }}
            aria-label="Write"
            title="Write"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#272A30] bg-[#191C20] hover:bg-[#23272D] hover:border-[#3F434D] px-3 py-1.5 text-xs font-medium text-[#FAFAFA] transition-colors cursor-pointer"
          >
            <PenLine className="h-3.5 w-3.5 text-[#2DD4BF]" />
            <span className="hidden sm:inline">Write</span>
          </button>

          <NotificationBell
            currentUser={user}
            onSelectChannel={setActiveCommunity}
            onSelectPostById={onSelectPostById}
          />

          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex h-8.5 items-center gap-2 rounded-full border border-[#272A30] bg-[#191C20] pl-1 pr-2.5 hover:border-[#3F434D] transition-colors cursor-pointer"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-6 w-6 rounded-full object-cover"
                />
                <span className="hidden sm:inline text-xs font-medium text-[#FAFAFA]">
                  {user.name.split(" ")[0]}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#E4E4E7] bg-white p-1.5 shadow-xl z-50 text-[#111315]">
                  <div className="px-3 py-2 border-b border-[#E4E4E7] mb-1">
                    <p className="text-xs font-semibold text-[#111315] flex items-center gap-1.5">
                      <span className="truncate">{user.name}</span>
                      {user.role === "admin" && (
                        <Shield className="h-3 w-3 text-[#0F766E] shrink-0" />
                      )}
                    </p>
                    <p className="text-[11px] text-[#71717A] truncate">@{user.username}</p>
                  </div>

                  <div className="text-xs text-[#52525B] space-y-0.5">
                    {openAboutModal && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          openAboutModal();
                        }}
                        className="w-full flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[#F4F4F5] hover:text-[#111315] text-left transition-colors cursor-pointer"
                      >
                        <Info className="h-3.5 w-3.5 text-[#71717A]" />
                        <span>About</span>
                      </button>
                    )}

                    {openContactModal && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          openContactModal();
                        }}
                        className="w-full flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-[#F4F4F5] hover:text-[#111315] text-left transition-colors cursor-pointer"
                      >
                        <Mail className="h-3.5 w-3.5 text-[#71717A]" />
                        <span>Contact</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-[#DC2626] hover:bg-red-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="rounded-lg bg-white hover:bg-[#E4E4E7] px-3.5 py-1.5 text-xs font-semibold text-[#111315] transition-colors cursor-pointer"
            >
              Sign in
            </button>
          )}
        </div>
      </div>

      {/* Expandable Mobile Search */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-[#272A30] bg-[#111315] px-5 py-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#71717A]" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories..."
              className="w-full h-9 rounded-lg border border-[#272A30] bg-[#191C20] pl-8.5 pr-8 text-sm text-[#FAFAFA] placeholder-[#71717A] focus:border-[#0F766E] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Section Navigation Bar: Proper Non-AI Icon + Name Only */}
      <div className="border-t border-b border-[#272A30] bg-[#111315]">
        <nav
          aria-label="Sections"
          className="mx-auto max-w-[1240px] px-5 sm:px-8 flex items-center gap-6 sm:gap-7 overflow-x-auto no-scrollbar"
        >
          {topicTabs.map((topic) => {
            const isActive = activeCommunity === topic.slug;
            return (
              <button
                key={topic.slug}
                type="button"
                onClick={() => {
                  setActiveCommunity(topic.slug);
                  setSearchQuery("");
                }}
                aria-current={isActive ? "page" : undefined}
                className={`shrink-0 -mb-px inline-flex items-center gap-1.5 border-b-2 py-2.5 text-[13px] transition-colors cursor-pointer ${
                  isActive
                    ? "border-[#2DD4BF] text-white font-semibold"
                    : "border-transparent text-[#A1A1AA] hover:text-white"
                }`}
              >
                <CommunityIcon
                  slug={topic.slug}
                  className={`h-3.5 w-3.5 ${isActive ? "text-[#2DD4BF]" : "text-[#71717A]"}`}
                />
                <span>{topic.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
