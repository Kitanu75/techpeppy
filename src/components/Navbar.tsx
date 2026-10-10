"use client";

import React, { useState } from "react";
import { Search, Plus, X, LogIn, LogOut, Shield, Info, Mail } from "lucide-react";
import { SessionUser } from "@/lib/auth";

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
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#262626] bg-black/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Clean Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveCommunity("all")}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
          >
            <span className="font-extrabold text-lg tracking-tight text-white group-hover:opacity-90 transition-opacity">
              TechPeppy
            </span>
          </button>
        </div>

        {/* Global Search Bar (Twitter / Threads style) */}
        <div className="mx-4 flex-1 max-w-sm sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71767b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, architecture, setups..."
              className="w-full rounded-full border border-[#2f3336] bg-[#16181c] py-1.5 pl-9 pr-8 text-xs sm:text-sm text-[#f7f9f9] placeholder-[#71767b] focus:border-white focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71767b] hover:text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Twitter-style New Post Button */}
          <button
            onClick={() => {
              if (!user) {
                openAuthModal("login");
              } else {
                openCreateModal();
              }
            }}
            className="flex items-center gap-1.5 rounded-full bg-white hover:bg-neutral-200 px-4 py-1.5 text-xs sm:text-sm font-semibold text-black shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Post</span>
          </button>

          {user ? (
            /* Logged In User Pill */
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-full border border-[#262626] bg-[#16181c] p-1 pr-2.5 hover:border-neutral-500 transition-colors cursor-pointer"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-6 w-6 rounded-full object-cover"
                />
                <span className="hidden sm:inline text-xs font-semibold text-neutral-200">
                  {user.name.split(" ")[0]}
                </span>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#262626] bg-[#121212] p-2 shadow-2xl z-50">
                  <div className="px-3 py-2 border-b border-[#262626] mb-1">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{user.name}</span>
                      {user.role === "admin" && (
                        <Shield className="h-3 w-3 text-neutral-400" />
                      )}
                    </p>
                    <p className="text-[11px] text-[#71767b]">u/{user.username}</p>
                  </div>

                  <div className="text-xs text-neutral-300 space-y-1">
                    {openAboutModal && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          openAboutModal();
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-neutral-800 text-left transition-colors cursor-pointer"
                      >
                        <Info className="h-3.5 w-3.5 text-neutral-400" />
                        <span>About TechPeppy</span>
                      </button>
                    )}

                    {openContactModal && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          openContactModal();
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-neutral-800 text-left transition-colors cursor-pointer"
                      >
                        <Mail className="h-3.5 w-3.5 text-neutral-400" />
                        <span>Contact & Support</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out Buttons */
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal("login")}
                className="rounded-full border border-[#2f3336] bg-transparent px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => openAuthModal("register")}
                className="hidden sm:block rounded-full bg-white hover:bg-neutral-200 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-black transition-colors cursor-pointer"
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
