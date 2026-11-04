import { NextRequest, NextResponse } from "next/server";
import { getDb, reviews, generateId } from "@/db";
import { eq, desc } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storyId = searchParams.get("storyId");

  if (!storyId) {
    return NextResponse.json({ error: "Thiếu storyId" }, { status: 400 });
  }

  try {
    const db = await getDb();
    if (db) {
      const rows = await db
        .select()
        .from(reviews)
        .where(eq(reviews.storyId, storyId))
        .orderBy(desc(reviews.createdAt))
        .limit(100);

      return NextResponse.json({
        comments: rows.map((r) => ({
          id: r.id,
          authorName: r.authorName,
          content: r.content,
          rating: r.rating,
          createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
        })),
      });
    }
  } catch (error) {
    console.error("Error fetching story comments:", error);
  }

  return NextResponse.json({ comments: [] });
}

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json(
      { error: "Vui lòng đăng nhập bằng Google để gửi bình luận." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { storyId, content } = body;

    if (!storyId || !content || !content.trim()) {
      return NextResponse.json(
        { error: "Nội dung bình luận không được để trống." },
        { status: 400 }
      );
    }

    let authorName = session.nickname || session.name || "Bạn đọc Google";
    if (session.role === "ADMIN" && !authorName.startsWith("[Admin]")) {
      authorName = `[Admin] ${authorName}`;
    }

    const newReview = {
      id: generateId("rev"),
      storyId,
      authorName,
      rating: 5,
      content: content.trim(),
      likes: 0,
      createdAt: new Date(),
    };

    const db = await getDb();
    if (db) {
      await db.insert(reviews).values(newReview);
    }

    return NextResponse.json({
      success: true,
      comment: {
        id: newReview.id,
        authorName: newReview.authorName,
        content: newReview.content,
        createdAt: newReview.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating story comment:", error);
    return NextResponse.json(
      { error: "Không thể lưu bình luận vào lúc này." },
      { status: 500 }
    );
  }
}
