"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import {
  getDb,
  stories,
  chapters,
  paragraphComments,
  generateId,
  editorTemplates,
  siteSettings,
} from "@/db";
import { eq, desc, asc } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth";
import {
  FALLBACK_STORIES,
  DEFAULT_CELINE_PROFILE,
  DEFAULT_BGM_PLAYLIST,
  type CelineProfileData,
  type BgmTrackItem,
  extractPlaylistId,
} from "@/lib/data";

export type { CelineProfileData, BgmTrackItem, ProfileExperience, ProfileProject } from "@/lib/data";

const COOKIE_NAME = "admin_auth_token";

function getExpectedToken(): string {
  const secret = process.env.ADMIN_PASSWORD || "admin_change_this_password";
  return crypto.createHash("sha256").update(`admin_${secret}_salt`).digest("hex");
}

// ----------------------------------------------------
// 1. AUTHENTICATION ACTIONS
// ----------------------------------------------------

export async function loginAdmin(password: string): Promise<{ success: boolean; message: string }> {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return { success: false, message: "Biến môi trường ADMIN_PASSWORD chưa được cấu hình." };
  }

  if (password.trim() !== adminPassword.trim()) {
    return { success: false, message: "Mật khẩu Quản trị viên không chính xác!" };
  }

  const token = getExpectedToken();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return { success: true, message: "Đăng nhập thành công!" };
}

export async function logoutAdmin(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return { success: true };
}

export async function checkAdminAuth(): Promise<boolean> {
  const session = await getAuthSession();
  if (session && session.role === "ADMIN") {
    return true;
  }
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return token === getExpectedToken();
}

// ----------------------------------------------------
// 2. STORY MANAGEMENT ACTIONS
// ----------------------------------------------------

export interface AdminStoryItem {
  id: string;
  slug: string;
  title: string;
  author: string;
  coverUrl: string | null;
  description: string | null;
  status: "ONGOING" | "COMPLETED" | "DROPPED";
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  _count: {
    chapters: number;
    reviews: number;
  };
}

export async function getAdminStories(): Promise<AdminStoryItem[]> {
  try {
    const db = await getDb();
    if (db) {
      const rows = await db.select().from(stories).orderBy(desc(stories.updatedAt));
      const allChapters = await db.select({ storyId: chapters.storyId }).from(chapters);

      if (rows && rows.length > 0) {
        return rows.map((s) => {
          const chCount = allChapters.filter((c) => c.storyId === s.id).length;
          return {
            ...s,
            _count: {
              chapters: chCount,
              reviews: 0,
            },
          };
        }) as unknown as AdminStoryItem[];
      }
    }
  } catch (error) {
    console.warn("D1 offline, returning fallback stories:", error);
  }

  return FALLBACK_STORIES.map((s) => ({
    ...s,
    _count: { chapters: s._count?.chapters || 0, reviews: s._count?.reviews || 0 },
  }));
}

