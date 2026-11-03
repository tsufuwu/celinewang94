"use client";

import * as React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";
import { Button } from "@/components/ui/button";
import { Wand2, Copy, Check, WrapText } from "lucide-react";

interface CodeMirrorEditorProps {
  value: string;
  onChange: (val: string) => void;
  isDark?: boolean;
  className?: string;
}

// Simple fast HTML formatter for the "Format Code" button
function formatHtml(raw: string): string {
  let formatted = "";
  let indent = 0;
  const tab = "  ";

  // Normalize single-line breaks around tags
  const tokens = raw
    .replace(/>\s*</g, "><")
    .replace(/(<[^\/>]+>)/g, "\n$1")
    .replace(/(<\/[^>]+>)/g, "$1\n")
    .split("\n");

  const voidTags = new Set([
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr"
  ]);

  for (let line of tokens) {
    line = line.trim();
    if (!line) continue;

    const isClosing = /^<\//.test(line);
    const isOpening = /^<[a-z0-9]+/i.test(line);
    const isSelfClosing = /\/>$/.test(line);
    const tagNameMatch = line.match(/^<([a-z0-9]+)/i);
    const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : "";
    const isVoid = voidTags.has(tagName);

    if (isClosing) {
      indent = Math.max(0, indent - 1);
    }

    formatted += tab.repeat(indent) + line + "\n";

    if (isOpening && !isClosing && !isSelfClosing && !isVoid && !line.includes(`</${tagName}>`)) {
      indent++;
    }
  }

  return formatted.trim();
}

export function CodeMirrorEditor({
  value,
  onChange,
  isDark = false,
  className = "",
}: CodeMirrorEditorProps) {
  const [copied, setCopied] = React.useState(false);
  const [lineWrap, setLineWrap] = React.useState(true);

  const handleFormat = () => {
    try {
      const formatted = formatHtml(value);
      onChange(formatted);
    } catch (err) {
      console.warn("Format code error:", err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative flex flex-col h-full rounded-2xl border border-border/80 overflow-hidden bg-background shadow-xs ${className}`}>
      {/* Editor Top Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border/70 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="font-semibold text-muted-foreground">HTML / CSS SANDBOX</span>
          <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">
            (Tự do dùng inline style &amp; thẻ style)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setLineWrap((prev) => !prev)}
            className="h-7 px-2 text-[11px] rounded-lg text-muted-foreground hover:text-foreground"
            title="Bật/Tắt xuống dòng tự động"
          >
            <WrapText className="size-3.5 mr-1" />
            <span>Wrap: {lineWrap ? "Bật" : "Tắt"}</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleFormat}
            className="h-7 px-2 text-[11px] rounded-lg text-muted-foreground hover:text-foreground hover:bg-orange-500/10 hover:text-orange-600"
            title="Tự động làm đẹp code"
          >
            <Wand2 className="size-3.5 mr-1 text-orange-500" />
            <span>Format Code</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-[11px] rounded-lg text-muted-foreground hover:text-foreground"
            title="Sao chép toàn bộ HTML"
          >
            {copied ? (
              <>
                <Check className="size-3.5 mr-1 text-emerald-500" />
                <span className="text-emerald-600">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 mr-1" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* CodeMirror Surface */}
      <div className="flex-1 overflow-auto text-sm font-mono">
        <CodeMirror
          value={value}
          height="100%"
          extensions={[html({ matchClosingTags: true, autoCloseTags: true })]}
          theme={isDark ? oneDark : undefined}
          onChange={(val) => onChange(val)}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
          style={{ height: "100%", fontSize: "13px" }}
        />
      </div>
    </div>
  );
}

