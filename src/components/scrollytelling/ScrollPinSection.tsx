"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollytellingStep } from "@/types";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface ScrollPinSectionProps {
  steps: ScrollytellingStep[];
  className?: string;
}

export function ScrollPinSection({ steps, className = "" }: ScrollPinSectionProps) {
  const [activeStep, setActiveStep] = useState(0);

  if (!steps || steps.length === 0) return null;

  const current = steps[activeStep] || steps[0];

  return (
    <section className={`relative w-full py-20 md:py-28 px-6 md:px-12 bg-gradient-to-b from-background via-card/50 to-background border-y border-border/60 ${className}`}>
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lộ Trình Đào Tạo Chuẩn Doanh Nghiệp</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
            3 Trụ Cột Nâng Tầm Kỹ Sư Tech
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Chương trình đào tạo tại EduCore được cấu trúc chặt chẽ từ thực chiến dự án, đồng hành mentor chuyên gia đến chứng nhận năng lực quốc tế.
          </p>

          {/* Interactive Stepper Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-4">
            {steps.map((step, idx) => {
              const isActive = idx === activeStep;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                      : "bg-card/80 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/80"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                    isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    0{idx + 1}
                  </span>
                  <span>{step.tag || `Trụ cột ${idx + 1}`}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Interactive Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center rounded-3xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 sm:p-10 shadow-2xl">
          {/* Left Column: Narrative Content */}
          <div className="lg:col-span-6 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>{current.tag || `Trụ cột đào tạo 0${activeStep + 1}`}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground leading-snug">
                  {current.title}
                </h3>

                <p className="text-base sm:text-lg font-semibold text-primary/90">
                  {current.subtitle}
                </p>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {current.description}
                </p>

                {/* Key Highlights checklist */}
                <div className="pt-2 space-y-2 text-xs sm:text-sm text-foreground">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Thực hành 100% trên code base chuẩn Production</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>Hỗ trợ code review và giải đáp thắc mắc 1-on-1</span>
                  </div>
                </div>

                {/* Action CTA Button */}
                {current.actionText && (
                  <div className="pt-4">
                    <Link
                      href={current.actionUrl || "/courses"}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 transition-all duration-300 group"
                    >
                      <span>{current.actionText}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Visual Stage */}
          <div className="lg:col-span-6 relative aspect-[16/10] rounded-2xl overflow-hidden border border-border/80 bg-background/80 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 w-full h-full"
              >
                {current.imageUrl ? (
                  <img
                    src={current.imageUrl}
                    alt={current.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-card to-background text-center">
                    <Sparkles className="w-12 h-12 text-primary mb-3" />
                    <h4 className="text-xl font-bold">{current.title}</h4>
                  </div>
                )}
                {/* Subtle vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
