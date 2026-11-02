"use client";

import * as React from "react";
import Link from "next/link";
import {
  Flag,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit3,
  X,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  resolveTypoAndFixParagraph,
  type TypoReportItem,
} from "@/app/admin/actions";

interface TypoManagerProps {
  initialReports: TypoReportItem[];
}

export function TypoManager({ initialReports }: TypoManagerProps) {
  const [reports, setReports] = React.useState<TypoReportItem[]>(initialReports);
  const [filter, setFilter] = React.useState<"all" | "unresolved" | "resolved">("unresolved");

  // Edit Modal State
  const [activeReport, setActiveReport] = React.useState<TypoReportItem | null>(null);
  const [editedText, setEditedText] = React.useState("");
  const [isPending, startTransition] = React.useTransition();
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const filteredReports = React.useMemo(() => {
    if (filter === "unresolved") return reports.filter((r) => !r.isResolved);
    if (filter === "resolved") return reports.filter((r) => r.isResolved);
    return reports;
  }, [reports, filter]);

  const openEditor = (report: TypoReportItem) => {
    setActiveReport(report);
    setEditedText(report.currentParagraphText);
    setFeedback(null);
  };

  const handleSaveCorrection = () => {
    if (!activeReport || !editedText.trim()) return;

    setFeedback(null);
    startTransition(async () => {
      const res = await resolveTypoAndFixParagraph(
        activeReport.id,
        activeReport.chapterId,
        activeReport.paragraphIndex,
        editedText
      );

      if (res.success) {
        setFeedback({ type: "success", text: res.message });
        // Update local state
        setReports((prev) =>
          prev.map((r) =>
            r.id === activeReport.id
              ? {
                  ...r,
                  isResolved: true,
                  currentParagraphText: editedText.trim(),
                }
              : r
          )
        );
        setTimeout(() => {
          setActiveReport(null);
        }, 1200);
      } else {
        setFeedback({ type: "error", text: res.message });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h2 className="font-serif text-2xl font-medium text-foreground">
            Quản Lý Báo Lỗi Chính Tả
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Xem các phản ánh lỗi câu chữ từ độc giả, sửa trực tiếp đoạn văn trong bảng{" "}
            <code className="font-mono text-amber-700 dark:text-amber-300">Chapter</code> và làm mới cache.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary text-xs">
          <button
            onClick={() => setFilter("unresolved")}
            className={`px-3 py-1 rounded-lg transition-colors font-medium ${
              filter === "unresolved"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Chưa xử lý ({reports.filter((r) => !r.isResolved).length})
          </button>
          <button
            onClick={() => setFilter("resolved")}
            className={`px-3 py-1 rounded-lg transition-colors font-medium ${
              filter === "resolved"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Đã xử lý ({reports.filter((r) => r.isResolved).length})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-lg transition-colors font-medium ${
              filter === "all"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tất cả ({reports.length})
          </button>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-muted/20 border border-dashed border-border/80">
          <CheckCircle2 className="size-10 mx-auto text-emerald-500 mb-2.5" />
          <h3 className="font-serif text-lg font-medium text-foreground">
            Tuyệt vời! Không có báo lỗi nào cần xử lý
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Toàn bộ các báo cáo lỗi chính tả đã được giải quyết hoặc chưa có phản ánh mới.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className={`p-5 rounded-2xl border transition-all ${
                report.isResolved
                  ? "bg-card/60 border-border/60 opacity-80"
                  : "bg-card border-rose-200/80 dark:border-rose-900/60 shadow-xs"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-3 border-b border-border/50">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Badge */}
                  {report.isResolved ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300"
                    >
                      <Check className="size-2.5 mr-1" /> Đã sửa
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300"
                    >
                      <Flag className="size-2.5 mr-1" /> Chờ xử lý
                    </Badge>
                  )}

                  <span className="font-serif text-sm font-semibold text-foreground">
                    {report.chapter.story.title}
                  </span>
                  <span className="text-muted-foreground text-xs">•</span>
                  <span className="font-mono text-xs text-foreground/80">
                    Chương {report.chapter.chapterNumber}: {report.chapter.title}
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    Đoạn #{report.paragraphIndex}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                  <span>
                    Báo bởi: <strong className="text-foreground">{report.authorName}</strong>
                  </span>
                  <span>
                    {new Date(report.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Reporter comment & Current paragraph */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 text-xs">
                {/* Note from reader */}
                <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-rose-800 dark:text-rose-300 font-semibold block mb-1">
                    Góp ý từ người đọc:
                  </span>
                  <p className="text-foreground/90 leading-relaxed font-sans italic">
                    &ldquo;{report.content}&rdquo;
                  </p>
                </div>

                {/* Current paragraph text */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1">
                    Nội dung đoạn văn hiện tại trong chương:
                  </span>
                  <p className="text-foreground/85 leading-relaxed font-serif line-clamp-3">
                    {report.currentParagraphText}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex items-center justify-between">
                <Link
                  href={`/chuong/${report.chapterId}`}
                  target="_blank"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono"
                >
                  <ExternalLink className="size-3" />
                  <span>Xem chương trên web</span>
                </Link>

                <Button
                  size="sm"
                  onClick={() => openEditor(report)}
                  className="rounded-xl text-xs h-8 px-3.5 flex items-center gap-1.5 shadow-xs"
                >
                  <Edit3 className="size-3" />
                  <span>{report.isResolved ? "Chỉnh sửa lại" : "Sửa đoạn văn này"}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Direct Fix Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl p-6 rounded-3xl bg-card border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Chỉnh sửa trực tiếp cơ sở dữ liệu
                </span>
                <h3 className="font-serif text-lg font-medium text-foreground">
                  Sửa Đoạn Văn #{activeReport.paragraphIndex} — {activeReport.chapter.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveReport(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
                  feedback.type === "success"
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="size-4 shrink-0 text-rose-600" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            {/* Reporter prompt reminder */}
            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 mb-4 text-xs">
              <span className="font-semibold text-amber-900 dark:text-amber-200 block mb-0.5">
                Độc giả ({activeReport.authorName}) phản ánh:
              </span>
              <p className="text-amber-800/90 dark:text-amber-300 italic">
                &ldquo;{activeReport.content}&rdquo;
              </p>
            </div>

            {/* Live Textarea Editor */}
            <div className="space-y-1.5 mb-5">
              <label className="block text-xs font-medium text-foreground">
                Nội dung đoạn văn mới (sẽ cập nhật ngay vào bảng Chapter):
              </label>
              <Textarea
                rows={6}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="rounded-2xl text-sm font-serif leading-relaxed bg-background border-border/80"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveReport(null)}
                className="rounded-xl text-xs h-9"
              >
                Hủy bỏ
              </Button>
              <Button
                size="sm"
                disabled={isPending || !editedText.trim()}
                onClick={handleSaveCorrection}
                className="rounded-xl text-xs h-9 px-4 flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="size-3" />
                <span>
                  {isPending ? "Đang lưu..." : "Lưu đoạn văn & Đánh dấu đã sửa"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

