"use client";

import * as React from "react";
import { PRESET_TEMPLATES, PresetTemplate } from "@/lib/editor-preset-templates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Clapperboard,
  Users,
  AlertTriangle,
  Music,
  BookOpen,
  ListTree,
  X,
  Check,
  BookmarkPlus,
} from "lucide-react";
import { EditorTemplateItem } from "@/app/admin/actions";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (html: string, replace?: boolean) => void;
  customTemplates?: EditorTemplateItem[];
  onSaveCurrentAsSnippet?: () => void;
}

export function TemplateModal({
  isOpen,
  onClose,
  onSelectTemplate,
  customTemplates = [],
  onSaveCurrentAsSnippet,
}: TemplateModalProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [activeTemplate, setActiveTemplate] = React.useState<PresetTemplate | EditorTemplateItem | null>(
    PRESET_TEMPLATES[0]
  );
  const [insertMode, setInsertMode] = React.useState<"append" | "replace">("append");

  if (!isOpen) return null;

  // Combine built-in presets and user custom snippets
  const allTemplates = [
    ...PRESET_TEMPLATES,
    ...customTemplates.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description || "Mẫu giao diện tùy biến cá nhân",
      category: (c.category as PresetTemplate["category"]) || "cinema",
      iconName: "BookmarkPlus",
      htmlCode: c.htmlCode,
      cssCode: c.cssCode || undefined,
    })),
  ];

  const filtered = selectedCategory === "all"
    ? allTemplates
    : allTemplates.filter((t) => t.category === selectedCategory);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Clapperboard":
        return <Clapperboard className="size-4 text-orange-500" />;
      case "Users":
        return <Users className="size-4 text-amber-500" />;
      case "AlertTriangle":
        return <AlertTriangle className="size-4 text-rose-500" />;
      case "Music":
        return <Music className="size-4 text-purple-500" />;
      case "BookOpen":
        return <BookOpen className="size-4 text-emerald-500" />;
      case "ListTree":
        return <ListTree className="size-4 text-blue-500" />;
      default:
        return <BookmarkPlus className="size-4 text-primary" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="w-full max-w-4xl h-[85vh] max-h-[750px] bg-background rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-border/80 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                Thư Viện Mẫu Giao Diện Nghệ Thuật
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                Chọn khối bố cục dựng sẵn để chèn vào trang chỉ với 1 click
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSaveCurrentAsSnippet && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onSaveCurrentAsSnippet}
                className="h-8 text-xs rounded-xl border-dashed border-orange-500/50 text-orange-600 hover:bg-orange-500/10 flex items-center gap-1.5"
              >
                <BookmarkPlus className="size-3.5" />
                <span>Lưu bài hiện tại thành mẫu</span>
              </Button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-muted/20 border-b border-border/60 overflow-x-auto text-xs">
          {[
            { id: "all", label: "Tất cả mẫu" },
            { id: "cinema", label: "🎬 Hồ sơ Điện ảnh" },
            { id: "character", label: "👥 Thẻ Nhân vật" },
            { id: "notice", label: "⚠️ Cảnh báo / Dò mìn" },
            { id: "music", label: "🎵 Nhạc nền BGM" },
            { id: "glossary", label: "📖 Thuật ngữ" },
            { id: "shortcode", label: "🎞️ Shortcode Mục lục" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all font-mono text-xs ${
                selectedCategory === cat.id
                  ? "bg-foreground text-background font-medium shadow-xs"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Body: Split List & Details */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left: Template Items */}
          <div className="md:col-span-5 border-r border-border/70 overflow-y-auto p-3 space-y-2">
            {filtered.map((item) => {
              const isSelected = activeTemplate?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveTemplate(item)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-orange-500/10 border-orange-500/50 shadow-xs"
                      : "bg-background hover:bg-muted/40 border-border/60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(item.iconName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm font-bold text-foreground leading-snug truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Template Preview & Action */}
          <div className="md:col-span-7 flex flex-col overflow-hidden bg-muted/10 p-4 sm:p-6">
            {activeTemplate ? (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="outline" className="text-[10px] font-mono uppercase bg-background">
                      {activeTemplate.category}
                    </Badge>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Kích thước: {(activeTemplate.htmlCode.length / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-foreground">
                    {activeTemplate.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {activeTemplate.description}
                  </p>
                </div>

                {/* Code Snippet Preview */}
                <div className="flex-1 overflow-auto rounded-2xl border border-border bg-background p-4 text-xs font-mono text-muted-foreground shadow-inner">
                  <pre className="whitespace-pre-wrap break-all leading-relaxed">
                    {activeTemplate.htmlCode.substring(0, 1800)}
                    {activeTemplate.htmlCode.length > 1800 && "\n\n... (và còn tiếp tục theo đúng chuẩn WordPress) ..."}
                  </pre>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 mt-4 border-t border-border/70 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <span>Cách chèn:</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="insertMode"
                        checked={insertMode === "append"}
                        onChange={() => setInsertMode("append")}
                        className="accent-orange-500"
                      />
                      <span>Thêm vào cuối bài</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer ml-2">
                      <input
                        type="radio"
                        name="insertMode"
                        checked={insertMode === "replace"}
                        onChange={() => setInsertMode("replace")}
                        className="accent-orange-500"
                      />
                      <span>Ghi đè toàn bộ</span>
                    </label>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      onSelectTemplate(activeTemplate.htmlCode, insertMode === "replace");
                      onClose();
                    }}
                    className="rounded-xl text-xs h-9 px-5 bg-orange-600 hover:bg-orange-700 text-white shadow-xs font-medium"
                  >
                    <Check className="size-3.5 mr-1.5" />
                    <span>Chèn mẫu này ngay</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground font-serif">
                Chọn một mẫu bên trái để xem trước và chèn.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

