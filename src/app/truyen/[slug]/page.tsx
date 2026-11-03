import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowLeft, ListOrdered } from "lucide-react";
import { getDb, stories, chapters } from "@/db";
import { eq, asc } from "drizzle-orm";
import { FALLBACK_STORIES, type StoryItem } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StoryHtmlRenderer } from "@/components/story/story-html-renderer";
import { Edit3 } from "lucide-react";

interface ChapterItem {
  id: string;
  chapterNumber: number;
  title: string;
  wordCount: number;
  password?: string | null;
}

type StoryDetailItem = Pick<
  StoryItem,
  "id" | "slug" | "title" | "author" | "coverUrl" | "description" | "status" | "tags" | "category"
> & {
  contentHtml?: string | null;
  customCss?: string | null;
};

interface StoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { slug } = await params;

  let story: StoryDetailItem | null = null;
  let chaptersList: ChapterItem[] = [];

  try {
    const db = await getDb();
    if (db) {
      const storyRows = await db
        .select()
        .from(stories)
        .where(eq(stories.slug, slug))
        .limit(1);

      if (storyRows.length > 0) {
        const row = storyRows[0];
        const tags = (row.tags as string[]) || [];
        let category: StoryDetailItem["category"] = "Đang cook";
        if (tags.includes("Full") || row.status === "COMPLETED") category = "Full";
        else if (tags.includes("Dịch")) category = "Dịch";
        else if (tags.includes("Fanfic")) category = "Fanfic";

        story = {
          ...row,
          category,
          tags,
          contentHtml: row.contentHtml,
          customCss: row.customCss,
        } as unknown as StoryDetailItem;
        chaptersList = await db
          .select({
            id: chapters.id,
            chapterNumber: chapters.chapterNumber,
            title: chapters.title,
            wordCount: chapters.wordCount,
            password: chapters.password,
          })
          .from(chapters)
          .where(eq(chapters.storyId, story.id))
          .orderBy(asc(chapters.chapterNumber));
      }
    }
  } catch {
    // Database query failed, fallback to static stories
  }

  if (!story) {
    const fallback = FALLBACK_STORIES.find((s) => s.slug === slug);
    if (!fallback) {
      notFound();
    }
    story = fallback;

    // Per-slug fallback chapters phù hợp với từng bộ truyện
    const FALLBACK_CHAPTERS_BY_SLUG: Record<string, ChapterItem[]> = {
      "om-lay-trong-luc": [
        { id: "ch_omlay_1", chapterNumber: 1, title: "Những bông tuyết đầu tiên trên mặt băng", wordCount: 3820 },
        { id: "ch_omlay_2", chapterNumber: 2, title: "Người đứng sau rào chắn", wordCount: 3550 },
        { id: "ch_omlay_3", chapterNumber: 3, title: "Khúc valse trên băng giá", wordCount: 4100 },
      ],
      "bay-buc-thu-duoc-gui-den-sau-cai-chet-cua-ke-hoang-tuong": [
        { id: "ch_baybucthu_1", chapterNumber: 1, title: "Bức thư thứ nhất: Người gửi không tên", wordCount: 2900 },
        { id: "ch_baybucthu_2", chapterNumber: 2, title: "Bức thư thứ hai: Ký ức bị xóa nhòa", wordCount: 3200 },
        { id: "ch_baybucthu_3", chapterNumber: 3, title: "Bức thư thứ ba: Mê cung tâm trí", wordCount: 2750 },
      ],
      "gio-tin-phong-thoi-ve-phia-bien": [
        { id: "ch_giotinphong_1", chapterNumber: 1, title: "Tiếng sóng vỗ mạn thuyền lúc bình minh", wordCount: 3410 },
        { id: "ch_giotinphong_2", chapterNumber: 2, title: "Người đàn ông mang mùi biển cả", wordCount: 3680 },
        { id: "ch_giotinphong_3", chapterNumber: 3, title: "Những ngày hè rợp nắng", wordCount: 3250 },
      ],
      "sternstunde": [
        { id: "ch_sternstunde_1", chapterNumber: 1, title: "Tọa độ của một vì tinh tú lạc lối", wordCount: 4670 },
        { id: "ch_sternstunde_2", chapterNumber: 2, title: "Bản giao hưởng trong không gian im lặng", wordCount: 4120 },
        { id: "ch_sternstunde_3", chapterNumber: 3, title: "Khoảnh khắc xuất thần", wordCount: 3890 },
      ],
      "de-profundis": [
        { id: "ch_deprofundis_1", chapterNumber: 1, title: "Phần I: Thư gửi từ vực sâu khổ đau", wordCount: 5120 },
        { id: "ch_deprofundis_2", chapterNumber: 2, title: "Phần II: Nghệ thuật và nỗi cô đơn", wordCount: 4850 },
        { id: "ch_deprofundis_3", chapterNumber: 3, title: "Phần III: Sự tha thứ và cứu rỗi", wordCount: 4600 },
      ],
      "mat-bao": [
        { id: "ch_matbao_1", chapterNumber: 1, title: "Giữa tâm bão — cuộc gặp gỡ định mệnh", wordCount: 3180 },
        { id: "ch_matbao_2", chapterNumber: 2, title: "Mắt bão yên tĩnh giữa muôn trùng hiểm nguy", wordCount: 3450 },
        { id: "ch_matbao_3", chapterNumber: 3, title: "Hai linh hồn, một bóng tối", wordCount: 2980 },
      ],
    };

    chaptersList = FALLBACK_CHAPTERS_BY_SLUG[slug] ?? [
      { id: "ch_1", chapterNumber: 1, title: "Chương 1", wordCount: 2400 },
    ];
  }

  const isCompleted = story.status === "COMPLETED";

  // Category badge label mapping
  const categoryLabel = (story as StoryDetailItem & { category?: string }).category ?? (isCompleted ? "Full" : "Đang cook");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Top Navigation & Studio Edit Shortcut */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
        >
          <ArrowLeft className="size-3.5" />
          <span>Quay lại trang chủ</span>
        </Link>

        <Link
          href={`/admin/editor?storyId=${story.id}`}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition-all font-mono shadow-xs"
        >
          <Edit3 className="size-3.5" />
          <span>Mở Studio Editor</span>
        </Link>
      </div>

      {story.contentHtml ? (
        /* 1. Custom Artistic Studio Render (Render toàn bộ bản dựng HTML nghệ thuật 100%) */
        <div className="space-y-6">
          <StoryHtmlRenderer
            content={story.contentHtml}
            customCss={story.customCss}
            chapters={chaptersList}
            storySlug={story.slug}
          />
        </div>
      ) : (
        /* 2. Fallback Standard View for stories without custom HTML */
        <>
          {/* Story Info Hero */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 bg-card p-6 sm:p-8 rounded-3xl border border-border/70 shadow-xs mb-10">
            <div className="relative w-40 h-56 sm:w-48 sm:h-64 shrink-0 mx-auto sm:mx-0 rounded-2xl overflow-hidden bg-muted border border-border/80 shadow-md">
              {story.coverUrl ? (
                <Image
                  src={story.coverUrl}
                  alt={story.title}
                  fill
                  sizes="192px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <BookOpen className="size-8" />
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-medium bg-secondary text-primary border-orange-300 dark:border-orange-800"
                  >
                    {categoryLabel}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">
                    {chaptersList.length} chương
                  </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-medium text-foreground mb-1.5 tracking-tight">
                  {story.title}
                </h1>
                <p className="text-sm text-muted-foreground mb-4">
                  Tác giả: <span className="font-medium text-primary">{story.author}</span>
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {story.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-full bg-secondary/80 text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground/90 leading-relaxed font-sans italic border-l-2 border-border/80 pl-3.5 my-3">
                  {story.description || "Không có tóm tắt."}
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                {chaptersList.length > 0 && (
                  <Link href={`/chuong/${chaptersList[0].id}`}>
                    <Button className="rounded-xl text-xs h-9 px-4">
                      Đọc từ chương đầu
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Chapters list */}
          <div className="bg-card p-6 sm:p-8 rounded-3xl border border-border/70 shadow-xs">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border/60">
              <ListOrdered className="size-4 text-primary" />
              <h2 className="font-serif text-xl font-medium text-foreground">
                Danh Sách Các Chương ({chaptersList.length})
              </h2>
            </div>

            <div className="divide-y divide-border/50">
              {chaptersList.map((ch) => (
                <Link
                  key={ch.id}
                  href={`/chuong/${ch.id}`}
                  className="py-3 px-3 -mx-3 rounded-xl flex items-center justify-between hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">
                      Chương {ch.chapterNumber}
                    </span>
                    <span className="font-serif text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {ch.title}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {ch.wordCount ? `${ch.wordCount.toLocaleString("vi-VN")} chữ` : "Đọc →"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
