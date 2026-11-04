"use client";

import * as React from "react";
import { Lock, ArrowRight, AlertCircle } from "lucide-react";
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
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm p-6 sm:p-8 rounded-[20px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[3px_5px_0px_#2B2623] text-center">
        {/* Logo */}
        <div className="size-14 rounded-full bg-[#F4DFAD] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] flex items-center justify-center mx-auto mb-4">
          <OrangeLogo className="size-8" />
        </div>

        <h1 className="font-serif text-2xl font-bold text-[#2B2623] dark:text-[#FAF5EE] mb-5 tracking-tight">
          Nhập Mật Mã Trang Web
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded-[12px] bg-[#EBBAB5] text-[#2B2623] border-2 border-[#2B2623] text-xs font-mono font-bold flex items-center gap-2 text-left shadow-[1.5px_2px_0px_#2B2623]">
            <AlertCircle className="size-4 shrink-0 text-rose-800" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="relative text-left">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#5C5146]" />
            <Input
              type="password"
              required
              autoFocus
              placeholder="Nhập mật mã trang web..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-11 rounded-[12px] bg-[#FDFBF7] dark:bg-[#25201C] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] text-sm font-sans"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending || !password.trim()}
            className="w-full rounded-[12px] h-11 text-xs font-mono font-bold bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <span>{isPending ? "Đang xác thực..." : "Xác nhận truy cập"}</span>
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t-2 border-[#2B2623]/15" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#FAF5EE] dark:bg-[#1F1B18] px-2 text-[#5C5146] font-mono font-bold">
              HOẶC
            </span>
          </div>
        </div>

        {/* Google OAuth Login for Admin */}
        <a
          href="/api/auth/google?returnTo=/admin"
          className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-[12px] border-2 border-[#2B2623] bg-[#FAF5EE] hover:bg-[#F4DFAD] text-[#2B2623] font-bold text-xs shadow-[2px_3px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer"
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
          <span>Đăng nhập Google Admin</span>
        </a>
      </div>
    </div>
  );
}
