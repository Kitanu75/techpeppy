"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CheckCheck, UserPlus, Sparkles, MessageSquare, FileText } from "lucide-react";
import { NotificationType } from "@/lib/models/types";
import { SessionUser } from "@/lib/auth";

interface NotificationBellProps {
  currentUser?: SessionUser | null;
  onSelectChannel?: (slug: string) => void;
  onSelectPostById?: (postId: string) => void;
}

function readStoredClientId(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem("techpeppy_client_id") || "";
  } catch {
    return "";
  }
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  currentUser,
  onSelectChannel,
  onSelectPostById,
}) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "subscribers">("all");
  const [loading, setLoading] = useState(true);
  const [nowMs, setNowMs] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const buildNotificationsUrl = useCallback(() => {
    const cid = readStoredClientId();
    return cid
      ? `/api/notifications?clientId=${encodeURIComponent(cid)}`
      : "/api/notifications";
  }, []);

  const syncNotifications = useCallback(async () => {
    try {
      const res = await fetch(buildNotificationsUrl(), { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setNowMs(Date.now());
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [buildNotificationsUrl]);

  // Initial load + 5-second polling + window focus sync
  useEffect(() => {
    let active = true;
    const runFetch = async () => {
      try {
        const res = await fetch(buildNotificationsUrl(), { cache: "no-store" });
        if (!res.ok || !active) return;
        const data = await res.json();
        if (active && data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          setNowMs(Date.now());
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    void runFetch();

    const interval = setInterval(() => {
      void runFetch();
    }, 5000);
    const onFocus = () => {
      void runFetch();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [buildNotificationsUrl, currentUser?.id]);

  // Instant 0ms update when a local subscription or comment happens in the same session
  useEffect(() => {
    const handleCreated = (event: Event) => {
      const customEvent = event as CustomEvent<NotificationType | undefined>;
      const incoming = customEvent.detail;
      setNowMs(Date.now());
      if (incoming && incoming.id) {
        setNotifications((prev) => {
          const filtered = prev.filter((n) => n.id !== incoming.id);
          return [incoming, ...filtered];
        });
      } else {
        void syncNotifications();
      }
    };

    window.addEventListener("techpeppy:notification-created", handleCreated);
    return () => {
      window.removeEventListener("techpeppy:notification-created", handleCreated);
    };
  }, [syncNotifications]);

  // Close popover on outside click or Escape
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications =
    activeTab === "subscribers"
      ? notifications.filter((n) => n.type === "NEW_SUBSCRIBER")
      : notifications;

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      const cid = readStoredClientId();
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true, clientId: cid || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };

  const handleItemClick = async (notif: NotificationType) => {
    if (!notif.isRead) {
      // Optimistic mark read
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );

      try {
        const cid = readStoredClientId();
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notif.id, clientId: cid || undefined }),
        });
      } catch (err) {
        console.error("Mark read failed:", err);
      }
    }

    if (notif.postId && onSelectPostById) {
      onSelectPostById(notif.postId);
      setIsOpen(false);
      return;
    }

    if (notif.channelSlug && notif.channelSlug !== "publication" && onSelectChannel) {
      onSelectChannel(notif.channelSlug);
      setIsOpen(false);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    if (!nowMs) return "Just now";
    const diffSeconds = Math.max(
      0,
      Math.floor((nowMs - new Date(dateStr).getTime()) / 1000)
    );
    if (diffSeconds < 60) return "Just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const renderTypeIcon = (type: NotificationType["type"]) => {
    if (type === "POST_COMMENT") {
      return <MessageSquare className="h-3 w-3 text-[#10B981]" />;
    }
    if (type === "NEW_POST") {
      return <FileText className="h-3 w-3 text-[#141413]" />;
    }
    return <UserPlus className="h-3 w-3 text-[#FF5500]" />;
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (next) void syncNotifications();
        }}
        aria-label="Notifications"
        title="Notifications"
        className={`relative flex h-8.5 w-8.5 items-center justify-center rounded-md border transition-colors cursor-pointer ${
          isOpen
            ? "border-[#141413] bg-[#EFECE6] text-[#141413]"
            : "border-[#E2E0D8] bg-white hover:bg-[#EFECE6] text-[#141413]"
        }`}
      >
        <Bell className="h-4 w-4 stroke-[1.9]" />
        {unreadCount > 0 && (
          <span
            aria-label={`${unreadCount} unread notifications`}
            className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FF5500] px-1 font-mono text-[10px] font-bold leading-none text-white tabular-nums shadow-xs ring-2 ring-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-md border border-[#E2E0D8] bg-white shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E2E0D8] bg-[#F6F5F0] px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-[#141413]">
                Notifications
              </span>
              <span className="rounded bg-white border border-[#E2E0D8] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#686763] tabular-nums">
                {unreadCount} unread
              </span>
            </div>

            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className={`flex items-center gap-1 font-mono text-[11px] font-medium transition-colors ${
                unreadCount > 0
                  ? "text-[#141413] hover:text-[#10B981] cursor-pointer"
                  : "text-[#8A8A95] cursor-not-allowed"
              }`}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all as read</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 border-b border-[#E2E0D8] bg-white px-3 py-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#141413] text-white"
                  : "text-[#686763] hover:bg-[#EFECE6] hover:text-[#141413]"
              }`}
            >
              <span>All</span>
              <span className="font-mono text-[10px] opacity-80 tabular-nums">
                {notifications.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("subscribers")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "subscribers"
                  ? "bg-[#141413] text-white"
                  : "text-[#686763] hover:bg-[#EFECE6] hover:text-[#141413]"
              }`}
            >
              <UserPlus className="h-3 w-3" />
              <span>Subscribers</span>
              <span className="font-mono text-[10px] opacity-80 tabular-nums">
                {notifications.filter((n) => n.type === "NEW_SUBSCRIBER").length}
              </span>
            </button>
          </div>

          {/* List Body */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E0D8]">
            {loading && notifications.length === 0 ? (
              <div className="p-4 space-y-2.5">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 rounded-md skeleton-pulse" />
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="mx-auto mb-2.5 flex h-9 w-9 items-center justify-center rounded-md border border-[#E2E0D8] bg-[#F6F5F0] text-[#686763]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <p className="text-xs font-semibold text-[#141413]">
                  No notifications yet
                </p>
                <p className="mt-1 text-[11px] text-[#686763] max-w-[240px] mx-auto leading-relaxed">
                  Subscribe to any post or channel to receive instant updates when new replies or posts arrive.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => handleItemClick(notif)}
                  className={`w-full flex items-start gap-3 px-3.5 py-3 text-left transition-colors cursor-pointer ${
                    notif.isRead
                      ? "bg-white hover:bg-[#F6F5F0]"
                      : "bg-[#EFECE6]/55 hover:bg-[#EFECE6]"
                  }`}
                >
                  {/* Avatar or Initials */}
                  {notif.actorAvatar ? (
                    <img
                      src={notif.actorAvatar}
                      alt={notif.actorName}
                      className="h-8 w-8 rounded-md border border-[#E2E0D8] bg-[#F6F5F0] object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E2E0D8] bg-[#141413] font-mono text-[11px] font-bold text-white shrink-0">
                      {getInitials(notif.actorName)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#141413] leading-snug">
                      <span className="font-bold">{notif.actorName}</span>{" "}
                      <span className="text-[#686763]">{notif.message}</span>
                    </p>

                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded border border-[#E2E0D8] bg-[#F6F5F0] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#141413]">
                        {renderTypeIcon(notif.type)}
                        <span>
                          {notif.channelSlug && notif.channelSlug !== "publication"
                            ? `t/${notif.channelSlug}`
                            : "publication"}
                        </span>
                      </span>
                      <span
                        suppressHydrationWarning
                        className="font-mono text-[10px] text-[#8A8A95] tabular-nums"
                      >
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Unread Dot */}
                  {!notif.isRead && (
                    <span
                      title="Unread"
                      className="mt-1.5 h-2 w-2 rounded-full bg-[#FF5500] shrink-0"
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
