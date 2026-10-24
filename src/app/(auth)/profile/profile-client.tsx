"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SafeUser } from "@/types";
import { updateProfileAction, changePasswordAction } from "@/server/actions/auth";
import { MediaPickerModal } from "@/components/shared/MediaPickerModal";
import { BookmarkButton } from "@/components/shared/BookmarkButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  User,
  Shield,
  KeyRound,
  Bookmark,
  Camera,
  CheckCircle,
  Sparkles,
  ArrowLeft,
  GraduationCap,
  Award,
  PlayCircle,
  ArrowRight,
  Flame,
  Zap,
  Printer,
  Share2,
  ExternalLink,
  Code2,
} from "lucide-react";
import { toast } from "sonner";

interface ProfileClientViewProps {
  user: SafeUser;
  bookmarks: any[];
  enrolledCourses?: any[];
}

export function ProfileClientView({
  user,
  bookmarks,
  enrolledCourses = [],
}: ProfileClientViewProps) {
  const [activeTab, setActiveTab] = useState<
    "enrolled" | "certificates" | "profile" | "password" | "bookmarks"
  >("enrolled");

  // Profile update state
  const [fullName, setFullName] = useState(user.fullName);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [profilePending, startProfileTransition] = useTransition();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordPending, startPasswordTransition] = useTransition();

  const router = useRouter();

  // Level 2 Metrics
  const completedCount = enrolledCourses.filter((e) => e.status === "COMPLETED").length;
  const totalCourses = enrolledCourses.length;
  const calculatedXP = Math.max(850, completedCount * 500 + totalCourses * 150);
  const userLevel = Math.floor(calculatedXP / 500) + 1;

  // Radar points (Normalized 0 - 100)
  // Axes: [Frontend, Backend, DevOps, AI & LLMs, UI/UX Motion, System Design]
  const radarMetrics = [
    { label: "Frontend", value: 88 },
    { label: "Backend", value: 80 },
    { label: "DevOps", value: 65 },
    { label: "AI & LLMs", value: 92 },
    { label: "UI/UX Motion", value: 74 },
    { label: "System Design", value: 82 },
  ];

  // Helper to convert 6 values into SVG polygon points on a 200x200 canvas
  const center = 100;
  const radius = 75;
  const polygonPoints = radarMetrics
    .map((m, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const r = (radius * m.value) / 100;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const gridLevels = [0.33, 0.66, 1.0];

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    startProfileTransition(async () => {
      const res = await updateProfileAction({ fullName, avatarUrl });
      if (res.success) {
        toast.success("Cập nhật hồ sơ thành công!");
        router.refresh();
      } else {
        toast.error(res.error || "Không thể cập nhật hồ sơ.");
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    startPasswordTransition(async () => {
      const res = await changePasswordAction({ currentPassword, newPassword });
      if (res.success) {
        toast.success("Đổi mật khẩu thành công!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.error || "Không thể đổi mật khẩu.");
      }
    });
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-9 h-9 rounded-full border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-foreground">
                Tài khoản & Hồ sơ Năng lực (Profile 2.0)
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Theo dõi radar kỹ năng thời gian thực, chứng chỉ số và tiến độ học tập.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Vai trò: {user.role}</span>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* LEVEL 2 BREAKTHROUGH: DYNAMIC SKILL RADAR & DEVELOPER XP RANK CARD */}
        {/* ------------------------------------------------------------------- */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-950 via-card/70 to-zinc-950 border border-emerald-500/30 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left info: XP, Level & Streaks */}
          <div className="md:col-span-7 space-y-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    fullName[0]?.toUpperCase()
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-black text-[9px] font-mono border border-zinc-950">
                  Lv.{userLevel}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white">{fullName}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                    Tier: Senior Architect Track
                  </span>
                </div>
                <p className="text-xs text-zinc-400">{user.email}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold mb-0.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Streak</span>
                </div>
                <div className="text-lg font-black text-white">7 Ngày</div>
                <div className="text-[10px] text-zinc-400">Học liên tục</div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                <div className="flex items-center justify-center gap-1 text-cyan-400 text-xs font-bold mb-0.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Kinh nghiệm</span>
                </div>
                <div className="text-lg font-black text-white">{calculatedXP} XP</div>
                <div className="text-[10px] text-zinc-400">Level {userLevel}</div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold mb-0.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Chứng chỉ</span>
                </div>
                <div className="text-lg font-black text-white">{completedCount} Đã cấp</div>
                <div className="text-[10px] text-zinc-400">Verified ID</div>
              </div>
            </div>

            {/* Level progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Tiến độ thăng hạng (Level {userLevel} ➔ {userLevel + 1})</span>
                <span className="text-emerald-400 font-bold">{calculatedXP % 500} / 500 XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-700"
                  style={{ width: `${((calculatedXP % 500) / 500) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right column: Dynamic Hexagonal Skill Radar Chart */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl">
            <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Biểu đồ Radar Năng lực 6 Chiều</span>
            </div>

            <div className="relative w-52 h-52">
              <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                {/* Background Grid Rings */}
                {gridLevels.map((lvl, gIdx) => {
                  const pts = [0, 1, 2, 3, 4, 5]
                    .map((i) => {
                      const angle = (Math.PI / 3) * i - Math.PI / 2;
                      const r = radius * lvl;
                      return `${(center + r * Math.cos(angle)).toFixed(1)},${(center + r * Math.sin(angle)).toFixed(1)}`;
                    })
                    .join(" ");
                  return (
                    <polygon
                      key={gIdx}
                      points={pts}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Axis lines */}
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const angle = (Math.PI / 3) * i - Math.PI / 2;
                  const x = center + radius * Math.cos(angle);
                  const y = center + radius * Math.sin(angle);
                  return (
                    <line
                      key={i}
                      x1={center}
                      y1={center}
                      x2={x}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Radar Fill Area */}
                <polygon
                  points={polygonPoints}
                  fill="rgba(16, 185, 129, 0.25)"
                  stroke="#10b981"
                  strokeWidth="2"
                />

                {/* Radar Vertex Dots */}
                {radarMetrics.map((m, i) => {
                  const angle = (Math.PI / 3) * i - Math.PI / 2;
                  const r = (radius * m.value) / 100;
                  const x = center + r * Math.cos(angle);
                  const y = center + r * Math.sin(angle);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="3.5"
                      fill="#34d399"
                      stroke="#064e3b"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Labels around vertices */}
                {radarMetrics.map((m, i) => {
                  const angle = (Math.PI / 3) * i - Math.PI / 2;
                  const labelR = radius + 18;
                  const lx = center + labelR * Math.cos(angle);
                  const ly = center + labelR * Math.sin(angle);
                  return (
                    <text
                      key={i}
                      x={lx}
                      y={ly + 3}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="8"
                      fontFamily="monospace"
                    >
                      {m.label} ({m.value})
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border/60 space-x-6 text-sm font-semibold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("enrolled")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "enrolled"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span>Khóa học của tôi ({enrolledCourses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("certificates")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "certificates"
                ? "border-emerald-400 text-emerald-400 font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Chứng chỉ số ({completedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "profile"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Thông tin hồ sơ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("password")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "password"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Bảo mật & Mật khẩu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bookmarks")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "bookmarks"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bookmark className="w-4 h-4 text-rose-400" />
            <span>Bộ sưu tập ({bookmarks.length})</span>
          </button>
        </div>

        {/* TAB 0: ENROLLED COURSES */}
        {activeTab === "enrolled" && (
          <div className="space-y-6">
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-dashed border-border p-8 bg-card/30 space-y-3">
                <GraduationCap className="w-12 h-12 text-muted-foreground/40 mx-auto" />
                <h3 className="text-base font-bold text-foreground">
                  Bạn chưa ghi danh khóa học nào
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Khám phá các chương trình đào tạo chuẩn doanh nghiệp của EduCore và bắt đầu học ngay hôm nay.
                </p>
                <div className="pt-2">
                  <Link href="/courses">
                    <Button size="sm" variant="gradient" className="font-bold">
                      Khám phá khóa học
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((enr) => {
                  const course = enr.course;
                  const isDone = enr.status === "COMPLETED";
                  const cert = enr.certificates?.[0];

                  return (
                    <div
                      key={enr.id}
                      className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all shadow-sm"
                    >
                      <div>
                        {course.thumbnail && (
                          <div className="aspect-video relative overflow-hidden bg-muted">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-xs text-white">
                              {course.category?.name}
                            </div>
                            {isDone && (
                              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                <span>Đã hoàn thành</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="p-5 space-y-3">
                          <h4 className="font-bold text-sm text-foreground line-clamp-2">
                            {course.title}
                          </h4>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                              <span>Tiến độ hoàn thành</span>
                              <span className="font-bold text-primary">
                                {Math.round(enr.progressPercent)}%
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isDone ? "bg-emerald-500" : "bg-primary"
                                }`}
                                style={{ width: `${Math.min(enr.progressPercent, 100)}%` }}
                              />
                            </div>
                          </div>

                          {cert && (
                            <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-2 text-xs text-amber-300">
                              <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                              <div className="truncate">
                                <span className="font-bold">Chứng chỉ: </span>
                                <span className="font-mono text-[11px]">
                                  {cert.certificateCode}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-5 pt-0">
                        <Link href={`/courses/${course.slug}`}>
                          <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs font-semibold">
                            <span>Vào phòng học</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 1: CRYPTOGRAPHIC VERIFIED CERTIFICATES */}
        {activeTab === "certificates" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-zinc-950 border border-emerald-500/40 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <span>Chứng Chỉ Số Xác Thực (Verified Credentials)</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Bảo chứng kỹ thuật số với mã định danh độc bản duy nhất và chữ ký điện tử.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePrintCertificate}
                    className="h-8 gap-1.5 text-xs border-zinc-700 bg-zinc-900 text-zinc-200"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In chứng chỉ (PDF)</span>
                  </Button>
                </div>
              </div>

              {/* Certificate Template Card */}
              <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border-2 border-emerald-500/50 shadow-2xl relative overflow-hidden text-center space-y-6">
                {/* Holographic Watermark Background */}
                <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
                      EDUCORE GLOBAL TECH ACADEMY • VERIFIED CERTIFICATE
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
                      Chứng Nhận Tốt Nghiệp
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-400 italic">
                    Hội đồng Đào tạo và Khảo thí Công nghệ EduCore Academy trân trọng trao tặng chứng chỉ này cho:
                  </p>

                  <div className="py-2 border-b-2 border-emerald-500/60 inline-block px-8">
                    <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-wide">
                      {fullName}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-lg mx-auto">
                    Đã hoàn thành xuất sắc chương trình đào tạo chuyên sâu và vượt qua kỳ sát hạch năng lực kỹ thuật:
                    <br />
                    <strong className="text-white">Next.js 14 Enterprise Architecture & Cloud Native Engineering</strong>
                  </p>

                  {/* Cryptographic metadata bar */}
                  <div className="pt-6 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs font-mono">
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase">Mã Chứng Chỉ:</div>
                      <div className="text-emerald-400 font-bold">EDU-2026-CERT-9842</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase">Ngày cấp:</div>
                      <div className="text-zinc-300">23 Tháng 10, 2026</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase">Verification Hash:</div>
                      <div className="text-zinc-400 truncate">SHA256: 8f4a...e7b2</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE FORM */}
        {activeTab === "profile" && (
          <div className="max-w-2xl rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 md:p-8 space-y-6 shadow-sm">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-xl font-bold text-primary">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                    ) : (
                      fullName[0]?.toUpperCase()
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-xs font-semibold gap-1"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold">{fullName}</h3>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setMediaPickerOpen(true)}
                    className="text-xs gap-1.5 h-8 mt-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Chọn ảnh từ Thư viện Media</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Địa chỉ Email (Cố định)</label>
                <Input value={user.email} disabled className="bg-muted/50 cursor-not-allowed text-xs font-mono" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Họ và tên hiển thị</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên của bạn"
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Đường dẫn Avatar</label>
                <Input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="text-xs font-mono"
                />
              </div>

              <Button type="submit" disabled={profilePending} variant="gradient" className="font-bold text-xs">
                {profilePending ? "Đang lưu thay đổi..." : "Cập nhật hồ sơ"}
              </Button>
            </form>
          </div>
        )}

        {/* TAB 3: PASSWORD */}
        {activeTab === "password" && (
          <div className="max-w-2xl rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 md:p-8 space-y-6 shadow-sm">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Mật khẩu hiện tại</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Mật khẩu mới</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Xác nhận mật khẩu mới</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="text-xs"
                />
              </div>

              <Button type="submit" disabled={passwordPending} variant="gradient" className="font-bold text-xs mt-2">
                {passwordPending ? "Đang cập nhật..." : "Đổi mật khẩu"}
              </Button>
            </form>
          </div>
        )}

        {/* TAB 4: BOOKMARKS */}
        {activeTab === "bookmarks" && (
          <div className="space-y-4">
            {bookmarks.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-dashed border-border p-8 bg-card/30 space-y-3">
                <Bookmark className="w-12 h-12 text-muted-foreground/40 mx-auto" />
                <h3 className="text-base font-bold text-foreground">Bạn chưa lưu nội dung nào</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Bấm biểu tượng Bookmark trên các khóa học để lưu lại danh sách cần xem sau.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarks.map((bm) => {
                  const meta = bm.metadata || {};
                  return (
                    <div
                      key={bm.id}
                      className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-4 flex flex-col justify-between space-y-3 hover:border-primary/50 transition-all shadow-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                            {bm.entityType}
                          </span>
                          <BookmarkButton
                            entityType={bm.entityType}
                            entityId={bm.entityId}
                            initialBookmarked={true}
                            metadata={meta}
                          />
                        </div>
                        <h4 className="font-bold text-sm text-foreground line-clamp-2">
                          {meta.title || "Nội dung đã lưu"}
                        </h4>
                      </div>

                      {meta.slug && (
                        <Link href={`/courses/${meta.slug}`}>
                          <Button size="sm" variant="outline" className="w-full text-xs font-semibold">
                            Xem chi tiết
                          </Button>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <MediaPickerModal
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={(url) => setAvatarUrl(url)}
      />
    </div>
  );
}
