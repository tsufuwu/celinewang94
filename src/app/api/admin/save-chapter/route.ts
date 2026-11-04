import { NextRequest, NextResponse } from "next/server";
import { getDb, chapters } from "@/db";
import { eq } from "drizzle-orm";
import { checkAdminAuth } from "@/app/admin/actions";
import { revalidatePath } from "next/cache";
import * as cheerio from "cheerio";

function countWordsFromHtml(html: string): number {
  if (!html) return 0;
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plain ? plain.split(" ").length : 0;
}

function parseHtmlToParagraphs(html: string): { index: number; text: string }[] {
  if (!html) return [];
  const $ = cheerio.load(html);
  const paragraphs: { index: number; text: string }[] = [];
  let idx = 1;

  $("p").each((_, el) => {
    const txt = $(el).text().trim();
    if (txt) {
      paragraphs.push({ index: idx++, text: txt });
    }
  });

  if (paragraphs.length === 0) {
    const rawLines = html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    rawLines.forEach((line) => {
      paragraphs.push({ index: idx++, text: line });
    });
  }

  return paragraphs;
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

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

    const wordCount = countWordsFromHtml(payload.contentHtml || "");
    const paragraphs = parseHtmlToParagraphs(payload.contentHtml || "");
    const now = new Date();
    const targetChapterId = payload.id;

    if (targetChapterId) {
      const existing = await db
        .select({ id: chapters.id })
        .from(chapters)
        .where(eq(chapters.id, targetChapterId))
        .limit(1);

      if (existing && existing.length > 0) {
        await db
          .update(chapters)
          .set({
            chapterNumber: payload.chapterNumber,
            title: (payload.title || "").trim() || `Chương ${payload.chapterNumber}`,
            contentHtml: payload.contentHtml,
            paragraphs,
            wordCount,
            password: payload.password?.trim() ? payload.password.trim() : null,
            passwordHint: payload.passwordHint?.trim() ? payload.passwordHint.trim() : null,
            lockMessage: payload.lockMessage?.trim() ? payload.lockMessage.trim() : null,
            updatedAt: now,
          })
          .where(eq(chapters.id, targetChapterId));

        revalidatePath(`/chuong/${targetChapterId}`);
        revalidatePath("/admin/editor");

        return NextResponse.json({
          success: true,
          message: `Đã lưu cập nhật Chương ${payload.chapterNumber} thành công!`,
          chapterId: targetChapterId,
        });
      }
    }

    // Insert new chapter
    const newId = generateId("ch");
    await db.insert(chapters).values({
      id: newId,
      storyId: payload.storyId,
      chapterNumber: payload.chapterNumber,
      title: (payload.title || "").trim() || `Chương ${payload.chapterNumber}`,
      contentHtml: payload.contentHtml,
      paragraphs,
      wordCount,
      password: payload.password?.trim() ? payload.password.trim() : null,
      passwordHint: payload.passwordHint?.trim() ? payload.passwordHint.trim() : null,
      lockMessage: payload.lockMessage?.trim() ? payload.lockMessage.trim() : null,
      createdAt: now,
      updatedAt: now,
    });

    revalidatePath(`/chuong/${newId}`);
    revalidatePath("/admin/editor");

    return NextResponse.json({
      success: true,
      message: `Đã tạo mới Chương ${payload.chapterNumber} thành công!`,
      chapterId: newId,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: `Lỗi lưu chương: ${(error as Error)?.message || String(error)}` },
      { status: 500 }
    );
  }
}

