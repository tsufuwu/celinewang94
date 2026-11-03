import { Metadata } from "next";
import {
  checkAdminAuth,
  getEditorStories,
  getEditorTemplates,
} from "../actions";
import { AdminLogin } from "@/components/admin/admin-login";
import { StudioEditor } from "@/components/admin/editor/studio-editor";

export const metadata: Metadata = {
  title: "Hybrid Studio Editor | Quản Trị Hệ Thống",
  description: "Trình soạn thảo và đăng truyện chuyên nghiệp kết hợp Gutenberg, Tiptap và CodePen.",
};

export const dynamic = "force-dynamic";

export default async function AdminEditorPage() {
  const isAuth = await checkAdminAuth();

  if (!isAuth) {
    return <AdminLogin />;
  }

  const [stories, templates] = await Promise.all([
    getEditorStories(),
    getEditorTemplates(),
  ]);

  return <StudioEditor stories={stories} initialTemplates={templates} />;
}

