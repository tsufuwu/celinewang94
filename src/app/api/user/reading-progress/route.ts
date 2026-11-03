import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getDb, readingProgress } from "@/db";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ progress: null });
  }

  const storyId = req.nextUrl.searchParams.get("storyId");
  if (!storyId) {
    return NextResponse.json({ progress: null });
  }

  const db = await getDb();
  if (!db) {
    return NextResponse.json({ progress: null });
  }

  try {
    const list = await db
      .select()
      .from(readingProgress)
      .where(
        and(
          eq(readingProgress.userId, session.id),
          eq(readingProgress.storyId, storyId)
        )
      )
      .limit(1);

    return NextResponse.json({ progress: list[0] || null });
  } catch {
    return NextResponse.json({ progress: null });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ success: false, guest: true });
  }

  try {
    const body = (await req.json()) as {
      storyId: string;
      chapterId: string;
      paragraphIndex?: number;
    };

    if (!body.storyId || !body.chapterId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const pIndex = typeof body.paragraphIndex === "number" ? body.paragraphIndex : 0;
    const db = await getDb();

    if (db) {
      const existing = await db
        .select()
        .from(readingProgress)
        .where(
          and(
            eq(readingProgress.userId, session.id),
            eq(readingProgress.storyId, body.storyId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(readingProgress)
          .set({
            chapterId: body.chapterId,
            paragraphIndex: pIndex,
            updatedAt: new Date(),
          })
          .where(eq(readingProgress.id, existing[0].id));
      } else {
        await db.insert(readingProgress).values({
          id: `rp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
          userId: session.id,
          storyId: body.storyId,
          chapterId: body.chapterId,
          paragraphIndex: pIndex,
          updatedAt: new Date(),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi đồng bộ tiến độ đọc." }, { status: 500 });
  }
}