export async function createOrUpdateStory(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) return { success: false, message: "Bạn chưa đăng nhập Quản trị viên." };

  const id = (formData.get("id") as string) || null;
  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim().toLowerCase();
  const author = (formData.get("author") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const status = ((formData.get("status") as string) || "ONGOING") as "ONGOING" | "COMPLETED" | "DROPPED";
  const tagsRaw = (formData.get("tags") as string) || "";
  const coverUrl = (formData.get("coverUrl") as string)?.trim() || null;

  if (!title || !slug || !author) {
    return { success: false, message: "Vui lòng điền đầy đủ Tiêu đề, Đường dẫn (Slug) và Tác giả." };
  }

  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim().replace(/^#/, ""))
    .filter(Boolean);

  try {
    const db = await getDb();
    if (db) {
      if (id) {
        // Check if story with this ID already exists in D1 database
        const existing = await db
          .select({ id: stories.id })
          .from(stories)
          .where(eq(stories.id, id))
          .limit(1);

        if (existing && existing.length > 0) {
          // Update existing row
          await db
            .update(stories)
            .set({
              title,
              slug,
              author,
              description,
              status,
              tags,
              coverUrl,
              updatedAt: new Date(),
            })
            .where(eq(stories.id, id));
        } else {
          // If it was seeded/fallback story not yet in D1, insert it with the specified ID
          await db.insert(stories).values({
            id,
            title,
            slug,
            author,
            description,
            status,
            tags,
            coverUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } else {
        // Create brand new story
        await db.insert(stories).values({
          id: generateId("story"),
          title,
          slug,
          author,
          description,
          status,
          tags,
          coverUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } else {
      return { success: false, message: "Không tìm thấy kết nối D1 Database trên môi trường hiện tại." };
    }
  } catch (error: unknown) {
    console.error("Save story error:", error);
    return { success: false, message: `Lỗi lưu truyện vào D1 Database: ${(error as Error)?.message || String(error)}` };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/truyen/${slug}`);
  return { success: true, message: id ? "Đã cập nhật truyện thành công!" : "Đã thêm truyện mới thành công!" };
}

export async function deleteStory(id: string): Promise<{ success: boolean; message: string }> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) return { success: false, message: "Chưa xác thực quyền quản trị." };

  try {
    const db = await getDb();
    if (db) {
      await db.delete(stories).where(eq(stories.id, id));
    }
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, message: "Đã xóa truyện thành công." };
  } catch (error: unknown) {
    return { success: false, message: `Lỗi xóa truyện: ${(error as Error)?.message || String(error)}` };
  }
}

// ----------------------------------------------------
// 3. TYPO REPORTS & CORRECTION ACTIONS
// ----------------------------------------------------

export interface TypoReportItem {
  id: string;
  chapterId: string;
  paragraphIndex: number;
  authorName: string;
  content: string;
  isResolved: boolean;
  createdAt: Date;
  chapter: {
    id: string;
    chapterNumber: number;
    title: string;
    story: {
      id: string;
      title: string;
      slug: string;
    };
  };
  currentParagraphText: string;
}

export async function getTypoReports(): Promise<TypoReportItem[]> {
  try {
    const db = await getDb();
    if (db) {
      const rows = await db
        .select({
          comment: paragraphComments,
          chapter: chapters,
          story: stories,
        })
        .from(paragraphComments)
        .innerJoin(chapters, eq(paragraphComments.chapterId, chapters.id))
        .innerJoin(stories, eq(chapters.storyId, stories.id))
        .where(eq(paragraphComments.isTypoReport, true))
        .orderBy(paragraphComments.isResolved, desc(paragraphComments.createdAt));

      if (rows && rows.length > 0) {
        return rows.map((r) => {
          const pList = r.chapter.paragraphs || [];
          const currentP = pList.find((p) => p.index === r.comment.paragraphIndex);

          return {
            id: r.comment.id,
            chapterId: r.comment.chapterId,
            paragraphIndex: r.comment.paragraphIndex,
            authorName: r.comment.authorName,
            content: r.comment.content,
            isResolved: r.comment.isResolved,
            createdAt: r.comment.createdAt,
            chapter: {
              id: r.chapter.id,
              chapterNumber: r.chapter.chapterNumber,
              title: r.chapter.title,
              story: {
                id: r.story.id,
                title: r.story.title,
                slug: r.story.slug,
              },
            },
            currentParagraphText: currentP?.text || "(Không tìm thấy đoạn văn tương ứng)",
          };
        });
      }
    }
  } catch (error) {
    console.warn("D1 offline, returning empty or sample typo reports:", error);
  }

  return [
    {
      id: "typo_sample_1",
      chapterId: "ch_1",
      paragraphIndex: 2,
      authorName: "Độc giả kỹ tính",
      content: "Hình như đoạn này dùng từ 'râm ran' tả ve kêu ở đầu hạ sẽ hợp lý hơn từ 'rộn rã'.",
      isResolved: false,
      createdAt: new Date("2026-11-01T15:30:00Z"),
      chapter: {
        id: "ch_1",
        chapterNumber: 24,
        title: "Mùa hạ khép lại sau ô cửa",
        story: {
          id: "story_1",
          title: "Khu Vườn Mùa Hạ Sau Cơn Mưa",
          slug: "khu-vuon-mua-ha-sau-con-mua",
        },
      },
      currentParagraphText:
        "Tiếng nước sôi tí tách trên chiếc bếp đất nung reo vui, hương hoa nhài rộn rã hòa quyện cùng mùi giấy mới và mực tàu.",
    },
  ];
}

export async function resolveTypoAndFixParagraph(
  commentId: string,
  chapterId: string,
  paragraphIndex: number,
  newText: string
): Promise<{ success: boolean; message: string }> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) return { success: false, message: "Chưa xác thực quyền quản trị." };

  if (!newText || newText.trim().length === 0) {
    return { success: false, message: "Nội dung đoạn văn không được để trống." };
  }

  try {
    const db = await getDb();
    if (!db) {
      return { success: false, message: "Không tìm thấy kết nối D1 Database." };
    }

    // 1. Fetch chapter
    const rows = await db
      .select({ paragraphs: chapters.paragraphs })
      .from(chapters)
      .where(eq(chapters.id, chapterId))
      .limit(1);

    if (rows.length === 0) {
      return { success: false, message: "Không tìm thấy chương truyện này." };
    }

    const currentParagraphs = rows[0].paragraphs || [];
    let updated = false;

    const newParagraphs = currentParagraphs.map((p) => {
      if (p.index === paragraphIndex) {
        updated = true;
        return { ...p, text: newText.trim() };
      }
      return p;
    });

    if (!updated) {
      return { success: false, message: `Không tìm thấy đoạn văn số #${paragraphIndex} trong chương.` };
    }

    // 2. Update Chapter paragraphs in D1
    await db
      .update(chapters)
      .set({
        paragraphs: newParagraphs,
        updatedAt: new Date(),
      })
      .where(eq(chapters.id, chapterId));

    // 3. Mark typo report as resolved
    await db
      .update(paragraphComments)
      .set({ isResolved: true })
      .where(eq(paragraphComments.id, commentId));

    revalidatePath(`/chuong/${chapterId}`);
    revalidatePath("/admin");

    return {
      success: true,
      message: `Đã sửa đoạn văn #${paragraphIndex} và đánh dấu đã xử lý thành công!`,
    };
  } catch (error: unknown) {
    console.error("Resolve typo error:", error);
    return {
      success: false,
      message: `Lỗi cập nhật: ${(error as Error)?.message || String(error)}`,
    };
  }
}

// ----------------------------------------------------
// 4. HYBRID STUDIO EDITOR ACTIONS
// ----------------------------------------------------

export interface EditorTemplateItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  htmlCode: string;
  cssCode: string | null;
  isBuiltin: boolean;
  createdAt: Date;
}

export async function saveStoryContentHtml(
  storyId: string,
  contentHtml: string,
  customCss?: string
): Promise<{ success: boolean; message: string }> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) return { success: false, message: "Chưa xác thực quyền quản trị." };

  try {
    const db = await getDb();
    if (!db) return { success: false, message: "Không thể kết nối D1 Database." };

    await db
      .update(stories)
      .set({
        contentHtml,
        customCss: customCss || null,
        updatedAt: new Date(),
      })
      .where(eq(stories.id, storyId));

    const storyRow = await db.select({ slug: stories.slug }).from(stories).where(eq(stories.id, storyId)).limit(1);
    const slug = storyRow[0]?.slug;

    revalidatePath("/");
    revalidatePath("/admin");
    if (slug) revalidatePath(`/truyen/${slug}`);

    return { success: true, message: "Đã lưu bản dựng nghệ thuật trang truyện thành công!" };
  } catch (error: unknown) {
    return { success: false, message: `Lỗi lưu nội dung: ${(error as Error)?.message || String(error)}` };
  }
}

export async function saveChapterContentHtml(
  chapterId: string,
  contentHtml: string
): Promise<{ success: boolean; message: string }> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) return { success: false, message: "Chưa xác thực quyền quản trị." };

  try {
    const db = await getDb();
    if (!db) return { success: false, message: "Không thể kết nối D1 Database." };

    await db
      .update(chapters)
      .set({
        contentHtml,
        updatedAt: new Date(),
      })
      .where(eq(chapters.id, chapterId));

    revalidatePath(`/chuong/${chapterId}`);
    return { success: true, message: "Đã lưu nội dung chương thành công!" };
  } catch (error: unknown) {
    return { success: false, message: `Lỗi lưu chương: ${(error as Error)?.message || String(error)}` };
  }
}

export interface EditorStoryOption {
  id: string;
  slug: string;
  title: string;
  author: string;
  contentHtml?: string | null;
  customCss?: string | null;
  chapters: {
    id: string;
    chapterNumber: number;
    title: string;
    contentHtml?: string | null;
    password?: string | null;
  }[];
}

export async function getEditorStories(): Promise<EditorStoryOption[]> {
  try {
    const db = await getDb();
    if (db) {
      const allStories = await db.select().from(stories).orderBy(desc(stories.updatedAt));
      const allChapters = await db
        .select({
          id: chapters.id,
          storyId: chapters.storyId,
          chapterNumber: chapters.chapterNumber,
          title: chapters.title,
          contentHtml: chapters.contentHtml,
          password: chapters.password,
        })
        .from(chapters)
        .orderBy(asc(chapters.chapterNumber));

      if (allStories && allStories.length > 0) {
        return allStories.map((s) => ({
          id: s.id,
          slug: s.slug,
          title: s.title,
          author: s.author,
          contentHtml: s.contentHtml,
          customCss: s.customCss,
          chapters: allChapters.filter((c) => c.storyId === s.id),
        }));
      }
    }
  } catch (error) {
    console.warn("Could not query stories for editor:", error);
  }

  return FALLBACK_STORIES.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    author: s.author,
    contentHtml: null,
    customCss: null,
    chapters: [],
  }));
}

