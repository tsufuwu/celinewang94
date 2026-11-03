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
        <div className="fixed inset-x-3 top-14 sm:absolute sm:inset-auto sm:right-0 sm:top-11 w-auto sm:w-80 max-w-sm sm:max-w-none mx-auto sm:mx-0 p-3.5 rounded-2xl bg-[#FAF5EE] dark:bg-[#1F1B18] text-[#2B2623] dark:text-[#FAF5EE] border-2 border-[#2B2623] shadow-[3px_5px_0px_#2B2623] z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-2 py-1.5 border-b-2 border-[#2B2623]/20 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-foreground">
              <Sparkles className="size-3.5 text-[#E07B4C]" />
              <span>Chương Mới Cập Nhật</span>
            </div>
            <span className="text-[10px] font-mono text-[#5C5146] dark:text-[#C4B9AD] uppercase font-bold">Hôm nay</span>
          </div>

          <div className="space-y-1">
            {recent.map((ch) => (
              <Link
                key={ch.id}
                href={`/chuong/${ch.id}`}
                onClick={() => setIsOpen(false)}
                className="block p-2 rounded-xl hover:bg-[#E5DDD2] dark:hover:bg-[#2A2420] transition-colors text-left group"
              >
                <div className="flex items-center justify-between text-[11px] text-[#5C5146] dark:text-[#C4B9AD] mb-0.5">
                  <span className="font-bold text-[#E07B4C]">
                    {ch.story.title}
                  </span>
                  <span className="font-mono text-[10px] font-semibold">Chương {ch.chapterNumber}</span>
                </div>
                <div className="text-xs font-serif font-bold text-foreground truncate group-hover:text-[#E07B4C] transition-colors">
                  {ch.title}
                </div>
              </Link>
            ))}
          </div>

          <div className="pt-2 mt-1 border-t-2 border-[#2B2623]/20 text-center">
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

