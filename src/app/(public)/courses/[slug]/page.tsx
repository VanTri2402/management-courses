import React from "react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCourseBySlug } from "@/server/queries/courses";
import { getEntityComments, isEntityBookmarked } from "@/server/queries/interactions";
import { CourseDetailClient } from "./course-detail-client";

export const dynamic = "force-dynamic";

interface CourseDetailPageProps {
  params: {
    slug: string;
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const currentUser = await getCurrentUser();
  const course = await getCourseBySlug(params.slug, currentUser?.id);

  if (!course) {
    notFound();
  }

  // Fetch comments & bookmark status
  const [commentsRaw, isBookmarked] = await Promise.all([
    getEntityComments("COURSE", course.id),
    currentUser ? isEntityBookmarked("COURSE", course.id) : false,
  ]);

  const comments = commentsRaw.map((c) => ({
    id: c.id,
    userId: c.userId,
    content: c.content,
    rating: c.rating,
    createdAt: c.createdAt,
    parentId: c.parentId,
    user: {
      id: c.user.id,
      fullName: c.user.fullName,
      avatarUrl: c.user.avatarUrl,
      role: c.user.role,
    },
    replies: (c.replies || []).map((r: any) => ({
      id: r.id,
      userId: r.userId,
      content: r.content,
      rating: r.rating,
      createdAt: r.createdAt,
      parentId: r.parentId,
      user: {
        id: r.user.id,
        fullName: r.user.fullName,
        avatarUrl: r.user.avatarUrl,
        role: r.user.role,
      },
    })),
  }));

  return (
    <CourseDetailClient
      course={course}
      currentUser={currentUser}
      initialComments={comments}
      initialIsBookmarked={isBookmarked}
    />
  );
}
