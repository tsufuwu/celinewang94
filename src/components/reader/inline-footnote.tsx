"use client";

import * as React from "react";
import { BookOpenText, X, HelpCircle } from "lucide-react";

export interface InlineFootnoteProps {
  word?: string;
  note: string;
  index?: number;
}

export function InlineFootnote({ word, note, index }: InlineFootnoteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLSpanElement>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Close when tapping/clicking outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Desktop Hover handlers (debounced for smooth UX)
  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  // Mobile / Desktop Click or Tap toggle
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // CRITICAL: Stop propagation so paragraph sheet does NOT open!
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen((prev) => !prev);
  };

  return (
    <span
      ref={containerRef}
      className="relative inline-block cursor-pointer select-text group/fn"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }
      }}
      tabIndex={0}
      role="button"
      aria-expanded={isOpen}
      aria-label={`Chú thích ${index ? `#${index}` : ""}: ${note}`}
    >
      {word ? (
        <span className="inline-flex items-baseline">
          {/* Annotated Word with dashed orange underline */}
          <span className="border-b-2 border-dashed border-orange-500 hover:border-orange-600 font-medium text-foreground transition-colors decoration-slice">
            {word}
          </span>
          {/* Subtle Orange Badge */}
          <span className="inline-flex items-center justify-center align-super ml-0.5 px-1 py-0.2 text-[9px] sm:text-[10px] font-mono font-semibold leading-none rounded bg-[#FFEDD5] text-[#C2410C] dark:bg-orange-950/80 dark:text-orange-300 border border-orange-200/80 dark:border-orange-800/60 shadow-2xs group-hover/fn:bg-orange-200 transition-colors">
            {index ?? <HelpCircle className="size-2.5" />}
          </span>
        </span>
      ) : (
        /* Standalone footnote indicator if no specific word was wrapped */
        <span className="inline-flex items-center gap-0.5 align-baseline mx-0.5 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono leading-none bg-[#FFEDD5] text-[#C2410C] dark:bg-orange-950/80 dark:text-orange-300 border border-dashed border-orange-400 dark:border-orange-700 shadow-2xs hover:bg-orange-200 transition-colors">
          <BookOpenText className="size-2.5" />
          <span>{index ? `[${index}]` : "[chú thích]"}</span>
        </span>
      )}

      {/* Hybrid Tooltip / Popover Bubble */}
      {isOpen && (
        <span
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-max min-w-[200px] max-w-[min(380px,calc(100vw-2rem))] p-3.5 rounded-2xl bg-[#FFF5EB] dark:bg-[#1E1815] text-[#281B12] dark:text-[#F7EDE6] border border-orange-300/80 dark:border-orange-800/70 shadow-xl shadow-orange-950/15 dark:shadow-black/60 text-left block normal-case font-normal animate-in fade-in-0 zoom-in-95 duration-150 backdrop-blur-xs cursor-default"
        >
          {/* Header with Title and Close Button */}
          <span className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b border-orange-200/60 dark:border-orange-900/40 text-[11px] font-mono text-orange-800 dark:text-orange-300">
            <span className="flex items-center gap-1 font-semibold shrink-0">
              🍊 Chú thích {index ? `#${index}` : ""}
            </span>
            {word && (
              <span className="font-serif italic text-muted-foreground truncate max-w-[140px] text-[11px]">
                &ldquo;{word}&rdquo;
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="p-0.5 -mr-1 hover:bg-orange-200/60 dark:hover:bg-orange-900/60 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Đóng chú thích"
            >
              <X className="size-3.5" />
            </button>
          </span>

          {/* Explanation Text */}
          <span className="block text-xs sm:text-[13px] leading-relaxed font-sans text-foreground/90 whitespace-normal select-text">
            {note}
          </span>

          {/* Arrow Pointer */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2.5 h-2.5 rotate-45 bg-[#FFF5EB] dark:bg-[#1E1815] border-r border-b border-orange-300/80 dark:border-orange-800/70 block pointer-events-none" />
        </span>
      )}
    </span>
  );
}

/**
 * Strips footnote markup from text for plain display (e.g. quotes, word count, previews)
 */
export function stripFootnotes(text: string): string {
  if (!text) return "";
  return text
    // Replace [word][[note]] with word
    .replace(/\[([^\]\n\r]+)\]\[\[(.*?)\]\]/gu, "$1")
    // Replace word[[note]] with word
    .replace(/([^\s\[\]\(\)\.,!?:;«»""''…]+)\[\[(.*?)\]\]/gu, "$1")
    // Replace [[note]] with empty
    .replace(/\[\[(.*?)\]\]/gu, "")
    // Replace word[efn_note]...[/efn_note] with word
    .replace(/([^\s\[\]\(\)\.,!?:;«»""''…]+)?\[efn_note\].*?\[\/efn_note\]/gu, "$1");
}

/**
 * Automatically parses inline footnote patterns in text:
 * 1. `[Cụm từ cần chú thích][[Nội dung giải thích]]`
 * 2. `Từ_cần_chú_thích[[Nội dung giải thích]]`
 * 3. `[[Nội dung giải thích]]` (standalone)
 * 4. `Từ[efn_note]Nội dung giải thích[/efn_note]` or standalone `[efn_note]Nội dung[/efn_note]`
 */
export function renderParagraphWithFootnotes(
  text: string,
  paragraphIndex: number,
  baseFootnoteIndex = 1
): React.ReactNode {
  // Regex:
  // 1: [bracketed phrase][[note]] -> Group 1 (word), Group 2 (note)
  // 2: word[[note]] -> Group 3 (word), Group 4 (note)
  // 3: [[note]] -> Group 5 (note)
  // 4: word[efn_note]note[/efn_note] -> Group 6 (word optional), Group 7 (note)
  const regex =
    /(?:\[([^\]\n\r]+)\]\[\[(.*?)\]\])|(?:([^\s\[\]\(\)\.,!?:;«»""''…]+)\[\[(.*?)\]\])|(?:\[\[(.*?)\]\])|(?:([^\s\[\]\(\)\.,!?:;«»""''…]+)?\[efn_note\](.*?)\[\/efn_note\])/gu;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let fnCounter = baseFootnoteIndex;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    const word = match[1] || match[3] || match[6] || "";
    const note = match[2] || match[4] || match[5] || match[7] || "";

    elements.push(
      <InlineFootnote
        key={`fn-${paragraphIndex}-${fnCounter}-${match.index}`}
        word={word.trim()}
        note={note.trim()}
        index={fnCounter++}
      />
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements.length > 0 ? elements : text;
}
