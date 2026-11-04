import { NextRequest, NextResponse } from "next/server";
import { getDb, paragraphComments, generateId } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get("chapterId");

  if (!chapterId) {
    return NextResponse.json({ error: "Thiếu chapterId" }, { status: 400 });
  }

  try {
    const db = await getDb();
    if (db) {
      const rows = await db
        .select()
        .from(paragraphComments)
        .where(
          and(
            eq(paragraphComments.chapterId, chapterId),
            eq(paragraphComments.paragraphIndex, 0)
          )
        )
        .orderBy(desc(paragraphComments.createdAt))
        .limit(100);

      return NextResponse.json({
        comments: rows.map((r) => ({
          ...r,
          createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
        })),
      });
    }
  } catch (error) {
    console.error("Error fetching chapter comments:", error);
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
    const { chapterId, content } = body;

    if (!chapterId || !content || !content.trim()) {
      return NextResponse.json(
        { error: "Nội dung bình luận không được để trống." },
        { status: 400 }
      );
    }

    let authorName = session.nickname || session.name || "Bạn đọc Google";
    if (session.role === "ADMIN" && !authorName.startsWith("[Admin]")) {
      authorName = `[Admin] ${authorName}`;
    }

    const newComment = {
      id: generateId("pc"),
      chapterId,
      paragraphIndex: 0,
      authorName,
      content: content.trim(),
      isTypoReport: false,
      isResolved: false,
      createdAt: new Date(),
    };

    const db = await getDb();
    if (db) {
      await db.insert(paragraphComments).values(newComment);
    }

    return NextResponse.json({
      success: true,
      comment: {
        ...newComment,
        createdAt: newComment.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating chapter comment:", error);
    return NextResponse.json(
      { error: "Không thể lưu bình luận vào lúc này." },
      { status: 500 }
    );
  }
}
