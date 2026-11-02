import { Metadata } from "next";
import { checkAdminAuth, getAdminStories, getTypoReports } from "./actions";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Quản Trị Hệ Thống | Thư Viện Nhỏ",
  description: "Trang quản lý tác phẩm, bóc tách EPUB và xử lý báo lỗi chính tả.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAuth = await checkAdminAuth();

  if (!isAuth) {
    return <AdminLogin />;
  }

  const [stories, typoReports] = await Promise.all([
    getAdminStories(),
    getTypoReports(),
  ]);

  return <AdminDashboard stories={stories} typoReports={typoReports} />;
}

