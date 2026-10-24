"use server";

import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { createSafeAction } from "@/lib/safe-action";
import { FileType } from "@prisma/client";
import { ActionResponse } from "@/types";

const createMediaSchema = z.object({
  fileName: z.string().min(1),
  fileUrl: z.string().min(1),
  fileType: z.nativeEnum(FileType).default(FileType.IMAGE),
  mimeType: z.string().min(1),
  fileSize: z.number().nonnegative(),
  altText: z.string().optional().nullable(),
});

export const createMediaAssetAction = createSafeAction(
  {
    schema: createMediaSchema,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
    auditAction: "CREATE_MEDIA_ASSET",
    auditEntityType: "MEDIA_ASSET",
  },
  async (input, { user }) => {
    return db.mediaAsset.create({
      data: {
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        fileType: input.fileType,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        altText: input.altText || null,
        uploadedById: user?.id || null,
      },
    });
  }
);

export const deleteMediaAssetAction = createSafeAction(
  {
    schema: z.object({ id: z.string().min(1) }),
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
    auditAction: "DELETE_MEDIA_ASSET",
    auditEntityType: "MEDIA_ASSET",
  },
  async ({ id }) => {
    const asset = await db.mediaAsset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new Error("Tập tin không tồn tại.");
    }

    // If local file, attempt to clean up file on disk
    if (asset.fileUrl.startsWith("/uploads/")) {
      try {
        const filePath = path.join(process.cwd(), "public", asset.fileUrl);
        await fs.unlink(filePath);
      } catch (e) {
        console.warn("Could not remove local file from disk:", e);
      }
    }

    await db.mediaAsset.delete({
      where: { id },
    });

    return { success: true, id };
  }
);

/**
 * Direct file upload handler via FormData
 */
export async function uploadMediaFile(formData: FormData): Promise<ActionResponse<any>> {
  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "Vui lòng chọn tập tin cần tải lên." };
    }

    // Limit size to 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { success: false, error: "Dung lượng tập tin vượt quá giới hạn 10MB." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name).toLowerCase();
    const safeName = `${crypto.randomUUID()}${ext}`;

    // Determine FileType
    let fileType: FileType = FileType.IMAGE;
    if (file.type.startsWith("video/")) {
      fileType = FileType.VIDEO;
    } else if (!file.type.startsWith("image/")) {
      fileType = FileType.DOCUMENT;
    }

    // Ensure upload directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Save to disk
    const targetPath = path.join(uploadsDir, safeName);
    await fs.writeFile(targetPath, buffer);

    const fileUrl = `/uploads/${safeName}`;

    // Record in DB
    const asset = await db.mediaAsset.create({
      data: {
        fileName: file.name,
        fileUrl,
        fileType,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        altText: file.name,
      },
    });

    return {
      success: true,
      data: asset,
    };
  } catch (error: any) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error?.message || "Không thể tải lên tập tin. Vui lòng thử lại.",
    };
  }
}
