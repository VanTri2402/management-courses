"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/safe-action";
import { NotificationType } from "@prisma/client";

export interface SendNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  actionUrl?: string;
}

/**
 * Universal Internal Notification Sender:
 * Call from anywhere in the codebase to dispatch an in-app notification to a user.
 */
export async function sendNotification({
  userId,
  title,
  message,
  type = NotificationType.SYSTEM,
  actionUrl,
}: SendNotificationParams) {
  try {
    return await db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        actionUrl: actionUrl || null,
        isRead: false,
      },
    });
  } catch (err) {
    console.error("Failed to send notification:", err);
    return null;
  }
}

export const markNotificationAsReadAction = createSafeAction(
  {
    schema: z.object({ id: z.string().min(1) }),
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"],
  },
  async ({ id }, { user }) => {
    if (!user) throw new Error("Chưa đăng nhập.");

    const notification = await db.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== user.id) {
      throw new Error("Thông báo không tồn tại hoặc không thuộc quyền sở hữu.");
    }

    return db.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }
);

export const markAllNotificationsAsReadAction = createSafeAction(
  {
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"],
  },
  async (_, { user }) => {
    if (!user) throw new Error("Chưa đăng nhập.");

    await db.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true };
  }
);
