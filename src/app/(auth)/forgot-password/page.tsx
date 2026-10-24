"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/server/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await forgotPasswordAction({ email });
      if (res.success) {
        setSubmitted(true);
        toast.success("Yêu cầu đã được gửi thành công!");
      } else {
        toast.error(res.error || "Không thể gửi yêu cầu đặt lại mật khẩu.");
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
            Quên mật khẩu
          </h1>
          <p className="text-xs text-muted-foreground">
            Nhập email của bạn để nhận liên kết khôi phục mật khẩu bảo mật.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <MailCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-emerald-400">Kiểm tra hộp thư đến</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nếu địa chỉ <strong>{email}</strong> tồn tại trên hệ thống, chúng tôi đã gửi email chứa hướng dẫn đặt lại mật khẩu cho bạn.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="w-full">
                  Quay lại đăng nhập
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Địa chỉ Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten@doanhnghiep.dev"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full font-bold"
              isLoading={isPending}
              disabled={isPending}
            >
              Gửi liên kết khôi phục
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại trang Đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
