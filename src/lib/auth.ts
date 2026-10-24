import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { Role, SafeUser } from "@/types";

const SESSION_COOKIE_NAME = "enterprise_session";
const JWT_SECRET_KEY = new TextEncoder().encode(env.JWT_SECRET);
const SESSION_EXPIRY_DAYS = 7;

export interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
  [key: string]: any;
}

/**
 * Hash a plain password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify plain password against hashed password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign a JWT session token using jose
 */
export async function signSessionToken(payload: { id: string; email: string; role: Role }): Promise<string> {
  return new SignJWT({
    sub: payload.id,
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRY_DAYS}d`)
    .sign(JWT_SECRET_KEY);
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return payload as unknown as TokenPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Set HttpOnly session cookie
 */
export async function setSessionCookie(token: string) {
  const cookieStore = cookies();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

/**
 * Delete HttpOnly session cookie
 */
export async function deleteSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get current authenticated user from cookie & database
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) return null;

    const payload = await verifySessionToken(sessionCookie);
    if (!payload?.sub) return null;

    const user = await db.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user || user.status === "BANNED") {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error retrieving current user:", error);
    return null;
  }
}

/**
 * Higher-order requirement: User must be authenticated
 */
export async function requireAuth(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

/**
 * Higher-order requirement: User must have one of the allowed roles
 */
export async function requireRole(allowedRoles: Role[]): Promise<SafeUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
