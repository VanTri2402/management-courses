"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Universal hook to synchronize filter, sort, search, and pagination states to URL searchParams
 */
export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getParam = useCallback(
    (key: string, defaultValue = ""): string => {
      return searchParams?.get(key) ?? defaultValue;
    },
    [searchParams]
  );

  const setParam = useCallback(
    (key: string, value: string | number | null | undefined) => {
      const current = new URLSearchParams(searchParams ? Array.from(searchParams.entries()) : []);

      if (value === null || value === undefined || value === "") {
        current.delete(key);
      } else {
        current.set(key, String(value));
      }

      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.push(`${pathname}${query}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setParams = useCallback(
    (params: Record<string, string | number | null | undefined>) => {
      const current = new URLSearchParams(searchParams ? Array.from(searchParams.entries()) : []);

      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined || value === "") {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      }

      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.push(`${pathname}${query}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const clearParams = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  return {
    getParam,
    setParam,
    setParams,
    clearParams,
    searchParams,
  };
}
