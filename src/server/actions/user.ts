"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/safe-action";
import { Role, UserStatus } from "@prisma/client";

export const updateUserRoleAction = createSafeAction(
  {
    schema: z.object({
      userId: z.string().min(1),
      role: z.nativeEnum(Role),
    }),
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    auditAction: "UPDATE_USER_ROLE",
    auditEntityType: "USER",
  },
  async ({ userId, role }, { user }) => {
    if (userId === user?.id) {
      throw new Error("Không thể tự thay đổi vai trò của chính mình.");
    }

    const targetUser = await db.user.findUnique({
      where: { id: userId },
    });
    if (!targetUser) throw new Error("Người dùng không tồn tại.");

    // ADMIN cannot modify SUPER_ADMIN or promote anyone to SUPER_ADMIN
    if (user?.role === "ADMIN") {
      if (targetUser.role === "SUPER_ADMIN") {
        throw new Error("Chỉ Super Admin mới có quyền thao tác với tài khoản Super Admin.");
      }
      if (role === "SUPER_ADMIN") {
        throw new Error("Admin không có quyền cấp quyền Super Admin.");
      }
    }

    return db.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, fullName: true, role: true, status: true },
    });
  }
);

export const updateUserStatusAction = createSafeAction(
  {
    schema: z.object({
      userId: z.string().min(1),
      status: z.nativeEnum(UserStatus),
    }),
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    auditAction: "UPDATE_USER_STATUS",
    auditEntityType: "USER",
  },
  async ({ userId, status }, { user }) => {
    const targetUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) throw new Error("Người dùng không tồn tại.");

    if (targetUser.role === "SUPER_ADMIN") {
      throw new Error("Không thể thay đổi trạng thái của Super Admin.");
    }

    if (userId === user?.id) {
      throw new Error("Không thể tự khóa tài khoản của chính mình.");
    }

    return db.user.update({
      where: { id: userId },
      data: { status },
      select: { id: true, email: true, fullName: true, role: true, status: true },
    });
  }
);
