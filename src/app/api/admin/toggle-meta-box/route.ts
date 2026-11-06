import { NextRequest, NextResponse } from "next/server";
import { getDb, stories } from "@/db";
import { eq } from "drizzle-orm";
import { checkAdminAuth } from "@/app/admin/actions";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ success: false, message: "Chưa xác thực quyền quản trị." }, { status: 401 });
    }

    const { storyId, hide } = await req.json();
    if (!storyId) {
      return NextResponse.json({ success: false, message: "Thiếu storyId" }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: "Lỗi kết nối cơ sở dữ liệu." }, { status: 500 });
    }

    const rows = await db.select().from(stories).where(eq(stories.id, storyId)).limit(1);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, message: "Không tìm thấy truyện." }, { status: 404 });
    }

    const currentStory = rows[0];
    const currentTags = (currentStory.tags as string[]) || [];
    let updatedTags: string[];

    if (hide) {
      if (!currentTags.includes("__hide_meta_box")) {
        updatedTags = [...currentTags, "__hide_meta_box"];
      } else {
        updatedTags = currentTags;
      }
    } else {
      updatedTags = currentTags.filter((t) => t !== "__hide_meta_box");
    }

    await db
      .update(stories)
      .set({
        tags: updatedTags,
        updatedAt: new Date(),
      })
      .where(eq(stories.id, storyId));

    revalidatePath(`/truyen/${currentStory.slug}`);

    return NextResponse.json({
      success: true,
      message: hide ? "Đã xóa/ẩn khung thông tin tóm tắt." : "Đã khôi phục khung thông tin tóm tắt.",
      hidden: hide,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error)?.message || "Lỗi xử lý" },
      { status: 500 }
    );
  }
}

