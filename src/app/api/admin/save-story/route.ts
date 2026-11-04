import { NextRequest, NextResponse } from "next/server";
import { getDb, stories } from "@/db";
import { eq } from "drizzle-orm";
import { checkAdminAuth } from "@/app/admin/actions";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ success: false, message: "Chưa xác thực quyền quản trị." }, { status: 401 });
    }

    const { storyId, contentHtml, customCss } = await req.json();
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: "Không thể kết nối D1 Database." }, { status: 500 });
    }

    const existing = await db
      .select({ id: stories.id, slug: stories.slug })
      .from(stories)
      .where(eq(stories.id, storyId))
      .limit(1);

    if (!existing || existing.length === 0) {
      return NextResponse.json({ success: false, message: "Không tìm thấy tác phẩm trong hệ thống." }, { status: 404 });
    }

    await db
      .update(stories)
      .set({
        contentHtml,
        customCss: customCss || null,
        updatedAt: new Date(),
      })
      .where(eq(stories.id, storyId));

    revalidatePath(`/truyen/${existing[0].slug}`);
    revalidatePath("/admin/editor");

    return NextResponse.json({
      success: true,
      message: "Đã lưu trang giới thiệu và tùy biến CSS thành công!",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: `Lỗi lưu tác phẩm: ${(error as Error)?.message || String(error)}` },
      { status: 500 }
    );
  }
}

