"use client";

import * as React from "react";
import { type BgmTrackItem } from "@/lib/data";

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
  return "";
}

interface BgmContextType {
  isPlaying: boolean;
  currentTrack: BgmTrackItem | null;
  savedTracks: BgmTrackItem[];
  volume: number;
  isMuted: boolean;
  isLooping: boolean;
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  togglePlay: () => void;
  playCustomUrl: (url: string, title?: string, artist?: string) => boolean;
  playTrack: (track: BgmTrackItem) => void;
  removeTrack: (id: string) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  stopPlayback: () => void;
}

const BgmContext = React.createContext<BgmContextType | null>(null);

const STORAGE_KEY_SAVED_TRACKS = "media_naranja_bgm_saved_tracks";
const STORAGE_KEY_CURRENT_TRACK = "media_naranja_bgm_current_track";
const STORAGE_KEY_VOLUME = "media_naranja_bgm_volume";
const STORAGE_KEY_LOOP = "media_naranja_bgm_loop";

export function BgmProvider({ children }: { children: React.ReactNode }) {
  const [savedTracks, setSavedTracks] = React.useState<BgmTrackItem[]>([]);
  const [currentTrack, setCurrentTrack] = React.useState<BgmTrackItem | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [volume, setVolumeState] = React.useState(60);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isLooping, setIsLooping] = React.useState(true);
  const [isModalOpen, setModalOpen] = React.useState(false);

  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);

  // Load persisted state from localStorage on initial mount
  React.useEffect(() => {
    try {
      const storedSaved = localStorage.getItem(STORAGE_KEY_SAVED_TRACKS);
      if (storedSaved) {
        const parsed = JSON.parse(storedSaved);
        if (Array.isArray(parsed)) setSavedTracks(parsed);
      }

      const storedCurrent = localStorage.getItem(STORAGE_KEY_CURRENT_TRACK);
      if (storedCurrent) {
        const parsed = JSON.parse(storedCurrent);
        if (parsed && parsed.youtubeId) {
          setCurrentTrack(parsed);
        }
      }

      const storedVol = localStorage.getItem(STORAGE_KEY_VOLUME);
      if (storedVol !== null) {
        const parsedVol = Number(storedVol);
        if (!isNaN(parsedVol)) setVolumeState(parsedVol);
      }

      const storedLoop = localStorage.getItem(STORAGE_KEY_LOOP);
      if (storedLoop !== null) {
        setIsLooping(storedLoop === "true");
      }
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  // PostMessage sender to YouTube iframe
  const sendYtCommand = React.useCallback((func: string, args: unknown[] = []) => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func, args }),
          "*"
        );
      }
    } catch {
      // cross-origin safe
    }
  }, []);

  // Update MediaSession API for OS-level background playback continuity
  React.useEffect(() => {
    if (typeof window !== "undefined" && "mediaSession" in navigator) {
      if (currentTrack) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: currentTrack.title,
            artist: currentTrack.artist || "YouTube Audio",
            album: "Media naranja • Nhạc Nền Đọc Truyện",
            artwork: [
              {
                src: "/cropped-cropped-cropped-medianaranja.webp",
                sizes: "512x512",
                type: "image/webp",
              },
            ],
          });
          navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
        } catch {
          // ignore
        }
      }
    }
  }, [currentTrack, isPlaying]);

  // Listen to YouTube player state events
  React.useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        if (typeof e.data !== "string") return;
        const data = JSON.parse(e.data);
        if (data.event === "onStateChange") {
          // 0 = ended, 1 = playing, 2 = paused
          if (data.info === 0) {
            if (isLooping && currentTrack) {
              sendYtCommand("seekTo", [0, true]);
              sendYtCommand("playVideo");
              setIsPlaying(true);
            } else {
              setIsPlaying(false);
            }
          } else if (data.info === 1) {
            setIsPlaying(true);
          } else if (data.info === 2) {
            setIsPlaying(false);
          }
        }
      } catch {
        // non-json postMessage
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isLooping, currentTrack, sendYtCommand]);

  const togglePlay = React.useCallback(() => {
    if (!currentTrack) {
      setModalOpen(true);
      return;
    }

    if (isPlaying) {
      sendYtCommand("pauseVideo");
      setIsPlaying(false);
    } else {
      sendYtCommand("playVideo");
      setIsPlaying(true);
    }
  }, [currentTrack, isPlaying, sendYtCommand]);

  const playTrack = React.useCallback(
    (track: BgmTrackItem) => {
      setCurrentTrack(track);
      setIsPlaying(true);
      try {
        localStorage.setItem(STORAGE_KEY_CURRENT_TRACK, JSON.stringify(track));
      } catch {}

      // If iframe already mounted with youtube, load video ID seamlessly without reloading iframe
      if (iframeRef.current) {
        sendYtCommand("loadVideoById", [{ videoId: track.youtubeId, startSeconds: 0 }]);
        sendYtCommand("setVolume", [isMuted ? 0 : volume]);
        sendYtCommand("playVideo");
      }
    },
    [sendYtCommand, isMuted, volume]
  );

  const playCustomUrl = React.useCallback(
    (url: string, title?: string, artist?: string): boolean => {
      const id = extractYouTubeId(url);
      if (!id) return false;

      const trackTitle = title?.trim() || `YouTube Track (${id})`;
      const trackArtist = artist?.trim() || "YouTube Creator";

      const newTrack: BgmTrackItem = {
        id: `yt_${id}_${Date.now()}`,
        title: trackTitle,
        artist: trackArtist,
        youtubeId: id,
      };

      // Add to saved tracks if not duplicate ID
      setSavedTracks((prev) => {
        const filtered = prev.filter((t) => t.youtubeId !== id);
        const updated = [newTrack, ...filtered].slice(0, 30);
        try {
          localStorage.setItem(STORAGE_KEY_SAVED_TRACKS, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      playTrack(newTrack);
      return true;
    },
    [playTrack]
  );

  const removeTrack = React.useCallback((id: string) => {
    setSavedTracks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY_SAVED_TRACKS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const setVolume = React.useCallback(
    (vol: number) => {
      const clamped = Math.max(0, Math.min(100, vol));
      setVolumeState(clamped);
      try {
        localStorage.setItem(STORAGE_KEY_VOLUME, String(clamped));
      } catch {}

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

  const toggleLoop = React.useCallback(() => {
    setIsLooping((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_LOOP, String(next));
      } catch {}
      return next;
    });
  }, []);

  const stopPlayback = React.useCallback(() => {
    sendYtCommand("stopVideo");
    setIsPlaying(false);
  }, [sendYtCommand]);

  // Handle iframe initial ready state
  const handleIframeLoad = React.useCallback(() => {
    if (isPlaying && currentTrack) {
      sendYtCommand("setVolume", [isMuted ? 0 : volume]);
      sendYtCommand("playVideo");
    }
  }, [isPlaying, currentTrack, isMuted, volume, sendYtCommand]);

  // Base URL for YouTube embed - Stable, without dynamic autoplay query param!
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const iframeSrc = currentTrack
    ? `https://www.youtube-nocookie.com/embed/${currentTrack.youtubeId}?enablejsapi=1&origin=${encodeURIComponent(
        origin
      )}&playsinline=1&controls=0&rel=0&iv_load_policy=3&disablekb=1&loop=${
        isLooping ? "1" : "0"
      }&playlist=${currentTrack.youtubeId}`
    : "";

  return (
    <BgmContext.Provider
      value={{
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
        stopPlayback,
      }}
    >
      {children}

      {/* 
        Persistent Audio Frame for Background Playback:
        Giving the iframe actual viewport dimensions (260x146px) with opacity: 0.001
        prevents Chromium browsers from flagging it as a hidden/invisible background ad
        and freezing audio decoding when switching between browser tabs or windows.
      */}
      <div
        className="fixed bottom-0 right-0 pointer-events-none select-none overflow-hidden z-[-1]"
        style={{ width: "260px", height: "146px", opacity: 0.001 }}
        aria-hidden="true"
      >
        {iframeSrc ? (
          <iframe
            ref={iframeRef}
            id="global-bgm-youtube-iframe"
            src={iframeSrc}
            allow="autoplay; encrypted-media; picture-in-picture"
            title="Media Naranja YouTube Audio Player"
            tabIndex={-1}
            onLoad={handleIframeLoad}
            className="w-full h-full border-0"
          />
        ) : null}
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
