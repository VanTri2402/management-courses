"use client";

import React, { useState, useTransition } from "react";
import { Bookmark as BookmarkIcon } from "lucide-react";
import { toggleBookmarkAction } from "@/server/actions/interaction";
import { toast } from "sonner";
import { BookmarkMetadata } from "@/types";

interface BookmarkButtonProps {
  entityType: string;
  entityId: string;
  metadata?: BookmarkMetadata;
  initialBookmarked?: boolean;
  className?: string;
  showText?: boolean;
}

export function BookmarkButton({
  entityType,
  entityId,
  metadata = { title: "Item" },
  initialBookmarked = false,
  className = "",
  showText = false,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic UI update
    const previousState = isBookmarked;
    const nextState = !previousState;
    setIsBookmarked(nextState);

    toast[nextState ? "success" : "info"](
      nextState ? "Đã lưu vào bộ sưu tập cá nhân" : "Đã xóa khỏi bộ sưu tập"
    );

    startTransition(async () => {
      const res = await toggleBookmarkAction({
        entityType,
        entityId,
        metadata,
      });

      if (!res.success) {
        // Rollback on failure
        setIsBookmarked(previousState);
        toast.error(res.error || "Không thể thực hiện lưu trữ. Vui lòng thử lại.");
      } else if (res.data) {
        setIsBookmarked(res.data.bookmarked);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={isBookmarked ? "Bỏ lưu mục này" : "Lưu vào mục yêu thích"}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 active:scale-95 ${
        isBookmarked
          ? "bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-500/25 shadow-sm"
          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
      } ${className}`}
    >
      <BookmarkIcon
        className={`w-3.5 h-3.5 transition-transform duration-300 ${
          isBookmarked ? "fill-rose-500 scale-110" : ""
        }`}
      />
      {showText && (
        <span>{isBookmarked ? "Đã lưu" : "Lưu lại"}</span>
      )}
    </button>
  );
}
