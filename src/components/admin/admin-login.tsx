"use client";

import * as React from "react";
import { Lock, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAdmin } from "@/app/admin/actions";
import { OrangeLogo } from "@/components/layout/orange-logo";

export function AdminLogin() {
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setError(null);
    startTransition(async () => {
      const res = await loginAdmin(password);
      if (res.success) {
        window.location.reload();
      } else {
        setError(res.message);
      }
    });
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-3xl bg-card border border-border/70 shadow-xl text-center">
        {/* Medallion */}
        <div className="size-16 rounded-full bg-orange-100/70 dark:bg-orange-950/40 border border-orange-300 dark:border-orange-800 flex items-center justify-center mx-auto mb-5 shadow-inner">
          <OrangeLogo className="size-9" />
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
          <Sparkles className="size-3.5 text-primary" />
          <span>Khu Vực Quản Trị</span>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl text-foreground font-medium tracking-tight mb-1">
          Bàn Làm Việc
        </h1>
        <p className="text-xs text-primary font-medium mb-1">Chỉ dành cho Celine Wang</p>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          Vui lòng nhập mật khẩu Quản trị viên (ADMIN_PASSWORD) để truy cập hệ thống quản lý.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="size-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative text-left">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="password"
              required
              autoFocus
              placeholder="Nhập mật khẩu quản trị..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-background border-border/80 text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending || !password.trim()}
            className="w-full rounded-xl h-10 text-sm flex items-center justify-center gap-2 shadow-xs"
          >
            <span>{isPending ? "Đang xác thực..." : "Đăng nhập Quản trị"}</span>
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <p className="text-[11px] text-muted-foreground/80 mt-6 font-mono">
          Mật khẩu được đối chiếu an toàn với biến ADMIN_PASSWORD trên Server
        </p>
      </div>
    </div>
  );
}

