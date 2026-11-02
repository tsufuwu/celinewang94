import { Metadata } from "next";
import Link from "next/link";
import { getStories } from "@/lib/data";
import { StoryList } from "@/components/home/story-list";
import { Library, ChevronRight, BookOpen, Sparkles } from "lucide-react";
import { OrangeLogo } from "@/components/layout/orange-logo";

export const metadata: Metadata = {
  title: "Kho Truyện & Tác Phẩm | Media naranja",
  description:
    "Toàn bộ tác phẩm, bản dịch đam mỹ, văn học chọn lọc và dự án lưu trữ của Celine Wang tại Media naranja.",
};

export const revalidate = 60; // Revalidate every minute

export default async function KhoTruyenPage() {
  const stories = await getStories();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/60" />
        <span className="text-foreground font-medium flex items-center gap-1">
          <Library className="size-3.5 text-primary" />
          <span>Kho truyện</span>
        </span>
      </nav>

      {/* Hero Banner Header for Library Archive */}
      <div className="relative rounded-3xl bg-card border border-border/80 p-6 sm:p-10 mb-8 overflow-hidden shadow-xs">
        {/* Ambient Warm Gradient Accent */}
        <div className="absolute -top-16 -right-16 size-48 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-orange-200/60 dark:border-orange-950/40 text-[11px] font-mono text-orange-800 dark:text-orange-300">
              <Sparkles className="size-3 text-primary" />
              <span>ARS LONGA, VITA BREVIS • THƯ VIỆN CHỌN LỌC</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-foreground">
              Kho Truyện & Tác Phẩm
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-sans font-normal">
              Nơi lưu trữ những bộ truyện hoàn thành, các bản dịch công phu và những bản thảo đang được ấp ủ bởi Celine Wang. Dùng thanh tìm kiếm và bộ lọc thẻ bên dưới để tìm câu chuyện phù hợp với tâm trạng của bạn.
            </p>
          </div>

          {/* Quick Stats Box */}
          <div className="flex sm:flex-col gap-3 shrink-0 self-start md:self-auto bg-muted/40 p-4 rounded-2xl border border-border/60">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <BookOpen className="size-5" />
              </div>
              <div>
                <span className="text-xs font-mono text-muted-foreground block">Tổng số tác phẩm</span>
                <span className="font-serif text-xl font-bold text-foreground">{stories.length} bộ truyện</span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 pt-2 border-t border-border/60 text-[11px] font-mono text-muted-foreground">
              <OrangeLogo className="size-3.5" />
              <span>Cập nhật liên tục từ tác giả</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stories Archive List with Category Tabs and Multi-tag Filter */}
      <StoryList initialStories={stories} />
    </div>
  );
}

