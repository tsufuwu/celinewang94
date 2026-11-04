"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Heart,
  Briefcase,
  BookOpen,
  Tag,
  Shield,
  Save,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  saveProfileSettings,
  type CelineProfileData,
  type ProfileExperience,
  type ProfileProject,
} from "@/app/admin/actions";

interface ProfileManagerProps {
  initialProfile: CelineProfileData;
}

export function ProfileManager({ initialProfile }: ProfileManagerProps) {
  const [profile, setProfile] = React.useState<CelineProfileData>(initialProfile);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  // Handler for uploading and converting image to webp base64 (avatar / cover)
  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "avatar" | "coverImage"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create an image element to draw onto canvas
      const img = document.createElement("img");
      const reader = new FileReader();

      reader.onload = (event) => {
        img.src = event.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        const maxDim = field === "avatar" ? 600 : 1600;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const webpData = canvas.toDataURL("image/webp", 0.85);
          setProfile((prev) => ({ ...prev, [field]: webpData }));
        }
      };

      reader.readAsDataURL(file);
    } catch {
      setErrorMessage("Không thể xử lý file ảnh. Vui lòng thử lại.");
    }
  };

  // Experiences helper
  const handleAddExperience = () => {
    const newExp: ProfileExperience = {
      id: `exp_${Date.now()}`,
      title: "Vị trí / Hoạt động mới",
      company: "Tên Studio / Dự án",
      time: "Thời gian",
      description: "Mô tả công việc và trải nghiệm...",
    };
    setProfile((prev) => ({
      ...prev,
      experiences: [...(prev.experiences || []), newExp],
    }));
  };

  const handleUpdateExperience = (id: string, field: keyof ProfileExperience, val: string) => {
    setProfile((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: val } : exp
      ),
    }));
  };

  const handleDeleteExperience = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((exp) => exp.id !== id),
    }));
  };

  // Projects helper
  const handleAddProject = () => {
    const newProj: ProfileProject = {
      id: `proj_${Date.now()}`,
      badge: "[Edit] Dự án mới",
      title: "Tên Bộ Truyện",
      author: "Tác giả",
      description: "Tóm tắt về dự án chuyển ngữ hoặc lưu trữ...",
      link: "/kho-truyen",
    };
    setProfile((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), newProj],
    }));
  };

  const handleUpdateProject = (id: string, field: keyof ProfileProject, val: string) => {
    setProfile((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) =>
        proj.id === id ? { ...proj, [field]: val } : proj
      ),
    }));
  };

  const handleDeleteProject = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      projects: prev.projects.filter((proj) => proj.id !== id),
    }));
  };

  // Tags helper (comma-separated string to array)
  const tagsString = (profile.tags || []).join(", ");
  const handleTagsChange = (str: string) => {
    const tagsArray = str
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);
    setProfile((prev) => ({ ...prev, tags: tagsArray }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    try {
      const res = await saveProfileSettings(profile);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: unknown) {
      setErrorMessage(`Lỗi lưu dữ liệu: ${(err as Error)?.message || String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-[16px] bg-[#FAF5EE] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623]">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#2B2623] dark:text-[#FAF5EE]">
            Chỉnh Sửa Hồ Sơ Tác Giả & Trang Web
          </h2>
          <p className="text-xs text-[#5C5146] dark:text-[#C4B9AD] mt-0.5">
            Cập nhật thông tin tác giả, avatar, ảnh bìa, lời nhắn, kinh nghiệm và các dự án của Celine Wang.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link href="/" target="_blank">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-[10px] text-xs h-9 px-3 border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-bold"
            >
              <ExternalLink className="size-3 mr-1" />
              <span>Xem trang chủ</span>
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-[10px] text-xs h-9 px-4 bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-bold flex items-center gap-1.5"
          >
            {isSaving ? (
              <span>Đang lưu...</span>
            ) : saveSuccess ? (
              <>
                <Check className="size-4" />
                <span>Đã lưu thành công!</span>
              </>
            ) : (
              <>
                <Save className="size-4" />
                <span>Lưu Thay Đổi</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-[12px] bg-[#BDCEAF] text-[#2B2623] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] text-xs font-bold flex items-center gap-2">
          <Check className="size-4 text-[#2B2623]" />
          <span>Thông tin trang Giới Thiệu (CV) đã được lưu thành công vào cơ sở dữ liệu!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-[12px] bg-red-100 text-red-900 border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] text-xs font-bold">
          {errorMessage}
        </div>
      )}

      {/* 1. Thông tin cá nhân & Ảnh đại diện / Ảnh bìa */}
      <section className="p-5 sm:p-6 rounded-[18px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-[#2B2623]/15">
          <User className="size-4 text-[#E07B4C]" />
          <h3 className="font-serif text-base font-bold text-[#2B2623] dark:text-[#FAF5EE]">
            1. Thông Tin Chung &amp; Ảnh Profile
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD]">
              Tên hiển thị:
            </label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="rounded-[10px] border-2 border-[#2B2623] bg-card text-xs font-medium"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD]">
              Địa điểm / Vị trí:
            </label>
            <Input
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              className="rounded-[10px] border-2 border-[#2B2623] bg-card text-xs font-medium"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD]">
              Khẩu hiệu / Slogan (Tagline):
            </label>
            <Input
              value={profile.tagline}
              onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
              className="rounded-[10px] border-2 border-[#2B2623] bg-card text-xs font-medium"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD]">
              Tiểu sử ngắn (Bio headline):
            </label>
            <Textarea
              rows={2}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="rounded-[10px] border-2 border-[#2B2623] bg-card text-xs font-medium resize-none"
            />
          </div>
        </div>

        {/* Avatar & Cover image controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-[#2B2623]/15">
          {/* Avatar */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD] block">
              Ảnh đại diện (Avatar):
            </label>
            <div className="flex items-center gap-3">
              <div className="relative size-16 rounded-full overflow-hidden border-2 border-[#2B2623] shrink-0 bg-[#EFE8DE]">
                {profile.avatar && (
                  <Image
                    src={profile.avatar}
                    alt="Avatar preview"
                    fill
                    unoptimized={profile.avatar.startsWith("data:")}
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <Input
                  value={profile.avatar.startsWith("data:") ? "(Ảnh tải từ máy tính)" : profile.avatar}
                  onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                  placeholder="https://..."
                  className="rounded-[8px] border-2 border-[#2B2623] text-xs h-8"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#E5DDD2] hover:bg-[#DBD1C4] text-[#5C5146] border border-[#2B2623] text-[11px] font-bold cursor-pointer transition-colors">
                  <Upload className="size-3" />
                  <span>Chọn ảnh từ máy tính</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFileChange(e, "avatar")}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD] block">
              Ảnh bìa (Cover Image):
            </label>
            <div className="flex items-center gap-3">
              <div className="relative w-24 h-16 rounded-[8px] overflow-hidden border-2 border-[#2B2623] shrink-0 bg-[#EFE8DE]">
                {profile.coverImage && (
                  <Image
                    src={profile.coverImage}
                    alt="Cover preview"
                    fill
                    unoptimized={profile.coverImage.startsWith("data:")}
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <Input
                  value={profile.coverImage.startsWith("data:") ? "(Ảnh tải từ máy tính)" : profile.coverImage}
                  onChange={(e) => setProfile({ ...profile, coverImage: e.target.value })}
                  placeholder="https://..."
                  className="rounded-[8px] border-2 border-[#2B2623] text-xs h-8"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#E5DDD2] hover:bg-[#DBD1C4] text-[#5C5146] border border-[#2B2623] text-[11px] font-bold cursor-pointer transition-colors">
                  <Upload className="size-3" />
                  <span>Chọn ảnh từ máy tính</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFileChange(e, "coverImage")}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Lời nhắn từ Editor */}
      <section className="p-5 sm:p-6 rounded-[18px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-[#2B2623]/15">
          <Heart className="size-4 text-[#E07B4C]" />
          <h3 className="font-serif text-base font-bold text-[#2B2623] dark:text-[#FAF5EE]">
            2. Lời Nhắn Từ Editor
          </h3>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD]">
            Nội dung tâm thư / lời nhắn gửi tới các quả cam:
          </label>
          <Textarea
            rows={4}
            value={profile.editorNote}
            onChange={(e) => setProfile({ ...profile, editorNote: e.target.value })}
            className="rounded-[10px] border-2 border-[#2B2623] bg-card text-xs font-medium leading-relaxed"
          />
        </div>
      </section>

      {/* 3. Mạng xã hội */}
      <section className="p-5 sm:p-6 rounded-[18px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-[#2B2623]/15">
          <ExternalLink className="size-4 text-[#E07B4C]" />
          <h3 className="font-serif text-base font-bold text-[#2B2623] dark:text-[#FAF5EE]">
            3. Kênh Mạng Xã Hội
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD]">
              TikTok Handle:
            </label>
            <Input
              value={profile.socials?.tiktok?.handle || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socials: {
                    ...profile.socials,
                    tiktok: { ...profile.socials.tiktok, handle: e.target.value },
                  },
                })
              }
              className="rounded-[10px] border-2 border-[#2B2623] bg-card text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD]">
              TikTok Link URL:
            </label>
            <Input
              value={profile.socials?.tiktok?.url || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socials: {
                    ...profile.socials,
                    tiktok: { ...profile.socials.tiktok, url: e.target.value },
                  },
                })
              }
              className="rounded-[10px] border-2 border-[#2B2623] bg-card text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD]">
              Threads Handle:
            </label>
            <Input
              value={profile.socials?.threads?.handle || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socials: {
                    ...profile.socials,
                    threads: { ...profile.socials.threads, handle: e.target.value },
                  },
                })
              }
              className="rounded-[10px] border-2 border-[#2B2623] bg-card text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD]">
              Threads Link URL:
            </label>
            <Input
              value={profile.socials?.threads?.url || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  socials: {
                    ...profile.socials,
                    threads: { ...profile.socials.threads, url: e.target.value },
                  },
                })
              }
              className="rounded-[10px] border-2 border-[#2B2623] bg-card text-xs font-medium"
            />
          </div>
        </div>
      </section>

      {/* 4. Kinh nghiệm & Hoạt động (Experiences) */}
      <section className="p-5 sm:p-6 rounded-[18px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b-2 border-[#2B2623]/15">
          <div className="flex items-center gap-2">
            <Briefcase className="size-4 text-[#E07B4C]" />
            <h3 className="font-serif text-base font-bold text-[#2B2623] dark:text-[#FAF5EE]">
              4. Kinh Nghiệm &amp; Hoạt Động (Experiences)
            </h3>
          </div>

          <button
            type="button"
            onClick={handleAddExperience}
            className="px-3 py-1 rounded-[8px] bg-[#BDCEAF] text-[#2B2623] border border-[#2B2623] text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-[#AEC29F] cursor-pointer"
          >
            <Plus className="size-3" />
            <span>Thêm mục</span>
          </button>
        </div>

        <div className="space-y-3">
          {(profile.experiences || []).map((exp, idx) => (
            <div
              key={exp.id || idx}
              className="p-4 rounded-[12px] bg-[#FAF5EE] dark:bg-[#2A2420] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] space-y-2.5 relative"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold text-[#E07B4C]">
                  #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteExperience(exp.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Xóa mục này"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Input
                  placeholder="Chức danh / Hoạt động"
                  value={exp.title}
                  onChange={(e) => handleUpdateExperience(exp.id, "title", e.target.value)}
                  className="rounded-[8px] border border-[#2B2623] text-xs h-8 bg-card"
                />
                <Input
                  placeholder="Studio / Cơ quan / Kênh"
                  value={exp.company}
                  onChange={(e) => handleUpdateExperience(exp.id, "company", e.target.value)}
                  className="rounded-[8px] border border-[#2B2623] text-xs h-8 bg-card"
                />
                <Input
                  placeholder="Thời gian (ví dụ: Toàn thời gian)"
                  value={exp.time}
                  onChange={(e) => handleUpdateExperience(exp.id, "time", e.target.value)}
                  className="rounded-[8px] border border-[#2B2623] text-xs h-8 bg-card"
                />
              </div>

              <Textarea
                rows={2}
                placeholder="Mô tả trải nghiệm..."
                value={exp.description}
                onChange={(e) => handleUpdateExperience(exp.id, "description", e.target.value)}
                className="rounded-[8px] border border-[#2B2623] text-xs resize-none bg-card"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 5. Dự án dịch & Edit (Projects) */}
      <section className="p-5 sm:p-6 rounded-[18px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b-2 border-[#2B2623]/15">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-[#E07B4C]" />
            <h3 className="font-serif text-base font-bold text-[#2B2623] dark:text-[#FAF5EE]">
              5. Dự Án Dịch Thuật &amp; Edit (Personal Projects)
            </h3>
          </div>

          <button
            type="button"
            onClick={handleAddProject}
            className="px-3 py-1 rounded-[8px] bg-[#BDCEAF] text-[#2B2623] border border-[#2B2623] text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-[#AEC29F] cursor-pointer"
          >
            <Plus className="size-3" />
            <span>Thêm dự án</span>
          </button>
        </div>

        <div className="space-y-3">
          {(profile.projects || []).map((proj, idx) => (
            <div
              key={proj.id || idx}
              className="p-4 rounded-[12px] bg-[#FAF5EE] dark:bg-[#2A2420] border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] space-y-2.5 relative"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold text-[#E07B4C]">
                  Dự án #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteProject(proj.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Xóa dự án này"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <Input
                  placeholder="Huy hiệu (ví dụ: [FULL] Edit)"
                  value={proj.badge}
                  onChange={(e) => handleUpdateProject(proj.id, "badge", e.target.value)}
                  className="rounded-[8px] border border-[#2B2623] text-xs h-8 bg-card"
                />
                <Input
                  placeholder="Tên bộ truyện"
                  value={proj.title}
                  onChange={(e) => handleUpdateProject(proj.id, "title", e.target.value)}
                  className="rounded-[8px] border border-[#2B2623] text-xs h-8 bg-card font-bold"
                />
                <Input
                  placeholder="Tác giả"
                  value={proj.author}
                  onChange={(e) => handleUpdateProject(proj.id, "author", e.target.value)}
                  className="rounded-[8px] border border-[#2B2623] text-xs h-8 bg-card"
                />
                <Input
                  placeholder="Link đọc truyện (ví dụ: /truyen/om-lay-trong-luc)"
                  value={proj.link}
                  onChange={(e) => handleUpdateProject(proj.id, "link", e.target.value)}
                  className="rounded-[8px] border border-[#2B2623] text-xs h-8 bg-card"
                />
              </div>

              <Textarea
                rows={2}
                placeholder="Mô tả ngắn về bộ truyện..."
                value={proj.description}
                onChange={(e) => handleUpdateProject(proj.id, "description", e.target.value)}
                className="rounded-[8px] border border-[#2B2623] text-xs resize-none bg-card"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 6. Thẻ cá tính & Kỹ năng (Tags) */}
      <section className="p-5 sm:p-6 rounded-[18px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-[#2B2623]/15">
          <Tag className="size-4 text-[#E07B4C]" />
          <h3 className="font-serif text-base font-bold text-[#2B2623] dark:text-[#FAF5EE]">
            6. Thẻ Cá Tính &amp; Sở Thích (Tags)
          </h3>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD]">
            Nhập các tag (ngăn cách bằng dấu phẩy):
          </label>
          <Input
            value={tagsString}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="Nghiện màu cam, Thích đọc triện gây, Người lười, ..."
            className="rounded-[10px] border-2 border-[#2B2623] bg-card text-xs font-medium"
          />

          <div className="flex flex-wrap gap-1.5 pt-2">
            {(profile.tags || []).map((t, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-[8px] bg-[#E5DDD2] dark:bg-[#3D352E] text-[#5C5146] dark:text-[#FAF5EE] text-xs font-mono font-bold border border-[#2B2623]/30"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Bản quyền & Giấy phép */}
      <section className="p-5 sm:p-6 rounded-[18px] bg-[#FDFBF7] dark:bg-[#241F1C] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-[#2B2623]/15">
          <Shield className="size-4 text-[#E07B4C]" />
          <h3 className="font-serif text-base font-bold text-[#2B2623] dark:text-[#FAF5EE]">
            7. Bản Quyền &amp; Giấy Phép Sử Dụng
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD]">
              Tên giấy phép:
            </label>
            <Input
              value={profile.license}
              onChange={(e) => setProfile({ ...profile, license: e.target.value })}
              placeholder="CC BY-NC-SA 4.0"
              className="rounded-[10px] border-2 border-[#2B2623] bg-card text-xs font-medium"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#5C5146] dark:text-[#C4B9AD]">
              Lời nhắc bản quyền phi thương mại:
            </label>
            <Textarea
              rows={2}
              value={profile.licenseNote || ""}
              onChange={(e) => setProfile({ ...profile, licenseNote: e.target.value })}
              className="rounded-[10px] border-2 border-[#2B2623] bg-card text-xs font-medium resize-none"
            />
          </div>
        </div>
      </section>

      {/* Bottom Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isSaving}
          className="rounded-[12px] text-sm h-11 px-6 bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] active:translate-x-[1px] active:translate-y-[2px] active:shadow-none font-bold flex items-center gap-2"
        >
          {isSaving ? (
            <span>Đang lưu...</span>
          ) : (
            <>
              <Save className="size-4" />
              <span>Lưu Cập Nhật Trang Giới Thiệu (CV)</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
