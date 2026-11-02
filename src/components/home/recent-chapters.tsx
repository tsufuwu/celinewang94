import Link from "next/link";
import Image from "next/image";
import { Clock, BookOpen, ArrowUpRight } from "lucide-react";
import type { RecentChapterItem } from "@/lib/data";

interface RecentChaptersProps {
  chapters: RecentChapterItem[];
}

export function RecentChapters({ chapters }: RecentChaptersProps) {
  if (!chapters || chapters.length === 0) return null;

  return (
    <section className="my-14" id="moi-cap-nhat">
      <div className="flex items-end justify-between pb-4 mb-6 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
            <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
            <span>Dòng Thời Gian</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-foreground font-medium tracking-tight">
            Chương Mới Cập Nhật
          </h2>
        </div>
        <span className="text-xs text-muted-foreground font-mono hidden sm:inline-block">
          Cập nhật tức thời
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chapters.map((chapter) => {
          return (
            <Link
              key={chapter.id}
              href={`/chuong/${chapter.id}`}
              className="group flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl bg-card border border-border/70 hover:border-border hover:shadow-md transition-all duration-200"
            >
              {/* Small Story Thumbnail */}
              <div className="relative w-16 h-20 shrink-0 rounded-xl overflow-hidden bg-muted border border-border/60 shadow-xs">
                {chapter.story.coverUrl ? (
                  <Image
                    src={chapter.story.coverUrl}
                    alt={chapter.story.title}
                    fill
                    sizes="64px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <BookOpen className="size-5" />
                  </div>
                )}
              </div>

              {/* Chapter & Story Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-secondary text-foreground/80 font-medium shrink-0">
                      Chương {chapter.chapterNumber}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono truncate">
                      {new Date(chapter.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {chapter.title}
                  </h3>

                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    Truyện: <span className="text-foreground/85 font-medium">{chapter.story.title}</span> • {chapter.story.author}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5">
                  <span className="font-mono">
                    {chapter.wordCount.toLocaleString("vi-VN")} chữ
                  </span>
                  <span className="text-foreground/80 font-medium flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    Đọc chương <ArrowUpRight className="size-3" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

