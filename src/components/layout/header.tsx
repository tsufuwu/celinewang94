"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, MessageCircleHeart, User, Library, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { OrangeLogo } from "./orange-logo";
import { BgmPlayer } from "@/components/media/bgm-player";
import { NotificationBell } from "./notification-bell";
import { UserNav } from "@/components/auth/user-nav";

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { label: "Trang chủ", href: "/", icon: BookOpen },
    { label: "Thư viện", href: "/kho-truyen", icon: Library },
    { label: "Trò chuyện", href: "/tro-chuyen", icon: MessageCircleHeart },
    { label: "Giới thiệu (CV)", href: "/gioi-thieu", icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90 shrink-0"
        >
          <div className="transition-transform group-hover:scale-105 duration-200">
            <OrangeLogo className="size-7 sm:size-8 drop-shadow-xs" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-base sm:text-lg tracking-tight font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
              Media naranja
            </span>
            <span className="text-[10px] text-muted-foreground italic font-serif leading-none line-clamp-1 hidden xl:inline">
              ars longa, vita brevis – nghệ thuật trường tồn, cuộc đời ngắn ngủi
            </span>
          </div>
        </Link>

        {/* Desktop Nav - Compact, Single-line, No Wrapping */}
        <nav className="hidden md:flex items-center gap-1.5 shrink-0">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative px-3.5 py-1.5 rounded-[12px] text-xs sm:text-[13px] whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 border-0 shadow-none font-semibold ${isActive
                    ? "bg-[#E5DDD2] dark:bg-[#2B2521] text-[#5C5146] dark:text-[#E5DDD2]"
                    : "text-[#6B5E54] dark:text-[#A6998D] hover:text-[#2B2623] dark:hover:text-[#FAF5EE] hover:bg-[#EFE8DE]/80 dark:hover:bg-[#241E1A]"
                  }`}
              >
                <Icon className="size-3.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: BGM, Notification Bell, Theme, UserNav, Mobile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <BgmPlayer />
          <NotificationBell />
          <ThemeToggle />
          <UserNav />

          {/* Mobile Sheet Trigger */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-border/70 text-muted-foreground" />}>
                <Menu className="size-4" />
                <span className="sr-only">Mở menu</span>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-6 flex flex-col gap-6">
                <SheetTitle className="font-serif text-lg flex items-center gap-2">
                  <OrangeLogo className="size-6" />
                  <span>Media naranja</span>
                </SheetTitle>
                <div className="flex flex-col gap-2 pt-2">
                  {navItems.map((item) => {
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`px-4 py-2.5 rounded-[12px] text-sm flex items-center gap-3 font-semibold transition-all ${isActive
                            ? "bg-[#E5DDD2] dark:bg-[#2B2521] text-[#5C5146] dark:text-[#E5DDD2]"
                            : "text-[#6B5E54] dark:text-[#A6998D] hover:bg-[#EFE8DE]/70"
                          }`}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-auto pt-6 border-t border-border/60 text-xs text-muted-foreground italic font-serif">
                  ars longa, vita brevis – nghệ thuật trường tồn, cuộc đời ngắn ngủi
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
