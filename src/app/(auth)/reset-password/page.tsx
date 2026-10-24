"use client";

import React, { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPasswordAction } from "@/server/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, KeyRound, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (!token || !emailParam) {
      toast.error("Liên kết không hợp lệ hoặc thiếu thông số token.");
      return;
    }

    startTransition(async () => {
      const res = await resetPasswordAction({
        email: emailParam,
        token,
        password,
      });

      if (res.success) {
        setSuccess(true);
        toast.success("Đặt lại mật khẩu thành công!");
      } else {
        toast.error(res.error || "Không thể đặt lại mật khẩu. Mã khôi phục có thể đã hết hạn.");
      }
    });
  };

  if (success) {
    return (
      <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-emerald-400">Đặt lại mật khẩu thành công!</h3>
        <p className="text-xs text-muted-foreground">
          Bây giờ bạn có thể đăng nhập bằng mật khẩu mới vừa thiết lập.
        </p>
        <Link href="/login">
          <Button className="w-full font-bold">
            Đăng nhập ngay
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground">Email tài khoản</label>
        <Input
          type="email"
          value={emailParam}
          disabled
          className="opacity-70 bg-muted"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground">Mật khẩu mới</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tối thiểu 6 ký tự"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground">Xác nhận mật khẩu mới</label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Nhập lại mật khẩu mới"
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full font-bold gap-2"
        isLoading={isPending}
        disabled={isPending}
      >
        <KeyRound className="w-4 h-4" />
        <span>Cập nhật mật khẩu</span>
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
            Thiết lập mật khẩu mới
          </h1>
          <p className="text-xs text-muted-foreground">
            Nhập mật khẩu mới an toàn cho tài khoản của bạn.
          </p>
        </div>

        <Suspense fallback={<div className="py-8 text-center text-xs">Đang tải...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
