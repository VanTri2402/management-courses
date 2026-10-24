import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Base static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    // Add dynamic navigation item routes
    const navItems = await db.navigationItem.findMany({
      where: { isActive: true, isExternal: false },
      select: { slugOrUrl: true, updatedAt: true },
    });

    for (const item of navItems) {
      if (item.slugOrUrl.startsWith("/") && !item.slugOrUrl.includes("#")) {
        routes.push({
          url: `${baseUrl}${item.slugOrUrl}`,
          lastModified: item.updatedAt,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }

    // Add all published courses
    const courses = await db.course.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });

    for (const course of courses) {
      routes.push({
        url: `${baseUrl}/courses/${course.slug}`,
        lastModified: course.updatedAt,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  } catch (err) {
    console.error("Error generating dynamic sitemap:", err);
  }

  return routes;
}
