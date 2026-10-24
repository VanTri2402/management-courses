"use client";

import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

interface ScrollProgressBarProps {
  className?: string;
}

export function ScrollProgressBar({ className = "" }: ScrollProgressBarProps) {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className={`fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 origin-left z-[100] pointer-events-none shadow-[0_0_12px_rgba(99,102,241,0.6)] ${className}`}
    />
  );
}
