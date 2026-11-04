"use server";

import { revalidatePath } from "next/cache";
import { getDb, paragraphComments, chapters, stories, generateId } from "@/db";
import { eq, or } from "drizzle-orm";
import { getAuthSession, checkIsAdminEmail } from "@/lib/auth";
import { dispatchCommentNotifications } from "@/lib/notifications";

export interface ParagraphCommentItem {
  id: string;
  chapterId: string;
  paragraphIndex: number;
  authorName: string;
  content: string;
  userId?: string | null;
  parentId?: string | null;
  isTypoReport: boolean;
  isResolved: boolean;
  createdAt: Date;
}

const inMemoryParagraphComments: ParagraphCommentItem[] = [
  {
    id: "pc_1",
    chapterId: "ch_1",
    paragraphIndex: 1,
    authorName: "Hạ Lam",
    content: "Đoạn mở đầu êm dịu quá, đọc cảm giác nhẹ nhõm hẳn.",
    isTypoReport: false,
    isResolved: false,
    createdAt: new Date("2026-11-01T14:00:00Z"),
  },
  {
    id: "pc_2",
    chapterId: "ch_1",
    paragraphIndex: 2,
    authorName: "Độc giả kỹ tính",
    content: "Hình như đoạn này dùng từ 'râm ran' tả ve kêu ở đầu hạ sẽ hợp lý hơn.",
    isTypoReport: true,
    isResolved: false,
    createdAt: new Date("2026-11-01T15:30:00Z"),
  },
  {
    id: "pc_3",
    chapterId: "ch_2",
    paragraphIndex: 1,
    authorName: "Mộc Miên",
    content: "Tác giả miêu tả mùi mưa rơi rất chân thật!",
    isTypoReport: false,
    isResolved: false,
    createdAt: new Date("2026-11-02T09:00:00Z"),
  },
];

export async function getParagraphComments(chapterId: string): Promise<ParagraphCommentItem[]> {
  try {
    const db = await getDb();
    if (db) {
      const rows = await db
        .select()
        .from(paragraphComments)
        .where(eq(paragraphComments.chapterId, chapterId))
        .orderBy(paragraphComments.createdAt);

      if (rows && rows.length > 0) {
        return rows as unknown as ParagraphCommentItem[];
      }
    }
  } catch (error) {
    console.warn("Could not query D1 paragraph comments, using in-memory store:", error);
  }

  return inMemoryParagraphComments.filter((c) => c.chapterId === chapterId);
}

export type CommentActionResult = {
  success: boolean;
  message: string;
  newComment?: ParagraphCommentItem;
};

