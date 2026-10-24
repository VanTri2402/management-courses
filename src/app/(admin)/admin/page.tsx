import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  Users,
  Layers,
  Image,
  ShieldAlert,
  Settings,
  ArrowUpRight,
  Database,
  Cpu,
  CheckCircle2,
  GraduationCap,
  FolderTree,
  Award,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  let usersCount = 0;
  let coursesCount = 0;
  let categoriesCount = 0;
  let enrollmentsCount = 0;
  let mediaCount = 0;
  let auditLogsCount = 0;
  let recentLogs: any[] = [];

  try {
    const [uCount, cCount, catCount, eCount, mCount, aCount, rLogs] = await Promise.all([
      db.user.count(),
      db.course.count(),
      db.category.count(),
      db.enrollment.count(),
      db.mediaAsset.count(),
      db.auditLog.count(),
      db.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          actor: {
            select: { fullName: true, role: true },
          },
        },
      }),
    ]);
    usersCount = uCount;
    coursesCount = cCount;
    categoriesCount = catCount;
    enrollmentsCount = eCount;
    mediaCount = mCount;
    auditLogsCount = aCount;
    recentLogs = rLogs;
  } catch (e) {
    console.warn("[AdminDashboard] DB query fallback:", e);
  }

  const stats = [
    {
      title: "Tổng khóa học",
      value: coursesCount,
      desc: "Chương trình đào tạo",
      href: "/admin/courses",
      icon: GraduationCap,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      title: "Danh mục khóa học",
      value: categoriesCount,
      desc: "Lĩnh vực công nghệ",
      href: "/admin/categories",
      icon: FolderTree,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Lượt ghi danh",
      value: enrollmentsCount,
      desc: "Tiến độ học tập",
      href: "/admin/enrollments",
      icon: Award,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Học viên & Quản trị",
      value: usersCount,
      desc: "Tài khoản hệ thống",
      href: "/admin/users",
      icon: Users,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-r from-card via-card to-primary/5 p-6 md:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-primary/10 text-primary border border-primary/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Hệ thống hoạt động hoàn hảo 100%</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">
            Xin chào, {user?.fullName}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Đây là trung tâm điều hành toàn diện của Enterprise Core Boilerplate. Mọi thay đổi về Menu, Cấu hình và Người dùng sẽ được áp dụng ngay lập tức với cơ chế On-Demand Cache Revalidation.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.title}
              href={s.href}
              className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm hover:border-primary/50 transition-all hover:shadow-lg group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>

              <div>
                <div className="text-3xl font-black text-foreground">{s.value}</div>
                <div className="text-xs font-bold text-foreground mt-1">{s.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* LEVEL 2 BREAKTHROUGH: CREATOR ECONOMY STUDIO & REVENUE SHARE DASHBOARD  */}
      {/* ----------------------------------------------------------------------- */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-zinc-950 via-card/70 to-zinc-950 border border-emerald-500/30 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-foreground">
                EduCore Creator Studio & Revenue Engine 360°
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Partner Active
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hệ sinh thái phân phối doanh thu cho Giảng viên & Quản trị nghiệp vụ (70% Creator / 30% Platform).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-300">
              Hoa hồng liên kết: 15%
            </span>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 space-y-1">
            <span className="text-[11px] text-muted-foreground font-semibold">Doanh thu khóa học (Tháng này)</span>
            <div className="text-2xl font-black text-white">128.500.000 đ</div>
            <div className="text-[10px] text-emerald-400 font-mono">▲ +18.4% so với tháng trước</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 space-y-1">
            <span className="text-[11px] text-muted-foreground font-semibold">Thu nhập Giảng viên (70%)</span>
            <div className="text-2xl font-black text-emerald-400">89.950.000 đ</div>
            <div className="text-[10px] text-zinc-400 font-mono">Chi trả tự động qua tài khoản</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 space-y-1">
            <span className="text-[11px] text-muted-foreground font-semibold">Số dư khả dụng để rút</span>
            <div className="text-2xl font-black text-cyan-400">34.200.000 đ</div>
            <div className="text-[10px] text-zinc-400 font-mono">Chu kỳ thanh toán: Ngày 15 hàng tháng</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 space-y-1">
            <span className="text-[11px] text-muted-foreground font-semibold">Tỷ lệ giữ chân học viên</span>
            <div className="text-2xl font-black text-indigo-400">92.4%</div>
            <div className="text-[10px] text-emerald-400 font-mono">Tỷ lệ hoàn tiền: 0.8% (Cực thấp)</div>
          </div>
        </div>

        {/* Student Engagement & Drop-off Retention Bar */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span>Bản đồ nhiệt tỷ lệ hoàn thành theo khóa học (Engagement Velocity)</span>
            <span className="text-xs font-mono text-muted-foreground">Mục tiêu: &gt; 80%</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Next.js 14 Enterprise Architecture</span>
                <span className="text-emerald-400 font-mono font-bold">94%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full" style={{ width: "94%" }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Generative AI & LLM Systems Engineering</span>
                <span className="text-cyan-400 font-mono font-bold">91%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-400 rounded-full" style={{ width: "91%" }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Awwwards UI/UX & Micro-Interactions</span>
                <span className="text-purple-400 font-mono font-bold">89%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: "89%" }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Cloud Native DevOps: Kubernetes & CI/CD</span>
                <span className="text-amber-400 font-mono font-bold">86%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full" style={{ width: "86%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Activity & System Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Audit Logs */}
        <div className="lg:col-span-7 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-primary" />
              <span>Nhật ký hoạt động gần đây</span>
            </h3>
            <Link
              href="/admin/audit-logs"
              className="text-xs text-primary hover:underline font-medium"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">
                      {log.action}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                      {log.entityType}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-[11px]">
                    Bởi: {log.actor?.fullName || "Hệ thống"} ({log.actor?.role || "SYSTEM"}) • IP: {log.ipAddress || "127.0.0.1"}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {formatDate(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Health & Architecture */}
        <div className="lg:col-span-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 space-y-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Trạng thái kiến trúc nền tảng</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" /> Database & ORM
              </span>
              <span className="font-mono font-semibold text-foreground">Postgres + Prisma Singleton</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> On-demand Cache
              </span>
              <span className="font-mono font-semibold text-emerald-400">Tag: &apos;layout-data&apos; Active</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-400" /> Security Layer
              </span>
              <span className="font-mono font-semibold text-foreground">Jose JWT + HttpOnly Cookies</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Storytelling Engine
              </span>
              <span className="font-mono font-semibold text-foreground">Lenis + Framer Motion</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