export async function getEditorTemplates(): Promise<EditorTemplateItem[]> {
  try {
    const db = await getDb();
    if (db) {
      const rows = await db.select().from(editorTemplates).orderBy(desc(editorTemplates.createdAt));
      return rows.map((r) => ({
        ...r,
        isBuiltin: Boolean(r.isBuiltin),
      })) as EditorTemplateItem[];
    }
  } catch (error) {
    console.warn("Could not query editor_templates from D1:", error);
  }
  return [];
}

export async function saveEditorTemplate(
  title: string,
  description: string,
  htmlCode: string,
  cssCode?: string,
  category: string = "custom"
): Promise<{ success: boolean; message: string; template?: EditorTemplateItem }> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) return { success: false, message: "Chưa xác thực quyền quản trị." };

  try {
    const db = await getDb();
    if (!db) return { success: false, message: "Không thể kết nối D1 Database." };

    const id = generateId("tmpl");
    const newTmpl = {
      id,
      title: title.trim(),
      description: description.trim() || null,
      category,
      htmlCode,
      cssCode: cssCode?.trim() || null,
      isBuiltin: false,
      createdAt: new Date(),
    };

    await db.insert(editorTemplates).values(newTmpl);

    return {
      success: true,
      message: "Đã lưu khối HTML/CSS thành mẫu giao diện thành công!",
      template: newTmpl,
    };
  } catch (error: unknown) {
    return { success: false, message: `Lỗi lưu mẫu: ${(error as Error)?.message || String(error)}` };
  }
}

