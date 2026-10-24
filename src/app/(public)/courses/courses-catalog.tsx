"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { BookmarkButton } from "@/components/shared/BookmarkButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  GraduationCap,
  Clock,
  Users,
  Layers,
  ArrowRight,
  Filter,
  Sparkles,
  RotateCcw,
} from "lucide-react";

interface CoursesCatalogClientProps {
  initialCourses: any[];
  categories: any[];
  total: number;
  page: number;
  totalPages: number;
  activeCategory: string;
  activeLevel: string;
  searchQuery: string;
  activeSort: string;
}

export function CoursesCatalogClient({
  initialCourses,
  categories,
  total,
  page,
  totalPages,
  activeCategory,
  activeLevel,
  searchQuery,
  activeSort,
}: CoursesCatalogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(search, 350);

  // Sync debounced search to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }
    params.delete("page"); // Reset page on search change
    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearch]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setSearch("");
    router.push(pathname);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Kho Tàng Khóa Học EduCore</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
          Khám Phá Các Chương Trình Đào Tạo
        </h1>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          Tìm kiếm lộ trình phù hợp với mục tiêu nghề nghiệp của bạn. Từ kiến trúc Next.js Enterprise đến Trí tuệ Nhân tạo và DevOps chuyên sâu.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Tìm kiếm theo tên khóa học, công nghệ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-xs rounded-xl"
            />
          </div>

          {/* Level Filter & Sort */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="w-3.5 h-3.5" />
              <span>Cấp độ:</span>
            </div>
            <select
              value={activeLevel}
              onChange={(e) => updateParam("level", e.target.value)}
              className="h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground outline-none cursor-pointer"
            >
              <option value="ALL">Mọi cấp độ</option>
              <option value="BEGINNER">Cơ bản (Beginner)</option>
              <option value="INTERMEDIATE">Trung cấp (Intermediate)</option>
              <option value="ADVANCED">Nâng cao (Advanced)</option>
            </select>

            <select
              value={activeSort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground outline-none cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="popular">Học viên nhiều nhất</option>
              <option value="price-asc">Học phí: Thấp đến cao</option>
              <option value="price-desc">Học phí: Cao đến thấp</option>
            </select>

            {(search || activeCategory !== "all" || activeLevel !== "ALL" || activeSort !== "newest") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-10 gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </Button>
            )}
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 no-scrollbar">
          <button
            type="button"
            onClick={() => updateParam("category", "all")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Tất cả lĩnh vực ({total})
          </button>

          {categories.map((cat) => {
            const isSelected = activeCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateParam("category", cat.slug)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span>{cat.name}</span>
                <span className="ml-1.5 text-[10px] opacity-70">
                  ({cat._count?.courses || 0})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {initialCourses.map((course) => (
          <div
            key={course.id}
            className="group rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
          >
            <div>
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                  src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/10">
                    {course.category?.name}
                  </span>
                  {course.isFeatured && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/90 text-black font-semibold">
                      Nổi bật
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 right-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-md">
                    {course.level}
                  </span>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {Math.round(course.durationMinutes / 60)} giờ học
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    {course.totalLessons} bài giảng
                  </span>
                </div>

                <Link href={`/courses/${course.slug}`}>
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                </Link>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {course.subtitle || course.description}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40">
                  <span>GV: {course.instructor?.fullName}</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    {course._count.enrollments} học viên
                  </span>
                </div>

                <div className="pt-1">
                  {course.discountPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-primary">
                        {formatCurrency(course.discountPrice)}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        {formatCurrency(course.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-base font-black text-primary">
                      {course.price === 0 ? "Miễn phí" : formatCurrency(course.price)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-6 pt-0 flex items-center justify-between border-t border-border/40 mt-3">
              <Link href={`/courses/${course.slug}`}>
                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-semibold">
                  <span>Khám phá ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>

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
              />
            </div>
          </div>
        ))}
      </div>

      {initialCourses.length === 0 && (
        <div className="text-center py-20 rounded-2xl border border-dashed border-border bg-card/40 p-8 space-y-4">
          <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto stroke-[1.2]" />
          <h3 className="text-lg font-bold text-foreground">Không tìm thấy khóa học phù hợp</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Không có khóa học nào khớp với bộ lọc hiện tại của bạn. Hãy thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
          </p>
          <Button onClick={handleResetFilters} variant="outline" size="sm">
            Xóa bộ lọc tìm kiếm
          </Button>
        </div>
      )}
    </div>
  );
}
