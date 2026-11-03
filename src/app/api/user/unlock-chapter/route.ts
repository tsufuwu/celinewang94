import { NextRequest, NextResponse } from "next/server";
import { getAuthSession, signAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { getDb, users } from "@/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ success: false, guest: true });
  }

  try {
    const { chapterId } = (await req.json()) as { chapterId?: string };
    if (!chapterId) {
      return NextResponse.json({ error: "Missing chapterId" }, { status: 400 });
    }

    const currentUnlocked = new Set(session.unlockedChapters || []);
    if (!currentUnlocked.has(chapterId)) {
      currentUnlocked.add(chapterId);
      const updatedList = Array.from(currentUnlocked);

      const db = await getDb();
      if (db) {
        await db
          .update(users)
          .set({
            unlockedChapters: updatedList,
          })
          .where(eq(users.id, session.id));
      }

      const updatedUser = {
        ...session,
        unlockedChapters: updatedList,
      };

      const newToken = await signAuthToken(updatedUser);
      const res = NextResponse.json({ success: true, unlockedChapters: updatedList });
      res.cookies.set(AUTH_COOKIE_NAME, newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });

      return res;
    }

    return NextResponse.json({ success: true, unlockedChapters: Array.from(currentUnlocked) });
  } catch {
    return NextResponse.json({ error: "Lỗi lưu chương đã mở." }, { status: 500 });
  }
}

