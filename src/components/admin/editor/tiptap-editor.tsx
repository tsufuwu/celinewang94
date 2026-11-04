"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Minus,
  HelpCircle,
  EyeOff,
  Columns,
  Music,
  Film,
  Type,
  Heading1,
  Heading2,
  Heading3,
  X,
  Sparkles,
} from "lucide-react";

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  className?: string;
}

export function TiptapEditor({ value, onChange, className = "" }: TiptapEditorProps) {
  // Footnote Modal States
  const [footnoteModalOpen, setFootnoteModalOpen] = React.useState(false);
  const [footnoteTargetWord, setFootnoteTargetWord] = React.useState("");
  const [footnoteExplanation, setFootnoteExplanation] = React.useState("");
  const selectionRangeRef = React.useRef<{ from: number; to: number } | null>(null);

  // Track the last value emitted or synced to prevent circular setContent destruction
  const lastEmittedValueRef = React.useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value || "<p>Bắt đầu viết tác phẩm của bạn...</p>",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEmittedValueRef.current = html;
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-stone dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-6 font-serif leading-relaxed text-base text-foreground cursor-text select-text",
      },
    },
  });

  // Sync external changes (e.g. from switching chapters or Code mode)
  React.useEffect(() => {
    if (!editor) return;

    // If the value in props matches what this Tiptap editor just emitted, IGNORE completely.
    // This prevents setContent from destroying DOM and cursor on internal edits or modal close!
    if (value === lastEmittedValueRef.current) {
      return;
    }

    // Only update if value changed from an OUTSIDE source (e.g. switching chapter/story)
    lastEmittedValueRef.current = value;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
  }, [value, editor]);

  // Open Footnote modal: captures current selected text and cursor range immediately
  const handleOpenFootnoteDialog = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to).trim();

    selectionRangeRef.current = { from, to };
    setFootnoteTargetWord(selectedText);
    setFootnoteExplanation("");
    setFootnoteModalOpen(true);
  };

  // Submit Footnote insertion: wraps as [cụm từ][[lời giải thích]]
  const handleSubmitFootnote = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!editor) return;
    const note = footnoteExplanation.trim();
    if (!note) return;

    const target = footnoteTargetWord.trim() || "chú thích";
    const range = selectionRangeRef.current;

    // Standard shortcode format used by ChapterReader: [cụm từ][[lời giải thích]]
    const footnoteString = `[${target}][[${note}]] `;

    if (range && range.from !== range.to) {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: range.from, to: range.to })
        .insertContent(footnoteString)
        .run();
    } else {
      editor
        .chain()
        .focus()
        .insertContent(footnoteString)
        .run();
    }

    // Immediately record emitted HTML so the effect ignores the upcoming parent re-render
    const newHtml = editor.getHTML();
    lastEmittedValueRef.current = newHtml;
    onChange(newHtml);

    setFootnoteModalOpen(false);
    setFootnoteTargetWord("");
    setFootnoteExplanation("");
    selectionRangeRef.current = null;

    // Return focus to editor cleanly so text selection and cursor remain 100% responsive
    requestAnimationFrame(() => {
      if (editor && !editor.isDestroyed) {
        editor.commands.focus();
      }
    });
  };

  // Hotkey listener for footnote (Alt+N or Ctrl+Shift+F)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === "n") || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f")) {
        e.preventDefault();
        handleOpenFootnoteDialog();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  if (!editor) {
    return <div className="p-8 text-center text-muted-foreground text-sm">Đang tải trình soạn thảo Visual...</div>;
  }

  // Insert custom HTML block / shortcode
  const insertCustomHtml = (htmlContent: string) => {
    editor.chain().focus().insertContent(htmlContent).run();
  };

  return (
    <div className={`flex flex-col h-full rounded-2xl border border-border/80 overflow-hidden bg-background shadow-xs select-text ${className}`}>
      {/* Sticky Top Formatting Toolbar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 p-2 bg-muted/40 border-b border-border/70 backdrop-blur-xs text-xs select-none">
        {/* Headings */}
        <div className="flex items-center gap-0.5 border-r border-border/60 pr-1.5 mr-1">
          <Button
            type="button"
            variant={editor.isActive("paragraph") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className="size-7 p-0 rounded-lg"
            title="Đoạn văn thường"
          >
            <Type className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className="size-7 p-0 rounded-lg"
            title="Tiêu đề lớn (H1)"
          >
            <Heading1 className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className="size-7 p-0 rounded-lg"
            title="Tiêu đề vừa (H2)"
          >
            <Heading2 className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className="size-7 p-0 rounded-lg"
            title="Tiêu đề nhỏ (H3)"
          >
            <Heading3 className="size-3.5" />
          </Button>
        </div>

        {/* Basic formatting: Bold, Italic, Underline, Strike */}
        <div className="flex items-center gap-0.5 border-r border-border/60 pr-1.5 mr-1">
          <Button
            type="button"
            variant={editor.isActive("bold") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className="size-7 p-0 rounded-lg"
            title="In đậm (Ctrl+B)"
          >
            <Bold className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("italic") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className="size-7 p-0 rounded-lg"
            title="In nghiêng (Ctrl+I)"
          >
            <Italic className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("underline") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className="size-7 p-0 rounded-lg"
            title="Gạch chân (Ctrl+U)"
          >
            <UnderlineIcon className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("strike") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className="size-7 p-0 rounded-lg"
            title="Gạch ngang"
          >
            <Strikethrough className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("highlight") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHighlight({ color: "#fed7aa" }).run()}
            className="size-7 p-0 rounded-lg text-orange-600"
            title="Tô sáng màu cam nhạt"
          >
            <Highlighter className="size-3.5" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 border-r border-border/60 pr-1.5 mr-1">
          <Button
            type="button"
            variant={editor.isActive({ textAlign: "left" }) ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className="size-7 p-0 rounded-lg"
            title="Căn trái"
          >
            <AlignLeft className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: "center" }) ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className="size-7 p-0 rounded-lg"
            title="Căn giữa"
          >
            <AlignCenter className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: "right" }) ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className="size-7 p-0 rounded-lg"
            title="Căn phải"
          >
            <AlignRight className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: "justify" }) ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className="size-7 p-0 rounded-lg"
            title="Căn đều 2 bên"
          >
            <AlignJustify className="size-3.5" />
          </Button>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center gap-0.5 border-r border-border/60 pr-1.5 mr-1">
          <Button
            type="button"
            variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className="size-7 p-0 rounded-lg"
            title="Danh sách dấu chấm"
          >
            <List className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className="size-7 p-0 rounded-lg"
            title="Danh sách số thứ tự"
          >
            <ListOrdered className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className="size-7 p-0 rounded-lg"
            title="Trích dẫn điện ảnh"
          >
            <Quote className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="size-7 p-0 rounded-lg"
            title="Đường kẻ ngang phân cách"
          >
            <Minus className="size-3.5" />
          </Button>
        </div>

        {/* Studio Elements: Inline Footnote, Spoiler, Shortcodes */}
        <div className="flex items-center gap-1.5">
          {/* Prominent Footnote Button */}
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleOpenFootnoteDialog}
            className="h-7 px-2.5 text-xs rounded-lg bg-[#E07B4C] hover:bg-[#DC7648] text-white font-bold shadow-xs flex items-center gap-1.5 transition-all"
            title="Bôi đen một từ/cụm từ rồi bấm nút này để thêm chú thích nổi (Phím tắt: Alt+N)"
          >
            <HelpCircle className="size-3.5" />
            <span>Thêm Chú Thích</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              insertCustomHtml(
                `\n[spoiler title="⚠️ CẢNH BÁO / DÒ MÌN" mode="accordion"]\n<p>Nội dung ẩn hoặc cảnh báo nhạy cảm ở đây...</p>\n[/spoiler]\n`
              )
            }
            className="h-7 px-2 text-[11px] rounded-lg text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 font-medium"
            title="Chèn hộp ẩn nội dung / Spoil / Dò mìn"
          >
            <EyeOff className="size-3.5 mr-1 text-rose-500" />
            <span>Ẩn / Spoil</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              insertCustomHtml(
                `\n[muc_luc style="grid" from="1" to="48" title="🎞️ REEL 01: PHẦN THƯỢNG"]\n`
              )
            }
            className="h-7 px-2 text-[11px] rounded-lg text-muted-foreground hover:text-foreground font-mono"
            title="Chèn shortcode Mục lục lưới"
          >
            <Film className="size-3.5 mr-1 text-orange-500" />
            <span>[Mục lục]</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              insertCustomHtml(
                `\n[bgm src="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M" title="Background Music"]\n`
              )
            }
            className="h-7 px-2 text-[11px] rounded-lg text-muted-foreground hover:text-foreground font-mono"
            title="Chèn shortcode nghe nhạc BGM"
          >
            <Music className="size-3.5 mr-1 text-orange-500" />
            <span>[BGM]</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              insertCustomHtml(
                `\n<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">\n  <div><p>Cột 1...</p></div>\n  <div><p>Cột 2...</p></div>\n</div>\n`
              )
            }
            className="h-7 px-2 text-[11px] rounded-lg text-muted-foreground hover:text-foreground"
            title="Chia 2 cột văn bản"
          >
            <Columns className="size-3.5 mr-1" />
            <span>2 Cột</span>
          </Button>
        </div>
      </div>

      {/* Editor Content Area: Click to place cursor & Select text */}
      <div
        className="flex-1 overflow-y-auto cursor-text bg-background select-text p-2 sm:p-4"
        onClick={(e) => {
          if (!editor || !editor.view) return;
          if (e.target === e.currentTarget) {
            const pos = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
            if (pos) {
              editor.chain().focus().setTextSelection(pos.pos).run();
            } else {
              editor.commands.focus("end");
            }
          }
        }}
      >
        <EditorContent editor={editor} className="min-h-full cursor-text select-text focus:outline-none" />
      </div>

      {/* Footnote Insertion Modal */}
      {footnoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <form
            onSubmit={handleSubmitFootnote}
            className="w-full max-w-md bg-background rounded-2xl border-2 border-[#2B2623] p-5 shadow-[4px_6px_0px_#2B2623] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div className="flex items-center gap-2 text-foreground font-serif text-lg font-bold">
                <HelpCircle className="size-5 text-[#E07B4C]" />
                <h3>Thêm Chú Thích Nổi</h3>
              </div>
              <button
                type="button"
                onClick={() => setFootnoteModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Word/phrase to annotate */}
              <div>
                <label className="block text-xs font-bold text-[#5C5146] dark:text-[#C4B9AD] mb-1">
                  Từ hoặc cụm từ được chú thích:
                </label>
                <input
                  type="text"
                  value={footnoteTargetWord}
                  onChange={(e) => setFootnoteTargetWord(e.target.value)}
                  placeholder="Ví dụ: Lưỡi trượt, Cú nhảy Axel..."
                  className="w-full h-9 px-3 rounded-xl border border-border bg-muted/20 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#E07B4C]"
                  autoFocus={!footnoteTargetWord}
                />
              </div>

              {/* Explanation Note */}
              <div>
                <label className="block text-xs font-bold text-[#5C5146] dark:text-[#C4B9AD] mb-1">
                  Nội dung giải thích / chú thích:
                </label>
                <textarea
                  rows={3}
                  value={footnoteExplanation}
                  onChange={(e) => setFootnoteExplanation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitFootnote();
                    }
                  }}
                  placeholder="Nhập giải nghĩa chi tiết... (Gợi ý: Nhấn Enter để lưu)"
                  className="w-full p-3 rounded-xl border border-border bg-muted/20 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-[#E07B4C] resize-none leading-relaxed"
                  autoFocus={!!footnoteTargetWord}
                />
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-[#5C5146] dark:text-[#E0D8D0] flex items-start gap-2">
                <Sparkles className="size-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Độc giả trên máy tính khi rê chuột vào cụm từ sẽ nổi bong bóng giải thích. Trên điện thoại chạm vào sẽ mở khung giải nghĩa tiện lợi.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFootnoteModalOpen(false)}
                className="rounded-xl text-xs h-9 px-4"
              >
                Hủy (Esc)
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!footnoteExplanation.trim()}
                className="rounded-xl text-xs h-9 px-4 bg-[#E07B4C] hover:bg-[#DC7648] text-white font-bold border border-[#2B2623]/20 shadow-xs"
              >
                Chèn chú thích (Enter)
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
