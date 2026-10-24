"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createCourseAction,
  updateCourseAction,
  createChapterAction,
  createLessonAction,
} from "@/server/actions/course";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaPickerModal } from "@/components/shared/MediaPickerModal";
import {
  ArrowLeft,
  GraduationCap,
  Image as ImageIcon,
  Save,
  Plus,
  Video,
  Layers,
  CheckCircle,
} from "lucide-react";
import { CourseLevel } from "@prisma/client";
import { toast } from "sonner";

interface CourseFormProps {
  initialCourse?: any;
  categories: any[];
  instructors: any[];
}

export function CourseForm({
  initialCourse,
  categories,
  instructors,
}: CourseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(initialCourse);

  // Form Fields
  const [title, setTitle] = useState(initialCourse?.title || "");
  const [slug, setSlug] = useState(initialCourse?.slug || "");
  const [subtitle, setSubtitle] = useState(initialCourse?.subtitle || "");
  const [description, setDescription] = useState(initialCourse?.description || "");
  const [thumbnail, setThumbnail] = useState(initialCourse?.thumbnail || "");
  const [trailerVideoUrl, setTrailerVideoUrl] = useState(
    initialCourse?.trailerVideoUrl || ""
  );
  const [level, setLevel] = useState<CourseLevel>(
    initialCourse?.level || CourseLevel.ALL_LEVELS
  );
  const [price, setPrice] = useState<number>(initialCourse?.price || 0);
  const [discountPrice, setDiscountPrice] = useState<number | string>(
    initialCourse?.discountPrice || ""
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(
    initialCourse?.durationMinutes || 0
  );
  const [isPublished, setIsPublished] = useState<boolean>(
    initialCourse?.isPublished ?? true
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(
    initialCourse?.isFeatured ?? false
  );
  const [categoryId, setCategoryId] = useState<string>(
    initialCourse?.categoryId || (categories[0]?.id ?? "")
  );
  const [instructorId, setInstructorId] = useState<string>(
    initialCourse?.instructorId || (instructors[0]?.id ?? "")
  );

  // Media Picker
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  // New Chapter Modal / Inline state
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterDesc, setNewChapterDesc] = useState("");

  // New Lesson Inline state
  const [activeChapterForLesson, setActiveChapterForLesson] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonVideo, setNewLessonVideo] = useState("");
  const [newLessonDuration, setNewLessonDuration] = useState(15);
  const [newLessonFreePreview, setNewLessonFreePreview] = useState(false);

  const handleSaveCourse = () => {
    if (!title.trim() || !slug.trim() || !description.trim() || !categoryId) {
      toast.error("Vui lòng điền đầy đủ tiêu đề, slug, mô tả và chọn danh mục");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          title,
          slug,
          subtitle,
          description,
          thumbnail: thumbnail || null,
          trailerVideoUrl: trailerVideoUrl || null,
          level,
          price: Number(price),
          discountPrice: discountPrice ? Number(discountPrice) : null,
          durationMinutes: Number(durationMinutes),
          isPublished,
          isFeatured,
          categoryId,
          instructorId,
        };

        if (isEditing) {
          const res = await updateCourseAction({
            id: initialCourse.id,
            ...payload,
          });

          if (res.success && res.data) {
            toast.success("Cập nhật khóa học thành công!");
            router.refresh();
          } else {
            toast.error(res.error || "Không thể cập nhật khóa học");
          }
        } else {
          const res = await createCourseAction(payload);
          if (res.success && res.data) {
            toast.success("Khởi tạo khóa học mới thành công!");
            router.push(`/admin/courses/${res.data.id}`);
          } else {
            toast.error(res.error || "Không thể tạo khóa học");
          }
        }
      } catch (e: any) {
        toast.error(e.message || "Đã xảy ra lỗi");
      }
    });
  };

  const handleAddChapter = () => {
    if (!newChapterTitle.trim()) {
      toast.error("Vui lòng nhập tên chương");
      return;
    }

    startTransition(async () => {
      try {
        const chapterSlug = newChapterTitle
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-");

        const res = await createChapterAction({
          courseId: initialCourse.id,
          title: newChapterTitle,
          slug: chapterSlug,
          description: newChapterDesc || null,
          sortOrder: (initialCourse.chapters?.length || 0) + 1,
        });

        if (res.success) {
          toast.success("Thêm chương mới thành công!");
          setNewChapterTitle("");
          setNewChapterDesc("");
          setShowAddChapter(false);
          router.refresh();
        } else {
          toast.error(res.error || "Không thể tạo chương");
        }
      } catch (err: any) {
        toast.error(err.message || "Lỗi khi tạo chương");
      }
    });
  };

  const handleAddLesson = (chapterId: string) => {
    if (!newLessonTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài học");
      return;
    }

    startTransition(async () => {
      try {
        const lessonSlug = newLessonTitle
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-");

        const res = await createLessonAction({
          chapterId,
          title: newLessonTitle,
          slug: lessonSlug,
          videoUrl: newLessonVideo || null,
          durationMinutes: Number(newLessonDuration),
          isFreePreview: newLessonFreePreview,
          sortOrder: 0,
        });

        if (res.success) {
          toast.success("Thêm bài giảng thành công!");
          setNewLessonTitle("");
          setNewLessonVideo("");
          setActiveChapterForLesson(null);
          router.refresh();
        } else {
          toast.error(res.error || "Không thể tạo bài giảng");
        }
      } catch (err: any) {
        toast.error(err.message || "Lỗi khi tạo bài giảng");
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Link href="/admin/courses">
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground">
              {isEditing ? `Chỉnh sửa: ${initialCourse.title}` : "Tạo Khóa Học Mới"}
            </h1>
            <span className="text-xs text-muted-foreground">
              {isEditing
                ? "Quản lý thông tin chung, học phí và danh sách bài giảng"
                : "Thiết lập cấu hình và thông số tổng quan của khóa học"}
            </span>
          </div>
        </div>

        <Button onClick={handleSaveCourse} disabled={isPending} className="gap-2 font-bold">
          <Save className="w-4 h-4" />
          <span>{isPending ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo khóa học"}</span>
        </Button>
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Essential Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span>Thông tin cốt lõi</span>
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Tiêu đề khóa học *</label>
              <Input
                placeholder="VD: Next.js 14 Enterprise Architecture..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!isEditing) {
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "")
                    );
                  }
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Slug định danh URL *</label>
              <Input
                placeholder="VD: nextjs-14-enterprise-architecture"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Phụ đề (Subtitle)</label>
              <Input
                placeholder="Tóm tắt ngắn gọn 1 câu về giá trị nổi bật của khóa học..."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Mô tả chi tiết *</label>
              <Textarea
                rows={6}
                placeholder="Nội dung chi tiết, mục tiêu khóa học, công nghệ áp dụng..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Chapters & Lessons Accordion if editing */}
          {isEditing && (
            <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Chương trình giảng dạy ({initialCourse.chapters?.length || 0} chương)</span>
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddChapter(true)}
                  className="gap-1 text-xs h-8"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm chương</span>
                </Button>
              </div>

              {/* Add Chapter Inline Box */}
              {showAddChapter && (
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Tiêu đề chương mới</label>
                    <Input
                      placeholder="VD: Chương 1: Kiến trúc Lõi & Cơ sở Dữ liệu"
                      value={newChapterTitle}
                      onChange={(e) => setNewChapterTitle(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setShowAddChapter(false)}>
                      Hủy
                    </Button>
                    <Button size="sm" onClick={handleAddChapter} disabled={isPending}>
                      Lưu chương
                    </Button>
                  </div>
                </div>
              )}

              {/* Chapters List */}
              <div className="space-y-4">
                {initialCourse.chapters?.map((chapter: any, cIdx: number) => (
                  <div
                    key={chapter.id}
                    className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">
                        {chapter.title}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setActiveChapterForLesson(chapter.id)}
                        className="text-xs h-7 text-primary gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm bài giảng</span>
                      </Button>
                    </div>

                    {/* Lessons list */}
                    <div className="space-y-1.5 pl-3 border-l-2 border-border/60">
                      {chapter.lessons?.map((lesson: any, lIdx: number) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-border/40 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Video className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="font-medium text-foreground">{lesson.title}</span>
                            {lesson.isFreePreview && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/10 text-emerald-400 font-bold">
                                Học thử
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {lesson.durationMinutes} phút
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Add Lesson Form */}
                    {activeChapterForLesson === chapter.id && (
                      <div className="p-3 rounded-lg border border-primary/20 bg-background space-y-2 text-xs">
                        <Input
                          placeholder="Tiêu đề bài học mới..."
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          className="h-8 text-xs"
                        />
                        <Input
                          placeholder="URL Video (MP4 / HLS / CDN)..."
                          value={newLessonVideo}
                          onChange={(e) => setNewLessonVideo(e.target.value)}
                          className="h-8 text-xs"
                        />
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newLessonFreePreview}
                              onChange={(e) => setNewLessonFreePreview(e.target.checked)}
                              className="w-3.5 h-3.5 rounded"
                            />
                            <span>Cho phép học thử</span>
                          </label>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setActiveChapterForLesson(null)}
                              className="h-7 text-xs"
                            >
                              Hủy
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAddLesson(chapter.id)}
                              disabled={isPending}
                              className="h-7 text-xs"
                            >
                              Lưu bài giảng
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Taxonomy, Pricing & Media */}
        <div className="space-y-6">
          {/* Classification & Settings */}
          <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-foreground border-b border-border/60 pb-3">
              Phân loại & Trạng thái
            </h2>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Danh mục chuyên ngành *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs text-foreground outline-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Cấp độ (Level)</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as CourseLevel)}
                className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs text-foreground outline-none cursor-pointer"
              >
                <option value={CourseLevel.ALL_LEVELS}>Mọi cấp độ (All Levels)</option>
                <option value={CourseLevel.BEGINNER}>Cơ bản (Beginner)</option>
                <option value={CourseLevel.INTERMEDIATE}>Trung cấp (Intermediate)</option>
                <option value={CourseLevel.ADVANCED}>Nâng cao (Advanced)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Giảng viên đứng lớp</label>
              <select
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs text-foreground outline-none cursor-pointer"
              >
                {instructors.map((ins) => (
                  <option key={ins.id} value={ins.id}>
                    {ins.fullName} ({ins.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 space-y-2 border-t border-border/40">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-foreground">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <span>Xuất bản công khai</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-foreground">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <span>Đánh dấu nổi bật (Featured trên trang chủ)</span>
              </label>
            </div>
          </div>

          {/* Pricing & Duration */}
          <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-foreground border-b border-border/60 pb-3">
              Học phí & Thời lượng
            </h2>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Giá gốc (VNĐ)</label>
              <Input
                type="number"
                placeholder="VD: 1890000"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Giá ưu đãi (VNĐ)</label>
              <Input
                type="number"
                placeholder="Để trống nếu không giảm giá..."
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Tổng thời lượng (phút)</label>
              <Input
                type="number"
                placeholder="VD: 1800"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Media Assets */}
          <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-foreground border-b border-border/60 pb-3">
              Ảnh đại diện & Trailer
            </h2>

            <div className="space-y-2">
              <label className="font-semibold text-foreground">Ảnh bìa khóa học</label>
              {thumbnail ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-border/60">
                  <img src={thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setThumbnail("")}
                    className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white rounded text-[10px]"
                  >
                    Xóa ảnh
                  </button>
                </div>
              ) : null}

              <div className="flex gap-2">
                <Input
                  placeholder="URL ảnh bìa..."
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMediaPickerOpen(true)}
                  className="gap-1 flex-shrink-0"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Chọn ảnh</span>
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">URL Video giới thiệu (Trailer)</label>
              <Input
                placeholder="https://..."
                value={trailerVideoUrl}
                onChange={(e) => setTrailerVideoUrl(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={(url) => {
          setThumbnail(url);
          setMediaPickerOpen(false);
        }}
        title="Chọn ảnh bìa khóa học"
      />
    </div>
  );
}
