"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerAction } from "@/server/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    startTransition(async () => {
      const res = await registerAction({ fullName, email, password });
      if (res.success && res.data) {
        toast.success(`Đăng ký thành công! Chào mừng ${res.data.fullName}`);
        router.refresh();
        router.push("/profile");
      } else {
        if (res.validationErrors) {
          setErrors(res.validationErrors);
        }
        toast.error(res.error || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    });
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
            Tạo tài khoản mới
          </h1>
          <p className="text-xs text-muted-foreground">
            Khám phá tính năng lưu trữ yêu thích, bình luận đa hình và trải nghiệm cá nhân hóa.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Họ và tên</label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
              error={errors.fullName?.[0]}
            />
          </div>

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
            <label className="text-xs font-semibold text-foreground">Mật khẩu</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
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
            <span>Đăng ký tài khoản</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
