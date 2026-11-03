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
  Plus,
} from "lucide-react";
import { useBgm, extractYouTubeId } from "./bgm-context";

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
    currentTrackIndex,
    currentTrack,
    playlist,
    volume,
    isMuted,
    isModalOpen,
    setModalOpen,
    togglePlay,
    playTrackByIndex,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute,
    playCustomUrl,
  } = useBgm();

  const [customTitle, setCustomTitle] = React.useState("");
  const [customUrl, setCustomUrl] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");

  if (!isModalOpen) return null;

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const id = extractYouTubeId(customUrl);
    if (!id) {
      setErrorMsg("Vui lòng dán link YouTube hợp lệ (ví dụ: https://youtube.com/watch?v=...)");
      return;
    }

    const title = customTitle.trim() || `YouTube Track (${id})`;
    const ok = playCustomUrl(title, customUrl);
    if (ok) {
      setCustomTitle("");
      setCustomUrl("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-[20px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[4px_6px_0px_#2B2623] p-5 sm:p-6 text-[#2B2623] dark:text-[#FAF5EE] select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#2B2623]/20">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[8px] bg-[#F4DFAD] text-[#2B2623] border border-[#2B2623]">
              <Disc3 className={`size-4 ${isPlaying ? "animate-spin [animation-duration:3s] text-[#E07B4C]" : ""}`} />
            </span>
            <div>
              <h3 className="font-serif text-base font-bold leading-tight">
                Nhạc Nền Đọc Truyện (BGM)
              </h3>
              <span className="text-[10px] font-mono text-[#5C5146] dark:text-[#C4B9AD] font-semibold">
                Streaming từ YouTube &amp; Nhạc Không Lời
              </span>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(false)}
            className="size-8 rounded-[8px] bg-[#E5DDD2] dark:bg-[#3D352E] hover:bg-[#DBD1C4] border border-[#2B2623] flex items-center justify-center text-[#5C5146] dark:text-[#FAF5EE] cursor-pointer"
            aria-label="Đóng bảng nhạc"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Current Track Banner */}
        <div className="p-4 rounded-[14px] bg-[#FDFBF7] dark:bg-[#26211E] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] mb-4 flex items-center gap-4">
          <div className="relative size-14 shrink-0 rounded-[10px] bg-[#E2D8C0] dark:bg-[#332A24] border border-[#2B2623] flex items-center justify-center">
            <Disc3 className={`size-8 text-[#E07B4C] ${isPlaying ? "animate-spin [animation-duration:4s]" : ""}`} />
            <div className="absolute size-2.5 rounded-full bg-[#2B2623]" />
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#E07B4C] font-bold block mb-0.5">
              {isPlaying ? "Đang phát 🎵" : "Tạm dừng ⏸️"}
            </span>
            <h4 className="font-serif text-sm font-bold truncate">
              {currentTrack.title}
            </h4>
            <p className="text-xs text-[#5C5146] dark:text-[#C4B9AD] truncate font-medium">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Playback Controls & Volume */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={prevTrack}
              className="size-10 rounded-[10px] bg-[#E5DDD2] dark:bg-[#332A24] hover:bg-[#DBD1C4] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center cursor-pointer"
              title="Bài trước"
            >
              <SkipBack className="size-4" />
            </button>

            <button
              onClick={togglePlay}
              className="size-12 rounded-[12px] bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] active:translate-x-[1.5px] active:translate-y-[2px] active:shadow-none flex items-center justify-center cursor-pointer"
              title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
            >
              {isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={nextTrack}
              className="size-10 rounded-[10px] bg-[#E5DDD2] dark:bg-[#332A24] hover:bg-[#DBD1C4] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center cursor-pointer"
              title="Bài tiếp theo"
            >
              <SkipForward className="size-4" />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-[10px] bg-[#E5DDD2]/60 dark:bg-[#28211D] border border-[#2B2623]/20">
            <button
              onClick={toggleMute}
              className="text-[#5C5146] dark:text-[#C4B9AD] hover:text-[#2B2623] cursor-pointer"
              title={isMuted ? "Bật âm thanh" : "Tắt tiếng"}
            >
              {isMuted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-1.5 rounded-lg bg-[#FAF5EE] dark:bg-[#1A1614] accent-[#E07B4C] cursor-pointer"
            />
            <span className="text-[10px] font-mono text-[#5C5146] dark:text-[#C4B9AD] w-7 text-right font-bold">
              {isMuted ? 0 : volume}%
            </span>
          </div>
        </div>

        {/* Curated Playlist List */}
        <div className="mb-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#5C5146] dark:text-[#C4B9AD] font-bold block mb-1.5">
            Danh sách phát sẵn có ({playlist.length})
          </span>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {playlist.map((track, idx) => {
              const isSelected = idx === currentTrackIndex;
              return (
                <button
                  key={track.id}
                  onClick={() => playTrackByIndex(idx)}
                  className={`w-full text-left px-3 py-2 rounded-[10px] border transition-all flex items-center justify-between gap-2 text-xs cursor-pointer ${
                    isSelected
                      ? "bg-[#E07B4C] text-white border-2 border-[#2B2623] font-bold shadow-[1px_2px_0px_#2B2623]"
                      : "bg-[#FDFBF7] dark:bg-[#26211E] text-[#5C5146] dark:text-[#C4B9AD] border-[#2B2623]/20 hover:border-[#2B2623]"
                  }`}
                >
                  <div className="truncate">
                    <span className="truncate">{track.title}</span>
                    <span className="text-[10px] opacity-80 block truncate">
                      {track.artist}
                    </span>
                  </div>
                  {isSelected && isPlaying && (
                    <span className="size-2 rounded-full bg-white animate-ping shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add Custom YouTube Link */}
        <form onSubmit={handleAddCustom} className="pt-3 border-t-2 border-[#2B2623]/20">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#5C5146] dark:text-[#C4B9AD] font-bold flex items-center gap-1.5 mb-2">
            <YouTubeIcon className="size-3.5 text-red-600" />
            <span>Phát nhạc từ YouTube của bạn</span>
          </span>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Dán link YouTube (hoặc video ID)..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-[10px] bg-[#FDFBF7] dark:bg-[#26211E] border-2 border-[#2B2623] placeholder:text-[#5C5146]/60 focus:outline-none"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tên bài hát (tùy chọn)..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-[10px] bg-[#FDFBF7] dark:bg-[#26211E] border-2 border-[#2B2623] placeholder:text-[#5C5146]/60 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-[10px] bg-[#BDCEAF] text-[#2B2623] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="size-3" />
                <span>Phát ngay</span>
              </button>
            </div>
            {errorMsg && (
              <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                {errorMsg}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
