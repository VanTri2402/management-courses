import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEntityComments, isEntityBookmarked } from "@/server/queries/interactions";
import {
  ParallaxLayer,
  ScrollRevealText,
  ScrollPinSection,
  HorizontalScrollCarousel,
} from "@/components/scrollytelling";
import { CommentSection, CommentItem } from "@/components/shared/CommentSection";
import { HomeCoursesSection } from "@/components/home/HomeCoursesSection";
import { RoadmapTriggerButton } from "@/components/roadmap/RoadmapTriggerButton";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Users,
  Award,
  Layers,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Code2,
  Terminal,
  Cpu,
  Compass,
  HelpCircle,
  Star,
  Quote,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const currentUser = await getCurrentUser();

  // Fetch live courses & categories from database
  const [courses, categories] = await Promise.all([
    db.course.findMany({
      where: { isPublished: true },
      take: 9,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        category: true,
        instructor: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        _count: {
          select: { enrollments: true, chapters: true },
        },
      },
    }),
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    }),
  ]);

  const featuredCourse = courses[0];

  // Load comments for featured review showcase
  let showcaseCommentsRaw: any[] = [];
  if (featuredCourse) {
    showcaseCommentsRaw = await getEntityComments("COURSE", featuredCourse.id);
  }

  const showcaseComments: CommentItem[] = showcaseCommentsRaw.map((c) => ({
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

  // Act 2: Narrative Pillars
  const narrativeSteps = [
    {
      id: "step-1",
      tag: "Trụ Cột 01: Kiến Trúc Thực Chiến",
      title: "Lộ Trình Chuẩn Doanh Nghiệp (Enterprise-Grade)",
      subtitle: "Học trên dự án thật quy mô lớn, từ kiến trúc sạch đến tối ưu Production",
      description:
        "Tạm biệt các bài hướng dẫn Todo-app đơn điệu. Mọi khóa học tại EduCore đều được thiết kế xung quanh hệ thống Enterprise hoàn chỉnh: Multi-layer RBAC, Edge JWT, Cache Revalidation, Neon Serverless và CI/CD Pipelines sẵn sàng phục vụ hàng triệu người dùng.",
      imageUrl:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
      actionText: "Khám phá các khóa học",
      actionUrl: "/courses",
    },
    {
      id: "step-2",
      tag: "Trụ Cột 02: Đồng Hành Chuyên Gia",
      title: "Tech Lead & AI Engineer Mentor 1-on-1",
      subtitle: "Đồng hành trực tiếp cùng đội ngũ kiến trúc sư từ các tập đoàn công nghệ",
      description:
        "Học viên được hỗ trợ code review tỉ mỉ, giải đáp thắc mắc chuyên sâu và tham gia các buổi Tech Talk nội bộ hàng tuần. Từng dòng code của bạn đều được rèn giũa để đáp ứng chuẩn mực cao nhất của ngành công nghiệp phần mềm.",
      imageUrl:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80",
      actionText: "Tìm hiểu lộ trình đào tạo",
      actionUrl: "#roadmap",
    },
    {
      id: "step-3",
      tag: "Trụ Cột 03: Chứng Nhận Quốc Tế",
      title: "Chứng Chỉ Số Độc Nhất & Kết Nối Tuyển Dụng",
      subtitle: "Xác thực năng lực minh bạch, kết nối trực tiếp với mạng lưới đối tác",
      description:
        "Mỗi học viên hoàn thành 100% chương trình sẽ được cấp Chứng chỉ tốt nghiệp định danh duy nhất (Unique Certificate Code) có thể xác thực trực tiếp trên hệ thống. Mở rộng cơ hội việc làm tại các tập đoàn công nghệ và công ty toàn cầu.",
      imageUrl:
        "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&auto=format&fit=crop&q=80",
      actionText: "Xem chính sách chứng chỉ",
      actionUrl: "/courses",
    },
  ];

  // Act 3: Flagship Tracks
  const galleryItems = [
    {
      id: "track-1",
      category: "Fullstack Architecture",
      title: "Next.js 14 Enterprise Architecture",
      description:
        "Xây dựng hệ thống SaaS quy mô triệu users với Server Actions, RBAC đa tầng và Neon Serverless.",
      imageUrl:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
      badge: "Flagship 2026",
      href: "/courses/nextjs-14-enterprise-architecture",
    },
    {
      id: "track-2",
      category: "AI & Machine Learning",
      title: "Generative AI & LLM Systems",
      description:
        "Từ Prompt Engineering đến RAG Pipelines, Multi-Agent Orchestration và triển khai Gemini 1.5 Pro.",
      imageUrl:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80",
      badge: "Xu hướng AI",
      href: "/courses/generative-ai-llm-application-engineering",
    },
    {
      id: "track-3",
      category: "Design & Interactions",
      title: "Awwwards UI/UX & Motion Masterclass",
      description:
        "Làm chủ Lenis Smooth Scroll, Parallax Layer và kỹ thuật Scrollytelling đạt chuẩn 60FPS.",
      imageUrl:
        "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80",
      badge: "Awwwards Standard",
      href: "/courses/awwwards-uiux-micro-interactions-masterclass",
    },
    {
      id: "track-4",
      category: "Platform & Cloud",
      title: "Cloud Native DevOps & Kubernetes",
      description:
        "Container hóa với Docker đa tầng, điều phối cụm Kubernetes AWS EKS và CI/CD tự động hóa.",
      imageUrl:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
      badge: "Chuyên sâu SRE",
      href: "/courses/cloud-native-devops-kubernetes-docker",
    },
    {
      id: "track-5",
      category: "Core Engineering",
      title: "Fullstack TypeScript: Zero to Pro",
      description:
        "Học tư duy lập trình Type-Safe từ Client đến Database, Zod schema validation và API endpoints.",
      imageUrl:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      badge: "Nền tảng vững chắc",
      href: "/courses/fullstack-typescript-zero-to-pro",
    },
  ];

  // Features Highlight
  const features = [
    {
      icon: Terminal,
      title: "Kiến Trúc Chuẩn Enterprise",
      desc: "Phân tách rõ ràng giữa Core Framework và Business Modules, sẵn sàng scale hàng triệu request mà không tắc nghẽn.",
    },
    {
      icon: Cpu,
      title: "Tích Hợp Generative AI & Gemini",
      desc: "Trang bị chatbot trợ lý AI thông minh, hỗ trợ giải đáp lộ trình và nội dung học tập theo thời gian thực.",
    },
    {
      icon: ShieldCheck,
      title: "Bảo Mật 3 Tầng RBAC",
      desc: "Phân quyền chặt chẽ với Edge Middleware, Safe Action Wrapper tự động ghi AuditLog và UI Gatekeeper.",
    },
    {
      icon: Zap,
      title: "Hiệu Năng Cực Hạn & Cache",
      desc: "Tận dụng unstable_cache với On-Demand Tag Revalidation và Neon Serverless Postgres với connection pooling.",
    },
  ];

  // FAQs List
  const faqs = [
    {
      q: "Khóa học tại EduCore có dành cho người mới bắt đầu không?",
      a: "Có! EduCore cung cấp đa dạng lộ trình từ cấp độ Cơ bản (Beginner) như Fullstack TypeScript, cho đến các khóa Nâng cao (Advanced) như Next.js 14 Enterprise Architecture và Generative AI Systems.",
    },
    {
      q: "Chứng chỉ tốt nghiệp EduCore có giá trị như thế nào?",
      a: "Mỗi chứng chỉ đều có mã định danh duy nhất (Unique Certificate Code) có thể xác thực trực tiếp trên hệ thống EduCore, giúp học viên đính kèm vào CV và hồ sơ LinkedIn chuyên nghiệp.",
    },
    {
      q: "Tôi có được hỗ trợ khi gặp khó khăn trong quá trình làm bài tập không?",
      a: "Chắc chắn! Bạn có thể đặt câu hỏi ngay dưới từng bài giảng thông qua hệ thống thảo luận, hoặc chat trực tiếp với Trợ lý AI EduCore để được hướng dẫn giải bài 24/7.",
    },
    {
      q: "Hình thức thanh toán và kích hoạt khóa học ra sao?",
      a: "Sau khi bấm 'Ghi danh khóa học', hệ thống sẽ kích hoạt ngay lập tức vào tài khoản cá nhân của bạn để bắt đầu học mà không phải chờ đợi.",
    },
  ];

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* ----------------------------------------------------------------------- */}
      {/* ACT 1: PINNED HERO VIEWPORT                                             */}
      {/* ----------------------------------------------------------------------- */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6 pt-16 pb-24">
        {/* Ambient Glowing Tech Orbs */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-cyan-600/15 via-indigo-600/20 to-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          {/* Floating Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-card/80 border border-border/80 backdrop-blur-md text-foreground shadow-lg shadow-black/20 animate-pulse-slow">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
            <span className="font-bold">EduCore Global Tech Academy</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-primary font-mono font-bold">Chuẩn Doanh Nghiệp 2026</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground leading-[1.08]">
            Kiến Tạo Tương Lai{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400">
              Kỹ Sư Công Nghệ
            </span>
          </h1>

          {/* Subtitle with High-contrast text */}
          <div className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-muted-foreground font-normal leading-relaxed pt-2">
            <ScrollRevealText
              text="Nền tảng đào tạo kỹ sư công nghệ và kiến trúc sư hệ thống tiêu chuẩn quốc tế. Làm chủ Next.js Enterprise Architecture, Generative AI, Cloud Native DevOps và thiết kế Micro-interactions chuẩn Awwwards qua lộ trình thực chiến 100%."
              highlightWords={["Next.js", "Generative AI", "Cloud Native", "Awwwards", "thực chiến"]}
            />
          </div>

          {/* Action Button Row */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/courses">
              <Button size="lg" variant="gradient" className="rounded-full px-8 py-6 text-sm font-bold gap-2 shadow-xl shadow-primary/25 group">
                <GraduationCap className="w-5 h-5" />
                <span>Khám Phá Các Khóa Học</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href="#roadmap">
              <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-sm font-bold gap-2 backdrop-blur-md border-border/80 hover:border-primary/50">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Xem Lộ Trình Đào Tạo</span>
              </Button>
            </Link>
          </div>

          {/* Metrics Highlight Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-border/60 text-left">
            <div className="p-4 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-black text-cyan-400">15,000+</div>
              <div className="text-xs text-muted-foreground font-semibold mt-1">Học viên theo học</div>
            </div>
            <div className="p-4 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-black text-indigo-400">98%</div>
              <div className="text-xs text-muted-foreground font-semibold mt-1">Tốt nghiệp có việc làm</div>
            </div>
            <div className="p-4 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-black text-emerald-400">100%</div>
              <div className="text-xs text-muted-foreground font-semibold mt-1">Dự án thực tế Production</div>
            </div>
            <div className="p-4 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-black text-amber-400">4.9 / 5</div>
              <div className="text-xs text-muted-foreground font-semibold mt-1">Đánh giá hài lòng</div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------------- */}
      {/* ACT 2: STICKY NARRATIVE SHOWCASE (<ScrollPinSection />)                */}
      {/* ----------------------------------------------------------------------- */}
      <div id="roadmap">
        <ScrollPinSection steps={narrativeSteps} />
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* ACT 3: HORIZONTAL DISCOVERY GALLERY (<HorizontalScrollCarousel />)      */}
      {/* ----------------------------------------------------------------------- */}
      <div id="showcase">
        <HorizontalScrollCarousel
          items={galleryItems}
          title="Lộ Trình Đào Tạo Mũi Nhọn"
          subtitle="Những chuyên ngành công nghệ được săn đón nhất bởi các kỳ lân công nghệ thế giới."
        />
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* WHY EDUCORE SECTION: CORE ADVANTAGES                                    */}
      {/* ----------------------------------------------------------------------- */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full space-y-12 border-b border-border/60">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ưu Thế Vượt Trội</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
            Tại Sao Chọn EduCore Academy?
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Chúng tôi định nghĩa lại tiêu chuẩn đào tạo công nghệ bằng kiến trúc hiện đại, công nghệ thực chiến và sự đồng hành của trí tuệ nhân tạo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-sm space-y-4 hover:border-primary/50 transition-all hover:shadow-xl group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ----------------------------------------------------------------------- */}
      {/* LEVEL 2 BREAKTHROUGH: INTERACTIVE CAREER ROADMAP BANNER                 */}
      {/* ----------------------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        <RoadmapTriggerButton variant="banner" className="w-full my-6" />
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* ACT 4: INTERACTIVE LIVE FILTER GRID (Database Powered Courses)          */}
      {/* ----------------------------------------------------------------------- */}
      <section id="courses" className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Dữ Liệu Khóa Học Thời Gian Thực</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
            Khóa Học Nổi Bật Được Yêu Thích
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Chọn lĩnh vực công nghệ bên dưới để lọc trực tiếp các khóa học tương ứng. Lưu vào mục yêu thích hoặc ghi danh học ngay hôm nay.
          </p>
        </div>

        {/* Live Filterable Grid Component */}
        <HomeCoursesSection
          initialCourses={courses}
          categories={categories}
        />

        {/* View All Button */}
        <div className="text-center pt-4">
          <Link href="/courses">
            <Button size="lg" variant="gradient" className="rounded-full px-8 py-6 font-bold text-sm gap-2 shadow-lg shadow-primary/20">
              <span>Xem Tất Cả {courses.length}+ Khóa Học Trong Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Live Interactive Comment & Review Section */}
        {featuredCourse && (
          <div className="pt-16 border-t border-border/60">
            <div className="mb-8">
              <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
                Đánh giá sinh viên
              </span>
              <h3 className="text-xl md:text-3xl font-black text-foreground mt-1">
                Phản Hồi & Thảo Luận: {featuredCourse.title}
              </h3>
            </div>
            <CommentSection
              entityType="COURSE"
              entityId={featuredCourse.id}
              initialComments={showcaseComments}
              currentUser={currentUser}
            />
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------------------- */}
      {/* FAQS SECTION: INTERACTIVE ACCORDION                                     */}
      {/* ----------------------------------------------------------------------- */}
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto w-full space-y-12 border-t border-border/60">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Câu Hỏi Thường Gặp</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-foreground">
            Giải Đáp Thắc Mắc Về EduCore
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-sm space-y-3"
            >
              <h3 className="font-bold text-base text-foreground flex items-start gap-2">
                <span className="text-primary font-mono">Q:</span>
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------------------- */}
      {/* ACT 5: CLIMAX CTA & SEAMLESS REVEAL                                     */}
      {/* ----------------------------------------------------------------------- */}
      <section id="about" className="relative py-28 px-6 md:px-12 bg-gradient-to-b from-background via-indigo-950/20 to-background border-t border-border/60 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-xl shadow-primary/10">
            <GraduationCap className="w-8 h-8" />
          </div>

          <h2 className="text-3xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
            Sẵn Sàng Nâng Tầm Sự Nghiệp{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400">
              Công Nghệ Cùng EduCore
            </span>
          </h2>

          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Gia nhập cộng đồng hơn 15,000 kỹ sư phần mềm, kiến trúc sư hệ thống và nhà thiết kế. Đăng ký học ngay để mở khóa toàn bộ kho tàng kiến thức thực chiến chuẩn doanh nghiệp.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/courses">
              <Button size="lg" variant="gradient" className="rounded-full px-8 py-6 font-bold text-sm gap-2 shadow-xl shadow-primary/25">
                <span>Bắt Đầu Học Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/register">
              <Button size="lg" variant="outline" className="rounded-full px-8 py-6 font-bold text-sm border-border/80 hover:border-primary/50">
                <span>Tạo Tài Khoản Học Viên</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
