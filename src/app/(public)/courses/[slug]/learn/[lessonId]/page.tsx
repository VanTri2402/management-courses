import React from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getLessonWithCourse } from "@/server/queries/courses";
import { getEntityComments } from "@/server/queries/interactions";
import { LessonLearningClient } from "./lesson-learning-client";

export const dynamic = "force-dynamic";

interface LessonLearningPageProps {
  params: {
    slug: string;
    lessonId: string;
  };
}

export default async function LessonLearningPage({ params }: LessonLearningPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/login?redirect=/courses/${params.slug}/learn/${params.lessonId}`);
  }

  const data = await getLessonWithCourse(
    params.slug,
    params.lessonId,
    currentUser.id
  );

  if (!data || !data.course || !data.lesson) {
    notFound();
  }

  // Fetch comments for this specific lesson
  const lessonCommentsRaw = await getEntityComments("LESSON", data.lesson.id);
  const lessonComments = lessonCommentsRaw.map((c) => ({
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
    <LessonLearningClient
      course={data.course}
      lesson={data.lesson}
      userProgress={data.userProgress}
      enrollment={data.enrollment}
      currentUser={currentUser}
      initialComments={lessonComments}
    />
  );
}
