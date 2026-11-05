"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Sun,
  Moon,
  Coffee,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Sliders,
  X,
  ListOrdered,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ReadingSettings {
  fontSize: number; // e.g. 15, 17, 19, 22
  lineHeight: "compact" | "normal" | "loose";
  fontFamily: "lora" | "alegreya" | "arial" | "futura" | "sans" | "serif";
  themeMode: "light" | "sepia" | "dark";
  focusMode: boolean;
}

interface ReadingToolbarProps {
  settings: ReadingSettings;
  onUpdateSettings: (newSettings: Partial<ReadingSettings>) => void;
  prevChapterId?: string | null;
  nextChapterId?: string | null;
  currentChapterNumber?: number;
  totalChapters?: number;
  onOpenChapterSelector?: () => void;
}

export function ReadingToolbar({
  settings,
  onUpdateSettings,
  prevChapterId,
  nextChapterId,
  currentChapterNumber,
  totalChapters,
  onOpenChapterSelector,
}: ReadingToolbarProps) {
  const [mounted, setMounted] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const containerRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Close panel when clicking outside
  React.useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  if (!mounted) return null;

  const content = (
    <aside
      ref={containerRef}
      aria-label="Thanh công cụ đọc truyện"
      className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end select-none pointer-events-auto transition-all duration-300"
    >
      {/* Expanded Controls Panel */}
      {isExpanded && (
        <div className="mb-3 p-4 sm:p-5 rounded-[20px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[4px_6px_0px_#2B2623] w-[88vw] max-w-sm flex flex-col gap-3.5 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header row in panel */}
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#2B2623]/15 text-xs font-medium">
            <span className="font-serif font-bold text-sm text-[#2B2623] dark:text-[#FAF5EE] flex items-center gap-1.5">
              <Sliders className="size-3.5 text-[#E07B4C]" />
              <span>Tùy chỉnh</span>
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-md text-[#5C5146] hover:text-[#2B2623] dark:text-[#C4B9AD] hover:bg-[#E5DDD2] transition-colors"
              title="Đóng bảng tùy chỉnh"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* 1. Font Size Controller */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-[#5C5146] dark:text-[#C4B9AD] font-mono">Cỡ chữ:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateSettings({ fontSize: Math.max(14, settings.fontSize - 1) })}
                className="size-8 rounded-lg text-xs font-mono font-bold border border-[#2B2623]/30"
                title="Giảm cỡ chữ"
              >
                A-
              </Button>
              <span className="font-mono text-xs w-9 text-center font-bold text-[#E07B4C]">
                {settings.fontSize}px
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateSettings({ fontSize: Math.min(26, settings.fontSize + 1) })}
                className="size-8 rounded-lg text-xs font-mono font-bold border border-[#2B2623]/30"
                title="Tăng cỡ chữ"
              >
                A+
              </Button>
            </div>
          </div>

          {/* 2. Line Height Controller */}
          <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-[#2B2623]/10">
            <span className="text-[#5C5146] dark:text-[#C4B9AD] font-mono">Dãn dòng:</span>
            <div className="flex items-center gap-1">
              {(["compact", "normal", "loose"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onUpdateSettings({ lineHeight: mode })}
                  className={`h-7 px-2.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                    settings.lineHeight === mode
                      ? "bg-[#E07B4C] text-white border-[#2B2623] shadow-[1px_1.5px_0px_#2B2623]"
                      : "bg-[#E5DDD2] dark:bg-[#2A2420] text-[#5C5146] dark:text-[#C4B9AD] border-transparent hover:text-[#2B2623]"
                  }`}
                >
                  {mode === "compact" ? "Gọn" : mode === "normal" ? "Vừa" : "Thoáng"}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Font Family Selector */}
          <div className="flex flex-col gap-1.5 text-xs pt-2 border-t border-[#2B2623]/10">
            <span className="text-[#5C5146] dark:text-[#C4B9AD] font-mono text-[11px]">Font chữ:</span>
            <div className="grid grid-cols-5 gap-1">
              {[
                { id: "lora", label: "Lora", fontClass: "font-reader-lora" },
                { id: "alegreya", label: "Alegreya", fontClass: "font-reader-alegreya" },
                { id: "arial", label: "Arial", fontClass: "font-reader-arial" },
                { id: "futura", label: "Futura", fontClass: "font-reader-futura" },
                { id: "sans", label: "Sans", fontClass: "font-reader-sans" },
              ].map((f) => {
                const isActive =
                  settings.fontFamily === f.id ||
                  (f.id === "lora" && settings.fontFamily === "serif");
                return (
                  <button
                    key={f.id}
                    onClick={() => onUpdateSettings({ fontFamily: f.id as ReadingSettings["fontFamily"] })}
                    className={`h-7 px-1 rounded-lg text-xs transition-all border text-center truncate ${f.fontClass} ${
                      isActive
                        ? "bg-[#BDCEAF] text-[#2B2623] border-[#2B2623] font-bold shadow-[1px_1.5px_0px_#2B2623]"
                        : "bg-[#E5DDD2] dark:bg-[#2A2420] text-[#5C5146] dark:text-[#C4B9AD] border-transparent hover:text-[#2B2623]"
                    }`}
                    title={`Chọn font ${f.label}`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Reading Tone Mode */}
          <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-[#2B2623]/10">
            <span className="text-[#5C5146] dark:text-[#C4B9AD] font-mono">Màu nền:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onUpdateSettings({ themeMode: "light" })}
                className={`h-7 px-2.5 rounded-lg text-xs flex items-center gap-1 transition-all border ${
                  settings.themeMode === "light"
                    ? "bg-[#FAF5EE] text-[#2B2623] border-[#2B2623] font-bold shadow-[1px_1.5px_0px_#2B2623]"
                    : "bg-[#E5DDD2] dark:bg-[#2A2420] text-[#5C5146] border-transparent"
                }`}
                title="Giao diện sáng giấy mềm"
              >
                <Sun className="size-3 text-[#E07B4C]" />
                <span>Sáng</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ themeMode: "sepia" })}
                className={`h-7 px-2.5 rounded-lg text-xs flex items-center gap-1 transition-all border ${
                  settings.themeMode === "sepia"
                    ? "bg-[#F4E8D1] text-[#382B21] border-[#2B2623] font-bold shadow-[1px_1.5px_0px_#2B2623]"
                    : "bg-[#E5DDD2] dark:bg-[#2A2420] text-[#5C5146] border-transparent"
                }`}
                title="Giao diện vàng ấm dịu mắt"
              >
                <Coffee className="size-3 text-amber-800" />
                <span>Ấm</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ themeMode: "dark" })}
                className={`h-7 px-2.5 rounded-lg text-xs flex items-center gap-1 transition-all border ${
                  settings.themeMode === "dark"
                    ? "bg-[#25201C] text-[#FAF5EE] border-[#2B2623] font-bold shadow-[1px_1.5px_0px_#2B2623]"
                    : "bg-[#E5DDD2] dark:bg-[#2A2420] text-[#5C5146] border-transparent"
                }`}
                title="Giao diện đêm tối"
              >
                <Moon className="size-3 text-amber-300" />
                <span>Tối</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Bar Pill Always Visible on Screen */}
      <div className="flex items-center gap-1 p-1 rounded-full bg-[#FAF5EE] dark:bg-[#25201C] border-2 border-[#2B2623] shadow-[3px_4px_0px_#2B2623] transition-transform hover:scale-102">
        {/* Previous Chapter */}
        {prevChapterId ? (
          <Link href={`/chuong/${prevChapterId}`}>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full text-[#2B2623] dark:text-[#FAF5EE] hover:bg-[#E5DDD2] cursor-pointer"
              title="Chương trước"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </Link>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            disabled
            className="size-8 rounded-full opacity-30 text-[#5C5146]"
          >
            <ChevronLeft className="size-4" />
          </Button>
        )}

        {/* Chapter Quick Selector Trigger */}
        {onOpenChapterSelector && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenChapterSelector}
            className="h-8 px-2.5 rounded-full text-xs font-mono font-bold flex items-center gap-1 text-[#2B2623] dark:text-[#FAF5EE] hover:text-[#E07B4C] hover:bg-[#E5DDD2] cursor-pointer"
            title="Mở mục lục chọn chương"
          >
            <ListOrdered className="size-3.5 text-[#E07B4C]" />
            <span>
              {currentChapterNumber ? `${currentChapterNumber}/${totalChapters || "?"}` : "Mục lục"}
            </span>
          </Button>
        )}

        {/* Toggle Reading Settings Panel */}
        <Button
          variant={isExpanded ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setIsExpanded((prev) => !prev)}
          className={`h-8 px-2.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer ${
            isExpanded
              ? "bg-[#E07B4C] text-white hover:bg-[#DC7648]"
              : "text-[#2B2623] dark:text-[#FAF5EE] hover:bg-[#E5DDD2]"
          }`}
          title="Tùy chỉnh cỡ chữ, font và giao diện đọc"
        >
          <Sliders className="size-3.5 text-[#E07B4C]" />
          <span>Tùy biến</span>
        </Button>

        {/* Focus Zen Mode */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onUpdateSettings({ focusMode: !settings.focusMode })}
          className="size-8 rounded-full text-[#2B2623] dark:text-[#FAF5EE] hover:bg-[#E5DDD2] cursor-pointer"
          title={settings.focusMode ? "Tắt chế độ tập trung" : "Chế độ đọc tập trung (Zen Mode)"}
        >
          {settings.focusMode ? (
            <Minimize2 className="size-3.5 text-rose-500" />
          ) : (
            <Maximize2 className="size-3.5" />
          )}
        </Button>

        {/* Next Chapter */}
        {nextChapterId ? (
          <Link href={`/chuong/${nextChapterId}`}>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full text-[#2B2623] dark:text-[#FAF5EE] hover:bg-[#E5DDD2] cursor-pointer"
              title="Chương sau"
            >
              <ChevronRight className="size-4" />
            </Button>
          </Link>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            disabled
            className="size-8 rounded-full opacity-30 text-[#5C5146]"
          >
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </aside>
  );

  return createPortal(content, document.body);
}
