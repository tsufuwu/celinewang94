import { Metadata } from "next";
import { MessageCircleHeart } from "lucide-react";
import { getGuestbookPosts } from "./actions";
import { GuestbookForm } from "@/components/guestbook/guestbook-form";
import { GuestbookList } from "@/components/guestbook/guestbook-list";
import { OrangeLogo } from "@/components/layout/orange-logo";

export const metadata: Metadata = {
  title: "Góc Trò Chuyện Của Quả Cam | Media naranja",
  description: "Không gian chia sẻ cảm xúc, gửi lời nhắn gửi và thảo luận cùng Celine Wang và các bạn đọc.",
};

export const dynamic = "force-dynamic";

export default async function TroChuyenPage() {
  const posts = await getGuestbookPosts();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-orange-200/60 dark:border-orange-950/40 text-xs font-mono uppercase tracking-wider text-orange-800 dark:text-orange-300 mb-3">
          <MessageCircleHeart className="size-3.5 text-primary" />
          <span>Góc Tâm Sự Các Quả Cam</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-semibold tracking-tight mb-3">
          Góc Trò Chuyện & Lưu Bút
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Nơi bạn có thể gửi vài dòng nhắn nhủ, tâm sự hay chia sẻ cảm xúc sau những trang truyện êm đềm cùng Celine ˶ˆ꒳ˆ˵
        </p>
      </div>

      {/* Guestbook New Post Form */}
      <GuestbookForm />

      {/* Pinned announcement from Celine */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-secondary/60 border border-orange-200/70 dark:border-orange-950/50 flex gap-3.5 items-start">
        <div className="shrink-0 mt-0.5">
          <OrangeLogo className="size-8 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-semibold text-primary bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-900">
              📌 Ghim từ Celine
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Celine Wang</span>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            Cảm ơn các quả cam đã ghé thăm nhà Cam! ˶ˆ꒳ˆ˵ Nơi đây là góc tâm sự không cần đăng nhập. Bạn chỉ cần nhập tên/bút danh rồi viết thôi nha~
          </p>
        </div>
      </div>

      {/* Guestbook List */}
      <div>
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-border/60">
          <h2 className="font-serif text-xl text-foreground font-medium">
            Những Lời Nhắn Gần Đây
          </h2>
          <span className="text-xs font-mono text-muted-foreground">
            {posts.length} lời nhắn
          </span>
        </div>

        <GuestbookList posts={posts} />
      </div>
    </div>
  );
}

