"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/safe-action";
import { sendNotification } from "@/server/actions/notification";
import { CourseLevel, EnrollmentStatus } from "@prisma/client";

// =============================================================================
// 1. CATEGORY ACTIONS
// =============================================================================

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Tên danh mục không được để trống"),
  slug: z.string().min(1, "Slug không được để trống"),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
});

export const createCategoryAction = createSafeAction(
  {
    schema: categorySchema,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
    auditAction: "CREATE_COURSE_CATEGORY",
    auditEntityType: "CATEGORY",
  },
  async (input) => {
    const existing = await db.category.findUnique({
      where: { slug: input.slug },
    });
    if (existing) {
      throw new Error(`Slug "${input.slug}" đã tồn tại trên hệ thống.`);
    }

    const category = await db.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        icon: input.icon,
        thumbnail: input.thumbnail,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/courses");
    return category;
  }
);

export const updateCategoryAction = createSafeAction(
  {
    schema: categorySchema.extend({
      id: z.string().min(1, "ID không hợp lệ"),
    }),
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
    auditAction: "UPDATE_COURSE_CATEGORY",
    auditEntityType: "CATEGORY",
  },
  async (input) => {
    const category = await db.category.update({
      where: { id: input.id },
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        icon: input.icon,
        thumbnail: input.thumbnail,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/courses");
    return category;
  }
);

export const deleteCategoryAction = createSafeAction(
  {
    schema: z.object({ id: z.string().min(1) }),
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    auditAction: "DELETE_COURSE_CATEGORY",
    auditEntityType: "CATEGORY",
  },
  async ({ id }) => {
    const courseCount = await db.course.count({
      where: { categoryId: id },
    });
    if (courseCount > 0) {
      throw new Error(
        `Không thể xóa danh mục đang có ${courseCount} khóa học liên kết.`
      );
    }

    await db.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    revalidatePath("/courses");
    return { success: true };
  }
);

// =============================================================================
// 2. COURSE ACTIONS
// =============================================================================

const courseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Tiêu đề khóa học phải có ít nhất 3 ký tự"),
  slug: z.string().min(3, "Đường dẫn slug không hợp lệ"),
  subtitle: z.string().optional().nullable(),
  description: z.string().min(10, "Mô tả khóa học phải có ít nhất 10 ký tự"),
  thumbnail: z.string().optional().nullable(),
  trailerVideoUrl: z.string().optional().nullable(),
  level: z.nativeEnum(CourseLevel).default(CourseLevel.ALL_LEVELS),
  price: z.coerce.number().min(0, "Giá không được nhỏ hơn 0"),
  discountPrice: z.coerce.number().optional().nullable(),
  durationMinutes: z.coerce.number().default(0),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  instructorId: z.string().optional(),
});

