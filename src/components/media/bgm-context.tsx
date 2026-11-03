"use client";

import * as React from "react";
import { DEFAULT_BGM_PLAYLIST, type BgmTrackItem } from "@/lib/data";

export function extractYouTubeId(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  // Direct 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  // youtu.be/<id>
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  // youtube.com/watch?v=<id>
  const longMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (longMatch) return longMatch[1];
  // youtube.com/embed/<id>
  const embedMatch = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  // youtube.com/live/<id>
  const liveMatch = trimmed.match(/live\/([a-zA-Z0-9_-]{11})/);
  if (liveMatch) return liveMatch[1];
  return trimmed;
}

interface BgmContextType {
  isPlaying: boolean;
  currentTrackIndex: number;
  currentTrack: BgmTrackItem;
  playlist: BgmTrackItem[];
  volume: number;
  isMuted: boolean;
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  togglePlay: () => void;
  playTrackByIndex: (index: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  playCustomUrl: (title: string, url: string) => boolean;
}

const BgmContext = React.createContext<BgmContextType | null>(null);

export function BgmProvider({
  children,
  initialPlaylist = DEFAULT_BGM_PLAYLIST,
}: {
  children: React.ReactNode;
  initialPlaylist?: BgmTrackItem[];
}) {
  const [playlist, setPlaylist] = React.useState<BgmTrackItem[]>(initialPlaylist);
  const [currentTrackIndex, setCurrentTrackIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [volume, setVolumeState] = React.useState(50);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isModalOpen, setModalOpen] = React.useState(false);

  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const currentTrack = playlist[currentTrackIndex] || initialPlaylist[0];

  // Helper to send postMessage commands to YouTube Iframe
  const sendYtCommand = React.useCallback((func: string, args: unknown[] = []) => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func, args }),
          "*"
        );
      }
    } catch {
      // Cross-origin safe guard
    }
  }, []);

  const togglePlay = React.useCallback(() => {
    if (isPlaying) {
      sendYtCommand("pauseVideo");
      setIsPlaying(false);
    } else {
      sendYtCommand("playVideo");
      setIsPlaying(true);
    }
  }, [isPlaying, sendYtCommand]);

  const playTrackByIndex = React.useCallback(
    (index: number) => {
      if (index >= 0 && index < playlist.length) {
        setCurrentTrackIndex(index);
        setIsPlaying(true);
      }
    },
    [playlist.length]
  );

  const nextTrack = React.useCallback(() => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
  }, [playlist.length]);

  const prevTrack = React.useCallback(() => {
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  }, [playlist.length]);

  const setVolume = React.useCallback(
    (vol: number) => {
      const clamped = Math.max(0, Math.min(100, vol));
      setVolumeState(clamped);
      sendYtCommand("setVolume", [clamped]);
      if (isMuted && clamped > 0) {
        setIsMuted(false);
        sendYtCommand("unMute");
      }
    },
    [isMuted, sendYtCommand]
  );

  const toggleMute = React.useCallback(() => {
    if (isMuted) {
      sendYtCommand("unMute");
      sendYtCommand("setVolume", [volume]);
      setIsMuted(false);
    } else {
      sendYtCommand("mute");
      setIsMuted(true);
    }
  }, [isMuted, volume, sendYtCommand]);

  const playCustomUrl = React.useCallback(
    (title: string, url: string): boolean => {
      const id = extractYouTubeId(url);
      if (!id) return false;

      const newTrack: BgmTrackItem = {
        id: `yt-${Date.now()}`,
        title: title.trim() || `YouTube Track (${id})`,
        artist: "YouTube Stream",
        youtubeId: id,
      };

      setPlaylist((prev) => [newTrack, ...prev]);
      setCurrentTrackIndex(0);
      setIsPlaying(true);
      return true;
    },
    []
  );

  return (
    <BgmContext.Provider
      value={{
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
      }}
    >
      {children}

      {/* Hidden YouTube Iframe Player (always ready to stream audio in background) */}
      <div
        className="fixed -bottom-96 -right-96 pointer-events-none opacity-0 select-none overflow-hidden"
        style={{ width: "1px", height: "1px" }}
        aria-hidden="true"
      >
        <iframe
          ref={iframeRef}
          id="global-bgm-youtube-iframe"
          src={`https://www.youtube-nocookie.com/embed/${currentTrack.youtubeId}?enablejsapi=1&autoplay=${
            isPlaying ? "1" : "0"
          }&loop=1&playlist=${currentTrack.youtubeId}&controls=0&rel=0&iv_load_policy=3&disablekb=1`}
          allow="autoplay; encrypted-media"
          title="Media Naranja Background Music Player"
          tabIndex={-1}
        />
      </div>
    </BgmContext.Provider>
  );
}

export function useBgm() {
  const context = React.useContext(BgmContext);
  if (!context) {
    throw new Error("useBgm must be used within a BgmProvider");
  }
  return context;
}

