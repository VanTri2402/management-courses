import React from "react";
import { getUsersList } from "@/server/queries/users";
import { UsersManagerClient } from "./users-client";
import { Role, UserStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface UsersAdminPageProps {
  searchParams: {
    page?: string;
    search?: string;
    role?: string;
    status?: string;
  };
}

export default async function UsersAdminPage({ searchParams }: UsersAdminPageProps) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const role = (searchParams.role as Role) || undefined;
  const status = (searchParams.status as UserStatus) || undefined;

  const result = await getUsersList({ page, limit: 10, search, role, status });

  return <UsersManagerClient initialResult={result} />;
}
