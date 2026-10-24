import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { NavigationItemWithChildren, LayoutData } from "@/types";
import { MenuLocation } from "@prisma/client";

/**
 * Cache layout query for optimal performance with on-demand tag revalidation ('layout-data')
 */
const getCachedLayoutStructure = unstable_cache(
  async () => {
    try {
      // 1. Fetch all active navigation items
      const navItems = await db.navigationItem.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      });

      // 2. Fetch all site settings
      const settingsRaw = await db.siteSetting.findMany();
      const settings: Record<string, any> = {};
      for (const s of settingsRaw) {
        settings[s.key] = s.value;
      }

      // Helper: build hierarchical tree
      const buildTree = (items: typeof navItems, location: MenuLocation): NavigationItemWithChildren[] => {
        const locItems = items.filter((i) => i.location === location);
        const rootItems = locItems.filter((i) => !i.parentId);

        return rootItems.map((parent) => ({
          ...parent,
          children: locItems.filter((child) => child.parentId === parent.id),
        }));
      };

      return {
        settings,
        headerMain: buildTree(navItems, MenuLocation.HEADER_MAIN),
        headerUtility: buildTree(navItems, MenuLocation.HEADER_UTILITY),
        footerCol1: buildTree(navItems, MenuLocation.FOOTER_COL_1),
        footerCol2: buildTree(navItems, MenuLocation.FOOTER_COL_2),
        footerCol3: buildTree(navItems, MenuLocation.FOOTER_COL_3),
        footerBottom: buildTree(navItems, MenuLocation.FOOTER_BOTTOM),
      };
    } catch (err) {
      console.warn("[LayoutQuery] Fallback to default layout configuration due to DB offline:", err);
      return {
        settings: {
          site_name: "EduCore Academy",
          site_tagline: "Nền Tảng Đào Tạo Kỹ Sư Công Nghệ Chuẩn Quốc Tế",
          header_cta_text: "Khám Phá Khóa Học",
          header_cta_url: "/courses",
          footer_about: "EduCore là hệ sinh thái đào tạo công nghệ chất lượng cao, cung cấp lộ trình thực chiến từ cơ bản đến chuyên sâu về Next.js Enterprise, Generative AI, Cloud Native và UI/UX Awwwards.",
          footer_copyright: "© 2026 EduCore Global Academy. Toàn bộ bản quyền được bảo hộ.",
        },
        headerMain: [
          { id: "fallback-home", title: "Trang chủ", slugOrUrl: "/", location: MenuLocation.HEADER_MAIN, sortOrder: 1, isExternal: false, isActive: true },
          { id: "fallback-courses", title: "Khóa học", slugOrUrl: "/courses", location: MenuLocation.HEADER_MAIN, sortOrder: 2, isExternal: false, isActive: true },
          { id: "fallback-roadmap", title: "Lộ trình đào tạo", slugOrUrl: "/#roadmap", location: MenuLocation.HEADER_MAIN, sortOrder: 3, isExternal: false, isActive: true },
          { id: "fallback-about", title: "Về EduCore", slugOrUrl: "/#about", location: MenuLocation.HEADER_MAIN, sortOrder: 4, isExternal: false, isActive: true },
        ],
        headerUtility: [],
        footerCol1: [],
        footerCol2: [],
        footerCol3: [],
        footerBottom: [],
      };
    }
  },
  ["layout-structure"],
  {
    tags: ["layout-data", "site-settings"],
    revalidate: 3600, // 1 hour stale fallback
  }
);

/**
 * Fetch dynamic layout data including user-specific state
 */
export async function getLayoutData(): Promise<LayoutData> {
  const structure = await getCachedLayoutStructure();
  const currentUser = await getCurrentUser();

  let unreadNotificationsCount = 0;
  if (currentUser) {
    try {
      unreadNotificationsCount = await db.notification.count({
        where: {
          userId: currentUser.id,
          isRead: false,
        },
      });
    } catch (e) {
      unreadNotificationsCount = 0;
    }
  }

  // Filter items by user role if requiredRole is set
  const filterByRole = (items: NavigationItemWithChildren[]): NavigationItemWithChildren[] => {
    return items
      .filter((item) => {
        if (!item.requiredRole) return true;
        if (!currentUser) return false;
        return item.requiredRole === currentUser.role || currentUser.role === "SUPER_ADMIN";
      })
      .map((item) => ({
        ...item,
        children: item.children ? filterByRole(item.children) : [],
      }));
  };

  return {
    settings: structure.settings,
    headerMain: filterByRole(structure.headerMain),
    headerUtility: filterByRole(structure.headerUtility),
    footerCol1: filterByRole(structure.footerCol1),
    footerCol2: filterByRole(structure.footerCol2),
    footerCol3: filterByRole(structure.footerCol3),
    footerBottom: filterByRole(structure.footerBottom),
    currentUser,
    unreadNotificationsCount,
  };
}
