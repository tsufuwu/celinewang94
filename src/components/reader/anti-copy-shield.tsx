"use client";

import * as React from "react";
import { Lock } from "lucide-react";

export function AntiCopyShield({ children }: { children: React.ReactNode }) {
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const toastTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showToast = React.useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  React.useEffect(() => {
    // 1. Right Click / Context Menu protection
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showToast("🔒 Nội dung chương được bảo hộ bản quyền. Vui lòng không sao chép!");
    };

    // 2. Copy & Cut Interceptor -> Poison clipboard with copyright watermark
    const handleCopyCut = (e: ClipboardEvent) => {
      e.preventDefault();
      try {
        if (e.clipboardData) {
          e.clipboardData.setData(
            "text/plain",
            "Bản quyền bản dịch và bài viết thuộc về Media Naranja (Celine Wang).\nVui lòng đọc trực tiếp tại: https://wang94.celin.workers.dev\nMọi hành vi sao chép, reup hoặc trích xuất dữ liệu đều bị nghiêm cấm!"
          );
        }
      } catch {
        // clipboard access restricted
      }
      showToast("⚠️ Nội dung được bảo vệ bản quyền. Sao chép không được phép!");
    };

    // 3. Selection & Drag start prevention
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      // Allow inputs or forms (e.g. password modal, comments)
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // 4. Keyboard Shortcuts Interception (Ctrl+C, Ctrl+A, Ctrl+U, Ctrl+S, Ctrl+P)
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      const key = e.key.toLowerCase();

      // Block Ctrl+C (Copy)
      if (modifier && key === "c") {
        e.preventDefault();
        showToast("🔒 Không thể sao chép nội dung chương.");
        return;
      }

      // Block Ctrl+A (Select All)
      if (modifier && key === "a") {
        e.preventDefault();
        return;
      }

      // Block Ctrl+U (View Source)
      if (modifier && key === "u") {
        e.preventDefault();
        showToast("⚠️ Chức năng xem mã nguồn đã bị khóa.");
        return;
      }

      // Block Ctrl+S (Save Page)
      if (modifier && key === "s") {
        e.preventDefault();
        showToast("🔒 Trang đã được bảo vệ bản quyền, không thể lưu.");
        return;
      }

      // Block Ctrl+P (Print to PDF bypass)
      if (modifier && key === "p") {
        e.preventDefault();
        showToast("🔒 Không thể in hoặc lưu chương thành PDF.");
        return;
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("copy", handleCopyCut);
    window.addEventListener("cut", handleCopyCut);
    window.addEventListener("selectstart", handleSelectStart);
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("copy", handleCopyCut);
      window.removeEventListener("cut", handleCopyCut);
      window.removeEventListener("selectstart", handleSelectStart);
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showToast]);

  return (
    <div className="relative protected-chapter-reader select-none">
      {/* Retro Floating Toast Notification */}
      {toastMessage && (
        <aside
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="px-4 py-2.5 rounded-[12px] bg-[#FAF5EE] dark:bg-[#241F1C] text-[#2B2623] dark:text-[#FAF5EE] border-2 border-[#2B2623] shadow-[2px_4px_0px_#2B2623] text-xs font-serif font-bold flex items-center gap-2">
            <Lock className="size-3.5 text-[#E07B4C] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </aside>
      )}

      {children}
    </div>
  );
}
