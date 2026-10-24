import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { SettingGroup } from "@prisma/client";

export const getCachedSiteSettings = unstable_cache(
  async () => {
    try {
      const raw = await db.siteSetting.findMany();
      const map: Record<string, any> = {};
      for (const item of raw) {
        map[item.key] = item.value;
      }
      return map;
    } catch (e) {
      return {};
    }
  },
  ["site-settings-map"],
  {
    tags: ["site-settings", "layout-data"],
    revalidate: 3600,
  }
);

export async function getAllSettingsGrouped() {
  const grouped: Record<SettingGroup, any[]> = {
    GENERAL: [],
    HEADER_FOOTER: [],
    SEO: [],
    SOCIAL: [],
    THEME: [],
    SYSTEM: [],
  };

  try {
    const settings = await db.siteSetting.findMany({
      orderBy: { key: "asc" },
    });

    for (const s of settings) {
      if (grouped[s.group]) {
        grouped[s.group].push(s);
      }
    }
  } catch (e) {
    console.warn("[SettingsQuery] Failed to fetch grouped settings:", e);
  }

  return grouped;
}
