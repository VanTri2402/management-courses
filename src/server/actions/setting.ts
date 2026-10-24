"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/safe-action";
import { SettingGroup } from "@prisma/client";

const singleSettingSchema = z.object({
  key: z.string().min(1, "Key không hợp lệ"),
  value: z.any(),
  group: z.nativeEnum(SettingGroup).optional(),
  description: z.string().optional(),
});

const bulkSettingsSchema = z.object({
  settings: z.array(
    z.object({
      key: z.string().min(1),
      value: z.any(),
      group: z.nativeEnum(SettingGroup).optional(),
      description: z.string().optional(),
    })
  ),
});

export const updateSiteSettingAction = createSafeAction(
  {
    schema: singleSettingSchema,
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    auditAction: "UPDATE_SITE_SETTING",
    auditEntityType: "SITE_SETTING",
  },
  async ({ key, value, group, description }) => {
    const updated = await db.siteSetting.upsert({
      where: { key },
      update: {
        value,
        ...(description && { description }),
      },
      create: {
        key,
        value,
        group: group || SettingGroup.GENERAL,
        description: description || null,
      },
    });

    // On-demand Cache Revalidation
    revalidateTag("layout-data");
    revalidateTag("site-settings");

    return updated;
  }
);

export const bulkUpdateSiteSettingsAction = createSafeAction(
  {
    schema: bulkSettingsSchema,
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    auditAction: "BULK_UPDATE_SITE_SETTINGS",
    auditEntityType: "SITE_SETTING",
  },
  async ({ settings }) => {
    const results = [];
    for (const item of settings) {
      const res = await db.siteSetting.upsert({
        where: { key: item.key },
        update: {
          value: item.value,
          ...(item.description && { description: item.description }),
        },
        create: {
          key: item.key,
          value: item.value,
          group: item.group || SettingGroup.GENERAL,
          description: item.description || null,
        },
      });
      results.push(res);
    }

    // On-demand Cache Revalidation
    revalidateTag("layout-data");
    revalidateTag("site-settings");

    return results;
  }
);
