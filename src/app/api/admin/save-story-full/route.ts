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

    const payload = await req.json();
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ success: false, message: "Không thể kết nối D1 Database." }, { status: 500 });
    }

    const { id, title, slug, author, status, tags, coverUrl, description, contentHtml, customCss } = payload;

    if (!title || !slug || !author) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập đầy đủ Tên truyện, Đường dẫn (slug) và Tác giả." },
        { status: 400 }
      );
    }

    const now = new Date();
    const cleanTags = Array.isArray(tags) ? tags : [];

    if (id) {
      // Check existing story by ID
      const existing = await db
        .select({ id: stories.id, slug: stories.slug })
        .from(stories)
        .where(eq(stories.id, id))
        .limit(1);

      if (existing && existing.length > 0) {
        await db
          .update(stories)
          .set({
            title: title.trim(),
            slug: slug.trim(),
            author: author.trim(),
            status: status || "ONGOING",
            tags: cleanTags,
            coverUrl: coverUrl || null,
            description: description || null,
            contentHtml: contentHtml || null,
            customCss: customCss || null,
            updatedAt: now,
          })
          .where(eq(stories.id, id));

        revalidatePath(`/truyen/${slug.trim()}`);
        if (existing[0].slug !== slug.trim()) {
          revalidatePath(`/truyen/${existing[0].slug}`);
        }
        revalidatePath("/kho-truyen");
        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/editor");

        return NextResponse.json({
          success: true,
          message: `Đã lưu cập nhật thông tin tác phẩm "${title.trim()}" thành công!`,
          storyId: id,
          slug: slug.trim(),
        });
      }
    }

    // Insert new story
    const newId = `story_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    await db.insert(stories).values({
      id: newId,
      title: title.trim(),
      slug: slug.trim(),
      author: author.trim(),
      status: status || "ONGOING",
      tags: cleanTags,
      coverUrl: coverUrl || null,
      description: description || null,
      contentHtml: contentHtml || null,
      customCss: customCss || null,
      createdAt: now,
      updatedAt: now,
    });

    revalidatePath(`/truyen/${slug.trim()}`);
    revalidatePath("/kho-truyen");
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/editor");

    return NextResponse.json({
      success: true,
      message: `Đã tạo mới tác phẩm "${title.trim()}" thành công!`,
      storyId: newId,
      slug: slug.trim(),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: `Lỗi lưu thông tin truyện: ${(error as Error)?.message || String(error)}` },
      { status: 500 }
    );
  }
}

