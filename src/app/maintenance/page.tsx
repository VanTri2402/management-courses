import { Wrench, ShieldAlert } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mb-6">
        <Wrench className="w-8 h-8 animate-bounce" />
      </div>

      <h1 className="text-3xl md:text-5xl font-black text-foreground mb-3">
        Hệ Thống Đang Bảo Trì Định Kỳ
      </h1>
      <p className="text-muted-foreground text-sm md:text-base max-w-lg mb-8 leading-relaxed">
        Chúng tôi đang tiến hành nâng cấp hạ tầng để mang đến trải nghiệm nhanh hơn và an toàn hơn. Vui lòng quay lại sau ít phút.
      </p>

      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono bg-muted/60 text-muted-foreground border border-border">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
        <span>Quản trị viên có thể đăng nhập để tiếp tục</span>
      </div>
    </div>
  );
}
