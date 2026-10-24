import React from "react";
import { getAuditLogs } from "@/server/queries/users";
import { AuditLogsClient } from "./audit-client";

export const dynamic = "force-dynamic";

interface AuditLogsPageProps {
  searchParams: {
    page?: string;
    search?: string;
    action?: string;
  };
}

export default async function AuditLogsAdminPage({ searchParams }: AuditLogsPageProps) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const action = searchParams.action || undefined;

  const result = await getAuditLogs({ page, limit: 15, search, action });

  return <AuditLogsClient initialResult={result} />;
}
