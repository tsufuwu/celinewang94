"use client";

import * as React from "react";
import Image from "next/image";
import {
  MessageSquare,
  AlertCircle,
  Send,
  CheckCircle2,
  User,
  Flag,
  Lock,
  Sparkles,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createParagraphComment, type ParagraphCommentItem } from "@/app/chuong/[id]/actions";
import { stripFootnotes } from "./inline-footnote";
import { useAuth } from "@/components/auth/auth-context";

function GoogleIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

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
  const { user, loginWithGoogle } = useAuth();
  const [authorName, setAuthorName] = React.useState("");
  const [content, setContent] = React.useState("");
  const [isTypoReport, setIsTypoReport] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync author name based on Google Auth or localStorage Guest identity
  React.useEffect(() => {
    if (user) {
      setAuthorName(user.nickname || user.name || "Thành viên Google");
    } else {
      const savedGuest = typeof window !== "undefined" ? localStorage.getItem("celine_guest_name") : null;
      if (savedGuest) {
        setAuthorName(savedGuest);
      }
    }
  }, [user]);

  const handleNameChange = (val: string) => {
    if (!user) {
      setAuthorName(val);
      if (typeof window !== "undefined") {
        localStorage.setItem("celine_guest_name", val);
      }
    }
  };

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
    const finalName = user ? (user.nickname || user.name || "Thành viên Google") : authorName;
    if (!finalName.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await createParagraphComment(
        chapterId,
        paragraphIndex,
        finalName,
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
              &ldquo;{stripFootnotes(paragraphText)}&rdquo;
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
                {paragraphComments.map((comment) => {
                  const isAdmin = comment.authorName.includes("[Admin]") || comment.authorName.toLowerCase().includes("celine");
                  const displayName = comment.authorName.replace(/\[Admin\]\s*/g, "");

                  return (
                    <div
                      key={comment.id}
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        comment.isTypoReport
                          ? "bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/50"
                          : "bg-muted/40 border-border/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 font-medium text-foreground flex-wrap">
                          <User className="size-3 text-muted-foreground shrink-0" />
                          <span>{displayName}</span>
                          {isAdmin && (
                            <Badge
                              className="text-[9px] px-1.5 py-0 bg-orange-500 hover:bg-orange-600 text-white font-mono border-0 shadow-2xs"
                            >
                              Quản trị viên
                            </Badge>
                          )}
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
                        <time className="text-[10px] font-mono text-muted-foreground shrink-0">
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
                  );
                })}
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

          {/* User Identity / Auth Section */}
          {user ? (
            /* Logged in with Google - Locked name */
            <div className="p-3 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "Avatar"}
                      width={24}
                      height={24}
                      className="rounded-full ring-1 ring-orange-300 dark:ring-orange-800 shrink-0"
                    />
                  ) : (
                    <div className="size-6 rounded-full bg-orange-200 dark:bg-orange-900 flex items-center justify-center text-[10px] font-bold text-orange-900 dark:text-orange-200 shrink-0">
                      {(user.nickname || user.name || "G")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-foreground truncate">
                    {user.nickname || user.name}
                  </span>
                  {user.role === "ADMIN" ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-orange-500 text-white font-semibold shadow-2xs shrink-0">
                      Quản trị viên
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800 shrink-0">
                      Thành viên Google
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-orange-700 dark:text-orange-400 bg-orange-100/80 dark:bg-orange-950/80 px-2 py-0.5 rounded-md border border-orange-300/60 shrink-0">
                  <Lock className="size-2.5" />
                  <span>Đã khóa tên</span>
                </div>
              </div>

              {/* Readonly locked name field */}
              <div className="relative">
                <Input
                  disabled
                  readOnly
                  value={user.nickname || user.name || ""}
                  className="h-8.5 text-xs rounded-xl bg-background/80 border-orange-200/80 dark:border-orange-900/70 text-foreground font-medium pl-8 pr-8 cursor-not-allowed select-none shadow-2xs"
                />
                <GoogleIcon className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Lock className="size-3 text-orange-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          ) : (
            /* Guest Mode with Option to Login via Google */
            <div className="space-y-2">
              <div className="p-2.5 rounded-2xl bg-secondary/70 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Bình luận với tư cách:</span>
                  <strong className="text-foreground font-medium">Khách vãng lai</strong>
                </div>

                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-xl bg-background hover:bg-orange-50 dark:hover:bg-orange-950/40 text-foreground text-xs font-medium border border-border/80 shadow-2xs hover:border-orange-300 transition-all cursor-pointer active:scale-98 shrink-0"
                >
                  <GoogleIcon className="size-3.5" />
                  <span>Đăng nhập Google</span>
                  <Sparkles className="size-2.5 text-orange-500" />
                </button>
              </div>

              {/* Guest Nickname Input */}
              <div className="relative">
                <Input
                  required
                  maxLength={40}
                  placeholder="Nhập tên hoặc bút danh của bạn..."
                  value={authorName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="h-8.5 text-xs rounded-xl bg-background border-border/80 pl-8"
                />
                <User className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Comment text area */}
          <div>
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

          {/* Typo Report Checkbox Toggle & Submit Button */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors">
              <input
                type="checkbox"
                checked={isTypoReport}
                onChange={(e) => setIsTypoReport(e.target.checked)}
                className="size-3.5 rounded-sm border-border text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span className={isTypoReport ? "text-rose-600 dark:text-rose-400 font-medium" : ""}>
                Báo lỗi chính tả ở đoạn này
              </span>
            </label>

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || (!user && !authorName.trim()) || !content.trim()}
              className="rounded-xl h-8 px-4 text-xs flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white shadow-xs font-medium"
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
