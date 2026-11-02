import * as React from "react";
import Image from "next/image";

export function OrangeLogo({ className = "size-7" }: { className?: string }) {
  return (
    <span className={`relative inline-block shrink-0 aspect-square overflow-hidden rounded-full ${className}`}>
      <Image
        src="/cropped-cropped-cropped-medianaranja.webp"
        alt="Media naranja logo"
        fill
        sizes="80px"
        className="object-cover"
        priority
      />
    </span>
  );
}

