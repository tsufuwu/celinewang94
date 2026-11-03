"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  ExternalLink,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { compressImageToWebP, blobToBase64 } from "@/lib/client-image-compressor";
import {
  createOrUpdateStory,
  deleteStory,
  type AdminStoryItem,
} from "@/app/admin/actions";

interface StoryManagerProps {
  initialStories: AdminStoryItem[];
}

export function StoryManager({ initialStories }: StoryManagerProps) {
  const [stories, setStories] = React.useState<AdminStoryItem[]>(initialStories);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingStory, setEditingStory] = React.useState<AdminStoryItem | null>(null);

  // Form states
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [status, setStatus] = React.useState<"ONGOING" | "COMPLETED" | "DROPPED">("ONGOING");
  const [tags, setTags] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [coverUrl, setCoverUrl] = React.useState("");
  const [coverPreview, setCoverPreview] = React.useState<string | null>(null);

  // Client-compressed WebP Blob
  const [compressedWebpBlob, setCompressedWebpBlob] = React.useState<Blob | null>(null);
  const [compressionInfo, setCompressionInfo] = React.useState<string | null>(null);

  const [isPending, startTransition] = React.useTransition();
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingStory) {
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

  const openCreateModal = () => {
    setEditingStory(null);
    setTitle("");
    setSlug("");
    setAuthor("");
    setStatus("ONGOING");
    setTags("");
    setDescription("");
    setCoverUrl("");
    setCoverPreview(null);
    setCompressedWebpBlob(null);
    setCompressionInfo(null);
    setFeedback(null);
    setIsModalOpen(true);
  };

  const openEditModal = (story: AdminStoryItem) => {
    setEditingStory(story);
    setTitle(story.title);
    setSlug(story.slug);
    setAuthor(story.author);
    setStatus(story.status);
    setTags(story.tags.join(", "));
    setDescription(story.description || "");
    setCoverUrl(story.coverUrl || "");
    setCoverPreview(story.coverUrl);
    setCompressedWebpBlob(null);
    setCompressionInfo(null);
    setFeedback(null);
    setIsModalOpen(true);
  };

  // Requirement 4: Compress image to .webp using Web Canvas API in browser
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const originalSizeKb = (file.size / 1024).toFixed(1);
      // Canvas WebP compression in browser (600px width is ideal for book covers)
      const webpBlob = await compressImageToWebP(file, 600, 0.82);
      const compressedSizeKb = (webpBlob.size / 1024).toFixed(1);

      setCompressedWebpBlob(webpBlob);
      setCompressionInfo(
        `Đã nén Web Canvas API: ${originalSizeKb} KB ➜ ${compressedSizeKb} KB (.webp)`
      );

      // Convert to Base64 data URL immediately for reliable preview and instant fallback
      const base64Url = await blobToBase64(webpBlob);
      setCoverPreview(base64Url);
      setCoverUrl(base64Url);
    } catch (err) {
      console.error("Canvas compression error:", err);
      alert("Lỗi nén ảnh qua Web Canvas API. Vui lòng thử lại với file khác.");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (editingStory) {
      formData.set("id", editingStory.id);
    }

    startTransition(async () => {
      try {
        let finalCoverUrl = coverUrl;

        // If client compressed a WebP blob, upload it to Cloudflare R2 / API
        if (compressedWebpBlob) {
          try {
            const uploadData = new FormData();
            uploadData.set("file", compressedWebpBlob, `${slug}.webp`);
            uploadData.set("slug", slug || "cover");

            const res = await fetch("/api/upload/cover", {
              method: "POST",
              body: uploadData,
            });

            if (res.ok) {
              const uploadResult = await res.json();
              if (uploadResult.success && uploadResult.url) {
                finalCoverUrl = uploadResult.url;
              }
            }
          } catch (uploadErr) {
            console.warn("Cover upload API error, fallback to client Base64:", uploadErr);
          }

          // If upload to R2 wasn't available, guarantee we use the compressed Base64 WebP!
          if (!finalCoverUrl || finalCoverUrl === editingStory?.coverUrl) {
            finalCoverUrl = await blobToBase64(compressedWebpBlob);
          }
        }

        formData.set("coverUrl", finalCoverUrl);

        const res = await createOrUpdateStory(formData);
        if (res.success) {
          setFeedback({ type: "success", text: res.message });
          setTimeout(() => {
            setIsModalOpen(false);
            window.location.reload();
          }, 1000);
        } else {
          setFeedback({ type: "error", text: res.message });
        }
      } catch (err: unknown) {
        setFeedback({ type: "error", text: (err as Error)?.message || "Lỗi lưu dữ liệu." });
      }
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bộ truyện "${title}"? Mọi chương truyện liên quan cũng sẽ bị xóa.`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteStory(id);
      if (res.success) {
        setStories((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert(res.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h2 className="font-serif text-2xl font-medium text-foreground">
            Quản Lý Tác Phẩm
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dữ liệu lưu trên <strong>Cloudflare D1</strong>, ảnh bìa tự nén <strong>Web Canvas API .webp</strong> và đẩy lên <strong>Cloudflare R2</strong>.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="rounded-xl text-xs h-9 px-4 flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="size-4" />
          <span>Thêm truyện mới</span>
        </Button>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stories.map((story) => {
          const isCompleted = story.status === "COMPLETED";
          return (
            <div
              key={story.id}
              className="p-4 rounded-2xl bg-card border border-border/70 hover:border-border shadow-xs flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex gap-3.5 mb-3">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-28 shrink-0 rounded-xl overflow-hidden bg-muted border border-border/70 shadow-xs">
                    {story.coverUrl ? (
                      <Image
                        src={story.coverUrl}
                        alt={story.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <BookOpen className="size-6" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-2 py-0.5 rounded-full mb-1.5 ${
                        isCompleted
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300"
                          : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300"
                      }`}
                    >
                      {isCompleted ? "Hoàn thành" : "Đang tiến hành"}
                    </Badge>
                    <h3 className="font-serif text-base font-medium text-foreground truncate mb-0.5" title={story.title}>
                      {story.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mb-1">
                      Tác giả: <span className="text-foreground">{story.author}</span>
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      {story._count?.chapters || 0} chương • {story._count?.reviews || 0} đánh giá
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {story.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                <Link
                  href={`/truyen/${story.slug}`}
                  target="_blank"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono text-[11px]"
                >
                  <ExternalLink className="size-3" />
                  <span>Xem trang</span>
                </Link>

                <div className="flex items-center gap-1">
                  <Link href={`/admin/editor?storyId=${story.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/40"
                      title="Mở trong Studio Editor"
                    >
                      <Sparkles className="size-3 mr-1 text-orange-500" />
                      <span>Studio</span>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(story)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="size-3 mr-1" />
                    <span>Sửa</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(story.id, story.title)}
                    className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="size-3 mr-1" />
                    <span>Xóa</span>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal / Dialog Form for Create & Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-card border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border/60 mb-5">
              <h3 className="font-serif text-xl font-medium text-foreground">
                {editingStory ? "Chỉnh Sửa Bộ Truyện" : "Thêm Bộ Truyện Mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
                  feedback.type === "success"
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="size-4 shrink-0 text-rose-600" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Tên truyện <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="title"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Ví dụ: Tiệm Sách Cũ Lúc Nửa Đêm..."
                    className="h-9 rounded-xl text-xs bg-background border-border/80"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Đường dẫn (Slug) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="slug"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="tiem-sach-cu-luc-nua-dem"
                    className="h-9 rounded-xl text-xs font-mono bg-background border-border/80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Author */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Tác giả <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="author"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Tên tác giả hoặc dịch giả..."
                    className="h-9 rounded-xl text-xs bg-background border-border/80"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Trạng thái
                  </label>
                  <select
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "ONGOING" | "COMPLETED" | "DROPPED")}
                    className="w-full h-9 rounded-xl text-xs px-3 bg-background border border-border/80 text-foreground"
                  >
                    <option value="ONGOING">Đang tiến hành (ONGOING)</option>
                    <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
                    <option value="DROPPED">Tạm dừng (DROPPED)</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Thể loại / Tags (cách nhau bằng dấu phẩy)
                </label>
                <Input
                  name="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Chữa lành, Đời thường, Kỳ ảo..."
                  className="h-9 rounded-xl text-xs bg-background border-border/80"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Tóm tắt / Giới thiệu tác phẩm
                </label>
                <Textarea
                  name="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Vài dòng giới thiệu ngắn gọn về câu chuyện..."
                  className="rounded-xl text-xs bg-background border-border/80 resize-none leading-relaxed"
                />
              </div>

              {/* Cover Image Upload via Web Canvas API */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-medium text-foreground">
                    Ảnh bìa truyện (Nén Web Canvas API ➜ Cloudflare R2)
                  </span>
                  {compressionInfo && (
                    <Badge variant="outline" className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border-emerald-300">
                      {compressionInfo}
                    </Badge>
                  )}
                </div>

                <div className="flex items-start gap-4">
                  {/* Cover preview */}
                  <div className="relative w-20 h-28 shrink-0 rounded-xl overflow-hidden bg-background border border-border/80 shadow-xs flex items-center justify-center text-muted-foreground">
                    {coverPreview ? (
                      <Image
                        src={coverPreview}
                        alt="Preview"
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <Upload className="size-6 text-muted-foreground/60" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                        Chọn ảnh từ máy (Tự động nén WebP ngay trên trình duyệt):
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="text-xs text-muted-foreground file:mr-2.5 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-secondary file:text-foreground hover:file:bg-secondary/80 cursor-pointer"
                      />
                    </div>

                    <div className="pt-1">
                      <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                        Hoặc nhập liên kết ảnh trực tiếp:
                      </label>
                      <Input
                        name="coverUrl"
                        value={coverUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCoverUrl(val);
                          setCompressedWebpBlob(null);
                          if (val.startsWith("http") || val.startsWith("data:")) {
                            setCoverPreview(val);
                          }
                        }}
                        placeholder="https://..."
                        className="h-8 text-xs rounded-xl bg-background border-border/80"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl text-xs h-9"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl text-xs h-9 px-5 shadow-xs"
                >
                  {isPending ? "Đang nén & lưu..." : editingStory ? "Lưu thay đổi" : "Tạo truyện"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
