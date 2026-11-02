import { getStories, getRecentChapters } from "@/lib/data";
import { ArchiveHero } from "@/components/home/archive-hero";
import { BentoSection } from "@/components/home/bento-section";
import { StoryList } from "@/components/home/story-list";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [stories, recentChapters] = await Promise.all([
    getStories(),
    getRecentChapters(6),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
      {/* 1. Hero Spotlight Slider + Characters & Works + Heartfelt Memories */}
      <ArchiveHero stories={stories} />

      {/* 2. Bento Stream: Recent Chapters + Reader Comments from WordPress */}
      <BentoSection chapters={recentChapters} />

      {/* 3. Stories Archive with Category Tabs & Multi-Tag Search Filter */}
      <StoryList initialStories={stories} />
    </div>
  );
}
