import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function isEntityBookmarked(entityType: string, entityId: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const bookmark = await db.bookmark.findUnique({
      where: {
        userId_entityType_entityId: {
          userId: user.id,
          entityType,
          entityId,
        },
      },
    });

    return !!bookmark;
  } catch (e) {
    return false;
  }
}

export async function getUserBookmarks(userId?: string) {
  try {
    const targetUserId = userId || (await getCurrentUser())?.id;
    if (!targetUserId) return [];

    return await db.bookmark.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    return [];
  }
}

export async function getEntityComments(entityType: string, entityId: string) {
  try {
    return await db.comment.findMany({
      where: {
        entityType,
        entityId,
        isHidden: false,
        parentId: null, // Get root comments
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
        replies: {
          where: { isHidden: false },
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
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    return [];
  }
}
