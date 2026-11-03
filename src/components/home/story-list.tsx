"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, BookOpen, Layers, Check, Filter, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { StoryItem, StoryCategory } from "@/lib/data";

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
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

  // Collect unique tags
  const allTags = React.useMemo(() => {
    const tagsSet = new Set<string>();
    initialStories.forEach((s) => s.tags.forEach((t) => tagsSet.add(t)));
    return Array.from(tagsSet).sort();
  }, [initialStories]);

  // Toggle tag selection
  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategory("ALL");
    setSearchQuery("");
    setSelectedTags([]);
  };

  // Filtered stories: category matches AND search matches AND all selected tags match
  const filteredStories = React.useMemo(() => {
    return initialStories.filter((story) => {
      // Category filter
      if (selectedCategory !== "ALL" && story.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      const matchesSearch =
        searchQuery.trim() === "" ||
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.author.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Multi-tag filter (AND condition: story must include all selected tags)
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every((tag) => story.tags.includes(tag));
        if (!hasAllTags) return false;
      }

      return true;
    });
  }, [initialStories, selectedCategory, searchQuery, selectedTags]);

  const hasActiveFilters =
    selectedCategory !== "ALL" || searchQuery.trim() !== "" || selectedTags.length > 0;

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
            Kho Truyện &amp; Tác Phẩm
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
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
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

      {/* Search Bar & Tag Toggle Controls */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#5C5146] pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên truyện, tác giả (larivegauche, Oscar Wilde, Trĩ Sở...)"
            className="pl-11 pr-10 h-12 rounded-[14px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] text-sm text-[#2B2623] dark:text-[#FAF5EE] placeholder:text-[#5C5146]/60 focus-visible:ring-0 focus-visible:border-[#2B2623]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5C5146] hover:text-[#2B2623] p-1"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Multi-Tag Filtering Cloud */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD] flex items-center gap-1 mr-1">
            <Filter className="size-3 text-[#E07B4C]" />
            Tags:
          </span>
          {allTags.map((tag) => {
            const isTagActive = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => handleToggleTag(tag)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-[10px] text-xs font-mono font-bold transition-all cursor-pointer ${
                  isTagActive
                    ? "bg-[#E07B4C] text-white border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623]"
                    : "bg-[#FDFBF7] dark:bg-[#241F1C] text-[#5C5146] dark:text-[#C4B9AD] border border-[#2B2623]/30 hover:border-[#2B2623]"
                }`}
              >
                {isTagActive && <Check className="size-3" />}
                <span>#{tag}</span>
              </button>
            );
          })}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs font-mono font-bold text-[#E07B4C] hover:bg-[#E07B4C]/10 h-7 px-2.5 rounded-[8px]"
            >
              <X className="size-3 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Story Grid */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-[20px] border-2 border-dashed border-[#2B2623]/30 bg-[#FDFBF7] dark:bg-[#241F1C]">
          <p className="font-serif text-lg font-bold text-[#2B2623] dark:text-[#FAF5EE] mb-1">
            Chưa tìm thấy truyện nào khớp với bộ lọc
          </p>
          <p className="text-xs text-[#5C5146] dark:text-[#C4B9AD] mb-4">
            Thử gỡ bớt tag hoặc xóa từ khóa tìm kiếm xem sao bạn nhé.
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
          {filteredStories.map((story) => {
            const firstChapterLink = `/chuong/ch_${story.slug.replace(/-/g, "_")}_1`;
            return (
              <div
                key={story.id}
                className="group flex flex-col justify-between rounded-[20px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] hover:translate-x-[0.5px] hover:translate-y-[1px] hover:shadow-[1.5px_3px_0px_#2B2623] active:translate-x-[2px] active:translate-y-[4px] active:shadow-none transition-all duration-200 p-5 overflow-hidden"
              >
                <div>
                  {/* Top: Category & Chapter Count */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-[8px] bg-[#BDCEAF] text-[#2B2623] font-bold border border-[#2B2623]/40">
                      {story.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD]">
                      {story._count?.chapters || 10}+ chương
                    </span>
                  </div>

                  {/* Middle: Cover & Details */}
                  <div className="flex gap-4 mb-4">
                    <div className="relative w-24 h-32 shrink-0 rounded-[12px] overflow-hidden bg-[#EFE8DE] dark:bg-[#1A1614] border border-[#2B2623]/40 shadow-xs">
                      {story.coverUrl ? (
                        <Image
                          src={story.coverUrl}
                          alt={story.title}
                          fill
                          sizes="96px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#5C5146]">
                          <BookOpen className="size-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-start">
                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#2B2623] dark:text-[#FAF5EE] group-hover:text-[#E07B4C] transition-colors line-clamp-2 mb-1">
                        {story.title}
                      </h3>
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
                    href={firstChapterLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none text-xs font-bold transition-all"
                  >
                    <span>Bắt đầu đọc</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
