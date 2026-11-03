"use client";

import * as React from "react";
import { Disc3, Save, Check, ExternalLink, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveBgmPlaylistSetting } from "@/app/admin/actions";
import { extractPlaylistId } from "@/lib/data";

function YouTubeIcon({ className = "size-4 text-red-600" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface BgmManagerProps {
  initialPlaylistSetting?: {
    playlistId: string;
    playlistUrl: string;
  };
}

export function BgmManager({
  initialPlaylistSetting = {
    playlistId: "PLWsWIKUX9PRq7aPRAwjjwDid_e0_K2P3Y",
    playlistUrl: "https://www.youtube.com/playlist?list=PLWsWIKUX9PRq7aPRAwjjwDid_e0_K2P3Y",
  },
}: BgmManagerProps) {
  const [playlistInput, setPlaylistInput] = React.useState(
    initialPlaylistSetting.playlistUrl || initialPlaylistSetting.playlistId
  );
  const [activePlaylistId, setActivePlaylistId] = React.useState(
    initialPlaylistSetting.playlistId
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    const extracted = extractPlaylistId(playlistInput);
    if (!extracted) {
      setErrorMessage("Liên kết Playlist không hợp lệ. Vui lòng dán link dạng: https://www.youtube.com/playlist?list=...");
      setIsSaving(false);
      return;
    }

    try {
      const res = await saveBgmPlaylistSetting(playlistInput);
      if (res.success && res.playlistId) {
        setActivePlaylistId(res.playlistId);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: unknown) {
      setErrorMessage(`Lỗi lưu playlist: ${(err as Error)?.message || String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefault = () => {
    const defaultUrl = "https://www.youtube.com/playlist?list=PLWsWIKUX9PRq7aPRAwjjwDid_e0_K2P3Y";
    setPlaylistInput(defaultUrl);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Top Header Card */}
      <div className="p-6 rounded-[20px] bg-[#FAF5EE] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[3px_4px_0px_#2B2623]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b-2 border-[#2B2623]/20">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#BDCEAF] text-[#2B2623] border border-[#2B2623] text-[10px] font-mono font-bold uppercase mb-1.5">
              <Lock className="size-3 text-[#2B2623]" />
              <span>KHÓA CỨNG BGM CHO TOÀN BỘ ĐỘC GIẢ</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B2623] dark:text-[#FAF5EE]">
              Quản Lý Playlist Nhạc Nền (BGM)
            </h2>
            <p className="text-xs text-[#5C5146] dark:text-[#C4B9AD] mt-1">
              Chỉ Quản trị viên mới có quyền cập nhật. Độc giả trên website sẽ tự động nghe playlist này mà không thể dán link ngoài.
            </p>
          </div>

          <div className="p-3 rounded-[12px] bg-[#E5DDD2] dark:bg-[#332A24] border border-[#2B2623] flex items-center gap-2 self-start sm:self-auto">
            <Disc3 className="size-6 text-[#E07B4C] animate-spin [animation-duration:6s]" />
            <div>
              <span className="text-[10px] font-mono uppercase text-[#5C5146] dark:text-[#C4B9AD] block font-bold">
                Playlist Hiện Tại
              </span>
              <span className="text-xs font-mono font-bold text-[#E07B4C]">
                {activePlaylistId}
              </span>
            </div>
          </div>
        </div>

        {/* Current Active Playlist Info */}
        <div className="p-4 rounded-[14px] bg-[#FDFBF7] dark:bg-[#1A1614] border-2 border-[#2B2623] shadow-[2px_2px_0px_#2B2623] mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#2B2623] dark:text-[#FAF5EE] flex items-center gap-1.5">
              <YouTubeIcon className="size-4" />
              <span>Playlist YouTube Đang Phát Chính Thức:</span>
            </span>
            <a
              href={`https://www.youtube.com/playlist?list=${activePlaylistId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#E07B4C] hover:underline"
            >
              <span>Xem trên YouTube</span>
              <ExternalLink className="size-3" />
            </a>
          </div>

          <div className="p-3 rounded-[10px] bg-[#E5DDD2]/50 dark:bg-[#2A2420] text-xs font-mono text-[#5C5146] dark:text-[#C4B9AD] break-all border border-[#2B2623]/20">
            https://www.youtube.com/playlist?list={activePlaylistId}
          </div>
        </div>

        {/* Form to update playlist */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-[#5C5146] dark:text-[#C4B9AD] mb-1.5">
              Nhập liên kết Playlist YouTube mới:
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={playlistInput}
                onChange={(e) => {
                  setPlaylistInput(e.target.value);
                  setErrorMessage("");
                }}
                placeholder="https://www.youtube.com/playlist?list=PL..."
                className="h-11 rounded-[12px] bg-[#FDFBF7] dark:bg-[#1A1614] border-2 border-[#2B2623] text-xs font-mono shadow-[2px_2px_0px_#2B2623]"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleResetDefault}
                className="h-11 px-3 rounded-[12px] border-2 border-[#2B2623] text-xs font-bold hover:bg-[#E5DDD2] shrink-0"
                title="Đặt lại playlist mặc định"
              >
                <RefreshCw className="size-3.5 mr-1" />
                Mặc định
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              💡 Bạn có thể dán toàn bộ đường link playlist hoặc chỉ cần dán mã Playlist ID (bắt đầu bằng PL...).
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-[10px] bg-red-100 dark:bg-red-950/60 border border-red-400 text-red-700 dark:text-red-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-[10px] bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-400 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <Check className="size-4" />
              <span>Đã lưu thành công! Playlist BGM đã được khóa cứng trên toàn bộ website.</span>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="h-11 px-6 rounded-[12px] bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none text-xs font-bold cursor-pointer"
            >
              <Save className="size-4 mr-1.5" />
              {isSaving ? "Đang lưu cấu hình..." : "Lưu Cài Đặt Playlist BGM"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
