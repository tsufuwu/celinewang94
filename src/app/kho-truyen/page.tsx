import { Metadata } from "next";
import Link from "next/link";
import { getStories } from "@/lib/data";
import { StoryList } from "@/components/home/story-list";
import { Library, ChevronRight, BookOpen, Sparkles } from "lucide-react";
import { OrangeLogo } from "@/components/layout/orange-logo";

export const metadata: Metadata = {
  title: "Thư Viện & Tác Phẩm | Media naranja",
  description:
    "Toàn bộ tác phẩm, bản dịch đam mỹ, văn học chọn lọc và dự án lưu trữ của Celine Wang tại Media naranja.",
};

export const dynamic = "force-dynamic";

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
          <span>Thư viện</span>
        </span>
      </nav>

      {/* Hero Banner Header for Library Archive */}
      <div className="relative rounded-[20px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[3px_5px_0px_#2B2623] p-6 sm:p-10 mb-8 overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[10px] bg-[#BDCEAF] text-[#2B2623] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] text-xs font-bold uppercase tracking-wider select-none">
              <Sparkles className="size-3.5 text-[#2B2623]" />
              <span>ARS LONGA, VITA BREVIS · THƯ VIỆN CHỌN LỌC</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2B2623] dark:text-[#FAF5EE]">
              Thư Viện &amp; Tác Phẩm
            </h1>

            <p className="text-sm sm:text-base text-[#5C5146] dark:text-[#C4B9AD] leading-relaxed font-sans font-normal">
              Nơi lưu trữ những bộ truyện hoàn thành, các bản dịch công phu và những bản thảo đang được ấp ủ bởi Celine Wang. Chọn các danh mục bên dưới để tìm câu chuyện phù hợp với tâm trạng của bạn nhé.
            </p>
          </div>

          {/* Quick Stats Box */}
          <div className="flex sm:flex-col gap-3 shrink-0 self-start md:self-auto bg-[#E5DDD2] dark:bg-[#2A2420] p-4 rounded-[14px] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623]">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-[10px] bg-[#E07B4C] text-white border-2 border-[#2B2623] flex items-center justify-center">
                <BookOpen className="size-5" />
              </div>
              <div>
                <span className="text-xs font-mono text-[#5C5146] dark:text-[#C4B9AD] block font-semibold">Tổng số tác phẩm</span>
                <span className="font-serif text-xl font-bold text-[#2B2623] dark:text-[#FAF5EE]">{stories.length} bộ truyện</span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 pt-2 border-t border-[#2B2623]/20 text-[11px] font-mono text-[#5C5146] dark:text-[#C4B9AD] font-semibold">
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

