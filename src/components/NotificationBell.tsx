"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CheckCheck, UserPlus, MessageSquare, FileText } from "lucide-react";
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

    if (
      notif.channelSlug &&
      notif.channelSlug !== "publication" &&
      notif.channelSlug !== "author" &&
      onSelectChannel
    ) {
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
      return <MessageSquare className="h-3 w-3 text-[#0F766E]" />;
    }
    if (type === "NEW_POST") {
      return <FileText className="h-3 w-3 text-[#52525B]" />;
    }
    return <UserPlus className="h-3 w-3 text-[#0F766E]" />;
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
        className={`relative flex h-8.5 w-8.5 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
          isOpen
            ? "border-[#3F434D] bg-[#23272D] text-white"
            : "border-[#272A30] bg-[#191C20] text-[#A1A1AA] hover:border-[#3F434D] hover:text-white"
        }`}
      >
        <Bell className="h-4 w-4 stroke-[1.8]" />
        {unreadCount > 0 && (
          <span
            aria-label={`${unreadCount} unread notifications`}
            className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#0F766E] px-1 text-[10px] font-semibold leading-none text-white tabular-nums ring-2 ring-[#111315]"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[#E4E4E7] bg-white shadow-2xl z-50 overflow-hidden text-[#111315]">
          <div className="flex items-center justify-between border-b border-[#E4E4E7] bg-[#F4F4F5]/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-[#111315]">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs text-[#71717A] tabular-nums">{unreadCount} unread</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className={`flex items-center gap-1 text-xs transition-colors ${
                unreadCount > 0
                  ? "text-[#52525B] hover:text-[#111315] cursor-pointer"
                  : "text-[#A1A1AA] cursor-not-allowed"
              }`}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          </div>

          <div className="flex items-center gap-5 border-b border-[#E4E4E7] px-4">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`-mb-px border-b-2 py-2 text-xs transition-colors cursor-pointer ${
                activeTab === "all"
                  ? "border-[#0F766E] font-semibold text-[#111315]"
                  : "border-transparent text-[#71717A] hover:text-[#111315]"
              }`}
            >
              All ({notifications.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("subscribers")}
              className={`-mb-px border-b-2 py-2 text-xs transition-colors cursor-pointer ${
                activeTab === "subscribers"
                  ? "border-[#0F766E] font-semibold text-[#111315]"
                  : "border-transparent text-[#71717A] hover:text-[#111315]"
              }`}
            >
              Subscribers ({notifications.filter((n) => n.type === "NEW_SUBSCRIBER").length})
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#E4E4E7]">
            {loading && notifications.length === 0 ? (
              <div className="p-4 space-y-2.5">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 rounded-lg skeleton-pulse" />
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm font-semibold text-[#111315]">No notifications yet</p>
                <p className="mt-1 text-xs text-[#71717A] max-w-[240px] mx-auto leading-relaxed">
                  Subscribe to authors to get notified whenever they publish new stories.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => handleItemClick(notif)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                    notif.isRead
                      ? "bg-white hover:bg-[#F4F4F5]/70"
                      : "bg-[#F0FDFA]/50 hover:bg-[#F0FDFA]"
                  }`}
                >
                  {notif.actorAvatar ? (
                    <img
                      src={notif.actorAvatar}
                      alt={notif.actorName}
                      className="h-8 w-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F4F5] text-xs font-semibold text-[#111315] shrink-0">
                      {getInitials(notif.actorName)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#111315] leading-snug">
                      <span className="font-semibold">{notif.actorName}</span>{" "}
                      <span className="text-[#52525B]">{notif.message}</span>
                    </p>

                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[#71717A]">
                      <span className="inline-flex items-center gap-1">
                        {renderTypeIcon(notif.type)}
                        <span>
                          {notif.channelSlug &&
                          notif.channelSlug !== "publication" &&
                          notif.channelSlug !== "author"
                            ? notif.channelSlug
                            : "TechPeppy"}
                        </span>
                      </span>
                      <span aria-hidden>·</span>
                      <span suppressHydrationWarning className="tabular-nums">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                  </div>

                  {!notif.isRead && (
                    <span
                      title="Unread"
                      className="mt-1.5 h-2 w-2 rounded-full bg-[#0F766E] shrink-0"
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
