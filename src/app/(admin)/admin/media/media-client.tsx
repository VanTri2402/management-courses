"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadMediaFile, deleteMediaAssetAction } from "@/server/actions/media";
import { useUrlState } from "@/hooks/use-url-state";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { formatBytes, formatDate } from "@/lib/utils";
import {
  UploadCloud,
  Search,
  Copy,
  Trash2,
  Image as ImageIcon,
  Check,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface MediaManagerClientProps {
  initialResult: {
    data: any[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export function MediaManagerClient({ initialResult }: MediaManagerClientProps) {
  const { getParam, setParam } = useUrlState();
  const [searchTerm, setSearchTerm] = useState(getParam("search", ""));
  const debouncedSearch = useDebounce(searchTerm, 350);

  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  React.useEffect(() => {
    if (debouncedSearch !== getParam("search", "")) {
      setParam("search", debouncedSearch || null);
    }
  }, [debouncedSearch]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadMediaFile(formData);
      if (res.success) {
        toast.success("Tải tệp lên thành công!");
        router.refresh();
      } else {
        toast.error(res.error || "Tải lên thất bại.");
      }
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi.");
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    const fullUrl = url.startsWith("http")
      ? url
      : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast.success("Đã sao chép đường dẫn hình ảnh!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = () => {
    if (!assetToDelete) return;
    startTransition(async () => {
      const res = await deleteMediaAssetAction({ id: assetToDelete });
      if (res.success) {
        toast.success("Đã xóa tệp khỏi thư viện.");
        setDeleteModalOpen(false);
        setAssetToDelete(null);
        router.refresh();
      } else {
        toast.error(res.error || "Không thể xóa tệp.");
      }
    });
  };

  const { data: assets, meta } = initialResult;

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">
            Thư Viện Media Asset & Quản Lý Tệp
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Lưu trữ, tải lên và quản lý hình ảnh/video dùng chung cho toàn bộ hệ thống.
          </p>
        </div>

        {/* Upload Trigger Button */}
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*,video/*"
            disabled={uploading}
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs">
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            <span>{uploading ? "Đang tải lên..." : "Tải tệp mới lên"}</span>
          </div>
        </label>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm tệp theo tên..."
          className="pl-9 bg-card"
        />
      </div>

      {/* Grid of Media Assets */}
      {assets.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-border p-8 bg-card/30">
          <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-foreground">
            Chưa có tập tin nào trong thư viện
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Bấm nút &quot;Tải tệp mới lên&quot; ở góc phải để thêm hình ảnh đầu tiên.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="group rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all shadow-sm"
            >
              <div className="relative aspect-square overflow-hidden bg-muted/40">
                <img
                  src={asset.fileUrl}
                  alt={asset.fileName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(asset.fileUrl, asset.id)}
                    className="p-1.5 rounded-lg bg-black/70 text-white hover:bg-primary transition-colors backdrop-blur-xs"
                    title="Sao chép URL"
                  >
                    {copiedId === asset.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAssetToDelete(asset.id);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-black/70 text-white hover:bg-destructive transition-colors backdrop-blur-xs"
                    title="Xóa tệp"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3 space-y-1">
                <p className="font-semibold text-xs text-foreground truncate" title={asset.fileName}>
                  {asset.fileName}
                </p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span>{formatBytes(asset.fileSize)}</span>
                  <span>{asset.fileType}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Xóa tập tin này?"
        description="Tập tin này sẽ bị xóa khỏi cơ sở dữ liệu và thư mục lưu trữ."
        onConfirm={handleDelete}
        isLoading={isPending}
      />
    </div>
  );
}
