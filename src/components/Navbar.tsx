"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Plus, X, LogOut, Shield, Info, Mail } from "lucide-react";
import { SessionUser } from "@/lib/auth";
import { NotificationBell } from "./NotificationBell";

interface NavbarProps {
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

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  openCreateModal,
  setActiveCommunity,
  user,
  openAuthModal,
  onLogout,
  openAboutModal,
  openContactModal,
  onSelectPostById,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Global ⌘K / Ctrl+K shortcut to focus hardware command search bar
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

  // Close user menu on outside click
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
    <header className="sticky top-0 z-40 w-full h-14 border-b border-[#E2E0D8] bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex h-full max-w-[1360px] items-center justify-between px-4 sm:px-8 gap-3">
        {/* Brand */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => setActiveCommunity("all")}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
          >
            <div className="h-8 w-8 rounded-md bg-[#141413] border border-[#141413] flex items-center justify-center text-[#F6F5F0] font-mono font-bold text-xs tracking-tight group-hover:bg-[#27272A] transition-colors">
              TP
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-[#141413] group-hover:text-[#686763] transition-colors">
                TechPeppy
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono font-medium tracking-wide px-2 py-0.5 rounded-md bg-[#F6F5F0] text-[#686763] border border-[#E2E0D8]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                Engineering
              </span>
            </div>
          </button>
        </div>

        {/* Tactile Hardware Command Search Bar with ⌘K */}
        <div className="mx-2 flex-1 max-w-sm sm:max-w-md lg:max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8A8A95]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search architecture blueprints, RAG systems, gear..."
              className="w-full h-8.5 rounded-md border border-[#E2E0D8] bg-[#F6F5F0] pl-8.5 pr-14 text-xs text-[#141413] placeholder-[#8A8A95] hover:border-[#CFCBC0] focus:bg-white focus:border-[#141413] focus:outline-none transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#686763] hover:text-[#141413] cursor-pointer"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center pointer-events-none">
                <kbd className="font-mono tabular-nums text-[10px] font-medium text-[#686763] bg-white border border-[#E2E0D8] px-1.5 py-0.5 rounded shadow-2xs">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (!user) {
                openAuthModal("login");
              } else {
                openCreateModal();
              }
            }}
            className="flex h-8.5 items-center gap-1.5 rounded-md bg-[#141413] hover:bg-[#27272A] border border-[#141413] px-3 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.2]" />
            <span>Post</span>
          </button>

          {/* Real-Time Notification Bell */}
          <NotificationBell
            currentUser={user}
            onSelectChannel={setActiveCommunity}
            onSelectPostById={onSelectPostById}
          />

          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex h-8.5 items-center gap-2 rounded-md border border-[#E2E0D8] bg-white px-2 hover:bg-[#EFECE6] transition-colors cursor-pointer"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-5.5 w-5.5 rounded object-cover border border-[#E2E0D8]"
                />
                <span className="hidden sm:inline text-xs font-semibold text-[#141413]">
                  {user.name.split(" ")[0]}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-md border border-[#E2E0D8] bg-white p-1.5 shadow-xl z-50">
                  <div className="px-3 py-2 border-b border-[#E2E0D8] mb-1">
                    <p className="text-xs font-bold text-[#141413] flex items-center gap-1.5">
                      <span>{user.name}</span>
                      {user.role === "admin" && (
                        <Shield className="h-3 w-3 text-[#10B981]" />
                      )}
                    </p>
                    <p className="text-[11px] text-[#686763] font-mono">u/{user.username}</p>
                  </div>

                  <div className="text-xs text-[#686763] space-y-0.5">
                    {openAboutModal && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          openAboutModal();
                        }}
                        className="w-full flex items-center gap-2 rounded-md px-3 py-2 hover:bg-[#EFECE6] hover:text-[#141413] text-left transition-colors cursor-pointer"
                      >
                        <Info className="h-3.5 w-3.5 text-[#8A8A95]" />
                        <span>About TechPeppy</span>
                      </button>
                    )}

                    {openContactModal && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          openContactModal();
                        }}
                        className="w-full flex items-center gap-2 rounded-md px-3 py-2 hover:bg-[#EFECE6] hover:text-[#141413] text-left transition-colors cursor-pointer"
                      >
                        <Mail className="h-3.5 w-3.5 text-[#8A8A95]" />
                        <span>Contact & Support</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-[#DC2626] hover:bg-red-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openAuthModal("login")}
                className="h-8.5 rounded-md border border-[#E2E0D8] bg-white px-3 text-xs font-semibold text-[#141413] hover:bg-[#EFECE6] transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => openAuthModal("register")}
                className="hidden sm:inline-flex h-8.5 items-center rounded-md bg-[#141413] hover:bg-[#27272A] border border-[#141413] px-3 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
