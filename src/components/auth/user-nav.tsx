"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "./auth-context";
import { ShieldCheck, LogOut, Edit3, User, Sparkles, Check, X } from "lucide-react";

function GoogleIcon({ className = "size-4" }: { className?: string }) {
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

export function UserNav() {
  const { user, loginWithGoogle, logout, updateNickname } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isEditingNickname, setIsEditingNickname] = React.useState(false);
  const [nicknameInput, setNicknameInput] = React.useState("");
  const [nicknameMsg, setNicknameMsg] = React.useState<string | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsEditingNickname(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const handleSaveNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return;
    const res = await updateNickname(nicknameInput.trim());
    if (res.success) {
      setIsEditingNickname(false);
      setNicknameMsg("Đã đổi biệt danh!");
      setTimeout(() => setNicknameMsg(null), 2000);
    } else {
      setNicknameMsg(res.error || "Lỗi lưu biệt danh");
    }
  };

  if (!user) {
    return (
      <button
        onClick={() => loginWithGoogle()}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] bg-[#FAF5EE] dark:bg-[#25201C] text-[#2B2623] dark:text-[#FAF5EE] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1.5px] active:shadow-none hover:bg-[#F4DFAD] transition-all text-xs font-bold font-sans cursor-pointer shrink-0"
        title="Đăng nhập bằng tài khoản Google để lưu tiến độ đọc và pass chương"
      >
        <GoogleIcon className="size-3.5" />
        <span className="hidden sm:inline">Đăng nhập</span>
      </button>
    );
  }

  const displayName = user.nickname || user.name || user.email.split("@")[0];

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-[12px] bg-[#FAF5EE] dark:bg-[#25201C] text-[#2B2623] dark:text-[#FAF5EE] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1.5px] active:shadow-none hover:bg-[#E5DDD2] transition-all cursor-pointer"
        title={`Tài khoản: ${displayName}`}
      >
        {user.image ? (
          <div className="relative size-6 rounded-full overflow-hidden border border-[#2B2623]/30">
            <Image
              src={user.image}
              alt={displayName}
              fill
              sizes="24px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="size-6 rounded-full bg-[#E07B4C] text-white flex items-center justify-center text-xs font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-xs font-bold max-w-[100px] truncate hidden sm:inline">
          {displayName}
        </span>
      </button>

      {/* Retro Pastel Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-[16px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[3px_5px_0px_#2B2623] p-4 text-[#2B2623] dark:text-[#FAF5EE] z-50 animate-in fade-in zoom-in-95 duration-150 select-none">
          {/* User Profile Header */}
          <div className="flex items-center gap-3 pb-3 mb-3 border-b-2 border-[#2B2623]/20">
            {user.image ? (
              <div className="relative size-10 rounded-full overflow-hidden border-2 border-[#2B2623] shrink-0">
                <Image
                  src={user.image}
                  alt={displayName}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="size-10 rounded-full bg-[#E07B4C] text-white border-2 border-[#2B2623] flex items-center justify-center font-bold text-sm shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <h4 className="font-serif font-bold text-sm truncate">{displayName}</h4>
                {user.role === "ADMIN" && (
                  <span className="px-1.5 py-0.5 rounded-[6px] bg-[#E07B4C] text-white text-[9px] font-mono font-bold uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                    <Sparkles className="size-2.5" />
                    <span>Admin</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-[#5C5146] dark:text-[#C4B9AD] truncate">
                {user.email}
              </p>
            </div>
          </div>

          {/* Nickname Editor */}
          {isEditingNickname ? (
            <form onSubmit={handleSaveNickname} className="mb-3 p-2 rounded-[10px] bg-[#E5DDD2] dark:bg-[#2C2520] border border-[#2B2623]">
              <label className="block text-[10px] font-mono font-bold uppercase text-[#5C5146] dark:text-[#C4B9AD] mb-1">
                Biệt danh hiển thị:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  placeholder="Nhập biệt danh..."
                  className="flex-1 px-2 py-1 rounded-[6px] bg-[#FAF5EE] dark:bg-[#1A1614] border border-[#2B2623] text-xs font-sans focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="size-7 rounded-[6px] bg-[#BDCEAF] border border-[#2B2623] text-[#2B2623] flex items-center justify-center cursor-pointer"
                  title="Lưu"
                >
                  <Check className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingNickname(false)}
                  className="size-7 rounded-[6px] bg-[#EBBAB5] border border-[#2B2623] text-[#2B2623] flex items-center justify-center cursor-pointer"
                  title="Hủy"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => {
                setNicknameInput(user.nickname || user.name);
                setIsEditingNickname(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-[10px] bg-[#E5DDD2]/50 hover:bg-[#E5DDD2] text-xs font-medium text-[#5C5146] dark:text-[#C4B9AD] transition-colors mb-2 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Edit3 className="size-3.5 text-[#E07B4C]" />
                <span>Đổi biệt danh hiển thị</span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[80px]">
                {displayName}
              </span>
            </button>
          )}

          {nicknameMsg && (
            <p className="text-[10px] font-mono text-[#E07B4C] mb-2 font-bold text-center">
              {nicknameMsg}
            </p>
          )}

          {/* Quick Admin Access */}
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[#E07B4C]/15 hover:bg-[#E07B4C]/25 text-[#E07B4C] text-xs font-bold transition-colors mb-2"
            >
              <ShieldCheck className="size-4" />
              <span>Bảng Quản Trị (Admin)</span>
            </Link>
          )}

          {/* Logout */}
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-[10px] hover:bg-[#EBBAB5]/40 text-[#C92A2A] text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="size-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
}

