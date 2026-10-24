import React from "react";
import { db } from "@/lib/db";
import { CourseForm } from "../course-form";

export const dynamic = "force-dynamic";

export default async function NewCourseAdminPage() {
  const [categories, instructors] = await Promise.all([
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

  return <CourseForm categories={categories} instructors={instructors} />;
}
