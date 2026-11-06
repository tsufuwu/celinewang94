"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  MessageSquare,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Minimize2,
  Flag,
  Lock,
  Unlock,
  KeyRound,
  HelpCircle,
  ListOrdered,
  BookOpen,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ParagraphSheet } from "./paragraph-sheet";
import { ReadingToolbar, type ReadingSettings } from "./reading-toolbar";
import { ChapterSelectorDrawer, type ChapterSummaryItem } from "./chapter-selector-drawer";
import type { ParagraphCommentItem } from "@/app/chuong/[id]/actions";
import { OrangeLogo } from "@/components/layout/orange-logo";
import { renderParagraphWithFootnotes } from "./inline-footnote";
import { AntiCopyShield } from "./anti-copy-shield";
import { useAuth } from "@/components/auth/auth-context";
import { CommentSection } from "@/components/comments/comment-section";
import { saveBookshelfItem } from "@/lib/bookshelf";
import { StoryHtmlRenderer } from "@/components/story/story-html-renderer";

export interface ParagraphData {
  index: number;
  text: string;
}

export interface ChapterData {
  id: string;
  chapterNumber: number;
  title: string;
  wordCount: number;
  password?: string | null;
  passwordHint?: string | null;
  lockMessage?: string | null;
  contentHtml?: string | null;
  paragraphs: ParagraphData[];
  story: {
    id: string;
    slug: string;
    title: string;
    author: string;
    coverUrl?: string | null;
  };
}

interface ChapterReaderProps {
  chapter: ChapterData;
  initialComments: ParagraphCommentItem[];
  prevChapterId?: string | null;
  nextChapterId?: string | null;
  allChapters?: ChapterSummaryItem[];
}

