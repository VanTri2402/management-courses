import {
  PrismaClient,
  Role,
  UserStatus,
  MenuLocation,
  SettingGroup,
  NotificationType,
  FileType,
  CourseLevel,
  EnrollmentStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seed for EduCore Online Learning Platform...");

  // 1. SEED USERS & ROLES
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash("AdminPassword123!", salt);
  const userPasswordHash = await bcrypt.hash("UserPassword123!", salt);

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@educore.dev" },
    update: {},
    create: {
      email: "superadmin@educore.dev",
      passwordHash: adminPasswordHash,
      fullName: "GS. Alexander Vance (Academic Dean)",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  const instructorAdmin = await prisma.user.upsert({
    where: { email: "instructor@educore.dev" },
    update: {},
    create: {
      email: "instructor@educore.dev",
      passwordHash: adminPasswordHash,
      fullName: "TS. Hoàng Minh Trí (Senior Staff Architect)",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: "editor@educore.dev" },
    update: {},
    create: {
      email: "editor@educore.dev",
      passwordHash: userPasswordHash,
      fullName: "Lê Nhật Linh (Lead Curriculum Designer)",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      role: Role.EDITOR,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "student@educore.dev" },
    update: {},
    create: {
      email: "student@educore.dev",
      passwordHash: userPasswordHash,
      fullName: "Nguyễn Hải Đăng (Tech Fellow Explorer)",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      role: Role.USER,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  console.log("✅ Seeded Users: SuperAdmin, InstructorAdmin, Editor, DemoStudent");

  // 2. SEED SITE SETTINGS
  const settings = [
    {
      key: "site_name",
      value: "EduCore Academy",
      group: SettingGroup.GENERAL,
      description: "Thương hiệu nền tảng đào tạo công nghệ hàng đầu",
    },
    {
      key: "site_tagline",
      value: "Nền Tảng Học Trực Tuyến & Đào Tạo Kỹ Sư Công Nghệ Chuyên Nghiệp",
      group: SettingGroup.GENERAL,
      description: "Khẩu hiệu thương hiệu chính",
    },
    {
      key: "site_logo",
      value: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80",
      group: SettingGroup.HEADER_FOOTER,
      description: "URL logo chính trên Header",
    },
    {
      key: "site_favicon",
      value: "/favicon.ico",
      group: SettingGroup.GENERAL,
      description: "Icon hiển thị tab trình duyệt",
    },
    {
      key: "header_cta_text",
      value: "Khám Phá Khóa Học",
      group: SettingGroup.HEADER_FOOTER,
      description: "Nút Call-to-Action góc phải Header",
    },
    {
      key: "header_cta_url",
      value: "/courses",
      group: SettingGroup.HEADER_FOOTER,
      description: "Đường dẫn CTA góc phải Header",
    },
    {
      key: "footer_about",
      value: "EduCore là hệ sinh thái đào tạo công nghệ chất lượng cao, cung cấp lộ trình thực chiến từ cơ bản đến chuyên sâu về Next.js Enterprise, Generative AI, Cloud Native và UI/UX Awwwards.",
      group: SettingGroup.HEADER_FOOTER,
      description: "Đoạn văn giới thiệu thương hiệu ở chân trang",
    },
    {
      key: "footer_copyright",
      value: "© 2026 EduCore Global Academy. Toàn bộ bản quyền được bảo hộ.",
      group: SettingGroup.HEADER_FOOTER,
      description: "Dòng bản quyền chân trang",
    },
    {
      key: "social_links",
      value: [
        { platform: "github", label: "GitHub", url: "https://github.com" },
        { platform: "discord", label: "Discord Community", url: "https://discord.com" },
        { platform: "youtube", label: "YouTube Academy", url: "https://youtube.com" },
      ],
      group: SettingGroup.SOCIAL,
      description: "Danh sách liên kết mạng xã hội chính",
    },
    {
      key: "maintenance_mode",
      value: false,
      group: SettingGroup.SYSTEM,
      description: "Chế độ bảo trì hệ thống",
    },
    {
      key: "scrollytelling_config",
      value: {
        smoothScroll: true,
        lerp: 0.1,
        orientation: "vertical",
        enableParallax: true,
      },
      group: SettingGroup.THEME,
      description: "Cấu hình chuyển động cuộn quán tính",
    },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, group: s.group, description: s.description },
      create: s,
    });
  }
  console.log("✅ Seeded Site Settings for EduCore");

  // 3. SEED DYNAMIC NAVIGATION (HEADER & FOOTER)
  await prisma.navigationItem.deleteMany();

  // Header Main Menus
  await prisma.navigationItem.create({
    data: {
      title: "Trang chủ",
      slugOrUrl: "/",
      location: MenuLocation.HEADER_MAIN,
      sortOrder: 1,
      isActive: true,
    },
  });

  const navCourses = await prisma.navigationItem.create({
    data: {
      title: "Khóa học",
      slugOrUrl: "/courses",
      location: MenuLocation.HEADER_MAIN,
      sortOrder: 2,
      isActive: true,
      badgeText: "Hot",
    },
  });

  // Dropdown Children for "Khóa học"
  await prisma.navigationItem.createMany({
    data: [
      {
        title: "Lập trình Web Fullstack",
        slugOrUrl: "/courses?category=lap-trinh-web",
        parentId: navCourses.id,
        location: MenuLocation.HEADER_MAIN,
        sortOrder: 1,
        isActive: true,
        badgeText: "Next.js",
      },
      {
        title: "Trí tuệ Nhân tạo & LLMs",
        slugOrUrl: "/courses?category=tri-tue-nhan-tao",
        parentId: navCourses.id,
        location: MenuLocation.HEADER_MAIN,
        sortOrder: 2,
        isActive: true,
        badgeText: "AI",
      },
      {
        title: "Thiết kế UI/UX & Motion",
        slugOrUrl: "/courses?category=thiet-ke-ui-ux",
        parentId: navCourses.id,
        location: MenuLocation.HEADER_MAIN,
        sortOrder: 3,
        isActive: true,
      },
      {
        title: "Cloud & DevOps Chuyên Sâu",
        slugOrUrl: "/courses?category=cloud-devops",
        parentId: navCourses.id,
        location: MenuLocation.HEADER_MAIN,
        sortOrder: 4,
        isActive: true,
      },
    ],
  });

  await prisma.navigationItem.create({
    data: {
      title: "Lộ trình đào tạo",
      slugOrUrl: "/#roadmap",
      location: MenuLocation.HEADER_MAIN,
      sortOrder: 3,
      isActive: true,
      badgeText: "Pro",
    },
  });

  await prisma.navigationItem.create({
    data: {
      title: "Về EduCore",
      slugOrUrl: "/#about",
      location: MenuLocation.HEADER_MAIN,
      sortOrder: 4,
      isActive: true,
    },
  });

  // Header Utility
  await prisma.navigationItem.create({
    data: {
      title: "Tài liệu Kỹ thuật",
      slugOrUrl: "/courses",
      location: MenuLocation.HEADER_UTILITY,
      sortOrder: 1,
      isActive: true,
      badgeText: "Docs",
    },
  });

  // Footer Column 1: Chương Trình Đào Tạo
  await prisma.navigationItem.createMany({
    data: [
      {
        title: "Lập trình Web Fullstack",
        slugOrUrl: "/courses?category=lap-trinh-web",
        location: MenuLocation.FOOTER_COL_1,
        sortOrder: 1,
        isActive: true,
      },
      {
        title: "Generative AI & LLMs",
        slugOrUrl: "/courses?category=tri-tue-nhan-tao",
        location: MenuLocation.FOOTER_COL_1,
        sortOrder: 2,
        isActive: true,
      },
      {
        title: "UI/UX & Design Systems",
        slugOrUrl: "/courses?category=thiet-ke-ui-ux",
        location: MenuLocation.FOOTER_COL_1,
        sortOrder: 3,
        isActive: true,
      },
      {
        title: "Kubernetes & Cloud Native",
        slugOrUrl: "/courses?category=cloud-devops",
        location: MenuLocation.FOOTER_COL_1,
        sortOrder: 4,
        isActive: true,
      },
    ],
  });

  // Footer Column 2: Hệ Sinh Thái & Học Viên
  await prisma.navigationItem.createMany({
    data: [
      {
        title: "Chứng chỉ Chứng nhận EduCore",
        slugOrUrl: "/#about",
        location: MenuLocation.FOOTER_COL_2,
        sortOrder: 1,
        isActive: true,
      },
      {
        title: "Cộng đồng Kỹ sư Discord",
        slugOrUrl: "https://discord.com",
        location: MenuLocation.FOOTER_COL_2,
        sortOrder: 2,
        isExternal: true,
        isActive: true,
      },
      {
        title: "Lộ trình Nghề nghiệp Tech",
        slugOrUrl: "/#roadmap",
        location: MenuLocation.FOOTER_COL_2,
        sortOrder: 3,
        isActive: true,
      },
      {
        title: "Hỗ trợ Mentor 1-on-1",
        slugOrUrl: "/#about",
        location: MenuLocation.FOOTER_COL_2,
        sortOrder: 4,
        isActive: true,
      },
    ],
  });

  // Footer Column 3: Pháp Lý & Bảo Mật
  await prisma.navigationItem.createMany({
    data: [
      {
        title: "Chính sách Bảo mật",
        slugOrUrl: "/privacy",
        location: MenuLocation.FOOTER_COL_3,
        sortOrder: 1,
        isActive: true,
      },
      {
        title: "Điều khoản Đào tạo",
        slugOrUrl: "/terms",
        location: MenuLocation.FOOTER_COL_3,
        sortOrder: 2,
        isActive: true,
      },
      {
        title: "Nhật ký Kiểm toán (Admin)",
        slugOrUrl: "/admin/audit-logs",
        location: MenuLocation.FOOTER_COL_3,
        sortOrder: 3,
        isActive: true,
        requiredRole: Role.ADMIN,
      },
    ],
  });

  // Footer Bottom Links
  await prisma.navigationItem.createMany({
    data: [
      {
        title: "Bảo mật",
        slugOrUrl: "/security",
        location: MenuLocation.FOOTER_BOTTOM,
        sortOrder: 1,
        isActive: true,
      },
      {
        title: "Điều khoản",
        slugOrUrl: "/terms",
        location: MenuLocation.FOOTER_BOTTOM,
        sortOrder: 2,
        isActive: true,
      },
      {
        title: "Trạng thái máy chủ",
        slugOrUrl: "/status",
        location: MenuLocation.FOOTER_BOTTOM,
        sortOrder: 3,
        isActive: true,
      },
    ],
  });

  console.log("✅ Seeded Navigation Items for EduCore");

  // 4. SEED SAMPLE MEDIA ASSETS
  await prisma.mediaAsset.deleteMany();
  const sampleMedia = [
    {
      fileName: "course-nextjs-architecture.webp",
      fileUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
      fileType: FileType.IMAGE,
      mimeType: "image/webp",
      fileSize: 450200,
      altText: "Next.js Enterprise Architecture Course",
      uploadedById: superAdmin.id,
    },
    {
      fileName: "course-generative-ai.webp",
      fileUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80",
      fileType: FileType.IMAGE,
      mimeType: "image/webp",
      fileSize: 520100,
      altText: "Generative AI and LLMs Engineering",
      uploadedById: superAdmin.id,
    },
    {
      fileName: "course-uiux-awwwards.webp",
      fileUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80",
      fileType: FileType.IMAGE,
      mimeType: "image/webp",
      fileSize: 380400,
      altText: "Awwwards UI/UX & Motion Masterclass",
      uploadedById: instructorAdmin.id,
    },
    {
      fileName: "course-cloud-devops.webp",
      fileUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
      fileType: FileType.IMAGE,
      mimeType: "image/webp",
      fileSize: 490300,
      altText: "Cloud Native DevOps Kubernetes",
      uploadedById: instructorAdmin.id,
    },
  ];

  for (const m of sampleMedia) {
    await prisma.mediaAsset.create({ data: m });
  }
  console.log("✅ Seeded Sample Media Assets");

  // 5. SEED CATEGORIES & COURSES & CHAPTERS & LESSONS
  // Clean existing domain tables
  await prisma.certificate.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();

  // Create Categories
  const catWeb = await prisma.category.create({
    data: {
      name: "Lập trình Web Fullstack",
      slug: "lap-trinh-web",
      description: "Làm chủ kiến trúc Enterprise với Next.js 14, React 18, TypeScript, PostgreSQL và Tailwind CSS.",
      icon: "Code",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
      sortOrder: 1,
      isActive: true,
    },
  });

  const catAI = await prisma.category.create({
    data: {
      name: "Trí tuệ Nhân tạo & LLMs",
      slug: "tri-tue-nhan-tao",
      description: "Xây dựng AI Agents, RAG Pipelines, tích hợp Gemini API, OpenAI và triển khai Vector Database.",
      icon: "Cpu",
      thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop&q=80",
      sortOrder: 2,
      isActive: true,
    },
  });

  const catDesign = await prisma.category.create({
    data: {
      name: "Thiết kế UI/UX & Motion",
      slug: "thiet-ke-ui-ux",
      description: "Nghệ thuật Scrollytelling, Design Systems chuẩn chỉnh, Micro-interactions và phong cách Awwwards.",
      icon: "Palette",
      thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
      sortOrder: 3,
      isActive: true,
    },
  });

  const catDevOps = await prisma.category.create({
    data: {
      name: "Cloud & DevOps Chuyên Sâu",
      slug: "cloud-devops",
      description: "Triển khai hệ thống phân tán, Kubernetes, Docker, CI/CD tự động và giám sát bảo mật Production.",
      icon: "Cloud",
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
      sortOrder: 4,
      isActive: true,
    },
  });

  console.log("✅ Seeded 4 Course Categories");

  // Create Courses
  // Course 1: Next.js 14 Enterprise Architecture
  const courseNextjs = await prisma.course.create({
    data: {
      title: "Next.js 14 Enterprise Architecture: Quy Mô Hàng Triệu Người Dùng",
      slug: "nextjs-14-enterprise-architecture",
      subtitle: "Xây dựng hệ thống SaaS & Web Doanh nghiệp với Server Actions, RBAC đa tầng và Neon Serverless",
      description: "Khóa học chuyên sâu hướng dẫn từ A-Z cách xây dựng một kiến trúc Next.js App Router đạt chuẩn doanh nghiệp (Enterprise Grade). Bạn sẽ học cách thiết kế cấu trúc thư mục module hóa, bảo mật đa tầng với Edge Middleware và JWT HttpOnly, caching nâng cao với on-demand revalidation, và tích hợp cơ chế tương tác đa hình Polymorphic.",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
      trailerVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      level: CourseLevel.ADVANCED,
      price: 1890000,
      discountPrice: 1290000,
      durationMinutes: 1800,
      isPublished: true,
      isFeatured: true,
      instructorId: instructorAdmin.id,
      categoryId: catWeb.id,
    },
  });

  // Course 2: Generative AI & LLMs
  const courseAI = await prisma.course.create({
    data: {
      title: "Generative AI & LLM Application Engineering Thực Chiến",
      slug: "generative-ai-llm-application-engineering",
      subtitle: "Từ Prompt Engineering đến RAG Pipelines, Multi-Agent Orchestration và Production Deployment",
      description: "Nắm vững kỹ năng xây dựng ứng dụng AI tiên tiến nhất hiện nay. Khóa học bao gồm lý thuyết nền tảng về Transformer, cách gọi Gemini 1.5 Pro & Flash qua SDK, kỹ thuật Retrieval-Augmented Generation (RAG) với PgVector, và xây dựng Autonomous AI Coding Assistants.",
      thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80",
      trailerVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      level: CourseLevel.ADVANCED,
      price: 2490000,
      discountPrice: 1790000,
      durationMinutes: 2100,
      isPublished: true,
      isFeatured: true,
      instructorId: superAdmin.id,
      categoryId: catAI.id,
    },
  });

  // Course 3: Awwwards UI/UX & Micro-Interactions
  const courseUIUX = await prisma.course.create({
    data: {
      title: "Awwwards UI/UX & Micro-Interactions Masterclass",
      slug: "awwwards-uiux-micro-interactions-masterclass",
      subtitle: "Làm chủ Lenis Smooth Scroll, Framer Motion, Parallax và Scrollytelling Nghệ Thuật",
      description: "Biến những giao diện thô ráp thành tác phẩm nghệ thuật kỹ thuật số giành giải thưởng Awwwards. Hướng dẫn chi tiết cách kết hợp Lenis Smooth Scroll, Parallax Layer, Pin Scroll Sections và tối ưu 60FPS mượt mà trên mọi thiết bị.",
      thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80",
      trailerVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      level: CourseLevel.INTERMEDIATE,
      price: 1490000,
      discountPrice: 990000,
      durationMinutes: 1200,
      isPublished: true,
      isFeatured: true,
      instructorId: editor.id,
      categoryId: catDesign.id,
    },
  });

  // Course 4: Cloud Native DevOps
  const courseDevOps = await prisma.course.create({
    data: {
      title: "Cloud Native DevOps: Kubernetes, Docker & CI/CD Pipelines",
      slug: "cloud-native-devops-kubernetes-docker",
      subtitle: "Tự động hóa triển khai, Zero-downtime Deployment và giám sát hệ thống phân tán",
      description: "Trang bị đầy đủ hành trang cho kỹ sư DevOps và SRE: đóng gói container với Docker đa tầng, điều phối cụm Kubernetes trên AWS EKS, thiết lập GitHub Actions CI/CD tự động test và deploy, cùng hệ thống cảnh báo Prometheus & Grafana.",
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
      trailerVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      level: CourseLevel.ADVANCED,
      price: 2190000,
      discountPrice: 1590000,
      durationMinutes: 1600,
      isPublished: true,
      isFeatured: true,
      instructorId: instructorAdmin.id,
      categoryId: catDevOps.id,
    },
  });

  // Course 5: Fullstack TypeScript Zero to Pro
  const courseTS = await prisma.course.create({
    data: {
      title: "Fullstack TypeScript: Từ Khởi Đầu Đến Kỹ Sư Chuyên Nghiệp",
      slug: "fullstack-typescript-zero-to-pro",
      subtitle: "Học tư duy lập trình Type-Safe từ Client đến Database và API Endpoints",
      description: "Khóa học toàn diện dành cho lập trình viên muốn làm chủ TypeScript trong các dự án thực tế. Nắm vững generics, utility types, Zod schema validation, và cách tạo ra các ứng dụng không bao giờ lỗi runtime.",
      thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80",
      trailerVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      level: CourseLevel.BEGINNER,
      price: 990000,
      discountPrice: 690000,
      durationMinutes: 2400,
      isPublished: true,
      isFeatured: false,
      instructorId: instructorAdmin.id,
      categoryId: catWeb.id,
    },
  });

  console.log("✅ Seeded 5 Comprehensive Courses");

  // Create Chapters & Lessons for Course 1 (Next.js Enterprise)
  const ch1Nextjs = await prisma.chapter.create({
    data: {
      title: "Chương 1: Kiến Trúc Nền Tảng & Thiết Kế Module",
      slug: "chuong-1-kien-truc-nen-tang",
      description: "Phân chia ranh giới kiến trúc, thiết kế Schema Prisma và cấu hình môi trường bảo mật.",
      sortOrder: 1,
      courseId: courseNextjs.id,
    },
  });

  const lesson1Nextjs = await prisma.lesson.create({
    data: {
      title: "1.1 Giới thiệu Kiến trúc Enterprise Core & Tư duy Thiết kế",
      slug: "1-1-gioi-thieu-kien-truc-enterprise-core",
      content: `## Chào mừng bạn đến với khóa học Next.js 14 Enterprise Architecture

Trong bài học mở đầu này, chúng ta sẽ phân tích vì sao các dự án thực tế tại doanh nghiệp đòi hỏi sự tách biệt rõ ràng giữa **Core Framework** và **Business Modules**.

### Nội dung chính:
- Tư duy tách biệt phần lõi bất biến
- Multi-layer RBAC: Edge Middleware, Safe Action Wrapper, UI Gate
- Tối ưu hóa Database với Neon Serverless và Prisma Connection Pooling
- Chiến lược On-Demand Cache Revalidation

Hãy xem kỹ video bài giảng đính kèm và làm bài tập thực hành ở cuối chương.`,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      durationMinutes: 18,
      isFreePreview: true,
      sortOrder: 1,
      chapterId: ch1Nextjs.id,
    },
  });

  const lesson2Nextjs = await prisma.lesson.create({
    data: {
      title: "1.2 Xây dựng Bảo mật 3 Tầng: Edge JWT, Safe Action & RoleGate",
      slug: "1-2-xay-dung-bao-mat-3-tang",
      content: `### Chi tiết cài đặt Multi-layer RBAC
Trong bài này chúng ta đi sâu vào cài đặt:
1. \`jose\` JWT xác thực không phụ thuộc Node Runtime tại Edge Middleware.
2. \`createSafeAction\` tự động Validate Zod, Rate Limiting và Audit Logging.
3. Component \`<RoleGate>\` che giấu giao diện nhạy cảm ở client.`,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      durationMinutes: 25,
      isFreePreview: false,
      sortOrder: 2,
      chapterId: ch1Nextjs.id,
    },
  });

  const ch2Nextjs = await prisma.chapter.create({
    data: {
      title: "Chương 2: Dynamic Header/Footer CRUD & Caching Tối Ưu",
      slug: "chuong-2-dynamic-layout-caching",
      description: "Thực thi hệ thống Menu phân cấp động và kỹ thuật revalidateTag theo nhu cầu.",
      sortOrder: 2,
      courseId: courseNextjs.id,
    },
  });

  const lesson3Nextjs = await prisma.lesson.create({
    data: {
      title: "2.1 Thiết kế Data Tree và Caching với unstable_cache",
      slug: "2-1-thiet-ke-data-tree-caching",
      content: `### Kỹ thuật đóng băng truy vấn layout
Tìm hiểu cách sử dụng \`unstable_cache\` của Next.js với tag \`'layout-data'\` để giảm 99% tải cho database khi render Header và Footer.`,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      durationMinutes: 22,
      isFreePreview: true,
      sortOrder: 1,
      chapterId: ch2Nextjs.id,
    },
  });

  const lesson4Nextjs = await prisma.lesson.create({
    data: {
      title: "2.2 Tương tác Đa hình Polymorphic Bookmark & Comments",
      slug: "2-2-tuong-tac-da-hinh-polymorphic",
      content: `### Cơ chế Polymorphic Relations
Cách thiết kế một cặp bảng duy nhất \`Bookmark\` và \`Comment\` với \`entityType\` và \`entityId\` để phục vụ cho bất kỳ thực thể nào trong tương lai.`,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      durationMinutes: 30,
      isFreePreview: false,
      sortOrder: 2,
      chapterId: ch2Nextjs.id,
    },
  });

  // Chapters & Lessons for Course 2 (AI & LLMs)
  const ch1AI = await prisma.chapter.create({
    data: {
      title: "Chương 1: Nền Tảng Generative AI & Gemini API",
      slug: "chuong-1-nen-tang-genai-gemini",
      description: "Cơ chế hoạt động của các mô hình LLMs và cách sử dụng Gemini 1.5 SDK.",
      sortOrder: 1,
      courseId: courseAI.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "1.1 Tổng quan về Multi-modal AI & Kiến trúc Gemini",
      slug: "1-1-tong-quan-multimodal-gemini",
      content: `Tìm hiểu cơ chế tiếp nhận văn bản, hình ảnh, âm thanh và video trong cùng một cửa sổ ngữ cảnh lên tới 2 triệu tokens của Gemini 1.5 Pro.`,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      durationMinutes: 20,
      isFreePreview: true,
      sortOrder: 1,
      chapterId: ch1AI.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "1.2 Xây dựng RAG Pipeline với Vector Embeddings",
      slug: "1-2-xay-dung-rag-pipeline-embeddings",
      content: `Cách chia nhỏ tài liệu (chunking), tính toán vector embeddings và truy vấn tương đồng Cosine Similarity trên PostgreSQL PgVector.`,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      durationMinutes: 35,
      isFreePreview: false,
      sortOrder: 2,
      chapterId: ch1AI.id,
    },
  });

  // Chapters & Lessons for Course 3 (UI/UX)
  const ch1UI = await prisma.chapter.create({
    data: {
      title: "Chương 1: Lenis Smooth Scrolling & Parallax Depth",
      slug: "chuong-1-lenis-smooth-scrolling",
      description: "Cấu hình quán tính cuộn trang mượt mà và hiệu ứng thị sai điện ảnh.",
      sortOrder: 1,
      courseId: courseUIUX.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "1.1 Tích hợp Lenis vào Next.js App Router chuẩn 60FPS",
      slug: "1-1-tich-hop-lenis-nextjs-app-router",
      content: `Cách khởi tạo Lenis trong React Context, xử lý đồng bộ với requestAnimationFrame và tránh giật lag khi cuộn.`,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      durationMinutes: 16,
      isFreePreview: true,
      sortOrder: 1,
      chapterId: ch1UI.id,
    },
  });

  console.log("✅ Seeded Chapters and Lessons with Full Metadata");

  // 6. SEED ENROLLMENT & LESSON PROGRESS
  const enrollmentNextjs = await prisma.enrollment.create({
    data: {
      userId: demoUser.id,
      courseId: courseNextjs.id,
      status: EnrollmentStatus.ACTIVE,
      progressPercent: 50.0,
      enrolledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
  });

  // Mark lesson 1 completed
  await prisma.lessonProgress.create({
    data: {
      userId: demoUser.id,
      lessonId: lesson1Nextjs.id,
      isCompleted: true,
      lastPositionSeconds: 1080,
      completedAt: new Date(),
    },
  });

  // Lesson 2 in-progress
  await prisma.lessonProgress.create({
    data: {
      userId: demoUser.id,
      lessonId: lesson2Nextjs.id,
      isCompleted: false,
      lastPositionSeconds: 420,
    },
  });

  // Seed sample completed enrollment with Certificate
  const enrollmentUIUX = await prisma.enrollment.create({
    data: {
      userId: demoUser.id,
      courseId: courseUIUX.id,
      status: EnrollmentStatus.COMPLETED,
      progressPercent: 100.0,
      enrolledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      completedAt: new Date(),
    },
  });

  await prisma.certificate.create({
    data: {
      certificateCode: "EDU-2026-NXT-98214",
      userId: demoUser.id,
      courseId: courseUIUX.id,
      enrollmentId: enrollmentUIUX.id,
      issuedAt: new Date(),
      pdfUrl: "https://assets.educore.dev/certificates/EDU-2026-NXT-98214.pdf",
    },
  });

  console.log("✅ Seeded Sample Enrollment, Progress & Certificate");

  // 7. SEED NOTIFICATIONS
  await prisma.notification.deleteMany();
  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        title: "Chào mừng bạn đến với EduCore",
        message: "Bạn đã được kích hoạt khóa học 'Next.js 14 Enterprise Architecture'. Hãy bắt đầu bài học đầu tiên!",
        type: NotificationType.SYSTEM,
        actionUrl: `/courses/${courseNextjs.slug}`,
        isRead: false,
      },
      {
        userId: demoUser.id,
        title: "Chúc mừng! Bạn đã nhận chứng chỉ",
        message: "Chứng chỉ hoàn thành khóa học 'Awwwards UI/UX Masterclass' mã #EDU-2026-NXT-98214 đã được cấp.",
        type: NotificationType.INTERACTION,
        actionUrl: "/profile",
        isRead: false,
      },
      {
        userId: superAdmin.id,
        title: "Hệ thống EduCore đã sẵn sàng",
        message: "Cơ sở dữ liệu đào tạo trực tuyến với 5 khóa học và 4 danh mục chuyên nghiệp đã khởi tạo thành công.",
        type: NotificationType.SYSTEM,
        actionUrl: "/admin/courses",
        isRead: false,
      },
    ],
  });
  console.log("✅ Seeded Notifications");

  // 8. SEED SAMPLE BOOKMARKS & COMMENTS (POLYMORPHIC)
  await prisma.comment.deleteMany();
  await prisma.bookmark.deleteMany();

  // Bookmarks for courses
  await prisma.bookmark.createMany({
    data: [
      {
        userId: demoUser.id,
        entityType: "COURSE",
        entityId: courseNextjs.id,
        metadata: {
          title: courseNextjs.title,
          thumbnail: courseNextjs.thumbnail,
          slug: courseNextjs.slug,
          subtitle: "Enterprise Grade Next.js 14 Architecture",
        },
      },
      {
        userId: demoUser.id,
        entityType: "COURSE",
        entityId: courseAI.id,
        metadata: {
          title: courseAI.title,
          thumbnail: courseAI.thumbnail,
          slug: courseAI.slug,
          subtitle: "Generative AI & LLM Systems",
        },
      },
    ],
  });

  // Comments for Course 1
  const reviewNextjs = await prisma.comment.create({
    data: {
      userId: demoUser.id,
      entityType: "COURSE",
      entityId: courseNextjs.id,
      content: "Khóa học thực sự mở rộng tầm nhìn về kiến trúc Next.js! Các mô hình RBAC 3 tầng và Safe Action giúp code của team mình giảm thiểu hoàn toàn lỗi bảo mật.",
      rating: 5,
    },
  });

  await prisma.comment.create({
    data: {
      userId: instructorAdmin.id,
      entityType: "COURSE",
      entityId: courseNextjs.id,
      content: "Cảm ơn Đăng! Đó chính là triết lý mà đội ngũ kiến trúc sư tại EduCore muốn truyền tải: Code một lần, tái sử dụng và mở rộng vững chắc cho mọi dự án.",
      parentId: reviewNextjs.id,
    },
  });

  // Comments for Course 2 (AI)
  await prisma.comment.create({
    data: {
      userId: demoUser.id,
      entityType: "COURSE",
      entityId: courseAI.id,
      content: "Nội dung phần RAG Pipeline và multi-agent giải thích cực kỳ trực quan, dễ hiểu hơn hẳn các tài liệu đọc chay.",
      rating: 5,
    },
  });

  console.log("✅ Seeded Polymorphic Bookmarks and Comments for Courses");

  // 9. SEED AUDIT LOG
  await prisma.auditLog.create({
    data: {
      actorId: superAdmin.id,
      action: "INITIAL_EDUCORE_DATABASE_SEED",
      entityType: "SYSTEM",
      entityId: "seed-educore-v1",
      newValues: { status: "initialized", domain: "E-LEARNING", version: "1.0.0" },
      ipAddress: "127.0.0.1",
    },
  });
  console.log("✅ Seeded Initial Audit Log");

  console.log("🎉 EduCore Database Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
