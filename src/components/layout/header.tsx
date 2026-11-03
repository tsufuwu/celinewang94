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

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { label: "Trang chủ", href: "/", icon: BookOpen },
    { label: "Kho truyện", href: "/kho-truyen", icon: Library },
    { label: "Trò chuyện", href: "/tro-chuyen", icon: MessageCircleHeart },
    { label: "Giới thiệu (CV)", href: "/gioi-thieu", icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90 shrink-0"
        >
          <div className="transition-transform group-hover:scale-105 duration-200">
            <OrangeLogo className="size-8 drop-shadow-xs" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-lg tracking-tight font-semibold text-foreground group-hover:text-primary transition-colors">
                Media naranja
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground italic font-serif leading-none line-clamp-1 hidden sm:inline">
              ars longa, vita brevis – nghệ thuật trường tồn, cuộc đời ngắn ngủi
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5">
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
                className={`relative px-5 py-2.5 rounded-[18px] text-xs sm:text-sm transition-all flex items-center gap-2 border-0 shadow-none font-bold ${
                  isActive
                    ? "bg-[#E5DDD2] dark:bg-[#2B2521] text-[#5C5146] dark:text-[#E5DDD2]"
                    : "text-[#6B5E54] dark:text-[#A6998D] hover:text-[#2B2623] dark:hover:text-[#FAF5EE] hover:bg-[#EFE8DE] dark:hover:bg-[#241E1A]"
                }`}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: BGM, Notification Bell, Theme, Mobile Menu */}
        <div className="flex items-center gap-2">
          <BgmPlayer />
          <NotificationBell />
          <ThemeToggle />

          {/* Mobile Sheet Trigger */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-border/70 text-muted-foreground" />}>
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
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-secondary text-primary font-semibold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="size-4" />
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
