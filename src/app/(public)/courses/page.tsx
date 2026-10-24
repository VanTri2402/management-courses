import React from "react";
import { getCourses, getCategories } from "@/server/queries/courses";
import { CoursesCatalogClient } from "./courses-catalog";
import { CourseLevel } from "@prisma/client";

export const dynamic = "force-dynamic";

interface CoursesPageProps {
  searchParams: {
    q?: string;
    category?: string;
    level?: string;
    sort?: "newest" | "price-asc" | "price-desc" | "popular";
    page?: string;
  };
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const page = Number(searchParams.page) || 1;
  const level = Object.values(CourseLevel).includes(searchParams.level as CourseLevel)
    ? (searchParams.level as CourseLevel)
    : undefined;

  const [{ courses, total, totalPages }, categories] = await Promise.all([
    getCourses({
      search: searchParams.q,
      categorySlug: searchParams.category,
      level,
      sortBy: searchParams.sort,
      page,
      limit: 12,
    }),
    getCategories(),
  ]);

  return (
    <CoursesCatalogClient
      initialCourses={courses}
      categories={categories}
      total={total}
      page={page}
      totalPages={totalPages}
      activeCategory={searchParams.category || "all"}
      activeLevel={searchParams.level || "ALL"}
      searchQuery={searchParams.q || ""}
      activeSort={searchParams.sort || "newest"}
    />
  );
}
