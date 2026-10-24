"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/safe-action";
import { sendNotification } from "@/server/actions/notification";
import { NotificationType } from "@prisma/client";

const toggleBookmarkSchema = z.object({
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  metadata: z.record(z.any()).default({}),
});

const createCommentSchema = z.object({
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  content: z.string().min(2, "Bình luận phải có ít nhất 2 ký tự").max(2000, "Bình luận quá dài"),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export const toggleBookmarkAction = createSafeAction(
  {
    schema: toggleBookmarkSchema,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"],
    auditAction: "TOGGLE_BOOKMARK",
    auditEntityType: "BOOKMARK",
  },
  async ({ entityType, entityId, metadata }, { user }) => {
    if (!user) throw new Error("Chưa đăng nhập.");

    const existing = await db.bookmark.findUnique({
      where: {
        userId_entityType_entityId: {
          userId: user.id,
          entityType,
          entityId,
        },
      },
    });

    if (existing) {
      await db.bookmark.delete({
        where: { id: existing.id },
      });
      return { bookmarked: false };
    }

    await db.bookmark.create({
      data: {
        userId: user.id,
        entityType,
        entityId,
        metadata,
      },
    });

    return { bookmarked: true };
  }
);

export const createCommentAction = createSafeAction(
  {
    schema: createCommentSchema,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"],
    auditAction: "CREATE_COMMENT",
    auditEntityType: "COMMENT",
  },
  async ({ entityType, entityId, content, rating, parentId }, { user }) => {
    if (!user) throw new Error("Chưa đăng nhập.");

    const comment = await db.comment.create({
      data: {
        userId: user.id,
        entityType,
        entityId,
        content: content.trim(),
        rating: rating || null,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    // If replying to a comment, notify parent author
    if (parentId) {
      const parentComment = await db.comment.findUnique({
        where: { id: parentId },
      });
      if (parentComment && parentComment.userId !== user.id) {
        await sendNotification({
          userId: parentComment.userId,
          title: "Phản hồi mới về bình luận của bạn",
          message: `${user.fullName} vừa trả lời bình luận của bạn.`,
          type: NotificationType.INTERACTION,
          actionUrl: `/#comment-${comment.id}`,
        });
      }
    }

    return comment;
  }
);

export const deleteCommentAction = createSafeAction(
  {
    schema: z.object({ id: z.string().min(1) }),
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"],
    auditAction: "DELETE_COMMENT",
    auditEntityType: "COMMENT",
  },
  async ({ id }, { user }) => {
    if (!user) throw new Error("Chưa đăng nhập.");

    const comment = await db.comment.findUnique({
      where: { id },
    });

    if (!comment) throw new Error("Bình luận không tồn tại.");

    const isAuthor = comment.userId === user.id;
    const isStaff = user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "EDITOR";

    if (!isAuthor && !isStaff) {
      throw new Error("Bạn không có quyền xóa bình luận này.");
    }

    await db.comment.delete({
      where: { id },
    });

    return { success: true, id };
  }
);
