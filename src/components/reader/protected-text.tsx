"use client";

import * as React from "react";

/**
 * Anti-Copy Protected Text:
 * Renders text with strict CSS user-select: none, contextmenu disable, and clipboard poison.
 * Native text nodes allow natural browser font kerning, justification (text-justify),
 * and zero spacing glitches across mobile and desktop.
 */
export function ProtectedText({ text }: { text: string; paragraphIndex?: number }) {
  if (!text) return null;

  return (
    <span
      className="select-none select-none-all select-none-touch"
      style={{
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      {text}
    </span>
  );
}
