"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, Quote } from "lucide-react";
import type { StoryItem } from "@/lib/data";

interface ArchiveHeroProps {
  stories: StoryItem[];
}

interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  linkText: string;
  linkUrl: string;
  secondaryText?: string;
  secondaryUrl?: string;
  tag: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "om-lay-trong-luc",
    eyebrow: "TÁC PHẨM TIÊU BIỂU • BĂNG NGHỆ THUẬT",
    title: "Ôm Lấy Trọng Lực",
    subtitle: "larivegauche",
    description:
      "Cho dù trọng lực có kéo ta rơi xuống ngàn lần, em vẫn sẽ là người dang tay ôm lấy anh giữa băng giá cuộc đời.",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=85",
    linkText: "Đọc Chương 1",
    linkUrl: "/chuong/ch_omlay_1",
    secondaryText: "Xem Giới Thiệu",
    secondaryUrl: "/truyen/om-lay-trong-luc",
    tag: "Full • 86 Chương",
  },
  {
    id: "de-profundis",
    eyebrow: "KINH ĐIỂN DỊCH THUẬT • THƯ TỪ",
    title: "De profundis",
    subtitle: "Oscar Wilde",
    description:
      "Tiếng khóc than và lời tự thú đau đớn nhất rút ra từ tận đáy tâm can của một linh hồn lưu đày giữa bốn bức tường giam lạnh lẽo.",
    image:
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1600&q=85",
    linkText: "Khám Phá Bản Dịch",
    linkUrl: "/chuong/ch_deprofundis_1",
    secondaryText: "Hồ Sơ Tác Phẩm",
    secondaryUrl: "/truyen/de-profundis",
    tag: "Đang tiến hành",
  },
  {
    id: "gio-tin-phong",
    eyebrow: "BẢN THẢO ĐANG COOK • HẢI HÀNH",
    title: "Gió Tín Phong",
    subtitle: "Trĩ Sở",
    description:
      "Tiếng sóng vỗ mạn thuyền vượt qua những cơn bão biển mù mịt, hướng về một phương trời tự do không tên.",
    image:
      "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=85",
    linkText: "Xem Chi Tiết",
    linkUrl: "/truyen/gio-tin-phong",
    secondaryText: "Kho Truyện",
    secondaryUrl: "#archive-catalog",
    tag: "Đang Cook",
  },
  {
    id: "media-naranja",
    eyebrow: "ARS LONGA, VITA BREVIS",
    title: "Kho Lưu Trữ Media Naranja",
    subtitle: "Celine Wang & Đồng Bọn",
    description:
      "Không gian lưu giữ những câu chuyện dịu dàng, những bản dịch có tâm và những lát cam ngọt lành xoa dịu những ngày giông bão.",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1600&q=85",
    linkText: "Góc Trò Chuyện",
    linkUrl: "/tro-chuyen",
    secondaryText: "Về Tác Giả",
    secondaryUrl: "/gioi-thieu",
    tag: "Không Gian Tĩnh Lặng",
  },
];

interface MemoryItem {
  id: string;
  badge: string;
  title: string;
  quote: string;
  author: string;
  link: string;
}

const MEMORIES: MemoryItem[] = [
  {
    id: "m_1",
    badge: "EVENT STORY • CHƯƠNG 44",
    title: "Dưới Ánh Đèn Sân Băng Rực Rỡ",
    quote:
      "Đừng nghĩ về huy chương hay điểm số. Hãy trượt bài này cho chính em, và cho bản thân những ngày tháng gian nan em đã đi qua.",
    author: "Ôm Lấy Trọng Lực",
    link: "/chuong/ch_omlay_44",
  },
  {
    id: "m_2",
    badge: "LITERARY MEMORY • BỨC THƯ",
    title: "Thánh Thi Từ Vực Sâu Khổ Đau",
    quote:
      "Nơi nào có đau khổ, nơi ấy là thánh địa thiêng liêng. Đau đớn đã gột rửa trái tim tôi, dạy tôi cách tha thứ và tìm lại tĩnh lặng.",
    author: "De profundis",
    link: "/chuong/ch_deprofundis_1",
  },
  {
    id: "m_3",
    badge: "AUTHOR NOTE • TÂM TÌNH",
    title: "Chiếc Khăn Len Màu Cam Mùa Đông",
    quote:
      "Mong rằng ai trong chúng ta, dù vấp ngã bao nhiêu lần trước sức nặng của cuộc đời, cũng sẽ tìm thấy một người sẵn sàng ôm lấy mình.",
    author: "Weibo larivegauche",
    link: "/chuong/ch_weibo_1",
  },
];

