"use client";

import * as React from "react";
import { Lock, AlertTriangle } from "lucide-react";

export function AntiCopyShield({ children }: { children: React.ReactNode }) {
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [isDevToolsOpen, setIsDevToolsOpen] = React.useState(false);
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

    // 4. Keyboard Shortcuts Interception (Ctrl+C, Ctrl+A, Ctrl+U, Ctrl+S, Ctrl+P, F12, DevTools)
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      const key = e.key.toLowerCase();

      // Block F12
      if (e.key === "F12") {
        e.preventDefault();
        showToast("⚠️ Chức năng kiểm tra mã nguồn đã bị vô hiệu hóa.");
        return;
      }

      // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
      if (modifier && e.shiftKey && ["i", "j", "c"].includes(key)) {
        e.preventDefault();
        showToast("⚠️ Chức năng kiểm tra mã nguồn đã bị vô hiệu hóa.");
        return;
      }

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

    // 5. DevTools Detector (Window boundary differential)
    const checkDevTools = () => {
      const threshold = 170;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if (widthDiff || heightDiff) {
        setIsDevToolsOpen(true);
      } else {
        setIsDevToolsOpen(false);
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("copy", handleCopyCut);
    window.addEventListener("cut", handleCopyCut);
    window.addEventListener("selectstart", handleSelectStart);
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", checkDevTools);

    const intervalId = setInterval(checkDevTools, 1500);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("copy", handleCopyCut);
      window.removeEventListener("cut", handleCopyCut);
      window.removeEventListener("selectstart", handleSelectStart);
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", checkDevTools);
      clearInterval(intervalId);
    };
  }, [showToast]);

  return (
    <div className="relative protected-chapter-reader select-none">
      {/* DevTools Active Blur & Warning Barrier */}
      {isDevToolsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md text-center select-none animate-in fade-in duration-200">
          <div className="max-w-md p-6 rounded-[20px] bg-[#FAF5EE] dark:bg-[#1F1B18] border-2 border-[#2B2623] shadow-[4px_6px_0px_#2B2623] text-[#2B2623] dark:text-[#FAF5EE]">
            <div className="size-12 rounded-full bg-[#EBBAB5] border-2 border-[#2B2623] mx-auto flex items-center justify-center text-[#2B2623] mb-3">
              <AlertTriangle className="size-6 text-[#E0534C]" />
            </div>
            <h3 className="font-serif text-lg font-bold mb-1.5">
              Phát hiện công cụ kiểm tra (Developer Tools)
            </h3>
            <p className="text-xs text-[#5C5146] dark:text-[#C4B9AD] leading-relaxed mb-4">
              Nội dung tại <strong>Media Naranja</strong> được bảo vệ bản quyền. Vui lòng đóng
              cửa sổ Developer Tools để tiếp tục thưởng thức chương truyện.
            </p>
            <div className="p-3 rounded-[10px] bg-[#F4DFAD] border border-[#2B2623] text-[11px] font-mono font-semibold text-[#2B2623]">
              ars longa, vita brevis • cảm ơn bạn đã tôn trọng công sức dịch giả
            </div>
          </div>
        </div>
      )}

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
