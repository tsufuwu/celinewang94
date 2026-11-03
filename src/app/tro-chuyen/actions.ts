"use server";

import { revalidatePath } from "next/cache";
import { getDb, guestbookPosts, generateId } from "@/db";
import { desc, isNull } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth";

export interface GuestbookItem {
  id: string;
  authorName: string;
  title: string | null;
  content: string;
  isAdmin: boolean;
  parentId: string | null;
  createdAt: Date;
  replies?: GuestbookItem[];
}

const FALLBACK_GUESTBOOK_POSTS: GuestbookItem[] = [
  {
    id: "post_1",
    authorName: "Celine Wang",
    title: "Chào mừng các quả cam ghé thăm Media naranja 🍊",
    content: "Cảm ơn mọi người đã luôn đồng hành cùng Celine và các bộ truyện. Nhà Cam là nơi lưu giữ những câu chuyện dịu dàng, hy vọng đây sẽ là chốn nghỉ ngơi ấm áp của bạn sau những giờ học tập và làm việc căng thẳng ˶ˆ꒳ˆ˵",
    isAdmin: true,
    parentId: null,
    createdAt: new Date("2026-10-20T10:00:00Z"),
    replies: [
      {
        id: "post_1_reply_1",
        authorName: "Little meow meow.",
        title: null,
        content: "Em thích văn phong của chị Celine lắm luôn á, truyện nào chị chọn cũng có chiều sâu và chữa lành tâm hồn 🥺",
        isAdmin: false,
        parentId: "post_1",
        createdAt: new Date("2026-10-21T14:30:00Z"),
      },
      {
        id: "post_1_reply_2",
        authorName: "Celine Wang",
        title: null,
        content: "Cảm ơn em nhiều nhen! Có các bạn độc giả dễ thương như vậy làm động lực edit vui lắm luôn 🧡",
        isAdmin: true,
        parentId: "post_1",
        createdAt: new Date("2026-10-21T15:00:00Z"),
      },
    ],
  },
  {
    id: "post_2",
    authorName: "mxijoan",
    title: "Mê mẩn với Ôm Lấy Trọng Lực",
    content: "Vừa cày xong một lèo Ôm Lấy Trọng Lực, đoạn trên sân băng cảm xúc vỡ òa luôn ạ. Cảm ơn chị Celine đã mang một tác phẩm tuyệt vời như thế này về với tụi em!",
    isAdmin: false,
    parentId: null,
    createdAt: new Date("2026-11-01T09:15:00Z"),
    replies: [],
  },
];

const inMemoryCache: GuestbookItem[] = [...FALLBACK_GUESTBOOK_POSTS];

export async function getGuestbookPosts(): Promise<GuestbookItem[]> {
  try {
    const db = await getDb();
    if (db) {
      // 1. Get root posts
      const roots = await db
        .select()
        .from(guestbookPosts)
        .where(isNull(guestbookPosts.parentId))
        .orderBy(desc(guestbookPosts.createdAt));

      if (roots && roots.length > 0) {
        // 2. Get all replies
        const allReplies = await db
          .select()
          .from(guestbookPosts)
          .orderBy(guestbookPosts.createdAt);

        return roots.map((root) => {
          const replies = allReplies.filter((r) => r.parentId === root.id);
          return {
            ...root,
            replies,
          };
        });
      }
    }
  } catch (error) {
    console.warn("Could not query D1 guestbook, using in-memory store:", error);
  }

  return inMemoryCache;
}

export type ActionResponse = {
  success: boolean;
  message: string;
};

export async function createGuestbookPost(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const authorName = formData.get("authorName") as string;
  const content = formData.get("content") as string;
  const title = (formData.get("title") as string) || null;
  const parentId = (formData.get("parentId") as string) || null;
  const adminPin = (formData.get("adminPin") as string) || "";

  if (!authorName || authorName.trim().length === 0) {
    return { success: false, message: "Vui lòng nhập tên hoặc biệt danh của bạn." };
  }

  if (!content || content.trim().length === 0) {
    return { success: false, message: "Nội dung lời nhắn không được để trống." };
  }

  const session = await getAuthSession();
  const serverAdminPassword = process.env.ADMIN_PASSWORD;
  const isPinProvided = Boolean(adminPin && adminPin.trim().length > 0);
  const isAdmin = Boolean(
    (session && session.role === "ADMIN") ||
    (isPinProvided &&
      serverAdminPassword &&
      adminPin.trim() === serverAdminPassword.trim())
  );

  if (isPinProvided && !isAdmin) {
    return { success: false, message: "Mã PIN Quản trị viên không chính xác!" };
  }

  const newPost: GuestbookItem = {
    id: generateId("gb"),
    authorName: authorName.trim(),
    title: title?.trim() || null,
    content: content.trim(),
    isAdmin,
    parentId: parentId || null,
    createdAt: new Date(),
    replies: [],
  };

  try {
    const db = await getDb();
    if (db) {
      await db.insert(guestbookPosts).values({
        id: newPost.id,
        authorName: newPost.authorName,
        title: newPost.title,
        content: newPost.content,
        isAdmin: newPost.isAdmin,
        parentId: newPost.parentId,
        createdAt: newPost.createdAt,
      });
    } else {
      throw new Error("No D1 connection");
    }
  } catch (error) {
    console.warn("D1 not connected, storing post in local memory cache:", error);
    if (parentId) {
      const parentPost = inMemoryCache.find((p) => p.id === parentId);
      if (parentPost) {
        parentPost.replies = [...(parentPost.replies || []), newPost];
      }
    } else {
      inMemoryCache.unshift(newPost);
    }
  }

  revalidatePath("/tro-chuyen");
  return {
    success: true,
    message: isAdmin
      ? "Đã đăng thành công với tư cách Quản trị viên! ✨"
      : "Đã gửi lời nhắn thành công! Cảm ơn bạn.",
  };
}
