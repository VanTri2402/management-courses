"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";

interface LenisContextValue {
  lenis: Lenis | null;
}

const LenisContext = createContext<LenisContextValue>({ lenis: null });

export function useLenis() {
  return useContext(LenisContext);
}

interface SmoothScrollProviderProps {
  children: React.ReactNode;
  options?: {
    lerp?: number;
    duration?: number;
    smoothWheel?: boolean;
  };
}

export function SmoothScrollProvider({ children, options }: SmoothScrollProviderProps) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const reqIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Only run on client
    const lenis = new Lenis({
      duration: options?.duration ?? 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: options?.smoothWheel ?? true,
      lerp: options?.lerp ?? 0.1,
    });

    setLenisInstance(lenis);

    function raf(time: number) {
      lenis.raf(time);
      reqIdRef.current = requestAnimationFrame(raf);
    }

    reqIdRef.current = requestAnimationFrame(raf);

    return () => {
      if (reqIdRef.current) {
        cancelAnimationFrame(reqIdRef.current);
      }
      lenis.destroy();
      setLenisInstance(null);
    };
  }, [options?.duration, options?.lerp, options?.smoothWheel]);

  return (
    <LenisContext.Provider value={{ lenis: lenisInstance }}>
      {children}
    </LenisContext.Provider>
  );
}
