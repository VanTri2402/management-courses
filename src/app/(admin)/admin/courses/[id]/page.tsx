import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getAdminCourseById } from "@/server/queries/courses";
import { CourseForm } from "../course-form";

export const dynamic = "force-dynamic";

interface EditCoursePageProps {
  params: {
    id: string;
  };
}

export default async function EditCourseAdminPage({ params }: EditCoursePageProps) {
  const [course, categories, instructors] = await Promise.all([
    getAdminCourseById(params.id),
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    db.user.findMany({
      where: {
        role: { in: ["SUPER_ADMIN", "ADMIN", "EDITOR"] },
      },
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  if (!course) {
    notFound();
  }

  return (
    <CourseForm
      initialCourse={course}
      categories={categories}
      instructors={instructors}
    />
  );
}
