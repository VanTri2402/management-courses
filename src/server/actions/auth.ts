"use server";

import { z } from "zod";
import crypto from "crypto";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/safe-action";
import {
  hashPassword,
  verifyPassword,
  signSessionToken,
  setSessionCookie,
  deleteSessionCookie,
  getCurrentUser,
} from "@/lib/auth";
import { sendPasswordResetEmail, sendWelcomeEmail } from "@/lib/mail";

// -----------------------------------------------------------------------------
// SCHEMAS
// -----------------------------------------------------------------------------

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const registerSchema = z.object({
  fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

const resetPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  token: z.string().min(1, "Token không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Họ tên quá ngắn"),
  avatarUrl: z.string().url("URL ảnh không hợp lệ").optional().or(z.literal("")),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
});

// -----------------------------------------------------------------------------
// ACTIONS
// -----------------------------------------------------------------------------

export const loginAction = createSafeAction(
  {
    schema: loginSchema,
    rateLimitConfig: { limit: 5, windowMs: 60 * 1000 },
    auditAction: "USER_LOGIN",
    auditEntityType: "USER",
  },
  async ({ email, password }) => {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new Error("Email hoặc mật khẩu không chính xác.");
    }

    if (user.status === "BANNED") {
      throw new Error("Tài khoản này đã bị khóa. Vui lòng liên hệ ban quản trị.");
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error("Email hoặc mật khẩu không chính xác.");
    }

    // Generate JWT token and set session cookie
    const token = await signSessionToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    await setSessionCookie(token);

    // Update lastLoginAt
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  }
);

export const registerAction = createSafeAction(
  {
    schema: registerSchema,
    rateLimitConfig: { limit: 5, windowMs: 60 * 1000 },
    auditAction: "USER_REGISTER",
    auditEntityType: "USER",
  },
  async ({ fullName, email, password }) => {
    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      throw new Error("Email này đã được sử dụng bởi tài khoản khác.");
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "USER",
        status: "ACTIVE",
      },
    });

    // Auto login after registration
    const token = await signSessionToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    await setSessionCookie(token);

    // Send welcome email asynchronously
    try {
      await sendWelcomeEmail(user.email, user.fullName);
    } catch (e) {
      console.warn("Failed to send welcome email:", e);
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  }
);

export const logoutAction = createSafeAction({}, async () => {
  await deleteSessionCookie();
  return { success: true };
});

export const forgotPasswordAction = createSafeAction(
  {
    schema: forgotPasswordSchema,
    rateLimitConfig: { limit: 3, windowMs: 60 * 1000 },
  },
  async ({ email }) => {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Return true to avoid user enumeration attacks
      return { success: true, message: "Nếu email tồn tại, liên kết khôi phục đã được gửi." };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.verificationToken.create({
      data: {
        identifier: user.email,
        token: resetToken,
        type: "PASSWORD_RESET",
        expiresAt,
        userId: user.id,
      },
    });

    await sendPasswordResetEmail(user.email, resetToken);

    return { success: true, message: "Nếu email tồn tại, liên kết khôi phục đã được gửi." };
  }
);

export const resetPasswordAction = createSafeAction(
  {
    schema: resetPasswordSchema,
    rateLimitConfig: { limit: 5, windowMs: 60 * 1000 },
    auditAction: "PASSWORD_RESET_SUCCESS",
    auditEntityType: "USER",
  },
  async ({ email, token, password }) => {
    const verification = await db.verificationToken.findFirst({
      where: {
        identifier: email.toLowerCase().trim(),
        token,
        type: "PASSWORD_RESET",
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      throw new Error("Mã khôi phục không hợp lệ hoặc đã hết hạn.");
    }

    const newPasswordHash = await hashPassword(password);

    await db.user.update({
      where: { email: email.toLowerCase().trim() },
      data: { passwordHash: newPasswordHash },
    });

    // Invalidate the used token
    await db.verificationToken.delete({
      where: { id: verification.id },
    });

    return { success: true };
  }
);

export const updateProfileAction = createSafeAction(
  {
    schema: updateProfileSchema,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"],
    auditAction: "UPDATE_PROFILE",
    auditEntityType: "USER",
  },
  async ({ fullName, avatarUrl }, { user }) => {
    if (!user) throw new Error("Chưa đăng nhập.");

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        fullName: fullName.trim(),
        avatarUrl: avatarUrl ? avatarUrl.trim() : null,
      },
    });

    return {
      id: updated.id,
      fullName: updated.fullName,
      avatarUrl: updated.avatarUrl,
    };
  }
);

export const changePasswordAction = createSafeAction(
  {
    schema: changePasswordSchema,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"],
    auditAction: "CHANGE_PASSWORD",
    auditEntityType: "USER",
  },
  async ({ currentPassword, newPassword }, { user }) => {
    if (!user) throw new Error("Chưa đăng nhập.");

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) throw new Error("Người dùng không tồn tại.");

    const isValid = await verifyPassword(currentPassword, dbUser.passwordHash);
    if (!isValid) {
      throw new Error("Mật khẩu hiện tại không chính xác.");
    }

    const newHash = await hashPassword(newPassword);

    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return { success: true };
  }
);
