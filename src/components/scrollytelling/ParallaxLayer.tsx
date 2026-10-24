"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number; // e.g. -50 (moves up faster), 50 (moves down slower), default 20
  className?: string;
  style?: React.CSSProperties;
}

export function ParallaxLayer({
  children,
  speed = 20,
  className = "",
  style = {},
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-speed * 4, speed * 4]);

  return (
    <motion.div
      ref={ref}
      style={{ y, ...style }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}
