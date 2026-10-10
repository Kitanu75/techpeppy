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
    <header className="sticky top-0 z-40 w-full border-b border-[#eff3f4] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveCommunity("all")}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
          >
            <span className="font-extrabold text-lg tracking-tight text-[#0f1419] group-hover:opacity-80 transition-opacity">
              TechPeppy
            </span>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="mx-4 flex-1 max-w-sm sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#536471]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, architecture, setups..."
              className="w-full rounded-full border border-transparent bg-[#eff3f4] py-1.5 pl-9 pr-8 text-xs sm:text-sm text-[#0f1419] placeholder-[#536471] focus:bg-white focus:border-[#cfd9de] focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#536471] hover:text-[#0f1419] cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Post Button */}
          <button
            onClick={() => {
              if (!user) {
                openAuthModal("login");
              } else {
                openCreateModal();
              }
            }}
            className="flex items-center gap-1.5 rounded-full bg-[#0f1419] hover:bg-[#272c30] px-4 py-1.5 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Post</span>
          </button>

          {user ? (
            /* Logged In User Pill */
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-full border border-[#eff3f4] bg-[#f7f9f9] p-1 pr-2.5 hover:bg-[#eff3f4] transition-colors cursor-pointer"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-6 w-6 rounded-full object-cover"
                />
                <span className="hidden sm:inline text-xs font-semibold text-[#0f1419]">
                  {user.name.split(" ")[0]}
                </span>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#eff3f4] bg-white p-2 shadow-xl z-50">
                  <div className="px-3 py-2 border-b border-[#eff3f4] mb-1">
                    <p className="text-xs font-bold text-[#0f1419] flex items-center gap-1.5">
                      <span>{user.name}</span>
                      {user.role === "admin" && (
                        <Shield className="h-3 w-3 text-neutral-500" />
                      )}
                    </p>
                    <p className="text-[11px] text-[#536471]">u/{user.username}</p>
                  </div>

                  <div className="text-xs text-[#0f1419] space-y-1">
                    {openAboutModal && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          openAboutModal();
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-[#f7f9f9] text-left transition-colors cursor-pointer"
                      >
                        <Info className="h-3.5 w-3.5 text-[#536471]" />
                        <span>About TechPeppy</span>
                      </button>
                    )}

                    {openContactModal && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          openContactModal();
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-[#f7f9f9] text-left transition-colors cursor-pointer"
                      >
                        <Mail className="h-3.5 w-3.5 text-[#536471]" />
                        <span>Contact & Support</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
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
                className="rounded-full border border-[#cfd9de] bg-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#0f1419] hover:bg-[#f7f9f9] transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => openAuthModal("register")}
                className="hidden sm:block rounded-full bg-[#0f1419] hover:bg-[#272c30] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer"
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
