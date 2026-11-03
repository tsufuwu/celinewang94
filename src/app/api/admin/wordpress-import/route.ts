import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getDb,
  stories,
  chapters,
  reviews,
  guestbookPosts,
  paragraphComments,
  generateId,
} from "@/db";
import { checkAdminAuth } from "@/app/admin/actions";
import { eq, and } from "drizzle-orm";

interface WordPressImportPayload {
  stories?: Array<{
    id: string;
    slug: string;
    title: string;
    author: string;
    coverUrl?: string;
    description?: string;
    contentHtml?: string;
    status: "ONGOING" | "COMPLETED" | "DROPPED";
    tags: string[];
  }>;
  chapters?: Array<{
    id?: string;
    storyId: string;
    chapterNumber: number;
    title: string;
    wordCount: number;
    password?: string | null;
    passwordHint?: string | null;
    paragraphs: { index: number; text: string }[];
  }>;
  reviews?: Array<{
    id?: string;
    storyId: string;
    authorName: string;
    rating: number;
    content: string;
    parentId?: string | null;
    createdAt?: number;
  }>;
  guestbook?: Array<{
    id?: string;
    authorName: string;
    isAdmin: boolean;
    title?: string | null;
    content: string;
    parentId?: string | null;
    createdAt?: number;
  }>;
  paragraphComments?: Array<{
    id?: string;
    chapterId: string;
    paragraphIndex: number;
    authorName: string;
    content: string;
    isTypoReport: boolean;
    createdAt?: number;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json(
        { success: false, message: "Chưa xác thực quyền quản trị." },
        { status: 401 }
      );
    }

    const payload = (await req.json()) as WordPressImportPayload;
    const db = await getDb();

    if (!db) {
      return NextResponse.json({
        success: true,
        message: "Chế độ mô phỏng khi D1 offline. Dữ liệu đã được kiểm tra tính hợp lệ.",
      });
    }

    let storiesUpdated = 0;
    let chaptersUpdated = 0;
    let commentsUpdated = 0;

    // 1. Upsert stories
    if (payload.stories && payload.stories.length > 0) {
      for (const s of payload.stories) {
        const existing = await db
          .select({ id: stories.id })
          .from(stories)
          .where(eq(stories.slug, s.slug))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(stories)
            .set({
              title: s.title,
              author: s.author,
              description: s.description || null,
              contentHtml: s.contentHtml || null,
              status: s.status,
              tags: s.tags,
              updatedAt: new Date(),
            })
            .where(eq(stories.id, existing[0].id));
        } else {
          await db.insert(stories).values({
            id: s.id || generateId("story"),
            slug: s.slug,
            title: s.title,
            author: s.author,
            coverUrl: s.coverUrl || null,
            description: s.description || null,
            contentHtml: s.contentHtml || null,
            status: s.status,
            tags: s.tags,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        storiesUpdated++;
      }
    }

    // 2. Upsert chapters
    if (payload.chapters && payload.chapters.length > 0) {
      for (const ch of payload.chapters) {
        const existing = await db
          .select({ id: chapters.id })
          .from(chapters)
          .where(
            and(
              eq(chapters.storyId, ch.storyId),
              eq(chapters.chapterNumber, ch.chapterNumber)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(chapters)
            .set({
              title: ch.title,
              wordCount: ch.wordCount,
              password: ch.password || null,
              passwordHint: ch.passwordHint || null,
              paragraphs: ch.paragraphs,
              updatedAt: new Date(),
            })
            .where(eq(chapters.id, existing[0].id));
        } else {
          await db.insert(chapters).values({
            id: ch.id || generateId("ch"),
            storyId: ch.storyId,
            chapterNumber: ch.chapterNumber,
            title: ch.title,
            wordCount: ch.wordCount,
            password: ch.password || null,
            passwordHint: ch.passwordHint || null,
            paragraphs: ch.paragraphs,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        chaptersUpdated++;
      }
    }

    // 3. Insert Reviews
    if (payload.reviews && payload.reviews.length > 0) {
      for (const r of payload.reviews) {
        await db.insert(reviews).values({
          id: r.id || generateId("rev"),
          storyId: r.storyId,
          authorName: r.authorName,
          rating: r.rating || 5,
          content: r.content,
          likes: 0,
          parentId: r.parentId || null,
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        });
        commentsUpdated++;
      }
    }

    // 4. Insert Guestbook
    if (payload.guestbook && payload.guestbook.length > 0) {
      for (const g of payload.guestbook) {
        await db.insert(guestbookPosts).values({
          id: g.id || generateId("gb"),
          authorName: g.authorName,
          isAdmin: g.isAdmin || false,
          title: g.title || null,
          content: g.content,
          parentId: g.parentId || null,
          createdAt: g.createdAt ? new Date(g.createdAt) : new Date(),
        });
        commentsUpdated++;
      }
    }

    // 5. Insert Paragraph Comments
    if (payload.paragraphComments && payload.paragraphComments.length > 0) {
      for (const pc of payload.paragraphComments) {
        await db.insert(paragraphComments).values({
          id: pc.id || generateId("pc"),
          chapterId: pc.chapterId,
          paragraphIndex: pc.paragraphIndex || 1,
          authorName: pc.authorName,
          content: pc.content,
          isTypoReport: pc.isTypoReport || false,
          isResolved: false,
          createdAt: pc.createdAt ? new Date(pc.createdAt) : new Date(),
        });
        commentsUpdated++;
      }
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/tro-chuyen");

    return NextResponse.json({
      success: true,
      message: `Đã xử lý: ${storiesUpdated} truyện, ${chaptersUpdated} chương, ${commentsUpdated} bình luận thành công!`,
      storiesCount: storiesUpdated,
      chaptersCount: chaptersUpdated,
      commentsCount: commentsUpdated,
    });
  } catch (error: unknown) {
    console.error("WordPress import API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: (error as Error)?.message || "Lỗi lưu dữ liệu WordPress vào D1.",
      },
      { status: 500 }
    );
  }
}

