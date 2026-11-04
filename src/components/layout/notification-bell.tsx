"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Sparkles, Inbox, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-context";

interface NotificationItem {
  id: string;
  title: string;
  content: string;
  actorName: string;
  link: string;
  type: string;
  targetType: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = React.useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Ignore background fetch error
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial fetch and periodic poll every 45s when user is logged in
  React.useEffect(() => {
    fetchNotifications();
    if (!user) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 45000);

    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // Refetch when dropdown opens
  React.useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user, fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      try {
        fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notif.id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // Ignore
      }
    }

    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffSec < 60) return "Vừa xong";
      if (diffMin < 60) return `${diffMin} phút trước`;
      if (diffHour < 24) return `${diffHour} giờ trước`;
      if (diffDay < 7) return `${diffDay} ngày trước`;
      return past.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 rounded-full border border-border/70 text-muted-foreground hover:text-foreground relative"
        title="Thông báo"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E07B4C] text-white text-[10px] font-mono font-bold flex items-center justify-center border-2 border-[#2B2623] shadow-[1px_1px_0px_#2B2623] animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <span className="sr-only">Thông báo</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-x-3 top-14 sm:absolute sm:inset-auto sm:right-0 sm:top-11 w-auto sm:w-88 max-w-sm sm:max-w-none mx-auto sm:mx-0 p-3.5 rounded-2xl bg-[#FAF5EE] dark:bg-[#1F1B18] text-[#2B2623] dark:text-[#FAF5EE] border-2 border-[#2B2623] shadow-[4px_6px_0px_#2B2623] z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-1.5 border-b-2 border-[#2B2623]/20 mb-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-foreground">
              <Sparkles className="size-3.5 text-[#E07B4C]" />
              <span>Thông Báo</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#E07B4C] text-white font-bold ml-1">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[10px] font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD] hover:text-[#E07B4C] flex items-center gap-1 cursor-pointer transition-colors"
                title="Đánh dấu đã đọc tất cả"
              >
                <CheckCheck className="size-3 text-[#E07B4C]" />
                <span>Đã đọc hết</span>
              </button>
            )}
          </div>

          {/* List or Empty State */}
          <div className="overflow-y-auto space-y-1.5 pr-0.5 flex-1 min-h-[140px] max-h-[380px]">
            {isLoading && notifications.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-[#5C5146] dark:text-[#C4B9AD]">
                Đang tải thông báo...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((item) => {
                const isReply = item.type === "COMMENT_REPLY";
                const isParagraph = item.type === "NEW_PARAGRAPH_COMMENT";

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-2.5 rounded-[12px] border-2 transition-all cursor-pointer text-left group ${
                      !item.isRead
                        ? "bg-[#FDFBF7] dark:bg-[#25201C] border-[#E07B4C] shadow-[1.5px_2px_0px_#E07B4C]"
                        : "bg-[#FAF5EE]/70 dark:bg-[#1A1614]/70 border-[#2B2623]/15 opacity-85 hover:opacity-100 hover:border-[#2B2623]/30"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] border ${
                            isReply
                              ? "bg-[#F4DFAD] text-[#2B2623] border-[#2B2623]/30"
                              : isParagraph
                              ? "bg-[#BDCEAF] text-[#2B2623] border-[#2B2623]/30"
                              : "bg-[#EBBAB5] text-[#2B2623] border-[#2B2623]/30"
                          }`}
                        >
                          {isReply ? "Phản hồi" : isParagraph ? "Đoạn văn" : "Bình luận"}
                        </span>
                        <span className="font-bold text-[#E07B4C] truncate max-w-[120px]">
                          {item.actorName}
                        </span>
                      </div>
                      <span className="text-[#5C5146] dark:text-[#C4B9AD]">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <div className="text-xs font-serif font-bold text-foreground group-hover:text-[#E07B4C] transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </div>

                    {item.content && (
                      <p className="text-[11px] font-sans text-[#5C5146] dark:text-[#C4B9AD] line-clamp-1 italic mt-1 pl-1 border-l-2 border-[#E07B4C]/40">
                        &ldquo;{item.content}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-7 px-4 text-center flex flex-col items-center justify-center">
                <div className="size-11 rounded-full bg-[#E5DDD2] dark:bg-[#2A2420] border border-[#2B2623]/20 flex items-center justify-center text-[#5C5146] dark:text-[#C4B9AD] mb-2.5">
                  <Inbox className="size-5 opacity-60" />
                </div>
                <p className="font-serif font-bold text-sm text-[#2B2623] dark:text-[#FAF5EE] mb-1">
                  Chưa có thông báo mới
                </p>
                <p className="text-xs text-[#5C5146] dark:text-[#C4B9AD] leading-relaxed max-w-[220px]">
                  {user
                    ? "Hiện tại bạn không có thông báo hay phản hồi bình luận nào."
                    : "Đăng nhập để nhận thông báo khi có người trả lời bình luận của bạn nhé!"}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 mt-2 border-t-2 border-[#2B2623]/20 text-center shrink-0">
            <Link
              href="/kho-truyen"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-mono font-bold text-[#E07B4C] hover:underline inline-block"
            >
              Xem tất cả trong thư viện →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
