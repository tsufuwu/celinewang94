import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 py-16 animate-page-enter">
      <div className="relative mb-6">
        {/* Animated Retro Orange / Coffee Pulse */}
        <div className="size-14 rounded-full bg-[#E07B4C]/15 border-2 border-[#E07B4C] flex items-center justify-center animate-bounce shadow-[2px_3px_0px_#2B2623]">
          <span className="text-2xl select-none">🍊</span>
        </div>
        <Sparkles className="size-4 text-[#E07B4C] absolute -top-1 -right-1 animate-ping" />
      </div>

      <p className="font-serif text-sm sm:text-base font-bold text-[#2B2623] dark:text-[#FAF5EE] tracking-wide mb-1">
        Đang lật trang sách...
      </p>
      <p className="font-mono text-xs text-[#5C5146] dark:text-[#C4B9AD]">
        ars longa, vita brevis
      </p>
    </div>
  );
}

