"use client";

import * as React from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Repeat,
  X,
  Disc3,
  Trash2,
  ExternalLink,
  Plus,
  Radio,
} from "lucide-react";
import { useBgm, extractYouTubeId } from "./bgm-context";

function YouTubeIcon({ className = "size-3.5 text-red-600" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// Quick suggestions for relaxing background reading music (YouTube)
const QUICK_SUGGESTIONS = [
  {
    title: "Lofi Beats to Relax / Study",
    artist: "Lofi Girl",
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
  },
  {
    title: "Relaxing Studio Ghibli Piano",
    artist: "Piano Ghibli",
    url: "https://www.youtube.com/watch?v=0Ww8L7Z5x0M",
  },
  {
    title: "Peaceful Classical Piano",
    artist: "Debussy & Satie",
    url: "https://www.youtube.com/watch?v=WNcsUNKlAKw",
  },
];

export function BgmModal() {
  const {
    isPlaying,
    currentTrack,
    savedTracks,
    volume,
    isMuted,
    isLooping,
    isModalOpen,
    setModalOpen,
    togglePlay,
    playCustomUrl,
    playTrack,
    removeTrack,
    setVolume,
    toggleMute,
    toggleLoop,
  } = useBgm();

  const [customTitle, setCustomTitle] = React.useState("");
  const [customUrl, setCustomUrl] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");

  if (!isModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const id = extractYouTubeId(customUrl);
    if (!id) {
      setErrorMsg("Vui lòng dán link YouTube hoặc Video ID hợp lệ.");
      return;
    }

    const ok = playCustomUrl(customUrl, customTitle);
    if (ok) {
      setCustomTitle("");
      setCustomUrl("");
    }
  };

  const handleSuggestionClick = (sug: (typeof QUICK_SUGGESTIONS)[0]) => {
    setErrorMsg("");
    playCustomUrl(sug.url, sug.title, sug.artist);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-[20px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[4px_6px_0px_#2B2623] p-5 sm:p-6 text-[#2B2623] dark:text-[#FAF5EE] select-none max-h-[90vh] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#2B2623]/20">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[8px] bg-[#F4DFAD] text-[#2B2623] border border-[#2B2623]">
              <Disc3
                className={`size-4 ${
                  isPlaying ? "animate-spin [animation-duration:3s] text-[#E07B4C]" : ""
                }`}
              />
            </span>
            <div>
              <h3 className="font-serif text-base font-bold leading-tight flex items-center gap-1.5">
                <span>Nhạc Nền Đọc Truyện</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[6px] bg-[#BDCEAF] text-[#2B2623] border border-[#2B2623]">
                  YouTube BGM
                </span>
              </h3>
              <p className="text-[11px] text-[#5C5146] dark:text-[#C4B9AD] font-medium">
                Âm nhạc phát liên tục xuyên suốt trang và cả khi đổi tab trình duyệt
              </p>
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

        {/* Current Playing Track Banner */}
        {currentTrack ? (
          <div className="p-4 rounded-[14px] bg-[#FDFBF7] dark:bg-[#26211E] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] mb-4">
            <div className="flex items-center gap-3.5 mb-3">
              <div className="relative size-12 shrink-0 rounded-[10px] bg-[#E2D8C0] dark:bg-[#332A24] border border-[#2B2623] flex items-center justify-center">
                <Disc3
                  className={`size-7 text-[#E07B4C] ${
                    isPlaying ? "animate-spin [animation-duration:4s]" : ""
                  }`}
                />
                <div className="absolute size-2 rounded-full bg-[#2B2623]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#E07B4C] font-bold">
                    {isPlaying ? "Đang phát 🎵" : "Tạm dừng ⏸️"}
                  </span>
                  <a
                    href={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-muted-foreground hover:text-[#E07B4C] flex items-center gap-0.5"
                    title="Mở trên YouTube"
                  >
                    <span>Mở link</span>
                    <ExternalLink className="size-2.5" />
                  </a>
                </div>
                <h4 className="font-serif text-sm font-bold truncate">
                  {currentTrack.title}
                </h4>
                <p className="text-xs text-[#5C5146] dark:text-[#C4B9AD] truncate font-medium">
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            {/* Controls: Play/Pause, Volume, Loop */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#2B2623]/15">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="px-4 py-2 rounded-[10px] bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="size-3.5 fill-current" />
                      <span>Tạm dừng</span>
                    </>
                  ) : (
                    <>
                      <Play className="size-3.5 fill-current ml-0.5" />
                      <span>Tiếp tục</span>
                    </>
                  )}
                </button>

                <button
                  onClick={toggleLoop}
                  className={`size-8 rounded-[8px] border-2 border-[#2B2623] flex items-center justify-center transition-all cursor-pointer ${
                    isLooping
                      ? "bg-[#BDCEAF] text-[#2B2623] shadow-[1px_1.5px_0px_#2B2623]"
                      : "bg-[#E5DDD2] dark:bg-[#332A24] text-muted-foreground opacity-60"
                  }`}
                  title={isLooping ? "Đang bật lặp lại bài" : "Tắt lặp lại"}
                >
                  <Repeat className="size-3.5" />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 flex-1 max-w-[180px]">
                <button
                  onClick={toggleMute}
                  className="text-[#5C5146] dark:text-[#C4B9AD] hover:text-[#2B2623] cursor-pointer shrink-0"
                  title={isMuted ? "Bật tiếng" : "Tắt tiếng"}
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
                  className="flex-1 h-1.5 rounded-lg bg-[#E5DDD2] dark:bg-[#1A1614] accent-[#E07B4C] cursor-pointer"
                />
                <span className="text-[10px] font-mono text-[#5C5146] dark:text-[#C4B9AD] w-7 text-right font-bold shrink-0">
                  {isMuted ? 0 : volume}%
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-[14px] bg-[#FDFBF7] dark:bg-[#26211E] border-2 border-dashed border-[#2B2623]/30 text-center mb-4">
            <Radio className="size-6 text-[#E07B4C] mx-auto mb-1.5 opacity-80" />
            <p className="text-xs font-serif font-bold text-foreground">
              Chưa có nhạc nền nào đang phát
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Dán link YouTube bất kỳ bên dưới hoặc chọn gợi ý để bắt đầu vừa đọc vừa nghe nhạc.
            </p>
          </div>
        )}

        {/* Input New YouTube Stream */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#5C5146] dark:text-[#C4B9AD] font-bold flex items-center gap-1.5">
              <YouTubeIcon className="size-3.5 text-red-600" />
              <span>Phát Nhạc Từ YouTube</span>
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Dán link YouTube (ví dụ: https://youtube.com/watch?v=... hoặc youtu.be/...)"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-[10px] bg-[#FDFBF7] dark:bg-[#26211E] border-2 border-[#2B2623] placeholder:text-[#5C5146]/60 focus:outline-none"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tên bài hát / Lời đề tặng (tùy chọn)..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-[10px] bg-[#FDFBF7] dark:bg-[#26211E] border-2 border-[#2B2623] placeholder:text-[#5C5146]/60 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-[10px] bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="size-3.5" />
                <span>Phát Ngay</span>
              </button>
            </div>
            {errorMsg && (
              <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                {errorMsg}
              </p>
            )}
          </div>
        </form>

        {/* Quick Suggestions Chips */}
        <div className="mb-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold block mb-1.5">
            Gợi ý nhanh nhạc êm dịu đọc sách:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SUGGESTIONS.map((sug) => (
              <button
                key={sug.url}
                type="button"
                onClick={() => handleSuggestionClick(sug)}
                className="px-2.5 py-1 rounded-[8px] bg-[#E5DDD2] dark:bg-[#2C241F] hover:bg-[#DCD3C6] border border-[#2B2623] text-[11px] font-semibold text-[#5C5146] dark:text-[#E5DDD2] cursor-pointer flex items-center gap-1 transition-all"
              >
                <YouTubeIcon className="size-3" />
                <span>{sug.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Saved / Recent YouTube Tracks */}
        {savedTracks.length > 0 && (
          <div className="pt-3 border-t-2 border-[#2B2623]/20">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#5C5146] dark:text-[#C4B9AD] font-bold block mb-2">
              Các bài đã nghe gần đây ({savedTracks.length})
            </span>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {savedTracks.map((track) => {
                const isSelected = currentTrack?.youtubeId === track.youtubeId;
                return (
                  <div
                    key={track.id}
                    className={`px-3 py-1.5 rounded-[10px] border transition-all flex items-center justify-between gap-2 text-xs ${
                      isSelected
                        ? "bg-[#E07B4C] text-white border-2 border-[#2B2623] font-bold shadow-[1px_2px_0px_#2B2623]"
                        : "bg-[#FDFBF7] dark:bg-[#26211E] text-[#5C5146] dark:text-[#C4B9AD] border-[#2B2623]/20 hover:border-[#2B2623]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => playTrack(track)}
                      className="flex-1 text-left truncate flex items-center gap-2 cursor-pointer"
                    >
                      <YouTubeIcon className="size-3 shrink-0" />
                      <span className="truncate">{track.title}</span>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      {isSelected && isPlaying && (
                        <span className="size-2 rounded-full bg-white animate-ping mr-1" />
                      )}
                      <button
                        type="button"
                        onClick={() => removeTrack(track.id)}
                        className={`size-6 rounded-[6px] flex items-center justify-center cursor-pointer transition-colors ${
                          isSelected
                            ? "hover:bg-white/20 text-white"
                            : "hover:bg-[#E5DDD2] text-muted-foreground hover:text-red-600"
                        }`}
                        title="Xóa bài này khỏi lịch sử"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
