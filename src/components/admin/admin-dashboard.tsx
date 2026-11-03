"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  FileUp,
  Flag,
  LogOut,
  ExternalLink,
  User,
  Disc3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoryManager } from "./story-manager";
import { EpubImporter } from "./epub-importer";
import { WordPressImporter } from "./wordpress-importer";
import { TypoManager } from "./typo-manager";
import { ProfileManager } from "./profile-manager";
import { BgmManager } from "./bgm-manager";
import {
  logoutAdmin,
  type AdminStoryItem,
  type TypoReportItem,
  type CelineProfileData,
} from "@/app/admin/actions";
import { OrangeLogo } from "@/components/layout/orange-logo";

interface AdminDashboardProps {
  stories: AdminStoryItem[];
  typoReports: TypoReportItem[];
  profile: CelineProfileData;
  bgmSetting: {
    playlistId: string;
    playlistUrl: string;
  };
}

export function AdminDashboard({
  stories,
  typoReports,
  profile,
  bgmSetting,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<
    "stories" | "profile" | "bgm" | "wordpress" | "epub" | "typos"
  >("stories");
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
              Hệ thống quản lý tác phẩm, bóc tách EPUB, chỉnh trang Giới Thiệu (CV) &amp; Nhạc Nền.
            </p>
          </div>
        </div>

        {/* Quick Nav & Logout */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-border/50 flex-wrap">
          <Link href="/admin/editor">
            <Button
              size="sm"
              className="rounded-xl text-xs h-8 px-3.5 bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-1.5 shadow-xs font-medium"
            >
              <span>✨ Studio Editor</span>
            </Button>
          </Link>

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
      <nav
        aria-label="Menu chức năng quản trị"
        className="flex items-center gap-1.5 p-1 rounded-2xl bg-secondary/80 border border-border/60 max-w-3xl mb-8 overflow-x-auto scrollbar-none"
      >
        <button
          onClick={() => setActiveTab("stories")}
          className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 shrink-0 ${
            activeTab === "stories"
              ? "bg-card text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="size-3.5" />
          <span>Tác Phẩm ({stories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 shrink-0 ${
            activeTab === "profile"
              ? "bg-card text-foreground shadow-xs font-semibold text-[#E07B4C]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="size-3.5 text-[#E07B4C]" />
          <span>Giới Thiệu (CV)</span>
        </button>

        <button
          onClick={() => setActiveTab("bgm")}
          className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 shrink-0 ${
            activeTab === "bgm"
              ? "bg-card text-foreground shadow-xs font-semibold text-[#E07B4C]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Disc3 className="size-3.5 text-[#E07B4C]" />
          <span>Nhạc Nền (BGM)</span>
        </button>

        <button
          onClick={() => setActiveTab("wordpress")}
          className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 shrink-0 ${
            activeTab === "wordpress"
              ? "bg-card text-foreground shadow-xs font-semibold text-orange-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileUp className="size-3.5 text-orange-600" />
          <span>Import WordPress (.xml)</span>
        </button>

        <button
          onClick={() => setActiveTab("epub")}
          className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 shrink-0 ${
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
          className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 shrink-0 ${
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
        {activeTab === "profile" && <ProfileManager initialProfile={profile} />}
        {activeTab === "bgm" && <BgmManager initialPlaylistSetting={bgmSetting} />}
        {activeTab === "wordpress" && <WordPressImporter stories={stories} />}
        {activeTab === "epub" && <EpubImporter stories={stories} />}
        {activeTab === "typos" && <TypoManager initialReports={typoReports} />}
      </div>
    </div>
  );
}
