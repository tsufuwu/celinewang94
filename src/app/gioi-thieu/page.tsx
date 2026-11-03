import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  MessageCircle,
  ExternalLink,
  BookOpen,
  Camera,
  Sparkles,
  Heart,
  ShieldCheck,
} from "lucide-react";
import { getProfileSettings } from "@/lib/data";
import { OrangeLogo } from "@/components/layout/orange-logo";

export const metadata: Metadata = {
  title: "Giới thiệu & CV | Celine Wang - Media naranja",
  description:
    "Curriculum Vitae - Professional Daydreamer & Editor. Lời nhắn, kinh nghiệm và những dự án dịch truyện của Celine Wang.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const profile = await getProfileSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* 1. Flat Retro Scrapbook Profile Card */}
      <div className="rounded-[20px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[3px_5px_0px_#2B2623] overflow-hidden mb-10">
        {/* Banner Cover (Solid Flat Color with Image Overlay) */}
        <div className="h-44 sm:h-60 relative w-full bg-[#F4DFAD] dark:bg-[#3D3323] border-b-2 border-[#2B2623] overflow-hidden">
          {profile.coverImage && (
            <Image
              src={profile.coverImage}
              alt="Media Naranja Cover"
              fill
              unoptimized={profile.coverImage.startsWith("data:")}
              className="object-cover"
              priority
            />
          )}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#E5DDD2] dark:bg-[#2A2420] text-[#2B2623] dark:text-[#FAF5EE] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] text-xs font-mono font-bold">
            <OrangeLogo className="size-4" />
            <span>Media naranja</span>
          </div>
        </div>

        {/* Profile Info Container */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          {/* Avatar floating */}
          <div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-4">
            <div className="relative size-28 sm:size-36 rounded-full border-3 border-[#2B2623] overflow-hidden shadow-[2px_4px_0px_#2B2623] bg-[#EFE8DE] dark:bg-[#2A2420]">
              {profile.avatar && (
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  fill
                  unoptimized={profile.avatar.startsWith("data:")}
                  className="object-cover"
                  priority
                />
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/tro-chuyen">
                <button
                  type="button"
                  className="rounded-[12px] bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none font-bold text-xs sm:text-sm px-4 py-2 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <MessageCircle className="size-4" />
                  <span>Nhắn gửi lời yêu thương</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Name & Headline */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2623] dark:text-[#FAF5EE]">
                {profile.name}
              </h1>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-[8px] bg-[#BDCEAF] text-[#2B2623] border border-[#2B2623]/40">
                Host of Media naranja 🍊
              </span>
            </div>

            {profile.tagline && (
              <p className="font-mono text-xs sm:text-sm text-[#E07B4C] italic font-semibold">
                {profile.tagline}
              </p>
            )}

            <p className="text-sm sm:text-base text-[#5C5146] dark:text-[#C4B9AD] font-medium leading-relaxed mt-0.5">
              {profile.bio}
            </p>

            {profile.location && (
              <div className="flex items-center gap-2 text-xs text-[#5C5146] dark:text-[#C4B9AD] mt-1 font-mono font-semibold">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-[#E07B4C]" />
                  {profile.location}
                </span>
              </div>
            )}
          </div>

          {/* Social Links Bar */}
          <div className="flex items-center gap-3 pt-5 mt-5 border-t-2 border-[#2B2623]/15 flex-wrap">
            {profile.socials?.tiktok?.url && (
              <a
                href={profile.socials.tiktok.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-[#E5DDD2] dark:bg-[#2A2420] hover:bg-[#DBD1C4] text-[#2B2623] dark:text-[#FAF5EE] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xs font-bold transition-all"
              >
                <span>TikTok: {profile.socials.tiktok.handle}</span>
                <ExternalLink className="size-3 text-[#5C5146]" />
              </a>
            )}
            {profile.socials?.threads?.url && (
              <a
                href={profile.socials.threads.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-[#E5DDD2] dark:bg-[#2A2420] hover:bg-[#DBD1C4] text-[#2B2623] dark:text-[#FAF5EE] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none text-xs font-bold transition-all"
              >
                <span>Threads: {profile.socials.threads.handle}</span>
                <ExternalLink className="size-3 text-[#5C5146]" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 2. CV Section: Professional Daydreamer & Editor */}
      <div className="space-y-8">
        {/* Lời nhắn từ Editor */}
        {profile.editorNote && (
          <section className="p-6 sm:p-7 rounded-[18px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#EBBAB5] text-[#2B2623] border border-[#2B2623] text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
              <Heart className="size-3 text-[#2B2623]" />
              <span>LỜI NHẮN TỪ EDITOR</span>
            </div>
            <blockquote className="font-serif italic text-base sm:text-lg text-[#2B2623] dark:text-[#FAF5EE] leading-relaxed border-l-2 border-[#E07B4C] pl-4 my-1">
              &ldquo;{profile.editorNote}&rdquo;
            </blockquote>
          </section>
        )}

        {/* Experience Section */}
        {profile.experiences && profile.experiences.length > 0 && (
          <section className="p-6 sm:p-8 rounded-[18px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-[#2B2623]/15">
              <Sparkles className="size-4 text-[#E07B4C]" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B2623] dark:text-[#FAF5EE]">
                Experience &amp; Daydreaming
              </h2>
            </div>

            <div className="space-y-6">
              {profile.experiences.map((exp) => (
                <div key={exp.id} className="flex gap-4">
                  <div className="size-11 rounded-[10px] bg-[#E2D8C0] dark:bg-[#3D352E] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] flex items-center justify-center shrink-0 text-[#2B2623] dark:text-[#FAF5EE]">
                    <Camera className="size-5" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-[#2B2623] dark:text-[#FAF5EE]">
                        {exp.title}
                      </h3>
                      <span className="text-xs font-mono text-[#5C5146] dark:text-[#C4B9AD] font-semibold">
                        {exp.time}
                      </span>
                    </div>
                    <p className="text-xs text-[#E07B4C] font-bold">
                      {exp.company}
                    </p>
                    <p className="text-sm text-[#5C5146] dark:text-[#C4B9AD] leading-relaxed mt-1 font-sans">
                      {exp.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Personal Projects Section */}
        {profile.projects && profile.projects.length > 0 && (
          <section className="p-6 sm:p-8 rounded-[18px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-[#2B2623]/15">
              <BookOpen className="size-4 text-[#E07B4C]" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B2623] dark:text-[#FAF5EE]">
                Personal Projects (Dịch &amp; Edit)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-[14px] bg-[#FAF5EE] dark:bg-[#2A2420] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-[6px] bg-[#BDCEAF] text-[#2B2623] border border-[#2B2623]/40 text-[10px] font-mono font-bold mb-2">
                      {proj.badge}
                    </span>
                    <h4 className="font-serif text-base font-bold text-[#2B2623] dark:text-[#FAF5EE] mb-1">
                      {proj.title}
                    </h4>
                    <p className="text-xs text-[#E07B4C] font-semibold mb-2">
                      Tác giả: {proj.author}
                    </p>
                    <p className="text-xs text-[#5C5146] dark:text-[#C4B9AD] leading-relaxed font-sans">
                      {proj.description}
                    </p>
                  </div>
                  <div className="pt-3 mt-4 border-t border-[#2B2623]/15">
                    <Link
                      href={proj.link}
                      className="text-xs font-mono font-bold text-[#E07B4C] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Vào xem dự án</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills & Personality Tags */}
        {profile.tags && profile.tags.length > 0 && (
          <section className="p-6 sm:p-8 rounded-[18px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623]">
            <h2 className="font-serif text-lg font-bold text-[#2B2623] dark:text-[#FAF5EE] mb-3">
              Kỹ Năng &amp; Thẻ Cá Tính
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-[10px] text-xs font-mono font-bold bg-[#E5DDD2] dark:bg-[#3D352E] text-[#5C5146] dark:text-[#FAF5EE] border border-[#2B2623]/30 shadow-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Copyright & License Note */}
        <section className="p-6 rounded-[18px] bg-[#E5DDD2] dark:bg-[#2A2420] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] flex items-start gap-3.5 text-xs">
          <ShieldCheck className="size-5 text-[#E07B4C] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-[#2B2623] dark:text-[#FAF5EE]">
              Bản quyền &amp; Giấy phép Sử Dụng ({profile.license})
            </p>
            <p className="leading-relaxed text-[#5C5146] dark:text-[#C4B9AD] font-sans">
              {profile.licenseNote ||
                "Tất cả các bản dịch, hình ảnh và bài viết trên Media naranja được chia sẻ phi thương mại. Vui lòng không reup hoặc sao chép bản dịch khi chưa có sự đồng ý của Celine. Cảm ơn các bạn đã luôn tôn trọng công sức của người làm truyện."}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
