import { notFound } from "next/navigation";
import { getDb, stories, chapters } from "@/db";
import { eq, asc } from "drizzle-orm";
import { FALLBACK_STORIES, type StoryItem } from "@/lib/data";
import { StoryUnifiedView, type UnifiedChapterItem } from "@/components/story/story-unified-view";
import { getAuthSession } from "@/lib/auth";

type StoryDetailItem = Pick<
  StoryItem,
  "id" | "slug" | "title" | "author" | "coverUrl" | "description" | "status" | "tags"
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
  let chaptersList: UnifiedChapterItem[] = [];

  try {
    const db = await getDb();
    if (db) {
      const storyRows = await db
        .select({
          id: stories.id,
          slug: stories.slug,
          title: stories.title,
          author: stories.author,
          coverUrl: stories.coverUrl,
          description: stories.description,
          status: stories.status,
          tags: stories.tags,
          contentHtml: stories.contentHtml,
          customCss: stories.customCss,
        })
        .from(stories)
        .where(eq(stories.slug, slug))
        .limit(1);

      if (storyRows.length > 0) {
        const row = storyRows[0];
        const tags = (row.tags as string[]) || [];

        story = {
          ...row,
          tags,
        } as unknown as StoryDetailItem;

        const dbChapters = await db
          .select({
            id: chapters.id,
            chapterNumber: chapters.chapterNumber,
            title: chapters.title,
            wordCount: chapters.wordCount,
            password: chapters.password,
            createdAt: chapters.createdAt,
          })
          .from(chapters)
          .where(eq(chapters.storyId, story.id))
          .orderBy(asc(chapters.chapterNumber));

        chaptersList = dbChapters.map((c) => ({
          ...c,
          createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : null,
        }));
      }
    }
  } catch {
    // Fallback to static stories if database read failed
  }

  if (!story) {
    const fallback = FALLBACK_STORIES.find((s) => s.slug === slug);
    if (!fallback) {
      notFound();
    }
    story = fallback;

    // Per-slug fallback chapters phù hợp với từng bộ truyện
    const FALLBACK_CHAPTERS_BY_SLUG: Record<string, UnifiedChapterItem[]> = {
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

  const session = await getAuthSession();
  const isAdmin = session?.role === "ADMIN";

  return (
    <StoryUnifiedView
      story={story}
      chapters={chaptersList}
      isAdmin={isAdmin}
    />
  );
}
