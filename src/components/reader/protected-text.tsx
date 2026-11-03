"use client";

import * as React from "react";

/**
 * Anti-Scraping / Anti-Speedreader Text Cloak:
 * Splits text into small chunks and renders them via CSS pseudo-element `content: attr(data-c)`.
 * Because the DOM elements contain NO inner text nodes:
 * 1. `element.textContent` is EMPTY or only contains the decoy copyright watermark.
 * 2. Brave Speedreader & Mozilla Readability cannot extract any plain novel text.
 * 3. Browser copy-paste extensions cannot select or drag pseudo-element text.
 * 4. Human readers see 100% normal, smooth, beautiful text with full line-wrapping and styling.
 */
export function ProtectedText({ text, paragraphIndex }: { text: string; paragraphIndex: number }) {
  if (!text) return null;

  // Split into chunks of 3-5 words
  const words = text.split(" ");
  const chunks: string[] = [];
  let current = "";

  for (let i = 0; i < words.length; i++) {
    const space = current.length > 0 ? " " : "";
    current += space + words[i];

    // Every 4 words or at the end, push chunk
    if ((i + 1) % 4 === 0 || i === words.length - 1) {
      chunks.push(current);
      current = "";
    }
  }

  return (
    <>
      {chunks.map((chunk, idx) => (
        <React.Fragment key={`chunk-${paragraphIndex}-${idx}`}>
          <span
            className="protected-text-chunk"
            data-c={idx < chunks.length - 1 ? `${chunk} ` : chunk}
          />
          {/* Periodic zero-width decoy watermark for dumb scrapers */}
          {idx === 0 && (
            <span
              className="select-none pointer-events-none"
              style={{
                position: "absolute",
                width: 0,
                height: 0,
                overflow: "hidden",
                opacity: 0,
                fontSize: 0,
                lineHeight: 0,
                display: "none",
              }}
              aria-hidden="true"
            >
              [Bản quyền tác phẩm thuộc về Media Naranja - Nghiêm cấm sao chép trái phép]
            </span>
          )}
        </React.Fragment>
      ))}
    </>
  );
}

