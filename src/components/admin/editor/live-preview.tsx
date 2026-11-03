"use client";

import * as React from "react";
import { StoryHtmlRenderer, StoryChapterItem } from "@/components/story/story-html-renderer";
import { Monitor, Tablet, Smartphone, Sun, Moon, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LivePreviewProps {
  content: string;
  customCss?: string;
  chapters?: StoryChapterItem[];
  storySlug?: string;
  className?: string;
}

export function LivePreview({
  content,
  customCss,
  chapters = [],
  storySlug = "",
  className = "",
}: LivePreviewProps) {
  const [viewport, setViewport] = React.useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewTheme, setPreviewTheme] = React.useState<"light" | "dark">("light");
  const [key, setKey] = React.useState(0);

  const getContainerWidth = () => {
    switch (viewport) {
      case "mobile":
        return "max-w-[390px]";
      case "tablet":
        return "max-w-[768px]";
      case "desktop":
      default:
        return "w-full";
    }
  };

  return (
    <div className={`flex flex-col h-full rounded-2xl border border-border/80 overflow-hidden bg-muted/20 shadow-xs ${className}`}>
      {/* Preview Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-muted/50 border-b border-border/70 text-xs">
        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-background/80 p-0.5 rounded-xl border border-border/70 shadow-2xs">
          <Button
            type="button"
            variant={viewport === "desktop" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewport("desktop")}
            className="h-7 px-2.5 text-xs rounded-lg flex items-center gap-1.5"
            title="Xem trên Máy tính (Desktop 100%)"
          >
            <Monitor className="size-3.5" />
            <span className="hidden sm:inline">Máy tính</span>
          </Button>

          <Button
            type="button"
            variant={viewport === "tablet" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewport("tablet")}
            className="h-7 px-2.5 text-xs rounded-lg flex items-center gap-1.5"
            title="Xem trên Máy tính bảng (Tablet 768px)"
          >
            <Tablet className="size-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </Button>

          <Button
            type="button"
            variant={viewport === "mobile" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewport("mobile")}
            className="h-7 px-2.5 text-xs rounded-lg flex items-center gap-1.5"
            title="Xem trên Điện thoại (Mobile 390px)"
          >
            <Smartphone className="size-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </Button>
        </div>

        {/* Theme & Refresh Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-background/80 p-0.5 rounded-xl border border-border/70 shadow-2xs">
            <button
              type="button"
              onClick={() => setPreviewTheme("light")}
              className={`p-1.5 rounded-lg transition-all ${
                previewTheme === "light"
                  ? "bg-amber-100 text-amber-900 shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Xem giao diện Sáng (Warm Light)"
            >
              <Sun className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewTheme("dark")}
              className={`p-1.5 rounded-lg transition-all ${
                previewTheme === "dark"
                  ? "bg-slate-800 text-amber-200 shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Xem giao diện Tối (Noir Dark)"
            >
              <Moon className="size-3.5" />
            </button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setKey((k) => k + 1)}
            className="h-7 px-2 rounded-lg text-muted-foreground hover:text-foreground"
            title="Làm mới bản xem thử"
          >
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Preview Viewport Canvas */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex justify-center bg-radial from-transparent to-muted/40">
        <div
          key={key}
          className={`${getContainerWidth()} min-h-full transition-all duration-300 ${
            viewport !== "desktop"
              ? "rounded-3xl border-4 border-[#3d3935] shadow-2xl p-4 my-auto overflow-hidden bg-background"
              : "w-full"
          } ${previewTheme === "dark" ? "dark bg-[#181412] text-[#f7f3ed]" : "bg-[#fffdf9] text-[#2b2724]"}`}
        >
          {/* Subtle mobile notch bar */}
          {viewport === "mobile" && (
            <div className="w-24 h-4 bg-[#3d3935] rounded-full mx-auto mb-4" />
          )}

          {content ? (
            <StoryHtmlRenderer
              content={content}
              customCss={customCss}
              chapters={chapters}
              storySlug={storySlug}
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 text-muted-foreground">
              <Sparkles className="size-8 text-orange-400/60 mb-3" />
              <p className="font-serif text-sm">Chưa có nội dung để xem thử.</p>
              <p className="text-xs font-mono mt-1 text-muted-foreground/60">
                Hãy gõ văn bản ở cột trái hoặc bấm &quot;Chèn Mẫu&quot; để bắt đầu sáng tạo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

