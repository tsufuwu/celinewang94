"use client";

import * as React from "react";
import { MessageSquare, ShieldCheck, Reply, CornerDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GuestbookForm } from "./guestbook-form";
import type { GuestbookItem } from "@/app/tro-chuyen/actions";

interface GuestbookListProps {
  posts: GuestbookItem[];
}

export function GuestbookList({ posts }: GuestbookListProps) {
  const [replyingToId, setReplyingToId] = React.useState<string | null>(null);

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-card/60 rounded-3xl border border-dashed border-border/80">
        <MessageSquare className="size-10 mx-auto text-muted-foreground/60 mb-3" />
        <h3 className="font-serif text-lg font-medium text-foreground">
          Chưa có lời nhắn nào
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Hãy là người đầu tiên đặt bút viết nên dòng lưu bút cho góc trò chuyện này nhé!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const isReplying = replyingToId === post.id;
        const replies = post.replies || [];

        return (
          <article
            key={post.id}
            className="p-5 sm:p-6 rounded-2xl bg-card border border-border/70 shadow-xs hover:border-border/90 transition-all duration-200"
          >
            {/* Post Header */}
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-serif text-base font-semibold text-foreground">
                  {post.authorName}
                </span>

                {/* Admin Badge */}
                {post.isAdmin && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-medium bg-orange-100/80 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 border-orange-300 dark:border-orange-800/60 flex items-center gap-1"
                  >
                    <ShieldCheck className="size-3 text-orange-600 dark:text-orange-400" />
                    <span>Quản trị viên (Celine)</span>
                  </Badge>
                )}
              </div>

              {/* Timestamp */}
              <time className="text-[11px] font-mono text-muted-foreground whitespace-nowrap">
                {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>

            {/* Optional Title */}
            {post.title && (
              <h4 className="font-serif text-base font-medium text-foreground mb-1.5">
                {post.title}
              </h4>
            )}

            {/* Content */}
            <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed font-sans">
              {post.content}
            </p>

            {/* Footer / Reply action */}
            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingToId(isReplying ? null : post.id)}
                className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Reply className="size-3" />
                <span>{isReplying ? "Đóng phản hồi" : "Phản hồi"}</span>
              </Button>

              {replies.length > 0 && (
                <span className="text-[11px] font-mono text-muted-foreground">
                  {replies.length} phản hồi
                </span>
              )}
            </div>

            {/* Inline Reply Form */}
            {isReplying && (
              <div className="mt-3">
                <GuestbookForm
                  parentId={post.id}
                  isReply={true}
                  onSuccess={() => setReplyingToId(null)}
                />
              </div>
            )}

            {/* Nested Replies List */}
            {replies.length > 0 && (
              <div className="mt-4 pl-4 sm:pl-6 border-l-2 border-border/60 space-y-3.5">
                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="p-3.5 rounded-xl bg-muted/40 border border-border/50 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <CornerDownRight className="size-3 text-muted-foreground/70" />
                        <span className="font-serif font-medium text-foreground text-sm">
                          {reply.authorName}
                        </span>
                        {reply.isAdmin && (
                          <Badge
                            variant="outline"
                            className="text-[9px] py-0 px-1.5 bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800/60 flex items-center gap-0.5"
                          >
                            <ShieldCheck className="size-2.5 text-amber-600 dark:text-amber-400" />
                            <span>Quản trị viên</span>
                          </Badge>
                        )}
                      </div>
                      <time className="text-[10px] font-mono text-muted-foreground">
                        {new Date(reply.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                    <p className="text-foreground/90 whitespace-pre-line leading-relaxed pl-4">
                      {reply.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

