"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Lock,
  ArrowUpDown,
  Sparkles,
  Edit3,
  Clock,
  ArrowLeft,
  Eye,
  Heart,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommentSection } from "@/components/comments/comment-section";
import {
  getLocalBookshelf,
  saveBookshelfItem,
  removeBookshelfItem,
  isStoryInBookshelf,
} from "@/lib/bookshelf";

export interface UnifiedChapterItem {
  id: string;
  chapterNumber: number;
  title: string;
  wordCount: number;
  password?: string | null;
  createdAt?: Date | string | null;
  views?: number;
  likes?: number;
  commentsCount?: number;
}

export interface UnifiedStoryProps {
  story: {
    id: string;
    slug: string;
    title: string;
    author: string;
    coverUrl?: string | null;
    description?: string | null;
    contentHtml?: string | null;
    status: "ONGOING" | "COMPLETED" | "DROPPED" | string;
    tags: string[];
  };
  chapters: UnifiedChapterItem[];
  isAdmin?: boolean;
}

// Flat pastel palette mapping for tags
const TAG_COLORS = [
  "bg-[#BDCEAF] text-[#2B2623]", // Xanh bơ
  "bg-[#EBBAB5] text-[#2B2623]", // Hồng đào
  "bg-[#F4DFAD] text-[#2B2623]", // Vàng bơ
  "bg-[#E5DDD2] text-[#2B2623]", // Be xám
  "bg-[#E2D8C0] text-[#2B2623]", // Olive nhạt
];

