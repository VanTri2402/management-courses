import React from "react";
import { getAdminEnrollments } from "@/server/queries/courses";
import { formatDate } from "@/lib/utils";
import {
  Award,
  Users,
  CheckCircle2,
  Clock,
  BookOpen,
  GraduationCap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminEnrollmentsPage() {
  const enrollments = await getAdminEnrollments();

  const totalEnrollments = enrollments.length;
  const completedCount = enrollments.filter((e) => e.status === "COMPLETED").length;
  const inProgressCount = totalEnrollments - completedCount;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            <span>Quản Lý Học Viên & Tiến Độ Ghi Danh</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Theo dõi danh sách học viên, tiến độ hoàn thành các khóa học và chứng chỉ tốt nghiệp đã cấp.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Tổng lượt ghi danh</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground mt-2">{totalEnrollments}</div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Đã tốt nghiệp (100%)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{completedCount}</div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Đang học tập</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-2">{inProgressCount}</div>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">Học viên</th>
                <th className="py-3 px-4">Khóa học ghi danh</th>
                <th className="py-3 px-4">Tiến độ</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Chứng chỉ</th>
                <th className="py-3 px-4 text-right">Ngày ghi danh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {enrollments.map((enr) => (
                <tr key={enr.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      {enr.user.avatarUrl ? (
                        <img
                          src={enr.user.avatarUrl}
                          alt={enr.user.fullName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {enr.user.fullName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-foreground">{enr.user.fullName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {enr.user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-foreground max-w-xs truncate">
                    {enr.course.title}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-1 w-28">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span>{Math.round(enr.progressPercent)}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${Math.min(enr.progressPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        enr.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      }`}
                    >
                      {enr.status === "COMPLETED" ? "Đã hoàn thành" : "Đang học"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {enr.certificates && enr.certificates.length > 0 ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <Award className="w-3 h-3" />
                        <span>{enr.certificates[0].certificateCode}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right text-muted-foreground font-mono">
                    {formatDate(enr.enrolledAt)}
                  </td>
                </tr>
              ))}

              {enrollments.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    Chưa có học viên nào ghi danh khóa học.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
