"use client";

import * as React from "react";
import { MessageSquare, AlertCircle, Send, CheckCircle2, User, Flag } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createParagraphComment, type ParagraphCommentItem } from "@/app/chuong/[id]/actions";

interface ParagraphSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapterId: string;
  paragraphIndex: number;
  paragraphText: string;
  comments: ParagraphCommentItem[];
  onCommentAdded: (newComment: ParagraphCommentItem) => void;
}

export function ParagraphSheet({
  open,
  onOpenChange,
  chapterId,
  paragraphIndex,
  paragraphText,
  comments,
  onCommentAdded,
}: ParagraphSheetProps) {
  const [authorName, setAuthorName] = React.useState("");
  const [content, setContent] = React.useState("");
  const [isTypoReport, setIsTypoReport] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter comments for this exact paragraph
  const paragraphComments = React.useMemo(() => {
    return comments.filter((c) => c.paragraphIndex === paragraphIndex);
  }, [comments, paragraphIndex]);

  const typoReportsCount = React.useMemo(() => {
    return paragraphComments.filter((c) => c.isTypoReport).length;
  }, [paragraphComments]);

  // Reset form feedback when changing paragraph
  React.useEffect(() => {
    setFeedback(null);
  }, [paragraphIndex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await createParagraphComment(
        chapterId,
        paragraphIndex,
        authorName,
        content,
        isTypoReport
      );

      if (res.success && res.newComment) {
        onCommentAdded(res.newComment);
        setContent("");
        setIsTypoReport(false);
        setFeedback({ type: "success", text: res.message });
      } else {
        setFeedback({ type: "error", text: res.message });
      }
    } catch {
      setFeedback({ type: "error", text: "Đã có lỗi xảy ra. Vui lòng thử lại sau." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-6 flex flex-col justify-between overflow-y-auto"
      >
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-muted-foreground mb-0.5">
                <MessageSquare className="size-3.5 text-amber-500" />
                <span>Bình luận đoạn văn</span>
              </div>
              <SheetTitle className="font-serif text-lg font-medium text-foreground">
                Đoạn số #{paragraphIndex}
              </SheetTitle>
            </div>

            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[11px] font-mono">
                {paragraphComments.length} bình luận
              </Badge>
              {typoReportsCount > 0 && (
                <Badge
                  variant="outline"
                  className="text-[11px] font-mono bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300"
                >
                  {typoReportsCount} báo lỗi
                </Badge>
              )}
            </div>
          </div>

          {/* Quoted paragraph text */}
          <div className="relative">
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block mb-1">
              Trích dẫn đoạn văn:
            </span>
            <blockquote className="border-l-3 border-amber-500/80 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-r-xl italic text-xs text-foreground/85 leading-relaxed font-serif max-h-36 overflow-y-auto">
              &ldquo;{paragraphText}&rdquo;
            </blockquote>
          </div>

          {/* Comments List */}
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-3">
              Thảo luận & Báo lỗi ({paragraphComments.length})
            </span>

            {paragraphComments.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border/70 bg-muted/20">
                <p className="text-xs text-muted-foreground font-sans">
                  Chưa có bình luận nào cho đoạn này. Hãy là người đầu tiên chia sẻ cảm nghĩ hoặc báo lỗi chính tả nhé!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {paragraphComments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-xl border text-xs leading-relaxed ${
                      comment.isTypoReport
                        ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/50"
                        : "bg-muted/40 border-border/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <User className="size-3 text-muted-foreground" />
                        <span>{comment.authorName}</span>
                        {comment.isTypoReport && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-rose-300 flex items-center gap-0.5"
                          >
                            <Flag className="size-2.5" />
                            <span>Báo lỗi</span>
                          </Badge>
                        )}
                      </div>
                      <time className="text-[10px] font-mono text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                    <p className="text-foreground/90 font-sans whitespace-pre-line pl-4">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* New Comment / Typo Report Form */}
        <form onSubmit={handleSubmit} className="pt-4 border-t border-border/60 mt-4 space-y-3">
          {feedback && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="size-3.5 shrink-0" />
              ) : (
                <AlertCircle className="size-3.5 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          <div className="space-y-2">
            <Input
              required
              maxLength={40}
              placeholder="Tên / Bút danh của bạn..."
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="h-8.5 text-xs rounded-xl bg-background border-border/80"
            />
            <Textarea
              required
              rows={2}
              maxLength={500}
              placeholder={
                isTypoReport
                  ? "Mô tả từ ngữ bị lỗi, thiếu dấu, sai chính tả ở đoạn này..."
                  : "Viết cảm nghĩ của bạn về đoạn văn này..."
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="text-xs rounded-xl bg-background border-border/80 resize-none leading-relaxed"
            />
          </div>

          {/* Typo Report Checkbox Toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors">
              <input
                type="checkbox"
                checked={isTypoReport}
                onChange={(e) => setIsTypoReport(e.target.checked)}
                className="size-3.5 rounded-sm border-border text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span className={isTypoReport ? "text-rose-600 dark:text-rose-400 font-medium" : ""}>
                Báo lỗi chính tả / hiển thị ở đoạn này
              </span>
            </label>

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !authorName.trim() || !content.trim()}
              className="rounded-xl h-8 px-3 text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Send className="size-3" />
              <span>{isSubmitting ? "Đang gửi..." : "Gửi"}</span>
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

