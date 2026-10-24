"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface CarouselCardItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  href?: string;
  badge?: string;
}

interface HorizontalScrollCarouselProps {
  items: CarouselCardItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function HorizontalScrollCarousel({
  items,
  title = "Bộ Sưu Tập Nổi Bật",
  subtitle = "Trải nghiệm chuyển động trượt ngang điện ảnh theo các lộ trình học chuyên sâu",
  className = "",
}: HorizontalScrollCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 20);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 420;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <section className={`relative w-full py-20 md:py-28 bg-background border-b border-border/60 overflow-hidden ${className}`}>
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full space-y-8">
        {/* Header with Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chương Trình Đào Tạo Tiêu Biểu</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
              {title}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Arrow Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              className="w-10 h-10 rounded-full p-0 border-border/80 hover:border-primary transition-all disabled:opacity-40"
              aria-label="Cuộn sang trái"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              className="w-10 h-10 rounded-full p-0 border-border/80 hover:border-primary transition-all disabled:opacity-40"
              aria-label="Cuộn sang phải"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Horizontal Scroll Track */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto pb-6 pt-2 scroll-smooth no-scrollbar select-none"
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              className="group relative h-[420px] w-[300px] sm:w-[360px] md:w-[380px] flex-shrink-0 overflow-hidden rounded-3xl border border-border/80 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
            >
              {/* Background Image */}
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Dark Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

              {/* Top Badge */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/70 backdrop-blur-md text-white border border-white/10">
                  {item.category}
                </span>
                {item.badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-cyan-400 to-indigo-500 text-white shadow-md">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Bottom Content Card */}
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2.5">
                <span className="text-xs font-mono font-bold text-cyan-400">
                  LỘ TRÌNH 0{index + 1}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-zinc-300 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-2">
                  <Link
                    href={item.href || "/courses"}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 group-hover:underline underline-offset-4"
                  >
                    <span>Khám phá chi tiết lộ trình</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
