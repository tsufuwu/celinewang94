"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Disc3, Eye, EyeOff, ChevronDown, ChevronRight, Music, Film, BookOpen } from "lucide-react";
import { AntiCopyShield } from "@/components/reader/anti-copy-shield";

export interface StoryChapterItem {
  id: string;
  chapterNumber: number;
  title: string;
  password?: string | null;
}

interface StoryHtmlRendererProps {
  content: string;
  customCss?: string | null;
  chapters?: StoryChapterItem[];
  storySlug?: string;
}

// ----------------------------------------------------
// 1. Interactive Sub-Components for Shortcodes
// ----------------------------------------------------

/** Reel Grid Mục Lục: Lưới nút số chương kiểu cuộn phim 35mm */
function ShortcodeMuclucGrid({
  from = 1,
  to = 48,
  title = "🎞️ REEL: DANH SÁCH CHƯƠNG",
  chapters = [],
}: {
  from?: number;
  to?: number;
  title?: string;
  chapters?: StoryChapterItem[];
}) {
  const chapterMap = React.useMemo(() => {
    const map = new Map<number, StoryChapterItem>();
    chapters.forEach((ch) => map.set(ch.chapterNumber, ch));
    return map;
  }, [chapters]);

  const items: number[] = [];
  for (let i = from; i <= to; i++) {
    items.push(i);
  }

  return (
    <div className="my-6 rounded-xl border border-[#6d675e]/80 overflow-hidden bg-[#eee9e1] dark:bg-[#1f1b18] text-[#3d3935] dark:text-[#eee9e1] shadow-md font-serif">
      {/* Film Strip Header Pattern */}
      <div className="h-6 bg-[#5a554d] bg-[radial-gradient(circle,#eee9e1_3px,transparent_3.5px)] bg-[size:22px_24px] border-b-2 border-[#3d3935]" />
      
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#6d675e]/30 font-mono text-xs text-[#6d675e] dark:text-[#c4bcaf] uppercase tracking-wider">
          <span className="flex items-center gap-1.5 font-bold">
            <Film className="size-3.5" />
            {title}
          </span>
          <span>CHƯƠNG {from} – {to}</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 text-center font-mono">
          {items.map((num) => {
            const ch = chapterMap.get(num);
            const numStr = num < 10 ? `0${num}` : `${num}`;
            const isAvailable = !!ch;
            const hasPass = !!ch?.password;

            if (isAvailable && ch) {
              return (
                <Link
                  key={num}
                  href={`/chuong/${ch.id}`}
                  title={`${ch.title}${hasPass ? " (Có mật khẩu bảo vệ)" : ""}`}
                  className="group relative flex flex-col items-center justify-center p-2 rounded-lg bg-[#f7f3ed] dark:bg-[#2c2622] border border-[#a8a092] hover:border-orange-500 hover:bg-orange-500/10 dark:hover:bg-orange-500/20 transition-all shadow-xs"
                >
                  <span className="text-xs font-bold text-[#3d3935] dark:text-[#eee9e1] group-hover:text-orange-600 dark:group-hover:text-orange-400">
                    {numStr}
                  </span>
                  {hasPass && (
                    <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[8px] shadow-xs">
                      <Lock className="size-2" />
                    </span>
                  )}
                </Link>
              );
            }

            return (
              <div
                key={num}
                title={`Chương ${num} đang được cập nhật`}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#e2ddd5]/60 dark:bg-[#26211e]/50 border border-dashed border-[#b8b0a2]/50 text-muted-foreground/60 cursor-not-allowed select-none"
              >
                <span className="text-xs">{numStr}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Extra Scenes Mục Lục: Danh sách ngoại truyện */
function ShortcodeMuclucExtra({
  title = "🎞️ EXTRA SCENES: NGOẠI TRUYỆN & ĐẶC BIỆT",
  chapters = [],
}: {
  title?: string;
  chapters?: StoryChapterItem[];
}) {
  // Extra chapters: numbers > 50 or titles having EG/Ngoại truyện/Phiên ngoại
  const extraChapters = chapters.filter(
    (c) => c.chapterNumber > 50 || /extra|ngoại|phiên|eg|weibo/i.test(c.title)
  );

  return (
    <div className="my-6 rounded-xl border border-[#6d675e]/80 overflow-hidden bg-[#eee9e1] dark:bg-[#1f1b18] text-[#3d3935] dark:text-[#eee9e1] shadow-md font-serif">
      <div className="p-4 sm:p-6">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#6d675e] dark:text-[#c4bcaf] pb-2 border-b border-[#6d675e]/30 mb-3 flex items-center gap-1.5">
          <BookOpen className="size-3.5 text-primary" />
          {title}
        </h3>

        {extraChapters.length > 0 ? (
          <div className="divide-y divide-[#6d675e]/20">
            {extraChapters.map((ch) => (
              <Link
                key={ch.id}
                href={`/chuong/${ch.id}`}
                className="py-2.5 px-2 flex items-center justify-between hover:bg-orange-500/10 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#f7f3ed] dark:bg-[#2c2622] border border-[#a8a092]">
                    #{ch.chapterNumber}
                  </span>
                  <span className="group-hover:text-orange-600 dark:group-hover:text-orange-400">
                    {ch.title}
                  </span>
                </div>
                {ch.password && (
                  <span className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1 font-mono">
                    <Lock className="size-3" /> Pass
                  </span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic py-2">
            Chưa có chương ngoại truyện nào được tải lên.
          </p>
        )}
      </div>
    </div>
  );
}

/** Mini BGM Cassette / Spotify Player */
function ShortcodeBgm({ src, title = "Background Music Playlist" }: { src: string; title?: string }) {
  const isSpotify = src.includes("spotify.com");
  const isEmbed = src.includes("/embed/");

  if (isSpotify) {
    const embedUrl = isEmbed
      ? src
      : src.replace("open.spotify.com/", "open.spotify.com/embed/");

    return (
      <div className="my-6 rounded-xl border border-[#6d675e]/80 overflow-hidden bg-[#eee9e1] dark:bg-[#1f1b18] p-3 shadow-md">
        <div className="flex items-center gap-2 mb-2 px-1 text-xs font-mono text-[#6d675e] dark:text-[#c4bcaf] font-bold uppercase">
          <Disc3 className="size-3.5 animate-spin text-orange-500" />
          <span>{title}</span>
        </div>
        <iframe
          src={embedUrl}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-lg shadow-inner"
        />
      </div>
    );
  }

  return (
    <div className="my-6 p-4 rounded-xl border border-[#6d675e]/80 bg-[#eee9e1] dark:bg-[#1f1b18] text-[#3d3935] dark:text-[#eee9e1] shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-[#5a554d] text-white flex items-center justify-center shrink-0 shadow-xs">
          <Music className="size-5" />
        </div>
        <div>
          <h4 className="font-serif text-sm font-bold text-foreground">{title}</h4>
          <span className="font-mono text-[11px] text-muted-foreground">Original Soundtrack / BGM</span>
        </div>
      </div>
      <audio controls src={src} className="h-8 w-full sm:w-64" preload="none">
        Trình duyệt của bạn không hỗ trợ thẻ audio.
      </audio>
    </div>
  );
}

/** Spoiler Box (Làm mờ hoặc Accordion) */
function ShortcodeSpoiler({
  title = "CẢNH BÁO / DÒ MÌN",
  mode = "accordion",
  children,
}: {
  title?: string;
  mode?: "accordion" | "blur";
  children: React.ReactNode;
}) {
  const [revealed, setRevealed] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  if (mode === "blur") {
    return (
      <div
        onClick={() => setRevealed((prev) => !prev)}
        className="my-4 p-3 rounded-xl border border-orange-500/30 bg-orange-500/5 cursor-pointer select-text transition-all"
        title="Bấm để ẩn / hiện nội dung"
      >
        <div className="flex items-center justify-between mb-1 text-xs font-mono text-orange-600 dark:text-orange-400 font-bold">
          <span className="flex items-center gap-1.5">
            {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            {title}
          </span>
          <span className="text-[10px] font-normal italic">
            {revealed ? "(Bấm để làm mờ lại)" : "(Bấm để đọc)"}
          </span>
        </div>
        <div
          className={`text-sm leading-relaxed transition-all duration-300 ${
            revealed ? "filter-none select-text" : "filter blur-sm select-none"
          }`}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="my-4 rounded-xl border border-dashed border-[#a8a092] bg-[#f7f3ed] dark:bg-[#1f1b18] overflow-hidden text-sm">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-3 sm:px-4 flex items-center justify-between text-left font-serif font-bold text-[#3d3935] dark:text-[#eee9e1] hover:bg-orange-500/5 transition-colors"
      >
        <span className="flex items-center gap-2">
          {isOpen ? <ChevronDown className="size-4 text-orange-600" /> : <ChevronRight className="size-4 text-orange-600" />}
          {title}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground uppercase font-normal">
          {isOpen ? "Đóng" : "Mở xem"}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 pt-1 border-t border-dashed border-[#a8a092]/60 text-foreground/90 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 2. Main StoryHtmlRenderer Component
// ----------------------------------------------------

export function StoryHtmlRenderer({
  content,
  customCss,
  chapters = [],
  storySlug,
}: StoryHtmlRendererProps) {
  const router = useRouter();

  const handleContainerClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href) return;

      // 1. Smooth scroll for in-page anchors (e.g. #thu-1, #thu-2, #muc-luc)
      if (href.startsWith("#") && href.length > 1) {
        const id = href.slice(1);
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }

      // 2. If internal app link, let Next router handle it smoothly
      if (href.startsWith("/chuong/") || href.startsWith("/truyen/") || href === "/" || href.startsWith("/kho-truyen")) {
        e.preventDefault();
        router.push(href);
        return;
      }

      // 3. Intercept any residual WordPress link to avoid leaving the app
      if (href.includes("celinewang94.wordpress.com")) {
        e.preventDefault();
        try {
          const url = new URL(href);
          const parts = url.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
          const lastPart = parts[parts.length - 1] || "";

          if (lastPart.includes("om-lay-trong-luc")) {
            router.push("/truyen/om-lay-trong-luc");
            return;
          }
          if (lastPart.includes("sternstunde")) {
            router.push("/truyen/sternstunde");
            return;
          }
          if (lastPart.includes("de-profundis")) {
            router.push("/truyen/de-profundis");
            return;
          }
          if (lastPart.includes("mat-bao")) {
            router.push("/truyen/mat-bao");
            return;
          }
          if (lastPart.includes("gio-tin-phong")) {
            router.push("/truyen/gio-tin-phong-thoi-ve-phia-bien");
            return;
          }
          if (lastPart.includes("bay-buc-thu")) {
            router.push("/truyen/bay-buc-thu-duoc-gui-den-sau-cai-chet-cua-ke-hoang-tuong");
            return;
          }

          // Match chapter numbers from URL (e.g., chuong-1, chuong-10, eg-chuong-44)
          const numMatch = lastPart.match(/chuong-(\d+)/);
          if (numMatch && chapters && chapters.length > 0) {
            const num = parseInt(numMatch[1], 10);
            const ch = chapters.find((c) => c.chapterNumber === num);
            if (ch) {
              router.push(`/chuong/${ch.id}`);
              return;
            }
          }

          router.push(storySlug ? `/truyen/${storySlug}` : "/kho-truyen");
        } catch {
          router.push("/kho-truyen");
        }
      }
    },
    [router, chapters, storySlug]
  );

  // Process the content: split by shortcodes and render corresponding React blocks
  const renderContent = React.useMemo(() => {
    if (!content) return null;

    // Regex to match our smart shortcodes:
    // 1. [muc_luc style="grid" from="1" to="48" title="..."]
    // 2. [muc_luc style="list" type="extra" title="..."]
    // 3. [bgm src="..." title="..."]
    // 4. [spoiler title="..." mode="..."]...[/spoiler]
    const shortcodeRegex =
      /(\[muc_luc[^\]]*\]|\[bgm[^\]]*\]|\[spoiler[^\]]*\][\s\S]*?\[\/spoiler\])/gi;

    const parts = content.split(shortcodeRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      // 1. [muc_luc ...]
      if (/^\[muc_luc/i.test(part)) {
        const styleMatch = part.match(/style=["']?([^"'\s\]]+)["']?/i);
        const fromMatch = part.match(/from=["']?(\d+)["']?/i);
        const toMatch = part.match(/to=["']?(\d+)["']?/i);
        const titleMatch = part.match(/title=["']?([^"'\]]+)["']?/i);

        const style = styleMatch ? styleMatch[1] : "grid";
        const from = fromMatch ? parseInt(fromMatch[1], 10) : 1;
        const to = toMatch ? parseInt(toMatch[1], 10) : 48;
        const title = titleMatch ? titleMatch[1] : undefined;

        if (style === "list" || part.includes("extra")) {
          return (
            <ShortcodeMuclucExtra
              key={index}
              title={title}
              chapters={chapters}
            />
          );
        }

        return (
          <ShortcodeMuclucGrid
            key={index}
            from={from}
            to={to}
            title={title}
            chapters={chapters}
          />
        );
      }

      // 2. [bgm ...]
      if (/^\[bgm/i.test(part)) {
        const srcMatch = part.match(/src=["']?([^"'\s\]]+)["']?/i);
        const titleMatch = part.match(/title=["']?([^"'\]]+)["']?/i);
        const src = srcMatch ? srcMatch[1] : "";
        const title = titleMatch ? titleMatch[1] : undefined;

        if (!src) return null;
        return <ShortcodeBgm key={index} src={src} title={title} />;
      }

      // 3. [spoiler ...]...[/spoiler]
      if (/^\[spoiler/i.test(part)) {
        const titleMatch = part.match(/title=["']?([^"'\]]+)["']?/i);
        const modeMatch = part.match(/mode=["']?([^"'\s\]]+)["']?/i);
        const contentMatch = part.match(/\[spoiler[^\]]*\]([\s\S]*?)\[\/spoiler\]/i);

        const title = titleMatch ? titleMatch[1] : "Cảnh Báo / Dò Mìn";
        const mode = (modeMatch ? modeMatch[1] : "accordion") as "accordion" | "blur";
        const innerText = contentMatch ? contentMatch[1] : "";

        return (
          <ShortcodeSpoiler key={index} title={title} mode={mode}>
            <div dangerouslySetInnerHTML={{ __html: innerText }} />
          </ShortcodeSpoiler>
        );
      }

      // Standard HTML fragment from author or WordPress
      return (
        <div
          key={index}
          className="story-raw-html-section"
          dangerouslySetInnerHTML={{ __html: part }}
        />
      );
    });
  }, [content, chapters]);

  return (
    <AntiCopyShield>
      <div
        className="story-custom-article-wrapper w-full max-w-4xl mx-auto py-4"
        onClick={handleContainerClick}
      >
        {/* Scoped CSS if author specified custom styles */}
        {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}

        {/* Global safety styles for custom HTML to prevent overflow or breaking layout */}
        <style>{`
          .story-custom-article-wrapper img {
            max-width: 100% !important;
            height: auto !important;
            display: block;
            margin-left: auto;
            margin-right: auto;
          }
          .story-custom-article-wrapper iframe {
            max-width: 100% !important;
          }
          .story-custom-article-wrapper a {
            color: inherit;
            text-decoration: underline;
            text-decoration-color: rgba(249, 115, 22, 0.4);
            text-underline-offset: 3px;
            transition: all 0.2s ease;
          }
          .story-custom-article-wrapper a:hover {
            color: #ea580c;
            text-decoration-color: #ea580c;
          }
          .story-custom-article-wrapper details summary {
            cursor: pointer;
            user-select: none;
          }
          .story-custom-article-wrapper pre,
          .story-custom-article-wrapper code {
            max-width: 100%;
            overflow-x: auto;
          }
        `}</style>

        {/* Rendered HTML & Shortcode Blocks */}
        <div className="space-y-4">{renderContent}</div>
      </div>
    </AntiCopyShield>
  );
}
