import { z } from "zod";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { Role, SafeUser, ActionResponse } from "@/types";

export interface SafeActionConfig<TSchema extends z.ZodTypeAny> {
  schema?: TSchema;
  allowedRoles?: Role[];
  rateLimitConfig?: {
    limit?: number;
    windowMs?: number;
  };
  auditAction?: string;
  auditEntityType?: string;
}

export interface ActionContext {
  user: SafeUser | null;
  ip: string;
}

/**
 * Standard enterprise Server Action wrapper:
 * 1. Zod input validation
 * 2. Rate limiting check (by IP or authenticated User ID)
 * 3. Multi-layer RBAC authentication check
 * 4. Audit logging on success
 * 5. Structured ActionResponse<T> error handling
 */
export function createSafeAction<TSchema extends z.ZodTypeAny, TOutput>(
  config: SafeActionConfig<TSchema>,
  handler: (input: z.infer<TSchema>, ctx: ActionContext) => Promise<TOutput>
) {
  return async (rawInput?: z.infer<TSchema>): Promise<ActionResponse<TOutput>> => {
    try {
      // 1. Resolve client IP
      const headerList = headers();
      const ip =
        headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headerList.get("x-real-ip") ||
        "127.0.0.1";

      // 2. Fetch authenticated user (if any)
      const user = await getCurrentUser();

      // 3. Rate limiting check
      if (config.rateLimitConfig) {
        const rateLimitKey = user ? `usr_${user.id}` : `ip_${ip}`;
        const limitCheck = rateLimit(rateLimitKey, config.rateLimitConfig);

        if (!limitCheck.success) {
          return {
            success: false,
            error: "Bạn đang gửi quá nhiều yêu cầu. Vui lòng thử lại sau.",
            code: "RATE_LIMITED",
          };
        }
      }

      // 4. Role-based access control (RBAC)
      if (config.allowedRoles && config.allowedRoles.length > 0) {
        if (!user) {
          return {
            success: false,
            error: "Yêu cầu đăng nhập để thực hiện tác vụ này.",
            code: "UNAUTHORIZED",
          };
        }

        if (!config.allowedRoles.includes(user.role)) {
          return {
            success: false,
            error: "Bạn không có quyền thực hiện thao tác này.",
            code: "FORBIDDEN",
          };
        }
      }

      // 5. Zod schema validation
      let validatedInput = rawInput as z.infer<TSchema>;
      if (config.schema) {
        const parseResult = config.schema.safeParse(rawInput);
        if (!parseResult.success) {
          const formatted = parseResult.error.flatten().fieldErrors;
          return {
            success: false,
            error: "Dữ liệu nhập vào không hợp lệ.",
            code: "VALIDATION_ERROR",
            validationErrors: formatted as Record<string, string[]>,
          };
        }
        validatedInput = parseResult.data;
      }

      // 6. Execute business handler
      const result = await handler(validatedInput, { user, ip });

      // 7. Audit log recording if configured
      if (config.auditAction) {
        try {
          await db.auditLog.create({
            data: {
              actorId: user?.id || null,
              action: config.auditAction,
              entityType: config.auditEntityType || "SYSTEM",
              entityId: (result as any)?.id || null,
              newValues: typeof rawInput === "object" ? (rawInput as any) : undefined,
              ipAddress: ip,
            },
          });
        } catch (auditErr) {
          console.error("Failed to write audit log:", auditErr);
        }
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error("Action execution failed:", error);
      return {
        success: false,
        error: error?.message || "Đã xảy ra lỗi không mong muốn trên hệ thống.",
        code: "INTERNAL_ERROR",
      };
    }
  };
}
