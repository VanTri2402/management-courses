import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>
        <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono text-xs font-bold shadow-md">
          404
        </div>
      </div>

      <h1 className="text-3xl md:text-5xl font-black text-foreground mb-3">
        Không tìm thấy trang yêu cầu
      </h1>
      <p className="text-muted-foreground text-sm md:text-base max-w-md mb-8">
        Trang bạn đang tìm kiếm có thể đã bị xóa, thay đổi địa chỉ hoặc tạm thời không khả dụng.
      </p>

      <div className="flex items-center gap-3">
        <Link href="/">
          <Button className="gap-2">
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Button>
        </Link>
        <Link href="/#explore">
          <Button variant="outline" className="gap-2">
            <Search className="w-4 h-4" />
            <span>Khám phá tính năng</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
