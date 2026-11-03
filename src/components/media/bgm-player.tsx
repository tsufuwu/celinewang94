"use client";

import * as React from "react";
import { Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBgm } from "./bgm-context";

export function BgmPlayer() {
  const { isPlaying, setModalOpen } = useBgm();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setModalOpen(true)}
      className={`h-9 px-2.5 rounded-full border transition-all flex items-center gap-1.5 text-xs ${
        isPlaying
          ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium"
          : "border-border/70 text-muted-foreground hover:text-foreground"
      }`}
      title="Nhạc nền đọc truyện (BGM từ YouTube)"
    >
      <Disc3
        className={`size-3.5 ${
          isPlaying ? "animate-spin [animation-duration:4s] text-[#E07B4C]" : ""
        }`}
      />
      <span className="hidden lg:inline-block font-mono font-bold">BGM</span>
      {isPlaying && (
        <span className="flex h-1.5 w-1.5 rounded-full bg-[#E07B4C] animate-ping" />
      )}
    </Button>
  );
}
