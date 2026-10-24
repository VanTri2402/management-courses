import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { Role, CourseLevel, EnrollmentStatus, NotificationType } from "@prisma/client";

async function runWorkflowDemo() {
  console.log("🚀 Bắt đầu tạo dữ liệu kịch bản thực tế Workflow Database EduCore...");

  const passwordHash = await bcrypt.hash("Password@123", 10);

  // 1. TẠO VAI TRÒ MANAGER (Giảng viên / Course Creator)
  const manager = await db.user.upsert({
    where: { email: "mentor.haianh@educore.dev" },
    update: {},
    create: {
      email: "mentor.haianh@educore.dev",
      passwordHash,
      fullName: "TS. Lê Hải Anh (Principal Systems Architect)",
      role: Role.MANAGER,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    },
  });
  console.log("✔ [1/6] Tạo Giảng viên Manager:", manager.id, manager.fullName);

  // 2. TẠO DANH MỤC & KHÓA HỌC CHUYÊN SÂU
  const category = await db.category.findFirst({
    where: { slug: "lap-trinh-web" },
  });

  if (!category) {
    throw new Error("Category lap-trinh-web not found");
  }

  const course = await db.course.upsert({
    where: { slug: "microservices-distributed-systems-golang-grpc" },
    update: {},
    create: {
      title: "Microservices & Distributed Systems: Kiến Trúc Bền Vững Với Golang & gRPC",
      slug: "microservices-distributed-systems-golang-grpc",
      subtitle: "Xây dựng hệ thống phân tán chịu tải cao với gRPC, Apache Kafka, Saga Pattern và Redis Cache",
      description: "Khóa học cao cấp dành cho kỹ sư Backend muốn nâng tầm tư duy kiến trúc hệ thống. Học viên sẽ được thực chiến tự tay thiết kế hệ thống thanh toán và đơn hàng với kiến trúc Event-Driven, giải quyết bài toán Distributed Transaction (Saga Pattern), tối ưu hóa luồng gọi RPC với gRPC và triển khai Service Mesh.",
      thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
      trailerVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      level: CourseLevel.ADVANCED,
      price: 2490000,
      discountPrice: 1790000,
      durationMinutes: 2400,
      isPublished: true,
      isFeatured: true,
      instructorId: manager.id,
      categoryId: category.id,
    },
  });
  console.log("✔ [2/6] Tạo Khóa học:", course.id, course.title);

  // Tạo Chapters & Lessons (xóa cũ nếu đã tồn tại để tránh trùng lặp)
  await db.chapter.deleteMany({
    where: { courseId: course.id },
  });

  const chapter1 = await db.chapter.create({
    data: {
      title: "Chương 1: Thiết Kế Giao Thức gRPC & Protocol Buffers Đạt Chuẩn Production",
      slug: "chuong-1-grpc-protobuf",
      sortOrder: 1,
      courseId: course.id,
      lessons: {
        create: [
          {
            title: "1.1 Tổng quan về RPC vs REST: Khi nào nên chọn gRPC?",
            slug: "1-1-tong-quan-rpc-vs-rest",
            sortOrder: 1,
            durationMinutes: 25,
            isFreePreview: true,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            content: "Nội dung so sánh sâu về hiệu năng Binary Serialization (Protobuf) với JSON payload...",
          },
          {
            title: "1.2 Định nghĩa Protobuf Schema và Khởi tạo Golang Code Generator",
            slug: "1-2-dinh-nghia-protobuf-schema",
            sortOrder: 2,
            durationMinutes: 35,
            isFreePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            content: "Hướng dẫn cài đặt protoc, protoc-gen-go và viết file payment.proto...",
          },
        ],
      },
    },
    include: { lessons: true },
  });

  const chapter2 = await db.chapter.create({
    data: {
      title: "Chương 2: Distributed Transactions & Saga Pattern Với Apache Kafka",
      slug: "chuong-2-saga-pattern-kafka",
      sortOrder: 2,
      courseId: course.id,
      lessons: {
        create: [
          {
            title: "2.1 Vấn đề Two-Phase Commit (2PC) và Vì sao cần Event-Driven Architecture?",
            slug: "2-1-van-de-2pc-event-driven",
            sortOrder: 1,
            durationMinutes: 40,
            isFreePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            content: "Phân tích nhược điểm blocking của 2PC trong môi trường Microservices...",
          },
          {
            title: "2.2 Triển khai Choreography Saga Pattern thực tế cho Payment Service",
            slug: "2-2-trien-khai-choreography-saga",
            sortOrder: 2,
            durationMinutes: 50,
            isFreePreview: false,
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
            content: "Viết compensating transactions khi thanh toán thất bại để hoàn trả tồn kho...",
          },
        ],
      },
    },
    include: { lessons: true },
  });
  console.log("✔ [3/6] Tạo 2 Chương & 4 Bài học chi tiết cho khóa học");

  // 3. TẠO HỌC VIÊN THỰC TẾ
  const student = await db.user.upsert({
    where: { email: "nguyen.van.an@gmail.com" },
    update: {},
    create: {
      email: "nguyen.van.an@gmail.com",
      passwordHash,
      fullName: "Nguyễn Văn An",
      role: Role.USER,
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
    },
  });
  console.log("✔ [4/6] Tạo Học viên User:", student.id, student.fullName);

  // Học viên Bookmark khóa học
  await db.bookmark.upsert({
    where: {
      userId_entityType_entityId: {
        userId: student.id,
        entityType: "COURSE",
        entityId: course.id,
      },
    },
    update: {},
    create: {
      userId: student.id,
      entityType: "COURSE",
      entityId: course.id,
      metadata: {
        title: course.title,
        slug: course.slug,
        thumbnail: course.thumbnail,
      },
    },
  });

  // Học viên Bình luận vào bài học 1.1
  const lesson1 = chapter1.lessons[0];
  await db.comment.create({
    data: {
      userId: student.id,
      entityType: "LESSON",
      entityId: lesson1.id,
      content: "Bài học mở đầu rất hay! Thầy giải thích cơ chế binary stream của HTTP/2 vs HTTP/1.1 cực kỳ sáng tỏ.",
      rating: 5,
    },
  });

  // 4. HỌC VIÊN GHI DANH (ENROLLMENT) & HOÀN THÀNH 100% TIẾN ĐỘ (WORKFLOW CHÍNH)
  const allCreatedLessons = [...chapter1.lessons, ...chapter2.lessons];

  // Xóa enrollment cũ nếu có để tạo mới tinh
  await db.certificate.deleteMany({ where: { userId: student.id, courseId: course.id } });
  await db.lessonProgress.deleteMany({ where: { userId: student.id, lessonId: { in: allCreatedLessons.map(l => l.id) } } });
  await db.enrollment.deleteMany({ where: { userId: student.id, courseId: course.id } });

  const enrollment = await db.enrollment.create({
    data: {
      userId: student.id,
      courseId: course.id,
      status: EnrollmentStatus.COMPLETED,
      progressPercent: 100,
    },
  });

  // Tạo các bản ghi tiến độ từng bài học
  for (const les of allCreatedLessons) {
    await db.lessonProgress.create({
      data: {
        userId: student.id,
        lessonId: les.id,
        isCompleted: true,
      },
    });
  }
  console.log("✔ [5/6] Tạo Enrollment hoàn thành 100% (4/4 bài học hoàn tất)");

  // 5. TỰ ĐỘNG CẤP CHỨNG CHỈ SỐ & BẮN THÔNG BÁO
  const certificateCode = `EDU-2026-DIST-${Math.floor(1000 + Math.random() * 9000)}`;
  const certificate = await db.certificate.create({
    data: {
      userId: student.id,
      courseId: course.id,
      enrollmentId: enrollment.id,
      certificateCode,
      pdfUrl: `/certificates/verify/${certificateCode}.pdf`,
      issuedAt: new Date(),
    },
  });

  await db.notification.create({
    data: {
      userId: student.id,
      title: "🎓 Chúc mừng tốt nghiệp khóa học!",
      message: `Bạn đã xuất sắc hoàn thành 100% khóa học "${course.title}". Chứng chỉ số định danh "${certificateCode}" đã được cấp vào hồ sơ của bạn.`,
      type: NotificationType.SYSTEM,
      actionUrl: "/profile",
    },
  });

  // 6. GHI NHẬT KÝ KIỂM TOÁN (AUDIT LOGS)
  await db.auditLog.createMany({
    data: [
      {
        actorId: manager.id,
        action: "CREATE_COURSE",
        entityType: "COURSE",
        entityId: course.id,
        ipAddress: "118.70.182.44",
        newValues: { title: course.title, price: course.price, instructor: manager.fullName },
      },
      {
        actorId: student.id,
        action: "ENROLL_COURSE",
        entityType: "ENROLLMENT",
        entityId: enrollment.id,
        ipAddress: "14.232.208.15",
        newValues: { courseId: course.id, courseTitle: course.title, status: "ACTIVE" },
      },
      {
        actorId: null, // System automated action
        action: "ISSUE_CERTIFICATE",
        entityType: "CERTIFICATE",
        entityId: certificate.id,
        ipAddress: "SYSTEM_WORKER_CRON",
        newValues: { certificateCode, recipient: student.fullName, course: course.title },
      },
    ],
  });
  console.log("✔ [6/6] Cấp Chứng chỉ số, Bắn thông báo và Ghi nhật ký Audit Log thành công!");

  // LẤY DỮ LIỆU ĐẦY ĐỦ VỪA TẠO ĐỂ TRẢ VỀ BÁO CÁO CHI TIẾT
  const fullOverview = {
    manager: {
      id: manager.id,
      email: manager.email,
      fullName: manager.fullName,
      role: manager.role,
    },
    course: {
      id: course.id,
      title: course.title,
      slug: course.slug,
      price: course.price,
      discountPrice: course.discountPrice,
      level: course.level,
      instructorId: course.instructorId,
      categoryId: course.categoryId,
    },
    chapters: [
      {
        id: chapter1.id,
        title: chapter1.title,
        lessonsCount: chapter1.lessons.length,
        lessons: chapter1.lessons.map(l => ({ id: l.id, title: l.title, isFreePreview: l.isFreePreview })),
      },
      {
        id: chapter2.id,
        title: chapter2.title,
        lessonsCount: chapter2.lessons.length,
        lessons: chapter2.lessons.map(l => ({ id: l.id, title: l.title, isFreePreview: l.isFreePreview })),
      },
    ],
    student: {
      id: student.id,
      email: student.email,
      fullName: student.fullName,
      role: student.role,
    },
    enrollment: {
      id: enrollment.id,
      status: enrollment.status,
      progressPercent: enrollment.progressPercent,
      enrolledAt: enrollment.enrolledAt,
    },
    certificate: {
      id: certificate.id,
      certificateCode: certificate.certificateCode,
      pdfUrl: certificate.pdfUrl,
      issuedAt: certificate.issuedAt,
    },
  };

  console.log("\n=== FULL WORKFLOW DATA SNAPSHOT ===");
  console.log(JSON.stringify(fullOverview, null, 2));
}

runWorkflowDemo()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error running workflow demo:", err);
    process.exit(1);
  });