export function ChapterReader({
  chapter,
  initialComments,
  prevChapterId,
  nextChapterId,
  allChapters = [],
}: ChapterReaderProps) {
  const { setTheme } = useTheme();
  const { user, isChapterUnlocked, saveUnlockedChapter } = useAuth();
  const [isChapterDrawerOpen, setIsChapterDrawerOpen] = React.useState(false);

  // Check if current user is an Admin
  const isAdmin =
    user?.role === "ADMIN" ||
    (user?.email &&
      [
        "phultt.it@gmail.com",
        "celinewang9494@gmail.com",
        "celinewang94@gmail.com",
        "levan09041980@gmail.com",
      ].includes(user.email.toLowerCase()));

  // Password Protection State
  const [isUnlocked, setIsUnlocked] = React.useState<boolean>(() => {
    if (!chapter.password) return true;
    try {
      if (localStorage.getItem(`unlocked_chapter_${chapter.id}`) === "true") return true;
      const savedPassesRaw = localStorage.getItem("mn_saved_passwords");
      if (savedPassesRaw) {
        const savedPasses = JSON.parse(savedPassesRaw) as string[];
        const target = chapter.password.trim().toLowerCase();
        if (Array.isArray(savedPasses) && savedPasses.includes(target)) return true;
      }
    } catch {
      return false;
    }
    return false;
  });

  // Auto unlock if user account already unlocked this chapter in D1 or saved pass matches
  React.useEffect(() => {
    if (!chapter.password) {
      setIsUnlocked(true);
      return;
    }
    if (isChapterUnlocked(chapter.id)) {
      setIsUnlocked(true);
      return;
    }
    try {
      const savedPassesRaw = localStorage.getItem("mn_saved_passwords");
      if (savedPassesRaw) {
        const savedPasses = JSON.parse(savedPassesRaw) as string[];
        const target = chapter.password.trim().toLowerCase();
        if (Array.isArray(savedPasses) && savedPasses.includes(target)) {
          localStorage.setItem(`unlocked_chapter_${chapter.id}`, "true");
          setIsUnlocked(true);
        }
      }
    } catch {
      // Ignored
    }
  }, [chapter.password, chapter.id, isChapterUnlocked]);

  const [passwordInput, setPasswordInput] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapter.password) {
      setIsUnlocked(true);
      return;
    }
    const entered = passwordInput.trim().toLowerCase();
    const target = chapter.password.trim().toLowerCase();

    if (entered === target) {
      try {
        localStorage.setItem(`unlocked_chapter_${chapter.id}`, "true");
        // Cross-chapter shared password caching
        const savedPassesRaw = localStorage.getItem("mn_saved_passwords");
        const savedPasses: string[] = savedPassesRaw ? JSON.parse(savedPassesRaw) : [];
        if (!savedPasses.includes(target)) {
          savedPasses.push(target);
          localStorage.setItem("mn_saved_passwords", JSON.stringify(savedPasses));
        }
      } catch {
        // Ignored
      }
      // Save permanently to user account if logged in
      saveUnlockedChapter(chapter.id);
      setIsUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  // Comments state
  const [comments, setComments] = React.useState<ParagraphCommentItem[]>(initialComments);

  // Active paragraph for sheet
  const [activeParagraph, setActiveParagraph] = React.useState<ParagraphData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  // Reading progress and settings
  const [readingProgress, setReadingProgress] = React.useState(0);
  const [resumePrompt, setResumePrompt] = React.useState<number | null>(null);
  const [bookmarkSavedMsg, setBookmarkSavedMsg] = React.useState(false);
  const currentParagraphIndexRef = React.useRef(0);
  const lastSyncTimeRef = React.useRef(Date.now());
  const [settings, setSettings] = React.useState<ReadingSettings>({
    fontSize: 17,
    lineHeight: "normal",
    fontFamily: "serif",
    themeMode: "light",
    focusMode: false,
  });

  // Load saved reading settings from LocalStorage
  React.useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("reader_settings");
      if (savedSettings) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(savedSettings) }));
      }
    } catch {
      // LocalStorage access restricted or unavailable
    }
  }, []);

  // Sync theme with settings
  const handleUpdateSettings = (newSettings: Partial<ReadingSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem("reader_settings", JSON.stringify(updated));
      } catch {
        // Ignored
      }
      if (newSettings.themeMode) {
        if (newSettings.themeMode === "dark") {
          setTheme("dark");
        } else {
          setTheme("light");
        }
      }
      return updated;
    });
  };

  // Open sheet for a paragraph
  const handleOpenParagraphSheet = (p: ParagraphData) => {
    setActiveParagraph(p);
    setIsSheetOpen(true);
  };

  // Callback when a comment or typo report is added
  const handleCommentAdded = (newComment: ParagraphCommentItem) => {
    setComments((prev) => [...prev, newComment]);
  };

  // Callback when a comment is deleted
  const handleCommentDeleted = (deletedId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== deletedId));
  };

  // Calculate comments count per paragraph
  const commentCountsByParagraph = React.useMemo(() => {
    const map = new Map<number, { count: number; hasTypoReport: boolean }>();
    comments.forEach((c) => {
      const existing = map.get(c.paragraphIndex) || { count: 0, hasTypoReport: false };
      map.set(c.paragraphIndex, {
        count: existing.count + 1,
        hasTypoReport: existing.hasTypoReport || c.isTypoReport,
      });
    });
    return map;
  }, [comments]);

  // 1. IntersectionObserver to track reading progress & save to LocalStorage
  React.useEffect(() => {
    if (!isUnlocked) return;

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const indexAttr = entry.target.getAttribute("data-index");
          if (indexAttr) {
            const pIndex = parseInt(indexAttr, 10);
            currentParagraphIndexRef.current = pIndex;
            const total = chapter.paragraphs.length;
            const progress = Math.min(100, Math.round((pIndex / total) * 100));
            setReadingProgress(progress);

            // Save to LocalStorage (0 D1 reads/writes during scroll)
            try {
              localStorage.setItem(
                `reading_history_${chapter.id}`,
                JSON.stringify({
                  chapterId: chapter.id,
                  paragraphIndex: pIndex,
                  storySlug: chapter.story.slug,
                  timestamp: Date.now(),
                })
              );
            } catch {
              // Ignore LocalStorage error
            }
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0.1,
    });

    const sections = document.querySelectorAll("section[data-index]");
    sections.forEach((sec) => observer.observe(sec));

    return () => {
      sections.forEach((sec) => observer.unobserve(sec));
    };
  }, [isUnlocked, chapter.id, chapter.paragraphs.length, chapter.story.slug]);

  // 2. Check for saved reading position on initial load (LocalStorage or D1 Cloud)
  React.useEffect(() => {
    if (!isUnlocked) return;
    try {
      const saved = localStorage.getItem(`reading_history_${chapter.id}`);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.paragraphIndex && data.paragraphIndex > 1) {
          setResumePrompt(data.paragraphIndex);
          return;
        }
      }
    } catch {
      // Ignored
    }

    // If logged in member, check Cloudflare D1 reading progress
    if (user) {
      fetch(`/api/user/reading-progress?storyId=${chapter.story.id}`)
        .then((r) => r.json())
        .then((data: { progress?: { chapterId: string; paragraphIndex: number } | null }) => {
          if (
            data?.progress &&
            data.progress.chapterId === chapter.id &&
            data.progress.paragraphIndex > 1
          ) {
            setResumePrompt(data.progress.paragraphIndex);
          }
        })
        .catch(() => {});
    }
  }, [isUnlocked, user, chapter.story.id, chapter.id]);

  // Sync progress to D1 Cloud (called on chapter transition, bookmark, or tab hidden)
  const syncProgressToD1 = React.useCallback(
    (pIndex: number) => {
      if (!user) return;
      try {
        fetch("/api/user/reading-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storyId: chapter.story.id,
            chapterId: chapter.id,
            paragraphIndex: pIndex,
          }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // Ignored
      }
    },
    [user, chapter.story.id, chapter.id]
  );

  // Sync when leaving page or tab becomes hidden (with 60s debounce)
  React.useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        const now = Date.now();
        if (now - lastSyncTimeRef.current >= 60000) {
          syncProgressToD1(currentParagraphIndexRef.current);
          lastSyncTimeRef.current = now;
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [syncProgressToD1]);

  const handleManualBookmark = () => {
    saveBookshelfItem({
      storyId: chapter.story.id,
      storySlug: chapter.story.slug,
      storyTitle: chapter.story.title,
      coverUrl: chapter.story.coverUrl,
      lastChapterId: chapter.id,
      lastChapterNumber: chapter.chapterNumber,
      lastChapterTitle: chapter.title,
    });
    try {
      localStorage.setItem(
        `reading_history_${chapter.id}`,
        JSON.stringify({
          chapterId: chapter.id,
          chapterNumber: chapter.chapterNumber,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {}

    syncProgressToD1(currentParagraphIndexRef.current);
    setBookmarkSavedMsg(true);
    setTimeout(() => setBookmarkSavedMsg(false), 2500);
  };

  const scrollToParagraph = (index: number) => {
    const el = document.getElementById(`p-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setResumePrompt(null);
    }
  };

  // Font size mapping
  const fontSizeClass =
    settings.fontSize === 15
      ? "text-sm sm:text-base"
      : settings.fontSize === 17
      ? "text-base sm:text-lg"
      : settings.fontSize === 19
      ? "text-lg sm:text-xl"
      : "text-xl sm:text-2xl";

  // Line height mapping
  const lineHeightClass =
    settings.lineHeight === "compact"
      ? "leading-relaxed"
      : settings.lineHeight === "loose"
      ? "leading-[2.2] sm:leading-[2.4]"
      : "leading-loose";

  // Font family mapping
  const fontFamilyClass =
    settings.fontFamily === "lora"
      ? "font-reader-lora"
      : settings.fontFamily === "alegreya"
      ? "font-reader-alegreya"
      : settings.fontFamily === "arial"
      ? "font-reader-arial"
      : settings.fontFamily === "futura"
      ? "font-reader-futura"
      : settings.fontFamily === "sans"
      ? "font-reader-sans"
      : "font-reader-lora";

  // Theme mode container styling
  const isSepia = settings.themeMode === "sepia";

  // Check if chapter has rich custom HTML layouts (divs, styles, images, tables, etc.)
  const hasCustomHtml = React.useMemo(() => {
    if (!chapter.contentHtml) return false;
    const trimmed = chapter.contentHtml.trim();
    if (trimmed.length === 0) return false;
    return (
      /<div|<style|<table|<img|<iframe|<section|class=|style=/i.test(trimmed) ||
      chapter.paragraphs.length === 0
    );
  }, [chapter.contentHtml, chapter.paragraphs.length]);

  // If chapter is locked by password
  if (!isUnlocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md p-8 rounded-3xl bg-card border border-border/80 shadow-xl text-center space-y-6">
          <div className="size-16 rounded-3xl bg-secondary mx-auto flex items-center justify-center text-primary shadow-inner">
            <Lock className="size-8" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-primary text-xs font-mono">
              <OrangeLogo className="size-3.5" />
              <span>Chương Cần Mật Khẩu</span>
            </div>
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              {chapter.title}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              {chapter.story.title} • {chapter.story.author}
            </p>
          </div>

          {/* Lock Message from Celine if available */}
          {chapter.lockMessage && (
            <div className="p-4 rounded-2xl bg-[#FFF5EB] dark:bg-[#251D18] border-2 border-[#E07B4C]/40 text-left space-y-1.5 text-xs shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#E07B4C]">
                <MessageSquare className="size-3.5" />
                <span>Lời nhắn từ Celine:</span>
              </div>
              <p className="text-[#2B2623] dark:text-[#FAF5EE] whitespace-pre-line leading-relaxed font-sans">
                {chapter.lockMessage}
              </p>
            </div>
          )}

          {/* Hint Area */}
          <div className="p-4 rounded-2xl bg-secondary/60 border border-orange-200/50 dark:border-orange-950/40 text-left space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-orange-800 dark:text-orange-300">
              <HelpCircle className="size-3.5" />
              <span>Gợi ý mật khẩu:</span>
            </div>
            <p className="text-foreground/90 italic">
              {chapter.passwordHint || "Chương này chưa có gợi ý cụ thể."}
            </p>
          </div>

          {/* Password Form */}
          <form onSubmit={handleUnlock} className="space-y-3">
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError(false);
                }}
                placeholder="Nhập mật khẩu chương..."
                className="pl-10 h-11 rounded-2xl bg-background border-border text-sm"
                autoFocus
              />
            </div>

            {passwordError && (
              <p className="text-xs text-destructive text-left font-medium pl-1">
                Sai mật khẩu rồi bạn ơi, thử lại xem nhé 🥺
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-xs cursor-pointer"
            >
              <Unlock className="size-4 mr-2" />
              Mở khóa đọc chương
            </Button>
          </form>

          {/* Admin Fast Actions if Logged In as Admin */}
          {isAdmin && (
            <div className="pt-2 flex flex-col gap-2 border-t border-border/40">
              <Button
                type="button"
                onClick={() => setIsUnlocked(true)}
                variant="outline"
                className="w-full h-10 rounded-2xl border-2 border-[#E07B4C] text-[#E07B4C] hover:bg-[#E07B4C]/10 text-xs font-mono font-bold cursor-pointer"
              >
                <Unlock className="size-3.5 mr-1.5" />
                Đọc ngay không cần mật khẩu (Admin)
              </Button>
              <Link
                href={`/admin/editor?storyId=${chapter.story.id}&chapterId=${chapter.id}`}
                className="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-2xl bg-[#E07B4C] hover:bg-[#DC7648] text-white text-xs font-mono font-bold shadow-xs transition-colors"
              >
                <Edit3 className="size-3.5" />
                Sửa chương trong Studio
              </Link>
            </div>
          )}

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ArrowLeft className="size-3" /> Trang chủ
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <Link
              href={`/truyen/${chapter.story.slug}`}
              className="text-xs font-bold text-[#E07B4C] hover:underline inline-flex items-center gap-1"
            >
              <BookOpen className="size-3" /> Giới thiệu truyện
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AntiCopyShield>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          isSepia ? "reader-sepia" : "reader-light"
        }`}
      >
      {/* Reading Progress Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-border/40">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Focus Mode Exit Pill */}
      {settings.focusMode && (
        <aside
          aria-label="Thoát chế độ tập trung"
          className="fixed top-4 right-4 z-50 animate-in fade-in duration-300"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateSettings({ focusMode: false })}
            className="rounded-full text-xs h-8 px-3 bg-background/80 backdrop-blur-md border-border/80 flex items-center gap-1.5 shadow-md"
          >
            <Minimize2 className="size-3.5" />
            <span>Thoát chế độ tập trung</span>
          </Button>
        </aside>
      )}

      {/* Main Content Area with generous bottom padding so footer is never overlapped by floating toolbar */}
      <main className="max-w-3xl mx-auto px-4 sm:px-8 pt-8 sm:pt-16 pb-36 sm:pb-44">
        {/* Navigation Bar (hidden in focus mode) */}
        {!settings.focusMode && (
          <nav
            aria-label="Điều hướng chương"
            className="flex items-center justify-between pb-6 mb-8 border-b border-border/60 flex-wrap gap-3"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                <ArrowLeft className="size-3.5" />
                <span>Trang chủ</span>
              </Link>

              <span className="text-muted-foreground/40 font-mono">•</span>

              <Link
                href={`/truyen/${chapter.story.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E07B4C] hover:underline transition-colors"
                title={`Về trang giới thiệu truyện ${chapter.story.title}`}
              >
                <BookOpen className="size-3.5" />
                <span>Giới thiệu truyện</span>
              </Link>

              {isAdmin && (
                <>
                  <span className="text-muted-foreground/40 font-mono">•</span>
                  <Link
                    href={`/admin/editor?storyId=${chapter.story.id}&chapterId=${chapter.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold font-mono px-3 py-1 rounded-full bg-[#E07B4C] text-white hover:bg-[#DC7648] transition-all shadow-xs"
                    title="Mở chương này trong Studio để chỉnh sửa"
                  >
                    <Edit3 className="size-3.5" />
                    <span>Sửa chương</span>
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/truyen/${chapter.story.slug}`}
                className="text-xs font-mono text-muted-foreground hover:text-[#E07B4C] truncate max-w-[200px] sm:max-w-xs transition-colors"
              >
                {chapter.story.title}
              </Link>
            </div>
          </nav>
        )}

        {/* Resume reading prompt banner if reader has a saved bookmark */}
        {resumePrompt && (
          <aside
            aria-label="Tiếp tục đọc dở"
            className="mb-8 p-3.5 rounded-2xl bg-secondary/80 border border-orange-200 dark:border-orange-800/60 flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-300 shadow-xs"
          >
            <div className="flex items-center gap-2 text-orange-950 dark:text-orange-200">
              <Bookmark className="size-4 shrink-0 text-primary" />
              <span>
                Lần trước bạn đang đọc đến <strong>Đoạn #{resumePrompt}</strong>.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => scrollToParagraph(resumePrompt)}
                className="h-7 text-xs rounded-lg px-2.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
              >
                Cuộn tới đoạn đang đọc
              </Button>
              <button
                onClick={() => setResumePrompt(null)}
                className="text-muted-foreground hover:text-foreground text-xs p-1"
              >
                Bỏ qua
              </button>
            </div>
          </aside>
        )}

        {/* Chapter Header */}
        <header className="text-center mb-12 sm:mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-primary mb-2.5 block font-medium">
            Chương {chapter.chapterNumber}
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl text-foreground font-semibold mb-3.5 tracking-tight leading-snug">
            {chapter.title}
          </h1>
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground font-mono">
            <span>Tác giả: {chapter.story.author}</span>
            <span>•</span>
            <span>{chapter.wordCount.toLocaleString("vi-VN")} chữ</span>
          </div>
        </header>

        {/* Chapter Content: Custom HTML Layout or Standard Paragraphs */}
        {hasCustomHtml ? (
          <article
            className={`select-text transition-all duration-200 ${fontFamilyClass} ${fontSizeClass} ${lineHeightClass}`}
          >
            <StoryHtmlRenderer content={chapter.contentHtml!} disableShield={true} />
          </article>
        ) : (
          <article
            className={`space-y-6 sm:space-y-8 text-foreground/90 transition-all duration-200 ${fontFamilyClass} ${fontSizeClass} ${lineHeightClass}`}
          >
            {chapter.paragraphs.map((p) => {
              const commentMeta = commentCountsByParagraph.get(p.index);
              const count = commentMeta?.count || 0;
              const hasTypo = commentMeta?.hasTypoReport || false;

              return (
                <section
                  key={p.index}
                  id={`p-${p.index}`}
                  data-index={p.index}
                  className="group relative rounded-xl -mx-3 px-3 py-2 transition-colors duration-200 hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleOpenParagraphSheet(p)}
                  title="Bấm vào đoạn để xem bình luận hoặc báo lỗi chính tả"
                >
                  {/* Paragraph Content */}
                  <p className="text-left sm:text-justify indent-6 sm:indent-8 leading-relaxed">
                    {renderParagraphWithFootnotes(p.text, p.index)}
                  </p>

                  {/* Comment Bubble Indicator at the right-bottom of the paragraph */}
                  <div
                    className={`absolute right-1 bottom-0 sm:bottom-0.5 transition-all duration-200 ${
                      count > 0
                        ? "opacity-100 scale-100"
                        : "opacity-75 sm:opacity-0 sm:group-hover:opacity-100 scale-100 sm:scale-95 sm:group-hover:scale-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenParagraphSheet(p);
                      }}
                      title={count > 0 ? `${count} bình luận` : "Thêm bình luận hoặc báo lỗi"}
                      className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-full border shadow-xs transition-transform active:scale-90 cursor-pointer backdrop-blur-xs ${
                        hasTypo
                          ? "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-200"
                          : count > 0
                          ? "bg-[#FAF5EE] text-[#E07B4C] border-[#E07B4C] dark:bg-[#25201C] dark:text-[#E07B4C] font-bold"
                          : "bg-[#FAF5EE] dark:bg-[#25201C] text-[#5C5146] dark:text-[#C4B9AD] border-[#2B2623]/30 hover:border-[#E07B4C] hover:text-[#E07B4C]"
                      }`}
                    >
                      {hasTypo ? (
                        <Flag className="size-2.5 text-rose-600 dark:text-rose-400" />
                      ) : (
                        <MessageSquare className="size-2.5 text-[#E07B4C]" />
                      )}
                      <span>
                        {count > 0 ? count : "+"}
                      </span>
                    </button>
                  </div>
                </section>
              );
            })}
          </article>
        )}

        {/* 1. Primary Chapter Navigation Bar (PLACED ABOVE COMMENTS, ENLARGED) */}
        <section
          aria-label="Điều hướng chương truyện"
          className="my-10 sm:my-14 p-5 sm:p-7 rounded-[22px] bg-[#FDFBF7] dark:bg-[#25201C] border-2 border-[#2B2623] shadow-[3.5px_5px_0px_#2B2623] flex flex-col gap-4 sm:gap-5"
        >
          {/* Main 3 Chapter Jump Buttons (Enlarged for comfortable tapping) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Previous Chapter */}
            {prevChapterId ? (
              <Link
                href={`/chuong/${prevChapterId}`}
                onClick={() => syncProgressToD1(currentParagraphIndexRef.current)}
                className="w-full"
              >
                <Button
                  variant="outline"
                  className="w-full h-12 px-4 rounded-[14px] text-sm sm:text-base font-bold font-mono bg-[#E5DDD2] hover:bg-[#D9CFC2] dark:bg-[#2E2824] dark:hover:bg-[#38312C] text-[#2B2623] dark:text-[#FAF5EE] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1.5px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <ChevronLeft className="size-4.5" />
                  <span>Chương trước</span>
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                disabled
                className="w-full h-12 px-4 rounded-[14px] text-sm sm:text-base font-bold font-mono border-2 border-[#2B2623]/40 opacity-40 flex items-center justify-center gap-2"
              >
                <ChevronLeft className="size-4.5" />
                <span>Đầu truyện</span>
              </Button>
            )}

            {/* Chapter Quick Selector / Overview */}
            <Button
              variant="outline"
              onClick={() => setIsChapterDrawerOpen(true)}
              className="w-full h-12 px-4 rounded-[14px] text-sm sm:text-base font-mono font-bold bg-[#FAF5EE] dark:bg-[#1E1916] border-2 border-[#2B2623] text-[#2B2623] dark:text-[#FAF5EE] hover:border-[#E07B4C] hover:text-[#E07B4C] shadow-[2px_3px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1.5px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all"
              title="Bấm để mở danh sách toàn bộ chương"
            >
              <ListOrdered className="size-4.5 text-[#E07B4C]" />
              <span>
                Chương {chapter.chapterNumber}
                {allChapters.length > 0 ? ` / ${allChapters.length}` : ""}
              </span>
            </Button>

            {/* Next Chapter */}
            {nextChapterId ? (
              <Link
                href={`/chuong/${nextChapterId}`}
                onClick={() => syncProgressToD1(currentParagraphIndexRef.current)}
                className="w-full"
              >
                <Button
                  className="w-full h-12 px-4 rounded-[14px] text-sm sm:text-base font-bold font-mono bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1.5px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Chương sau</span>
                  <ChevronRight className="size-4.5" />
                </Button>
              </Link>
            ) : (
              <Button
                disabled
                className="w-full h-12 px-4 rounded-[14px] text-sm sm:text-base font-bold font-mono border-2 border-[#2B2623]/40 opacity-40 flex items-center justify-center gap-2"
              >
                <span>Hết chương</span>
                <ChevronRight className="size-4.5" />
              </Button>
            )}
          </div>

          {/* Secondary Actions: Đánh dấu đang đọc, Giới thiệu truyện, Trang chủ (Enlarged) */}
          <div className="pt-3 border-t-2 border-[#2B2623]/10 flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleManualBookmark}
              className={`h-11 px-4 sm:px-5 rounded-[14px] text-xs sm:text-sm font-bold font-mono border-2 border-[#2B2623] shadow-[2px_2.5px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-2 cursor-pointer transition-all ${
                bookmarkSavedMsg
                  ? "bg-[#BDCEAF] text-[#2B2623]"
                  : "bg-[#F4DFAD] text-[#2B2623] hover:bg-[#EED499]"
              }`}
              title="Lưu vị trí chương này vào Tủ sách cá nhân của bạn"
            >
              <Bookmark className="size-4 fill-current text-[#E07B4C]" />
              <span>{bookmarkSavedMsg ? "Đã lưu vào Tủ sách!" : "Đánh dấu đang đọc"}</span>
            </Button>

            <div className="flex items-center gap-2.5 flex-wrap">
              {isAdmin && (
                <Link href={`/admin/editor?storyId=${chapter.story.id}&chapterId=${chapter.id}`}>
                  <Button
                    variant="outline"
                    className="h-11 px-4 sm:px-5 rounded-[14px] text-xs sm:text-sm font-bold font-mono border-2 border-[#2B2623] bg-[#E07B4C] text-white hover:bg-[#DC7648] shadow-[2px_2.5px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
                    title="Mở chương này trong Studio để chỉnh sửa"
                  >
                    <Edit3 className="size-4" />
                    <span>Sửa chương</span>
                  </Button>
                </Link>
              )}

              <Link href={`/truyen/${chapter.story.slug}`}>
                <Button
                  variant="outline"
                  className="h-11 px-4 sm:px-5 rounded-[14px] text-xs sm:text-sm font-bold font-mono border-2 border-[#2B2623] bg-[#FAF5EE] dark:bg-[#2A2420] text-[#2B2623] dark:text-[#FAF5EE] shadow-[2px_2.5px_0px_#2B2623] hover:border-[#E07B4C] hover:text-[#E07B4C] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-2"
                  title={`Về trang giới thiệu truyện ${chapter.story.title}`}
                >
                  <BookOpen className="size-4 text-[#E07B4C]" />
                  <span>Giới thiệu truyện</span>
                </Button>
              </Link>

              <Link href="/">
                <Button
                  variant="ghost"
                  className="h-11 px-3.5 rounded-[14px] text-xs sm:text-sm font-mono font-medium text-[#5C5146] hover:text-[#2B2623] dark:text-[#C4B9AD] hover:bg-[#E5DDD2]"
                >
                  Trang chủ
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Chapter-wide Comments Section (PLACED BELOW NAVIGATION BAR) */}
        <CommentSection targetType="chapter" targetId={chapter.id} />

        {/* Bottom padding for reading comfort */}
        <footer className="mt-8 pb-32 sm:pb-40" />
      </main>

      {/* Floating Toolbar Docked in Corner */}
      <ReadingToolbar
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        prevChapterId={prevChapterId}
        nextChapterId={nextChapterId}
        currentChapterNumber={chapter.chapterNumber}
        totalChapters={allChapters.length}
        onOpenChapterSelector={() => setIsChapterDrawerOpen(true)}
      />

      {/* Chapter Selector Drawer / Modal */}
      <ChapterSelectorDrawer
        isOpen={isChapterDrawerOpen}
        onClose={() => setIsChapterDrawerOpen(false)}
        allChapters={allChapters}
        currentChapterId={chapter.id}
        storyTitle={chapter.story.title}
        storySlug={chapter.story.slug}
        onSelectChapter={() => syncProgressToD1(currentParagraphIndexRef.current)}
      />

      {/* Paragraph Comment & Typo Report Sheet */}
      {activeParagraph && (
        <ParagraphSheet
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          chapterId={chapter.id}
          paragraphIndex={activeParagraph.index}
          paragraphText={activeParagraph.text}
          comments={comments}
          onCommentAdded={handleCommentAdded}
          onCommentDeleted={handleCommentDeleted}
        />
      )}
    </div>
  </AntiCopyShield>
);
}
