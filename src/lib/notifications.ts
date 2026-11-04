import { getDb, notifications, generateId } from "@/db";
import { getAdminEmails } from "@/lib/auth";

export interface CreateCommentNotificationParams {
  actorName: string;
  actorId?: string | null;
  content: string;
  targetType: "story" | "chapter" | "paragraph";
  targetId: string;
  targetTitle: string;
  link: string;
  parentId?: string | null;
  parentUserId?: string | null;
  parentAuthorName?: string | null;
  paragraphIndex?: number;
}

/**
 * Sends email notifications to all registered admin emails.
 */
async function sendAdminNotificationEmail({
  subject,
  html,
  text,
}: {
  subject: string;
  html: string;
  text: string;
}) {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) return;

  const resendApiKey = process.env.RESEND_API_KEY;

  // 1. Try Resend if API key is provided
  if (resendApiKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Media Naranja <onboarding@resend.dev>",
          to: adminEmails,
          subject,
          html,
          text,
        }),
      });
      console.log(`[Notification Email] Sent via Resend to ${adminEmails.join(", ")}`);
      return;
    } catch (err) {
      console.warn("[Notification Email] Resend attempt failed:", err);
    }
  }

  // 2. Try Cloudflare Worker Mailchannels API
  try {
    const res = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [
          {
            to: adminEmails.map((email) => ({ email, name: "Admin" })),
          },
        ],
        from: {
          email: "notifications@medianaranja.site",
          name: "Media Naranja Notifications",
        },
        subject,
        content: [
          { type: "text/plain", value: text },
          { type: "text/html", value: html },
        ],
      }),
    });

    if (res.ok) {
      console.log(`[Notification Email] Sent via Mailchannels to ${adminEmails.join(", ")}`);
      return;
    }
  } catch (err) {
    console.warn("[Notification Email] Mailchannels attempt failed:", err);
  }

  // Fallback log
  console.log(`[Notification Email Queued for Admins]: ${subject} -> To: ${adminEmails.join(", ")}`);
}

/**
 * Dispatches notifications for new comments and replies:
 * 1. Admin in-app notification & Admin email notification
 * 2. Recipient in-app notification (if this is a reply to another user)
 */
export async function dispatchCommentNotifications(params: CreateCommentNotificationParams) {
  const {
    actorName,
    actorId,
    content,
    targetType,
    targetId,
    targetTitle,
    link,
    parentId,
    parentUserId,
    parentAuthorName,
    paragraphIndex,
  } = params;

  try {
    const db = await getDb();

    // Determine titles & preview
    const previewContent = content.length > 180 ? `${content.substring(0, 180)}...` : content;
    const now = new Date();

    // 1. If this is a reply to someone else, notify the original commenter!
    if (parentId && parentUserId && parentUserId !== actorId) {
      const replyTitle = `${actorName} đã trả lời bình luận của bạn tại "${targetTitle}"`;
      if (db) {
        await db.insert(notifications).values({
          id: generateId("notif"),
          userId: parentUserId,
          forAdmin: false,
          type: "COMMENT_REPLY",
          title: replyTitle,
          content: previewContent,
          actorName,
          actorId: actorId || null,
          link,
          targetType,
          targetId,
          isRead: false,
          createdAt: now,
        });
      }
    }

    // 2. Admin In-App Notification (broadcast for all admins)
    let adminTitle = "";
    let notifType: "NEW_COMMENT" | "NEW_PARAGRAPH_COMMENT" | "COMMENT_REPLY" = "NEW_COMMENT";

    if (targetType === "paragraph") {
      notifType = "NEW_PARAGRAPH_COMMENT";
      const pNum = paragraphIndex !== undefined ? paragraphIndex + 1 : "";
      adminTitle = `${actorName} vừa bình luận đoạn ${pNum} tại "${targetTitle}"`;
    } else if (parentId) {
      notifType = "COMMENT_REPLY";
      adminTitle = `${actorName} vừa trả lời bình luận của ${parentAuthorName || "bạn đọc"} tại "${targetTitle}"`;
    } else {
      notifType = "NEW_COMMENT";
      adminTitle = `${actorName} vừa để lại bình luận tại "${targetTitle}"`;
    }

    if (db) {
      await db.insert(notifications).values({
        id: generateId("notif"),
        userId: null,
        forAdmin: true,
        type: notifType,
        title: adminTitle,
        content: previewContent,
        actorName,
        actorId: actorId || null,
        link,
        targetType,
        targetId,
        isRead: false,
        createdAt: now,
      });
    }

    // 3. Admin Email Notification
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wang94.celin.workers.dev";
    const fullLink = link.startsWith("http") ? link : `${baseUrl}${link}`;

    const emailSubject = `[Media Naranja] ${adminTitle}`;
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF5EE; padding: 24px; color: #2B2623;">
        <div style="max-width: 560px; margin: 0 auto; background: #FDFBF7; border: 2px solid #2B2623; border-radius: 16px; padding: 24px; box-shadow: 4px 6px 0px #2B2623;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
            <span style="background: #E07B4C; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 8px; text-transform: uppercase;">Thông báo mới</span>
            <span style="font-size: 13px; color: #5C5146; font-weight: bold;">Media Naranja</span>
          </div>
          
          <h2 style="font-size: 18px; color: #2B2623; margin: 0 0 12px 0;">${adminTitle}</h2>
          
          <div style="background: #FAF5EE; border: 1.5px solid #2B2623; border-radius: 12px; padding: 14px 16px; margin-bottom: 20px; font-style: italic; color: #3A322D; line-height: 1.6;">
            &ldquo;${content}&rdquo;
          </div>
          
          <div style="margin-bottom: 24px; font-size: 13px; color: #5C5146;">
            <p style="margin: 4px 0;"><strong>Người gửi:</strong> ${actorName}</p>
            <p style="margin: 4px 0;"><strong>Vị trí:</strong> ${targetTitle} (${targetType})</p>
            <p style="margin: 4px 0;"><strong>Thời gian:</strong> ${now.toLocaleString("vi-VN")}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${fullLink}" style="display: inline-block; background: #E07B4C; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 13px; padding: 10px 22px; border-radius: 10px; border: 2px solid #2B2623; box-shadow: 2px 3px 0px #2B2623;">
              Xem bình luận trên web →
            </a>
          </div>
        </div>
        <p style="text-align: center; font-size: 11px; color: #8A7E72; margin-top: 16px;">
          Email tự động gửi từ hệ thống quản trị Media Naranja.
        </p>
      </div>
    `;

    const emailText = `${adminTitle}\n\nNgười gửi: ${actorName}\nVị trí: ${targetTitle}\nNội dung: ${content}\nXem tại: ${fullLink}\nThời gian: ${now.toLocaleString("vi-VN")}`;

    // Fire email sending asynchronously
    sendAdminNotificationEmail({
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
    }).catch((err) => console.warn("[sendAdminNotificationEmail error]:", err));
  } catch (error) {
    console.error("[dispatchCommentNotifications error]:", error);
  }
}
