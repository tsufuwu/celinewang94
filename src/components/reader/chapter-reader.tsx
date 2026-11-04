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
  paragraphs: ParagraphData[];
  story: {
    id: string;
    slug: string;
    title: string;
    author: string;
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

  // Password Protection State
  const [isUnlocked, setIsUnlocked] = React.useState<boolean>(() => {
    if (!chapter.password) return true;
    try {
      return localStorage.getItem(`unlocked_chapter_${chapter.id}`) === "true";
    } catch {
      return false;
    }
  });

  // Auto unlock if user account already unlocked this chapter in D1
  React.useEffect(() => {
    if (chapter.password && isChapterUnlocked(chapter.id)) {
      setIsUnlocked(true);
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
    syncProgressToD1(currentParagraphIndexRef.current);
    setBookmarkSavedMsg(true);
    setTimeout(() => setBookmarkSavedMsg(false), 2000);
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
  const fontFamilyClass = settings.fontFamily === "serif" ? "font-serif" : "font-sans";

  // Theme mode container styling
  const isSepia = settings.themeMode === "sepia";

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
              <span>Gợi ý mật khẩu từ Celine:</span>
            </div>
            <p className="text-foreground/90 italic">
              {chapter.passwordHint || "Chương này chưa có gợi ý cụ thể. Nếu bạn chưa biết mật khẩu, hãy liên hệ nhà Cam nhé!"}
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
              className="w-full h-11 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-xs"
            >
              <Unlock className="size-4 mr-2" />
              Mở khóa đọc chương
            </Button>
          </form>

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
          isSepia ? "reader-sepia" : ""
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

        {/* Paragraphs List */}
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

        {/* Chapter-wide Comments Section */}
        <CommentSection targetType="chapter" targetId={chapter.id} />

        {/* Bottom Navigation Links */}
        <footer
          className="mt-16 sm:mt-24 pt-8 pb-36 sm:pb-48 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2">
            {prevChapterId ? (
              <Link
                href={`/chuong/${prevChapterId}`}
                onClick={() => syncProgressToD1(currentParagraphIndexRef.current)}
              >
                <Button variant="outline" size="sm" className="rounded-xl text-xs">
                  <ChevronLeft className="size-3.5 mr-1" /> Chương trước
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled className="rounded-xl text-xs opacity-40">
                <ChevronLeft className="size-3.5 mr-1" /> Đầu truyện
              </Button>
            )}

            {/* Chapter Quick Selector Center Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChapterDrawerOpen(true)}
              className="rounded-xl text-xs font-mono font-bold bg-[#FAF5EE] dark:bg-[#2A2420] border-2 border-[#2B2623] hover:border-[#E07B4C] hover:text-[#E07B4C] transition-all shadow-[1.5px_2px_0px_#2B2623] flex items-center gap-1.5 px-3"
              title="Bấm để mở danh sách toàn bộ chương"
            >
              <ListOrdered className="size-3.5 text-[#E07B4C]" />
              <span>
                Chương {chapter.chapterNumber}
                {allChapters.length > 0 ? ` / ${allChapters.length}` : ""}
              </span>
            </Button>

            {nextChapterId ? (
              <Link
                href={`/chuong/${nextChapterId}`}
                onClick={() => syncProgressToD1(currentParagraphIndexRef.current)}
              >
                <Button size="sm" className="rounded-xl text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                  Chương sau <ChevronRight className="size-3.5 ml-1" />
                </Button>
              </Link>
            ) : (
              <Button size="sm" disabled className="rounded-xl text-xs opacity-40">
                Hết chương <ChevronRight className="size-3.5 ml-1" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualBookmark}
                className="rounded-xl text-xs flex items-center gap-1.5 border-[#E07B4C]/40 text-[#E07B4C] hover:bg-[#E07B4C]/10 transition-colors"
                title="Lưu tiến độ đọc lên tài khoản Google của bạn"
              >
                <Bookmark className="size-3.5 fill-current" />
                <span>{bookmarkSavedMsg ? "Đã lưu vào tài khoản!" : "Đánh dấu đang đọc"}</span>
              </Button>
            )}

            <Link href={`/truyen/${chapter.story.slug}`}>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold border-2 border-[#2B2623] bg-[#FAF5EE] dark:bg-[#2A2420] text-[#2B2623] dark:text-[#FAF5EE] shadow-[1.5px_2px_0px_#2B2623] hover:border-[#E07B4C] hover:text-[#E07B4C] transition-all"
                title={`Về trang giới thiệu truyện ${chapter.story.title}`}
              >
                <BookOpen className="size-3.5 mr-1 text-[#E07B4C]" />
                <span>Giới thiệu truyện</span>
              </Button>
            </Link>

            <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-xl text-xs text-muted-foreground hover:text-foreground">
                Trang chủ
              </Button>
            </Link>
          </div>
        </footer>
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
        />
      )}
    </div>
  </AntiCopyShield>
);
}
