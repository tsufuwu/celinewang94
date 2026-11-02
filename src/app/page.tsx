import { getStories, getRecentChapters } from "@/lib/data";
import { RandomStoryCard } from "@/components/home/random-story-card";
import { BentoSection } from "@/components/home/bento-section";
import { StoryList } from "@/components/home/story-list";

export const revalidate = 60; // ISR cache revalidation every minute

export default async function HomePage() {
  const [stories, recentChapters] = await Promise.all([
    getStories(),
    getRecentChapters(6),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
      {/* 1. Hero Area: "Hôm nay đọc gì cùng Quả Cam?" with 3D Flip Card */}
      <RandomStoryCard stories={stories} />

      {/* 2. Bento Stream: Recent Chapters + Reader Comments from WordPress */}
      <BentoSection chapters={recentChapters} />

      {/* 3. Stories Archive with Category Tabs & Multi-Tag Search Filter */}
      <StoryList initialStories={stories} />
    </div>
  );
}
