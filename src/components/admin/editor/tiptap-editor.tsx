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
} from "lucide-react";

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  className?: string;
}

export function TiptapEditor({ value, onChange, className = "" }: TiptapEditorProps) {
  const [footnoteDialogOpen, setFootnoteDialogOpen] = React.useState(false);
  const [footnoteNote, setFootnoteNote] = React.useState("");

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
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-stone dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-6 font-serif leading-relaxed text-base text-foreground",
      },
    },
  });

  // Sync external changes (e.g. from Code mode or template insertion)
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="p-8 text-center text-muted-foreground text-sm">Đang tải trình soạn thảo Visual...</div>;
  }

  // Insert custom HTML block / shortcode
  const insertCustomHtml = (htmlContent: string) => {
    editor.chain().focus().insertContent(htmlContent).run();
  };

  // Insert Inline Footnote: word[[note]]
  const handleInsertFootnote = () => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to) || "Từ cần chú thích";
    if (!footnoteNote.trim()) return;

    const footnoteTag = `${selectedText}[[${footnoteNote.trim()}]]`;
    editor.chain().focus().insertContent(footnoteTag).run();
    setFootnoteNote("");
    setFootnoteDialogOpen(false);
  };

  return (
    <div className={`flex flex-col h-full rounded-2xl border border-border/80 overflow-hidden bg-background shadow-xs ${className}`}>
      {/* Sticky Top Formatting Toolbar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 p-2 bg-muted/40 border-b border-border/70 backdrop-blur-xs text-xs">
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
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setFootnoteDialogOpen(true)}
            className="h-7 px-2 text-[11px] rounded-lg text-orange-600 bg-orange-500/10 hover:bg-orange-500/20 font-medium"
            title="Chèn chú thích nổi (Inline Footnote)"
          >
            <HelpCircle className="size-3.5 mr-1 text-orange-500" />
            <span>Chú thích</span>
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

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Footnote Insertion Dialog */}
      {footnoteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md bg-background rounded-2xl border border-border p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-foreground font-serif text-lg font-bold">
              <HelpCircle className="size-5 text-orange-500" />
              <h3>Tạo Chú Thích Nổi (Inline Footnote)</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Nhập nội dung giải thích cho từ/cụm từ đang chọn. Trên máy tính khi rê chuột vào sẽ nổi tooltip, trên điện thoại khi chạm vào sẽ mở khung giải nghĩa.
            </p>

            <textarea
              rows={3}
              value={footnoteNote}
              onChange={(e) => setFootnoteNote(e.target.value)}
              placeholder="Ví dụ: Cú nhảy duy nhất cất cánh về phía trước trong trượt băng nghệ thuật..."
              className="w-full p-3 rounded-xl border border-border bg-muted/20 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
              autoFocus
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFootnoteDialogOpen(false)}
                className="rounded-xl text-xs h-8"
              >
                Hủy
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleInsertFootnote}
                disabled={!footnoteNote.trim()}
                className="rounded-xl text-xs h-8 bg-orange-600 hover:bg-orange-700 text-white"
              >
                Chèn chú thích
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

