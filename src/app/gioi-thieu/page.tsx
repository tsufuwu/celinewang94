import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  MessageCircle,
  ExternalLink,
  BookOpen,
  Camera,
  Coffee,
  Sparkles,
  Heart,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CELINE_PROFILE } from "@/lib/data";
import { OrangeLogo } from "@/components/layout/orange-logo";

export const metadata: Metadata = {
  title: "Giới thiệu & CV | Celine Wang - Media naranja",
  description:
    "Curriculum Vitae - Professional Daydreamer & Editor. Lời nhắn, kinh nghiệm và những dự án dịch truyện của Celine Wang.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* 1. LinkedIn-style Profile Card */}
      <div className="rounded-3xl bg-card border border-border/80 overflow-hidden shadow-sm transition-all duration-300 mb-10">
        {/* Banner Cover */}
        <div className="h-44 sm:h-56 relative w-full bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 overflow-hidden">
          <Image
            src={CELINE_PROFILE.coverImage}
            alt="Media Naranja Cover"
            fill
            className="object-cover opacity-85"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-mono">
            <OrangeLogo className="size-4" />
            <span>Media naranja</span>
          </div>
        </div>

        {/* Profile Info Container */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          {/* Avatar floating */}
          <div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-4">
            <div className="relative size-28 sm:size-36 rounded-full border-4 border-card overflow-hidden shadow-md bg-muted">
              <Image
                src={CELINE_PROFILE.avatar}
                alt={CELINE_PROFILE.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/tro-chuyen">
                <Button
                  size="sm"
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs sm:text-sm px-4 gap-1.5 shadow-xs"
                >
                  <MessageCircle className="size-4" />
                  <span>Nhắn gửi lời yêu thương</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Name & Headline */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                {CELINE_PROFILE.name}
              </h1>
              <Badge variant="outline" className="text-[11px] font-mono border-orange-300 bg-orange-100/60 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300">
                Host of Media naranja 🍊
              </Badge>
            </div>

            <p className="text-sm sm:text-base text-foreground/90 font-medium leading-relaxed">
              {CELINE_PROFILE.bio}
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5 text-orange-500" />
                {CELINE_PROFILE.location}
              </span>
            </div>
          </div>

          {/* Social Links Bar */}
          <div className="flex items-center gap-3 pt-5 mt-5 border-t border-border/60 flex-wrap">
            <a
              href={CELINE_PROFILE.socials.tiktok.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition-colors"
            >
              <span>TikTok: {CELINE_PROFILE.socials.tiktok.handle}</span>
              <ExternalLink className="size-3 text-muted-foreground" />
            </a>
            <a
              href={CELINE_PROFILE.socials.threads.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition-colors"
            >
              <span>Threads: {CELINE_PROFILE.socials.threads.handle}</span>
              <ExternalLink className="size-3 text-muted-foreground" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. CV Section: Professional Daydreamer & Editor */}
      <div className="space-y-8">
        {/* Lời nhắn từ Editor */}
        <section className="p-6 sm:p-7 rounded-3xl bg-secondary/60 border border-orange-200/60 dark:border-orange-900/30 relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-orange-700 dark:text-orange-400 mb-2">
            <Heart className="size-3.5 fill-current" />
            <span>Lời Nhắn Từ Editor</span>
          </div>
          <blockquote className="font-serif italic text-base sm:text-lg text-foreground/90 leading-relaxed">
            &ldquo;{CELINE_PROFILE.editorNote}&rdquo;
          </blockquote>
        </section>

        {/* Experience Section */}
        <section className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-border/60">
            <Sparkles className="size-4 text-orange-500" />
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-foreground">
              Experience & Daydreaming
            </h2>
          </div>

          <div className="space-y-6">
            {/* Role 1 */}
            <div className="flex gap-4">
              <div className="size-10 rounded-2xl bg-secondary flex items-center justify-center shrink-0 text-orange-600 dark:text-orange-400">
                <Camera className="size-5" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-foreground">
                    Chụp Goods Part-time & Visual Archivist
                  </h3>
                  <span className="text-xs font-mono text-muted-foreground">Vĩnh cửu • Trái Đất</span>
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">
                  Media Naranja Studio
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                  Lưu giữ và chia sẻ những khoảnh khắc đẹp của các ấn phẩm sách, truyện tranh, artbook và goods sưu tầm. Chia sẻ tình yêu đối với nghệ thuật thị giác và vẻ đẹp của văn hóa đọc.
                </p>
              </div>
            </div>

            {/* Role 2 */}
            <div className="flex gap-4">
              <div className="size-10 rounded-2xl bg-secondary flex items-center justify-center shrink-0 text-orange-600 dark:text-orange-400">
                <Coffee className="size-5" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-foreground">
                    Nói Nhảm, Uống Trà & Mơ Mộng Chuyên Nghiệp
                  </h3>
                  <span className="text-xs font-mono text-muted-foreground">Toàn thời gian</span>
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">
                  Celine Wang Headquarters
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                  Viết blog tản văn, lắng nghe tiếng lòng của các quả cam ghé chơi, ngắm hoàng hôn và tự nhủ rằng cuộc sống luôn dịu dàng nếu ta nhìn nó qua lăng kính ấm áp.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Personal Projects Section */}
        <section className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-border/60">
            <BookOpen className="size-4 text-orange-500" />
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-foreground">
              Personal Projects (Dịch & Edit)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 flex flex-col justify-between">
              <div>
                <Badge className="bg-orange-500 text-white hover:bg-orange-600 text-[10px] mb-2 font-mono">
                  [FULL] Edit
                </Badge>
                <h4 className="font-serif text-base font-semibold text-foreground mb-1">
                  Ôm Lấy Trọng Lực
                </h4>
                <p className="text-xs text-muted-foreground mb-3">Tác giả: larivegauche</p>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  Bộ truyện trượt băng nghệ thuật gắn bó sâu sắc nhất với nhà Cam. 86 chương + ngoại truyện hoàn chỉnh.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-border/40">
                <Link
                  href="/chuong/ch_omlay_1"
                  className="text-xs text-orange-600 dark:text-orange-400 font-medium hover:underline inline-flex items-center gap-1"
                >
                  Đọc từ chương 1 →
                </Link>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 flex flex-col justify-between">
              <div>
                <Badge className="bg-amber-600 text-white hover:bg-amber-700 text-[10px] mb-2 font-mono">
                  [Dịch] Văn học cổ điển
                </Badge>
                <h4 className="font-serif text-base font-semibold text-foreground mb-1">
                  De profundis
                </h4>
                <p className="text-xs text-muted-foreground mb-3">Tác giả: Oscar Wilde</p>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  Bản dịch bức thư bất hủ từ ngục Reading, thể hiện chiều sâu tâm tưởng và vẻ đẹp trác tuyệt của ngôn từ.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-border/40">
                <Link
                  href="/chuong/ch_deprofundis_1"
                  className="text-xs text-orange-600 dark:text-orange-400 font-medium hover:underline inline-flex items-center gap-1"
                >
                  Đọc bản dịch →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Skills & Personality Tags */}
        <section className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80">
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3">
            Kỹ Năng & Thẻ Cá Tính
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              "Thích đọc triện gây",
              "Người lười",
              "Hay mơ mộng",
              "Nghiện màu cam",
              "Chụp ảnh sách",
              "Thích nghe Erik Satie",
              "Lắng nghe & Thấu cảm",
              "Hạt cam ngọt ngào",
            ].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-orange-900 dark:text-orange-200 border border-orange-200/60 dark:border-orange-900/40"
              >
                #{tag}
              </span>
            ))}
          </div>
        </section>

        {/* Copyright & License Note */}
        <section className="p-6 rounded-3xl bg-muted/50 border border-border/60 flex items-start gap-3 text-xs text-muted-foreground">
          <ShieldCheck className="size-5 text-orange-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">
              Bản quyền & Giấy phép Sử Dụng ({CELINE_PROFILE.license})
            </p>
            <p className="leading-relaxed">
              Tất cả các bản dịch, hình ảnh và bài viết trên Media naranja được chia sẻ phi thương mại. Vui lòng không reup hoặc sao chép bản dịch khi chưa có sự đồng ý của Celine. Cảm ơn các bạn đã luôn tôn trọng công sức của người làm truyện.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
