"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookmarkButton } from "@/components/shared/BookmarkButton";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  Sparkles,
  ArrowRight,
  Clock,
  Users,
  Layers,
  GraduationCap,
  Filter,
} from "lucide-react";

interface HomeCoursesSectionProps {
  initialCourses: any[];
  categories: any[];
}

export function HomeCoursesSection({
  initialCourses,
  categories,
}: HomeCoursesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const filteredCourses = initialCourses.filter((course) => {
    const matchesCategory =
      selectedCategory === "all" || course.category?.slug === selectedCategory;
    const matchesLevel =
      selectedLevel === "all" || course.level === selectedLevel;
    return matchesCategory && matchesLevel;
  });

  return (
    <div className="space-y-12">
      {/* Category and Level Filter Pills */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Tất cả ({initialCourses.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.slug
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Level Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-semibold text-foreground outline-none cursor-pointer"
          >
            <option value="all">Mọi cấp độ</option>
            <option value="BEGINNER">Cơ bản (Beginner)</option>
            <option value="INTERMEDIATE">Trung cấp (Intermediate)</option>
            <option value="ADVANCED">Nâng cao (Advanced)</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="group rounded-3xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5"
          >
            <div>
              {/* Thumbnail Image */}
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
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/70 text-white backdrop-blur-md border border-white/10">
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
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    {course._count?.enrollments || 0} học viên
                  </span>
                </div>

                <Link href={`/courses/${course.slug}`}>
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {course.title}
                  </h3>
                </Link>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {course.subtitle || course.description}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40">
                  <span>GV: {course.instructor?.fullName || "EduCore Tech Lead"}</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    {course._count?.chapters || 0} chương
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

            {/* Action Toolbar */}
            <div className="p-6 pt-0 flex items-center justify-between border-t border-border/40 mt-4">
              <Link href={`/courses/${course.slug}`}>
                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-bold">
                  <span>Xem chi tiết</span>
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

      {filteredCourses.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-3xl bg-card/40 p-8 space-y-3">
          <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto" />
          <h4 className="font-bold text-sm text-foreground">Không có khóa học nào khớp với bộ lọc</h4>
          <p className="text-xs text-muted-foreground">
            Hãy chọn danh mục hoặc cấp độ khác để hiển thị các khóa học tương ứng.
          </p>
        </div>
      )}
    </div>
  );
}
