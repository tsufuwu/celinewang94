"use client";

import * as React from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  X,
  Disc3,
} from "lucide-react";
import { useBgm } from "./bgm-context";

function YouTubeIcon({ className = "size-3.5 text-red-600" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function BgmModal() {
  const {
    isPlaying,
    volume,
    isMuted,
    playlistUrl,
    isModalOpen,
    setModalOpen,
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute,
  } = useBgm();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-[320px] rounded-[22px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[4px_6px_0px_#2B2623] p-5 text-[#2B2623] dark:text-[#FAF5EE] select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Pure UI Icon & Close button */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#2B2623]/20">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[8px] bg-[#F4DFAD] dark:bg-[#3D352E] text-[#2B2623] dark:text-[#FAF5EE] border border-[#2B2623]">
              <Disc3
                className={`size-4 ${
                  isPlaying ? "animate-spin [animation-duration:3s] text-[#E07B4C]" : ""
                }`}
              />
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={playlistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="size-8 rounded-[8px] bg-[#E5DDD2] dark:bg-[#3D352E] hover:bg-[#DBD1C4] border border-[#2B2623] flex items-center justify-center text-[#E07B4C] cursor-pointer transition-colors"
              title="YouTube"
            >
              <YouTubeIcon className="size-4" />
            </a>
            <button
              onClick={() => setModalOpen(false)}
              className="size-8 rounded-[8px] bg-[#E5DDD2] dark:bg-[#3D352E] hover:bg-[#DBD1C4] border border-[#2B2623] flex items-center justify-center text-[#5C5146] dark:text-[#FAF5EE] cursor-pointer transition-colors"
              aria-label="Đóng bảng nhạc"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Vinyl Disc & Transport Controls - 100% UI without text clutter */}
        <div className="p-4 rounded-[16px] bg-[#FDFBF7] dark:bg-[#26211E] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] mb-4 text-center">
          {/* Vinyl Disc Animation */}
          <div className="relative size-28 mx-auto my-2 rounded-full bg-[#2B2623] dark:bg-[#141110] border-2 border-[#2B2623] flex items-center justify-center shadow-md">
            {/* Vinyl Grooves */}
            <div className="absolute inset-1.5 rounded-full border border-white/10" />
            <div className="absolute inset-3.5 rounded-full border border-white/10" />
            <div className="absolute inset-6 rounded-full border border-white/10" />
            <div className="absolute inset-8 rounded-full border border-white/10" />

            {/* Center Orange Label */}
            <div
              className={`relative size-10 rounded-full bg-[#E07B4C] border border-[#2B2623] flex items-center justify-center ${
                isPlaying ? "animate-spin [animation-duration:3s]" : ""
              }`}
            >
              <div className="size-2.5 rounded-full bg-[#FAF5EE]" />
            </div>
          </div>

          {/* Controls: Prev, Play/Pause, Next */}
          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={prevTrack}
              className="size-10 rounded-[10px] bg-[#E5DDD2] dark:bg-[#332A24] hover:bg-[#DBD1C4] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center cursor-pointer text-[#2B2623] dark:text-[#FAF5EE]"
              title="Previous"
            >
              <SkipBack className="size-4.5" />
            </button>

            <button
              onClick={togglePlay}
              className="size-13 rounded-[14px] bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] active:translate-x-[1.5px] active:translate-y-[2px] active:shadow-none flex items-center justify-center cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="size-6 fill-current" />
              ) : (
                <Play className="size-6 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="size-10 rounded-[10px] bg-[#E5DDD2] dark:bg-[#332A24] hover:bg-[#DBD1C4] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center cursor-pointer text-[#2B2623] dark:text-[#FAF5EE]"
              title="Next"
            >
              <SkipForward className="size-4.5" />
            </button>
          </div>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] bg-[#E5DDD2]/60 dark:bg-[#28211D] border border-[#2B2623]/20">
          <button
            onClick={toggleMute}
            className="text-[#5C5146] dark:text-[#C4B9AD] hover:text-[#2B2623] cursor-pointer shrink-0"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="size-4" />
            ) : (
              <Volume2 className="size-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 h-1.5 rounded-lg bg-[#FAF5EE] dark:bg-[#1A1614] accent-[#E07B4C] cursor-pointer"
          />
          <span className="text-[10px] font-mono text-[#5C5146] dark:text-[#C4B9AD] w-7 text-right font-bold shrink-0">
            {isMuted ? 0 : volume}%
          </span>
        </div>
      </div>
    </div>
  );
}
