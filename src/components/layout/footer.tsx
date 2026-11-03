import Link from "next/link";
import { OrangeLogo } from "./orange-logo";
import { CELINE_PROFILE } from "@/lib/data";

export function Footer() {
  return (
    <footer className="w-full border-t-2 border-[#2B2623]/20 bg-[#FAF5EE] dark:bg-[#1A1614] py-12 mt-20 text-[#5C5146] dark:text-[#C4B9AD] text-sm transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        {/* Brand & Slogan */}
        <div className="flex flex-col gap-1.5 items-center md:items-start max-w-sm">
          <div className="flex items-center gap-2 text-[#2B2623] dark:text-[#FAF5EE] font-serif text-lg font-bold">
            <OrangeLogo className="size-5" />
            <span>Media naranja</span>
          </div>
          <p className="text-xs text-[#5C5146] dark:text-[#C4B9AD] leading-relaxed italic font-serif">
            ars longa, vita brevis – nghệ thuật trường tồn, cuộc đời ngắn ngủi
          </p>
        </div>

        {/* Links & Attribution */}
        <div className="flex flex-col items-center md:items-end gap-3 text-xs">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-bold">
            <Link href="/" className="hover:text-[#E07B4C] transition-colors">
              Trang chủ
            </Link>
            <Link href="/kho-truyen" className="hover:text-[#E07B4C] transition-colors">
              Thư viện
            </Link>
            <Link href="/tro-chuyen" className="hover:text-[#E07B4C] transition-colors">
              Góc trò chuyện
            </Link>
            <Link href="/admin" className="hover:text-[#E07B4C] transition-colors">
              Quản trị
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[#5C5146]/80 dark:text-[#C4B9AD]/80">
            <a
              href={CELINE_PROFILE.socials.tiktok.url}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#E07B4C] transition-colors"
            >
              TikTok ({CELINE_PROFILE.socials.tiktok.handle})
            </a>
            <span>•</span>
            <a
              href={CELINE_PROFILE.socials.threads.url}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#E07B4C] transition-colors"
            >
              Threads ({CELINE_PROFILE.socials.threads.handle})
            </a>
            <span>•</span>
            <span>Giấy phép {CELINE_PROFILE.license}</span>
          </div>

          <p className="text-[11px] text-[#5C5146]/60 dark:text-[#C4B9AD]/60">
            © {new Date().getFullYear()} Celine Wang &amp; Media naranja.
          </p>
        </div>
      </div>
    </footer>
  );
}
