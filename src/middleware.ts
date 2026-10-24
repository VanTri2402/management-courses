import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "enterprise_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-key-32-characters-minimum-enterprise-boilerplate"
);

interface TokenPayload {
  sub: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EDITOR" | "USER";
}

async function getSessionFromRequest(req: NextRequest): Promise<TokenPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as unknown as TokenPayload;
  } catch (e) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getSessionFromRequest(req);

  // Check Maintenance Mode (Environment Flag or Header)
  const isMaintenance = process.env.MAINTENANCE_MODE === "true";
  const isPrivileged = session?.role === "SUPER_ADMIN" || session?.role === "ADMIN";

  if (isMaintenance && !isPrivileged && !pathname.startsWith("/maintenance") && !pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/maintenance", req.url));
  }

  // Auth pages redirect if already authenticated
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Profile route requires any authenticated user
  if (pathname.startsWith("/profile")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role gate: USER role cannot access admin area
    if (session.role === "USER") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Role gate: MANAGER and EDITOR cannot access System configuration, Menus, Users or Audit Logs
    const isSystemAdminOnlyRoute =
      pathname.startsWith("/admin/users") ||
      pathname.startsWith("/admin/settings") ||
      pathname.startsWith("/admin/menus") ||
      pathname.startsWith("/admin/audit-logs");

    if (isSystemAdminOnlyRoute && (session.role === "MANAGER" || session.role === "EDITOR")) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/((?!_next/static|_next/image|favicon.ico|assets|uploads).*)",
  ],
};
