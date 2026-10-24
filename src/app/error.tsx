"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center mb-6">
        <AlertOctagon className="w-8 h-8" />
      </div>

      <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
        Đã xảy ra sự cố không mong muốn
      </h1>
      <p className="text-muted-foreground text-sm max-w-md mb-8">
        Hệ thống đã ghi nhận lỗi này. Bạn có thể thử tải lại trang hoặc quay trở về trang chủ.
      </p>

      <div className="flex items-center gap-3">
        <Button onClick={() => reset()} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          <span>Thử lại</span>
        </Button>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Home className="w-4 h-4" />
            <span>Trang chủ</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
