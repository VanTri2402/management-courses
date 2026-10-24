import React from "react";
import { getAdminCourses } from "@/server/queries/courses";
import { CourseListClient } from "./course-list";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = await getAdminCourses();
  return <CourseListClient initialCourses={courses} />;
}