// ----------------------------------------------------
// 7. PROFILE & CV SETTINGS ACTIONS
// ----------------------------------------------------

export async function getAdminProfileSettings(): Promise<CelineProfileData> {
  try {
    const db = await getDb();
    if (db) {
      const rows = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, "celine_profile"))
        .limit(1);
      if (rows && rows.length > 0 && rows[0].value) {
        const parsed = JSON.parse(rows[0].value);
        return { ...DEFAULT_CELINE_PROFILE, ...parsed };
      }
    }
  } catch (error) {
    console.warn("Could not query D1 admin profile:", error);
  }
  return DEFAULT_CELINE_PROFILE;
}

export async function saveProfileSettings(
  profileData: CelineProfileData
): Promise<{ success: boolean; message: string }> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) return { success: false, message: "Chưa xác thực quyền quản trị." };

  try {
    const db = await getDb();
    if (!db) return { success: false, message: "Không thể kết nối D1 Database." };

    const jsonValue = JSON.stringify(profileData);
    const now = new Date();

    await db
      .insert(siteSettings)
      .values({
        key: "celine_profile",
        value: jsonValue,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: jsonValue,
          updatedAt: now,
        },
      });

    revalidatePath("/gioi-thieu");
    return { success: true, message: "Đã lưu thông tin Giới Thiệu (CV) thành công!" };
  } catch (error: unknown) {
    return {
      success: false,
      message: `Lỗi lưu Giới Thiệu: ${(error as Error)?.message || String(error)}`,
    };
  }
}

