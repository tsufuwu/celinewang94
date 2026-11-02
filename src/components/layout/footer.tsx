import Link from "next/link";
import { OrangeLogo } from "./orange-logo";
import { VISITOR_COUNT, CELINE_PROFILE } from "@/lib/data";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/60 bg-card/60 py-12 mt-20 text-muted-foreground text-sm transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        {/* Brand & Slogan */}
        <div className="flex flex-col gap-1.5 items-center md:items-start max-w-sm">
          <div className="flex items-center gap-2 text-foreground font-serif text-lg font-medium">
            <OrangeLogo className="size-5" />
            <span>Media naranja</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed italic font-serif">
            ars longa, vita brevis – nghệ thuật trường tồn, cuộc đời ngắn ngủi
          </p>
          <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 border border-orange-200/50 dark:border-orange-900/40 text-[11px] font-mono text-orange-800 dark:text-orange-300">
            <span>🍊 Nhiệt liệt chào mừng</span>
            <span className="font-semibold">{VISITOR_COUNT}</span>
            <span>quả cam tới chơi</span>
          </div>
        </div>

        {/* Links & Attribution */}
        <div className="flex flex-col items-center md:items-end gap-3 text-xs">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium">
            <Link href="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <Link href="/#kho-truyen" className="hover:text-primary transition-colors">
              Kho truyện
            </Link>
            <Link href="/tro-chuyen" className="hover:text-primary transition-colors">
              Góc trò chuyện
            </Link>
            <Link href="/gioi-thieu" className="hover:text-primary transition-colors">
              Giới thiệu (CV)
            </Link>
            <Link href="/admin" className="hover:text-primary transition-colors">
              Quản trị
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-muted-foreground/80">
            <a
              href={CELINE_PROFILE.socials.tiktok.url}
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors"
            >
              TikTok ({CELINE_PROFILE.socials.tiktok.handle})
            </a>
            <span>•</span>
            <a
              href={CELINE_PROFILE.socials.threads.url}
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors"
            >
              Threads ({CELINE_PROFILE.socials.threads.handle})
            </a>
            <span>•</span>
            <span>Giấy phép {CELINE_PROFILE.license}</span>
          </div>

          <p className="text-[11px] text-muted-foreground/60">
            © {new Date().getFullYear()} Celine Wang & Media naranja. Chúc bạn có những phút giây đọc truyện thật êm đềm ˶ˆ꒳ˆ˵
          </p>
        </div>
      </div>
    </footer>
  );
}
