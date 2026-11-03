import { Metadata } from "next";
import {
  checkAdminAuth,
  getAdminStories,
  getTypoReports,
  getAdminProfileSettings,
  getBgmPlaylistSetting,
} from "./actions";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Quản Trị Hệ Thống | Thư Viện Nhỏ",
  description: "Trang quản lý tác phẩm, bóc tách EPUB, chỉnh trang Giới Thiệu (CV) & Nhạc Nền.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAuth = await checkAdminAuth();

  if (!isAuth) {
    return <AdminLogin />;
  }

  const [stories, typoReports, profile, bgmSetting] = await Promise.all([
    getAdminStories(),
    getTypoReports(),
    getAdminProfileSettings(),
    getBgmPlaylistSetting(),
  ]);

  return (
    <AdminDashboard
      stories={stories}
      typoReports={typoReports}
      profile={profile}
      bgmSetting={bgmSetting}
    />
  );
}

