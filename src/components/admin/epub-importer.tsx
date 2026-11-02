"use client";

import * as React from "react";
import {
  FileText,
  Upload,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ArrowRight,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  parseEpubInBrowser,
  parseRawTextInBrowser,
  type ParsedChapter,
} from "@/lib/client-epub-parser";
import type { AdminStoryItem } from "@/app/admin/actions";

interface EpubImporterProps {
  stories: AdminStoryItem[];
}

export function EpubImporter({ stories }: EpubImporterProps) {
  const [selectedStoryId, setSelectedStoryId] = React.useState<string>(
    stories[0]?.id || ""
  );
  const [importType, setImportType] = React.useState<"epub" | "raw">("epub");
  const [rawText, setRawText] = React.useState("");
  const [mode, setMode] = React.useState<"append" | "replace">("append");
  const [file, setFile] = React.useState<File | null>(null);

  // Client parsing state & progress
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [parsingProgress, setParsingProgress] = React.useState<{
    percent: number;
    currentChapter: string;
  } | null>(null);

  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    text: string;
    count?: number;
    wordCount?: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setFeedback(null);
    }
  };

  const handleStartImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoryId) {
      alert("Vui lòng chọn bộ truyện đích!");
      return;
    }

    if (importType === "epub" && !file) {
      alert("Vui lòng chọn file .epub!");
      return;
    }

    if (importType === "raw" && !rawText.trim()) {
      alert("Vui lòng dán nội dung văn bản!");
      return;
    }

    setIsProcessing(true);
    setFeedback(null);

    try {
      let parsedChapters: ParsedChapter[] = [];

      // 1. Process 100% on Client Browser to protect Cloudflare Worker Free 10ms CPU limit!
      if (importType === "epub" && file) {
        setParsingProgress({ percent: 10, currentChapter: "Đang giải nén file EPUB..." });
        parsedChapters = await parseEpubInBrowser(file, (percent, chapterTitle) => {
          setParsingProgress({ percent, currentChapter: `Bóc tách: ${chapterTitle}` });
        });
      } else {
        setParsingProgress({ percent: 50, currentChapter: "Đang phân tích cấu trúc văn bản..." });
        parsedChapters = parseRawTextInBrowser(rawText);
      }

      if (parsedChapters.length === 0) {
        throw new Error("Không trích xuất được chương truyện nào từ nguồn đã chọn.");
      }

      const totalWords = parsedChapters.reduce((acc, c) => acc + c.wordCount, 0);

      setParsingProgress({
        percent: 95,
        currentChapter: `Đang gửi ${parsedChapters.length} chương sạch lên Cloudflare D1...`,
      });

      // 2. Send clean parsed JSON to Cloudflare D1 Worker API
      const res = await fetch("/api/chapters/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyId: selectedStoryId,
          mode,
          chaptersList: parsedChapters,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setFeedback({
          type: "success",
          text: result.message,
          count: result.importedCount || parsedChapters.length,
          wordCount: totalWords,
        });
        if (importType === "raw") setRawText("");
        setFile(null);
      } else {
        setFeedback({ type: "error", text: result.message });
      }
    } catch (err: unknown) {
      console.error("Client import error:", err);
      setFeedback({
        type: "error",
        text: (err as Error)?.message || "Đã xảy ra lỗi khi xử lý trên trình duyệt.",
      });
    } finally {
      setIsProcessing(false);
      setParsingProgress(null);
    }
  };

  const selectedStory = stories.find((s) => s.id === selectedStoryId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
        <div>
          <h2 className="font-serif text-2xl font-medium text-foreground">
            Bóc Tách & Import EPUB Client-Side
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Xử lý unzipping và bóc tách HTML 100% trên trình duyệt (tránh vượt giới hạn 10ms CPU của Cloudflare Workers Free).
          </p>
        </div>

        <Badge
          variant="outline"
          className="text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 flex items-center gap-1.5 py-1 px-2.5"
        >
          <Cpu className="size-3 text-emerald-600" />
          <span>Zero Server CPU Spike</span>
        </Badge>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
              : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="size-5 shrink-0 text-rose-600" />
          )}
          <div>
            <p className="font-medium">{feedback.text}</p>
            {feedback.count && (
              <p className="text-[11px] opacity-80 mt-0.5 font-mono">
                Thống kê: {feedback.count} chương • {feedback.wordCount?.toLocaleString("vi-VN")} chữ • Đã lưu vào D1 Database.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Progress Box during client parsing */}
      {parsingProgress && (
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-amber-900 dark:text-amber-200 font-medium">
            <span className="truncate max-w-sm">{parsingProgress.currentChapter}</span>
            <span className="font-mono">{parsingProgress.percent}%</span>
          </div>
          <div className="w-full h-1.5 bg-amber-200/60 dark:bg-amber-900/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-600 transition-all duration-200"
              style={{ width: `${parsingProgress.percent}%` }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleStartImport} className="space-y-6">
        {/* Step 1: Select Story */}
        <div className="p-5 rounded-3xl bg-card border border-border/70 shadow-xs space-y-3">
          <label className="block text-sm font-medium text-foreground">
            1. Chọn bộ truyện đích cần nạp chương:
          </label>
          <select
            value={selectedStoryId}
            onChange={(e) => setSelectedStoryId(e.target.value)}
            className="w-full h-10 rounded-xl px-3.5 bg-background border border-border/80 text-sm text-foreground focus:ring-1 focus:ring-ring"
          >
            {stories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.author}) — Hiện có {s._count?.chapters || 0} chương
              </option>
            ))}
          </select>

          {selectedStory && (
            <p className="text-xs text-muted-foreground font-mono">
              Đường dẫn truyện: /truyen/{selectedStory.slug}
            </p>
          )}
        </div>

        {/* Step 2: Choose Import Method */}
        <div className="p-5 rounded-3xl bg-card border border-border/70 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <span className="text-sm font-medium text-foreground">
              2. Phương thức nhập dữ liệu:
            </span>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary text-xs">
              <button
                type="button"
                onClick={() => setImportType("epub")}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium ${
                  importType === "epub"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileCode className="size-3.5" />
                <span>File .EPUB (Client parse)</span>
              </button>
              <button
                type="button"
                onClick={() => setImportType("raw")}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium ${
                  importType === "raw"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="size-3.5" />
                <span>Văn bản thô (Raw text)</span>
              </button>
            </div>
          </div>

          {importType === "epub" ? (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-muted-foreground">
                Tải lên file sách điện tử định dạng <span className="text-foreground font-mono">.epub</span>:
              </label>

              <div className="border-2 border-dashed border-border/80 hover:border-border rounded-2xl p-8 text-center bg-muted/20 transition-colors">
                <Upload className="size-10 mx-auto text-amber-600 dark:text-amber-400 mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">
                  {file ? file.name : "Kéo thả file .epub vào đây hoặc bấm để chọn"}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {file
                    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Sẽ được xử lý bởi JSZip + DOMParser trên máy bạn`
                    : "Trình duyệt sẽ tự động bóc tách thành các object paragraphs sạch"}
                </p>
                <input
                  type="file"
                  accept=".epub"
                  onChange={handleFileChange}
                  className="hidden"
                  id="epub-file-input"
                />
                <label
                  htmlFor="epub-file-input"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer shadow-xs"
                >
                  <BookOpen className="size-3.5" />
                  <span>{file ? "Chọn file khác" : "Chọn file từ máy tính"}</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-muted-foreground">
                  Dán nội dung truyện (hệ thống tự động nhận diện tiêu đề chương):
                </label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Ví dụ: &quot;Chương 1: Khởi đầu&quot;
                </span>
              </div>
              <Textarea
                rows={10}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Chương 1: Tiêu đề chương một
Nội dung đoạn văn thứ nhất...
Nội dung đoạn văn thứ hai...

Chương 2: Tiêu đề chương hai
Nội dung chương hai..."
                className="rounded-2xl text-xs font-sans leading-relaxed bg-background border-border/80"
              />
            </div>
          )}

          {/* Append vs Replace */}
          <div className="pt-3 border-t border-border/50">
            <span className="block text-xs font-medium text-muted-foreground mb-2">
              Chế độ nạp chương vào cơ sở dữ liệu:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-2xl border text-xs cursor-pointer flex items-start gap-2.5 transition-all ${
                  mode === "append"
                    ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800"
                    : "bg-muted/20 border-border/70"
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  checked={mode === "append"}
                  onChange={() => setMode("append")}
                  className="mt-0.5 text-amber-600"
                />
                <div>
                  <strong className="block text-foreground font-medium mb-0.5">
                    Nối tiếp (Append)
                  </strong>
                  <span className="text-muted-foreground text-[11px] leading-relaxed">
                    Đánh số thứ tự chương tiếp theo sau các chương hiện có của truyện.
                  </span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border text-xs cursor-pointer flex items-start gap-2.5 transition-all ${
                  mode === "replace"
                    ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900"
                    : "bg-muted/20 border-border/70"
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  checked={mode === "replace"}
                  onChange={() => setMode("replace")}
                  className="mt-0.5 text-rose-600"
                />
                <div>
                  <strong className="block text-foreground font-medium mb-0.5">
                    Ghi đè (Replace)
                  </strong>
                  <span className="text-muted-foreground text-[11px] leading-relaxed">
                    Xóa toàn bộ các chương cũ của bộ truyện này trước khi nạp mới.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            disabled={isProcessing}
            className="rounded-xl text-xs h-10 px-6 flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="size-3.5" />
            <span>
              {isProcessing
                ? "Đang bóc tách & nạp D1..."
                : "Bắt đầu bóc tách & Import chương"}
            </span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
