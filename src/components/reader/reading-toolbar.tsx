"use client";

import * as React from "react";
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
  fontFamily: "serif" | "sans";
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
  isHidden?: boolean;
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
  const [isExpanded, setIsExpanded] = React.useState(false);
  const containerRef = React.useRef<HTMLElement | null>(null);

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

  return (
    <aside
      ref={containerRef}
      aria-label="Thanh công cụ đọc truyện"
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end select-none transition-all duration-300"
    >
      {/* Expanded Controls Panel */}
      {isExpanded && (
        <div className="mb-3 p-4 sm:p-5 rounded-[20px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[4px_6px_0px_#2B2623] w-[88vw] max-w-sm flex flex-col gap-3.5 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header row in panel */}
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#2B2623]/15 text-xs font-medium">
            <span className="font-serif font-bold text-sm text-[#2B2623] dark:text-[#FAF5EE] flex items-center gap-1.5">
              <Sliders className="size-3.5 text-[#E07B4C]" />
              <span>Tùy Chỉnh Đọc Sách</span>
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
          <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-[#2B2623]/10">
            <span className="text-[#5C5146] dark:text-[#C4B9AD] font-mono">Font chữ:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onUpdateSettings({ fontFamily: "serif" })}
                className={`h-7 px-2.5 rounded-lg text-xs font-serif transition-all border ${
                  settings.fontFamily === "serif"
                    ? "bg-[#BDCEAF] text-[#2B2623] border-[#2B2623] font-bold shadow-[1px_1.5px_0px_#2B2623]"
                    : "bg-[#E5DDD2] dark:bg-[#2A2420] text-[#5C5146] dark:text-[#C4B9AD] border-transparent"
                }`}
              >
                Alegreya
              </button>
              <button
                onClick={() => onUpdateSettings({ fontFamily: "sans" })}
                className={`h-7 px-2.5 rounded-lg text-xs font-sans transition-all border ${
                  settings.fontFamily === "sans"
                    ? "bg-[#BDCEAF] text-[#2B2623] border-[#2B2623] font-bold shadow-[1px_1.5px_0px_#2B2623]"
                    : "bg-[#E5DDD2] dark:bg-[#2A2420] text-[#5C5146] dark:text-[#C4B9AD] border-transparent"
                }`}
              >
                Không chân
              </button>
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
                title="Giao diện sáng giấy ấm"
              >
                <Sun className="size-3 text-[#E07B4C]" />
                <span>Sáng</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ themeMode: "sepia" })}
                className={`h-7 px-2.5 rounded-lg text-xs flex items-center gap-1 transition-all border ${
                  settings.themeMode === "sepia"
                    ? "bg-[#F4DFAD] text-[#3D332A] border-[#2B2623] font-bold shadow-[1px_1.5px_0px_#2B2623]"
                    : "bg-[#E5DDD2] dark:bg-[#2A2420] text-[#5C5146] border-transparent"
                }`}
                title="Giao diện vàng ấm Sepia dịu mắt"
              >
                <Coffee className="size-3 text-amber-700" />
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

          {/* 5. Focus Zen Mode & Chapter Quick Navigator */}
          <div className="pt-2 border-t border-[#2B2623]/10 flex items-center justify-between gap-2 flex-wrap">
            <button
              onClick={() => onUpdateSettings({ focusMode: !settings.focusMode })}
              className={`h-8 px-3 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] transition-all ${
                settings.focusMode
                  ? "bg-[#EBBAB5] text-[#2B2623]"
                  : "bg-[#FAF5EE] dark:bg-[#2A2420] text-[#2B2623] dark:text-[#FAF5EE]"
              }`}
            >
              {settings.focusMode ? <Minimize2 className="size-3 text-rose-700" /> : <Maximize2 className="size-3" />}
              <span>{settings.focusMode ? "Thoát Zen Mode" : "Đọc tập trung"}</span>
            </button>

            <div className="flex items-center gap-1.5">
              {prevChapterId && (
                <Link href={`/chuong/${prevChapterId}`} onClick={() => setIsExpanded(false)}>
                  <button
                    type="button"
                    className="h-8 px-2 rounded-xl text-xs border-2 border-[#2B2623] bg-[#FAF5EE] dark:bg-[#2A2420] flex items-center justify-center hover:bg-[#E5DDD2] transition-colors"
                    title="Chương trước"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                </Link>
              )}

              {onOpenChapterSelector && (
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    onOpenChapterSelector();
                  }}
                  className="h-8 px-3 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border-2 border-[#2B2623] bg-[#FAF5EE] dark:bg-[#2A2420] text-[#2B2623] dark:text-[#FAF5EE] shadow-[1.5px_2px_0px_#2B2623] hover:text-[#E07B4C] transition-all"
                >
                  <ListOrdered className="size-3.5 text-[#E07B4C]" />
                  <span>Mục lục</span>
                </button>
              )}

              {nextChapterId && (
                <Link href={`/chuong/${nextChapterId}`} onClick={() => setIsExpanded(false)}>
                  <button
                    type="button"
                    className="h-8 px-2 rounded-xl text-xs border-2 border-[#2B2623] bg-[#FAF5EE] dark:bg-[#2A2420] flex items-center justify-center hover:bg-[#E5DDD2] transition-colors"
                    title="Chương sau"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compact Floating Trigger Pill Docked in Corner */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="h-10 px-3.5 rounded-full bg-[#FAF5EE] dark:bg-[#25201C] border-2 border-[#2B2623] shadow-[2.5px_3.5px_0px_#2B2623] hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[1.5px] active:translate-y-[2px] active:shadow-none flex items-center gap-2 cursor-pointer transition-all text-[#2B2623] dark:text-[#FAF5EE] select-none"
        title="Bấm để mở bảng tùy biến cỡ chữ, màu nền, font và mục lục"
      >
        <Sliders className={`size-4 text-[#E07B4C] transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        <span className="font-mono font-bold text-xs">Tùy biến</span>
        {currentChapterNumber && (
          <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-[#E5DDD2] dark:bg-[#3D352E] text-[#5C5146] dark:text-[#C4B9AD] font-semibold">
            #{currentChapterNumber}
          </span>
        )}
      </button>
    </aside>
  );
}
