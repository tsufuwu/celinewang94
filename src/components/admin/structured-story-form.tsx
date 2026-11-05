"use client";

import * as React from "react";
import Image from "next/image";
import {
  BookOpen,
  Upload,
  X,
  Check,
  AlertCircle,
  HelpCircle,
  EyeOff,
  Quote,
  List,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Sparkles,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { compressImageToWebP, blobToBase64 } from "@/lib/client-image-compressor";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

export interface StructuredStoryData {
  id?: string;
  title: string;
  slug: string;
  author: string;
  status: "ONGOING" | "COMPLETED" | "DROPPED" | string;
  tags: string[];
  coverUrl?: string | null;
  description?: string | null; // Tóm tắt ngắn 1-2 câu
  contentHtml?: string | null; // Văn án chi tiết
}

interface StructuredStoryFormProps {
  initialData?: StructuredStoryData | null;
  onSuccess?: (savedStory: StructuredStoryData) => void;
  onCancel?: () => void;
  className?: string;
}

const POPULAR_TAGS = [
  "Đam mỹ",
  "Hiện đại",
  "Cường cường",
  "Thể thao",
  "Trượt băng",
  "Trượt tuyết",
  "Giới giải trí",
  "H văn",
  "HE",
  "Full",
  "Dịch",
  "Ngược",
  "Ngọt",
  "Chữa lành",
  "Niên hạ",
  "Đổi công",
  "1v1",
  "EABO",
  "ABO",
  "Cẩu huyết",
  "Sảng văn",
];

export function StructuredStoryForm({
  initialData,
  onSuccess,
  onCancel,
  className = "",
}: StructuredStoryFormProps) {
  // Basic Form States
  const [title, setTitle] = React.useState(initialData?.title || "");
  const [slug, setSlug] = React.useState(initialData?.slug || "");
  const [author, setAuthor] = React.useState(initialData?.author || "Celine Wang");
  const [status, setStatus] = React.useState<"ONGOING" | "COMPLETED" | "DROPPED">(
    (initialData?.status as "ONGOING" | "COMPLETED" | "DROPPED") || "ONGOING"
  );
  const [tags, setTags] = React.useState<string[]>(initialData?.tags || ["Đam mỹ", "Hiện đại"]);
  const [customTagInput, setCustomTagInput] = React.useState("");

  // Cover image states
  const [coverUrl, setCoverUrl] = React.useState(initialData?.coverUrl || "");
  const [compressedWebpBlob, setCompressedWebpBlob] = React.useState<Blob | null>(null);
  const [compressionInfo, setCompressionInfo] = React.useState<string | null>(null);

  // Short description / Note
  const [description, setDescription] = React.useState(initialData?.description || "");

  // Saving states
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Footnote modal inside Story Synopsis editor
  const [footnoteModalOpen, setFootnoteModalOpen] = React.useState(false);
  const [footnoteWord, setFootnoteWord] = React.useState("");
  const [footnoteNote, setFootnoteNote] = React.useState("");
  const selectionRangeRef = React.useRef<{ from: number; to: number } | null>(null);

  // Auto generate slug from title if new
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialData?.id) {
      const generated = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setSlug(generated);
    }
  };

  // Toggle Tag
  const handleToggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Add custom tag
  const handleAddCustomTag = (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = customTagInput.trim();
    if (clean && !tags.includes(clean)) {
      setTags((prev) => [...prev, clean]);
      setCustomTagInput("");
    }
  };

  // Image Upload and Canvas WebP Compression
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const origSize = (file.size / 1024).toFixed(1);
      const webpBlob = await compressImageToWebP(file, 600, 0.82);
      const newSize = (webpBlob.size / 1024).toFixed(1);
      setCompressedWebpBlob(webpBlob);
      setCompressionInfo(`Đã nén WebP: ${origSize} KB ➜ ${newSize} KB`);

      const base64Url = await blobToBase64(webpBlob);
      setCoverUrl(base64Url);
    } catch {
      alert("Lỗi nén ảnh qua Web Canvas API. Vui lòng chọn ảnh khác.");
    }
  };

  // Tiptap Rich Text Editor for Synopsis (Văn án)
  const synopsisEditor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Keep clean and avoid breaking layout
      }),
      Underline,
    ],
    content: initialData?.contentHtml || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose max-w-none focus:outline-none min-h-[220px] p-4 font-serif leading-relaxed text-sm text-[#2B2623] dark:text-[#FAF5EE] select-text cursor-text",
      },
      // Clean dirty pasted text from Word / Google Docs
      transformPastedHTML(html) {
        return html
          .replace(/style="[^"]*"/gi, "") // strip all inline font and background colors
          .replace(/class="[^"]*"/gi, "") // strip word classes
          .replace(/<span[^>]*>/gi, "")
          .replace(/<\/span>/gi, "");
      },
    },
  });

  // Handle Footnote in Synopsis
  const handleOpenFootnoteDialog = () => {
    if (!synopsisEditor) return;
    const { from, to } = synopsisEditor.state.selection;
    const selected = synopsisEditor.state.doc.textBetween(from, to).trim();
    selectionRangeRef.current = { from, to };
    setFootnoteWord(selected);
    setFootnoteNote("");
    setFootnoteModalOpen(true);
  };

  const handleSubmitFootnote = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!synopsisEditor || !footnoteNote.trim()) return;
    const target = footnoteWord.trim() || "chú thích";
    const footnoteString = `[${target}][[${footnoteNote.trim()}]] `;

    const range = selectionRangeRef.current;
    if (range && range.from !== range.to) {
      synopsisEditor
        .chain()
        .focus()
        .setTextSelection({ from: range.from, to: range.to })
        .insertContent(footnoteString)
        .run();
    } else {
      synopsisEditor.chain().focus().insertContent(footnoteString).run();
    }

    setFootnoteModalOpen(false);
    setFootnoteWord("");
    setFootnoteNote("");
    selectionRangeRef.current = null;
  };

  // Submit Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !author.trim()) {
      setFeedback({ type: "error", text: "Vui lòng nhập Tên truyện, Slug và Tác giả." });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      let finalCover = coverUrl;

      // Upload compressed WebP to R2 / upload API if new file chosen
      if (compressedWebpBlob) {
        try {
          const uploadData = new FormData();
          uploadData.set("file", compressedWebpBlob, `${slug}.webp`);
          uploadData.set("slug", slug || "cover");
          const upRes = await fetch("/api/upload/cover", {
            method: "POST",
            body: uploadData,
          });
          if (upRes.ok) {
            const upJson = await upRes.json();
            if (upJson.success && upJson.url) {
              finalCover = upJson.url;
            }
          }
        } catch {
          // Fallback to Base64
          if (!finalCover) {
            finalCover = await blobToBase64(compressedWebpBlob);
          }
        }
      }

      const synopsisHtml = synopsisEditor?.getHTML() || "";

      const resp = await fetch("/api/admin/save-story-full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initialData?.id,
          title: title.trim(),
          slug: slug.trim(),
          author: author.trim(),
          status,
          tags,
          coverUrl: finalCover,
          description: description.trim(),
          contentHtml: synopsisHtml,
        }),
      });

      const res = await resp.json();

      if (res.success) {
        setFeedback({ type: "success", text: res.message });
        if (onSuccess) {
          onSuccess({
            id: res.storyId || initialData?.id,
            title: title.trim(),
            slug: slug.trim(),
            author: author.trim(),
            status,
            tags,
            coverUrl: finalCover,
            description: description.trim(),
            contentHtml: synopsisHtml,
          });
        }
      } else {
        setFeedback({ type: "error", text: res.message || "Lỗi lưu dữ liệu." });
      }
    } catch (err: unknown) {
      setFeedback({ type: "error", text: `Lỗi kết nối máy chủ: ${(err as Error)?.message || String(err)}` });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className={`space-y-6 font-sans text-xs text-[#2B2623] dark:text-[#FAF5EE] ${className}`}
    >
      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3 rounded-2xl flex items-center gap-2 font-mono text-xs border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] ${
            feedback.type === "success"
              ? "bg-[#BDCEAF] text-[#2B2623]"
              : "bg-[#EBBAB5] text-[#2B2623]"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span className="font-bold">{feedback.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. THÔNG TIN CƠ BẢN: Tên, Slug, Tác giả, Trạng thái                      */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-[22px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[3px_4px_0px_#2B2623] space-y-4">
        <h4 className="font-serif font-bold text-base text-[#2B2623] dark:text-[#FAF5EE] flex items-center gap-2">
          <BookOpen className="size-4 text-[#E07B4C]" />
          <span>Thông Tin Cơ Bản Của Bộ Truyện</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tên truyện */}
          <div>
            <label className="block text-xs font-bold mb-1 text-[#5C5146] dark:text-[#C4B9AD]">
              Tên truyện <span className="text-[#E07B4C]">*</span>
            </label>
            <Input
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Ví dụ: Ôm Lấy Trọng Lực..."
              className="h-10 rounded-xl bg-white dark:bg-[#2A2420] border-2 border-[#2B2623] font-serif text-sm font-bold shadow-[1.5px_2px_0px_#2B2623] focus:outline-none"
            />
          </div>

          {/* Đường dẫn Slug */}
          <div>
            <label className="block text-xs font-bold mb-1 text-[#5C5146] dark:text-[#C4B9AD]">
              Đường dẫn (Slug) <span className="text-[#E07B4C]">*</span>
            </label>
            <Input
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="om-lay-trong-luc"
              className="h-10 rounded-xl bg-white dark:bg-[#2A2420] border-2 border-[#2B2623] font-mono text-xs font-bold shadow-[1.5px_2px_0px_#2B2623] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tác giả */}
          <div>
            <label className="block text-xs font-bold mb-1 text-[#5C5146] dark:text-[#C4B9AD]">
              Tác giả gốc <span className="text-[#E07B4C]">*</span>
            </label>
            <Input
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="larivegauche, Trĩ Sở..."
              className="h-10 rounded-xl bg-white dark:bg-[#2A2420] border-2 border-[#2B2623] text-xs font-bold shadow-[1.5px_2px_0px_#2B2623]"
            />
          </div>

          {/* Tình trạng */}
          <div>
            <label className="block text-xs font-bold mb-1 text-[#5C5146] dark:text-[#C4B9AD]">
              Tình trạng tác phẩm
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "ONGOING" | "COMPLETED" | "DROPPED")}
              className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#2A2420] border-2 border-[#2B2623] text-xs font-bold font-mono shadow-[1.5px_2px_0px_#2B2623] focus:outline-none"
            >
              <option value="ONGOING">Đang tiến hành (Đang cook)</option>
              <option value="COMPLETED">Đã hoàn thành (Full trọn bộ)</option>
              <option value="DROPPED">Tạm ngưng</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ẢNH BÌA SÁCH (Tự nén WebP Canvas + Link dự phòng)                     */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-[22px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[3px_4px_0px_#2B2623] space-y-4">
        <h4 className="font-serif font-bold text-base text-[#2B2623] dark:text-[#FAF5EE] flex items-center gap-2">
          <Upload className="size-4 text-[#E07B4C]" />
          <span>Ảnh Bìa Sách (Book Cover)</span>
        </h4>

        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {/* Cover Preview with Spine Curve */}
          <div className="w-28 h-36 shrink-0 rounded-[4px_14px_14px_4px] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] overflow-hidden bg-[#EFE8DE] dark:bg-[#2A2420] relative">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt="Bìa sách"
                fill
                sizes="120px"
                unoptimized={coverUrl.startsWith("data:")}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-2 text-center text-[10px]">
                <BookOpen className="size-6 text-muted-foreground/60 mb-1" />
                <span>Chưa có bìa</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3 w-full">
            {/* File Upload Button */}
            <div>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#2A2420] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] font-bold font-mono text-xs cursor-pointer hover:bg-[#E5DDD2] transition-colors">
                <Upload className="size-3.5 text-[#E07B4C]" />
                <span>Tải ảnh lên từ thiết bị (Tự nén WebP)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
              {compressionInfo && (
                <p className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 mt-1.5 font-bold">
                  ✓ {compressionInfo}
                </p>
              )}
            </div>

            {/* Direct Image URL input */}
            <div>
              <label className="block text-[11px] font-bold text-[#5C5146] dark:text-[#C4B9AD] mb-1">
                Hoặc dán trực tiếp đường dẫn ảnh (URL):
              </label>
              <Input
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://i.pinimg.com/... hoặc link ảnh WordPress"
                className="h-9 rounded-xl bg-white dark:bg-[#2A2420] border-2 border-[#2B2623] font-mono text-xs shadow-[1.5px_2px_0px_#2B2623]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. THỂ LOẠI / TAGS (Bộ chọn viên thuốc nhanh + Gõ tùy chỉnh)             */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-[22px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[3px_4px_0px_#2B2623] space-y-3">
        <h4 className="font-serif font-bold text-base text-[#2B2623] dark:text-[#FAF5EE] flex items-center gap-2">
          <Sparkles className="size-4 text-[#E07B4C]" />
          <span>Thể Loại / Nhãn Tag (Bấm viên thuốc chọn nhanh)</span>
        </h4>

        {/* Selected Tags Display */}
        <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2.5 rounded-xl bg-white dark:bg-[#2A2420] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623]">
          {tags.length > 0 ? (
            tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-[#E07B4C] text-white border border-[#2B2623]/30 shadow-xs"
              >
                <span>#{t}</span>
                <button
                  type="button"
                  onClick={() => handleToggleTag(t)}
                  className="hover:text-red-200"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">Chưa chọn thẻ tag nào. Bấm các viên thuốc bên dưới để thêm.</span>
          )}
        </div>

        {/* Quick Tag Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {POPULAR_TAGS.map((tag) => {
            const isSelected = tags.includes(tag);
            return (
              <button
                type="button"
                key={tag}
                onClick={() => handleToggleTag(tag)}
                className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl border-2 border-[#2B2623] shadow-[1px_1.5px_0px_#2B2623] transition-all active:scale-95 ${
                  isSelected
                    ? "bg-[#BDCEAF] text-[#2B2623]"
                    : "bg-white dark:bg-[#2A2420] text-[#5C5146] hover:bg-[#E5DDD2]"
                }`}
              >
                {isSelected ? `✓ #${tag}` : `+ #${tag}`}
              </button>
            );
          })}
        </div>

        {/* Add Custom Tag */}
        <div className="flex gap-2 pt-1 max-w-sm">
          <Input
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustomTag();
              }
            }}
            placeholder="Gõ nhãn mới khác..."
            className="h-8 rounded-xl bg-white dark:bg-[#2A2420] border-2 border-[#2B2623] text-xs font-mono"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddCustomTag}
            className="h-8 px-3 rounded-xl bg-[#FAF5EE] hover:bg-[#E5DDD2] text-[#2B2623] border-2 border-[#2B2623] shadow-[1px_1.5px_0px_#2B2623] font-bold font-mono text-xs"
          >
            Thêm
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TÓM TẮT NGẮN & LƯU Ý / GỢI Ý PASS                                     */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-[22px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[3px_4px_0px_#2B2623] space-y-3">
        <h4 className="font-serif font-bold text-base text-[#2B2623] dark:text-[#FAF5EE] flex items-center gap-2">
          <Quote className="size-4 text-[#E07B4C]" />
          <span>Tóm Tắt Ngắn &amp; Lưu Ý / Dò Mìn / Hướng Dẫn Pass</span>
        </h4>

        <div>
          <label className="block text-xs font-bold mb-1 text-[#5C5146] dark:text-[#C4B9AD]">
            Tóm tắt ngắn (1-2 câu hiển thị ở thẻ trang chủ &amp; khung tóm tắt):
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ví dụ: Bộ truyện trượt băng nghệ thuật gắn bó sâu sắc nhất với nhà Cam..."
            className="w-full p-2.5 rounded-xl bg-white dark:bg-[#2A2420] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] font-sans text-xs focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. VĂN ÁN CHI TIẾT (RICH TEXT CHUẨN: BOLD, ITALIC, QUOTE, SPOILER, NOTE)  */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-[22px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[3px_4px_0px_#2B2623] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#2B2623]/15">
          <h4 className="font-serif font-bold text-base text-[#2B2623] dark:text-[#FAF5EE] flex items-center gap-2">
            <Sparkles className="size-4 text-[#E07B4C]" />
            <span>Văn Án / Giới Thiệu Chi Tiết</span>
          </h4>
          <span className="text-[10px] font-mono text-[#5C5146] dark:text-[#C4B9AD]">
            * Tự động lọc bỏ rác font/màu nền khi dán từ Word &amp; Google Docs
          </span>
        </div>

        {/* Minimal Rich Text Toolbar */}
        {synopsisEditor && (
          <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl bg-white dark:bg-[#2A2420] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623]">
            <Button
              type="button"
              variant={synopsisEditor.isActive("bold") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => synopsisEditor.chain().focus().toggleBold().run()}
              className="size-7 p-0 rounded-lg"
              title="In đậm (Ctrl+B)"
            >
              <Bold className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant={synopsisEditor.isActive("italic") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => synopsisEditor.chain().focus().toggleItalic().run()}
              className="size-7 p-0 rounded-lg"
              title="In nghiêng (Ctrl+I)"
            >
              <Italic className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant={synopsisEditor.isActive("underline") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => synopsisEditor.chain().focus().toggleUnderline().run()}
              className="size-7 p-0 rounded-lg"
              title="Gạch chân (Ctrl+U)"
            >
              <UnderlineIcon className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant={synopsisEditor.isActive("bulletList") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => synopsisEditor.chain().focus().toggleBulletList().run()}
              className="size-7 p-0 rounded-lg"
              title="Danh sách gạch đầu dòng"
            >
              <List className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant={synopsisEditor.isActive("blockquote") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => synopsisEditor.chain().focus().toggleBlockquote().run()}
              className="size-7 p-0 rounded-lg"
              title="Trích dẫn"
            >
              <Quote className="size-3.5" />
            </Button>

            <div className="h-4 w-px bg-border/80 mx-1" />

            {/* Footnote button */}
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleOpenFootnoteDialog}
              className="h-7 px-2 text-[11px] rounded-lg bg-[#E07B4C] hover:bg-[#DC7648] text-white font-bold shadow-xs flex items-center gap-1"
              title="Bôi đen từ rồi bấm để chèn chú thích nổi"
            >
              <HelpCircle className="size-3" />
              <span>Chú thích</span>
            </Button>

            {/* Spoiler button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                synopsisEditor
                  .chain()
                  .focus()
                  .insertContent(`\n[spoiler title="⚠️ CẢNH BÁO / DÒ MÌN" mode="accordion"]\n<p>Nội dung ẩn hoặc cảnh báo nhạy cảm...</p>\n[/spoiler]\n`)
                  .run()
              }
              className="h-7 px-2 text-[11px] rounded-lg text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 font-bold"
              title="Chèn hộp cảnh báo/spoil ẩn"
            >
              <EyeOff className="size-3 mr-1" />
              <span>Ẩn / Spoil</span>
            </Button>
          </div>
        )}

        {/* Editor Content Area */}
        <div className="rounded-xl bg-white dark:bg-[#2A2420] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] overflow-hidden min-h-[220px]">
          <EditorContent editor={synopsisEditor} />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. HÀNH ĐỘNG: LƯU THÔNG TIN TRUYỆN                                       */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="h-10 px-5 rounded-xl text-xs font-mono font-bold"
          >
            Hủy
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSaving}
          className="h-10 px-6 rounded-xl bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] active:translate-x-px active:translate-y-px active:shadow-none font-mono font-bold text-xs flex items-center gap-2"
        >
          <Save className="size-4" />
          <span>{isSaving ? "Đang lưu..." : "Lưu Thông Tin Truyện"}</span>
        </Button>
      </div>

      {/* Footnote Modal */}
      {footnoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FAF5EE] dark:bg-[#1F1B18] rounded-2xl border-2 border-[#2B2623] p-5 shadow-[4px_6px_0px_#2B2623] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B2623]/20">
              <h4 className="font-serif font-bold text-base text-[#2B2623] dark:text-[#FAF5EE] flex items-center gap-2">
                <HelpCircle className="size-4 text-[#E07B4C]" />
                <span>Thêm Chú Thích Nổi</span>
              </h4>
              <button
                type="button"
                onClick={() => setFootnoteModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1 text-[#5C5146] dark:text-[#C4B9AD]">
                  Từ hoặc cụm từ được chú thích:
                </label>
                <input
                  type="text"
                  value={footnoteWord}
                  onChange={(e) => setFootnoteWord(e.target.value)}
                  placeholder="Ví dụ: Lưỡi trượt..."
                  className="w-full h-9 px-3 rounded-xl border-2 border-[#2B2623] bg-white dark:bg-[#2A2420] text-xs font-bold text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-[#5C5146] dark:text-[#C4B9AD]">
                  Nội dung giải thích:
                </label>
                <textarea
                  rows={3}
                  value={footnoteNote}
                  onChange={(e) => setFootnoteNote(e.target.value)}
                  placeholder="Nhập giải nghĩa..."
                  className="w-full p-2.5 rounded-xl border-2 border-[#2B2623] bg-white dark:bg-[#2A2420] text-xs text-foreground focus:outline-none resize-none leading-relaxed"
                  autoFocus
                />
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
                Hủy
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSubmitFootnote}
                disabled={!footnoteNote.trim()}
                className="rounded-xl text-xs h-9 px-5 bg-[#E07B4C] hover:bg-[#DC7648] text-white font-bold border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623]"
              >
                Chèn Chú Thích
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
