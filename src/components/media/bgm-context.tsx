"use client";

import * as React from "react";
import { DEFAULT_BGM_PLAYLIST_ID } from "@/lib/data";

interface BgmContextType {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  playlistId: string;
  playlistUrl: string;
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  updatePlaylistId: (id: string) => void;
}

const BgmContext = React.createContext<BgmContextType | null>(null);

const STORAGE_KEY_PLAYLIST_ID = "media_naranja_bgm_locked_playlist_id";
const STORAGE_KEY_VOLUME = "media_naranja_bgm_volume";

export function BgmProvider({
  children,
  initialPlaylistId = DEFAULT_BGM_PLAYLIST_ID,
}: {
  children: React.ReactNode;
  initialPlaylistId?: string;
}) {
  const [playlistId, setPlaylistId] = React.useState<string>(initialPlaylistId);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [volume, setVolumeState] = React.useState(60);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isModalOpen, setModalOpen] = React.useState(false);

  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);

  // Restore volume and playlistId from localStorage
  React.useEffect(() => {
    try {
      const storedVol = localStorage.getItem(STORAGE_KEY_VOLUME);
      if (storedVol !== null) {
        const parsed = Number(storedVol);
        if (!isNaN(parsed)) setVolumeState(parsed);
      }

      const storedPl = localStorage.getItem(STORAGE_KEY_PLAYLIST_ID);
      if (storedPl && storedPl.trim()) {
        setPlaylistId(storedPl.trim());
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Safe PostMessage to YouTube IFrame
  const sendYtCommand = React.useCallback((func: string, args: unknown[] = []) => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func, args }),
          "*"
        );
      }
    } catch {
      // cross-origin
    }
  }, []);

  // Update OS-level MediaSession for continuous background playback
  React.useEffect(() => {
    if (typeof window !== "undefined" && "mediaSession" in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: "Media Naranja • Nhạc Nền Đọc Truyện",
          artist: "Celine Wang's Curated Playlist",
          album: "Media naranja Official BGM",
          artwork: [
            {
              src: "/cropped-cropped-cropped-medianaranja.webp",
              sizes: "512x512",
              type: "image/webp",
            },
          ],
        });
        navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
        navigator.mediaSession.setActionHandler("play", () => {
          sendYtCommand("playVideo");
          setIsPlaying(true);
        });
        navigator.mediaSession.setActionHandler("pause", () => {
          sendYtCommand("pauseVideo");
          setIsPlaying(false);
        });
        navigator.mediaSession.setActionHandler("nexttrack", () => {
          sendYtCommand("nextVideo");
          setIsPlaying(true);
        });
        navigator.mediaSession.setActionHandler("previoustrack", () => {
          sendYtCommand("previousVideo");
          setIsPlaying(true);
        });
      } catch {
        // ignore
      }
    }
  }, [isPlaying, sendYtCommand]);

  // Listen to YouTube player state events
  React.useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        if (typeof e.data !== "string") return;
        const data = JSON.parse(e.data);
        if (data.event === "onStateChange") {
          // 1 = playing, 2 = paused, 0 = ended
          if (data.info === 1) {
            setIsPlaying(true);
          } else if (data.info === 2) {
            setIsPlaying(false);
          } else if (data.info === 0) {
            // Loop playlist or play next
            sendYtCommand("nextVideo");
          }
        }
      } catch {
        // non-json
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [sendYtCommand]);

  const togglePlay = React.useCallback(() => {
    if (isPlaying) {
      sendYtCommand("pauseVideo");
      setIsPlaying(false);
    } else {
      sendYtCommand("playVideo");
      setIsPlaying(true);
    }
  }, [isPlaying, sendYtCommand]);

  const nextTrack = React.useCallback(() => {
    sendYtCommand("nextVideo");
    setIsPlaying(true);
  }, [sendYtCommand]);

  const prevTrack = React.useCallback(() => {
    sendYtCommand("previousVideo");
    setIsPlaying(true);
  }, [sendYtCommand]);

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

  const updatePlaylistId = React.useCallback((id: string) => {
    if (!id || !id.trim()) return;
    const cleanId = id.trim();
    setPlaylistId(cleanId);
    try {
      localStorage.setItem(STORAGE_KEY_PLAYLIST_ID, cleanId);
    } catch {}
    // Load new playlist in iframe
    sendYtCommand("loadPlaylist", [{ list: cleanId, listType: "playlist" }]);
    sendYtCommand("playVideo");
    setIsPlaying(true);
  }, [sendYtCommand]);

  const handleIframeLoad = React.useCallback(() => {
    if (isPlaying) {
      sendYtCommand("setVolume", [isMuted ? 0 : volume]);
      sendYtCommand("playVideo");
    }
  }, [isPlaying, isMuted, volume, sendYtCommand]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const iframeSrc = `https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}&enablejsapi=1&origin=${encodeURIComponent(
    origin
  )}&playsinline=1&controls=0&rel=0&iv_load_policy=3&disablekb=1&loop=1`;

  const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;

  return (
    <BgmContext.Provider
      value={{
        isPlaying,
        volume,
        isMuted,
        playlistId,
        playlistUrl,
        isModalOpen,
        setModalOpen,
        togglePlay,
        nextTrack,
        prevTrack,
        setVolume,
        toggleMute,
        updatePlaylistId,
      }}
    >
      {children}

      {/* 
        Persistent Non-throttled Audio Frame for Background Playback:
        Dimensions: 260x146px with opacity: 0.001 in-bounds
        guarantees Chrome/Edge does not suspend the tab or audio during browser tab switches.
      */}
      <div
        className="fixed bottom-0 right-0 pointer-events-none select-none overflow-hidden z-[-1]"
        style={{ width: "260px", height: "146px", opacity: 0.001 }}
        aria-hidden="true"
      >
        <iframe
          ref={iframeRef}
          id="global-bgm-youtube-iframe"
          src={iframeSrc}
          allow="autoplay; encrypted-media; picture-in-picture"
          title="Media Naranja Official Background Music Player"
          tabIndex={-1}
          onLoad={handleIframeLoad}
          className="w-full h-full border-0"
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
