import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserBookmarks } from "@/server/queries/interactions";
import { getUserEnrolledCourses } from "@/server/queries/courses";
import { ProfileClientView } from "./profile-client";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?from=/profile");
  }

  const [bookmarks, enrolledCourses] = await Promise.all([
    getUserBookmarks(user.id),
    getUserEnrolledCourses(user.id),
  ]);

  return (
    <ProfileClientView
      user={user}
      bookmarks={bookmarks}
      enrolledCourses={enrolledCourses}
    />
  );
}
