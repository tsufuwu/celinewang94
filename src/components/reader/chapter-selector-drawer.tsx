"use client";

import * as React from "react";
import Link from "next/link";
import { X, Lock, BookOpen, Check, ArrowRight } from "lucide-react";

export interface ChapterSummaryItem {
  id: string;
  chapterNumber: number;
  title: string;
  password?: string | null;
  wordCount?: number;
}

interface ChapterSelectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  allChapters: ChapterSummaryItem[];
  currentChapterId: string;
  storyTitle: string;
  storySlug?: string;
  onSelectChapter?: (chapterId: string) => void;
}

export function ChapterSelectorDrawer({
  isOpen,
  onClose,
  allChapters,
  currentChapterId,
  storyTitle,
  storySlug,
  onSelectChapter,
}: ChapterSelectorDrawerProps) {
  const activeItemRef = React.useRef<HTMLAnchorElement>(null);
  const listContainerRef = React.useRef<HTMLDivElement>(null);

  // Auto scroll to active chapter when opened
  React.useEffect(() => {
    if (isOpen && activeItemRef.current) {
      setTimeout(() => {
        activeItemRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 150);
    }
  }, [isOpen]);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentChapterIndex = allChapters.findIndex((c) => c.id === currentChapterId);
  const currentChapterNumber =
    currentChapterIndex >= 0 ? allChapters[currentChapterIndex].chapterNumber : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-page-enter">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Retro Pastel Modal Card */}
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-[24px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[4px_6px_0px_#2B2623] z-10 overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[#2B2623]/20 bg-[#F4DFAD]/30 dark:bg-[#2A2420] shrink-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 rounded-[10px] bg-[#E07B4C] text-white border border-[#2B2623]/30">
                <BookOpen className="size-4" />
              </span>
              <div className="min-w-0">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#2B2623] dark:text-[#FAF5EE] truncate">
                  Mục Lục Chương
                </h3>
                <p className="text-xs text-[#5C5146] dark:text-[#C4B9AD] font-mono truncate">
                  {storyTitle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="size-8 rounded-full flex items-center justify-center border-2 border-[#2B2623] bg-[#FAF5EE] hover:bg-[#E5DDD2] text-[#2B2623] dark:bg-[#2A2420] dark:text-[#FAF5EE] transition-all shadow-[1px_2px_0px_#2B2623]"
              title="Đóng bảng chọn chương"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Quick Jump Bar */}
          <div className="flex items-center justify-between text-xs font-mono pt-1 text-[#5C5146] dark:text-[#C4B9AD]">
            <span>
              Đang ở: <strong className="text-[#E07B4C]">Chương {currentChapterNumber}</strong> / {allChapters.length}
            </span>

            {storySlug && (
              <Link
                href={`/truyen/${storySlug}`}
                className="text-[11px] font-bold text-[#E07B4C] hover:underline flex items-center gap-1"
                onClick={onClose}
              >
                <span>Trang giới thiệu</span>
                <ArrowRight className="size-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Chapters List */}
        <div
          ref={listContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-5 divide-y divide-[#2B2623]/10 custom-scrollbar"
        >
          {allChapters.length > 0 ? (
            allChapters.map((ch) => {
              const isActive = ch.id === currentChapterId;
              return (
                <Link
                  key={ch.id}
                  ref={isActive ? activeItemRef : undefined}
                  href={`/chuong/${ch.id}`}
                  onClick={() => {
                    if (onSelectChapter) onSelectChapter(ch.id);
                    onClose();
                  }}
                  className={`py-2.5 px-3 rounded-[12px] flex items-center justify-between transition-all my-1 group ${
                    isActive
                      ? "bg-[#E07B4C]/15 border-2 border-[#E07B4C] text-[#2B2623] dark:text-[#FAF5EE] shadow-[1.5px_2px_0px_#E07B4C]"
                      : "hover:bg-[#E5DDD2]/50 dark:hover:bg-[#2A2420] text-[#2B2623] dark:text-[#FAF5EE] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span
                      className={`font-mono text-xs px-2 py-0.5 rounded-[6px] shrink-0 font-bold border ${
                        isActive
                          ? "bg-[#E07B4C] text-white border-[#2B2623]"
                          : "bg-[#E5DDD2] dark:bg-[#332C27] text-[#5C5146] dark:text-[#C4B9AD] border-[#2B2623]/30"
                      }`}
                    >
                      #{ch.chapterNumber}
                    </span>
                    <span
                      className={`font-serif text-sm truncate font-medium ${
                        isActive
                          ? "font-bold text-[#E07B4C]"
                          : "group-hover:text-[#E07B4C] transition-colors"
                      }`}
                    >
                      {ch.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {ch.password && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-[4px] bg-[#EBBAB5] text-[#2B2623] border border-[#2B2623]/30 font-bold">
                        <Lock className="size-2.5" />
                        <span>Pass</span>
                      </span>
                    )}

                    {isActive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[6px] bg-[#E07B4C] text-white border border-[#2B2623]">
                        <Check className="size-3" />
                        <span className="hidden sm:inline">Đang đọc</span>
                      </span>
                    )}
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="py-10 text-center font-mono text-xs text-[#5C5146] dark:text-[#C4B9AD]">
              Chưa có chương nào trong danh sách.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 sm:px-5 border-t border-[#2B2623]/20 bg-[#FAF5EE] dark:bg-[#1F1B18] flex items-center justify-between text-xs font-mono shrink-0">
          <span className="text-[#5C5146] dark:text-[#C4B9AD]">
            Tổng: <strong>{allChapters.length}</strong> chương
          </span>

          <div className="flex items-center gap-1.5">
            {allChapters.length > 0 && (
              <>
                <Link
                  href={`/chuong/${allChapters[0].id}`}
                  onClick={onClose}
                  className="px-2.5 py-1 rounded-[8px] bg-[#E5DDD2] dark:bg-[#2A2420] text-[#2B2623] dark:text-[#FAF5EE] border border-[#2B2623]/30 hover:border-[#2B2623] font-bold"
                >
                  Đầu (#1)
                </Link>
                <Link
                  href={`/chuong/${allChapters[allChapters.length - 1].id}`}
                  onClick={onClose}
                  className="px-2.5 py-1 rounded-[8px] bg-[#E5DDD2] dark:bg-[#2A2420] text-[#2B2623] dark:text-[#FAF5EE] border border-[#2B2623]/30 hover:border-[#2B2623] font-bold"
                >
                  Cuối (#{allChapters[allChapters.length - 1].chapterNumber})
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

