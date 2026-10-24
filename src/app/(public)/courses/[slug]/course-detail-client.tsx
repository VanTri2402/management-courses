"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { enrollCourseAction } from "@/server/actions/course";
import { BookmarkButton } from "@/components/shared/BookmarkButton";
import { CommentSection, CommentItem } from "@/components/shared/CommentSection";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import {
  GraduationCap,
  Clock,
  Layers,
  Users,
  CheckCircle2,
  Play,
  PlayCircle,
  Lock,
  ChevronDown,
  Award,
  ShieldCheck,
  Sparkles,
  BookOpen,
  ArrowRight,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

interface CourseDetailClientProps {
  course: any;
  currentUser: any;
  initialComments: CommentItem[];
  initialIsBookmarked: boolean;
}

export function CourseDetailClient({
  course,
  currentUser,
  initialComments,
}: CourseDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Accordion state: open all chapters by default
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>(
    course.chapters.reduce(
      (acc: any, ch: any, idx: number) => ({ ...acc, [ch.id]: idx === 0 }),
      {}
    )
  );

  // Video preview modal
  const [previewLesson, setPreviewLesson] = useState<any | null>(null);

  const toggleChapter = (chapterId: string) => {
    setOpenChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const isEnrolled = Boolean(course.enrollment);
  const firstLesson =
    course.chapters?.[0]?.lessons?.[0] || null;

  const handleEnroll = () => {
    if (!currentUser) {
      router.push(`/login?redirect=/courses/${course.slug}`);
      return;
    }

    if (isEnrolled && firstLesson) {
      router.push(`/courses/${course.slug}/learn/${firstLesson.id}`);
      return;
    }

    startTransition(async () => {
      try {
        const res = await enrollCourseAction({ courseId: course.id });
        if (res.success) {
          toast.success("Ghi danh khóa học thành công! Chào mừng bạn.");
          if (firstLesson) {
            router.push(`/courses/${course.slug}/learn/${firstLesson.id}`);
          } else {
            router.refresh();
          }
        } else {
          toast.error(res.error || "Không thể ghi danh vào lúc này");
        }
      } catch (err: any) {
        toast.error(err.message || "Đã xảy ra lỗi");
      }
    });
  };

  return (
    <div className="min-h-screen pb-24">
      {/* --------------------------------------------------------------------- */}
      {/* Top Hero Banner Section                                               */}
      {/* --------------------------------------------------------------------- */}
      <div className="relative bg-gradient-to-b from-background via-card/80 to-background border-b border-border/60 pt-10 pb-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Course Intro */}
          <div className="lg:col-span-8 space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <Link href="/courses" className="hover:text-primary transition-colors">
                Khóa học
              </Link>
              <span>/</span>
              <span className="text-primary font-bold">{course.category?.name}</span>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {course.subtitle || course.description}
            </p>

            {/* Badges and Metrics */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="px-3 py-1 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                {course.level}
              </span>

              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{Math.round(course.totalMinutes / 60)} giờ học</span>
              </span>

              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>{course.totalLessons} bài học</span>
              </span>

              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>{course._count.enrollments} học viên đã tham gia</span>
              </span>
            </div>

            {/* Instructor Profile Row */}
            <div className="pt-4 flex items-center gap-3 border-t border-border/40">
              {course.instructor?.avatarUrl ? (
                <img
                  src={course.instructor.avatarUrl}
                  alt={course.instructor.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {course.instructor?.fullName.charAt(0)}
                </div>
              )}
              <div>
                <span className="text-[11px] text-muted-foreground">Giảng viên phụ trách</span>
                <div className="font-bold text-sm text-foreground">
                  {course.instructor?.fullName}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Desktop Enrollment Card */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-2xl p-6 shadow-2xl space-y-6">
              {/* Media Preview Box */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted group">
                <img
                  src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                {course.trailerVideoUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewLesson({
                        title: "Trailer giới thiệu khóa học",
                        videoUrl: course.trailerVideoUrl,
                      })
                    }
                    className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </div>
                  </button>
                )}
              </div>

              {/* Pricing */}
              <div>
                {course.discountPrice ? (
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-black text-primary">
                        {formatCurrency(course.discountPrice)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(course.price)}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">
                      Tiết kiệm {formatCurrency(course.price - course.discountPrice)}
                    </span>
                  </div>
                ) : (
                  <div className="text-3xl font-black text-primary">
                    {course.price === 0 ? "Miễn phí toàn khóa" : formatCurrency(course.price)}
                  </div>
                )}
              </div>

              {/* Enroll / Continue Button */}
              <div className="space-y-3">
                <Button
                  size="lg"
                  variant="gradient"
                  onClick={handleEnroll}
                  disabled={isPending}
                  className="w-full rounded-xl py-6 font-bold text-sm gap-2 shadow-lg shadow-primary/20"
                >
                  {isPending ? (
                    "Đang xử lý..."
                  ) : isEnrolled ? (
                    <>
                      <span>Vào Phòng Học Trực Tuyến</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-4 h-4" />
                      <span>Ghi Danh Khóa Học Ngay</span>
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-2">
                  <BookmarkButton
                    entityType="COURSE"
                    entityId={course.id}
                    metadata={{
                      title: course.title,
                      thumbnail: course.thumbnail || undefined,
                      slug: course.slug,
                      subtitle: course.subtitle || undefined,
                    }}
                    showText
                    className="w-full justify-center py-2"
                  />
                </div>
              </div>

              {/* Guarantee bullets */}
              <div className="pt-4 border-t border-border/40 space-y-2.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Truy cập trọn đời không giới hạn thời gian</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Cấp chứng chỉ tốt nghiệp định danh số</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Hỗ trợ code review và mentor 1-on-1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* Main Body Section: Curriculum & Details                               */}
      {/* --------------------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          {/* Detailed Description */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Giới thiệu tổng quan</h2>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line bg-card/40 p-6 rounded-2xl border border-border/60">
              {course.description}
            </div>
          </section>

          {/* Curriculum Accordion */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Giáo trình đào tạo</h2>
                <span className="text-xs text-muted-foreground">
                  {course.chapters?.length || 0} chương • {course.totalLessons} bài giảng • {Math.round(course.totalMinutes / 60)} giờ tổng thời lượng
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {course.chapters?.map((chapter: any, cIdx: number) => {
                const isOpen = openChapters[chapter.id];
                return (
                  <div
                    key={chapter.id}
                    className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden transition-all"
                  >
                    {/* Chapter Header */}
                    <button
                      type="button"
                      onClick={() => toggleChapter(chapter.id)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                          {cIdx + 1}
                        </span>
                        <div>
                          <h3 className="font-bold text-sm md:text-base text-foreground">
                            {chapter.title}
                          </h3>
                          {chapter.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {chapter.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{chapter.lessons?.length || 0} bài</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* Lessons List */}
                    {isOpen && (
                      <div className="divide-y divide-border/40 border-t border-border/40 bg-background/50">
                        {chapter.lessons?.map((lesson: any) => (
                          <div
                            key={lesson.id}
                            className="p-4 flex items-center justify-between text-xs hover:bg-muted/20 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.isFreePreview ? (
                                <PlayCircle className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Lock className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span className="font-medium text-foreground">{lesson.title}</span>
                              {lesson.isFreePreview && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Học thử miễn phí
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground font-mono text-[11px]">
                                {lesson.durationMinutes} phút
                              </span>
                              {lesson.isFreePreview && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setPreviewLesson(lesson)}
                                  className="h-7 text-xs font-semibold gap-1 text-emerald-400 hover:text-emerald-300"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>Xem trước</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Interactive Comments & Reviews */}
          <section className="pt-8 border-t border-border/60">
            <div className="mb-6">
              <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
                Cộng đồng & Đánh giá
              </span>
              <h2 className="text-2xl font-bold text-foreground mt-1">
                Thảo luận & Phản hồi học viên
              </h2>
            </div>
            <CommentSection
              entityType="COURSE"
              entityId={course.id}
              initialComments={initialComments}
              currentUser={currentUser}
            />
          </section>
        </div>
      </div>

      {/* Free Preview Video Modal */}
      {previewLesson && (
        <Dialog open={Boolean(previewLesson)} onOpenChange={() => setPreviewLesson(null)}>
          <div className="p-6 space-y-4 max-w-3xl w-full">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-emerald-400" />
                <span>{previewLesson.title}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-border">
              <video
                src={previewLesson.videoUrl || course.trailerVideoUrl}
                controls
                autoPlay
                className="w-full h-full"
              />
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
