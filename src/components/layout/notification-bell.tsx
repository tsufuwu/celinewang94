"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FALLBACK_RECENT_CHAPTERS } from "@/lib/data";

export function NotificationBell() {
  const [isOpen, setIsOpen] = React.useState(false);
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

  const recent = FALLBACK_RECENT_CHAPTERS.slice(0, 4);

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 rounded-full border border-border/70 text-muted-foreground hover:text-foreground relative"
        title="Thông báo chương mới"
      >
        <Bell className="size-4" />
        <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-orange-500 animate-pulse" />
        <span className="sr-only">Thông báo chương mới</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-11 w-80 p-3 rounded-2xl bg-card border border-border shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/60 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Sparkles className="size-3.5 text-orange-500" />
              <span>Chương Mới Cập Nhật</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">Hôm nay</span>
          </div>

          <div className="space-y-1">
            {recent.map((ch) => (
              <Link
                key={ch.id}
                href={`/chuong/${ch.id}`}
                onClick={() => setIsOpen(false)}
                className="block p-2 rounded-xl hover:bg-muted transition-colors text-left group"
              >
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-0.5">
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    {ch.story.title}
                  </span>
                  <span className="font-mono text-[10px]">Chương {ch.chapterNumber}</span>
                </div>
                <div className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {ch.title}
                </div>
              </Link>
            ))}
          </div>

          <div className="pt-2 mt-1 border-t border-border/50 text-center">
            <Link
              href="/#moi-cap-nhat"
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-muted-foreground hover:text-primary transition-colors inline-block font-medium"
            >
              Xem tất cả chương mới →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

