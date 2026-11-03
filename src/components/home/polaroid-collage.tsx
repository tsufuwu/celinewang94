"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

export interface PolaroidPhoto {
  src: string;
  alt?: string;
  caption?: string;
  href?: string;
}

interface PolaroidCollageProps {
  photo1?: PolaroidPhoto;
  photo2?: PolaroidPhoto;
  topSticker?: string;
  bottomSticker?: string;
  className?: string;
}

/** 
 * Single Polaroid Card 
 * Palette inspired by https://celinewang94.wordpress.com/ 
 * (Warm paper #FDFBF7, Teal #438D8D, Amber #D9B87D, Deep charcoal #2B2623)
 */
export function PolaroidCard({
  src,
  alt = "Polaroid snapshot",
  caption = "#MediaNaranja",
  href,
  className = "",
  washiColor = "bg-[#438D8D]",
  washiRotate = "rotate-[-1deg]",
}: {
  src: string;
  alt?: string;
  caption?: string;
  href?: string;
  className?: string;
  washiColor?: string;
  washiRotate?: string;
}) {
  const isDataUrl = typeof src === "string" && src.startsWith("data:");

  const cardContent = (
    <div
      className={`relative inline-block bg-[#FDFBF7] dark:bg-[#23201D] border-2 border-[#2B2623] dark:border-[#3D352E] rounded-[6px] p-2.5 sm:p-3 pb-8 sm:pb-9 shadow-[3px_4px_0px_#2B2623] transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[4px_7px_0px_#2B2623] select-none ${className}`}
    >
      {/* Washi Tape Strip on Top Edge */}
      <div
        className={`absolute -top-3 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-5 sm:h-6 ${washiColor} ${washiRotate} pointer-events-none z-10 shadow-xs opacity-90`}
        style={{
          clipPath:
            "polygon(0% 0%, 100% 0%, 97% 50%, 100% 100%, 0% 100%, 3% 50%)",
        }}
      />

      {/* Photo Surface */}
      <div className="relative w-36 h-44 sm:w-44 sm:h-52 md:w-48 md:h-56 rounded-[2px] overflow-hidden bg-[#EEE9E1] dark:bg-[#1A1614] border border-[#2B2623]/20">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, 192px"
          unoptimized={isDataUrl}
          className="object-cover transition-transform duration-300 hover:scale-103"
        />
      </div>

      {/* Handwritten / Monospace Hashtag Caption at Bottom */}
      <div className="absolute bottom-2 sm:bottom-2.5 left-2 right-2 text-center overflow-hidden">
        <span
          className="block truncate font-mono text-[11px] sm:text-xs font-bold tracking-tight text-[#3D3935] dark:text-[#EAE4DC] select-none"
          title={caption}
        >
          {caption}
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none cursor-pointer" title={alt}>
        {cardContent}
      </Link>
    );
  }

  return <div>{cardContent}</div>;
}

/** 
 * Parallel Side-by-side Polaroid Layout
 * - Desktop: Side-by-side (song song nhau)
 * - Zero overlap: Each card stands independently
 * - Color palette: Celine Wang WordPress (#438D8D Teal, #D9B87D Amber, #EEE9E1 Canvas)
 */
export function PolaroidCollage({
  photo1 = {
    src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80",
    alt: "Ôm Lấy Trọng Lực",
    caption: "#OmLayTrongLuc",
    href: "/truyen/om-lay-trong-luc",
  },
  photo2 = {
    src: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    alt: "Media Naranja Archive",
    caption: "#MediaNaranja",
    href: "/kho-truyen",
  },
  topSticker = "citrus archive",
  bottomSticker,
  className = "",
}: PolaroidCollageProps) {
  return (
    <div className={`relative w-full flex flex-col items-center justify-center select-none ${className}`}>
      {/* Optional Top Badge in Celine Wang's Teal #438D8D */}
      {topSticker && (
        <div className="mb-3 self-center sm:self-end">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#438D8D] text-white border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] text-[11px] font-mono font-bold uppercase tracking-wider">
            <span className="size-1.5 rounded-full bg-[#D9B87D]" />
            <span>{topSticker}</span>
          </div>
        </div>
      )}

      {/* Side-by-side parallel Polaroid cards (song song nhau, không đè lên nhau) */}
      <div className="flex flex-row flex-wrap sm:flex-nowrap items-center justify-center gap-4 sm:gap-6 lg:gap-7">
        {/* Photo 1: Ôm Lấy Trọng Lực (Teal Washi Tape) */}
        <div>
          <PolaroidCard
            src={photo1.src}
            alt={photo1.alt}
            caption={photo1.caption}
            href={photo1.href}
            washiColor="bg-[#438D8D]"
            washiRotate="rotate-[-1.5deg]"
          />
        </div>

        {/* Photo 2: Second Story / Archive (Amber Washi Tape) */}
        <div>
          <PolaroidCard
            src={photo2.src}
            alt={photo2.alt}
            caption={photo2.caption}
            href={photo2.href}
            washiColor="bg-[#D9B87D]"
            washiRotate="rotate-[1.5deg]"
          />
        </div>
      </div>

      {/* Optional Bottom Sticker */}
      {bottomSticker && (
        <div className="mt-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#D9B87D] text-[#2B2623] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] text-xs font-bold tracking-tight">
            <span>✨</span>
            <span>{bottomSticker}</span>
          </div>
        </div>
      )}
    </div>
  );
}
