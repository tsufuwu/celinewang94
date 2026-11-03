"use client";

import * as React from "react";
import {
  Music,
  Plus,
  Trash2,
  Save,
  Check,
  Disc3,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveBgmPlaylist, type BgmTrackItem } from "@/app/admin/actions";
import { extractYouTubeId } from "@/components/media/bgm-context";

function YouTubeIcon({ className = "size-4 text-red-600" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface BgmManagerProps {
  initialPlaylist: BgmTrackItem[];
}

export function BgmManager({ initialPlaylist }: BgmManagerProps) {
  const [playlist, setPlaylist] = React.useState<BgmTrackItem[]>(initialPlaylist);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  // New track form inputs
  const [newTitle, setNewTitle] = React.useState("");
  const [newArtist, setNewArtist] = React.useState("");
  const [newUrl, setNewUrl] = React.useState("");

  const handleAddTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    const id = extractYouTubeId(newUrl);
    if (!id) {
      setErrorMessage("Link YouTube hoặc Video ID không hợp lệ.");
      return;
    }

    const newTrack: BgmTrackItem = {
      id: `bgm_${Date.now()}`,
      title: newTitle.trim() || `Bản nhạc (${id})`,
      artist: newArtist.trim() || "YouTube Creator",
      youtubeId: id,
    };

    setPlaylist((prev) => [...prev, newTrack]);
    setNewTitle("");
    setNewArtist("");
    setNewUrl("");
    setErrorMessage("");
  };

  const handleDeleteTrack = (id: string) => {
    setPlaylist((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateTrack = (id: string, field: keyof BgmTrackItem, val: string) => {
    setPlaylist((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: val } : t))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    try {
      const res = await saveBgmPlaylist(playlist);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: unknown) {
      setErrorMessage(`Lỗi lưu danh sách: ${(err as Error)?.message || String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-[16px] bg-[#FAF5EE] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#F4DFAD] text-[#2B2623] border border-[#2B2623] text-[10px] font-mono font-bold uppercase mb-1">
            <Disc3 className="size-3 text-[#2B2623]" />
            <span>YOUTUBE STREAMING BGM</span>
          </div>
          <h2 className="font-serif text-lg font-bold text-[#2B2623] dark:text-[#FAF5EE]">
            Quản Lý Nhạc Nền Đọc Truyện (BGM)
          </h2>
          <p className="text-xs text-[#5C5146] dark:text-[#C4B9AD] mt-0.5">
            Thêm, sửa hoặc xóa các bài hát phát nền cho người đọc. Sử dụng link YouTube từ các kênh lofi, piano hoặc nhạc không lời miễn phí.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-[10px] text-xs h-9 px-4 bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-bold flex items-center gap-1.5 shrink-0"
        >
          {isSaving ? (
            <span>Đang lưu...</span>
          ) : saveSuccess ? (
            <>
              <Check className="size-4" />
              <span>Đã lưu thành công!</span>
            </>
          ) : (
            <>
              <Save className="size-4" />
              <span>Lưu Danh Sách BGM</span>
            </>
          )}
        </Button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-[12px] bg-[#BDCEAF] text-[#2B2623] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] text-xs font-bold flex items-center gap-2">
          <Check className="size-4 text-[#2B2623]" />
          <span>Danh sách nhạc nền YouTube đã được lưu thành công! Độc giả sẽ nghe được ngay.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-[12px] bg-red-100 text-red-900 border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] text-xs font-bold">
          {errorMessage}
        </div>
      )}

      {/* Add New YouTube Track Form */}
      <form
        onSubmit={handleAddTrack}
        className="p-5 rounded-[18px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] space-y-4"
      >
        <div className="flex items-center gap-2 pb-2 border-b-2 border-[#2B2623]/15">
          <YouTubeIcon className="size-4 text-red-600" />
          <h3 className="font-serif text-base font-bold text-[#2B2623] dark:text-[#FAF5EE]">
            Thêm Bài Hát Mới Từ YouTube
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD]">
              Tên bài hát / Giai điệu:
            </label>
            <Input
              placeholder="Ví dụ: Gymnopédie No. 1"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="rounded-[8px] border-2 border-[#2B2623] text-xs h-9 bg-card"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD]">
              Nghệ sĩ / Kênh YouTube:
            </label>
            <Input
              placeholder="Ví dụ: Erik Satie / Lofi Girl"
              value={newArtist}
              onChange={(e) => setNewArtist(e.target.value)}
              className="rounded-[8px] border-2 border-[#2B2623] text-xs h-9 bg-card"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD]">
              Link YouTube hoặc Video ID:
            </label>
            <Input
              placeholder="https://youtube.com/watch?v=..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="rounded-[8px] border-2 border-[#2B2623] text-xs h-9 bg-card"
              required
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            className="rounded-[10px] text-xs h-9 px-4 bg-[#BDCEAF] text-[#2B2623] hover:bg-[#AEC29F] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-bold flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            <span>Thêm vào danh sách phát</span>
          </Button>
        </div>
      </form>

      {/* Playlist List */}
      <div className="p-5 rounded-[18px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b-2 border-[#2B2623]/15">
          <div className="flex items-center gap-2">
            <Music className="size-4 text-[#E07B4C]" />
            <h3 className="font-serif text-base font-bold text-[#2B2623] dark:text-[#FAF5EE]">
              Danh Sách Bài Hát Hiện Tại ({playlist.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-[#5C5146] dark:text-[#C4B9AD]">
            Được lưu trong D1 Database
          </span>
        </div>

        <div className="space-y-3">
          {playlist.map((track, idx) => (
            <div
              key={track.id || idx}
              className="p-3.5 rounded-[12px] bg-[#FAF5EE] dark:bg-[#2A2420] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="size-7 rounded-[8px] bg-[#E2D8C0] dark:bg-[#3D352E] border border-[#2B2623] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                  <Input
                    value={track.title}
                    onChange={(e) => handleUpdateTrack(track.id, "title", e.target.value)}
                    placeholder="Tiêu đề bài hát"
                    className="rounded-[8px] border border-[#2B2623] text-xs h-8 bg-card font-bold"
                  />
                  <Input
                    value={track.artist}
                    onChange={(e) => handleUpdateTrack(track.id, "artist", e.target.value)}
                    placeholder="Nghệ sĩ / Kênh"
                    className="rounded-[8px] border border-[#2B2623] text-xs h-8 bg-card"
                  />
                  <Input
                    value={track.youtubeId}
                    onChange={(e) =>
                      handleUpdateTrack(
                        track.id,
                        "youtubeId",
                        extractYouTubeId(e.target.value)
                      )
                    }
                    placeholder="YouTube Video ID"
                    className="rounded-[8px] border border-[#2B2623] text-xs h-8 bg-card font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <a
                  href={`https://www.youtube.com/watch?v=${track.youtubeId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="size-8 rounded-[8px] bg-[#E5DDD2] dark:bg-[#3D352E] hover:bg-[#DBD1C4] border border-[#2B2623] flex items-center justify-center text-[#5C5146] dark:text-[#FAF5EE]"
                  title="Nghe thử trên YouTube"
                >
                  <ExternalLink className="size-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => handleDeleteTrack(track.id)}
                  className="size-8 rounded-[8px] bg-red-100 hover:bg-red-200 text-red-700 border border-[#2B2623] flex items-center justify-center cursor-pointer"
                  title="Xóa bài này"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
