import { db } from "@/lib/db";
import { CourseLevel, Prisma } from "@prisma/client";

export interface GetCoursesParams {
  search?: string;
  categorySlug?: string;
  level?: CourseLevel;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "newest" | "price-asc" | "price-desc" | "popular";
}

/**
 * Fetch paginated courses with flexible filtering
 */
export async function getCourses(params: GetCoursesParams = {}) {
  const {
    search,
    categorySlug,
    level,
    isFeatured,
    page = 1,
    limit = 12,
    sortBy = "newest",
  } = params;

  const skip = (page - 1) * limit;

  const where: Prisma.CourseWhereInput = {
    isPublished: true,
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { subtitle: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (categorySlug && categorySlug !== "all") {
    where.category = {
      slug: categorySlug,
    };
  }

  if (level) {
    where.level = level;
  }

  if (typeof isFeatured === "boolean") {
    where.isFeatured = isFeatured;
  }

  let orderBy: Prisma.CourseOrderByWithRelationInput = { createdAt: "desc" };
  if (sortBy === "price-asc") {
    orderBy = { price: "asc" };
  } else if (sortBy === "price-desc") {
    orderBy = { price: "desc" };
  } else if (sortBy === "popular") {
    orderBy = { enrollments: { _count: "desc" } };
  }

  const [courses, total] = await Promise.all([
    db.course.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
        instructor: {
          select: { id: true, fullName: true, avatarUrl: true, role: true },
        },
        _count: {
          select: {
            enrollments: true,
            chapters: true,
          },
        },
        chapters: {
          select: {
            _count: {
              select: { lessons: true },
            },
          },
        },
      },
    }),
    db.course.count({ where }),
  ]);

  // Aggregate total lessons
  const formattedCourses = courses.map((course) => {
    const totalLessons = course.chapters.reduce(
      (sum, ch) => sum + ch._count.lessons,
      0
    );
    return {
      ...course,
      totalLessons,
    };
  });

  return {
    courses: formattedCourses,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Fetch a single course by slug with full curriculum hierarchy
 */
export async function getCourseBySlug(slug: string, userId?: string) {
  const course = await db.course.findUnique({
    where: { slug },
    include: {
      category: true,
      instructor: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          email: true,
        },
      },
      chapters: {
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: {
            orderBy: { sortOrder: "asc" },
            include: userId
              ? {
                  progress: {
                    where: { userId },
                    select: { isCompleted: true, lastPositionSeconds: true },
                  },
                }
              : undefined,
          },
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  if (!course) return null;

  let enrollment = null;
  if (userId) {
    enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: course.id,
        },
      },
      include: {
        certificates: true,
      },
    });
  }

  // Calculate total duration and lesson count
  let totalLessons = 0;
  let totalMinutes = 0;
  course.chapters.forEach((ch) => {
    totalLessons += ch.lessons.length;
    ch.lessons.forEach((l) => {
      totalMinutes += l.durationMinutes;
    });
  });

  return {
    ...course,
    totalLessons,
    totalMinutes: totalMinutes || course.durationMinutes,
    enrollment,
  };
}

/**
 * Fetch all categories with published course count
 */
export async function getCategories() {
  return db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: {
          courses: {
            where: { isPublished: true },
          },
        },
      },
    },
  });
}

/**
 * Fetch featured courses for landing page
 */
export async function getFeaturedCourses(limit: number = 6) {
  const courses = await db.course.findMany({
    where: {
      isPublished: true,
      isFeatured: true,
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      instructor: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
      _count: {
        select: { enrollments: true },
      },
      chapters: {
        include: {
          _count: {
            select: { lessons: true },
          },
        },
      },
    },
  });

  return courses.map((course) => ({
    ...course,
    totalLessons: course.chapters.reduce((sum, ch) => sum + ch._count.lessons, 0),
  }));
}

/**
 * Fetch student enrolled courses
 */
export async function getUserEnrolledCourses(userId: string) {
  return db.enrollment.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      course: {
        include: {
          category: true,
          instructor: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      },
      certificates: true,
    },
  });
}

/**
 * Fetch lesson for learning viewport
 */
export async function getLessonWithCourse(courseSlug: string, lessonId: string, userId?: string) {
  const course = await db.course.findUnique({
    where: { slug: courseSlug },
    include: {
      category: true,
      instructor: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
      chapters: {
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: {
            orderBy: { sortOrder: "asc" },
            include: userId
              ? {
                  progress: {
                    where: { userId },
                    select: { isCompleted: true },
                  },
                }
              : undefined,
          },
        },
      },
    },
  });

  if (!course) return null;

  // Find the requested lesson
  let targetLesson = null;
  for (const ch of course.chapters) {
    const found = ch.lessons.find((l) => l.id === lessonId);
    if (found) {
      targetLesson = found;
      break;
    }
  }

  // If not found, default to first lesson of first chapter
  if (!targetLesson && course.chapters.length > 0 && course.chapters[0].lessons.length > 0) {
    targetLesson = course.chapters[0].lessons[0];
  }

  let userProgress = null;
  let enrollment = null;
  if (userId) {
    enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: course.id,
        },
      },
    });

    if (targetLesson) {
      userProgress = await db.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId: targetLesson.id,
          },
        },
      });
    }
  }

  return {
    course,
    lesson: targetLesson,
    userProgress,
    enrollment,
  };
}

/**
 * Admin queries
 */
export async function getAdminCourses() {
  return db.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true } },
      instructor: { select: { id: true, fullName: true, email: true } },
      _count: {
        select: {
          chapters: true,
          enrollments: true,
        },
      },
    },
  });
}

export async function getAdminCourseById(id: string) {
  return db.course.findUnique({
    where: { id },
    include: {
      category: true,
      chapters: {
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });
}

export async function getAdminEnrollments() {
  return db.enrollment.findMany({
    orderBy: { enrolledAt: "desc" },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, avatarUrl: true },
      },
      course: {
        select: { id: true, title: true, slug: true, thumbnail: true },
      },
      certificates: true,
    },
  });
}
