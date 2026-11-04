import Link from "next/link";
import Image from "next/image";
import { Clock, MessageCircle, Lock, BookOpen, ArrowUpRight, Sparkles } from "lucide-react";
import type { RecentChapterItem } from "@/lib/data";
import { RECENT_SIDEBAR_COMMENTS } from "@/lib/data";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface BentoSectionProps {
  chapters: RecentChapterItem[];
}

export function BentoSection({ chapters }: BentoSectionProps) {
  return (
    <section className="my-16" id="moi-cap-nhat">
      <div className="flex items-end justify-between pb-4 mb-6 border-b-2 border-[#2B2623]/20">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#F4DFAD] text-[#2B2623] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
            <Sparkles className="size-3 text-[#2B2623]" />
            <span>CẬP NHẬT MỚI</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#2B2623] dark:text-[#FAF5EE] font-bold tracking-tight">
            Chương Mới &amp; Thảo Luận
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Chapters (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#5C5146] dark:text-[#C4B9AD] flex items-center gap-1.5 font-bold">
              <Clock className="size-3.5 text-[#E07B4C]" />
              Chương Mới Lên Kệ ({chapters.length})
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {chapters.slice(0, 5).map((chapter, idx) => (
              <ScrollReveal key={chapter.id} animation="fly-left" delay={idx * 70}>
                <Link
                  href={`/chuong/${chapter.id}`}
                  className="group flex items-center gap-3.5 p-3.5 rounded-[16px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] hover:translate-x-[0.5px] hover:translate-y-[1px] hover:shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[2px] active:translate-y-[3px] active:shadow-none transition-all duration-200"
                >
                  {/* Thumbnail */}
                  <div className="relative w-14 h-16 shrink-0 rounded-[10px] overflow-hidden bg-[#EFE8DE] dark:bg-[#1A1614] border border-[#2B2623]/30">
                    {chapter.story.coverUrl ? (
                      <Image
                        src={chapter.story.coverUrl}
                        alt={chapter.story.title}
                        fill
                        sizes="56px"
                        unoptimized={chapter.story.coverUrl.startsWith("data:")}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#5C5146]">
                        <BookOpen className="size-4" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[6px] bg-[#BDCEAF] text-[#2B2623] border border-[#2B2623]/40 shrink-0">
                          {chapter.story.category || "Full"}
                        </span>
                        <span className="text-xs text-[#5C5146] dark:text-[#C4B9AD] truncate font-medium">
                          {chapter.story.title}
                        </span>
                        {chapter.password && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-[6px] bg-[#EBBAB5] text-[#2B2623] border border-[#2B2623]/40 font-bold">
                            <Lock className="size-2.5 text-[#2B2623]" /> Có Pass
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-sm font-bold text-[#2B2623] dark:text-[#FAF5EE] group-hover:text-[#E07B4C] transition-colors truncate">
                        {chapter.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#5C5146] dark:text-[#C4B9AD] font-mono mt-1">
                      <span>{chapter.wordCount.toLocaleString("vi-VN")} chữ</span>
                      <span>•</span>
                      <span>{new Date(chapter.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>

                  <div className="text-[#5C5146] group-hover:text-[#E07B4C] transition-colors pl-2">
                    <ArrowUpRight className="size-4" />
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Right Column: Latest Sidebar Comments (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#5C5146] dark:text-[#C4B9AD] flex items-center gap-1.5 font-bold">
              <MessageCircle className="size-3.5 text-[#E07B4C]" />
              Bình luận
            </span>
          </div>

          <div className="flex flex-col gap-3.5">
            {RECENT_SIDEBAR_COMMENTS.length > 0 ? (
              RECENT_SIDEBAR_COMMENTS.map((c, idx) => (
                <ScrollReveal key={c.id} animation="fly-right" delay={idx * 70}>
                  <Link
                    href={`/chuong/${c.chapterId}`}
                    className="p-3.5 rounded-[16px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] hover:translate-x-[0.5px] hover:translate-y-[1px] hover:shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[2px] active:translate-y-[3px] active:shadow-none transition-all duration-200 block group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-[#2B2623] dark:text-[#FAF5EE] flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-[#E07B4C]" />
                        {c.author}
                      </span>
                      <span className="text-[10px] font-mono text-[#5C5146] dark:text-[#C4B9AD]">
                        {c.timeAgo}
                      </span>
                    </div>
                    <p className="text-xs text-[#5C5146] dark:text-[#C4B9AD] leading-relaxed line-clamp-2 italic mb-2">
                      &ldquo;{c.content}&rdquo;
                    </p>
                    <div className="text-[10px] text-[#E07B4C] font-mono truncate group-hover:underline transition-colors flex items-center gap-1 font-semibold">
                      <span>Tại:</span>
                      <span className="underline decoration-dotted">{c.targetChapter}</span>
                    </div>
                  </Link>
                </ScrollReveal>
              ))
            ) : (
              <div className="p-4 rounded-[16px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] text-center">
                <p className="text-xs font-serif italic text-[#5C5146] dark:text-[#C4B9AD]">
                  Chưa có bình luận mới
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
