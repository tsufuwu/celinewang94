"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  saveStoryContentHtml,
  saveChapterContentHtml,
  saveEditorTemplate,
  EditorTemplateItem,
} from "@/app/admin/actions";
import { CodeMirrorEditor } from "./codemirror-editor";
import { TiptapEditor } from "./tiptap-editor";
import { LivePreview } from "./live-preview";
import { TemplateModal } from "./template-modal";
import { Button } from "@/components/ui/button";
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
  BookmarkPlus,
  Palette,
  ExternalLink,
} from "lucide-react";

export interface EditorStoryOption {
  id: string;
  slug: string;
  title: string;
  author: string;
  contentHtml?: string | null;
  customCss?: string | null;
  chapters: {
    id: string;
    chapterNumber: number;
    title: string;
    contentHtml?: string | null;
    password?: string | null;
  }[];
}

interface StudioEditorProps {
  stories: EditorStoryOption[];
  initialTemplates?: EditorTemplateItem[];
}

export function StudioEditor({ stories, initialTemplates = [] }: StudioEditorProps) {
  const searchParams = useSearchParams();

  // 1. Target States
  const urlStoryId = searchParams.get("storyId") || stories[0]?.id || "";
  const urlChapterId = searchParams.get("chapterId") || "";

  const [targetType, setTargetType] = React.useState<"story" | "chapter">(
    urlChapterId ? "chapter" : "story"
  );
  const [selectedStoryId, setSelectedStoryId] = React.useState<string>(urlStoryId);
  const [selectedChapterId, setSelectedChapterId] = React.useState<string>(urlChapterId);

  // Active Story & Chapter
  const currentStory = React.useMemo(() => {
    return stories.find((s) => s.id === selectedStoryId) || stories[0];
  }, [stories, selectedStoryId]);

  const currentChapter = React.useMemo(() => {
    if (!currentStory) return null;
    return currentStory.chapters.find((c) => c.id === selectedChapterId) || currentStory.chapters[0] || null;
  }, [currentStory, selectedChapterId]);

  // Content States
  const [htmlContent, setHtmlContent] = React.useState<string>("");
  const [customCss, setCustomCss] = React.useState<string>("");
  const [isCssDrawerOpen, setIsCssDrawerOpen] = React.useState(false);

  // Load initial content when story/chapter selection changes
  React.useEffect(() => {
    if (targetType === "story" && currentStory) {
      setHtmlContent(currentStory.contentHtml || "");
      setCustomCss(currentStory.customCss || "");
    } else if (targetType === "chapter" && currentChapter) {
      setHtmlContent(currentChapter.contentHtml || "");
    }
  }, [targetType, currentStory, currentChapter]);

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
    startTransition(async () => {
      try {
        let res: { success: boolean; message: string };

        if (targetType === "story") {
          if (!currentStory) return;
          res = await saveStoryContentHtml(currentStory.id, htmlContent, customCss);
        } else {
          if (!currentChapter) return;
          res = await saveChapterContentHtml(currentChapter.id, htmlContent);
        }

        if (res.success) {
          setFeedback({ type: "success", text: res.message });
          setTimeout(() => setFeedback(null), 3500);
        } else {
          setFeedback({ type: "error", text: res.message });
        }
      } catch (err: unknown) {
        setFeedback({ type: "error", text: (err as Error)?.message || "Lỗi lưu dữ liệu." });
      }
    });
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

  // Calculate stats
  const charCount = htmlContent.length;
  const wordCount = htmlContent
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden select-none">
      {/* 1. Studio Sticky Top Control Bar */}
      <header className="h-14 border-b border-border/80 bg-background/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-30">
        {/* Left: Back + Target Pickers */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-mono transition-colors"
            title="Về Bàn làm việc Quản trị"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>

          <div className="h-4 w-px bg-border/80 hidden sm:block" />

          {/* Target Type Switcher (Trang Truyện / Chương) */}
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl border border-border/70 text-xs">
            <button
              type="button"
              onClick={() => setTargetType("story")}
              className={`px-2.5 py-1 rounded-lg font-serif transition-all ${
                targetType === "story"
                  ? "bg-background text-foreground font-medium shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Trang Giới Thiệu
            </button>
            <button
              type="button"
              onClick={() => setTargetType("chapter")}
              className={`px-2.5 py-1 rounded-lg font-serif transition-all ${
                targetType === "chapter"
                  ? "bg-background text-foreground font-medium shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Nội Dung Chương
            </button>
          </div>

          {/* Story Selector */}
          <select
            value={selectedStoryId}
            onChange={(e) => {
              setSelectedStoryId(e.target.value);
              const st = stories.find((s) => s.id === e.target.value);
              if (st && st.chapters.length > 0) {
                setSelectedChapterId(st.chapters[0].id);
              }
            }}
            className="h-8 max-w-[150px] sm:max-w-[200px] text-xs font-serif rounded-xl px-2.5 bg-muted/30 border border-border/80 text-foreground truncate focus:outline-none"
          >
            {stories.map((st) => (
              <option key={st.id} value={st.id}>
                {st.title}
              </option>
            ))}
          </select>

          {/* Chapter Selector (if target is chapter) */}
          {targetType === "chapter" && currentStory && (
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              className="h-8 max-w-[140px] sm:max-w-[180px] text-xs font-mono rounded-xl px-2 bg-muted/30 border border-border/80 text-foreground truncate focus:outline-none"
            >
              {currentStory.chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  Ch.{ch.chapterNumber}: {ch.title}
                </option>
              ))}
            </select>
          )}

          {/* Open live page link */}
          {targetType === "story" && currentStory && (
            <Link
              href={`/truyen/${currentStory.slug}`}
              target="_blank"
              className="text-muted-foreground hover:text-primary transition-colors p-1"
              title="Xem trang thực tế trên web"
            >
              <ExternalLink className="size-3.5" />
            </Link>
          )}
        </div>

        {/* Center: Tri-Mode View Switcher */}
        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl border border-border/70 text-xs font-mono">
          <Button
            type="button"
            variant={viewMode === "visual" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("visual")}
            className="h-7 px-2.5 text-xs rounded-lg flex items-center gap-1"
            title="Chế độ Trực quan Visual WYSIWYG"
          >
            <FileText className="size-3.5" />
            <span className="hidden md:inline">Trực quan</span>
          </Button>

          <Button
            type="button"
            variant={viewMode === "code" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("code")}
            className="h-7 px-2.5 text-xs rounded-lg flex items-center gap-1"
            title="Chế độ Code HTML / CSS Sandbox"
          >
            <Code2 className="size-3.5" />
            <span className="hidden md:inline">Code HTML</span>
          </Button>

          <Button
            type="button"
            variant={viewMode === "split" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("split")}
            className="h-7 px-2.5 text-xs rounded-lg flex items-center gap-1"
            title="Chế độ Chia đôi màn hình Live Preview"
          >
            <Columns2 className="size-3.5" />
            <span className="hidden md:inline">Split Live</span>
          </Button>
        </div>

        {/* Right: Template Button, Custom CSS toggle, Save Button */}
        <div className="flex items-center gap-2">
          {/* Templates Gallery Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsTemplateModalOpen(true)}
            className="h-8 px-3 text-xs rounded-xl border-orange-500/40 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 flex items-center gap-1.5 font-medium shadow-2xs"
          >
            <Sparkles className="size-3.5 text-orange-500" />
            <span className="hidden sm:inline">Chèn Mẫu</span>
          </Button>

          {/* Custom CSS Drawer Toggle (for story mode) */}
          {targetType === "story" && (
            <Button
              type="button"
              variant={isCssDrawerOpen ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setIsCssDrawerOpen((prev) => !prev)}
              className="h-8 px-2.5 text-xs rounded-xl text-muted-foreground hover:text-foreground"
              title="Chỉnh sửa Custom CSS riêng cho trang này"
            >
              <Palette className="size-3.5 mr-1" />
              <span className="hidden lg:inline">CSS</span>
            </Button>
          )}

          {/* Save Button */}
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            className="h-8 px-4 text-xs rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-xs flex items-center gap-1.5"
            title="Lưu nội dung (Ctrl+S)"
          >
            <Save className="size-3.5" />
            <span>{isPending ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
          </Button>
        </div>
      </header>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`px-4 py-2 text-xs font-mono flex items-center justify-between border-b animate-in slide-in-from-top-2 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <Check className="size-4" /> : <AlertCircle className="size-4" />}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Custom CSS Drawer (Collapsible) */}
      {isCssDrawerOpen && targetType === "story" && (
        <div className="border-b border-border/80 bg-muted/40 p-3 sm:px-6 animate-in slide-in-from-top-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold text-foreground flex items-center gap-1.5">
              <Palette className="size-3.5 text-orange-500" />
              <span>CUSTOM CSS CHO TRANG TRUYỆN:</span>
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              (Viết các class CSS tùy biến không cần thẻ &lt;style&gt;)
            </span>
          </div>
          <textarea
            rows={3}
            value={customCss}
            onChange={(e) => setCustomCss(e.target.value)}
            placeholder=".my-custom-box { border: 2px solid #ea580c; border-radius: 8px; }"
            className="w-full p-2.5 rounded-xl font-mono text-xs bg-background border border-border/80 text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      )}

      {/* 2. Main Workspace Surface */}
      <main className="flex-1 overflow-hidden p-2 sm:p-4 bg-muted/10">
        {/* MODE 1: VISUAL WYSIWYG */}
        {viewMode === "visual" && (
          <div className="h-full max-w-4xl mx-auto">
            <TiptapEditor
              value={htmlContent}
              onChange={(val) => setHtmlContent(val)}
            />
          </div>
        )}

        {/* MODE 2: CODE HTML / CSS SANDBOX */}
        {viewMode === "code" && (
          <div className="h-full max-w-5xl mx-auto">
            <CodeMirrorEditor
              value={htmlContent}
              onChange={(val) => setHtmlContent(val)}
            />
          </div>
        )}

        {/* MODE 3: SPLIT LIVE PREVIEW */}
        {viewMode === "split" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full overflow-hidden">
            {/* Left Column: Editor (Choice of Code or Visual) */}
            <div className="lg:col-span-6 flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                  <span>Trình soạn thảo:</span>
                  <button
                    type="button"
                    onClick={() => setSplitEditorType("code")}
                    className={`px-2 py-0.5 rounded-md ${
                      splitEditorType === "code"
                        ? "bg-foreground text-background font-semibold"
                        : "hover:bg-muted"
                    }`}
                  >
                    HTML / CSS
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitEditorType("visual")}
                    className={`px-2 py-0.5 rounded-md ${
                      splitEditorType === "visual"
                        ? "bg-foreground text-background font-semibold"
                        : "hover:bg-muted"
                    }`}
                  >
                    Trực quan
                  </button>
                </div>

                <span className="text-[11px] font-mono text-muted-foreground">
                  {charCount.toLocaleString()} ký tự • {wordCount.toLocaleString()} chữ
                </span>
              </div>

              <div className="flex-1 overflow-hidden">
                {splitEditorType === "code" ? (
                  <CodeMirrorEditor
                    value={htmlContent}
                    onChange={(val) => setHtmlContent(val)}
                  />
                ) : (
                  <TiptapEditor
                    value={htmlContent}
                    onChange={(val) => setHtmlContent(val)}
                  />
                )}
              </div>
            </div>

            {/* Right Column: Live Interactive Preview */}
            <div className="lg:col-span-6 flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-1.5 px-1 text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="size-3.5 text-orange-500" />
                  <span>XEM THỬ THỜI GIAN THỰC (LIVE PREVIEW)</span>
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ● Realtime
                </span>
              </div>

              <div className="flex-1 overflow-hidden">
                <LivePreview
                  content={htmlContent}
                  customCss={customCss}
                  chapters={currentStory?.chapters || []}
                  storySlug={currentStory?.slug || ""}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Bottom Status Bar */}
      <footer className="h-7 border-t border-border/70 bg-background/90 px-4 flex items-center justify-between text-[11px] font-mono text-muted-foreground shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span>
            Đang biên tập:{" "}
            <strong className="text-foreground">
              {targetType === "story" ? currentStory?.title : currentChapter?.title}
            </strong>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            Shortcodes: <code className="text-orange-600 dark:text-orange-400">[muc_luc]</code>,{" "}
            <code className="text-orange-600 dark:text-orange-400">[bgm]</code>,{" "}
            <code className="text-orange-600 dark:text-orange-400">[spoiler]</code>,{" "}
            <code className="text-orange-600 dark:text-orange-400">Từ[[chú thích]]</code>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span>Phím tắt: Ctrl + S</span>
          <span>•</span>
          <button
            type="button"
            onClick={() => setIsSaveSnippetModalOpen(true)}
            className="text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
          >
            <BookmarkPlus className="size-3" />
            <span>Lưu thành mẫu riêng</span>
          </button>
        </div>
      </footer>

      {/* Template Selection Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        customTemplates={templates}
        onSaveCurrentAsSnippet={() => {
          setIsTemplateModalOpen(false);
          setIsSaveSnippetModalOpen(true);
        }}
      />

      {/* Save as Snippet Dialog */}
      {isSaveSnippetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md bg-background rounded-3xl border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-foreground font-serif text-lg font-bold">
              <div className="size-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                <BookmarkPlus className="size-4" />
              </div>
              <h3>Lưu Bố Cục Thành Mẫu Riêng</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Lưu khối HTML &amp; CSS đang soạn thảo thành mẫu riêng để tái sử dụng nhanh chóng cho các truyện sau.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Tiêu đề mẫu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={snippetTitle}
                  onChange={(e) => setSnippetTitle(e.target.value)}
                  placeholder="Ví dụ: Bảng nhân vật 3 cột phong cách hiện đại..."
                  className="w-full h-9 px-3 rounded-xl border border-border bg-muted/20 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Mô tả ngắn
                </label>
                <textarea
                  rows={2}
                  value={snippetDesc}
                  onChange={(e) => setSnippetDesc(e.target.value)}
                  placeholder="Vài dòng mô tả công dụng của mẫu này..."
                  className="w-full p-2.5 rounded-xl border border-border bg-muted/20 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsSaveSnippetModalOpen(false)}
                className="rounded-xl text-xs h-9"
              >
                Hủy
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveSnippet}
                disabled={!snippetTitle.trim() || isPending}
                className="rounded-xl text-xs h-9 px-5 bg-orange-600 hover:bg-orange-700 text-white font-medium"
              >
                {isPending ? "Đang lưu..." : "Lưu vào kho mẫu"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

