"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadMediaFile } from "@/server/actions/media";
import { formatBytes } from "@/lib/utils";
import { UploadCloud, Search, Check, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface MediaPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string, asset?: any) => void;
  title?: string;
}

export function MediaPickerModal({
  open,
  onOpenChange,
  onSelect,
  title = "Chọn tệp từ Thư viện Media",
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);

  // Fetch library assets when dialog opens
  useEffect(() => {
    if (open) {
      loadAssets();
    }
  }, [open, search]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/media?search=${encodeURIComponent(search)}&limit=30`);
      if (res.ok) {
        const json = await res.json();
        setAssets(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load media assets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadMediaFile(formData);
      if (res.success && res.data) {
        toast.success("Tải tệp lên thành công!");
        setSelectedAsset(res.data);
        onSelect(res.data.fileUrl, res.data);
        onOpenChange(false);
      } else {
        toast.error(res.error || "Tải lên thất bại.");
      }
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi tải lên.");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmSelect = () => {
    if (selectedAsset) {
      onSelect(selectedAsset.fileUrl, selectedAsset);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          Chọn ảnh có sẵn từ thư viện hoặc tải lên hình ảnh mới cho hệ thống.
        </DialogDescription>
      </DialogHeader>

      {/* Tabs */}
      <div className="flex border-b border-border/60 mb-4 space-x-4">
        <button
          type="button"
          onClick={() => setActiveTab("library")}
          className={`pb-2.5 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "library"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Thư viện ảnh ({assets.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`pb-2.5 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "upload"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Tải tệp mới
        </button>
      </div>

      {activeTab === "library" ? (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên tập tin..."
              className="pl-9"
            />
          </div>

          <div className="max-h-[360px] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : assets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                Chưa có tập tin nào trong thư viện.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {assets.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`group relative aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all ${
                        isSelected
                          ? "ring-2 ring-primary border-primary shadow-lg"
                          : "border-border/60 hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={asset.fileUrl}
                        alt={asset.fileName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 p-1 bg-black/60 backdrop-blur-xs text-[10px] text-white truncate text-center">
                        {asset.fileName}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <div className="text-xs text-muted-foreground">
              {selectedAsset ? (
                <span>
                  Đã chọn: <strong>{selectedAsset.fileName}</strong> ({formatBytes(selectedAsset.fileSize)})
                </span>
              ) : (
                "Nhấp vào một ảnh để chọn"
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button disabled={!selectedAsset} onClick={handleConfirmSelect}>
                Áp dụng
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors relative cursor-pointer">
          <input
            type="file"
            accept="image/*,video/*"
            disabled={uploading}
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          {uploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-medium">Đang tải tệp lên...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold">Kéo thả hoặc nhấp để chọn tệp</p>
              <p className="text-xs text-muted-foreground">
                Hỗ trợ ảnh PNG, JPG, WEBP, GIF tối đa 10MB
              </p>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}
