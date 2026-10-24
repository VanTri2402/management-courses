import { NextRequest, NextResponse } from "next/server";
import { getMediaAssets } from "@/server/queries/media";
import { FileType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 24;
    const search = searchParams.get("search") || undefined;
    const fileType = (searchParams.get("fileType") as FileType) || undefined;

    const data = await getMediaAssets({ page, limit, search, fileType });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
