"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Layers, ArrowRight } from "lucide-react";
import type { StoryItem, StoryCategory } from "@/lib/data";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface StoryListProps {
  initialStories: StoryItem[];
}

const CATEGORIES: { label: string; value: "ALL" | StoryCategory }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Full", value: "Full" },
  { label: "Đang cook", value: "Đang cook" },
  { label: "Dịch", value: "Dịch" },
  { label: "Fanfic", value: "Fanfic" },
];

export function StoryList({ initialStories }: StoryListProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<"ALL" | StoryCategory>("ALL");

  const handleClearFilters = () => {
    setSelectedCategory("ALL");
  };

  // Filtered stories: category matches
  const filteredStories = React.useMemo(() => {
    if (selectedCategory === "ALL") return initialStories;
    return initialStories.filter((story) => story.category === selectedCategory);
  }, [initialStories, selectedCategory]);

  return (
    <section className="my-16" id="kho-truyen">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-8 border-b-2 border-[#2B2623]/20">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#BDCEAF] text-[#2B2623] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
            <Layers className="size-3 text-[#2B2623]" />
            <span>KỆ SÁCH CỦA CELINE</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#2B2623] dark:text-[#FAF5EE] font-bold tracking-tight">
            Thư Viện &amp; Tác Phẩm
          </h2>
        </div>

        {/* Story Count Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] bg-[#E5DDD2] dark:bg-[#3D352E] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] text-xs font-mono text-[#5C5146] dark:text-[#FAF5EE] font-bold self-start sm:self-auto">
          <span>Tìm thấy</span>
          <span className="text-[#E07B4C] font-extrabold">{filteredStories.length}</span>
          <span>bộ truyện</span>
        </div>
      </div>

      {/* Category Navigation Pills (Squircle: borderless, #E5DDD2 active, font-bold) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-5 py-2.5 rounded-[18px] text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-[#E5DDD2] text-[#5C5146] shadow-none"
                  : "bg-transparent text-[#5C5146]/70 hover:bg-[#E5DDD2]/50 hover:text-[#5C5146]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Story Grid */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-[20px] border-2 border-dashed border-[#2B2623]/30 bg-[#FDFBF7] dark:bg-[#241F1C]">
          <p className="font-serif text-lg font-bold text-[#2B2623] dark:text-[#FAF5EE] mb-1">
            Chưa có truyện nào trong danh mục này
          </p>
          <p className="text-xs text-[#5C5146] dark:text-[#C4B9AD] mb-4">
            Bấm nút bên dưới để quay lại xem tất cả truyện nhé.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 rounded-[12px] bg-[#E5DDD2] text-[#5C5146] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] text-xs font-bold"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story, idx) => {
            const storyDetailLink = `/truyen/${story.slug}`;
            const chapterCountLabel =
              typeof story._count?.chapters === "number" && story._count.chapters > 0
                ? `${story._count.chapters} chương`
                : story.status === "COMPLETED"
                ? "Trọn bộ"
                : "Đang cập nhật";

            return (
              <ScrollReveal key={story.id} animation="fly-up" delay={(idx % 6) * 70}>
                <div
                  className="group h-full flex flex-col justify-between rounded-[20px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] hover:translate-x-[0.5px] hover:translate-y-[1px] hover:shadow-[1.5px_3px_0px_#2B2623] active:translate-x-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-200 p-5 overflow-hidden"
                >
                <div>
                  {/* Top: Category & Chapter Count */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-[8px] bg-[#BDCEAF] text-[#2B2623] font-bold border border-[#2B2623]/40">
                      {story.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD]">
                      {chapterCountLabel}
                    </span>
                  </div>

                  {/* Middle: Cover & Details */}
                  <div className="flex gap-4 mb-4">
                    <Link
                      href={storyDetailLink}
                      className="block relative w-24 h-32 shrink-0 rounded-[12px] overflow-hidden bg-[#EFE8DE] dark:bg-[#1A1614] border border-[#2B2623]/40 shadow-xs group-hover:border-[#E07B4C] transition-colors"
                    >
                      {story.coverUrl ? (
                        <Image
                          src={story.coverUrl}
                          alt={story.title}
                          fill
                          sizes="96px"
                          unoptimized={story.coverUrl.startsWith("data:")}
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#5C5146]">
                          <BookOpen className="size-6" />
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-start">
                      <Link href={storyDetailLink}>
                        <h3 className="font-serif text-base sm:text-lg font-bold text-[#2B2623] dark:text-[#FAF5EE] group-hover:text-[#E07B4C] transition-colors line-clamp-2 mb-1">
                          {story.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-[#E07B4C] font-semibold mb-2">
                        {story.author}
                      </p>

                      <div className="flex flex-wrap gap-1 mt-auto">
                        {story.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-[6px] bg-[#E5DDD2] dark:bg-[#3D352E] text-[#5C5146] dark:text-[#FAF5EE] font-bold"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Synopsis Description */}
                  <p className="text-xs text-[#5C5146] dark:text-[#C4B9AD] leading-relaxed line-clamp-3 mb-4 font-sans">
                    {story.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-[#2B2623]/15 flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold text-[#5C5146] dark:text-[#C4B9AD]">
                    Cập nhật gần đây
                  </span>
                  <Link
                    href={storyDetailLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none text-xs font-bold transition-all"
                  >
                    <span>Mục lục &amp; Đọc</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
            );
          })}
        </div>
      )}
    </section>
  );
}
