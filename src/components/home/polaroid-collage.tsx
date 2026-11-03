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

/** Single Polaroid Card with Washi Tape and Thick Bottom Margin */
export function PolaroidCard({
  src,
  alt = "Polaroid snapshot",
  caption = "#MediaNaranja",
  href,
  className = "",
  washiRotate = "rotate-[-2deg]",
}: {
  src: string;
  alt?: string;
  caption?: string;
  href?: string;
  className?: string;
  washiRotate?: string;
}) {
  const isDataUrl = typeof src === "string" && src.startsWith("data:");

  const cardContent = (
    <div
      className={`relative inline-block bg-[#FDFBF7] dark:bg-[#241F1C] border border-[#E4DDD3] dark:border-[#3D352E] rounded-[4px] p-3 pb-10 shadow-[0_10px_24px_rgba(43,38,35,0.12)] transition-all duration-300 group-hover:scale-104 group-hover:shadow-[0_14px_30px_rgba(43,38,35,0.18)] ${className}`}
    >
      {/* Washi Tape Strip on Top Edge */}
      <div
        className={`absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#E89F71]/70 dark:bg-[#E07B4C]/80 ${washiRotate} pointer-events-none z-10 shadow-2xs backdrop-blur-2xs`}
        style={{
          clipPath:
            "polygon(0% 0%, 100% 0%, 97% 50%, 100% 100%, 0% 100%, 3% 50%)",
        }}
      />

      {/* Photo Surface */}
      <div className="relative w-44 h-52 sm:w-52 sm:h-60 rounded-[2px] overflow-hidden bg-[#EFE8DE] dark:bg-[#1A1614]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 176px, 208px"
          unoptimized={isDataUrl}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Handwritten / Monospace Hashtag Caption at Bottom */}
      <div className="absolute bottom-2.5 left-0 right-0 text-center px-2">
        <span className="font-mono text-xs font-bold tracking-tight text-[#5C5146] dark:text-[#C4B9AD] select-none group-hover:text-[#E07B4C] transition-colors">
          {caption}
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block group focus:outline-none cursor-pointer" title={alt}>
        {cardContent}
      </Link>
    );
  }

  return <div className="group">{cardContent}</div>;
}

/** Complete Polaroid Scrapbook Cluster with Backdrop Yellow Blob & Tilted Stickers */
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
  topSticker = "orange vibes",
  bottomSticker = "100% đam mê!",
  className = "",
}: PolaroidCollageProps) {
  return (
    <div
      className={`relative w-full max-w-[460px] mx-auto h-[380px] sm:h-[440px] flex items-center justify-center select-none ${className}`}
    >
      {/* 1. Backdrop Blob: Solid Flat Butter Yellow Circle (No Gradient) */}
      <div className="absolute size-64 sm:size-80 rounded-full bg-[#F4DFAD] dark:bg-[#473B25] top-6 -left-4 sm:top-8 sm:left-2 pointer-events-none z-0" />

      {/* 2. Photo 1 (Left - Top, Tilted Negative 5deg) */}
      <div className="absolute top-4 left-2 sm:left-4 z-10 rotate-[-5deg] hover:z-30 transition-all">
        <PolaroidCard
          src={photo1.src}
          alt={photo1.alt}
          caption={photo1.caption}
          href={photo1.href}
          washiRotate="rotate-[-2deg]"
        />
      </div>

      {/* 3. Photo 2 (Right - Bottom, Overlapping Photo 1, Tilted Positive 7deg) */}
      <div className="absolute bottom-4 right-2 sm:right-4 z-20 rotate-[7deg] hover:z-30 transition-all">
        <PolaroidCard
          src={photo2.src}
          alt={photo2.alt}
          caption={photo2.caption}
          href={photo2.href}
          washiRotate="rotate-[3deg]"
        />
      </div>

      {/* 4. Top-Right Floating Sticker: Dusty Peach #EBBAB5, rotate-[9deg] */}
      <div className="absolute top-2 right-1 sm:right-2 z-30 rotate-[9deg] pointer-events-none">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#EBBAB5] text-[#2B2623] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] text-xs font-bold uppercase tracking-wider">
          <span className="size-2 rounded-full bg-[#E07B4C]" />
          <span>{topSticker}</span>
        </div>
      </div>

      {/* 5. Bottom-Left Floating Sticker: Sage Green #BDCEAF, rotate-[-8deg] */}
      <div className="absolute bottom-3 left-1 sm:left-2 z-30 rotate-[-8deg] pointer-events-none">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-[#BDCEAF] text-[#2B2623] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] text-xs font-bold tracking-tight">
          <span>✨</span>
          <span>{bottomSticker}</span>
        </div>
      </div>
    </div>
  );
}