export function ArchiveHero({ stories: _stories }: ArchiveHeroProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  // Auto-advance hero slides every 5.5 seconds
  React.useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const active = HERO_SLIDES[currentSlide];

  return (
    <div className="space-y-14 sm:space-y-20 my-4 sm:my-8">
      {/* ========================================================
          1. HERO SLIDER SECTION (Phong cách Light & Night)
         ======================================================== */}
      <section
        className="relative w-full min-h-[460px] sm:min-h-[540px] lg:min-h-[580px] rounded-3xl overflow-hidden shadow-2xl bg-[#2A221E] text-white flex flex-col justify-end group select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-label="Kho lưu trữ Media Naranja Spotlight"
      >
        {/* Background Images with Cross-fade Transition */}
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
              idx === currentSlide ? "opacity-100 scale-100 z-0" : "opacity-0 scale-105 pointer-events-none -z-10"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={idx === 0}
              className="object-cover object-center filter brightness-[0.72] contrast-[1.08] transition-transform duration-[6000ms] ease-out scale-100 group-hover:scale-103"
              sizes="100vw"
            />
          </div>
        ))}

        {/* Ambient Gradient Overlays for High Legibility */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#140E0C] via-[#140E0C]/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#140E0C]/70 via-transparent to-[#140E0C]/30 pointer-events-none" />

        {/* Slide Counter Badge (Top Right) */}
        <div className="absolute top-5 right-5 sm:top-7 sm:right-7 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-[11px] font-mono tracking-widest text-orange-200">
          <span className="size-2 rounded-full bg-orange-400 animate-pulse" />
          <span>
            {String(currentSlide + 1).padStart(2, "0")} / {String(HERO_SLIDES.length).padStart(2, "0")}
          </span>
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-20 p-6 sm:p-10 lg:p-14 max-w-3xl flex flex-col items-start gap-3 sm:gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-md bg-orange-500/80 text-white text-[10px] sm:text-[11px] font-mono font-medium tracking-wider uppercase backdrop-blur-xs">
              {active.tag}
            </span>
            <span className="text-[11px] sm:text-xs font-mono tracking-widest text-orange-200/90 uppercase">
              {active.eyebrow}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.12]">
            <i>{active.title}</i>
          </h1>

          <p className="text-xs sm:text-sm text-orange-100/70 font-mono italic">
            — {active.subtitle}
          </p>

          <p className="text-sm sm:text-base text-stone-200/90 max-w-xl line-clamp-3 leading-relaxed font-sans font-normal">
            &ldquo;{active.description}&rdquo;
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2 sm:pt-4 flex-wrap">
            <Link
              href={active.linkUrl}
              className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-medium transition-all shadow-lg hover:shadow-orange-500/25 hover:translate-y-[-1px]"
            >
              <span>{active.linkText}</span>
              <ArrowRight className="size-4" />
            </Link>

            {active.secondaryUrl && (
              <Link
                href={active.secondaryUrl}
                className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium border border-white/20 backdrop-blur-md transition-all hover:translate-y-[-1px]"
              >
                <span>{active.secondaryText}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Slide trước"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 size-10 sm:size-12 rounded-full bg-black/35 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
        >
          <ChevronLeft className="size-6" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Slide tiếp theo"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 size-10 sm:size-12 rounded-full bg-black/35 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
        >
          <ChevronRight className="size-6" />
        </button>

        {/* Dots Navigation */}
        <div className="absolute bottom-5 sm:bottom-7 right-6 sm:right-10 z-20 flex items-center gap-1.5 sm:gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Chuyển tới slide ${idx + 1}`}
              className={`h-2 transition-all duration-300 rounded-full ${
                idx === currentSlide
                  ? "w-7 sm:w-8 bg-orange-400 shadow-sm"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ========================================================
          2. MEMORIES & HEARTFELT QUOTES (Ký ức & Trích đoạn đắt giá)
             Lấy cảm hứng từ section #memories của Light & Night
         ======================================================== */}
      <section className="relative">
        <div className="flex items-end justify-between pb-4 mb-6 border-b border-border/70">
          <div>
            <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-orange-600 dark:text-orange-400 mb-1 font-semibold">
              HEARTFELT MEMORIES
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
              Ký Ức Rung Động
            </h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground hidden sm:inline-block">
            Mỗi câu chữ, một lát cam xoa dịu
          </span>
        </div>

        {/* 3 Editorial Quote Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {MEMORIES.map((m, idx) => (
            <Link
              key={m.id}
              href={m.link}
              className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-card border border-border/80 hover:border-orange-400/60 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Subtle background ambient corner accent */}
              <div
                className={`absolute -top-12 -right-12 size-32 rounded-full blur-2xl pointer-events-none transition-colors ${
                  idx === 0
                    ? "bg-orange-500/10 group-hover:bg-orange-500/20"
                    : idx === 1
                    ? "bg-amber-500/10 group-hover:bg-amber-500/20"
                    : "bg-rose-500/10 group-hover:bg-rose-500/20"
                }`}
              />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-orange-700 dark:text-orange-400">
                    {m.badge}
                  </span>
                  <Quote className="size-4 text-orange-300/80 dark:text-orange-800/80 group-hover:text-primary transition-colors" />
                </div>

                <h3 className="font-serif text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {m.title}
                </h3>

                <blockquote className="text-xs sm:text-[13px] text-foreground/80 leading-relaxed font-sans italic border-l-2 border-orange-400/60 pl-3 my-2">
                  &ldquo;{m.quote}&rdquo;
                </blockquote>
              </div>

              <div className="relative z-10 pt-4 mt-2 border-t border-border/50 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-muted-foreground">
                  {m.author}
                </span>
                <span className="font-mono text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
