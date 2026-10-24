"use client";

import React, { useState } from "react";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { ShieldAlert, Code2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuditLogsClientProps {
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

export function AuditLogsClient({ initialResult }: AuditLogsClientProps) {
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const columns: ColumnDef<any>[] = [
    {
      key: "action",
      header: "Hành động (Action)",
      render: (log) => (
        <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-1 rounded-md">
          {log.action}
        </span>
      ),
    },
    {
      key: "entityType",
      header: "Thực thể",
      render: (log) => (
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-foreground">
            {log.entityType}
          </span>
          {log.entityId && (
            <div className="text-[10px] text-muted-foreground font-mono">
              ID: {log.entityId}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actor",
      header: "Người thực hiện (Actor)",
      render: (log) => (
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-foreground">
            {log.actor?.fullName || "Hệ thống tự động"}
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            {log.actor?.email || "SYSTEM"} ({log.actor?.role || "SYSTEM"})
          </div>
        </div>
      ),
    },
    {
      key: "ipAddress",
      header: "IP Address",
      render: (log) => (
        <span className="text-xs font-mono text-muted-foreground">
          {log.ipAddress || "127.0.0.1"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Thời gian",
      render: (log) => (
        <span className="text-xs font-mono text-muted-foreground">
          {formatDate(log.createdAt)}
        </span>
      ),
    },
    {
      key: "details",
      header: "Chi tiết",
      className: "text-right",
      render: (log) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedLog(log)}
          className="h-7 text-xs gap-1"
        >
          <Eye className="w-3 h-3" />
          <span>Xem Payload</span>
        </Button>
      ),
    },
  ];

  const filterOptions = [
    { label: "Login", value: "USER_LOGIN" },
    { label: "Menu CRUD", value: "CREATE_NAVIGATION_ITEM" },
    { label: "Settings", value: "UPDATE_SITE_SETTING" },
    { label: "User Status", value: "UPDATE_USER_STATUS" },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-6">
        <h1 className="text-2xl font-black text-foreground">
          Nhật Ký Bảo Mật & Kiểm Toán (Audit Logs)
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Theo dõi toàn bộ lịch sử thao tác của quản trị viên và người dùng được ghi tự động qua <code>createSafeAction</code>.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={initialResult.data}
        total={initialResult.meta.total}
        page={initialResult.meta.page}
        limit={initialResult.meta.limit}
        searchPlaceholder="Tìm kiếm hành động, thực thể, địa chỉ IP..."
        filterParamName="action"
        filterOptions={filterOptions}
      />

      {/* JSON Payload Detail Dialog */}
      <Dialog
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
        className="max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" />
            <span>Chi tiết Payload Kiểm Toán</span>
          </DialogTitle>
          <DialogDescription>
            Hành động: <strong>{selectedLog?.action}</strong> | Thực thể: <strong>{selectedLog?.entityType}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {selectedLog?.newValues ? (
            <div className="space-y-1">
              <span className="text-xs font-bold text-foreground">Dữ liệu mới (New Values):</span>
              <pre className="p-3 rounded-xl bg-muted/60 border border-border/60 text-xs font-mono text-foreground overflow-x-auto">
                {JSON.stringify(selectedLog.newValues, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Không có payload dữ liệu kèm theo.
            </p>
          )}

          {selectedLog?.oldValues && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-foreground">Dữ liệu cũ (Old Values):</span>
              <pre className="p-3 rounded-xl bg-muted/60 border border-border/60 text-xs font-mono text-foreground overflow-x-auto">
                {JSON.stringify(selectedLog.oldValues, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
