import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldX, Home, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <div className="w-16 h-16 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center mb-6">
        <ShieldX className="w-8 h-8" />
      </div>

      <h1 className="text-2xl md:text-4xl font-black text-foreground mb-3">
        403 — Không Có Quyền Truy Cập
      </h1>
      <p className="text-muted-foreground text-sm md:text-base max-w-md mb-8">
        Tài khoản của bạn không có đủ thẩm quyền để truy cập vào khu vực quản trị này. Nếu bạn tin rằng đây là sự nhầm lẫn, vui lòng liên hệ Super Administrator.
      </p>

      <div className="flex items-center gap-3">
        <Link href="/">
          <Button className="gap-2">
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Trang cá nhân</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
