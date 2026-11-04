export interface BookshelfItem {
  storyId: string;
  storySlug: string;
  storyTitle: string;
  storyAuthor?: string;
  coverUrl?: string | null;
  lastChapterId?: string;
  lastChapterNumber?: number;
  lastChapterTitle?: string;
  updatedAt: string; // ISO date string
}

const STORAGE_KEY = "user_bookshelf_data";

export function getLocalBookshelf(): BookshelfItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Migrate from old user_bookmarked_stories if any
      const oldRaw = localStorage.getItem("user_bookmarked_stories");
      if (oldRaw) {
        const oldIds: string[] = JSON.parse(oldRaw);
        return oldIds.map((id) => ({
          storyId: id,
          storySlug: id.replace("story_", ""),
          storyTitle: "Truyện đã lưu",
          updatedAt: new Date().toISOString(),
        }));
      }
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveBookshelfItem(item: Partial<BookshelfItem> & { storyId: string; storySlug: string; storyTitle: string }) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalBookshelf();
    const existingIndex = list.findIndex((i) => i.storyId === item.storyId || i.storySlug === item.storySlug);
    const updatedItem: BookshelfItem = {
      storyId: item.storyId,
      storySlug: item.storySlug,
      storyTitle: item.storyTitle,
      storyAuthor: item.storyAuthor || (existingIndex >= 0 ? list[existingIndex].storyAuthor : undefined),
      coverUrl: item.coverUrl || (existingIndex >= 0 ? list[existingIndex].coverUrl : undefined),
      lastChapterId: item.lastChapterId || (existingIndex >= 0 ? list[existingIndex].lastChapterId : undefined),
      lastChapterNumber: item.lastChapterNumber || (existingIndex >= 0 ? list[existingIndex].lastChapterNumber : undefined),
      lastChapterTitle: item.lastChapterTitle || (existingIndex >= 0 ? list[existingIndex].lastChapterTitle : undefined),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = updatedItem;
    } else {
      list.unshift(updatedItem);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // Also sync old array for backwards compat
    const ids = list.map((i) => i.storyId);
    localStorage.setItem("user_bookmarked_stories", JSON.stringify(ids));

    // Dispatch event so other components (Header, etc.) update immediately
    window.dispatchEvent(new Event("bookshelf_updated"));
  } catch {
    // Ignore storage errors
  }
}

export function removeBookshelfItem(storyId: string) {
  if (typeof window === "undefined") return;
  try {
    let list = getLocalBookshelf();
    list = list.filter((i) => i.storyId !== storyId && i.storySlug !== storyId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    const ids = list.map((i) => i.storyId);
    localStorage.setItem("user_bookmarked_stories", JSON.stringify(ids));
    window.dispatchEvent(new Event("bookshelf_updated"));
  } catch {
    // Ignore
  }
}

export function isStoryInBookshelf(storyId: string, storySlug?: string): boolean {
  if (typeof window === "undefined") return false;
  const list = getLocalBookshelf();
  return list.some((i) => i.storyId === storyId || (storySlug && i.storySlug === storySlug));
}
