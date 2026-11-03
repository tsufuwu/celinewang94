"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { PolaroidCollage } from "./polaroid-collage";
import { type StoryItem } from "@/lib/data";

interface ArchiveHeroProps {
  stories?: StoryItem[];
}

function formatPolaroidCaption(title?: string): string {
  if (!title) return "#MediaNaranja";
  const words = title.trim().split(/\s+/);
  if (words.length > 3 || title.length > 16) {
    return `#${words.slice(0, 3).join("")}...`;
  }
  return `#${title.replace(/\s+/g, "")}`;
}

export function ArchiveHero({ stories = [] }: ArchiveHeroProps) {
  // Find "Ôm Lấy Trọng Lực" dynamically from stories passed from DB
  const omLayStory = stories.find(
    (s) => s.slug === "om-lay-trong-luc" || s.id === "story_om_lay_trong_luc"
  );

  // Find second story for collage or fallback
  const secondStory = stories.find(
    (s) =>
      s.slug !== "om-lay-trong-luc" &&
      s.id !== "story_om_lay_trong_luc" &&
      Boolean(s.coverUrl)
  );

  const photo1Src =
    omLayStory?.coverUrl ||
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80";

  const photo2Src =
    secondStory?.coverUrl ||
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80";

  return (
    <div className="space-y-16 sm:space-y-24 my-4 sm:my-8">
      {/* ========================================================
          1. HERO SECTION: RETRO POLAROID SCRAPBOOK (100% Solid Flat Colors)
         ======================================================== */}
      <section className="relative w-full rounded-[24px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[3px_5px_0px_#2B2623] p-6 sm:p-10 lg:p-14 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-5 flex flex-col items-start gap-4 z-10">
            {/* Sage Green Sticker */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[10px] bg-[#BDCEAF] text-[#2B2623] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] text-xs font-bold uppercase tracking-wider select-none">
              <Sparkles className="size-3.5 text-[#2B2623]" />
              <span>MEDIA NARANJA · CITRUS ARCHIVE</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#E07B4C] leading-[1.12]">
              Media Naranja
            </h1>

            {/* Motto */}
            <p className="font-mono text-xs sm:text-sm text-[#5C5146] dark:text-[#C4B9AD] italic font-semibold">
              ars longa, vita brevis – nghệ thuật trường tồn, cuộc đời ngắn ngủi.
            </p>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#5C5146] dark:text-[#C4B9AD] max-w-xl leading-relaxed font-sans">
              chào mừng đến với web lỏ của mình
            </p>
          </div>

          {/* Right Column: Polaroid Gallery (Parallel side-by-side, no overlap, Celine Wang palette) */}
          <div className="lg:col-span-7 flex justify-center z-10 py-2">
            <PolaroidCollage
              photo1={{
                src: photo1Src,
                alt: omLayStory?.title || "Ôm Lấy Trọng Lực",
                caption: "#OmLayTrongLuc",
                href: `/truyen/${omLayStory?.slug || "om-lay-trong-luc"}`,
              }}
              photo2={{
                src: photo2Src,
                alt: secondStory?.title || "Media Naranja Archive",
                caption: formatPolaroidCaption(secondStory?.title),
                href: secondStory ? `/truyen/${secondStory.slug}` : "/kho-truyen",
              }}
              topSticker="citrus archive"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
