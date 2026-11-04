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
  isHidden = false,
}: ReadingToolbarProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <aside
      aria-label="Thanh công cụ đọc truyện"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center select-none transition-all duration-300 ${
        isHidden
          ? "translate-y-24 opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      }`}
    >
      {/* Expanded Controls Panel */}
      {isExpanded && (
        <div className="mb-3 p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl w-[92vw] max-w-sm flex flex-col gap-3.5 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header row in panel */}
          <div className="flex items-center justify-between pb-2 border-b border-border/60 text-xs font-medium">
            <span className="font-serif text-foreground">Tùy Chỉnh Đọc Sách</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {/* 1. Font Size */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">Cỡ chữ:</span>
            <div className="flex items-center gap-1.5">
              {[
                { label: "A-", size: 15 },
                { label: "A", size: 17 },
                { label: "A+", size: 19 },
                { label: "A++", size: 22 },
              ].map((item) => (
                <button
                  key={item.size}
                  onClick={() => onUpdateSettings({ fontSize: item.size })}
                  className={`h-7 px-2.5 rounded-lg text-xs font-mono transition-colors ${
                    settings.fontSize === item.size
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Line Spacing */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">Giãn dòng:</span>
            <div className="flex items-center gap-1.5">
              {[
                { id: "compact", label: "Chặt" },
                { id: "normal", label: "Vừa" },
                { id: "loose", label: "Thoáng" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    onUpdateSettings({
                      lineHeight: item.id as ReadingSettings["lineHeight"],
                    })
                  }
                  className={`h-7 px-2.5 rounded-lg text-xs transition-colors ${
                    settings.lineHeight === item.id
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Font Family */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">Phông chữ:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onUpdateSettings({ fontFamily: "serif" })}
                className={`h-7 px-2.5 rounded-lg text-xs font-serif transition-colors ${
                  settings.fontFamily === "serif"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                Serif (Lora)
              </button>
              <button
                onClick={() => onUpdateSettings({ fontFamily: "sans" })}
                className={`h-7 px-2.5 rounded-lg text-xs font-sans transition-colors ${
                  settings.fontFamily === "sans"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                Sans (Hiện đại)
              </button>
            </div>
          </div>

          {/* 4. Reading Tone Mode */}
          <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-border/50">
            <span className="text-muted-foreground">Sắc thái:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onUpdateSettings({ themeMode: "light" })}
                className={`h-7 px-2.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  settings.themeMode === "light"
                    ? "bg-amber-100 text-amber-900 font-medium border border-amber-300 shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
                title="Giao diện sáng giấy linen"
              >
                <Sun className="size-3 text-amber-600" />
                <span>Sáng</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ themeMode: "sepia" })}
                className={`h-7 px-2.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  settings.themeMode === "sepia"
                    ? "bg-[#EFE8DD] text-[#3D332A] font-medium border border-[#D5C6B3] shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
                title="Giao diện vàng ấm dịu mắt"
              >
                <Coffee className="size-3 text-amber-700" />
                <span>Ấm</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ themeMode: "dark" })}
                className={`h-7 px-2.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  settings.themeMode === "dark"
                    ? "bg-stone-800 text-stone-100 font-medium border border-stone-700 shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
                title="Giao diện đêm obsidian"
              >
                <Moon className="size-3 text-amber-300" />
                <span>Tối</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Bar Pill */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-card/90 dark:bg-card/95 backdrop-blur-md border border-border/80 shadow-xl transition-transform hover:scale-102">
        {/* Previous Chapter */}
        {prevChapterId ? (
          <Link href={`/chuong/${prevChapterId}`}>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full text-foreground/80 hover:text-foreground"
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
            className="size-8 rounded-full opacity-30 text-muted-foreground"
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
            className="h-8 px-2 rounded-full text-xs font-mono font-bold flex items-center gap-1 text-foreground hover:text-[#E07B4C]"
            title="Mở mục lục để chọn chương bất kỳ"
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
          className="h-8 px-2.5 rounded-full text-xs flex items-center gap-1.5 text-foreground"
        >
          <Sliders className="size-3.5 text-amber-600 dark:text-amber-400" />
          <span className="hidden sm:inline">Tùy biến</span>
        </Button>

        {/* Focus Mode (Chế độ tập trung) */}
        <Button
          variant={settings.focusMode ? "default" : "ghost"}
          size="icon"
          onClick={() => onUpdateSettings({ focusMode: !settings.focusMode })}
          className="size-8 rounded-full text-foreground"
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
              className="size-8 rounded-full text-foreground/80 hover:text-foreground"
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
            className="size-8 rounded-full opacity-30 text-muted-foreground"
          >
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </aside>
  );
}

