"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Quote, Sparkles } from "lucide-react";
import { PolaroidCollage } from "./polaroid-collage";
import { type StoryItem } from "@/lib/data";

interface ArchiveHeroProps {
  stories?: StoryItem[];
}

const MEMORIES = [
  {
    id: "mem-1",
    badge: "Băng giá & Ấm áp",
    title: "Ôm Lấy Trọng Lực",
    author: "larivegauche",
    quote:
      "Cho dù trọng lực có kéo ta rơi xuống ngàn lần, em vẫn sẽ là người dang tay ôm lấy anh giữa băng giá cuộc đời.",
    link: "/truyen/om-lay-trong-luc",
  },
  {
    id: "mem-2",
    badge: "Từ Vực Sâu Thẳm",
    title: "De profundis",
    author: "Oscar Wilde",
    quote:
      "Nghệ thuật là biểu hiện của tâm hồn; và tâm hồn không thể nào đạt tới độ sâu sắc tột cùng nếu chưa từng trải qua nỗi cô độc tột bậc.",
    link: "/truyen/de-profundis",
  },
  {
    id: "mem-3",
    badge: "Gió Mùa Ven Biển",
    title: "Gió Tín Phong Thổi Về Phía Biển",
    author: "Thương Bắc Thụ",
    quote:
      "Những ngày hè ven biển rợp nắng vàng, gió tín phong mang theo vị mặn mòi của đại dương và sự dịu dàng lặng lẽ của một người đàn ông từng trải.",
    link: "/truyen/gio-tin-phong-thoi-ve-phia-bien",
  },
];

export function ArchiveHero({}: ArchiveHeroProps) {
  return (
    <div className="space-y-16 sm:space-y-24 my-4 sm:my-8">
      {/* ========================================================
          1. HERO SECTION: RETRO POLAROID SCRAPBOOK (100% Solid Flat Colors)
         ======================================================== */}
      <section className="relative w-full rounded-[24px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[3px_5px_0px_#2B2623] p-6 sm:p-10 lg:p-14 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start gap-4 z-10">
            {/* Sage Green Sticker */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[10px] bg-[#BDCEAF] text-[#2B2623] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] text-xs font-bold uppercase tracking-wider select-none">
              <Sparkles className="size-3.5 text-[#2B2623]" />
              <span>MEDIA NARANJA · CITRUS ARCHIVE</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#2B2623] dark:text-[#FAF5EE] leading-[1.12]">
              Kho lưu trữ <br />
              <span className="text-[#E07B4C]">Media Naranja</span>
            </h1>

            {/* Motto */}
            <p className="font-mono text-xs sm:text-sm text-[#5C5146] dark:text-[#C4B9AD] italic font-semibold">
              ars longa, vita brevis – nghệ thuật trường tồn, cuộc đời ngắn ngủi.
            </p>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#5C5146] dark:text-[#C4B9AD] max-w-xl leading-relaxed font-sans">
              Nơi lưu giữ những mẩu truyện dịu dàng, bản dịch đam mỹ chọn lọc và tản văn nghệ thuật tràn ngập sắc cam ấm áp của Celine Wang.
            </p>

            {/* Retro Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                href="/kho-truyen"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-[14px] bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] active:translate-x-[2px] active:translate-y-[4px] active:shadow-none text-xs sm:text-sm font-bold transition-all"
              >
                <span>Khám phá kho truyện</span>
                <ArrowRight className="size-4" />
              </Link>

              <Link
                href="/truyen/om-lay-trong-luc"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-[14px] bg-[#E5DDD2] dark:bg-[#3D352E] hover:bg-[#DBD1C4] text-[#5C5146] dark:text-[#FAF5EE] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] active:translate-x-[2px] active:translate-y-[4px] active:shadow-none text-xs sm:text-sm font-bold transition-all"
              >
                <span>Vào đọc Ôm Lấy Trọng Lực</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Polaroid Scrapbook Collage */}
          <div className="lg:col-span-5 flex justify-center z-10 overflow-hidden py-4">
            <PolaroidCollage
              photo1={{
                src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80",
                alt: "Ôm Lấy Trọng Lực",
                caption: "#OmLayTrongLuc",
              }}
              photo2={{
                src: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
                alt: "Bảy Bức Thư",
                caption: "#MediaNaranja",
              }}
              topSticker="orange vibes"
              bottomSticker="100% đam mê!"
            />
          </div>
        </div>
      </section>

      {/* ========================================================
          2. MEMORIES & HEARTFELT QUOTES (Ký Ức Rung Động)
         ======================================================== */}
      <section className="relative">
        <div className="flex items-end justify-between pb-4 mb-6 border-b-2 border-[#2B2623]/20">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#EBBAB5] text-[#2B2623] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
              HEARTFELT MEMORIES
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2623] dark:text-[#FAF5EE]">
              Ký Ức Rung Động
            </h2>
          </div>
          <span className="text-xs font-mono font-semibold text-[#5C5146] dark:text-[#C4B9AD] hidden sm:inline-block">
            Mỗi câu chữ, một lát cam xoa dịu
          </span>
        </div>

        {/* 3 Retro Quote Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {MEMORIES.map((m, idx) => (
            <Link
              key={m.id}
              href={m.link}
              className={`group flex flex-col justify-between p-5 sm:p-6 rounded-[16px] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] hover:translate-x-[0.5px] hover:translate-y-[1px] hover:shadow-[1.5px_3px_0px_#2B2623] active:translate-x-[2px] active:translate-y-[4px] active:shadow-none transition-all ${
                idx === 0
                  ? "bg-[#FAF5EE] dark:bg-[#241F1C]"
                  : idx === 1
                  ? "bg-[#FDFBF7] dark:bg-[#26211E]"
                  : "bg-[#FAF5EE] dark:bg-[#241F1C]"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-[6px] bg-[#E5DDD2] dark:bg-[#3D352E] text-[#5C5146] dark:text-[#C4B9AD] border border-[#2B2623]/30">
                    {m.badge}
                  </span>
                  <Quote className="size-4 text-[#E07B4C]" />
                </div>

                <h3 className="font-serif text-base sm:text-lg font-bold text-[#2B2623] dark:text-[#FAF5EE] group-hover:text-[#E07B4C] transition-colors leading-snug">
                  {m.title}
                </h3>

                <blockquote className="text-xs sm:text-[13px] text-[#5C5146] dark:text-[#C4B9AD] leading-relaxed font-sans italic border-l-2 border-[#E07B4C] pl-3 my-2">
                  &ldquo;{m.quote}&rdquo;
                </blockquote>
              </div>

              <div className="pt-4 mt-3 border-t border-[#2B2623]/15 flex items-center justify-between text-xs font-mono">
                <span className="text-[#5C5146] dark:text-[#C4B9AD] font-semibold">
                  {m.author}
                </span>
                <span className="text-[#E07B4C] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Đọc tiếp</span>
                  <span>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
