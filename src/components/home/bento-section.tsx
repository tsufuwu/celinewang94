import Link from "next/link";
import Image from "next/image";
import { Clock, MessageCircle, Lock, BookOpen, ArrowUpRight, Sparkles } from "lucide-react";
import type { RecentChapterItem } from "@/lib/data";
import { RECENT_SIDEBAR_COMMENTS } from "@/lib/data";

interface BentoSectionProps {
  chapters: RecentChapterItem[];
}

export function BentoSection({ chapters }: BentoSectionProps) {
  return (
    <section className="my-16" id="moi-cap-nhat">
      <div className="flex items-end justify-between pb-4 mb-6 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-orange-700 dark:text-orange-400 mb-1">
            <Sparkles className="size-3.5" />
            <span>Bento Stream</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-foreground font-semibold tracking-tight">
            Cập Nhật & Lời Nhắn Mới
          </h2>
        </div>
        <span className="text-xs text-muted-foreground font-mono hidden sm:inline-block">
          Dòng chảy Media naranja
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Chapters (8 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-medium">
              <Clock className="size-3.5 text-primary" />
              Chương Mới Lên Kệ ({chapters.length})
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {chapters.slice(0, 5).map((chapter) => (
              <Link
                key={chapter.id}
                href={`/chuong/${chapter.id}`}
                className="group flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-card border border-border/70 hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                {/* Thumbnail */}
                <div className="relative w-14 h-16 shrink-0 rounded-xl overflow-hidden bg-muted border border-border/60 shadow-xs">
                  {chapter.story.coverUrl ? (
                    <Image
                      src={chapter.story.coverUrl}
                      alt={chapter.story.title}
                      fill
                      sizes="56px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <BookOpen className="size-4" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary text-primary font-medium shrink-0">
                        {chapter.story.category || "Full"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {chapter.story.title}
                      </span>
                      {chapter.password && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">
                          <Lock className="size-2.5" /> Có Pass
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {chapter.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono mt-1">
                    <span>{chapter.wordCount.toLocaleString()} chữ</span>
                    <span>•</span>
                    <span>{new Date(chapter.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>

                <div className="text-muted-foreground group-hover:text-primary transition-colors pl-2">
                  <ArrowUpRight className="size-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Latest Sidebar Comments from WordPress (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-medium">
              <MessageCircle className="size-3.5 text-primary" />
              Bình Luận Từ Các Quả Cam
            </span>
            <Link
              href="/tro-chuyen"
              className="text-[11px] text-primary hover:underline font-mono"
            >
              Góc trò chuyện →
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {RECENT_SIDEBAR_COMMENTS.map((c) => (
              <Link
                key={c.id}
                href={`/chuong/${c.chapterId}`}
                className="p-3.5 rounded-2xl bg-card border border-border/70 hover:border-primary/40 hover:shadow-xs transition-all duration-200 block group"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-orange-500" />
                    {c.author}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {c.timeAgo}
                  </span>
                </div>
                <p className="text-xs text-foreground/85 leading-relaxed line-clamp-2 italic mb-2">
                  &ldquo;{c.content}&rdquo;
                </p>
                <div className="text-[10px] text-primary/80 font-mono truncate group-hover:text-primary transition-colors flex items-center gap-1">
                  <span>Tại:</span>
                  <span className="underline decoration-dotted">{c.targetChapter}</span>
                </div>
              </Link>
            ))}

            {/* Quick Link to Guestbook */}
            <div className="p-4 rounded-2xl bg-secondary/60 border border-orange-200/50 dark:border-orange-950/40 text-center">
              <p className="text-xs text-foreground/80 mb-2">
                Bạn vừa đọc xong một chương truyện hay và muốn chia sẻ cảm xúc?
              </p>
              <Link
                href="/tro-chuyen"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow-xs"
              >
                <MessageCircle className="size-3.5" />
                <span>Gửi lời nhắn tới Celine</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

