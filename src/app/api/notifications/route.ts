import { NextRequest, NextResponse } from "next/server";
import { getDb, notifications } from "@/db";
import { eq, or, desc, sql } from "drizzle-orm";
import { getAuthSession, checkIsAdminEmail } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }

  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const isAdmin = session.role === "ADMIN" || checkIsAdminEmail(session.email);

    // Admins see notifications intended for admin OR directed to them personally
    const condition = isAdmin
      ? or(
          eq(notifications.forAdmin, true),
          sql`${notifications.forAdmin} = 1`,
          eq(notifications.userId, session.id)
        )
      : eq(notifications.userId, session.id);

    const rows = await db
      .select()
      .from(notifications)
      .where(condition)
      .orderBy(desc(notifications.createdAt))
      .limit(40);

    const list = rows.map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      actorName: r.actorName,
      link: r.link,
      type: r.type,
      targetType: r.targetType,
      isRead: Boolean(r.isRead),
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }));

    const unreadCount = list.filter((n) => !n.isRead).length;

    return NextResponse.json({
      notifications: list,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { notificationId, markAll } = body;

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const isAdmin = session.role === "ADMIN" || checkIsAdminEmail(session.email);

    if (markAll) {
      const condition = isAdmin
        ? or(
            eq(notifications.forAdmin, true),
            sql`${notifications.forAdmin} = 1`,
            eq(notifications.userId, session.id)
          )
        : eq(notifications.userId, session.id);

      await db
        .update(notifications)
        .set({ isRead: true })
        .where(condition);

      return NextResponse.json({ success: true, message: "Đã đánh dấu tất cả là đã đọc." });
    }

    if (notificationId) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, notificationId));

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 400 });
  } catch (error) {
    console.error("Error updating notification status:", error);
    return NextResponse.json({ error: "Lỗi hệ thống." }, { status: 500 });
  }
}
