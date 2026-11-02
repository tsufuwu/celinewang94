import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getDb, chapters, generateId } from "@/db";
import { checkAdminAuth } from "@/app/admin/actions";
import { eq, desc } from "drizzle-orm";
import type { ParsedChapter } from "@/lib/client-epub-parser";

interface BatchPayload {
  storyId: string;
  mode: "append" | "replace";
  chaptersList: ParsedChapter[];
}

export async function POST(req: NextRequest) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ success: false, message: "Chưa xác thực quyền quản trị." }, { status: 401 });
    }

    const body = (await req.json()) as BatchPayload;
    const { storyId, mode, chaptersList } = body;

    if (!storyId || !chaptersList || chaptersList.length === 0) {
      return NextResponse.json({ success: false, message: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      // In local dev without D1 binding
      return NextResponse.json({
        success: true,
        message: `Đã xử lý client-side thành công ${chaptersList.length} chương! (Chế độ mô phỏng khi D1 chưa kết nối)`,
        importedCount: chaptersList.length,
      });
    }

    // If replace mode: delete old chapters for this story
    if (mode === "replace") {
      await db.delete(chapters).where(eq(chapters.storyId, storyId));
    }

    // Determine starting chapter number
    let startingNumber = 1;
    if (mode === "append") {
      const lastChapter = await db
        .select({ chapterNumber: chapters.chapterNumber })
        .from(chapters)
        .where(eq(chapters.storyId, storyId))
        .orderBy(desc(chapters.chapterNumber))
        .limit(1);

      if (lastChapter.length > 0) {
        startingNumber = lastChapter[0].chapterNumber + 1;
      }
    }

    // Insert chapters into D1 in batches of 10 to keep within SQLite parameter limits
    const batchSize = 10;
    let count = 0;

    for (let i = 0; i < chaptersList.length; i += batchSize) {
      const slice = chaptersList.slice(i, i + batchSize);
      const rows = slice.map((ch, idx) => ({
        id: generateId("ch"),
        storyId,
        chapterNumber: mode === "replace" ? ch.chapterNumber : startingNumber + i + idx,
        title: ch.title,
        wordCount: ch.wordCount,
        paragraphs: ch.paragraphs,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await db.insert(chapters).values(rows);
      count += rows.length;
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: `Đã lưu thành công ${count} chương vào Cloudflare D1!`,
      importedCount: count,
    });
  } catch (error: unknown) {
    console.error("Batch chapter insert error:", error);
    return NextResponse.json(
      { success: false, message: (error as Error)?.message || "Lỗi lưu chương vào D1." },
      { status: 500 }
    );
  }
}

