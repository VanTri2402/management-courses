import React from "react";
import { getMediaAssets } from "@/server/queries/media";
import { MediaManagerClient } from "./media-client";

export const dynamic = "force-dynamic";

interface MediaPageProps {
  searchParams: {
    page?: string;
    search?: string;
    fileType?: string;
  };
}

export default async function MediaAdminPage({ searchParams }: MediaPageProps) {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const fileType = (searchParams.fileType as any) || undefined;

  const result = await getMediaAssets({ page, limit: 20, search, fileType });

  return <MediaManagerClient initialResult={result} />;
}
