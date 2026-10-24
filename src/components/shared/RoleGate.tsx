import React from "react";
import { Role } from "@prisma/client";
import { SafeUser } from "@/types";

interface RoleGateProps {
  user?: SafeUser | null;
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Layer 3 Security: Client-side / SSR UI Gatekeeper
 * Only renders children if the user possesses one of the allowed roles.
 */
export function RoleGate({
  user,
  allowedRoles,
  children,
  fallback = null,
}: RoleGateProps) {
  if (!user) return <>{fallback}</>;

  // SUPER_ADMIN has master override
  if (user.role === Role.SUPER_ADMIN || allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
