"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  saveStoryContentHtml,
  createOrUpdateChapterAction,
  deleteChapterAction,
  saveEditorTemplate,
  EditorTemplateItem,
  EditorStoryOption,
  EditorChapterOption,
} from "@/app/admin/actions";
import { CodeMirrorEditor } from "./codemirror-editor";
import { TiptapEditor } from "./tiptap-editor";
import { LivePreview } from "./live-preview";
import { TemplateModal } from "./template-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Code2,
  Eye,
  Columns2,
  FileText,
  Check,
  AlertCircle,
  Palette,
  ExternalLink,
  Plus,
  Trash2,
  Lock,
  KeyRound,
  Quote,
  AlignLeft,
  Scissors,
} from "lucide-react";

interface StudioEditorProps {
  stories: EditorStoryOption[];
  initialTemplates?: EditorTemplateItem[];
}

export function StudioEditor({ stories: initialStories, initialTemplates = [] }: StudioEditorProps) {
  const searchParams = useSearchParams();

  // Local Stories State to allow dynamic chapter additions/deletions without page reloads
  const [stories, setStories] = React.useState<EditorStoryOption[]>(initialStories);

  // 1. Target States
  const urlStoryId = searchParams.get("storyId") || stories[0]?.id || "";
  const urlChapterId = searchParams.get("chapterId") || "";

  const [targetType, setTargetType] = React.useState<"story" | "chapter">(
    urlChapterId ? "chapter" : "story"
  );
  const [selectedStoryId, setSelectedStoryId] = React.useState<string>(urlStoryId);
  const [selectedChapterId, setSelectedChapterId] = React.useState<string>(urlChapterId);

  // Is creating a brand new chapter
  const [isNewChapter, setIsNewChapter] = React.useState<boolean>(false);

  // Active Story
  const currentStory = React.useMemo(() => {
    return stories.find((s) => s.id === selectedStoryId) || stories[0];
  }, [stories, selectedStoryId]);

  // Active Chapter
  const currentChapter = React.useMemo(() => {
    if (!currentStory || isNewChapter) return null;
    return (
      currentStory.chapters.find((c) => c.id === selectedChapterId) ||
      currentStory.chapters[0] ||
      null
    );
  }, [currentStory, selectedChapterId, isNewChapter]);

  // Form Fields for Chapter Editing
  const [chapterNumber, setChapterNumber] = React.useState<number>(1);
  const [chapterTitle, setChapterTitle] = React.useState<string>("");
  const [chapterPassword, setChapterPassword] = React.useState<string>("");
  const [chapterPasswordHint, setChapterPasswordHint] = React.useState<string>("");
  const [showPasswordBox, setShowPasswordBox] = React.useState<boolean>(false);

  // Content States
  const [htmlContent, setHtmlContent] = React.useState<string>("");
  const [customCss, setCustomCss] = React.useState<string>("");
  const [isCssDrawerOpen, setIsCssDrawerOpen] = React.useState(false);

  // 2. View Mode: "visual" | "code" | "split"
  const [viewMode, setViewMode] = React.useState<"visual" | "code" | "split">("split");
  const [splitEditorType, setSplitEditorType] = React.useState<"code" | "visual">("code");

  // 3. Templates & Snippets States
  const [templates, setTemplates] = React.useState<EditorTemplateItem[]>(initialTemplates);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = React.useState(false);
  const [isSaveSnippetModalOpen, setIsSaveSnippetModalOpen] = React.useState(false);
  const [snippetTitle, setSnippetTitle] = React.useState("");
  const [snippetDesc, setSnippetDesc] = React.useState("");

  // Feedback & Saving state
  const [isPending, startTransition] = React.useTransition();
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load content when story/chapter selection changes
  React.useEffect(() => {
    if (targetType === "story" && currentStory) {
      setIsNewChapter(false);
      setHtmlContent(currentStory.contentHtml || "");
      setCustomCss(currentStory.customCss || "");
    } else if (targetType === "chapter") {
      if (isNewChapter) {
        // Prepare new chapter defaults
        const maxNum = currentStory
          ? currentStory.chapters.reduce((max, c) => Math.max(max, c.chapterNumber), 0)
          : 0;
        setChapterNumber(maxNum + 1);
        setChapterTitle(`Chương ${maxNum + 1}`);
        setChapterPassword("");
        setChapterPasswordHint("");
        setShowPasswordBox(false);
        setHtmlContent("");
      } else if (currentChapter) {
        setChapterNumber(currentChapter.chapterNumber);
        setChapterTitle(currentChapter.title);
        setChapterPassword(currentChapter.password || "");
        setChapterPasswordHint(currentChapter.passwordHint || "");
        setShowPasswordBox(Boolean(currentChapter.password));

        // Load content: if contentHtml was null, reconstruct from paragraphs
        const contentToLoad =
          currentChapter.contentHtml ||
          (currentChapter.paragraphs && currentChapter.paragraphs.length > 0
            ? currentChapter.paragraphs.map((p) => `<p>${p.text}</p>`).join("\n")
            : "");
        setHtmlContent(contentToLoad);
      }
    }
  }, [targetType, currentStory, currentChapter, isNewChapter]);

  // Click Handler for "+ Thêm chương mới"
  const handleAddNewChapterClick = () => {
    setTargetType("chapter");
    setIsNewChapter(true);
    setSelectedChapterId("");
    const maxNum = currentStory
      ? currentStory.chapters.reduce((max, c) => Math.max(max, c.chapterNumber), 0)
      : 0;
    setChapterNumber(maxNum + 1);
    setChapterTitle(`Chương ${maxNum + 1}`);
    setChapterPassword("");
    setChapterPasswordHint("");
    setShowPasswordBox(false);
    setHtmlContent("");
  };

  // Click Handler when selecting an existing chapter
  const handleSelectExistingChapter = (chapterId: string) => {
    setIsNewChapter(false);
    setSelectedChapterId(chapterId);
  };

  // Keyboard shortcut Ctrl+S / Cmd+S
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Save Content
  const handleSave = () => {
    if (!currentStory) return;

    startTransition(async () => {
      try {
        if (targetType === "story") {
          const res = await saveStoryContentHtml(currentStory.id, htmlContent, customCss);
          if (res.success) {
            setFeedback({ type: "success", text: res.message });
            setStories((prev) =>
              prev.map((s) =>
                s.id === currentStory.id
                  ? { ...s, contentHtml: htmlContent, customCss }
                  : s
              )
            );
            setTimeout(() => setFeedback(null), 3500);
          } else {
            setFeedback({ type: "error", text: res.message });
          }
        } else {
          // Chapter Mode: Save or Create chapter
          const res = await createOrUpdateChapterAction({
            id: isNewChapter ? undefined : currentChapter?.id,
            storyId: currentStory.id,
            chapterNumber,
            title: chapterTitle,
            contentHtml: htmlContent,
            password: chapterPassword,
            passwordHint: chapterPasswordHint,
          });

          if (res.success && res.chapterId) {
            const savedChapterId = res.chapterId;
            setFeedback({ type: "success", text: res.message });

            // Update local stories state
            const updatedChapterObj: EditorChapterOption = {
              id: savedChapterId,
              storyId: currentStory.id,
              chapterNumber,
              title: chapterTitle || `Chương ${chapterNumber}`,
              contentHtml: htmlContent,
              password: chapterPassword || null,
              passwordHint: chapterPasswordHint || null,
            };

            setStories((prev) =>
              prev.map((s) => {
                if (s.id !== currentStory.id) return s;
                const existingIdx = s.chapters.findIndex((c) => c.id === savedChapterId);
                const newChapters = [...s.chapters];
                if (existingIdx >= 0) {
                  newChapters[existingIdx] = updatedChapterObj;
                } else {
                  newChapters.push(updatedChapterObj);
                }
                newChapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
                return { ...s, chapters: newChapters };
              })
            );

            setIsNewChapter(false);
            setSelectedChapterId(savedChapterId);
            setTimeout(() => setFeedback(null), 3500);
          } else {
            setFeedback({ type: "error", text: res.message });
          }
        }
      } catch (err: unknown) {
        setFeedback({ type: "error", text: (err as Error)?.message || "Lỗi lưu dữ liệu." });
      }
    });
  };

  // Delete Chapter Handler
  const handleDeleteChapter = () => {
    if (!currentChapter) return;
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa Chương ${currentChapter.chapterNumber}: "${currentChapter.title}" không? Hành động này không thể hoàn tác.`
    );
    if (!confirmDelete) return;

    startTransition(async () => {
      try {
        const res = await deleteChapterAction(currentChapter.id);
        if (res.success) {
          setFeedback({ type: "success", text: "Đã xóa chương thành công!" });
          setStories((prev) =>
            prev.map((s) => {
              if (s.id !== currentStory.id) return s;
              return {
                ...s,
                chapters: s.chapters.filter((c) => c.id !== currentChapter.id),
              };
            })
          );
          setSelectedChapterId("");
          setIsNewChapter(false);
          setTimeout(() => setFeedback(null), 3000);
        } else {
          setFeedback({ type: "error", text: res.message });
        }
      } catch (err: unknown) {
        setFeedback({ type: "error", text: (err as Error)?.message || "Lỗi khi xóa chương." });
      }
    });
  };

  // Text cleaner tools
  const handleCleanText = (type: "quotes" | "spacing" | "wrapP") => {
    let text = htmlContent;
    if (type === "quotes") {
      // Normalize curly quotes to Vietnamese standards
      text = text
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        .replace(/<<|>>/g, '"');
      setFeedback({ type: "success", text: "Đã chuẩn hóa dấu ngoặc kép!" });
    } else if (type === "spacing") {
      // Remove excessive blank lines
      text = text.replace(/\n{3,}/g, "\n\n");
      setFeedback({ type: "success", text: "Đã dọn dẹp các dòng trống thừa!" });
    } else if (type === "wrapP") {
      // Auto wrap lines into <p> tags if not already wrapped
      if (!text.includes("<p>")) {
        text = text
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) => `<p>${l}</p>`)
          .join("\n");
        setFeedback({ type: "success", text: "Đã bọc toàn bộ văn bản vào các thẻ đoạn <p>!" });
      }
    }
    setHtmlContent(text);
    setTimeout(() => setFeedback(null), 2500);
  };

  // Fast insert snippet helper
  const handleInsertSnippet = (snippet: string) => {
    setHtmlContent((prev) => (prev ? `${prev}\n\n${snippet}` : snippet));
    setFeedback({ type: "success", text: "Đã chèn mẫu nhanh vào bài viết!" });
    setTimeout(() => setFeedback(null), 2000);
  };

  // Handle Template Selection
  const handleSelectTemplate = (templateHtml: string, replace: boolean = false) => {
    if (replace) {
      setHtmlContent(templateHtml);
    } else {
      setHtmlContent((prev) => (prev ? `${prev}\n\n${templateHtml}` : templateHtml));
    }
    setFeedback({
      type: "success",
      text: replace ? "Đã áp dụng mẫu thành công!" : "Đã chèn mẫu vào cuối bài viết!",
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Save Snippet
  const handleSaveSnippet = async () => {
    if (!snippetTitle.trim() || !htmlContent.trim()) return;

    startTransition(async () => {
      const res = await saveEditorTemplate(snippetTitle, snippetDesc, htmlContent, customCss);
      if (res.success && res.template) {
        setTemplates((prev) => [res.template!, ...prev]);
        setIsSaveSnippetModalOpen(false);
        setSnippetTitle("");
        setSnippetDesc("");
        setFeedback({ type: "success", text: "Đã lưu thành mẫu riêng thành công!" });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        alert(res.message);
      }
    });
  };

  // Calculate live word & character stats
  const charCount = htmlContent.length;
  const wordCount = htmlContent
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="flex flex-col h-screen w-full bg-[#FAF5EE] dark:bg-[#1A1614] text-[#2B2623] dark:text-[#FAF5EE] overflow-hidden select-none font-sans">
      {/* 1. Studio Top Control Bar */}
      <header className="h-14 border-b-2 border-[#2B2623]/20 bg-[#FAF5EE]/95 dark:bg-[#1F1B18]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-30 shadow-[0_2px_4px_rgba(43,38,35,0.04)]">
        {/* Left: Back + Mode Switchers */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-[#5C5146] dark:text-[#C4B9AD] hover:text-[#E07B4C] font-mono font-bold transition-colors shrink-0"
            title="Về Bàn làm việc Quản trị"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>

          <div className="h-4 w-px bg-[#2B2623]/20 hidden sm:block" />

          {/* Mode Switcher: Giới Thiệu / Chương */}
          <div className="flex items-center gap-1 bg-[#E5DDD2] dark:bg-[#2A2420] p-1 rounded-xl border border-[#2B2623]/30 text-xs font-mono shrink-0">
            <button
              type="button"
              onClick={() => {
                setTargetType("story");
                setIsNewChapter(false);
              }}
              className={`px-2.5 py-1 rounded-[8px] font-bold transition-all ${
                targetType === "story"
                  ? "bg-[#FAF5EE] dark:bg-[#1F1B18] text-[#2B2623] dark:text-[#FAF5EE] shadow-[1px_1.5px_0px_#2B2623]"
                  : "text-[#5C5146] dark:text-[#C4B9AD] hover:text-[#2B2623]"
              }`}
            >
              Giới Thiệu
            </button>
            <button
              type="button"
              onClick={() => setTargetType("chapter")}
              className={`px-2.5 py-1 rounded-[8px] font-bold transition-all ${
                targetType === "chapter"
                  ? "bg-[#E07B4C] text-white shadow-[1px_1.5px_0px_#2B2623]"
                  : "text-[#5C5146] dark:text-[#C4B9AD] hover:text-[#2B2623]"
              }`}
            >
              Chương Truyện
            </button>
          </div>

          {/* Story Selector Dropdown */}
          <select
            value={selectedStoryId}
            onChange={(e) => {
              setSelectedStoryId(e.target.value);
              setIsNewChapter(false);
              const st = stories.find((s) => s.id === e.target.value);
              if (st && st.chapters.length > 0) {
                setSelectedChapterId(st.chapters[0].id);
              } else {
                setSelectedChapterId("");
              }
            }}
            className="h-8 max-w-[130px] sm:max-w-[200px] text-xs font-serif font-bold rounded-xl px-2.5 bg-[#FAF5EE] dark:bg-[#2A2420] border-2 border-[#2B2623] text-[#2B2623] dark:text-[#FAF5EE] truncate shadow-[1.5px_2px_0px_#2B2623] focus:outline-none"
          >
            {stories.map((st) => (
              <option key={st.id} value={st.id}>
                {st.title} ({st.chapters.length} ch)
              </option>
            ))}
          </select>

          {/* Chapter Selector Dropdown (if in chapter mode and has chapters) */}
          {targetType === "chapter" && currentStory && (
            <div className="flex items-center gap-1.5">
              <select
                value={isNewChapter ? "NEW" : selectedChapterId}
                onChange={(e) => {
                  if (e.target.value === "NEW") {
                    handleAddNewChapterClick();
                  } else {
                    handleSelectExistingChapter(e.target.value);
                  }
                }}
                className="h-8 max-w-[130px] sm:max-w-[200px] text-xs font-mono font-bold rounded-xl px-2.5 bg-[#FAF5EE] dark:bg-[#2A2420] border-2 border-[#2B2623] text-[#2B2623] dark:text-[#FAF5EE] truncate shadow-[1.5px_2px_0px_#2B2623] focus:outline-none"
              >
                {currentStory.chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    #{ch.chapterNumber}: {ch.title} {ch.password ? "🔒" : ""}
                  </option>
                ))}
                <option value="NEW">+ Thêm chương mới...</option>
              </select>

              {/* + Thêm chương mới Button */}
              <Button
                type="button"
                size="sm"
                onClick={handleAddNewChapterClick}
                className={`h-8 px-2.5 text-xs rounded-xl font-mono font-bold border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] transition-all flex items-center gap-1 ${
                  isNewChapter
                    ? "bg-[#BDCEAF] text-[#2B2623]"
                    : "bg-[#E07B4C] hover:bg-[#DC7648] text-white"
                }`}
                title="Tạo thêm một chương mới cho bộ truyện này"
              >
                <Plus className="size-3.5" />
                <span className="hidden md:inline">Thêm Chương</span>
              </Button>
            </div>
          )}

          {/* Open live page link */}
          {targetType === "story" && currentStory && (
            <Link
              href={`/truyen/${currentStory.slug}`}
              target="_blank"
              className="text-[#5C5146] hover:text-[#E07B4C] transition-colors p-1"
              title="Xem trang giới thiệu thực tế trên web"
            >
              <ExternalLink className="size-3.5" />
            </Link>
          )}

          {targetType === "chapter" && currentChapter && !isNewChapter && (
            <Link
              href={`/chuong/${currentChapter.id}`}
              target="_blank"
              className="text-[#5C5146] hover:text-[#E07B4C] transition-colors p-1"
              title="Xem chương thực tế trên web đọc truyện"
            >
              <ExternalLink className="size-3.5" />
            </Link>
          )}
        </div>

        {/* Center: View Switcher (Visual / Code / Split) */}
        <div className="flex items-center gap-1 bg-[#E5DDD2] dark:bg-[#2A2420] p-1 rounded-xl border border-[#2B2623]/30 text-xs font-mono shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("visual")}
            className={`px-2.5 py-1 rounded-[8px] font-bold transition-all flex items-center gap-1 ${
              viewMode === "visual"
                ? "bg-[#FAF5EE] dark:bg-[#1F1B18] text-[#2B2623] dark:text-[#FAF5EE] shadow-[1px_1.5px_0px_#2B2623]"
                : "text-[#5C5146] dark:text-[#C4B9AD] hover:text-[#2B2623]"
            }`}
            title="Chế độ Trực quan Visual WYSIWYG"
          >
            <FileText className="size-3.5" />
            <span className="hidden lg:inline">Trực quan</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("code")}
            className={`px-2.5 py-1 rounded-[8px] font-bold transition-all flex items-center gap-1 ${
              viewMode === "code"
                ? "bg-[#FAF5EE] dark:bg-[#1F1B18] text-[#2B2623] dark:text-[#FAF5EE] shadow-[1px_1.5px_0px_#2B2623]"
                : "text-[#5C5146] dark:text-[#C4B9AD] hover:text-[#2B2623]"
            }`}
            title="Chế độ Code HTML Sandbox"
          >
            <Code2 className="size-3.5" />
            <span className="hidden lg:inline">Code HTML</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`px-2.5 py-1 rounded-[8px] font-bold transition-all flex items-center gap-1 ${
              viewMode === "split"
                ? "bg-[#FAF5EE] dark:bg-[#1F1B18] text-[#2B2623] dark:text-[#FAF5EE] shadow-[1px_1.5px_0px_#2B2623]"
                : "text-[#5C5146] dark:text-[#C4B9AD] hover:text-[#2B2623]"
            }`}
            title="Chế độ Chia đôi màn hình Live Preview"
          >
            <Columns2 className="size-3.5" />
            <span className="hidden lg:inline">Split Live</span>
          </button>
        </div>

        {/* Right: Actions, Template & Save Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Templates Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsTemplateModalOpen(true)}
            className="h-8 px-2.5 text-xs rounded-xl border-2 border-[#2B2623] bg-[#FAF5EE] hover:bg-[#E5DDD2] dark:bg-[#2A2420] text-[#2B2623] dark:text-[#FAF5EE] shadow-[1.5px_2px_0px_#2B2623] flex items-center gap-1.5 font-bold font-mono"
          >
            <Sparkles className="size-3.5 text-[#E07B4C]" />
            <span className="hidden sm:inline">Chèn Mẫu</span>
          </Button>

          {/* Custom CSS Drawer Toggle (for story mode) */}
          {targetType === "story" && (
            <Button
              type="button"
              variant={isCssDrawerOpen ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setIsCssDrawerOpen((prev) => !prev)}
              className="h-8 px-2 text-xs rounded-xl font-mono text-[#5C5146] hover:text-[#2B2623]"
              title="Chỉnh sửa CSS riêng cho trang này"
            >
              <Palette className="size-3.5 mr-1" />
              <span className="hidden lg:inline">CSS</span>
            </Button>
          )}

          {/* Delete Chapter Button (only when editing existing chapter) */}
          {targetType === "chapter" && !isNewChapter && currentChapter && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleDeleteChapter}
              disabled={isPending}
              className="h-8 px-2.5 text-xs rounded-xl border-2 border-[#2B2623] bg-[#FAF5EE] hover:bg-rose-100 text-rose-600 shadow-[1.5px_2px_0px_#2B2623] font-bold font-mono"
              title="Xóa chương này"
            >
              <Trash2 className="size-3.5" />
              <span className="hidden sm:inline">Xóa</span>
            </Button>
          )}

          {/* Save Button */}
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            className="h-8 px-3.5 text-xs rounded-xl bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[2px_2.5px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-bold font-mono flex items-center gap-1.5"
            title="Lưu nội dung (Ctrl+S)"
          >
            <Save className="size-3.5" />
            <span>
              {isPending
                ? "Đang lưu..."
                : isNewChapter
                ? "Tạo Chương Mới"
                : "Lưu Thay Đổi"}
            </span>
          </Button>
        </div>
      </header>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`px-4 py-2 text-xs font-mono font-bold border-b-2 border-[#2B2623] flex items-center justify-between transition-all ${
            feedback.type === "success"
              ? "bg-[#BDCEAF] text-[#2B2623]"
              : "bg-[#EBBAB5] text-[#2B2623]"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <Check className="size-4 text-emerald-800" />
            ) : (
              <AlertCircle className="size-4 text-rose-800" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs hover:opacity-75 font-mono"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Sub-Header: Chapter Metadata Inputs (when target is chapter) */}
      {targetType === "chapter" && (
        <div className="p-3 sm:px-6 bg-[#FDFBF7] dark:bg-[#241F1C] border-b-2 border-[#2B2623]/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Chapter Number & Title */}
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD]">
                Số chương:
              </span>
              <Input
                type="number"
                min={1}
                value={chapterNumber}
                onChange={(e) => setChapterNumber(parseInt(e.target.value, 10) || 1)}
                className="w-16 h-8 text-xs font-mono font-bold text-center rounded-[8px] bg-[#FAF5EE] dark:bg-[#2A2420] border-2 border-[#2B2623] shadow-[1px_1.5px_0px_#2B2623]"
              />
            </div>

            <div className="flex-1 min-w-[180px]">
              <Input
                type="text"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="Tiêu đề chương (ví dụ: Những bông tuyết đầu tiên...)"
                className="w-full h-8 text-xs font-serif font-bold rounded-[8px] bg-[#FAF5EE] dark:bg-[#2A2420] border-2 border-[#2B2623] shadow-[1px_1.5px_0px_#2B2623]"
              />
            </div>
          </div>

          {/* Quick Toolbar: Password Toggle, Text Cleaners, Word Counter */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Password Toggle Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPasswordBox((prev) => !prev)}
              className={`h-8 px-2.5 text-xs rounded-xl font-mono font-bold border-2 border-[#2B2623] shadow-[1px_1.5px_0px_#2B2623] flex items-center gap-1 ${
                chapterPassword
                  ? "bg-[#EBBAB5] text-[#2B2623]"
                  : "bg-[#FAF5EE] dark:bg-[#2A2420] text-[#5C5146]"
              }`}
              title="Thiết lập mật khẩu bảo vệ chương"
            >
              <Lock className="size-3" />
              <span>{chapterPassword ? "Đã khóa Pass" : "Đặt Pass"}</span>
            </Button>

            {/* Formatting Quick Tools */}
            <div className="hidden md:flex items-center gap-1 bg-[#E5DDD2] dark:bg-[#2A2420] p-0.5 rounded-lg border border-[#2B2623]/30">
              <button
                type="button"
                onClick={() => handleCleanText("quotes")}
                className="p-1 rounded text-xs hover:bg-[#FAF5EE] dark:hover:bg-[#1F1B18] text-[#5C5146]"
                title="Chuẩn hóa dấu ngoặc kép & dấu câu"
              >
                <Quote className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleCleanText("spacing")}
                className="p-1 rounded text-xs hover:bg-[#FAF5EE] dark:hover:bg-[#1F1B18] text-[#5C5146]"
                title="Dọn dẹp dòng trống thừa"
              >
                <Scissors className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleCleanText("wrapP")}
                className="p-1 rounded text-xs hover:bg-[#FAF5EE] dark:hover:bg-[#1F1B18] text-[#5C5146]"
                title="Tự động bọc các dòng thành thẻ đoạn <p>"
              >
                <AlignLeft className="size-3.5" />
              </button>
            </div>

            {/* Live Word Count Indicator */}
            <div className="px-2.5 py-1 rounded-[8px] bg-[#E5DDD2] dark:bg-[#2A2420] border border-[#2B2623]/30 text-[11px] font-mono text-[#5C5146] dark:text-[#C4B9AD] font-bold">
              <span>{wordCount.toLocaleString("vi-VN")} từ</span>
              <span className="mx-1">•</span>
              <span>{charCount.toLocaleString("vi-VN")} ký tự</span>
            </div>
          </div>
        </div>
      )}

      {/* Password & Hint Dropdown Box */}
      {targetType === "chapter" && showPasswordBox && (
        <div className="p-3 sm:px-6 bg-[#EBBAB5]/30 border-b-2 border-[#2B2623]/20 flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-[#2B2623]" />
            <span className="font-bold">Mật khẩu chương:</span>
            <Input
              type="text"
              value={chapterPassword}
              onChange={(e) => setChapterPassword(e.target.value)}
              placeholder="Nhập pass (ví dụ: haianhem)"
              className="w-40 h-7 text-xs rounded bg-[#FAF5EE] border-2 border-[#2B2623]"
            />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <span className="font-bold text-[#5C5146]">Gợi ý giải pass:</span>
            <Input
              type="text"
              value={chapterPasswordHint}
              onChange={(e) => setChapterPasswordHint(e.target.value)}
              placeholder="Gợi ý câu hỏi để độc giả tìm mật khẩu..."
              className="flex-1 h-7 text-xs rounded bg-[#FAF5EE] border-2 border-[#2B2623]"
            />
          </div>
        </div>
      )}

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* VIEW MODE 1: VISUAL (Tiptap) */}
        {viewMode === "visual" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
            <TiptapEditor
              value={htmlContent}
              onChange={(newHtml) => setHtmlContent(newHtml)}
            />
          </div>
        )}

        {/* VIEW MODE 2: CODE (CodeMirror) */}
        {viewMode === "code" && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <CodeMirrorEditor
              value={htmlContent}
              onChange={(newCode) => setHtmlContent(newCode)}
            />
          </div>
        )}

        {/* VIEW MODE 3: SPLIT (Code/Visual + Live Preview) */}
        {viewMode === "split" && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left Split Pane: Editor */}
            <div className="flex-1 flex flex-col h-1/2 md:h-full md:w-1/2 border-b md:border-b-0 md:border-r border-[#2B2623]/20 overflow-hidden bg-background">
              {/* Split Editor Header Tab */}
              <div className="h-8 border-b border-[#2B2623]/10 bg-[#E5DDD2]/50 dark:bg-[#2A2420] px-3 flex items-center justify-between text-[11px] font-mono text-[#5C5146] shrink-0">
                <span className="font-bold flex items-center gap-1.5">
                  {splitEditorType === "code" ? (
                    <Code2 className="size-3 text-[#E07B4C]" />
                  ) : (
                    <FileText className="size-3 text-[#E07B4C]" />
                  )}
                  {splitEditorType === "code" ? "MÃ NGUỒN HTML" : "TRÌNH SOẠN THẢO TRỰC QUAN"}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSplitEditorType("code")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      splitEditorType === "code"
                        ? "bg-[#FAF5EE] text-[#2B2623] shadow-xs"
                        : "text-[#5C5146] hover:text-[#2B2623]"
                    }`}
                  >
                    HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitEditorType("visual")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      splitEditorType === "visual"
                        ? "bg-[#FAF5EE] text-[#2B2623] shadow-xs"
                        : "text-[#5C5146] hover:text-[#2B2623]"
                    }`}
                  >
                    Visual
                  </button>
                </div>
              </div>

              {/* Active Editor in Split */}
              <div className="flex-1 overflow-hidden">
                {splitEditorType === "code" ? (
                  <CodeMirrorEditor
                    value={htmlContent}
                    onChange={(newCode) => setHtmlContent(newCode)}
                  />
                ) : (
                  <TiptapEditor
                    value={htmlContent}
                    onChange={(newHtml) => setHtmlContent(newHtml)}
                  />
                )}
              </div>
            </div>

            {/* Right Split Pane: Live Preview */}
            <div className="flex-1 flex flex-col h-1/2 md:h-full md:w-1/2 overflow-hidden bg-[#FAF5EE] dark:bg-[#1A1614]">
              <div className="h-8 border-b border-[#2B2623]/10 bg-[#E5DDD2]/50 dark:bg-[#2A2420] px-3 flex items-center justify-between text-[11px] font-mono text-[#5C5146] shrink-0">
                <span className="font-bold flex items-center gap-1.5">
                  <Eye className="size-3 text-[#E07B4C]" />
                  XEM TRƯỚC THỜI GIAN THỰC (LIVE PREVIEW)
                </span>
                <span className="text-[10px] italic text-[#5C5146]/70">
                  {targetType === "story" ? "Bố cục Trang Giới Thiệu" : "Giao diện Bài Đọc"}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <LivePreview
                  content={htmlContent}
                  customCss={customCss}
                  chapters={currentStory?.chapters || []}
                  storySlug={currentStory?.slug}
                />
              </div>
            </div>
          </div>
        )}

        {/* Custom CSS Slide Drawer (for story mode) */}
        {targetType === "story" && isCssDrawerOpen && (
          <aside className="absolute right-0 top-0 bottom-0 w-80 sm:w-96 bg-[#FAF5EE] dark:bg-[#1F1B18] border-l-2 border-[#2B2623] shadow-2xl z-40 flex flex-col">
            <div className="h-10 border-b border-[#2B2623]/20 px-3 flex items-center justify-between bg-[#E5DDD2]/60 font-mono text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <Palette className="size-3.5 text-[#E07B4C]" />
                CUSTOM CSS RIÊNG
              </span>
              <button
                type="button"
                onClick={() => setIsCssDrawerOpen(false)}
                className="text-xs hover:text-rose-500 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <CodeMirrorEditor
                value={customCss}
                onChange={(newCss) => setCustomCss(newCss)}
              />
            </div>
          </aside>
        )}
      </div>

      {/* 4. Bottom Quick Insertion & Action Footer */}
      <footer className="h-8 border-t border-[#2B2623]/15 bg-[#FAF5EE] dark:bg-[#1F1B18] px-3 sm:px-6 flex items-center justify-between text-[11px] font-mono text-[#5C5146] dark:text-[#C4B9AD] shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="font-bold shrink-0 text-[#2B2623] dark:text-[#FAF5EE]">
            Chèn nhanh:
          </span>
          <button
            type="button"
            onClick={() => handleInsertSnippet("<blockquote>\n  <p>“Trích dẫn thư từ hoặc ký ức ở đây...”</p>\n</blockquote>")}
            className="px-2 py-0.5 rounded bg-[#E5DDD2] hover:bg-[#E07B4C] hover:text-white dark:bg-[#2A2420] text-[#2B2623] dark:text-[#FAF5EE] font-bold border border-[#2B2623]/20 shrink-0"
          >
            + Trích dẫn
          </button>
          <button
            type="button"
            onClick={() => handleInsertSnippet('<div style="text-align: center; margin: 25px 0;">\n  ❄ • • • ❄\n</div>')}
            className="px-2 py-0.5 rounded bg-[#E5DDD2] hover:bg-[#E07B4C] hover:text-white dark:bg-[#2A2420] text-[#2B2623] dark:text-[#FAF5EE] font-bold border border-[#2B2623]/20 shrink-0"
          >
            + Phân cảnh hoa tuyết
          </button>
          <button
            type="button"
            onClick={() => handleInsertSnippet('<InlineFootnote id="1" text="Nội dung chú thích giải nghĩa từ ngữ ở đây" />')}
            className="px-2 py-0.5 rounded bg-[#E5DDD2] hover:bg-[#E07B4C] hover:text-white dark:bg-[#2A2420] text-[#2B2623] dark:text-[#FAF5EE] font-bold border border-[#2B2623]/20 shrink-0"
          >
            + Chú thích #1
          </button>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline">Ctrl + S để lưu</span>
          <button
            type="button"
            onClick={() => setIsSaveSnippetModalOpen(true)}
            className="hover:text-[#E07B4C] font-bold"
          >
            Lưu thành mẫu riêng →
          </button>
        </div>
      </footer>

      {/* 5. Templates Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        customTemplates={templates}
        onSelectTemplate={handleSelectTemplate}
        onSaveCurrentAsSnippet={() => {
          setIsTemplateModalOpen(false);
          setIsSaveSnippetModalOpen(true);
        }}
      />

      {/* 6. Save Snippet Modal */}
      {isSaveSnippetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-[20px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] p-5 shadow-[4px_5px_0px_#2B2623]">
            <h3 className="font-serif text-base font-bold text-[#2B2623] dark:text-[#FAF5EE] mb-2">
              Lưu Thành Mẫu Riêng (Snippet)
            </h3>
            <p className="text-xs text-[#5C5146] dark:text-[#C4B9AD] mb-4">
              Lưu toàn bộ nội dung hiện tại thành một mẫu có thể tái sử dụng cho các chương hoặc tác phẩm khác.
            </p>
            <div className="space-y-3">
              <Input
                value={snippetTitle}
                onChange={(e) => setSnippetTitle(e.target.value)}
                placeholder="Tên mẫu (ví dụ: Mẫu Thư Từ Vintage)"
                className="h-9 text-xs rounded-[10px] border-2 border-[#2B2623]"
              />
              <Input
                value={snippetDesc}
                onChange={(e) => setSnippetDesc(e.target.value)}
                placeholder="Mô tả ngắn gọn về mẫu này..."
                className="h-9 text-xs rounded-[10px] border-2 border-[#2B2623]"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSaveSnippetModalOpen(false)}
                className="rounded-[10px] text-xs font-mono"
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleSaveSnippet}
                disabled={isPending || !snippetTitle.trim()}
                className="rounded-[10px] text-xs font-mono bg-[#E07B4C] hover:bg-[#DC7648] text-white"
              >
                {isPending ? "Đang lưu..." : "Xác nhận lưu"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
