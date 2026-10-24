import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function getUserNotifications(limit = 20) {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    return await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch (e) {
    return [];
  }
}

export async function getUnreadNotificationsCount() {
  try {
    const user = await getCurrentUser();
    if (!user) return 0;

    return await db.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });
  } catch (e) {
    return 0;
  }
}
