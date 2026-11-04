"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bookmark,
  BookOpen,
  Clock,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getLocalBookshelf,
  removeBookshelfItem,
  type BookshelfItem,
} from "@/lib/bookshelf";

interface BookshelfDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookshelfDrawer({ isOpen, onClose }: BookshelfDrawerProps) {
  const [items, setItems] = React.useState<BookshelfItem[]>([]);

  const loadItems = React.useCallback(() => {
    setItems(getLocalBookshelf());
  }, []);

  React.useEffect(() => {
    loadItems();
    window.addEventListener("bookshelf_updated", loadItems);
    return () => window.removeEventListener("bookshelf_updated", loadItems);
  }, [loadItems]);

  React.useEffect(() => {
    if (isOpen) {
      loadItems();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, loadItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#FAF5EE] dark:bg-[#1E1916] text-[#2B2623] dark:text-[#FAF5EE] border-l-2 border-[#2B2623] shadow-[-6px_0px_0px_#2B2623] h-full flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b-2 border-[#2B2623]/20 flex items-center justify-between bg-[#FDFBF7] dark:bg-[#25201C]">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-[10px] bg-[#E07B4C] text-white border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] flex items-center justify-center">
              <Bookmark className="size-4.5 fill-current" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold">Tủ Sách Của Tôi</h2>
              <p className="text-xs font-mono text-[#5C5146] dark:text-[#C4B9AD]">
                {items.length} bộ truyện đã đánh dấu &amp; lưu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border-2 border-transparent hover:border-[#2B2623] hover:bg-[#E5DDD2] dark:hover:bg-[#3D352E] text-[#5C5146] dark:text-[#C4B9AD] transition-all cursor-pointer"
            title="Đóng tủ sách"
          >
            <X className="size-5 text-[#2B2623] dark:text-[#FAF5EE]" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 scrollbar-thin">
          {items.length === 0 ? (
            <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
              <div className="size-16 rounded-full bg-[#F4DFAD] border-2 border-[#2B2623] shadow-[2px_3px_0px_#2B2623] flex items-center justify-center mb-4">
                <Bookmark className="size-8 text-[#E07B4C]" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#2B2623] dark:text-[#FAF5EE] mb-1.5">
                Tủ sách đang trống
              </h3>
              <p className="text-xs text-[#5C5146] dark:text-[#C4B9AD] max-w-xs leading-relaxed mb-6 font-sans">
                Khi đọc truyện, bạn bấm nút <strong className="text-[#E07B4C]">Đánh dấu đang đọc</strong> hoặc <strong className="text-[#E07B4C]">Thêm vào tủ sách</strong> để lưu tiến độ và đọc tiếp bất cứ lúc nào nhé!
              </p>
              <Link href="/kho-truyen" onClick={onClose}>
                <Button className="h-9 px-4 rounded-[12px] text-xs font-mono font-bold bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[2px_2.5px_0px_#2B2623]">
                  Khám phá Thư viện
                </Button>
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.storyId}
                className="p-3.5 rounded-[16px] bg-[#FDFBF7] dark:bg-[#25201C] border-2 border-[#2B2623] shadow-[2.5px_3.5px_0px_#2B2623] flex gap-3 transition-all hover:translate-x-[1px]"
              >
                {/* Book Cover */}
                <Link
                  href={`/truyen/${item.storySlug}`}
                  onClick={onClose}
                  className="relative w-16 h-22 shrink-0 rounded-[10px] overflow-hidden bg-[#E5DDD2] border border-[#2B2623]/30 block shadow-inner"
                >
                  {item.coverUrl ? (
                    <Image
                      src={item.coverUrl}
                      alt={item.storyTitle}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#5C5146]">
                      <BookOpen className="size-5" />
                    </div>
                  )}
                </Link>

                {/* Info & Actions */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <Link
                        href={`/truyen/${item.storySlug}`}
                        onClick={onClose}
                        className="font-serif text-sm font-bold text-[#2B2623] dark:text-[#FAF5EE] hover:text-[#E07B4C] transition-colors line-clamp-1"
                        title={item.storyTitle}
                      >
                        {item.storyTitle}
                      </Link>

                      <button
                        onClick={() => removeBookshelfItem(item.storyId)}
                        className="p-1 text-[#5C5146] hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                        title="Bỏ khỏi tủ sách"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    {item.storyAuthor && (
                      <p className="text-[11px] text-[#5C5146] dark:text-[#C4B9AD] truncate font-sans">
                        Tác giả: {item.storyAuthor}
                      </p>
                    )}

                    {/* Reading Status Pill */}
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono">
                      {item.lastChapterNumber ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[#BDCEAF] text-[#2B2623] font-bold border border-[#2B2623]/20">
                          <Clock className="size-3" />
                          Đang đọc Chương {item.lastChapterNumber}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[#E5DDD2] dark:bg-[#3D352E] text-[#5C5146] dark:text-[#C4B9AD] font-semibold">
                          Chưa đọc
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-2.5 flex items-center gap-2">
                    {item.lastChapterId ? (
                      <Link
                        href={`/chuong/${item.lastChapterId}`}
                        onClick={onClose}
                        className="flex-1"
                      >
                        <Button
                          size="sm"
                          className="w-full h-8 px-3 rounded-[10px] text-xs font-mono font-bold bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] flex items-center justify-center gap-1"
                        >
                          <BookOpen className="size-3" />
                          <span>Đọc tiếp</span>
                        </Button>
                      </Link>
                    ) : (
                      <Link
                        href={`/truyen/${item.storySlug}`}
                        onClick={onClose}
                        className="flex-1"
                      >
                        <Button
                          size="sm"
                          className="w-full h-8 px-3 rounded-[10px] text-xs font-mono font-bold bg-[#E07B4C] hover:bg-[#DC7648] text-white border-2 border-[#2B2623] shadow-[1.5px_2px_0px_#2B2623] flex items-center justify-center gap-1"
                        >
                          <BookOpen className="size-3" />
                          <span>Mở truyện</span>
                        </Button>
                      </Link>
                    )}

                    <Link
                      href={`/truyen/${item.storySlug}`}
                      onClick={onClose}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5 rounded-[10px] text-xs font-mono font-bold border-2 border-[#2B2623] bg-[#FAF5EE] dark:bg-[#2A2420] text-[#2B2623] dark:text-[#FAF5EE] shadow-[1.5px_2px_0px_#2B2623] hover:bg-[#E5DDD2]"
                        title="Xem trang giới thiệu"
                      >
                        Chi tiết
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3.5 border-t-2 border-[#2B2623]/20 bg-[#FDFBF7] dark:bg-[#25201C] text-center text-[11px] font-mono text-[#5C5146] dark:text-[#C4B9AD]">
          <span>Tiến độ đọc được tự động đồng bộ trên thiết bị của bạn</span>
        </div>
      </div>
    </div>
  );
}
