"use client";

import React, { useState } from "react";
import { Search, Plus, PenLine, Shield, X, LogIn, LogOut, Trash2, Mail, Info, Sparkles } from "lucide-react";
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
  openAboutModal?: () => void;
  openContactModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  openCreateModal,
  activeCommunity,
  setActiveCommunity,
  user,
  openAuthModal,
  onLogout,
  onCleanMockData,
  openAboutModal,
  openContactModal,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1e293b] bg-[#0b0f17]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Brand Logo & Navigation Links */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveCommunity("all")}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/25 transition-colors">
              <PenLine className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  TechPeppy
                </span>
                <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-400 border border-emerald-500/20">
                  .com
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden lg:block">
                Software • AI • Architecture
              </p>
            </div>
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-300">
            <button
              onClick={() => setActiveCommunity("all")}
              className={`rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer ${
                activeCommunity === "all"
                  ? "bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20"
                  : "hover:text-white hover:bg-slate-800/50"
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveCommunity("software-architecture")}
              className={`rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer ${
                activeCommunity === "software-architecture"
                  ? "bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20"
                  : "hover:text-white hover:bg-slate-800/50"
              }`}
            >
              Software
            </button>
            <button
              onClick={() => setActiveCommunity("ai-learning")}
              className={`rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer ${
                activeCommunity === "ai-learning"
                  ? "bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20"
                  : "hover:text-white hover:bg-slate-800/50"
              }`}
            >
              AI Learning
            </button>
            <button
              onClick={() => setActiveCommunity("data-science")}
              className={`rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer ${
                activeCommunity === "data-science"
                  ? "bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20"
                  : "hover:text-white hover:bg-slate-800/50"
              }`}
            >
              Data Science
            </button>
            <button
              onClick={() => setActiveCommunity("desk-setups")}
              className={`rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer ${
                activeCommunity === "desk-setups"
                  ? "bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20"
                  : "hover:text-white hover:bg-slate-800/50"
              }`}
            >
              Setups
            </button>
            {openAboutModal && (
              <button
                onClick={openAboutModal}
                className="rounded-lg px-2.5 py-1.5 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                About
              </button>
            )}
            {openContactModal && (
              <button
                onClick={openContactModal}
                className="rounded-lg px-2.5 py-1.5 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                Contact
              </button>
            )}
          </nav>
        </div>

        {/* Global Search Bar */}
        <div className="mx-3 flex-1 max-w-sm sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search architecture, AI, setups..."
              className="w-full rounded-full border border-[#1e293b] bg-[#111726] py-1.5 pl-9 pr-8 text-xs text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
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
            className="flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Post</span>
            <span className="sm:hidden">Post</span>
          </button>

          {user ? (
            /* Logged In User Pill */
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-full border border-[#1e293b] bg-[#111726] p-1 pr-2.5 hover:border-slate-500 transition-colors cursor-pointer"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-6 w-6 rounded-full object-cover ring-1 ring-emerald-500/40"
                />
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200 leading-tight flex items-center gap-1">
                    {user.name}
                    {user.role === "admin" && (
                      <Shield className="h-3 w-3 text-emerald-400" />
                    )}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-medium">
                    ⚡ {user.karma} karma
                  </span>
                </div>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#1e293b] bg-[#0f172a] p-2 shadow-2xl z-50">
                  <div className="px-3 py-2 border-b border-[#1e293b] mb-1">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{user.name}</span>
                      {user.role === "admin" && (
                        <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                          ADMIN
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400">u/{user.username}</p>
                    <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-400 border border-emerald-500/20">
                      <span>Karma Points</span>
                      <span className="font-bold">⚡ {user.karma}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1">
                    <div className="px-3 py-1.5 text-[11px] text-slate-400">
                      Email: <span className="text-slate-200">{user.email}</span>
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
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
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
                className="flex items-center gap-1.5 rounded-full border border-[#1e293b] bg-[#111726] px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => openAuthModal("register")}
                className="hidden sm:flex items-center gap-1 rounded-full bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
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
