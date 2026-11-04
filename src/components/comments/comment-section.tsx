"use client";

import * as React from "react";
import { useAuth } from "@/components/auth/auth-context";
import {
  MessageCircle,
  Send,
  Sparkles,
  UserCheck,
  Clock,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentItem {
  id: string;
  authorName: string;
  content: string;
  userId?: string | null;
  createdAt: string;
}

interface CommentSectionProps {
  targetType: "chapter" | "story";
  targetId: string;
  title?: string;
}

export function CommentSection({
  targetType,
  targetId,
  title = targetType === "chapter" ? "Bình Luận Chương" : "Bình Luận Tác Phẩm",
}: CommentSectionProps) {
  const { user, loginWithGoogle } = useAuth();
  const [comments, setComments] = React.useState<CommentItem[]>([]);
  const [content, setContent] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Edit states
  const [editingCommentId, setEditingCommentId] = React.useState<string | null>(null);
  const [editingContent, setEditingContent] = React.useState("");
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const fetchComments = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const url =
        targetType === "chapter"
          ? `/api/comments/chapter?chapterId=${encodeURIComponent(targetId)}`
          : `/api/comments/story?storyId=${encodeURIComponent(targetId)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch {
      // Ignore network errors on fetch
    } finally {
      setIsLoading(false);
    }
  }, [targetType, targetId]);

  React.useEffect(() => {
    if (targetId) {
      fetchComments();
    }
  }, [targetId, fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    if (!user) {
      loginWithGoogle();
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const endpoint =
        targetType === "chapter" ? "/api/comments/chapter" : "/api/comments/story";
      const payload =
        targetType === "chapter"
          ? { chapterId: targetId, content: content.trim() }
          : { storyId: targetId, content: content.trim() };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể gửi bình luận.");
      }

      setContent("");
      // Prepend the new comment
      setComments((prev) => [data.comment, ...prev]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (c: CommentItem) => {
    setEditingCommentId(c.id);
    setEditingContent(c.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editingContent.trim() || isSavingEdit) return;

    try {
      setIsSavingEdit(true);
      const endpoint =
        targetType === "chapter" ? "/api/comments/chapter" : "/api/comments/story";

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, content: editingContent.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể cập nhật bình luận.");
      }

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, content: editingContent.trim() } : c))
      );
      setEditingCommentId(null);
      setEditingContent("");
    } catch (err: unknown) {
      alert((err as Error)?.message || "Lỗi khi cập nhật.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) return;

    try {
      setDeletingId(commentId);
      const endpoint =
        targetType === "chapter"
          ? `/api/comments/chapter?commentId=${encodeURIComponent(commentId)}`
          : `/api/comments/story?commentId=${encodeURIComponent(commentId)}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể xóa bình luận.");
      }

      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err: unknown) {
      alert((err as Error)?.message || "Lỗi khi xóa bình luận.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatCommentDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section
      aria-label="Khu vực bình luận"
      className="rounded-[20px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[3px_5px_0px_#2B2623] p-5 sm:p-7 my-10"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-[#2B2623]/15">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-[10px] bg-[#BDCEAF] text-[#2B2623] border-2 border-[#2B2623] flex items-center justify-center shadow-[1.5px_2px_0px_#2B2623]">
            <MessageCircle className="size-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2B2623] dark:text-[#FAF5EE]">
              {title}
            </h3>
            <span className="text-xs font-mono text-[#5C5146] dark:text-[#C4B9AD]">
              {comments.length} thảo luận
            </span>
          </div>
        </div>

        {user && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-[10px] bg-[#E5DDD2] dark:bg-[#2A2420] border-2 border-[#2B2623] text-xs font-mono font-bold text-[#2B2623] dark:text-[#FAF5EE]">
            <UserCheck className="size-3.5 text-[#E07B4C]" />
            <span>{user.nickname || user.name}</span>
          </div>
        )}
      </div>

      {/* Input or Login Prompt */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="rounded-[14px] bg-[#FDFBF7] dark:bg-[#25201C] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] p-3 sm:p-4 focus-within:ring-2 focus-within:ring-[#E07B4C] transition-all">
            <div className="flex items-center justify-between mb-2 text-xs font-mono text-[#5C5146] dark:text-[#C4B9AD]">
              <span className="font-bold flex items-center gap-1.5 text-[#2B2623] dark:text-[#FAF5EE]">
                <Sparkles className="size-3.5 text-[#E07B4C]" />
                Viết bình luận với tên: <b className="text-[#E07B4C]">{user.nickname || user.name}</b>
              </span>
              <span>{content.length} ký tự</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ cảm nhận, suy nghĩ của bạn về nội dung này..."
              rows={3}
              className="w-full bg-transparent resize-y text-sm font-sans text-[#2B2623] dark:text-[#FAF5EE] placeholder:text-[#5C5146]/50 dark:placeholder:text-[#C4B9AD]/50 focus:outline-none leading-relaxed"
            />
            {errorMsg && (
              <p className="text-xs text-red-600 dark:text-red-400 font-mono mt-1 font-bold">
                {errorMsg}
              </p>
            )}
            <div className="flex justify-end pt-2 border-t border-[#2B2623]/10 mt-2">
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="rounded-[10px] bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[2px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-bold text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="size-3.5" />
                <span>{isSubmitting ? "Đang gửi..." : "Gửi bình luận"}</span>
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="rounded-[14px] bg-[#F4DFAD] dark:bg-[#332C22] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] p-5 mb-8 text-center flex flex-col items-center justify-center gap-3">
          <p className="text-sm font-serif font-medium text-[#2B2623] dark:text-[#FAF5EE] max-w-md">
            Bạn cần đăng nhập bằng tài khoản Google để tham gia gửi bình luận và chia sẻ cảm nghĩ cùng tác giả & cộng đồng bạn đọc.
          </p>
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            className="rounded-[12px] bg-[#FAF5EE] hover:bg-white text-[#2B2623] border-2 border-[#2B2623] shadow-[2.5px_3.5px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-bold text-xs sm:text-sm px-5 py-2.5 flex items-center gap-2 cursor-pointer transition-all"
          >
            <svg className="size-4" viewBox="0 0 24 24">
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
            <span>Đăng nhập bằng Google để bình luận</span>
          </button>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="py-8 text-center text-xs font-mono text-[#5C5146] dark:text-[#C4B9AD]">
          Đang tải bình luận...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center rounded-[12px] bg-[#FDFBF7]/60 dark:bg-[#25201C]/60 border border-dashed border-[#2B2623]/25">
          <p className="text-xs sm:text-sm font-serif italic text-[#5C5146] dark:text-[#C4B9AD]">
            Chưa có bình luận nào. Hãy là người đầu tiên để lại cảm nghĩ của bạn!
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {comments.map((c) => {
            const isAdmin = c.authorName.startsWith("[Admin]");
            const isOwner = user && c.userId && user.id === c.userId;
            const canManage = isOwner || (user && user.role === "ADMIN");
            const isEditing = editingCommentId === c.id;

            return (
              <div
                key={c.id}
                className="rounded-[14px] bg-[#FDFBF7] dark:bg-[#25201C] border-2 border-[#2B2623] p-4 shadow-[1.5px_2px_0px_#2B2623] transition-all"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2B2623]/10">
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-6 rounded-full border border-[#2B2623] flex items-center justify-center text-[10px] font-bold ${
                        isAdmin
                          ? "bg-[#E07B4C] text-white"
                          : "bg-[#BDCEAF] text-[#2B2623]"
                      }`}
                    >
                      {c.authorName.charAt(isAdmin ? 8 : 0).toUpperCase() || "B"}
                    </div>
                    <span
                      className={`text-xs font-mono font-bold ${
                        isAdmin
                          ? "text-[#E07B4C]"
                          : "text-[#2B2623] dark:text-[#FAF5EE]"
                      }`}
                    >
                      {c.authorName}
                    </span>
                    {isOwner && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F4DFAD] text-[#2B2623] border border-[#2B2623]/30 font-semibold">
                        Bạn
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-mono text-[#5C5146] dark:text-[#C4B9AD] flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatCommentDate(c.createdAt)}
                    </span>

                    {/* Edit / Delete actions for comment owner or admin */}
                    {canManage && !isEditing && (
                      <div className="flex items-center gap-1 border-l border-[#2B2623]/20 pl-2">
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(c)}
                            className="p-1 text-[#5C5146] hover:text-[#E07B4C] transition-colors rounded hover:bg-[#E5DDD2]"
                            title="Sửa bình luận"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={deletingId === c.id}
                          onClick={() => handleDelete(c.id)}
                          className="p-1 text-[#5C5146] hover:text-rose-600 transition-colors rounded hover:bg-[#E5DDD2] disabled:opacity-50"
                          title="Xóa bình luận"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 rounded-[10px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] text-sm font-sans text-[#2B2623] dark:text-[#FAF5EE] focus:outline-none focus:ring-1 focus:ring-[#E07B4C]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="rounded-[8px] text-xs h-7 px-2.5 border-2 border-[#2B2623]"
                      >
                        <X className="size-3 mr-1" /> Hủy
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isSavingEdit || !editingContent.trim()}
                        onClick={() => handleSaveEdit(c.id)}
                        className="rounded-[8px] text-xs h-7 px-3 bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] font-bold"
                      >
                        <Check className="size-3 mr-1" />
                        {isSavingEdit ? "Đang lưu..." : "Lưu thay đổi"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-sans text-[#2B2623] dark:text-[#E8E2D9] whitespace-pre-wrap leading-relaxed select-text">
                    {c.content}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
