"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Role, UserStatus } from "@prisma/client";
import { updateUserRoleAction, updateUserStatusAction } from "@/server/actions/user";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils";
import { Shield, ShieldAlert, CheckCircle2, Ban } from "lucide-react";
import { toast } from "sonner";

interface UsersManagerClientProps {
  initialResult: {
    data: any[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export function UsersManagerClient({ initialResult }: UsersManagerClientProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRoleChange = (userId: string, newRole: Role) => {
    startTransition(async () => {
      const res = await updateUserRoleAction({ userId, role: newRole });
      if (res.success) {
        toast.success(`Đã cập nhật vai trò thành công: ${newRole}`);
        router.refresh();
      } else {
        toast.error(res.error || "Không thể thay đổi vai trò.");
      }
    });
  };

  const handleToggleStatus = (userId: string, currentStatus: UserStatus) => {
    const nextStatus = currentStatus === "ACTIVE" ? UserStatus.BANNED : UserStatus.ACTIVE;
    startTransition(async () => {
      const res = await updateUserStatusAction({ userId, status: nextStatus });
      if (res.success) {
        toast.success(
          `Tài khoản đã được ${nextStatus === "ACTIVE" ? "mở khóa" : "khóa thành công"}.`
        );
        router.refresh();
      } else {
        toast.error(res.error || "Không thể thay đổi trạng thái.");
      }
    });
  };

  const columns: ColumnDef<any>[] = [
    {
      key: "fullName",
      header: "Thành viên",
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              user.fullName[0]?.toUpperCase()
            )}
          </div>
          <div>
            <div className="font-bold text-xs text-foreground">{user.fullName}</div>
            <div className="text-[11px] text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Vai trò (RBAC)",
      render: (user) => (
        <select
          value={user.role}
          disabled={isPending || user.role === "SUPER_ADMIN"}
          onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
          className="h-8 rounded-lg border border-input bg-background px-2 text-xs font-mono font-medium focus:ring-1 focus:ring-primary"
        >
          <option value="USER">USER (Học viên)</option>
          <option value="MANAGER">MANAGER (Quản lý nghiệp vụ)</option>
          <option value="EDITOR">EDITOR (Biên tập)</option>
          <option value="ADMIN">ADMIN (Quản trị)</option>
          <option value="SUPER_ADMIN" disabled>
            SUPER_ADMIN (Tối cao)
          </option>
        </select>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (user) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            user.status === "ACTIVE"
              ? "bg-emerald-500/15 text-emerald-400"
              : user.status === "BANNED"
              ? "bg-rose-500/15 text-rose-400"
              : "bg-amber-500/15 text-amber-400"
          }`}
        >
          {user.status === "ACTIVE" ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <Ban className="w-3 h-3" />
          )}
          {user.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Ngày tham gia",
      render: (user) => (
        <span className="text-xs text-muted-foreground font-mono">
          {formatDate(user.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "text-right",
      render: (user) => {
        if (user.role === "SUPER_ADMIN") {
          return <span className="text-xs text-muted-foreground font-mono">Cố định</span>;
        }

        return (
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleToggleStatus(user.id, user.status)}
            className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors ${
              user.status === "ACTIVE"
                ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            {user.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
          </button>
        );
      },
    },
  ];

  const filterOptions = [
    { label: "Admin", value: "ADMIN" },
    { label: "Editor", value: "EDITOR" },
    { label: "User", value: "USER" },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-6">
        <h1 className="text-2xl font-black text-foreground">
          Quản Trị Người Dùng & Phân Quyền (RBAC)
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Quản lý tài khoản thành viên, phân quyền đa tầng và kiểm soát trạng thái hoạt động.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={initialResult.data}
        total={initialResult.meta.total}
        page={initialResult.meta.page}
        limit={initialResult.meta.limit}
        searchPlaceholder="Tìm kiếm người dùng theo tên hoặc email..."
        filterParamName="role"
        filterOptions={filterOptions}
      />
    </div>
  );
}
