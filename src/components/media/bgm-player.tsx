"use client";

import * as React from "react";
import { Music, Volume2, VolumeX, Play, Pause, Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLAYLIST = [
  {
    title: "Gymnopédie No. 1",
    artist: "Erik Satie",
    // Royalty-free classical piano recording from Wikimedia Commons
    src: "https://upload.wikimedia.org/wikipedia/commons/3/34/Erik_Satie_-_Gymnop%C3%A9die_No._1.ogg",
  },
  {
    title: "Clair de Lune",
    artist: "Claude Debussy",
    src: "https://upload.wikimedia.org/wikipedia/commons/2/28/Debussy_-_Clair_de_Lune.ogg",
  },
];

export function BgmPlayer() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = React.useState(0);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const currentTrack = PLAYLIST[currentTrackIndex];

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
        .then(() => {
          setIsPlaying(true);
        })
        .catch((e) => {
          console.warn("Autoplay was prevented:", e);
        });
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const switchTrack = (index: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = PLAYLIST[index].src;
      setCurrentTrackIndex(index);
      if (isPlaying) {
        audioRef.current.play().catch(console.warn);
      }
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 px-2.5 rounded-full border transition-all flex items-center gap-1.5 text-xs ${
          isPlaying
            ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium"
            : "border-border/70 text-muted-foreground hover:text-foreground"
        }`}
        title="Nhạc nền đọc truyện (BGM)"
      >
        <Disc3 className={`size-3.5 ${isPlaying ? "animate-spin [animation-duration:4s] text-amber-600" : ""}`} />
        <span className="hidden lg:inline-block">BGM</span>
        {isPlaying && (
          <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
        )}
      </Button>

      {/* Floating Mini Panel */}
      {isOpen && (
        <div className="absolute right-0 top-11 w-64 p-3.5 rounded-2xl bg-card border border-border shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Music className="size-3.5 text-amber-600" />
              <span>Giai Điệu Êm Dịu</span>
            </div>
            <button
              onClick={toggleMute}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              title={isMuted ? "Bật tiếng" : "Tắt tiếng"}
            >
              {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
            </button>
          </div>

          <div className="space-y-1.5 mb-3">
            {PLAYLIST.map((track, idx) => (
              <button
                key={track.title}
                onClick={() => switchTrack(idx)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  currentTrackIndex === idx
                    ? "bg-secondary text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="truncate mr-2">
                  <span className="block truncate">{track.title}</span>
                  <span className="text-[10px] opacity-75">{track.artist}</span>
                </div>
                {currentTrackIndex === idx && isPlaying && (
                  <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            onClick={togglePlay}
            className="w-full h-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs flex items-center justify-center gap-1.5 font-medium shadow-xs"
          >
            {isPlaying ? (
              <>
                <Pause className="size-3.5 fill-current" />
                <span>Tạm dừng</span>
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-current ml-0.5" />
                <span>Phát nhạc nền</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

