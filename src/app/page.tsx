import { getStories, getRecentChapters, FALLBACK_STORIES, FALLBACK_RECENT_CHAPTERS } from "@/lib/data";
import { ArchiveHero } from "@/components/home/archive-hero";
import { BentoSection } from "@/components/home/bento-section";
import { StoryList } from "@/components/home/story-list";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let stories = FALLBACK_STORIES;
  let recentChapters = FALLBACK_RECENT_CHAPTERS.slice(0, 6);

  try {
    const [dbStories, dbChapters] = await Promise.all([
      getStories(),
      getRecentChapters(6),
    ]);
    if (dbStories && dbStories.length > 0) stories = dbStories;
    if (dbChapters && dbChapters.length > 0) recentChapters = dbChapters;
  } catch (err) {
    console.warn("HomePage fetch fallback active:", err);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
      {/* 1. Hero Spotlight Slider + Characters & Works + Heartfelt Memories */}
      <ArchiveHero stories={stories} />

      {/* 2. Stories Archive with Category Tabs & Multi-Tag Search Filter */}
      <StoryList initialStories={stories} />

      {/* 3. Bento Stream: Recent Chapters + Reader Comments from WordPress */}
      <BentoSection chapters={recentChapters} />
    </div>
  );
}