export const createCourseAction = createSafeAction(
  {
    schema: courseSchema,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "EDITOR"],
    auditAction: "CREATE_COURSE",
    auditEntityType: "COURSE",
  },
  async (input, { user }) => {
    if (!user) {
      throw new Error("Vui lòng đăng nhập để tạo khóa học.");
    }

    const existing = await db.course.findUnique({
      where: { slug: input.slug },
    });
    if (existing) {
      throw new Error(`Khóa học với slug "${input.slug}" đã tồn tại.`);
    }

    const instructorId = input.instructorId || user.id;

    const course = await db.course.create({
      data: {
        title: input.title,
        slug: input.slug,
        subtitle: input.subtitle,
        description: input.description,
        thumbnail: input.thumbnail,
        trailerVideoUrl: input.trailerVideoUrl,
        level: input.level,
        price: input.price,
        discountPrice: input.discountPrice,
        durationMinutes: input.durationMinutes,
        isPublished: input.isPublished,
        isFeatured: input.isFeatured,
        categoryId: input.categoryId,
        instructorId,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    revalidatePath("/");
    return course;
  }
);

export const updateCourseAction = createSafeAction(
  {
    schema: courseSchema.extend({
      id: z.string().min(1, "ID không hợp lệ"),
    }),
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "EDITOR"],
    auditAction: "UPDATE_COURSE",
    auditEntityType: "COURSE",
  },
  async (input) => {
    const course = await db.course.update({
      where: { id: input.id },
      data: {
        title: input.title,
        slug: input.slug,
        subtitle: input.subtitle,
        description: input.description,
        thumbnail: input.thumbnail,
        trailerVideoUrl: input.trailerVideoUrl,
        level: input.level,
        price: input.price,
        discountPrice: input.discountPrice,
        durationMinutes: input.durationMinutes,
        isPublished: input.isPublished,
        isFeatured: input.isFeatured,
        categoryId: input.categoryId,
        instructorId: input.instructorId,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${course.id}`);
    revalidatePath("/courses");
    revalidatePath(`/courses/${course.slug}`);
    revalidatePath("/");
    return course;
  }
);

export const deleteCourseAction = createSafeAction(
  {
    schema: z.object({ id: z.string().min(1) }),
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
    auditAction: "DELETE_COURSE",
    auditEntityType: "COURSE",
  },
  async ({ id }) => {
    await db.course.delete({ where: { id } });
    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    revalidatePath("/");
    return { success: true };
  }
);

// =============================================================================
// 3. CHAPTER & LESSON ACTIONS
// =============================================================================

export const createChapterAction = createSafeAction(
  {
    schema: z.object({
      courseId: z.string().min(1),
      title: z.string().min(1, "Tiêu đề chương không được để trống"),
      slug: z.string().min(1),
      description: z.string().optional().nullable(),
      sortOrder: z.coerce.number().default(0),
    }),
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "EDITOR"],
    auditAction: "CREATE_COURSE_CHAPTER",
    auditEntityType: "CHAPTER",
  },
  async (input) => {
    const chapter = await db.chapter.create({
      data: input,
    });
    revalidatePath(`/admin/courses/${input.courseId}`);
    return chapter;
  }
);

export const createLessonAction = createSafeAction(
  {
    schema: z.object({
      chapterId: z.string().min(1),
      title: z.string().min(1, "Tiêu đề bài học không được để trống"),
      slug: z.string().min(1),
      content: z.string().optional().nullable(),
      videoUrl: z.string().optional().nullable(),
      durationMinutes: z.coerce.number().default(10),
      isFreePreview: z.boolean().default(false),
      sortOrder: z.coerce.number().default(0),
    }),
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "EDITOR"],
    auditAction: "CREATE_COURSE_LESSON",
    auditEntityType: "LESSON",
  },
  async (input) => {
    const lesson = await db.lesson.create({
      data: input,
    });
    return lesson;
  }
);

// =============================================================================
// 4. STUDENT ENROLLMENT & PROGRESS ACTIONS
// =============================================================================

export const enrollCourseAction = createSafeAction(
  {
    schema: z.object({
      courseId: z.string().min(1, "ID khóa học không hợp lệ"),
    }),
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"],
    auditAction: "ENROLL_COURSE",
    auditEntityType: "ENROLLMENT",
  },
  async ({ courseId }, { user }) => {
    if (!user) {
      throw new Error("Vui lòng đăng nhập để ghi danh khóa học.");
    }

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      throw new Error("Khóa học không tồn tại.");
    }

    // Upsert enrollment
    const enrollment = await db.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
      update: {
        status: EnrollmentStatus.ACTIVE,
      },
      create: {
        userId: user.id,
        courseId,
        status: EnrollmentStatus.ACTIVE,
        progressPercent: 0,
      },
    });

    // Send In-App Notification
    await sendNotification({
      userId: user.id,
      title: `Ghi danh thành công: ${course.title}`,
      message: `Chào mừng bạn! Khóa học đã được mở, hãy bắt đầu bài học đầu tiên ngay.`,
      type: "SYSTEM",
      actionUrl: `/courses/${course.slug}`,
    });

    revalidatePath(`/courses/${course.slug}`);
    revalidatePath("/profile");
    return enrollment;
  }
);

export const toggleLessonProgressAction = createSafeAction(
  {
    schema: z.object({
      lessonId: z.string().min(1),
      isCompleted: z.boolean(),
    }),
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"],
    auditAction: "UPDATE_LESSON_PROGRESS",
    auditEntityType: "LESSON_PROGRESS",
  },
  async ({ lessonId, isCompleted }, { user }) => {
    if (!user) {
      throw new Error("Vui lòng đăng nhập để lưu tiến độ bài học.");
    }

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: {
          include: {
            course: {
              include: {
                chapters: {
                  include: {
                    lessons: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new Error("Bài học không tồn tại.");
    }

    const course = lesson.chapter.course;

    // 1. Update or create lesson progress
    const progress = await db.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
      update: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        userId: user.id,
        lessonId,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // 2. Calculate overall course progress
    const allCourseLessonIds: string[] = [];
    course.chapters.forEach((ch) => {
      ch.lessons.forEach((l) => allCourseLessonIds.push(l.id));
    });

    const completedCount = await db.lessonProgress.count({
      where: {
        userId: user.id,
        lessonId: { in: allCourseLessonIds },
        isCompleted: true,
      },
    });

    const totalLessons = allCourseLessonIds.length;
    const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
    const isFinished = progressPercent >= 100;

    // 3. Update Enrollment
    const enrollment = await db.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
      update: {
        progressPercent,
        status: isFinished ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE,
        completedAt: isFinished ? new Date() : null,
      },
      create: {
        userId: user.id,
        courseId: course.id,
        status: isFinished ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE,
        progressPercent,
        completedAt: isFinished ? new Date() : null,
      },
    });

    // 4. If finished 100%, issue certificate and notification!
    if (isFinished) {
      const existingCert = await db.certificate.findFirst({
        where: {
          userId: user.id,
          courseId: course.id,
        },
      });

      if (!existingCert) {
        const certCode = `EDU-${new Date().getFullYear()}-${course.slug.slice(0, 4).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
        await db.certificate.create({
          data: {
            certificateCode: certCode,
            userId: user.id,
            courseId: course.id,
            enrollmentId: enrollment.id,
            pdfUrl: `https://assets.educore.dev/certificates/${certCode}.pdf`,
          },
        });

        await sendNotification({
          userId: user.id,
          title: `🎓 Chúc mừng tốt nghiệp: ${course.title}`,
          message: `Bạn đã xuất sắc hoàn thành 100% chương trình học! Chứng chỉ tốt nghiệp mã #${certCode} đã được cấp.`,
          type: "INTERACTION",
          actionUrl: `/profile`,
        });
      }
    }

    revalidatePath(`/courses/${course.slug}`);
    revalidatePath(`/courses/${course.slug}/learn/${lessonId}`);
    revalidatePath("/profile");

    return {
      progress,
      progressPercent,
      isFinished,
    };
  }
);
