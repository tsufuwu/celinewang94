import { NextRequest, NextResponse } from "next/server";
import { getDb, chapters } from "@/db";
import { eq } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { chapterId } = await req.json();
    if (!chapterId) {
      return NextResponse.json({ success: false, message: "Missing chapterId" }, { status: 400 });
    }

    const db = await getDb();
    if (db) {
      await db.delete(chapters).where(eq(chapters.id, chapterId));
      return NextResponse.json({ success: true, message: "Đã xóa chương thành công!" });
    }

    return NextResponse.json({ success: false, message: "Database unavailable" }, { status: 500 });
  } catch (error) {
    console.error("Error deleting chapter:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi xóa chương." },
      { status: 500 }
    );
  }
}

