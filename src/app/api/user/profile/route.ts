import { NextRequest, NextResponse } from "next/server";
import { getAuthSession, signAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { getDb, users } from "@/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { nickname?: string };
    const newNickname = body.nickname?.trim();

    if (!newNickname || newNickname.length < 2 || newNickname.length > 30) {
      return NextResponse.json(
        { error: "Biệt danh phải từ 2 đến 30 ký tự." },
        { status: 400 }
      );
    }

    const db = await getDb();
    if (db) {
      await db
        .update(users)
        .set({ nickname: newNickname })
        .where(eq(users.id, session.id));
    }

    const updatedUser = {
      ...session,
      nickname: newNickname,
    };

    // Resign JWT cookie with updated nickname (0 D1 reads going forward)
    const newToken = await signAuthToken(updatedUser);
    const res = NextResponse.json({ success: true, user: updatedUser });
    res.cookies.set(AUTH_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Lỗi cập nhật hồ sơ." }, { status: 500 });
  }
}

