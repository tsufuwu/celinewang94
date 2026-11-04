import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export function generateId(prefix: string = "c"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

// 1. Stories Table
export const stories = sqliteTable(
  "stories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId("story")),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    author: text("author").notNull(),
    coverUrl: text("cover_url"),
    description: text("description"),
    contentHtml: text("content_html"),
    customCss: text("custom_css"),
    status: text("status", { enum: ["ONGOING", "COMPLETED", "DROPPED"] })
      .notNull()
      .default("ONGOING"),
    tags: text("tags", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("stories_slug_idx").on(table.slug)]
);

// 2. Chapters Table
export const chapters = sqliteTable(
  "chapters",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId("ch")),
    storyId: text("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    chapterNumber: integer("chapter_number").notNull(),
    title: text("title").notNull(),
    wordCount: integer("word_count").notNull().default(0),
    password: text("password"),
    passwordHint: text("password_hint"),
    lockMessage: text("lock_message"),
    contentHtml: text("content_html"),
    paragraphs: text("paragraphs", { mode: "json" })
      .$type<{ index: number; text: string }[]>()
      .notNull()
      .default(sql`'[]'`),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("chapters_story_idx").on(table.storyId),
    index("chapters_story_number_idx").on(table.storyId, table.chapterNumber),
  ]
);

// 3. Paragraph Comments Table
export const paragraphComments = sqliteTable(
  "paragraph_comments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId("pc")),
    chapterId: text("chapter_id")
      .notNull()
      .references(() => chapters.id, { onDelete: "cascade" }),
    paragraphIndex: integer("paragraph_index").notNull(),
    authorName: text("author_name").notNull(),
    content: text("content").notNull(),
    isTypoReport: integer("is_typo_report", { mode: "boolean" })
      .notNull()
      .default(false),
    isResolved: integer("is_resolved", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("pc_chapter_idx").on(table.chapterId),
    index("pc_chapter_paragraph_idx").on(table.chapterId, table.paragraphIndex),
  ]
);

// 4. Reviews Table
export const reviews = sqliteTable(
  "reviews",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId("rev")),
    storyId: text("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    rating: integer("rating").notNull(),
    content: text("content").notNull(),
    likes: integer("likes").notNull().default(0),
    parentId: text("parent_id"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("reviews_story_idx").on(table.storyId),
    index("reviews_parent_idx").on(table.parentId),
  ]
);

// 5. Guestbook Posts Table
export const guestbookPosts = sqliteTable(
  "guestbook_posts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId("gb")),
    authorName: text("author_name").notNull(),
    isAdmin: integer("is_admin", { mode: "boolean" })
      .notNull()
      .default(false),
    title: text("title"),
    content: text("content").notNull(),
    parentId: text("parent_id"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("gb_parent_idx").on(table.parentId)]
);

// 6. Editor Templates & Snippets Table
export const editorTemplates = sqliteTable(
  "editor_templates",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId("tmpl")),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category").notNull().default("custom"),
    htmlCode: text("html_code").notNull(),
    cssCode: text("css_code"),
    isBuiltin: integer("is_builtin", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  }
);

// 7. Site Settings Table (Profile, BGM, Theme, etc.)
export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// 8. Users Table (Google OAuth Members & Admins)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // Google Sub or custom ID
  email: text("email").notNull().unique(),
  name: text("name"),
  nickname: text("nickname"),
  image: text("image"),
  role: text("role", { enum: ["USER", "ADMIN"] }).notNull().default("USER"),
  unlockedChapters: text("unlocked_chapters", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// 9. Reading Progress Table
export const readingProgress = sqliteTable(
  "reading_progress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId("rp")),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    storyId: text("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    chapterId: text("chapter_id")
      .notNull()
      .references(() => chapters.id, { onDelete: "cascade" }),
    paragraphIndex: integer("paragraph_index").notNull().default(0),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("rp_user_story_idx").on(table.userId, table.storyId),
    index("rp_user_chapter_idx").on(table.userId, table.chapterId),
  ]
);


