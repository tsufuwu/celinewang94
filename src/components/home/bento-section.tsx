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
            <span>BENTO STREAM · DÒNG CHẢY MỚI</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#2B2623] dark:text-[#FAF5EE] font-bold tracking-tight">
            Cập Nhật &amp; Lời Nhắn Mới
          </h2>
        </div>
        <span className="text-xs text-[#5C5146] dark:text-[#C4B9AD] font-mono hidden sm:inline-block font-semibold">
          Dòng chảy Media naranja
        </span>
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

        {/* Right Column: Latest Sidebar Comments from WordPress (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#5C5146] dark:text-[#C4B9AD] flex items-center gap-1.5 font-bold">
              <MessageCircle className="size-3.5 text-[#E07B4C]" />
              Bình Luận Từ Các Quả Cam
            </span>
            <Link
              href="/tro-chuyen"
              className="text-[11px] text-[#E07B4C] hover:underline font-mono font-bold"
            >
              Góc trò chuyện →
            </Link>
          </div>

          <div className="flex flex-col gap-3.5">
            {RECENT_SIDEBAR_COMMENTS.map((c, idx) => (
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
            ))}

            {/* Quick Link to Guestbook */}
            <ScrollReveal animation="scale-up" delay={200}>
              <div className="p-4 rounded-[16px] bg-[#E5DDD2] dark:bg-[#2A2420] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] text-center">
                <p className="text-xs text-[#5C5146] dark:text-[#C4B9AD] mb-3 font-medium">
                  Bạn vừa đọc xong một chương truyện hay và muốn chia sẻ cảm xúc?
                </p>
                <Link
                  href="/tro-chuyen"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-[#E07B4C] text-white border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] text-xs font-bold hover:bg-[#DC7648] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none transition-all"
                >
                  <MessageCircle className="size-3.5" />
                  <span>Gửi lời nhắn tới Celine</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