export async function createParagraphComment(
  chapterId: string,
  paragraphIndex: number,
  content: string,
  isTypoReport: boolean,
  parentId?: string | null
): Promise<CommentActionResult> {
  const user = await getAuthSession();

  if (!user) {
    return {
      success: false,
      message: "Vui lòng đăng nhập bằng Google để gửi bình luận hoặc báo lỗi.",
    };
  }

  let finalAuthorName = user.nickname || user.name || "Thành viên Google";
  if (user.role === "ADMIN" && !finalAuthorName.startsWith("[Admin]")) {
    finalAuthorName = `[Admin] ${finalAuthorName}`;
  }

  if (!content || content.trim().length === 0) {
    return { success: false, message: "Nội dung bình luận không được để trống." };
  }

  const commentData: ParagraphCommentItem = {
    id: generateId("pc"),
    chapterId,
    paragraphIndex,
    authorName: finalAuthorName,
    content: content.trim(),
    userId: user.id,
    parentId: parentId || null,
    isTypoReport,
    isResolved: false,
    createdAt: new Date(),
  };

  let parentComment: { userId: string | null; authorName: string } | null = null;
  let targetTitle = "Chương truyện";

  try {
    const db = await getDb();
    if (db) {
      await db.insert(paragraphComments).values({
        id: commentData.id,
        chapterId,
        paragraphIndex,
        authorName: commentData.authorName,
        content: commentData.content,
        userId: user.id,
        parentId: commentData.parentId,
        isTypoReport: commentData.isTypoReport,
        isResolved: false,
        createdAt: commentData.createdAt,
      });

      // Query parent comment if replying
      if (parentId) {
        const parentRows = await db
          .select({
            userId: paragraphComments.userId,
            authorName: paragraphComments.authorName,
          })
          .from(paragraphComments)
          .where(eq(paragraphComments.id, parentId))
          .limit(1);

        if (parentRows.length > 0) {
          parentComment = parentRows[0];
        }
      }

      // Query chapter & story details
      const chapterInfo = await db
        .select({
          chapterNumber: chapters.chapterNumber,
          chapterTitle: chapters.title,
          storyTitle: stories.title,
        })
        .from(chapters)
        .leftJoin(stories, eq(chapters.storyId, stories.id))
        .where(eq(chapters.id, chapterId))
        .limit(1);

      if (chapterInfo.length > 0) {
        const ch = chapterInfo[0];
        targetTitle = ch.storyTitle
          ? `${ch.storyTitle} - Chương ${ch.chapterNumber}`
          : `Chương ${ch.chapterNumber}: ${ch.chapterTitle}`;
      }
    } else {
      throw new Error("No D1 connection");
    }
  } catch (error) {
    console.warn("D1 offline, saved paragraph comment to memory cache:", error);
    inMemoryParagraphComments.push(commentData);
  }

  // Dispatch in-app and email notifications
  await dispatchCommentNotifications({
    actorName: commentData.authorName,
    actorId: user.id,
    content: commentData.content,
    targetType: "paragraph",
    targetId: chapterId,
    targetTitle,
    link: `/chuong/${chapterId}`,
    parentId: parentId || null,
    parentUserId: parentComment?.userId || null,
    parentAuthorName: parentComment?.authorName || null,
    paragraphIndex,
  });

  revalidatePath(`/chuong/${chapterId}`);
  return {
    success: true,
    message: isTypoReport
      ? "Cảm ơn bạn đã báo lỗi chính tả! Ban biên tập sẽ kiểm tra lại."
      : "Đã gửi bình luận thành công!",
    newComment: commentData,
  };
}

export async function deleteParagraphComment(
  commentId: string
): Promise<{ success: boolean; message: string }> {
  const user = await getAuthSession();
  if (!user) {
    return { success: false, message: "Vui lòng đăng nhập." };
  }

  const isAdmin = user.role === "ADMIN" || checkIsAdminEmail(user.email);

  try {
    const db = await getDb();
    if (db) {
      const rows = await db
        .select()
        .from(paragraphComments)
        .where(eq(paragraphComments.id, commentId))
        .limit(1);

      if (rows.length === 0) {
        return { success: false, message: "Không tìm thấy bình luận." };
      }

      const target = rows[0];
      const isOwner = target.userId && target.userId === user.id;

      if (!isOwner && !isAdmin) {
        return { success: false, message: "Bạn không có quyền xóa bình luận này." };
      }

      await db
        .delete(paragraphComments)
        .where(
          or(
            eq(paragraphComments.id, commentId),
            eq(paragraphComments.parentId, commentId)
          )
        );

      revalidatePath(`/chuong/${target.chapterId}`);
      return { success: true, message: "Đã xóa bình luận thành công!" };
    } else {
      // In-memory fallback
      const idx = inMemoryParagraphComments.findIndex((c) => c.id === commentId);
      if (idx !== -1) {
        const item = inMemoryParagraphComments[idx];
        if (!isAdmin && item.userId !== user.id) {
          return { success: false, message: "Bạn không có quyền xóa bình luận này." };
        }
        inMemoryParagraphComments.splice(idx, 1);
        return { success: true, message: "Đã xóa bình luận thành công!" };
      }
      return { success: false, message: "Không tìm thấy bình luận." };
    }
  } catch (error) {
    console.error("Error deleting paragraph comment:", error);
    return { success: false, message: "Lỗi hệ thống khi xóa bình luận." };
  }
}

