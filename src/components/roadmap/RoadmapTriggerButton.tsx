"use client";

import React, { useState } from "react";
import { Compass, Sparkles } from "lucide-react";
import { CareerRoadmapModal } from "./CareerRoadmapModal";

interface RoadmapTriggerButtonProps {
  className?: string;
  variant?: "pill" | "banner";
}

export function RoadmapTriggerButton({
  className = "",
  variant = "pill",
}: RoadmapTriggerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === "banner") {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-cyan-950/60 border border-emerald-500/30 hover:border-emerald-500/60 transition-all shadow-lg hover:shadow-emerald-500/10 text-left ${className}`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Khám phá Bản đồ Lộ trình Nghề nghiệp AI</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Interactive Node Graph
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Xem chi tiết cây kỹ năng Fullstack, AI Engineer & Creative UI/UX chuẩn tuyển dụng 2026
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
            Xem ngay →
          </span>
        </button>

        <CareerRoadmapModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all ${className}`}
      >
        <Compass className="w-3.5 h-3.5" />
        <span>Lộ trình AI</span>
        <Sparkles className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
      </button>

      <CareerRoadmapModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
