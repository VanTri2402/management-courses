"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bulkUpdateSiteSettingsAction } from "@/server/actions/setting";
import { MediaPickerModal } from "@/components/shared/MediaPickerModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Image as ImageIcon,
  Globe,
  Sliders,
  ShieldCheck,
  Save,
  CheckCircle2,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

interface SettingsFormClientProps {
  groupedSettings: Record<string, any[]>;
}

export function SettingsFormClient({ groupedSettings }: SettingsFormClientProps) {
  const [activeTab, setActiveTab] = useState<"general" | "headerFooter" | "seo" | "system">("general");

  // Flatten settings into a key-value state map
  const initialMap: Record<string, any> = {};
  for (const group of Object.values(groupedSettings)) {
    for (const item of group) {
      initialMap[item.key] = item.value;
    }
  }

  const [formState, setFormState] = useState<Record<string, any>>(initialMap);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaTargetKey, setMediaTargetKey] = useState<string>("site_logo");

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = (key: string, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpenMediaPicker = (key: string) => {
    setMediaTargetKey(key);
    setMediaPickerOpen(true);
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const payload = Object.entries(formState).map(([key, value]) => ({
        key,
        value,
      }));

      const res = await bulkUpdateSiteSettingsAction({ settings: payload });

      if (res.success) {
        toast.success("Đã lưu toàn bộ cấu hình website! Cache 'layout-data' đã được revalidate.");
        router.refresh();
      } else {
        toast.error(res.error || "Không thể lưu cấu hình.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">
            Cấu Hình Hệ Thống & Toàn Cục
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Chỉnh sửa thương hiệu, Header/Footer, SEO mặc định và chế độ bảo trì hệ thống.
          </p>
        </div>

        <Button
          onClick={handleSaveAll}
          isLoading={isPending}
          disabled={isPending}
          className="font-bold gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Lưu thay đổi toàn bộ</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/60 space-x-6 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "general"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Thương hiệu & Thông tin chung</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("headerFooter")}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "headerFooter"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Header & Chân trang (Footer)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "seo"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>SEO & Mạng Xã Hội</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("system")}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "system"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wrench className="w-4 h-4 text-amber-400" />
          <span>Bảo trì & Vận hành</span>
        </button>
      </div>

      {/* Tab 1: General */}
      {activeTab === "general" && (
        <div className="max-w-3xl rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 md:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Tên website (site_name)</label>
            <Input
              value={formState.site_name || ""}
              onChange={(e) => handleChange("site_name", e.target.value)}
              placeholder="Enterprise Core"
            />
            <p className="text-[11px] text-muted-foreground">
              Tên thương hiệu xuất hiện trên Header, Footer, thẻ title SEO và email.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Khẩu hiệu / Slogan (site_tagline)</label>
            <Input
              value={formState.site_tagline || ""}
              onChange={(e) => handleChange("site_tagline", e.target.value)}
              placeholder="The Ultimate Awwwards-Standard Enterprise Next.js Architecture"
            />
          </div>

          {/* Logo Picker */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold">Logo Website (site_logo)</label>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl border border-border/80 bg-background flex items-center justify-center overflow-hidden">
                {formState.site_logo ? (
                  <img
                    src={formState.site_logo}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <Input
                  value={formState.site_logo || ""}
                  onChange={(e) => handleChange("site_logo", e.target.value)}
                  placeholder="https://... hoặc /uploads/..."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenMediaPicker("site_logo")}
                  className="text-xs gap-1.5 h-8 mt-1"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Chọn ảnh từ Media Library</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Header & Footer */}
      {activeTab === "headerFooter" && (
        <div className="max-w-3xl rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 md:p-8 space-y-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Văn bản nút Header CTA (header_cta_text)</label>
              <Input
                value={formState.header_cta_text || ""}
                onChange={(e) => handleChange("header_cta_text", e.target.value)}
                placeholder="Khám Phá Ngay"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Đường dẫn nút Header CTA (header_cta_url)</label>
              <Input
                value={formState.header_cta_url || ""}
                onChange={(e) => handleChange("header_cta_url", e.target.value)}
                placeholder="/#showcase"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Đoạn văn giới thiệu chân trang (footer_about)</label>
            <Textarea
              value={formState.footer_about || ""}
              onChange={(e) => handleChange("footer_about", e.target.value)}
              placeholder="Giới thiệu sứ mệnh hoặc điểm nổi bật của nền tảng..."
              rows={3}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Dòng bản quyền chân trang (footer_copyright)</label>
            <Input
              value={formState.footer_copyright || ""}
              onChange={(e) => handleChange("footer_copyright", e.target.value)}
              placeholder="© 2026 Enterprise Core. All rights reserved."
            />
          </div>
        </div>
      )}

      {/* Tab 3: SEO */}
      {activeTab === "seo" && (
        <div className="max-w-3xl rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 md:p-8 space-y-6 shadow-sm">
          <div className="space-y-2">
            <label className="text-xs font-semibold">Ảnh chia sẻ mạng xã hội OpenGraph (seo_default_image)</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-14 rounded-xl border border-border/80 bg-background flex items-center justify-center overflow-hidden">
                {formState.seo_default_image ? (
                  <img
                    src={formState.seo_default_image}
                    alt="SEO preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <Input
                  value={formState.seo_default_image || ""}
                  onChange={(e) => handleChange("seo_default_image", e.target.value)}
                  placeholder="https://..."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenMediaPicker("seo_default_image")}
                  className="text-xs gap-1.5 h-8 mt-1"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Chọn ảnh từ Media Library</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: System */}
      {activeTab === "system" && (
        <div className="max-w-3xl rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 md:p-8 space-y-6 shadow-sm">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              <span>Chế độ bảo trì hệ thống (maintenance_mode)</span>
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Khi bật chế độ bảo trì, mọi khách truy cập và người dùng thông thường sẽ tự động bị chuyển hướng sang trang <code>/maintenance</code>. Chỉ tài khoản <strong>SUPER_ADMIN</strong> và <strong>ADMIN</strong> mới có thể xem website.
            </p>
            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer font-bold text-xs text-foreground">
                <input
                  type="checkbox"
                  checked={Boolean(formState.maintenance_mode)}
                  onChange={(e) => handleChange("maintenance_mode", e.target.checked)}
                  className="w-4 h-4 rounded border-border text-amber-500 focus:ring-amber-500"
                />
                <span>Kích hoạt Chế độ Bảo trì (Maintenance Mode)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={(url) => handleChange(mediaTargetKey, url)}
        title="Chọn hình ảnh cho cấu hình"
      />
    </div>
  );
}
