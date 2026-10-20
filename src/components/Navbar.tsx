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
    <header className="sticky top-0 z-40 w-full border-b border-[#E8E5DD] bg-[#F8F7F4]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between px-4 sm:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveCommunity("all")}
            className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
          >
            <div className="h-8 w-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-xs group-hover:bg-emerald-700 transition-colors">
              TP
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-xl tracking-tight text-[#1C1B18] group-hover:text-emerald-700 transition-colors">
                TechPeppy
              </span>
              <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#F1EFE9] text-[#4A4843] border border-[#E8E5DD]">
                Engineering
              </span>
            </div>
          </button>
        </div>

        {/* Search */}
        <div className="mx-4 flex-1 max-w-sm sm:max-w-md lg:max-w-xl">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#ACA9A2]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search architecture blueprints, RAG systems, workstation gear..."
              className="w-full rounded-xl border border-[#E8E5DD] bg-[#F1EFE9]/70 py-2 pl-9 pr-8 text-xs sm:text-sm text-[#1C1B18] placeholder-[#ACA9A2] focus:bg-white focus:border-emerald-500/50 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ACA9A2] hover:text-[#4A4843] cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => {
              if (!user) {
                openAuthModal("login");
              } else {
                openCreateModal();
              }
            }}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Post</span>
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-xl border border-[#E8E5DD] bg-white p-1 pr-2.5 hover:bg-[#F1EFE9] transition-colors cursor-pointer"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-6 w-6 rounded-full object-cover"
                />
                <span className="hidden sm:inline text-xs font-semibold text-[#1C1B18]">
                  {user.name.split(" ")[0]}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#E8E5DD] bg-white p-2 shadow-lg z-50">
                  <div className="px-3 py-2 border-b border-[#F1EFE9] mb-1">
                    <p className="text-xs font-bold text-[#1C1B18] flex items-center gap-1.5">
                      <span>{user.name}</span>
                      {user.role === "admin" && (
                        <Shield className="h-3 w-3 text-emerald-600" />
                      )}
                    </p>
                    <p className="text-[11px] text-[#8C8A83]">u/{user.username}</p>
                  </div>

                  <div className="text-xs text-[#4A4843] space-y-0.5">
                    {openAboutModal && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          openAboutModal();
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-[#F1EFE9] text-left transition-colors cursor-pointer"
                      >
                        <Info className="h-3.5 w-3.5 text-[#8C8A83]" />
                        <span>About TechPeppy</span>
                      </button>
                    )}

                    {openContactModal && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          openContactModal();
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-[#F1EFE9] text-left transition-colors cursor-pointer"
                      >
                        <Mail className="h-3.5 w-3.5 text-[#8C8A83]" />
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal("login")}
                className="rounded-xl border border-[#E8E5DD] bg-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#4A4843] hover:bg-[#F1EFE9] hover:text-[#1C1B18] transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => openAuthModal("register")}
                className="hidden sm:block rounded-xl bg-[#1C1B18] hover:bg-[#2C2A29] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white transition-colors cursor-pointer"
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
