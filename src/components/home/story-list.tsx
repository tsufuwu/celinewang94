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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-8 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-orange-700 dark:text-orange-400 mb-1">
            <Layers className="size-3.5" />
            <span>Kệ Sách Của Celine</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-foreground font-semibold tracking-tight">
            Kho Truyện & Tác Phẩm
          </h2>
        </div>

        {/* Story Count Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-orange-200/60 dark:border-orange-950/40 text-xs font-mono text-orange-800 dark:text-orange-300 self-start sm:self-auto">
          <span>Tìm thấy</span>
          <span className="font-bold text-primary">{filteredStories.length}</span>
          <span>bộ truyện</span>
        </div>
      </div>

      {/* Category Tabs (Full, Đang cook, Dịch, Fanfic) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium transition-all shrink-0 ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
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
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên truyện, tác giả (larivegauche, Oscar Wilde, Trĩ Sở...)"
            className="pl-10 pr-10 h-11 rounded-2xl bg-card border-border/80 text-sm focus-visible:ring-primary shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Multi-Tag Filtering Cloud */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-mono text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="size-3" />
            Lọc theo Tag:
          </span>
          {allTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => handleToggleTag(tag)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-medium shadow-xs"
                    : "bg-secondary/70 hover:bg-secondary text-secondary-foreground border border-orange-200/50 dark:border-orange-950/40"
                }`}
              >
                {isSelected && <Check className="size-3 stroke-[2.5]" />}
                <span>#{tag}</span>
              </button>
            );
          })}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs h-7 px-2.5 text-muted-foreground hover:text-destructive rounded-xl ml-auto"
            >
              <X className="size-3 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Story Grid */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border bg-card/50">
          <p className="font-serif text-lg text-foreground mb-1">
            Chưa tìm thấy truyện nào khớp với bộ lọc
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Thử gỡ bớt tag hoặc xóa từ khóa tìm kiếm xem sao bạn nhé.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="rounded-xl text-xs"
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => {
            const firstChapterLink = `/chuong/ch_${story.slug.replace(/-/g, "_")}_1`;
            return (
              <div
                key={story.id}
                className="group flex flex-col justify-between rounded-3xl bg-card border border-border/80 hover:border-primary/50 hover:shadow-lg transition-all duration-300 p-5 overflow-hidden"
              >
                <div>
                  {/* Top: Category & Chapter Count */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-secondary text-primary font-semibold border border-orange-200/60 dark:border-orange-900/40">
                      {story.category}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {story._count?.chapters || 10}+ chương
                    </span>
                  </div>

                  {/* Middle: Cover & Details */}
                  <div className="flex gap-4 mb-4">
                    <div className="relative w-24 h-32 shrink-0 rounded-2xl overflow-hidden bg-muted border border-border/60 shadow-sm">
                      {story.coverUrl ? (
                        <Image
                          src={story.coverUrl}
                          alt={story.title}
                          fill
                          sizes="96px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <BookOpen className="size-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-start">
                      <h3 className="font-serif text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                        {story.title}
                      </h3>
                      <p className="text-xs text-orange-700 dark:text-orange-400 font-medium mb-2">
                        {story.author}
                      </p>

                      <div className="flex flex-wrap gap-1 mt-auto">
                        {story.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-secondary/80 text-secondary-foreground font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Synopsis Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                    {story.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Cập nhật gần đây
                  </span>
                  <Link
                    href={firstChapterLink}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:translate-x-0.5 transition-transform"
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
