import { NextRequest, NextResponse } from "next/server";
import { getDb, reviews, stories, generateId } from "@/db";
import { eq, desc } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth";
import { dispatchCommentNotifications } from "@/lib/notifications";

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
          userId: r.userId || null,
          parentId: r.parentId || null,
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
    const { storyId, content, parentId } = body;

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
      userId: session.id,
      authorName,
      rating: 5,
      content: content.trim(),
      parentId: parentId || null,
      likes: 0,
      createdAt: new Date(),
    };

    const db = await getDb();
    let parentComment: { userId: string | null; authorName: string } | null = null;
    let targetTitle = "Tác phẩm";
    let storySlug = "";

    if (db) {
      await db.insert(reviews).values(newReview);

      // Query parent comment if replying
      if (parentId) {
        const parentRows = await db
          .select({
            userId: reviews.userId,
            authorName: reviews.authorName,
          })
          .from(reviews)
          .where(eq(reviews.id, parentId))
          .limit(1);

        if (parentRows.length > 0) {
          parentComment = parentRows[0];
        }
      }

      // Query story title and slug
      const storyRows = await db
        .select({
          title: stories.title,
          slug: stories.slug,
        })
        .from(stories)
        .where(eq(stories.id, storyId))
        .limit(1);

      if (storyRows.length > 0) {
        targetTitle = storyRows[0].title;
        storySlug = storyRows[0].slug;
      }
    }

    const storyLink = storySlug ? `/truyen/${storySlug}#comment-${newReview.id}` : `/`;

    // Dispatch in-app and email notifications
    await dispatchCommentNotifications({
      actorName: newReview.authorName,
      actorId: session.id,
      content: newReview.content,
      targetType: "story",
      targetId: storyId,
      targetTitle,
      link: storyLink,
      parentId: parentId || null,
      parentUserId: parentComment?.userId || null,
      parentAuthorName: parentComment?.authorName || null,
    });

    return NextResponse.json({
      success: true,
      comment: {
        id: newReview.id,
        authorName: newReview.authorName,
        content: newReview.content,
        userId: newReview.userId,
        parentId: newReview.parentId,
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
      .from(reviews)
      .where(eq(reviews.id, commentId))
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
      .update(reviews)
      .set({ content: content.trim() })
      .where(eq(reviews.id, commentId));

    return NextResponse.json({ success: true, message: "Đã cập nhật bình luận." });
  } catch (error) {
    console.error("Error updating story comment:", error);
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
      .from(reviews)
      .where(eq(reviews.id, commentId))
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

    await db.delete(reviews).where(eq(reviews.id, commentId));

    return NextResponse.json({ success: true, message: "Đã xóa bình luận." });
  } catch (error) {
    console.error("Error deleting story comment:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xóa bình luận." }, { status: 500 });
  }
}
