"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  FileUp,
  Flag,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoryManager } from "./story-manager";
import { EpubImporter } from "./epub-importer";
import { TypoManager } from "./typo-manager";
import { logoutAdmin, type AdminStoryItem, type TypoReportItem } from "@/app/admin/actions";
import { OrangeLogo } from "@/components/layout/orange-logo";

interface AdminDashboardProps {
  stories: AdminStoryItem[];
  typoReports: TypoReportItem[];
}

export function AdminDashboard({ stories, typoReports }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<"stories" | "epub" | "typos">("stories");
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const unresolvedTypos = typoReports.filter((r) => !r.isResolved).length;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAdmin();
    window.location.reload();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Top Bar */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-card border border-border/80 shadow-xs mb-8">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-orange-100/70 dark:bg-orange-950/40 border border-orange-300 dark:border-orange-800 flex items-center justify-center shadow-xs">
            <OrangeLogo className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-semibold text-foreground">
                Media naranja Admin
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-orange-100/80 text-orange-900 dark:bg-orange-950/50 dark:text-orange-300 font-medium">
                Admin
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hệ thống quản lý tác phẩm, bóc tách EPUB và xử lý báo lỗi chính tả.
            </p>
          </div>
        </div>

        {/* Quick Nav & Logout */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-border/50">
          <Link href="/" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs h-8 px-3 flex items-center gap-1.5"
            >
              <ExternalLink className="size-3" />
              <span>Xem trang web</span>
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="rounded-xl text-xs h-8 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5"
          >
            <LogOut className="size-3" />
            <span>{isLoggingOut ? "Đang thoát..." : "Đăng xuất"}</span>
          </Button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav aria-label="Menu chức năng quản trị" className="flex items-center gap-1.5 p-1 rounded-2xl bg-secondary/80 border border-border/60 max-w-xl mb-8">
        <button
          onClick={() => setActiveTab("stories")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === "stories"
              ? "bg-card text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="size-3.5" />
          <span>Quản lý Truyện ({stories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("epub")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === "epub"
              ? "bg-card text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileUp className="size-3.5" />
          <span>Import EPUB</span>
        </button>

        <button
          onClick={() => setActiveTab("typos")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === "typos"
              ? "bg-card text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Flag className="size-3.5" />
          <span>Báo lỗi</span>
          {unresolvedTypos > 0 && (
            <span className="size-4 rounded-full bg-rose-500 text-white text-[9px] font-mono flex items-center justify-center font-bold">
              {unresolvedTypos}
            </span>
          )}
        </button>
      </nav>

      {/* Tab Panels */}
      <div>
        {activeTab === "stories" && <StoryManager initialStories={stories} />}
        {activeTab === "epub" && <EpubImporter stories={stories} />}
        {activeTab === "typos" && <TypoManager initialReports={typoReports} />}
      </div>
    </div>
  );
}

