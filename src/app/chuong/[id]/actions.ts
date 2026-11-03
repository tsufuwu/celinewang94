"use server";

import { revalidatePath } from "next/cache";
import { getDb, paragraphComments, generateId } from "@/db";
import { eq } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth";

export interface ParagraphCommentItem {
  id: string;
  chapterId: string;
  paragraphIndex: number;
  authorName: string;
  content: string;
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
  authorName: string,
  content: string,
  isTypoReport: boolean
): Promise<CommentActionResult> {
  const user = await getAuthSession();
  let finalAuthorName = authorName ? authorName.trim() : "";

  if (user) {
    // If logged in via Google OAuth, locked to authenticated identity
    finalAuthorName = user.nickname || user.name || finalAuthorName || "Thành viên Google";
    if (user.role === "ADMIN" && !finalAuthorName.startsWith("[Admin]")) {
      finalAuthorName = `[Admin] ${finalAuthorName}`;
    }
  }

  if (!finalAuthorName || finalAuthorName.length === 0) {
    return { success: false, message: "Vui lòng nhập tên hoặc biệt danh của bạn." };
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
    isTypoReport,
    isResolved: false,
    createdAt: new Date(),
  };

  try {
    const db = await getDb();
    if (db) {
      await db.insert(paragraphComments).values({
        id: commentData.id,
        chapterId,
        paragraphIndex,
        authorName: commentData.authorName,
        content: commentData.content,
        isTypoReport: commentData.isTypoReport,
        isResolved: false,
        createdAt: commentData.createdAt,
      });
    } else {
      throw new Error("No D1 connection");
    }
  } catch (error) {
    console.warn("D1 offline, saved paragraph comment to memory cache:", error);
    inMemoryParagraphComments.push(commentData);
  }

  revalidatePath(`/chuong/${chapterId}`);
  return {
    success: true,
    message: isTypoReport
      ? "Cảm ơn bạn đã báo lỗi chính tả! Ban biên tập sẽ kiểm tra lại."
      : "Đã gửi bình luận thành công!",
    newComment: commentData,
  };
}
