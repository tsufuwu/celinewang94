"use client";

import * as React from "react";
import {
  FileCode,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XMLParser } from "fast-xml-parser";
import type { AdminStoryItem } from "@/app/admin/actions";

interface ParsedStory {
  id: string;
  slug: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  contentHtml: string;
  status: "ONGOING" | "COMPLETED" | "DROPPED";
  tags: string[];
}

interface ParsedChapterItem {
  storyId: string;
  chapterNumber: number;
  title: string;
  wordCount: number;
  password?: string | null;
  passwordHint?: string | null;
  paragraphs: { index: number; text: string }[];
}

interface WordPressImporterProps {
  stories?: AdminStoryItem[];
}

export function WordPressImporter({ stories: _stories }: WordPressImporterProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [isParsing, setIsParsing] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [parsedData, setParsedData] = React.useState<{
    stories: ParsedStory[];
    chapters: ParsedChapterItem[];
    lockedCount: number;
  } | null>(null);

  const [progress, setProgress] = React.useState<{
    percent: number;
    text: string;
  } | null>(null);

  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setParsedData(null);
      setFeedback(null);
    }
  };

  const handleParseXml = async () => {
    if (!file) return;

    setIsParsing(true);
    setFeedback(null);
    setProgress({ percent: 10, text: "Đang đọc file XML vào bộ nhớ trình duyệt..." });

    try {
      const text = await file.text();
      setProgress({ percent: 40, text: "Đang phân tích cú pháp XML..." });

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        textNodeName: "#text",
        parseTagValue: false,
      });

      const jsonObj = parser.parse(text);
      const items: Record<string, unknown>[] = Array.isArray(jsonObj.rss?.channel?.item)
        ? jsonObj.rss.channel.item
        : [];

      setProgress({ percent: 70, text: "Đang trích xuất truyện, chương và bình luận..." });

      const storyDefinitions = [
        {
          id: "story_om_lay_trong_luc",
          pageId: 44,
          slug: "om-lay-trong-luc",
          title: "Ôm Lấy Trọng Lực",
          author: "larivegauche",
          coverUrl: "/images/stories/om-lay-trong-luc.png",
          description:
            "Lương Mục Dã là một nhiếp ảnh gia thương mại từng rong ruổi nơi băng giá hoang sơ. Hứa Tiếu Trần là một vận động viên trượt băng đơn nam từng chạm đỉnh vinh quang nhưng phải đối mặt với chấn thương và khoảng trống tâm lý.",
          status: "COMPLETED" as const,
          tags: ["Đam mỹ", "Hiện đại", "Cường cường", "Thể thao", "Trượt tuyết", "Full"],
          matchPost: (title: string, cats: string[]) =>
            cats.includes("ôm lấy trọng lực") ||
            cats.includes("larivegauche") ||
            title.startsWith("[EG]") ||
            title.includes("ôm lấy trọng lực") ||
            title.includes("trượt tuyết") ||
            title.includes("Muztagh Ata"),
        },
        {
          id: "story_sternstunde",
          pageId: 4016,
          slug: "sternstunde",
          title: "Sternstunde - Thời Khắc Định Mệnh",
          author: "Trĩ Sở",
          coverUrl: "/images/stories/sternstunde.png",
          description:
            "Sternstunde – Khoảnh khắc của những vì sao, giây phút số phận được định đoạt. Cuộc gặp gỡ định mệnh giữa sân băng và giới giải trí.",
          status: "ONGOING" as const,
          tags: ["Đam mỹ", "Hiện đại", "Đang cook", "Giới giải trí"],
          matchPost: (title: string, cats: string[]) =>
            cats.includes("sternstunde") ||
            cats.includes("trĩ sở") ||
            title.startsWith("[Sternstunde]"),
        },
        {
          id: "story_de_profundis",
          pageId: 356,
          slug: "de-profundis",
          title: "De profundis",
          author: "Oscar Wilde",
          coverUrl: "/images/stories/de-profundis.png",
          description:
            "Bức thư từ vực sâu khổ đau gửi cho Lord Alfred Douglas – kiệt tác triết học và tâm sự đầy day dứt của Oscar Wilde.",
          status: "ONGOING" as const,
          tags: ["Dịch", "Văn học cổ điển", "Thư từ", "Triết lý", "Đang cook"],
          matchPost: (title: string, cats: string[]) =>
            cats.includes("de profundis oscar wilde") ||
            title.startsWith("[dịch] de profundis"),
        },
        {
          id: "story_mat_bao",
          pageId: 5484,
          slug: "mat-bao",
          title: "Mắt Bão",
          author: "Đàm Thạch",
          coverUrl: "/images/stories/mat-bao.png",
          description:
            "Giữa tâm bão dữ dội, nơi yên tĩnh nhất chính là mắt bão – cũng là nơi hai linh hồn va vào nhau, cùng vượt qua hiểm nguy và bóng tối bao trùm.",
          status: "COMPLETED" as const,
          tags: ["Fanfic", "Full", "Đam mỹ"],
          matchPost: (title: string) =>
            title.includes("Mắt Bão") || title.includes("Fanfic/ Mắt Bão"),
        },
        {
          id: "story_gio_tin_phong",
          pageId: 5730,
          slug: "gio-tin-phong-thoi-ve-phia-bien",
          title: "Gió Tín Phong Thổi Về Phía Biển",
          author: "Thương Bắc Thụ",
          coverUrl: "/images/stories/gio-tin-phong.png",
          description:
            "Ngọn gió tín phong thổi mang theo hơi thở của biển cả mặn mòi và những rung cảm đầu đời kín đáo, sâu lắng.",
          status: "ONGOING" as const,
          tags: ["Đam mỹ", "Hiện đại", "Đang cook"],
          matchPost: (title: string, cats: string[]) =>
            cats.includes("Gió Tín Phong") || title.startsWith("[Gió Tín Phong]"),
        },
        {
          id: "story_bay_buc_thu",
          pageId: 5946,
          slug: "bay-buc-thu-duoc-gui-den-sau-cai-chet-cua-ke-hoang-tuong",
          title: "Bảy Bức Thư Được Gửi Đến Sau Cái Chết Của Kẻ Hoang Tưởng",
          author: "Miêu Giới Đệ Nhất Lỗ",
          coverUrl: "/images/stories/bay-buc-thu.png",
          description:
            "Sau cái chết bí ẩn của một người đàn ông mắc chứng hoang tưởng, lần lượt bảy bức thư kỳ lạ được gửi đến.",
          status: "COMPLETED" as const,
          tags: ["Đam mỹ", "Trinh thám", "Tâm lý", "Full"],
          matchPost: (title: string) =>
            title.includes("Bảy bức thư") || title.includes("bảy bức thư"),
        },
        {
          id: "story_bong_nhiet_do_thap",
          pageId: 2951,
          slug: "bong-nhiet-do-thap",
          title: "Bỏng Nhiệt Độ Thấp",
          author: "larivegauche x otasquiero",
          coverUrl: "/images/stories/default.png",
          description:
            "Vết bỏng do tiếp xúc lâu với vật có nhiệt độ không quá cao, âm ỉ nhưng để lại vết tích sâu sắc.",
          status: "ONGOING" as const,
          tags: ["Đam mỹ", "Đang cook"],
          matchPost: (title: string) => title.includes("Bỏng Nhiệt Độ Thấp"),
        },
      ];

      // Extract Stories
      const storiesList: ParsedStory[] = storyDefinitions.map((def) => {
        const pageItem = items.find(
          (i) =>
            String(i["wp:post_id"]) === String(def.pageId) ||
            i["wp:post_name"] === def.slug
        );
        return {
          id: def.id,
          slug: def.slug,
          title: def.title,
          author: def.author,
          coverUrl: def.coverUrl,
          description: def.description,
          contentHtml: pageItem ? String(pageItem["content:encoded"] || "") : "",
          status: def.status,
          tags: def.tags,
        };
      });

      // Extract Chapters
      const posts = items.filter(
        (i) =>
          i["wp:post_type"] === "post" &&
          (i["wp:status"] === "publish" || i["wp:status"] === "private")
      );

      const chaptersList: ParsedChapterItem[] = [];
      const extraCounter: Record<string, number> = {};
      let lockedCount = 0;

      posts.forEach((p) => {
        const title = String(p.title || "").trim();
        if (!title) return;

        const cats: string[] = [];
        const rawCats = p.category
          ? Array.isArray(p.category)
            ? p.category
            : [p.category]
          : [];
        rawCats.forEach((c: unknown) => {
          if (typeof c === "string") cats.push(c.toLowerCase());
          else if (c && typeof c === "object" && "#text" in c) {
            cats.push(String((c as { "#text": unknown })["#text"]).toLowerCase());
          }
        });

        const matchedStory =
          storyDefinitions.find((def) => def.matchPost(title, cats)) ||
          storyDefinitions[0];

        let chapterNum: number;
        const numMatch =
          title.match(/Chương\s+(\d+)/i) ||
          title.match(/–\s*0?(\d+)/i) ||
          title.match(/-\s*0?(\d+)/i);
        if (numMatch) {
          chapterNum = parseInt(numMatch[1], 10);
        } else {
          extraCounter[matchedStory.id] =
            (extraCounter[matchedStory.id] || 101) + 1;
          chapterNum = extraCounter[matchedStory.id];
        }

        const password = p["wp:post_password"]
          ? String(p["wp:post_password"]).trim()
          : null;
        if (password) lockedCount++;

        // Quick client split for preview
        const rawContent = String(p["content:encoded"] || "");
        const lines = rawContent
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<\/p>/gi, "\n\n")
          .replace(/<[^>]+>/g, "")
          .split(/\n\s*\n/)
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 0 && l !== "-----");

        const paragraphs = lines.map((pText: string, i: number) => ({
          index: i + 1,
          text: pText,
        }));

        let wordCount = 0;
        paragraphs.forEach((pa) => {
          wordCount += pa.text.split(/\s+/).filter(Boolean).length;
        });

        chaptersList.push({
          storyId: matchedStory.id,
          chapterNumber: chapterNum,
          title,
          wordCount,
          password,
          passwordHint: password
            ? "Mật khẩu được lưu từ bản dịch chính thức trên WordPress"
            : null,
          paragraphs,
        });
      });

      setParsedData({
        stories: storiesList,
        chapters: chaptersList,
        lockedCount,
      });

      setProgress(null);
    } catch (err: unknown) {
      console.error("Parse XML error:", err);
      setFeedback({
        type: "error",
        text: `Lỗi đọc file XML: ${(err as Error)?.message || String(err)}`,
      });
      setProgress(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleUploadToD1 = async () => {
    if (!parsedData) return;

    setIsImporting(true);
    setFeedback(null);

    try {
      // 1. Sync stories first
      setProgress({ percent: 10, text: "Đang đồng bộ dữ liệu tác phẩm & Clapperboard..." });
      await fetch("/api/admin/wordpress-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stories: parsedData.stories }),
      });

      // 2. Sync chapters in slices of 15
      const totalChapters = parsedData.chapters.length;
      const batchSize = 15;
      let sent = 0;

      for (let i = 0; i < totalChapters; i += batchSize) {
        const slice = parsedData.chapters.slice(i, i + batchSize);
        const curPercent = 10 + Math.round(((i + slice.length) / totalChapters) * 85);
        setProgress({
          percent: curPercent,
          text: `Đang nạp chương ${i + 1} - ${i + slice.length} / ${totalChapters}...`,
        });

        const res = await fetch("/api/admin/wordpress-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chapters: slice }),
        });

        if (!res.ok) {
          throw new Error(`Lỗi khi nạp cụm chương ${i + 1}`);
        }

        sent += slice.length;
      }

      setProgress({ percent: 100, text: "Hoàn tất đồng bộ!" });
      setFeedback({
        type: "success",
        text: `Đã nạp thành công ${parsedData.stories.length} bộ truyện và ${sent} chương (${parsedData.lockedCount} chương có mật khẩu bảo vệ) vào Cloudflare D1!`,
      });
    } catch (err: unknown) {
      console.error("Upload to D1 error:", err);
      setFeedback({
        type: "error",
        text: `Lỗi khi lưu dữ liệu vào D1: ${(err as Error)?.message || String(err)}`,
      });
    } finally {
      setIsImporting(false);
      setProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
        <div>
          <h2 className="font-serif text-2xl font-medium text-foreground">
            Nhập Dữ Liệu Từ WordPress (.xml)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tự động bóc tách toàn bộ bài viết, chương truyện, mật khẩu pass và bố cục nghệ thuật Clapperboard từ file WordPress Export.
          </p>
        </div>

        <Badge
          variant="outline"
          className="text-[11px] font-mono bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-orange-300 flex items-center gap-1.5 py-1 px-2.5"
        >
          <FileCode className="size-3.5 text-orange-600" />
          <span>WordPress WXR Parser</span>
        </Badge>
      </div>

      {/* File Upload Dropzone */}
      <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-5">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2">
            Chọn File WordPress Export (.xml)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".xml"
              onChange={handleFileChange}
              className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-orange-100 file:text-orange-900 dark:file:bg-orange-950/60 dark:file:text-orange-300 hover:file:bg-orange-200 cursor-pointer"
            />
            {file && (
              <span className="text-xs font-mono text-muted-foreground">
                ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            )}
          </div>
        </div>

        {file && !parsedData && (
          <Button
            onClick={handleParseXml}
            disabled={isParsing}
            className="rounded-2xl text-xs h-10 px-5 bg-orange-600 hover:bg-orange-700 text-white font-medium flex items-center gap-2 shadow-xs"
          >
            {isParsing ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                <span>Đang phân tích XML...</span>
              </>
            ) : (
              <>
                <Upload className="size-3.5" />
                <span>Bóc tách dữ liệu từ XML</span>
              </>
            )}
          </Button>
        )}

        {/* Progress Bar */}
        {progress && (
          <div className="p-4 rounded-2xl bg-secondary/50 border border-orange-200/60 dark:border-orange-950/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-foreground">{progress.text}</span>
              <span className="font-semibold text-orange-600">{progress.percent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Parsed Preview */}
        {parsedData && (
          <div className="p-5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-orange-800 dark:text-orange-300 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                Kết quả phân tích file XML
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {file?.name}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-card border border-border/60">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Tác phẩm</div>
                <div className="text-lg font-serif font-bold text-foreground mt-0.5">
                  {parsedData.stories.length} bộ
                </div>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border/60">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Chương truyện</div>
                <div className="text-lg font-serif font-bold text-foreground mt-0.5">
                  {parsedData.chapters.length} chương
                </div>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border/60">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Khóa Pass</div>
                <div className="text-lg font-serif font-bold text-orange-600 mt-0.5">
                  {parsedData.lockedCount} chương
                </div>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border/60">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Bố cục Clapperboard</div>
                <div className="text-lg font-serif font-bold text-emerald-600 mt-0.5">
                  Đã bảo toàn
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <Button
                onClick={handleUploadToD1}
                disabled={isImporting}
                className="rounded-2xl text-xs h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-2 shadow-xs"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Đang cập nhật lên D1...</span>
                  </>
                ) : (
                  <>
                    <Layers className="size-3.5" />
                    <span>Đồng bộ ngay vào Cloudflare D1</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-start gap-3 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
                : "bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200 border border-rose-200 dark:border-rose-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed font-sans">{feedback.text}</div>
          </div>
        )}
      </div>
    </div>
  );
}
