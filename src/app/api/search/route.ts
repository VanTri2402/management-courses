import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const [courses, categories, navItems] = await Promise.all([
      db.course.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { subtitle: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 6,
        select: {
          id: true,
          title: true,
          slug: true,
          level: true,
        },
      }),
      db.category.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 4,
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),
      db.navigationItem.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { slugOrUrl: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 4,
      }),
    ]);

    const results = [
      ...courses.map((c) => ({
        id: c.id,
        title: `[Khóa học] ${c.title}`,
        url: `/courses/${c.slug}`,
        type: "COURSE",
      })),
      ...categories.map((cat) => ({
        id: cat.id,
        title: `[Danh mục] ${cat.name}`,
        url: `/courses?category=${cat.slug}`,
        type: "CATEGORY",
      })),
      ...navItems.map((n) => ({
        id: n.id,
        title: n.title,
        url: n.slugOrUrl,
        type: "NAVIGATION",
      })),
    ];

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
