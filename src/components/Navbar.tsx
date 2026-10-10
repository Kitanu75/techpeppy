"use client";

import React, { useState } from "react";
import { Search, Plus, Bell, Flame, Shield, X, LogIn, LogOut, Trash2, User as UserIcon } from "lucide-react";
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
  onCleanMockData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  openCreateModal,
  setActiveCommunity,
  user,
  openAuthModal,
  onLogout,
  onCleanMockData,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#262b3a] bg-[#12141c]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveCommunity("all")}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#ff4500] to-[#ff7a00] shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Flame className="h-5 w-5 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-orange-400 transition-colors">
                  TechPeppy
                </span>
                <span className="rounded-full bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-orange-400 border border-orange-500/20">
                  .com
                </span>
              </div>
              <p className="text-[10px] text-gray-400 -mt-1 hidden sm:block">
                Tech Community & Discussions
              </p>
            </div>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="mx-4 flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tech posts, photo setups, gadgets..."
              className="w-full rounded-full border border-[#2b3145] bg-[#191c28] py-1.5 pl-10 pr-9 text-sm text-gray-100 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create Post Button */}
          <button
            onClick={() => {
              if (!user) {
                openAuthModal("login");
              } else {
                openCreateModal();
              }
            }}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ff6333] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:from-[#e03d00] hover:to-[#eb5323] hover:shadow-orange-500/25 hover:shadow-md cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Create Post</span>
            <span className="sm:hidden">Post</span>
          </button>

          {user ? (
            /* Logged In User Pill */
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-full border border-[#282d3e] bg-[#191c28] p-1 pr-2.5 hover:border-gray-500 transition-colors cursor-pointer"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-7 w-7 rounded-full object-cover ring-1 ring-orange-500/40"
                />
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-gray-200 leading-tight flex items-center gap-1">
                    {user.name}
                    {user.role === "admin" && (
                      <Shield className="h-3 w-3 text-orange-400" />
                    )}
                  </span>
                  <span className="text-[10px] text-orange-400 font-medium flex items-center gap-0.5">
                    ⚡ {user.karma} karma
                  </span>
                </div>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl border border-[#2d3448] bg-[#181b26] p-2 shadow-2xl z-50">
                  <div className="px-3 py-2 border-b border-[#252a3b] mb-1">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{user.name}</span>
                      {user.role === "admin" && (
                        <span className="rounded bg-orange-500/20 px-1 py-0.2 text-[9px] font-bold text-orange-400 border border-orange-500/30">
                          ADMIN
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-400">u/{user.username}</p>
                    <div className="mt-2 flex items-center justify-between rounded-lg bg-orange-500/10 px-2 py-1 text-[11px] text-orange-400 border border-orange-500/20">
                      <span>Karma Points</span>
                      <span className="font-bold">⚡ {user.karma}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-300 space-y-1">
                    <div className="px-3 py-1.5 text-[11px] text-gray-400">
                      Email: <span className="text-gray-200">{user.email}</span>
                    </div>

                    {user.role === "admin" && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          if (onCleanMockData) onCleanMockData();
                        }}
                        className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-amber-400 hover:bg-amber-500/10 transition-colors text-left font-medium cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Wipe Dummy Posts (Clean Feed)</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
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
                className="flex items-center gap-1.5 rounded-full border border-[#2b3145] bg-[#191c28] px-3.5 py-1.5 text-xs font-semibold text-gray-200 hover:border-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => openAuthModal("register")}
                className="hidden sm:flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:brightness-110 transition-all cursor-pointer"
              >
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
