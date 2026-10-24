"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAction } from "@/server/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ShieldCheck, UserCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    startTransition(async () => {
      const res = await loginAction({ email, password });
      if (res.success && res.data) {
        toast.success(`Đăng nhập thành công! Chào mừng ${res.data.fullName}`);
        router.refresh();
        if (res.data.role === "SUPER_ADMIN" || res.data.role === "ADMIN" || res.data.role === "EDITOR") {
          router.push("/admin");
        } else {
          router.push("/profile");
        }
      } else {
        if (res.validationErrors) {
          setErrors(res.validationErrors);
        }
        toast.error(res.error || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    });
  };

  const handleQuickFill = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-2xl p-8 shadow-2xl">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tight">Enterprise Core</span>
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Đăng nhập tài khoản
          </h1>
          <p className="text-xs text-muted-foreground">
            Nhập thông tin xác thực hoặc chọn tài khoản mẫu bên dưới để kiểm thử ngay.
          </p>
        </div>

        {/* Quick Autofill for Demo Testing */}
        <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-primary" />
            <span>Tài khoản kiểm thử nhanh (Demo Seed):</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill("superadmin@enterprise-core.dev", "AdminPassword123!")}
              className="p-2 rounded-lg bg-card hover:bg-primary/10 border border-border hover:border-primary/40 text-left transition-colors"
            >
              <div className="font-bold text-primary flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Super Admin
              </div>
              <div className="text-[10px] text-muted-foreground truncate">superadmin@...</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("demo@enterprise-core.dev", "UserPassword123!")}
              className="p-2 rounded-lg bg-card hover:bg-primary/10 border border-border hover:border-primary/40 text-left transition-colors"
            >
              <div className="font-bold text-foreground flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Member User
              </div>
              <div className="text-[10px] text-muted-foreground truncate">demo@...</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Địa chỉ Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ten@doanhnghiep.dev"
              required
              error={errors.email?.[0]}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Mật khẩu</label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              error={errors.password?.[0]}
            />
          </div>

          <Button
            type="submit"
            className="w-full font-bold gap-2"
            isLoading={isPending}
            disabled={isPending}
          >
            <span>Đăng nhập</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Tạo tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
}
