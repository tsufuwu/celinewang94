"use client";

import * as React from "react";
import { useBgm } from "./bgm-context";

/**
 * Floating Retro BGM Button (Square with border-2 border-[#2B2623] & hard offset shadow)
 * Placed globally at bottom-right corner. Clicking opens the BGM modal.
 */
export function BgmFloatingButton() {
  const { isPlaying, setModalOpen } = useBgm();

  return (
    <aside
      aria-label="Nhạc nền đọc truyện"
      className="fixed bottom-6 right-6 z-40 select-none"
    >
      <button
        onClick={() => setModalOpen(true)}
        className="relative size-12 rounded-[14px] bg-[#E2D8C0] dark:bg-[#3D352E] hover:bg-[#D8CDAF] text-[#2B2623] dark:text-[#FAF5EE] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] active:translate-x-[2px] active:translate-y-[4px] active:shadow-none flex items-center justify-center transition-all cursor-pointer group"
        title="Bật/Tùy chỉnh nhạc nền đọc truyện (BGM từ YouTube)"
      >
        {/* Retro 8-bit Music Note Icon */}
        <span
          className={`text-lg transition-transform ${
            isPlaying ? "scale-110 animate-bounce" : "group-hover:scale-110"
          }`}
        >
          🎵
        </span>

        {/* Pulsing Orange Accent Dot */}
        <span
          className={`absolute top-2 right-2 size-2 rounded-full bg-[#E07B4C] ${
            isPlaying ? "animate-ping" : "opacity-80"
          }`}
        />
      </button>
    </aside>
  );
}