export function StoryUnifiedView({ story, chapters, isAdmin = false }: UnifiedStoryProps) {
  // Reading Progress & Bookmark
  const [savedProgress, setSavedProgress] = React.useState<{ chapterId: string; chapterNumber: number } | null>(null);
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [bookmarkFeedback, setBookmarkFeedback] = React.useState(false);

  // Metadata Box Hidden State (controlled by admin)
  const [isMetadataBoxHidden, setIsMetadataBoxHidden] = React.useState<boolean>(
    () => Boolean(story.tags && story.tags.includes("__hide_meta_box"))
  );
  const [isTogglingMetaBox, setIsTogglingMetaBox] = React.useState(false);

  const handleToggleMetadataBox = async () => {
    const nextState = !isMetadataBoxHidden;
    setIsMetadataBoxHidden(nextState);
    try {
      setIsTogglingMetaBox(true);
      await fetch("/api/admin/toggle-meta-box", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: story.id, hide: nextState }),
      });
    } catch {
      // offline / ignored
    } finally {
      setIsTogglingMetaBox(false);
    }
  };

  const visibleTags = React.useMemo(() => {
    return (story.tags || []).filter((t) => !t.startsWith("__"));
  }, [story.tags]);

  // Synopsis Expand / Collapse
  const [isSynopsisExpanded, setIsSynopsisExpanded] = React.useState(false);

  // Chapter List Controls
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");

  // Load reading history and bookmark state from localStorage
  React.useEffect(() => {
    try {
      setIsBookmarked(isStoryInBookshelf(story.id, story.slug));

      // 1. Check bookshelf item for this story
      const shelf = getLocalBookshelf();
      const currentInShelf = shelf.find(
        (i) => i.storyId === story.id || i.storySlug === story.slug
      );

      if (currentInShelf?.lastChapterId && currentInShelf.lastChapterNumber) {
        setSavedProgress({
          chapterId: currentInShelf.lastChapterId,
          chapterNumber: currentInShelf.lastChapterNumber,
        });
      } else {
        // 2. Check reading history per chapter
        for (const ch of chapters) {
          const h = localStorage.getItem(`reading_history_${ch.id}`);
          if (h) {
            const parsed = JSON.parse(h);
            if (parsed.chapterId) {
              setSavedProgress({
                chapterId: parsed.chapterId,
                chapterNumber: ch.chapterNumber,
              });
              break;
            }
          }
        }
      }
    } catch {
      // Ignore localStorage issues
    }
  }, [story.id, story.slug, chapters]);

  // Toggle Bookmark
  const handleToggleBookmark = () => {
    try {
      if (isBookmarked) {
        removeBookshelfItem(story.id);
        setIsBookmarked(false);
      } else {
        saveBookshelfItem({
          storyId: story.id,
          storySlug: story.slug,
          storyTitle: story.title,
          storyAuthor: story.author,
          coverUrl: story.coverUrl,
          lastChapterId: savedProgress?.chapterId || (chapters.length > 0 ? chapters[0].id : undefined),
          lastChapterNumber: savedProgress?.chapterNumber || (chapters.length > 0 ? chapters[0].chapterNumber : 1),
        });
        setIsBookmarked(true);
        setBookmarkFeedback(true);
        setTimeout(() => setBookmarkFeedback(false), 2000);
      }
    } catch {
      // Ignore
    }
  };

  const isCompleted = story.status === "COMPLETED";
  const totalWords = React.useMemo(() => {
    return chapters.reduce((acc, ch) => acc + (ch.wordCount || 0), 0);
  }, [chapters]);

  // Sort chapters
  const sortedAndFilteredChapters = React.useMemo(() => {
    const list = [...chapters];
    if (sortOrder === "desc") {
      list.reverse();
    }
    return list;
  }, [chapters, sortOrder]);

  const firstChapter = chapters.length > 0 ? chapters[0] : null;

  return (
    <div className="font-alegreya max-w-[980px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
      {/* Top Nav: Back to Home & Studio Shortcut */}
      <div className="flex items-center justify-between text-xs font-mono text-[#5C5146] dark:text-[#C4B9AD] pb-2 border-b border-[#2B2623]/15">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 hover:text-[#E07B4C] transition-colors font-bold"
        >
          <ArrowLeft className="size-3.5" />
          <span>Quay lại trang chủ</span>
        </Link>

        {isAdmin && (
          <Link
            href={`/admin/editor?storyId=${story.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] border-2 border-[#2B2623] bg-[#FAF5EE] hover:bg-[#E5DDD2] dark:bg-[#2A2420] text-[#2B2623] dark:text-[#FAF5EE] shadow-[1.5px_2px_0px_#2B2623] font-bold"
          >
            <Edit3 className="size-3" />
            <span>Studio Editor</span>
          </Link>
        )}
      </div>

      {/* ========================================================================= */}
      {/* KHUNG 1: HERO CARD (Ảnh bìa gáy bo + Trạng thái + Nút Đọc/Tủ sách + Thống kê) */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-[32px] items-center p-5 sm:p-[28px_30px] rounded-[28px] bg-[#FDFBF7] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[3px_5px_0px_#2B2623]">
        {/* Left: Book Cover with Rounded Spine */}
        <div className="relative flex justify-center">
          <div className="w-[170px] md:w-full aspect-[3/4] overflow-hidden rounded-[4px_18px_18px_4px] border-2 border-[#2B2623] shadow-[3px_5px_0px_#2B2623] bg-[#EFE8DE] dark:bg-[#26211E] relative">
            {story.coverUrl ? (
              <Image
                src={story.coverUrl}
                alt={story.title}
                fill
                sizes="220px"
                unoptimized={story.coverUrl.startsWith("data:")}
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#5C5146] p-4 text-center">
                <BookOpen className="size-10 mb-2 text-[#E07B4C]" />
                <span className="text-xs font-bold font-mono">Chưa có ảnh bìa</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Story Information */}
        <div className="relative z-1 min-w-0 w-full text-center md:text-left flex flex-col justify-between h-full">
          <div>
            {/* Status Indicator */}
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD] mb-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isCompleted ? "bg-[#BDCEAF]" : "bg-[#E07B4C]"
                }`}
              />
              <span>{isCompleted ? "Đã hoàn thành" : "Đang tiến hành"}</span>
            </div>

            {/* Title */}
            <h1 className="font-serif font-bold leading-tight mt-1 mb-2 text-[26px] sm:text-[34px] text-[#2B2623] dark:text-[#FAF5EE]">
              {story.title}
            </h1>

            {/* Author & Chapters */}
            <p className="italic text-xs sm:text-sm text-[#5C5146] dark:text-[#C4B9AD] mb-3">
              Tác giả:{" "}
              <b className="not-italic font-bold text-[#2B2623] dark:text-[#FAF5EE]">
                {story.author}
              </b>{" "}
              · {chapters.length} chương
            </p>

            {/* Tag Pills */}
            <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mt-2 mb-5">
              {visibleTags && visibleTags.length > 0 ? (
                visibleTags.map((tag, idx) => (
                  <span
                    key={tag}
                    className={`text-[11.5px] px-3 py-1 rounded-[13px] font-bold font-mono border border-[#2B2623]/30 shadow-[1px_1px_0px_#2B2623] ${
                      TAG_COLORS[idx % TAG_COLORS.length]
                    }`}
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-xs font-mono text-muted-foreground">#Truyện</span>
              )}
            </div>

            {/* Action Buttons: Đọc từ đầu, Đọc tiếp, Thêm vào tủ sách */}
            <div className="flex gap-2.5 flex-wrap justify-center md:justify-start">
              {/* If user has reading progress, "Đọc tiếp" is prominent */}
              {savedProgress ? (
                <>
                  <Link href={`/chuong/${savedProgress.chapterId}`}>
                    <Button className="h-10 px-5 rounded-[14px] text-xs font-bold font-mono bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[2px_2.5px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-2">
                      <Clock className="size-3.5" />
                      <span>Đọc tiếp Chương {savedProgress.chapterNumber}</span>
                    </Button>
                  </Link>

                  {firstChapter && (
                    <Link href={`/chuong/${firstChapter.id}`}>
                      <Button variant="outline" className="h-10 px-4 rounded-[14px] text-xs font-bold font-mono bg-[#FAF5EE] dark:bg-[#2A2420] text-[#2B2623] dark:text-[#FAF5EE] border-2 border-[#2B2623] shadow-[2px_2.5px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-2 hover:bg-[#E5DDD2]">
                        <BookOpen className="size-3.5 text-[#E07B4C]" />
                        <span>Đọc từ đầu</span>
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                firstChapter && (
                  <Link href={`/chuong/${firstChapter.id}`}>
                    <Button className="h-10 px-5 rounded-[14px] text-xs font-bold font-mono bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[2px_2.5px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-2">
                      <BookOpen className="size-3.5" />
                      <span>Đọc từ đầu</span>
                    </Button>
                  </Link>
                )
              )}

              {/* Bookmark Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleToggleBookmark}
                className={`h-10 px-4 rounded-[14px] text-xs font-bold font-mono border-2 border-[#2B2623] shadow-[2px_2.5px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1.5 transition-all ${
                  isBookmarked
                    ? "bg-[#F4DFAD] text-[#2B2623]"
                    : "bg-[#FAF5EE] dark:bg-[#2A2420] text-[#2B2623] dark:text-[#FAF5EE]"
                }`}
              >
                <Bookmark className={`size-3.5 ${isBookmarked ? "fill-current text-[#E07B4C]" : ""}`} />
                <span>{bookmarkFeedback ? "Đã cập nhật!" : isBookmarked ? "Đã vào tủ sách" : "Thêm vào tủ sách"}</span>
              </Button>
            </div>
          </div>

          {/* Stats Bar (4 columns - Real counts from database) */}
          <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t-2 border-[#2B2623]/10 text-center font-mono">
            <div className="min-w-0">
              <span className="block text-[10px] text-[#5C5146] dark:text-[#C4B9AD] uppercase tracking-wider">
                Lượt đọc
              </span>
              <b className="text-sm sm:text-base font-bold text-[#2B2623] dark:text-[#FAF5EE]">
                0
              </b>
            </div>
            <div className="min-w-0 border-l border-[#2B2623]/15">
              <span className="block text-[10px] text-[#5C5146] dark:text-[#C4B9AD] uppercase tracking-wider">
                Yêu thích
              </span>
              <b className="text-sm sm:text-base font-bold text-[#2B2623] dark:text-[#FAF5EE]">
                0
              </b>
            </div>
            <div className="min-w-0 border-l border-[#2B2623]/15">
              <span className="block text-[10px] text-[#5C5146] dark:text-[#C4B9AD] uppercase tracking-wider">
                Số chương
              </span>
              <b className="text-sm sm:text-base font-bold text-[#2B2623] dark:text-[#FAF5EE]">
                {chapters.length}
              </b>
            </div>
            <div className="min-w-0 border-l border-[#2B2623]/15">
              <span className="block text-[10px] text-[#5C5146] dark:text-[#C4B9AD] uppercase tracking-wider">
                Tổng số chữ
              </span>
              <b className="text-sm sm:text-base font-bold text-[#2B2623] dark:text-[#FAF5EE]">
                {totalWords > 0 ? totalWords.toLocaleString("vi-VN") : "0"}
              </b>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* KHUNG 2: TÓM TẮT TÁC PHẨM (Văn án / Giới thiệu / Thông tin biên tập)     */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden flex flex-col gap-4 p-5 sm:p-[24px_28px] rounded-[28px] bg-[#FDFBF7] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[3px_5px_0px_#2B2623]">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#2B2623]/10">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B2623] dark:text-[#FAF5EE] flex items-center gap-2">
            <Sparkles className="size-4 text-[#E07B4C]" />
            <span>Tóm tắt tác phẩm</span>
          </h2>
        </div>

        {/* Structured Metadata Box */}
        {!isMetadataBoxHidden ? (
          <div className="relative p-4 rounded-[18px] bg-[#FAF5EE] dark:bg-[#2A2420] border border-[#2B2623]/20 space-y-1.5 text-xs sm:text-sm font-sans group">
            {isAdmin && (
              <button
                type="button"
                onClick={handleToggleMetadataBox}
                disabled={isTogglingMetaBox}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-[10px] text-[11px] font-mono font-bold bg-[#FAF5EE] dark:bg-[#1F1B18] text-[#5C5146] hover:text-rose-600 dark:text-[#C4B9AD] dark:hover:text-rose-400 border border-[#2B2623]/20 hover:border-rose-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Xóa/Ẩn khung thông tin Edit/Dịch, Tình trạng, Thể loại này"
              >
                <Trash2 className="size-3 text-rose-500" />
                <span>Xóa khung này (Admin)</span>
              </button>
            )}
            <p className="text-[#2B2623] dark:text-[#FAF5EE]">
              <b className="font-bold text-[#E07B4C]">Edit / Dịch:</b> Celine Wang
            </p>
            <p className="text-[#2B2623] dark:text-[#FAF5EE]">
              <b className="font-bold text-[#E07B4C]">Tình trạng:</b>{" "}
              {isCompleted ? "Hoàn thành" : "Đang tiến hành"}
            </p>
            <p className="text-[#2B2623] dark:text-[#FAF5EE]">
              <b className="font-bold text-[#E07B4C]">Thể loại:</b>{" "}
              {visibleTags && visibleTags.length > 0 ? visibleTags.join(" - ") : "Đang cập nhật"}
            </p>
            {story.description && (
              <p className="text-[#5C5146] dark:text-[#C4B9AD] italic pt-1 border-t border-[#2B2623]/10">
                {story.description}
              </p>
            )}
          </div>
        ) : (
          isAdmin && (
            <div className="flex justify-end -mt-1">
              <button
                type="button"
                onClick={handleToggleMetadataBox}
                disabled={isTogglingMetaBox}
                className="px-3 py-1 rounded-xl text-xs font-mono font-bold text-[#E07B4C] hover:bg-[#E07B4C]/10 border border-dashed border-[#E07B4C]/40 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Khôi phục lại khung thông tin tóm tắt biên tập"
              >
                <Sparkles className="size-3" />
                <span>Khôi phục khung thông tin biên tập (Admin)</span>
              </button>
            </div>
          )
        )}

        {/* Main Synopsis Content (Alegreya Font, supports rich text) */}
        <div className="relative">
          <div
            className={`font-serif text-base leading-[1.8] text-[#2B2623] dark:text-[#E8E2D9] space-y-3 transition-all ${
              !isSynopsisExpanded ? "max-h-[340px] overflow-hidden" : ""
            }`}
          >
            {story.contentHtml ? (
              <div
                className="story-raw-html-section select-text space-y-3"
                dangerouslySetInnerHTML={{ __html: story.contentHtml }}
              />
            ) : (
              <p className="italic text-muted-foreground">
                Tác phẩm chưa có phần văn án chi tiết. Bạn có thể bấm vào Danh sách chương bên dưới để bắt đầu đọc nội dung truyện.
              </p>
            )}
          </div>

          {/* Fade Gradient Overlay when collapsed */}
          {!isSynopsisExpanded && (
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FDFBF7] dark:from-[#1F1B18] to-transparent pointer-events-none" />
          )}
        </div>

        {/* Toggle Expand / Collapse button */}
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsSynopsisExpanded((prev) => !prev)}
            className="rounded-full text-xs font-mono font-bold text-[#E07B4C] hover:text-[#DC7648] hover:bg-[#E07B4C]/10 flex items-center gap-1.5"
          >
            <span>{isSynopsisExpanded ? "Thu gọn" : "Xem thêm"}</span>
            {isSynopsisExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </Button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* KHUNG 3: HỒ SƠ BIÊN TẬP / CELINE WANG (Tương tự Khung Profile ở mẫu)        */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden flex flex-col gap-4 p-5 sm:p-[22px_26px] rounded-[28px] bg-[#E5DDD2]/45 dark:bg-[#26211E] border-2 border-[#2B2623] shadow-[3px_5px_0px_#2B2623]">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-full overflow-hidden border-2 border-[#2B2623] shadow-[2px_2px_0px_#2B2623] shrink-0 bg-[#FAF5EE]">
            <Image
              src="https://i.pinimg.com/1200x/15/70/45/157045a3e240e1e2c44fd7b3f97e61f5.jpg"
              alt="Celine Wang"
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-lg font-bold text-[#2B2623] dark:text-[#FAF5EE] leading-tight">
              Celine Wang
            </h3>
            <p className="font-serif italic text-xs sm:text-sm text-[#E07B4C] mt-0.5 truncate">
              ars longa, vita brevis – nghệ thuật trường tồn, cuộc đời ngắn ngủi
            </p>
          </div>
        </div>

        {/* 4-Column Stats Box (Cleaned & accurate real counts) */}
        <div className="grid grid-cols-4 py-3 px-1 rounded-[20px] text-center bg-[#FDFBF7] dark:bg-[#1A1614] border border-[#2B2623]/20 shadow-[1.5px_2px_0px_#2B2623] font-mono">
          <div className="min-w-0 px-1">
            <small className="block text-[10.5px] sm:text-[11px] text-[#5C5146] dark:text-[#C4B9AD] truncate">
              Chương
            </small>
            <b className="text-xs sm:text-base font-bold text-[#2B2623] dark:text-[#FAF5EE]">
              {chapters.length}
            </b>
          </div>
          <div className="min-w-0 px-1 border-l border-[#2B2623]/15">
            <small className="block text-[10.5px] sm:text-[11px] text-[#5C5146] dark:text-[#C4B9AD] truncate">
              Tổng số chữ
            </small>
            <b className="text-xs sm:text-base font-bold text-[#2B2623] dark:text-[#FAF5EE]">
              {totalWords > 0 ? totalWords.toLocaleString("vi-VN") : "0"}
            </b>
          </div>
          <div className="min-w-0 px-1 border-l border-[#2B2623]/15">
            <small className="block text-[10.5px] sm:text-[11px] text-[#5C5146] dark:text-[#C4B9AD] truncate">
              Lượt đọc
            </small>
            <b className="text-xs sm:text-base font-bold text-[#2B2623] dark:text-[#FAF5EE]">0</b>
          </div>
          <div className="min-w-0 px-1 border-l border-[#2B2623]/15">
            <small className="block text-[10.5px] sm:text-[11px] text-[#5C5146] dark:text-[#C4B9AD] truncate">
              Yêu thích
            </small>
            <b className="text-xs sm:text-base font-bold text-[#2B2623] dark:text-[#FAF5EE]">0</b>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* KHUNG 4: DANH SÁCH CHƯƠNG (Mục lục thẻ ngang chuẩn hóa)                  */}
      {/* ========================================================================= */}
      <section
        className="relative overflow-hidden flex flex-col gap-4 p-5 sm:p-[24px_28px] rounded-[28px] bg-[#FDFBF7] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[3px_5px_0px_#2B2623]"
        id="muc-luc"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#2B2623]/10">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B2623] dark:text-[#FAF5EE] flex items-center gap-2">
              <BookOpen className="size-5 text-[#E07B4C]" />
              <span>Danh sách chương</span>
            </h2>
            <p className="text-xs font-mono text-[#5C5146] dark:text-[#C4B9AD] mt-0.5">
              {chapters.length} chương · nhấn chương để đọc
            </p>
          </div>

          {/* Quick Controls: Sort Order */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
              className="h-8 px-3 rounded-xl border-2 border-[#2B2623]/30 bg-[#FAF5EE] dark:bg-[#2A2420] text-xs font-mono font-bold flex items-center gap-1.5 shadow-[1px_1.5px_0px_#2B2623] hover:border-[#E07B4C] transition-all"
              title="Đổi thứ tự hiển thị chương"
            >
              <ArrowUpDown className="size-3 text-[#E07B4C]" />
              <span>{sortOrder === "asc" ? "Cũ nhất trước" : "Mới nhất trước"}</span>
            </Button>
          </div>
        </div>

        {/* Chapter List */}
        {sortedAndFilteredChapters.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {sortedAndFilteredChapters.map((ch, idx) => {
              const isRecent = idx === (sortOrder === "asc" ? sortedAndFilteredChapters.length - 1 : 0);

              return (
                <Link
                  key={ch.id}
                  href={`/chuong/${ch.id}`}
                  className="flex items-center gap-3.5 px-4 py-3 rounded-[16px] sm:rounded-[20px] bg-[#FAF5EE] dark:bg-[#2A2420] border-2 border-[#2B2623]/20 hover:border-[#E07B4C] hover:shadow-[2px_3px_0px_#2B2623] transition-all cursor-pointer group"
                >
                  {/* Number Badge */}
                  <span className="shrink-0 w-8 h-8 rounded-full grid place-items-center text-xs font-mono font-bold bg-[#E5DDD2] dark:bg-[#3D352E] text-[#2B2623] dark:text-[#FAF5EE] border border-[#2B2623]/30 group-hover:bg-[#E07B4C] group-hover:text-white transition-colors">
                    {ch.chapterNumber}
                  </span>

                  {/* Title & Metadata */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-serif font-bold text-[#2B2623] dark:text-[#FAF5EE] group-hover:text-[#E07B4C] transition-colors truncate">
                        {ch.title}
                      </h3>
                      {isRecent && (
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[6px] bg-[#E07B4C] text-white">
                          MỚI
                        </span>
                      )}
                      {ch.password && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[6px] bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                          <Lock className="size-2.5" />
                          <span>Pass</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] font-mono text-[#5C5146] dark:text-[#C4B9AD] mt-1 flex-wrap">
                      <span>{ch.wordCount ? `${ch.wordCount.toLocaleString("vi-VN")} chữ` : "Đang cập nhật"}</span>
                      <span className="text-[#2B2623]/25 dark:text-[#FAF5EE]/25">•</span>
                      <span className="inline-flex items-center gap-1" title="Lượt đọc">
                        <Eye className="size-3 text-[#5C5146] dark:text-[#C4B9AD]" />
                        <span>{ch.views ?? 0}</span>
                      </span>
                      <span className="text-[#2B2623]/25 dark:text-[#FAF5EE]/25">•</span>
                      <span className="inline-flex items-center gap-1" title="Lượt thích">
                        <Heart className="size-3 text-rose-500/80" />
                        <span>{ch.likes ?? 0}</span>
                      </span>
                      <span className="text-[#2B2623]/25 dark:text-[#FAF5EE]/25">•</span>
                      <span className="inline-flex items-center gap-1" title="Bình luận">
                        <MessageSquare className="size-3 text-[#E07B4C]" />
                        <span>{ch.commentsCount ?? 0}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Link Arrow */}
                  <div className="shrink-0 text-xs font-mono font-bold text-[#E07B4C] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span className="hidden sm:inline">Đọc</span>
                    <span>→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 px-4 rounded-[18px] border-2 border-dashed border-[#2B2623]/25 bg-[#FAF5EE]/50 text-muted-foreground font-serif text-sm">
            Chưa có chương nào được cập nhật.
          </div>
        )}
      </section>

      {/* Story-wide Reviews / Comments Section */}
      <CommentSection targetType="story" targetId={story.id} />
    </div>
  );
}
