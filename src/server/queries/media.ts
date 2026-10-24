import { db } from "@/lib/db";
import { FileType } from "@prisma/client";

export interface GetMediaOptions {
  page?: number;
  limit?: number;
  search?: string;
  fileType?: FileType;
}

export async function getMediaAssets(options: GetMediaOptions = {}) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, options.limit || 24);
  const skip = (page - 1) * limit;

  const where: any = {};
  if (options.fileType) {
    where.fileType = options.fileType;
  }
  if (options.search) {
    where.OR = [
      { fileName: { contains: options.search, mode: "insensitive" } },
      { altText: { contains: options.search, mode: "insensitive" } },
    ];
  }

  try {
    const [total, assets] = await Promise.all([
      db.mediaAsset.count({ where }),
      db.mediaAsset.findMany({
        where,
        include: {
          uploadedBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: assets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (e) {
    return {
      data: [],
      meta: { total: 0, page: 1, limit, totalPages: 0 },
    };
  }
}
