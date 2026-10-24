"use client";

import React, { useState, useTransition } from "react";
import { createCommentAction, deleteCommentAction } from "@/server/actions/interaction";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { Star, MessageSquare, Reply, Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { SafeUser } from "@/types";

export interface CommentItem {
  id: string;
  userId: string;
  content: string;
  rating?: number | null;
  createdAt: Date | string;
  parentId?: string | null;
  user: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    role: string;
  };
  replies?: CommentItem[];
}

interface CommentSectionProps {
  entityType: string;
  entityId: string;
  initialComments?: CommentItem[];
  currentUser?: SafeUser | null;
}

export function CommentSection({
  entityType,
  entityId,
  initialComments = [],
  currentUser,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number | null>(5);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Vui lòng đăng nhập để gửi bình luận.");
      return;
    }
    if (!content.trim()) return;

    startTransition(async () => {
      const res = await createCommentAction({
        entityType,
        entityId,
        content: content.trim(),
        rating,
        parentId: null,
      });

      if (res.success && res.data) {
        toast.success("Bình luận của bạn đã được đăng!");
        setComments([res.data as CommentItem, ...comments]);
        setContent("");
      } else {
        toast.error(res.error || "Không thể gửi bình luận.");
      }
    });
  };

  const handlePostReply = (parentId: string) => {
    if (!currentUser) {
      toast.error("Vui lòng đăng nhập để trả lời.");
      return;
    }
    if (!replyContent.trim()) return;

    startTransition(async () => {
      const res = await createCommentAction({
        entityType,
        entityId,
        content: replyContent.trim(),
        parentId,
      });

      if (res.success && res.data) {
        toast.success("Đã gửi phản hồi!");
        // Update reply list in parent
        setComments(
          comments.map((c) => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: [...(c.replies || []), res.data as CommentItem],
              };
            }
            return c;
          })
        );
        setReplyToId(null);
        setReplyContent("");
      } else {
        toast.error(res.error || "Không thể gửi phản hồi.");
      }
    });
  };

  const handleDeleteComment = (commentId: string, isReply = false, parentId?: string) => {
    startTransition(async () => {
      const res = await deleteCommentAction({ id: commentId });
      if (res.success) {
        toast.success("Đã xóa bình luận.");
        if (isReply && parentId) {
          setComments(
            comments.map((c) => {
              if (c.id === parentId) {
                return {
                  ...c,
                  replies: (c.replies || []).filter((r) => r.id !== commentId),
                };
              }
              return c;
            })
          );
        } else {
          setComments(comments.filter((c) => c.id !== commentId));
        }
      } else {
        toast.error(res.error || "Không thể xóa bình luận.");
      }
    });
  };

  return (
    <div className="space-y-8 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold tracking-tight">
            Đánh giá & Bình luận ({comments.length})
          </h3>
        </div>
      </div>

      {/* Main Comment Box */}
      <form onSubmit={handlePostComment} className="space-y-4">
        {/* Rating Stars Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Đánh giá sao:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-4 h-4 ${
                    rating && rating >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/40 hover:text-amber-400"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            currentUser
              ? "Chia sẻ cảm nghĩ hoặc đánh giá của bạn..."
              : "Vui lòng đăng nhập để tham gia đánh giá & bình luận..."
          }
          disabled={!currentUser || isPending}
          rows={3}
          className="resize-none"
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!currentUser || !content.trim() || isPending}
            isLoading={isPending}
            size="sm"
            className="gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi bình luận</span>
          </Button>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-6 divide-y divide-border/40">
        {comments.length === 0 ? (
          <p className="text-center py-8 text-sm text-muted-foreground">
            Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nhận!
          </p>
        ) : (
          comments.map((comment) => {
            const canDelete =
              currentUser &&
              (currentUser.id === comment.userId ||
                currentUser.role === "SUPER_ADMIN" ||
                currentUser.role === "ADMIN" ||
                currentUser.role === "EDITOR");

            return (
              <div key={comment.id} className="pt-6 first:pt-0 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 overflow-hidden flex items-center justify-center text-xs font-bold text-primary">
                      {comment.user.avatarUrl ? (
                        <img
                          src={comment.user.avatarUrl}
                          alt={comment.user.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        comment.user.fullName[0]?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          {comment.user.fullName}
                        </span>
                        {comment.user.role !== "USER" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono font-medium">
                            {comment.user.role}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  {comment.rating && (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= (comment.rating || 0)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Content */}
                <p className="text-sm text-foreground/90 pl-10 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pl-10 text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={() =>
                      setReplyToId(replyToId === comment.id ? null : comment.id)
                    }
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Trả lời</span>
                  </button>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="flex items-center gap-1 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  )}
                </div>

                {/* Reply Form */}
                {replyToId === comment.id && (
                  <div className="pl-10 pt-2 space-y-2">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Trả lời @${comment.user.fullName}...`}
                      rows={2}
                      className="text-xs"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyToId(null)}
                      >
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handlePostReply(comment.id)}
                        disabled={!replyContent.trim() || isPending}
                        isLoading={isPending}
                      >
                        Gửi phản hồi
                      </Button>
                    </div>
                  </div>
                )}

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-10 pl-4 border-l-2 border-border/60 space-y-3 pt-2">
                    {comment.replies.map((reply) => {
                      const canDeleteReply =
                        currentUser &&
                        (currentUser.id === reply.userId ||
                          currentUser.role === "SUPER_ADMIN" ||
                          currentUser.role === "ADMIN" ||
                          currentUser.role === "EDITOR");

                      return (
                        <div key={reply.id} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold">
                                {reply.user.fullName}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            {canDeleteReply && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteComment(reply.id, true, comment.id)
                                }
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-foreground/80 leading-relaxed">
                            {reply.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
