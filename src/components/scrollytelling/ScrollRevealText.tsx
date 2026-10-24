"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

interface ScrollRevealTextProps {
  text: string;
  className?: string;
  highlightWords?: string[];
}

interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  isHighlight?: boolean;
}

function Word({ children, progress, range, isHighlight }: WordProps) {
  const opacity = useTransform(progress, range, [0.75, 1]);
  const y = useTransform(progress, range, [3, 0]);

  return (
    <span className="relative inline-block mr-2 my-1">
      <motion.span
        style={{ opacity, y }}
        className={`inline-block transition-colors duration-200 ${
          isHighlight
            ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-emerald-400 font-bold"
            : "text-foreground font-semibold"
        }`}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function ScrollRevealText({
  text,
  className = "",
  highlightWords = [],
}: ScrollRevealTextProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: elementRef,
    offset: ["start 0.85", "start 0.25"],
  });

  const words = text.split(" ");

  return (
    <div ref={elementRef} className={`flex flex-wrap leading-relaxed select-none ${className}`}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase();
        const isHighlight = highlightWords.some(
          (hw) => hw.toLowerCase() === cleanWord
        );

        return (
          <Word
            key={i}
            progress={scrollYProgress}
            range={[start, end]}
            isHighlight={isHighlight}
          >
            {word}
          </Word>
        );
      })}
    </div>
  );
}
