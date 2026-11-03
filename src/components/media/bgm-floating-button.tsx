"use client";

import * as React from "react";
import { Pause, Play, Volume2, VolumeX, X } from "lucide-react";

const TRACKS = [
  {
    title: "Gymnopédie No. 1",
    artist: "Erik Satie",
    src: "https://upload.wikimedia.org/wikipedia/commons/3/34/Erik_Satie_-_Gymnop%C3%A9die_No._1.ogg",
  },
  {
    title: "Clair de Lune",
    artist: "Claude Debussy",
    src: "https://upload.wikimedia.org/wikipedia/commons/2/28/Debussy_-_Clair_de_Lune.ogg",
  },
];

export function BgmFloatingButton() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [isMuted, setIsMuted] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentIdx];

  React.useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack.src);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.35;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentTrack]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.warn("Autoplay prevented:", e));
    }
  };

  const switchTrack = (idx: number) => {
    setCurrentIdx(idx);
    if (audioRef.current) {
      audioRef.current.src = TRACKS[idx].src;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      {/* Floating Retro BGM Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative size-12 rounded-[14px] bg-[#E2D8C0] text-[#2B2623] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] flex items-center justify-center transition-all hover:translate-x-[0.5px] hover:translate-y-[1px] hover:shadow-[1.5px_3px_0px_#2B2623] active:translate-x-[2px] active:translate-y-[4px] active:shadow-none cursor-pointer"
        title="Nhạc nền đọc truyện (BGM)"
      >
        <span className="text-lg">🎵</span>

        {/* Small Pastel Orange Accent Dot */}
        <span
          className={`absolute top-2 right-2 size-2 rounded-full bg-[#E07B4C] ${
            isPlaying ? "animate-ping" : ""
          }`}
        />
        <span className="absolute top-2 right-2 size-2 rounded-full bg-[#E07B4C]" />
      </button>

      {/* Floating Mini Player Dialog */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 p-4 rounded-[18px] bg-[#FAF5EE] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[3px_5px_0px_#2B2623] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-[#2B2623]/20">
            <div className="flex items-center gap-2">
              <span className="text-base">📻</span>
              <span className="font-serif text-xs font-bold text-[#2B2623] dark:text-[#FAF5EE]">
                Media Naranja BGM
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                title={isMuted ? "Bật tiếng" : "Tắt tiếng"}
              >
                {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5 mb-3 font-mono">
            {TRACKS.map((track, idx) => (
              <button
                key={track.title}
                type="button"
                onClick={() => switchTrack(idx)}
                className={`w-full text-left px-2.5 py-1.5 rounded-[10px] text-xs flex items-center justify-between transition-colors border ${
                  currentIdx === idx
                    ? "bg-[#E5DDD2] dark:bg-[#3D352E] border-[#2B2623] text-[#2B2623] dark:text-[#FAF5EE] font-bold shadow-2xs"
                    : "border-transparent text-muted-foreground hover:bg-[#EFE8DE] dark:hover:bg-[#1A1614]"
                }`}
              >
                <div className="truncate mr-2">
                  <span className="block truncate">{track.title}</span>
                  <span className="text-[10px] opacity-75">{track.artist}</span>
                </div>
                {currentIdx === idx && isPlaying && (
                  <span className="size-2 rounded-full bg-[#E07B4C] animate-pulse" />
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={togglePlay}
            className="w-full h-9 rounded-[12px] bg-[#E07B4C] text-white border-2 border-[#2B2623] shadow-[1.5px_3px_0px_#2B2623] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#DC7648] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="size-3.5 fill-current" />
                <span>Tạm dừng giai điệu</span>
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-current ml-0.5" />
                <span>Bật nhạc nền</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

