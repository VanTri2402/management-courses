import { db } from "@/lib/db";
import { Role, UserStatus } from "@prisma/client";

export interface GetUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  status?: UserStatus;
}

export async function getUsersList(options: GetUsersOptions = {}) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, options.limit || 10);
  const skip = (page - 1) * limit;

  const where: any = {};
  if (options.role) where.role = options.role;
  if (options.status) where.status = options.status;
  if (options.search) {
    where.OR = [
      { fullName: { contains: options.search, mode: "insensitive" } },
      { email: { contains: options.search, mode: "insensitive" } },
    ];
  }

  try {
    const [total, users] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          role: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (e) {
    return { data: [], meta: { total: 0, page: 1, limit, totalPages: 0 } };
  }
}

export interface GetAuditLogsOptions {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
}

export async function getAuditLogs(options: GetAuditLogsOptions = {}) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, options.limit || 15);
  const skip = (page - 1) * limit;

  const where: any = {};
  if (options.action) where.action = options.action;
  if (options.search) {
    where.OR = [
      { action: { contains: options.search, mode: "insensitive" } },
      { entityType: { contains: options.search, mode: "insensitive" } },
      { ipAddress: { contains: options.search, mode: "insensitive" } },
    ];
  }

  try {
    const [total, logs] = await Promise.all([
      db.auditLog.count({ where }),
      db.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (e) {
    return { data: [], meta: { total: 0, page: 1, limit, totalPages: 0 } };
  }
}
