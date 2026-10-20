"use client";

import React, { useState } from "react";
import { Search, Plus, X, LogOut, Shield, Info, Mail } from "lucide-react";
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
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-15 max-w-[1360px] items-center justify-between px-4 sm:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveCommunity("all")}
            className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
          >
            <div className="h-8 w-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white font-bold text-xs shadow-xs group-hover:bg-zinc-800 transition-colors">
              TP
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-lg tracking-tight text-zinc-950 group-hover:text-zinc-700 transition-colors">
                TechPeppy
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono font-medium tracking-wide px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200">
                Engineering
              </span>
            </div>
          </button>
        </div>

        {/* Search with ⌘K Badge */}
        <div className="mx-4 flex-1 max-w-sm sm:max-w-md lg:max-w-xl">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search architecture blueprints, RAG systems, gear..."
              className="w-full rounded-xl border border-zinc-200/90 bg-zinc-50/70 py-2 pl-9 pr-14 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-400 focus:outline-none transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center pointer-events-none">
                <kbd className="font-mono text-[10px] text-zinc-400 bg-white border border-zinc-200 px-1.5 py-0.5 rounded shadow-2xs">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              if (!user) {
                openAuthModal("login");
              } else {
                openCreateModal();
              }
            }}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Post</span>
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-1 pr-2.5 hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-6 w-6 rounded-full object-cover ring-1 ring-zinc-200"
                />
                <span className="hidden sm:inline text-xs font-semibold text-zinc-900">
                  {user.name.split(" ")[0]}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl z-50">
                  <div className="px-3 py-2 border-b border-zinc-100 mb-1">
                    <p className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <span>{user.name}</span>
                      {user.role === "admin" && (
                        <Shield className="h-3 w-3 text-emerald-600" />
                      )}
                    </p>
                    <p className="text-[11px] text-zinc-500 font-mono">u/{user.username}</p>
                  </div>

                  <div className="text-xs text-zinc-600 space-y-0.5">
                    {openAboutModal && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          openAboutModal();
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-zinc-50 text-left transition-colors cursor-pointer"
                      >
                        <Info className="h-3.5 w-3.5 text-zinc-400" />
                        <span>About TechPeppy</span>
                      </button>
                    )}

                    {openContactModal && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          openContactModal();
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-zinc-50 text-left transition-colors cursor-pointer"
                      >
                        <Mail className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Contact & Support</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal("login")}
                className="rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => openAuthModal("register")}
                className="hidden sm:block rounded-xl bg-zinc-950 hover:bg-zinc-800 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer"
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
