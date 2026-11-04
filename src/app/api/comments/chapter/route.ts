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
          id: r.id,
          authorName: r.authorName,
          content: r.content,
          userId: r.userId || null,
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
      userId: session.id,
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
        id: newComment.id,
        authorName: newComment.authorName,
        content: newComment.content,
        userId: newComment.userId,
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

export async function PUT(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { commentId, content } = body;

    if (!commentId || !content || !content.trim()) {
      return NextResponse.json({ error: "Nội dung không hợp lệ." }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const rows = await db
      .select()
      .from(paragraphComments)
      .where(eq(paragraphComments.id, commentId))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy bình luận." }, { status: 404 });
    }

    const targetComment = rows[0];
    const isOwner = targetComment.userId && targetComment.userId === session.id;
    const isAdmin = session.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Bạn không có quyền sửa bình luận này." }, { status: 403 });
    }

    await db
      .update(paragraphComments)
      .set({ content: content.trim() })
      .where(eq(paragraphComments.id, commentId));

    return NextResponse.json({ success: true, message: "Đã cập nhật bình luận." });
  } catch (error) {
    console.error("Error updating chapter comment:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json({ error: "Thiếu commentId" }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const rows = await db
      .select()
      .from(paragraphComments)
      .where(eq(paragraphComments.id, commentId))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy bình luận." }, { status: 404 });
    }

    const targetComment = rows[0];
    const isOwner = targetComment.userId && targetComment.userId === session.id;
    const isAdmin = session.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Bạn không có quyền xóa bình luận này." }, { status: 403 });
    }

    await db.delete(paragraphComments).where(eq(paragraphComments.id, commentId));

    return NextResponse.json({ success: true, message: "Đã xóa bình luận." });
  } catch (error) {
    console.error("Error deleting chapter comment:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xóa bình luận." }, { status: 500 });
  }
}