// ----------------------------------------------------
// 8. BGM SETTINGS ACTIONS
// ----------------------------------------------------

export async function getBgmPlaylistSetting(): Promise<{
  playlistId: string;
  playlistUrl: string;
}> {
  try {
    const db = await getDb();
    if (db) {
      const rows = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, "bgm_playlist_id"))
        .limit(1);
      if (rows && rows.length > 0 && rows[0].value) {
        const id = rows[0].value.trim();
        if (id) {
          return {
            playlistId: id,
            playlistUrl: `https://www.youtube.com/playlist?list=${id}`,
          };
        }
      }
    }
  } catch (error) {
    console.warn("Could not query D1 BGM playlist setting:", error);
  }

  return {
    playlistId: "PLWsWIKUX9PRq7aPRAwjjwDid_e0_K2P3Y",
    playlistUrl: "https://www.youtube.com/playlist?list=PLWsWIKUX9PRq7aPRAwjjwDid_e0_K2P3Y",
  };
}

export async function saveBgmPlaylistSetting(
  playlistUrlOrId: string
): Promise<{ success: boolean; message: string; playlistId?: string }> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) return { success: false, message: "Chưa xác thực quyền quản trị." };

  const id = extractPlaylistId(playlistUrlOrId);
  if (!id) {
    return {
      success: false,
      message: "Liên kết Playlist hoặc Mã Playlist YouTube không hợp lệ (cần chứa '?list=...').",
    };
  }

  try {
    const db = await getDb();
    if (!db) return { success: false, message: "Không thể kết nối D1 Database." };

    const now = new Date();
    await db
      .insert(siteSettings)
      .values({
        key: "bgm_playlist_id",
        value: id,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: id,
          updatedAt: now,
        },
      });

    revalidatePath("/");
    return {
      success: true,
      message: `Đã khóa cứng và cập nhật Playlist BGM (${id}) thành công!`,
      playlistId: id,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: `Lỗi lưu cài đặt Playlist BGM: ${(error as Error)?.message || String(error)}`,
    };
  }
}

export async function getAdminBgmPlaylist(): Promise<BgmTrackItem[]> {
  try {
    const db = await getDb();
    if (db) {
      const rows = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, "bgm_playlist"))
        .limit(1);
      if (rows && rows.length > 0 && rows[0].value) {
        const parsed = JSON.parse(rows[0].value);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
  } catch (error) {
    console.warn("Could not query D1 admin BGM playlist:", error);
  }
  return DEFAULT_BGM_PLAYLIST;
}

export async function saveBgmPlaylist(
  tracks: BgmTrackItem[]
): Promise<{ success: boolean; message: string }> {
  const isAuth = await checkAdminAuth();
  if (!isAuth) return { success: false, message: "Chưa xác thực quyền quản trị." };

  try {
    const db = await getDb();
    if (!db) return { success: false, message: "Không thể kết nối D1 Database." };

    const jsonValue = JSON.stringify(tracks);
    const now = new Date();

    await db
      .insert(siteSettings)
      .values({
        key: "bgm_playlist",
        value: jsonValue,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: jsonValue,
          updatedAt: now,
        },
      });

    revalidatePath("/");
    return { success: true, message: "Đã cập nhật danh sách Nhạc Nền (BGM) thành công!" };
  } catch (error: unknown) {
    return {
      success: false,
      message: `Lỗi lưu danh sách BGM: ${(error as Error)?.message || String(error)}`,
    };
  }
}

