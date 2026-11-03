import { Metadata } from "next";
import { getDb, chapters, stories } from "@/db";
import { eq, and, lt, gt, desc, asc } from "drizzle-orm";
import { FALLBACK_RECENT_CHAPTERS, CHAPTER_PARAGRAPHS_MAP } from "@/lib/data";
import { getParagraphComments } from "./actions";
import { ChapterReader, type ChapterData, type ParagraphData } from "@/components/reader/chapter-reader";

interface ChapterPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { id } = await params;
  const fallback = FALLBACK_RECENT_CHAPTERS.find((c) => c.id === id);
  const title = fallback ? `${fallback.title} | ${fallback.story.title}` : "Đang đọc chương | Media naranja";

  return {
    title: `${title} - Media naranja`,
    description: "Trải nghiệm đọc truyện thanh tịnh, tùy chỉnh phông chữ, màu sắc và thảo luận từng đoạn văn.",
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
    other: {
      "brave-speedreader": "no",
      "readability": "no",
    },
  };
}

export const dynamic = "force-dynamic";

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { id } = await params;

  let chapter: ChapterData | null = null;
  let prevChapterId: string | null = null;
  let nextChapterId: string | null = null;

  try {
    const db = await getDb();
    if (db) {
      const rows = await db
        .select({
          chapter: chapters,
          story: stories,
        })
        .from(chapters)
        .innerJoin(stories, eq(chapters.storyId, stories.id))
        .where(eq(chapters.id, id))
        .limit(1);

      if (rows && rows.length > 0) {
        const { chapter: currentCh, story: currentStory } = rows[0];

        // Find prev chapter
        const prevRows = await db
          .select({ id: chapters.id })
          .from(chapters)
          .where(
            and(
              eq(chapters.storyId, currentCh.storyId),
              lt(chapters.chapterNumber, currentCh.chapterNumber)
            )
          )
          .orderBy(desc(chapters.chapterNumber))
          .limit(1);

        // Find next chapter
        const nextRows = await db
          .select({ id: chapters.id })
          .from(chapters)
          .where(
            and(
              eq(chapters.storyId, currentCh.storyId),
              gt(chapters.chapterNumber, currentCh.chapterNumber)
            )
          )
          .orderBy(asc(chapters.chapterNumber))
          .limit(1);

        prevChapterId = prevRows[0]?.id || null;
        nextChapterId = nextRows[0]?.id || null;

        chapter = {
          id: currentCh.id,
          chapterNumber: currentCh.chapterNumber,
          title: currentCh.title,
          wordCount: currentCh.wordCount,
          paragraphs: (currentCh.paragraphs as ParagraphData[]) || [],
          password: currentCh.password,
          passwordHint: currentCh.passwordHint,
          story: currentStory,
        };
      }
    }
  } catch {
    // Database query failed, fallback to static chapter data
  }

  // Fallback demo data
  if (!chapter) {
    const fallback = FALLBACK_RECENT_CHAPTERS.find((c) => c.id === id);
    const paragraphs: ParagraphData[] =
      CHAPTER_PARAGRAPHS_MAP[id] ||
      (fallback && CHAPTER_PARAGRAPHS_MAP[fallback.id]) || [
        {
          index: 1,
          text: "Mặt băng phẳng lặng như một tấm gương khổng lồ phản chiếu ánh đèn vòm nhà thi đấu. Từng luồng khí lạnh phả ra từ dưới lưỡi trượt mang theo cảm giác buốt giá nhưng cũng tỉnh táo đến kỳ lạ.",
        },
        {
          index: 2,
          text: "Cậu khẽ cúi người, siết chặt dây giày trượt băng màu đen mờ. Mười năm qua, sân băng này chứng kiến từng vết xước trên đầu gối, từng giọt mồ hôi rơi xuống rồi lập tức đóng băng giữa mùa đông miền Bắc.",
        },
        {
          index: 3,
          text: "Tiếng nhạc cất lên từ chiếc loa cũ kỹ góc khán đài — khúc nhạc dạo đầu của bản valse êm dịu. Cậu hít một hơi sâu, đạp mạnh chân phải, cả người lướt đi trên mặt băng như một cánh chim chao lượn trong gió sớm.",
        },
        {
          index: 4,
          text: "'Trọng lực không phải là kẻ thù cản bước chân em,' giọng nói trầm ấm của người ấy từng vang bên tai cậu trong những buổi tập muộn. 'Trọng lực giữ cho chúng ta không bị văng khỏi quỹ đạo, để mỗi khi em tiếp đất, em biết luôn có người đứng đợi ở vạch băng.'",
        },
        {
          index: 5,
          text: "Cậu xoay người ba vòng trên không trung. Khoảnh khắc lơ lửng giữa ánh sáng và hư vô, cả thế giới dường như nín thở theo từng chuyển động của đường trượt.",
        },
        {
          index: 6,
          text: "Khi lưỡi dao cắm trở lại mặt băng, để lại một vệt cong hoàn hảo, tiếng vỗ tay từ phía băng ghế kỹ thuật vang lên. Cậu ngước nhìn lên khán đài, nơi có ánh mắt quen thuộc luôn dõi theo từng nhịp thở của mình.",
        },
      ];

    if (fallback) {
      chapter = {
        id: fallback.id,
        chapterNumber: fallback.chapterNumber,
        title: fallback.title,
        wordCount: fallback.wordCount,
        paragraphs,
        password: fallback.password,
        passwordHint: fallback.passwordHint,
        story: {
          id: fallback.story.id,
          slug: fallback.story.slug,
          title: fallback.story.title,
          author: fallback.story.author,
        },
      };

      // Set prev and next
      const currentIndex = FALLBACK_RECENT_CHAPTERS.findIndex((c) => c.id === id);
      if (currentIndex > 0) {
        nextChapterId = FALLBACK_RECENT_CHAPTERS[currentIndex - 1].id;
      }
      if (currentIndex < FALLBACK_RECENT_CHAPTERS.length - 1) {
        prevChapterId = FALLBACK_RECENT_CHAPTERS[currentIndex + 1].id;
      }
    } else {
      chapter = {
        id,
        chapterNumber: 1,
        title: "Chương 1: Những bông tuyết đầu tiên trên mặt băng",
        wordCount: 3820,
        paragraphs,
        story: {
          id: "story_om_lay_trong_luc",
          slug: "om-lay-trong-luc",
          title: "Ôm Lấy Trọng Lực",
          author: "larivegauche",
        },
      };
      nextChapterId = "ch_omlay_44";
    }
  }

  const initialComments = await getParagraphComments(chapter.id);

  return (
    <ChapterReader
      chapter={chapter}
      initialComments={initialComments}
      prevChapterId={prevChapterId}
      nextChapterId={nextChapterId}
    />
  );
}
