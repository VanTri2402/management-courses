"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/safe-action";
import { MenuLocation, Role } from "@prisma/client";

const navigationItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Tiêu đề không được để trống"),
  slugOrUrl: z.string().min(1, "Đường dẫn không được để trống"),
  icon: z.string().optional().nullable(),
  badgeText: z.string().optional().nullable(),
  location: z.nativeEnum(MenuLocation),
  parentId: z.string().optional().nullable(),
  sortOrder: z.coerce.number().default(0),
  isExternal: z.boolean().default(false),
  isActive: z.boolean().default(true),
  requiredRole: z.nativeEnum(Role).optional().nullable(),
});

export const createNavigationItemAction = createSafeAction(
  {
    schema: navigationItemSchema,
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    auditAction: "CREATE_NAVIGATION_ITEM",
    auditEntityType: "NAVIGATION_ITEM",
  },
  async (input) => {
    const item = await db.navigationItem.create({
      data: {
        title: input.title,
        slugOrUrl: input.slugOrUrl,
        icon: input.icon || null,
        badgeText: input.badgeText || null,
        location: input.location,
        parentId: input.parentId || null,
        sortOrder: input.sortOrder,
        isExternal: input.isExternal,
        isActive: input.isActive,
        requiredRole: input.requiredRole || null,
      },
    });

    // Revalidate public layout cache immediately
    revalidateTag("layout-data");

    return item;
  }
);

export const updateNavigationItemAction = createSafeAction(
  {
    schema: navigationItemSchema.extend({
      id: z.string().min(1, "ID không hợp lệ"),
    }),
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    auditAction: "UPDATE_NAVIGATION_ITEM",
    auditEntityType: "NAVIGATION_ITEM",
  },
  async (input) => {
    const item = await db.navigationItem.update({
      where: { id: input.id },
      data: {
        title: input.title,
        slugOrUrl: input.slugOrUrl,
        icon: input.icon || null,
        badgeText: input.badgeText || null,
        location: input.location,
        parentId: input.parentId || null,
        sortOrder: input.sortOrder,
        isExternal: input.isExternal,
        isActive: input.isActive,
        requiredRole: input.requiredRole || null,
      },
    });

    // Revalidate public layout cache immediately
    revalidateTag("layout-data");

    return item;
  }
);

export const deleteNavigationItemAction = createSafeAction(
  {
    schema: z.object({ id: z.string().min(1) }),
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    auditAction: "DELETE_NAVIGATION_ITEM",
    auditEntityType: "NAVIGATION_ITEM",
  },
  async ({ id }) => {
    await db.navigationItem.delete({
      where: { id },
    });

    // Revalidate public layout cache immediately
    revalidateTag("layout-data");

    return { success: true, id };
  }
);

export const toggleNavigationItemActiveAction = createSafeAction(
  {
    schema: z.object({
      id: z.string().min(1),
      isActive: z.boolean(),
    }),
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    auditAction: "TOGGLE_NAVIGATION_ITEM",
    auditEntityType: "NAVIGATION_ITEM",
  },
  async ({ id, isActive }) => {
    const updated = await db.navigationItem.update({
      where: { id },
      data: { isActive },
    });

    // Revalidate public layout cache immediately
    revalidateTag("layout-data");

    return updated;
  }
);
