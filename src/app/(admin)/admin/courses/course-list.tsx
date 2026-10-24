"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteCourseAction } from "@/server/actions/course";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Users,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface CourseListClientProps {
  initialCourses: any[];
}

export function CourseListClient({ initialCourses }: CourseListClientProps) {
  const [courses, setCourses] = useState<any[]>(initialCourses);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Extract unique categories
  const categories = Array.from(
    new Set(initialCourses.map((c) => c.category?.name).filter(Boolean))
  );

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor?.fullName?.toLowerCase().includes(search.toLowerCase());

    const matchesCat =
      selectedCategory === "all" || c.category?.name === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const handleDelete = () => {
    if (!deletingId) return;

    startTransition(async () => {
      try {
        const res = await deleteCourseAction({ id: deletingId });
        if (res.success) {
          setCourses((prev) => prev.filter((c) => c.id !== deletingId));
          toast.success("Xóa khóa học thành công!");
          setDeleteModalOpen(false);
          setDeletingId(null);
          router.refresh();
        } else {
          toast.error(res.error || "Không thể xóa khóa học");
        }
      } catch (e: any) {
        toast.error(e.message || "Đã xảy ra lỗi");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <span>Quản Lý Khóa Học & Giáo Trình</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Danh sách toàn bộ chương trình đào tạo, học phần, video bài giảng và tình trạng xuất bản.
          </p>
        </div>

        <Link href="/admin/courses/new">
          <Button className="gap-2 font-bold shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Thêm khóa học mới</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Tìm kiếm theo tiêu đề, giảng viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground outline-none cursor-pointer"
          >
            <option value="all">Tất cả danh mục ({courses.length})</option>
            {categories.map((cat: any) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-xl group"
          >
            <div>
              {/* Thumbnail image & badges */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <GraduationCap className="w-12 h-12 stroke-[1.5]" />
                  </div>
                )}

                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/10">
                    {course.category?.name || "Chưa phân loại"}
                  </span>
                  {course.isFeatured && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-black flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      <span>Nổi bật</span>
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 right-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md ${
                      course.isPublished
                        ? "bg-emerald-500/80 text-white"
                        : "bg-rose-500/80 text-white"
                    }`}
                  >
                    {course.isPublished ? "Đã xuất bản" : "Bản nháp"}
                  </span>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span>Cấp độ: {course.level}</span>
                  <span className="text-primary font-bold">
                    {course.price === 0
                      ? "Miễn phí"
                      : formatCurrency(course.discountPrice || course.price)}
                  </span>
                </div>

                <h3 className="font-bold text-sm md:text-base text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {course.title}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {course.subtitle || course.description}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40">
                  <span>GV: {course.instructor?.fullName || "Chuyên gia EduCore"}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      {course._count?.chapters || 0} chương
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      {course._count?.enrollments || 0} học viên
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 pt-0 border-t border-border/40 mt-3 flex items-center justify-between text-xs">
              <Link
                href={`/courses/${course.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Xem trang công khai</span>
              </Link>

              <div className="flex items-center gap-2">
                <Link href={`/admin/courses/${course.id}`}>
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa</span>
                  </Button>
                </Link>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setDeletingId(course.id);
                    setDeleteModalOpen(true);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card/40 p-8 space-y-3">
          <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto stroke-[1.5]" />
          <h3 className="font-bold text-sm text-foreground">Không tìm thấy khóa học nào</h3>
          <p className="text-xs text-muted-foreground">
            Thử thay đổi từ khóa tìm kiếm hoặc lọc theo danh mục khác.
          </p>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Xác nhận xóa khóa học"
        description="Bạn có chắc chắn muốn xóa khóa học này cùng toàn bộ bài học và tiến độ liên quan? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        isLoading={isPending}
      />
    </div>
  );
}
