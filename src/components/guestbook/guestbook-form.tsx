"use client";

import * as React from "react";
import { Send, Shield, KeyRound, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createGuestbookPost, type ActionResponse } from "@/app/tro-chuyen/actions";
import { useAuth } from "@/components/auth/auth-context";

interface GuestbookFormProps {
  parentId?: string | null;
  onSuccess?: () => void;
  isReply?: boolean;
}

export function GuestbookForm({ parentId = null, onSuccess, isReply = false }: GuestbookFormProps) {
  const { user } = useAuth();
  const [showAdminPin, setShowAdminPin] = React.useState(false);
  const [state, setState] = React.useState<ActionResponse | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (parentId) {
      formData.set("parentId", parentId);
    }

    startTransition(async () => {
      const res = await createGuestbookPost(state, formData);
      setState(res);
      if (res.success) {
        formRef.current?.reset();
        setShowAdminPin(false);
        if (onSuccess) onSuccess();
      }
    });
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs transition-all ${
        isReply ? "bg-muted/30 border-dashed mt-3" : "mb-10"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-medium text-foreground flex items-center gap-2">
          {isReply ? (
            <span>Gửi lời phản hồi</span>
          ) : (
            <>
              <Sparkles className="size-4 text-amber-500" />
              <span>Gửi lời nhắn mới</span>
            </>
          )}
        </h3>

        {/* Toggle Admin PIN Button */}
        <button
          type="button"
          onClick={() => setShowAdminPin((prev) => !prev)}
          className={`text-xs px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
            showAdminPin
              ? "bg-amber-100/70 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800 text-amber-900 dark:text-amber-200"
              : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
          title="Dành cho Quản trị viên"
        >
          <KeyRound className="size-3" />
          <span>{showAdminPin ? "Đang mở mã PIN" : "Quản trị viên?"}</span>
        </button>
      </div>

      {/* Status banner */}
      {state && (
        <div
          className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
            state.success
              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
              : "bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40"
          }`}
        >
          {state.success ? (
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span>{state.message}</span>
        </div>
      )}

      <div className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Author Name */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Tên hoặc Bút danh <span className="text-rose-500">*</span>
            </label>
            <Input
              name="authorName"
              required
              maxLength={50}
              defaultValue={user?.nickname || user?.name || ""}
              placeholder="Ví dụ: Độc giả qua đường..."
              className="h-9 rounded-xl bg-background border-border/80 text-sm"
            />
          </div>

          {/* Optional Title (only for root post) */}
          {!isReply ? (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Tiêu đề <span className="text-muted-foreground/60">(Tùy chọn)</span>
              </label>
              <Input
                name="title"
                maxLength={100}
                placeholder="Cảm nghĩ, lời chào..."
                className="h-9 rounded-xl bg-background border-border/80 text-sm"
              />
            </div>
          ) : (
            <input type="hidden" name="parentId" value={parentId || ""} />
          )}
        </div>

        {/* Content Textarea */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Nội dung lời nhắn <span className="text-rose-500">*</span>
          </label>
          <Textarea
            name="content"
            required
            rows={isReply ? 3 : 4}
            maxLength={2000}
            placeholder={
              isReply
                ? "Viết phản hồi cho lời nhắn này..."
                : "Gửi gắm đôi dòng suy nghĩ, tâm sự hoặc góp ý của bạn..."
            }
            className="rounded-xl bg-background border-border/80 resize-y text-sm leading-relaxed"
          />
        </div>

        {/* Admin PIN Box (Conditional) */}
        {showAdminPin && (
          <div className="p-3.5 rounded-xl border border-amber-200/70 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-1.5 transition-all">
            <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 font-medium">
              <Shield className="size-3.5" />
              <span>Xác thực Quản trị viên (Admin PIN)</span>
            </div>
            <Input
              type="password"
              name="adminPin"
              placeholder="Nhập mã PIN bí mật của bạn..."
              className="h-8.5 rounded-lg bg-background border-amber-200 dark:border-amber-800 text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Nếu nhập đúng, bài đăng sẽ được gắn huy hiệu &quot;Quản trị viên&quot;.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="submit"
            disabled={isPending}
            className="rounded-xl text-xs h-9 px-4 flex items-center gap-1.5 shadow-xs"
          >
            <Send className="size-3" />
            <span>{isPending ? "Đang gửi..." : isReply ? "Gửi phản hồi" : "Đăng lời nhắn"}</span>
          </Button>
        </div>
      </div>
    </form>
  );
}

