import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ListOrdered, Lock, Sparkles, ChevronRight, Edit3 } from "lucide-react";
import { getDb, stories, chapters } from "@/db";
import { eq, asc } from "drizzle-orm";
import { FALLBACK_STORIES, type StoryItem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { StoryHtmlRenderer } from "@/components/story/story-html-renderer";

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

export const revalidate = 60;

export async function generateStaticParams() {
  return [
    { slug: "om-lay-trong-luc" },
    { slug: "sternstunde" },
    { slug: "de-profundis" },
    { slug: "bay-buc-thu-duoc-gui-den-sau-cai-chet-cua-ke-hoang-tuong" },
    { slug: "mat-bao" },
    { slug: "bong-nhiet-do-thap" },
    { slug: "gio-tin-phong-thoi-ve-phia-bien" },
  ];
}

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
    <div className="story-intro-container font-alegreya max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Top Breadcrumbs & Studio Edit Shortcut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#2B2623]/15">
        <nav className="flex items-center gap-1.5 text-xs font-mono text-[#5C5146] dark:text-[#C4B9AD]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#E07B4C] transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="size-3 text-[#5C5146]/50" />
          <Link href="/kho-truyen" className="hover:text-[#E07B4C] transition-colors">
            Thư viện
          </Link>
          <ChevronRight className="size-3 text-[#5C5146]/50" />
          <span className="text-[#2B2623] dark:text-[#FAF5EE] font-bold truncate max-w-[200px] sm:max-w-xs">
            {story.title}
          </span>
        </nav>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {chaptersList.length > 0 && (
            <Link
              href={`/chuong/${chaptersList[0].id}`}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-[10px] bg-[#E07B4C] text-white font-bold border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#DC7648] transition-all font-mono"
            >
              <span>Đọc từ Chương 1</span>
              <ChevronRight className="size-3.5" />
            </Link>
          )}

          <Link
            href={`/admin/editor?storyId=${story.id}`}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-[10px] border-2 border-[#2B2623] bg-[#FAF5EE] dark:bg-[#2A2420] text-[#2B2623] dark:text-[#FAF5EE] hover:bg-[#E5DDD2] transition-all font-mono shadow-[1.5px_2px_0px_#2B2623]"
          >
            <Edit3 className="size-3.5" />
            <span className="hidden sm:inline">Studio Editor</span>
          </Link>
        </div>
      </div>

      {/* 1. Story Intro: Custom Artistic HTML layout or standard fallback hero */}
      {story.contentHtml ? (
        <div className="space-y-6">
          <StoryHtmlRenderer
            content={story.contentHtml}
            customCss={story.customCss}
            chapters={chaptersList}
            storySlug={story.slug}
          />
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 bg-[#FAF5EE] dark:bg-[#1F1B18] p-6 sm:p-8 rounded-[24px] border-2 border-[#2B2623] shadow-[3px_5px_0px_#2B2623] mb-10">
          <div className="relative w-40 h-56 sm:w-48 sm:h-64 shrink-0 mx-auto sm:mx-0 rounded-[16px] overflow-hidden bg-[#EFE8DE] dark:bg-[#1A1614] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623]">
            {story.coverUrl ? (
              <Image
                src={story.coverUrl}
                alt={story.title}
                fill
                sizes="192px"
                unoptimized={story.coverUrl.startsWith("data:")}
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#5C5146]">
                <BookOpen className="size-8" />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-[8px] bg-[#BDCEAF] text-[#2B2623] border border-[#2B2623]/40">
                  {categoryLabel}
                </span>
                <span className="text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD]">
                  {chaptersList.length} chương
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2623] dark:text-[#FAF5EE] mb-1.5 tracking-tight">
                {story.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#E07B4C] font-semibold mb-3">
                Tác giả: <span className="font-bold underline underline-offset-2">{story.author}</span>
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {story.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2.5 py-0.5 rounded-[6px] bg-[#E5DDD2] dark:bg-[#3D352E] text-[#5C5146] dark:text-[#FAF5EE] font-bold font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <p className="text-xs sm:text-sm text-[#5C5146] dark:text-[#C4B9AD] leading-relaxed font-sans italic border-l-3 border-[#E07B4C] pl-3.5 my-3">
                {story.description || "Không có tóm tắt."}
              </p>
            </div>

            <div className="pt-4 flex gap-3">
              {chaptersList.length > 0 && (
                <Link href={`/chuong/${chaptersList[0].id}`}>
                  <Button className="rounded-[12px] bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[2px_2px_0px_#2B2623] font-bold text-xs h-9 px-4">
                    Đọc từ chương đầu
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Interactive Chapter List: ALWAYS displayed below story intro */}
      <div className="mt-12 rounded-[24px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[3px_5px_0px_#2B2623] p-6 sm:p-8" id="muc-luc">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b-2 border-[#2B2623]/20 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#BDCEAF] text-[#2B2623] border border-[#2B2623]/40 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles className="size-3 text-[#2B2623]" />
              <span>MỤC LỤC TÁC PHẨM</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B2623] dark:text-[#FAF5EE] flex items-center gap-2">
              <ListOrdered className="size-5 text-[#E07B4C]" />
              <span>Danh Sách Các Chương ({chaptersList.length})</span>
            </h2>
          </div>

          {chaptersList.length > 0 && (
            <Link
              href={`/chuong/${chaptersList[0].id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[2px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xs font-bold transition-all self-start sm:self-auto"
            >
              <span>Bắt đầu đọc Chương 1</span>
              <ChevronRight className="size-3.5" />
            </Link>
          )}
        </div>

        {chaptersList.length > 0 ? (
          <div className="divide-y divide-[#2B2623]/15">
            {chaptersList.map((ch) => (
              <Link
                key={ch.id}
                href={`/chuong/${ch.id}`}
                className="py-3.5 px-3 -mx-3 rounded-[12px] flex items-center justify-between hover:bg-[#E5DDD2]/50 dark:hover:bg-[#2A2420] transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <span className="font-mono text-xs px-2.5 py-1 rounded-[8px] bg-[#E5DDD2] dark:bg-[#3D352E] text-[#2B2623] dark:text-[#FAF5EE] font-bold border border-[#2B2623]/30 shrink-0">
                    #{ch.chapterNumber}
                  </span>
                  <span className="font-serif text-sm sm:text-base font-bold text-[#2B2623] dark:text-[#FAF5EE] group-hover:text-[#E07B4C] transition-colors truncate">
                    {ch.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {ch.password && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-[6px] bg-[#E07B4C]/15 text-[#E07B4C] border border-[#E07B4C]/40">
                      <Lock className="size-3" />
                      <span>Pass</span>
                    </span>
                  )}
                  <span className="text-xs font-mono font-semibold text-[#5C5146] dark:text-[#C4B9AD]">
                    {ch.wordCount ? `${ch.wordCount.toLocaleString("vi-VN")} chữ` : "Đọc →"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-4 rounded-[16px] border-2 border-dashed border-[#2B2623]/30 bg-[#FAF5EE]/50">
            <p className="font-serif text-base font-bold text-[#2B2623] dark:text-[#FAF5EE] mb-1">
              Tác phẩm trọn bộ dạng một chương / thư từ
            </p>
            <p className="text-xs text-[#5C5146] dark:text-[#C4B9AD]">
              Toàn bộ nội dung của tác phẩm đã được trình bày trọn vẹn ở phần bài đọc phía trên. Chúc bạn có những phút giây thưởng thức êm dịu!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
