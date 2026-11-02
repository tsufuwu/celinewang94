"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, RefreshCw, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StoryItem } from "@/lib/data";
import { OrangeLogo } from "@/components/layout/orange-logo";

interface RandomStoryCardProps {
  stories: StoryItem[];
}

export function RandomStoryCard({ stories }: RandomStoryCardProps) {
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [selectedStory, setSelectedStory] = React.useState<StoryItem | null>(null);

  // Initialize random story on client to prevent hydration mismatch
  React.useEffect(() => {
    if (stories.length > 0) {
      const randomIndex = Math.floor(Math.random() * stories.length);
      setSelectedStory(stories[randomIndex]);
    }
  }, [stories]);

  const handleCardClick = () => {
    if (!isFlipped) {
      if (stories.length > 0) {
        const randomIndex = Math.floor(Math.random() * stories.length);
        setSelectedStory(stories[randomIndex]);
      }
      setIsFlipped(true);
    }
  };

  const handlePickAnother = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stories.length > 1) {
      let nextIndex: number;
      do {
        nextIndex = Math.floor(Math.random() * stories.length);
      } while (selectedStory && stories[nextIndex]?.id === selectedStory.id);
      setSelectedStory(stories[nextIndex]);
    }
  };

  const handleFlipBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
  };

  return (
    <section className="relative my-4 sm:my-6 flex flex-col items-center">
      {/* 3D Flip Card Container */}
      <div className="perspective-1000 w-full max-w-sm sm:max-w-md h-[450px] sm:h-[430px] select-none cursor-pointer">
        <div
          onClick={handleCardClick}
          className={`relative w-full h-full duration-700 ease-out transform-style-3d transition-transform shadow-lg hover:shadow-2xl rounded-3xl ${isFlipped ? "rotate-y-180" : ""
            }`}
        >
          {/* FRONT FACE (Tarot / Archival Citrus Mystery Card) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/95 to-secondary/40 p-8 flex flex-col items-center justify-between overflow-hidden group">
            {/* Ambient decorative glowing oranges */}
            <div className="absolute -top-16 -right-16 size-48 rounded-full bg-orange-500/10 blur-3xl pointer-events-none group-hover:bg-orange-500/20 transition-colors" />
            <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-colors" />

            {/* Inner frame */}
            <div className="w-full h-full border border-dashed border-orange-300/60 dark:border-orange-800/50 rounded-2xl p-6 flex flex-col items-center justify-between text-center relative z-10">
              <div className="flex flex-col items-center gap-1.5 pt-2">
                <span className="text-[11px] font-mono tracking-widest text-orange-700 dark:text-orange-400 uppercase">
                  Media Naranja Tarot
                </span>
                <div className="h-px w-8 bg-orange-300/60 dark:bg-orange-800/50" />
              </div>

              {/* Center Medallion */}
              <div className="flex flex-col items-center gap-4 my-auto">
                <div className="size-24 rounded-full border border-orange-200 dark:border-orange-900 bg-secondary/80 flex items-center justify-center text-foreground group-hover:scale-105 transition-transform duration-300 shadow-inner">
                  <OrangeLogo className="size-14 animate-spin [animation-duration:25s]" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-serif text-xl font-medium tracking-tight text-foreground">
                    Lá Bài Số Phận
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Chạm để lật mở duyên phận của bạn
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-primary pb-2 group-hover:translate-y-[-2px] transition-transform">
                <Sparkles className="size-3.5" />
                <span>Bấm vào để lật thẻ</span>
              </div>
            </div>
          </div>

          {/* BACK FACE (Story Revealed) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl border border-primary/30 bg-card p-6 flex flex-col justify-between overflow-hidden shadow-xl">
            {selectedStory ? (
              <div className="flex flex-col h-full justify-between">
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="font-mono text-[10px] tracking-wide uppercase bg-secondary text-primary border-orange-200">
                      🍊 {selectedStory.category}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">
                      {selectedStory._count?.chapters ?? 10}+ chương
                    </span>
                  </div>

                  {/* Story Info Preview */}
                  <div className="flex gap-4 items-start mb-4">
                    <div className="relative w-20 h-28 shrink-0 rounded-xl overflow-hidden bg-muted border border-border/70 shadow-sm">
                      {selectedStory.coverUrl ? (
                        <Image
                          src={selectedStory.coverUrl}
                          alt={selectedStory.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <BookOpen className="size-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-lg font-semibold text-foreground leading-snug line-clamp-2 mb-1">
                        {selectedStory.title}
                      </h4>
                      <p className="text-xs text-primary font-medium mb-2">
                        {selectedStory.author}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedStory.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Synopsis Excerpt */}
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed italic border-l-2 border-primary/40 pl-3 my-2">
                    &ldquo;{selectedStory.description || "Một câu chuyện ấm áp dành cho bạn..."}&rdquo;
                  </p>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-border/60 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePickAnother}
                    className="flex-1 rounded-xl text-xs gap-1.5 h-9 border-border/80 hover:bg-muted"
                  >
                    <RefreshCw className="size-3.5" />
                    <span>Rút quả khác</span>
                  </Button>

                  <Link href={`/chuong/ch_${selectedStory.slug.replace(/-/g, "_")}_1`} className="flex-1">
                    <Button
                      size="sm"
                      className="w-full rounded-xl text-xs gap-1.5 h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-xs"
                    >
                      <span>Đọc ngay</span>
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFlipBack}
                    className="rounded-xl text-xs px-2.5 h-9 text-muted-foreground hover:text-foreground"
                    title="Úp thẻ lại"
                  >
                    Úp thẻ
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Đang xáo trộn các câu chuyện...
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
