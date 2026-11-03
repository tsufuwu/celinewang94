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
            className="w-full rounded-xl h-10 text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <span>{isPending ? "Đang xác thực..." : "Đăng nhập bằng Mật khẩu"}</span>
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground font-mono">HOẶC</span>
          </div>
        </div>

        {/* Google OAuth Login for Admin */}
        <a
          href="/api/auth/google?returnTo=/admin"
          className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border-2 border-[#2B2623] bg-[#FAF5EE] hover:bg-[#F4DFAD] text-[#2B2623] font-bold text-xs shadow-[2px_3px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer"
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
          <span>Đăng nhập bằng Google Admin</span>
        </a>

        <p className="text-[11px] text-muted-foreground/80 mt-6 font-mono">
          Tự động phân quyền Quản trị viên cho các email khai báo trong ADMIN_EMAILS
        </p>
      </div>
    </div>
  );
}

