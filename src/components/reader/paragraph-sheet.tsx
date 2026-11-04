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
  Pencil,
  X,
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
  const { user, loginWithGoogle, updateNickname } = useAuth();
  const [content, setContent] = React.useState("");
  const [isTypoReport, setIsTypoReport] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Change Name Modal State
  const [showNameModal, setShowNameModal] = React.useState(false);
  const [newNickname, setNewNickname] = React.useState("");
  const [isSavingName, setIsSavingName] = React.useState(false);
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = React.useState(false);

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

  const handleOpenNameModal = () => {
    if (!user) return;
    setNewNickname(user.nickname || user.name || "");
    setNameError(null);
    setNameSuccess(false);
    setShowNameModal(true);
  };

  const handleSaveNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNickname.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      setNameError("Biệt danh phải từ 2 đến 30 ký tự.");
      return;
    }
    setIsSavingName(true);
    setNameError(null);
    const res = await updateNickname(trimmed);
    setIsSavingName(false);
    if (res.success) {
      setNameSuccess(true);
      setTimeout(() => {
        setShowNameModal(false);
        setNameSuccess(false);
      }, 600);
    } else {
      setNameError(res.error || "Không thể lưu biệt danh. Vui lòng thử lại.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      loginWithGoogle();
      return;
    }
    if (!content.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await createParagraphComment(
        chapterId,
        paragraphIndex,
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
    <>
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

          {/* Comment Form Section - Strictly requires Google Auth */}
          {user ? (
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

              {/* Locked User Profile Bar - Click avatar to edit nickname */}
              <div className="p-3 rounded-[16px] bg-[#FAF5EE] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Clickable Avatar Button */}
                  <button
                    type="button"
                    onClick={handleOpenNameModal}
                    title="Bấm vào avatar để đổi biệt danh hiển thị"
                    className="relative group shrink-0 cursor-pointer focus:outline-none"
                  >
                    <div className="size-9 rounded-full overflow-hidden border-2 border-[#2B2623] shadow-[1px_1px_0px_#2B2623] group-hover:scale-105 group-hover:border-[#E07B4C] transition-all bg-[#E5DDD2] flex items-center justify-center">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name || "Avatar"}
                          width={36}
                          height={36}
                          className="object-cover size-full"
                        />
                      ) : (
                        <span className="text-xs font-bold text-[#2B2623] font-mono">
                          {(user.nickname || user.name || "G")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    {/* Pencil indicator badge */}
                    <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-[#E07B4C] text-white flex items-center justify-center border border-[#2B2623] shadow-xs group-hover:scale-110 transition-transform">
                      <Pencil className="size-2" />
                    </span>
                  </button>

                  {/* Name & Role */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-serif font-bold text-[#2B2623] dark:text-[#FAF5EE] truncate max-w-[130px] sm:max-w-[160px]">
                        {user.nickname || user.name}
                      </span>
                      {user.role === "ADMIN" ? (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-[6px] bg-[#E07B4C] text-white border border-[#2B2623]/30 shrink-0">
                          Quản trị viên
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-[6px] bg-[#BDCEAF] text-[#2B2623] border border-[#2B2623]/30 shrink-0">
                          Thành viên
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenNameModal}
                      className="text-[10px] text-[#E07B4C] hover:text-[#DC7648] hover:underline font-mono inline-flex items-center gap-1 font-semibold mt-0.5 cursor-pointer"
                    >
                      <Pencil className="size-2.5" />
                      <span>Click avatar để đổi tên</span>
                    </button>
                  </div>
                </div>

                {/* Lock Status Pill */}
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD] bg-[#E5DDD2] dark:bg-[#3D352E] px-2 py-1 rounded-[8px] border border-[#2B2623]/30 shrink-0 select-none">
                  <Lock className="size-2.5 text-[#E07B4C]" />
                  <span>Khóa tên</span>
                </div>
              </div>

              {/* Comment text area - No name input field */}
              <div>
                <Textarea
                  required
                  rows={3}
                  maxLength={500}
                  placeholder={
                    isTypoReport
                      ? "Mô tả từ ngữ bị lỗi, thiếu dấu, sai chính tả ở đoạn này..."
                      : "Viết cảm nghĩ của bạn về đoạn văn này..."
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="text-xs rounded-[14px] bg-background border-2 border-[#2B2623]/50 focus-visible:border-[#2B2623] focus-visible:ring-0 resize-none leading-relaxed shadow-[1px_2px_0px_#2B2623]"
                />
              </div>

              {/* Typo Report Checkbox Toggle & Submit Button */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-[#5C5146] dark:text-[#C4B9AD] cursor-pointer select-none hover:text-[#2B2623] transition-colors">
                  <input
                    type="checkbox"
                    checked={isTypoReport}
                    onChange={(e) => setIsTypoReport(e.target.checked)}
                    className="size-3.5 rounded-sm border-border text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <span className={isTypoReport ? "text-rose-600 dark:text-rose-400 font-semibold" : ""}>
                    Báo lỗi chính tả ở đoạn này
                  </span>
                </label>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !content.trim()}
                  className="rounded-[10px] h-8.5 px-4 text-xs flex items-center gap-1.5 bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-bold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="size-3" />
                  <span>{isSubmitting ? "Đang gửi..." : "Gửi"}</span>
                </Button>
              </div>
            </form>
          ) : (
            /* Required Google Sign-in Notice Box */
            <div className="pt-4 border-t border-border/60 mt-4">
              <div className="p-4 rounded-[20px] bg-[#FAF5EE] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] text-center space-y-3">
                <div className="size-10 rounded-full bg-[#E07B4C]/15 text-[#E07B4C] border border-[#E07B4C]/30 flex items-center justify-center mx-auto">
                  <Lock className="size-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#2B2623] dark:text-[#FAF5EE]">
                    Đăng nhập để gửi bình luận
                  </h4>
                  <p className="text-xs text-[#5C5146] dark:text-[#C4B9AD] mt-1 leading-relaxed">
                    Vui lòng đăng nhập bằng Google để tham gia bình luận đoạn văn hoặc báo lỗi chính tả cho nhà Cam nhé!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-[12px] bg-[#FDFBF7] hover:bg-[#E5DDD2] text-[#2B2623] font-bold text-xs border-2 border-[#2B2623] shadow-[2px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                >
                  <GoogleIcon className="size-4" />
                  <span>Đăng nhập bằng Google</span>
                  <Sparkles className="size-3 text-[#E07B4C]" />
                </button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Bảng Đổi Tên Modal (Click Avatar to change nickname) */}
      {showNameModal && user && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0 duration-150"
          onClick={() => setShowNameModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-[24px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[4px_6px_0px_#2B2623] p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b-2 border-[#2B2623]/20">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] bg-[#BDCEAF] text-[#2B2623] border border-[#2B2623]/30 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="size-3 text-[#2B2623]" />
                  <span>HỒ SƠ THÀNH VIÊN</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#2B2623] dark:text-[#FAF5EE]">
                  Bảng Đổi Biệt Danh
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowNameModal(false)}
                className="size-7 rounded-[8px] border-2 border-[#2B2623] bg-[#E5DDD2] hover:bg-[#D5CDC2] text-[#2B2623] flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* User Info Card */}
            <div className="flex items-center gap-3 p-3 rounded-[14px] bg-[#E5DDD2] dark:bg-[#2A2420] border border-[#2B2623]/30">
              <div className="size-11 rounded-full overflow-hidden border-2 border-[#2B2623] bg-[#FAF5EE] shrink-0 flex items-center justify-center">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "Avatar"}
                    width={44}
                    height={44}
                    className="object-cover size-full"
                  />
                ) : (
                  <span className="font-bold text-sm text-[#2B2623]">
                    {(user.nickname || user.name || "G")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-[#5C5146] dark:text-[#C4B9AD] font-mono">
                  Tài khoản Google:
                </p>
                <p className="font-bold text-xs text-[#2B2623] dark:text-[#FAF5EE] truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-[#5C5146] dark:text-[#C4B9AD] truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveNickname} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD] mb-1.5">
                  Biệt danh hiển thị mới:
                </label>
                <Input
                  autoFocus
                  required
                  minLength={2}
                  maxLength={30}
                  value={newNickname}
                  onChange={(e) => {
                    setNewNickname(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  placeholder="Nhập biệt danh bạn muốn..."
                  className="h-10 text-sm rounded-[12px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] text-[#2B2623] dark:text-[#FAF5EE] font-medium px-3 focus-visible:ring-0 focus-visible:border-[#2B2623]"
                />
                <div className="flex justify-between items-center mt-1 text-[11px] font-mono text-[#5C5146] dark:text-[#C4B9AD]">
                  <span>Từ 2 đến 30 ký tự</span>
                  <span>{newNickname.length}/30</span>
                </div>
              </div>

              {nameError && (
                <div className="p-2.5 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-1.5 font-medium">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{nameError}</span>
                </div>
              )}

              {nameSuccess && (
                <div className="p-2.5 rounded-[10px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  <span>Đã đổi biệt danh thành công!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2B2623]/20">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNameModal(false)}
                  className="rounded-[10px] h-9 px-4 text-xs font-bold border-2 border-[#2B2623] bg-[#E5DDD2] hover:bg-[#D5CDC2] text-[#2B2623] cursor-pointer"
                >
                  Hủy
                </Button>

                <Button
                  type="submit"
                  disabled={
                    isSavingName ||
                    newNickname.trim().length < 2 ||
                    newNickname.trim() === (user.nickname || user.name)
                  }
                  className="rounded-[10px] h-9 px-4 text-xs font-bold bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingName ? "Đang lưu..." : "Lưu biệt danh"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
