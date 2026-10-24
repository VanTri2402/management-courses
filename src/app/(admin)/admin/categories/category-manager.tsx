"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/server/actions/course";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { MediaPickerModal } from "@/components/shared/MediaPickerModal";
import {
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  Image as ImageIcon,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

interface CategoryManagerClientProps {
  initialCategories: any[];
}

export function CategoryManagerClient({
  initialCategories,
}: CategoryManagerClientProps) {
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  // Media picker modal
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  // Confirm delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resetForm = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setIcon("");
    setThumbnail("");
    setSortOrder(categories.length + 1);
    setIsActive(true);
  };

  const handleOpenCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setIcon(cat.icon || "");
    setThumbnail(cat.thumbnail || "");
    setSortOrder(cat.sortOrder);
    setIsActive(cat.isActive);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim() || !slug.trim()) {
      toast.error("Vui lòng nhập đầy đủ tên và đường dẫn slug");
      return;
    }

    startTransition(async () => {
      try {
        if (editingCategory) {
          const res = await updateCategoryAction({
            id: editingCategory.id,
            name,
            slug,
            description,
            icon,
            thumbnail,
            sortOrder,
            isActive,
          });

          if (res.success && res.data) {
            setCategories((prev) =>
              prev.map((c) => (c.id === editingCategory.id ? { ...c, ...res.data } : c))
            );
            toast.success("Cập nhật danh mục thành công!");
            setDialogOpen(false);
            router.refresh();
          } else {
            toast.error(res.error || "Không thể cập nhật danh mục");
          }
        } else {
          const res = await createCategoryAction({
            name,
            slug,
            description,
            icon,
            thumbnail,
            sortOrder,
            isActive,
          });

          if (res.success && res.data) {
            setCategories((prev) => [...prev, { ...res.data, _count: { courses: 0 } }]);
            toast.success("Tạo danh mục mới thành công!");
            setDialogOpen(false);
            router.refresh();
          } else {
            toast.error(res.error || "Không thể tạo danh mục");
          }
        }
      } catch (err: any) {
        toast.error(err.message || "Đã xảy ra lỗi hệ thống");
      }
    });
  };

  const handleDelete = () => {
    if (!deletingId) return;

    startTransition(async () => {
      try {
        const res = await deleteCategoryAction({ id: deletingId });
        if (res.success) {
          setCategories((prev) => prev.filter((c) => c.id !== deletingId));
          toast.success("Xóa danh mục thành công!");
          setDeleteModalOpen(false);
          setDeletingId(null);
          router.refresh();
        } else {
          toast.error(res.error || "Không thể xóa danh mục");
        }
      } catch (err: any) {
        toast.error(err.message || "Lỗi khi xóa danh mục");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-primary" />
            <span>Quản Lý Danh Mục Khóa Học</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Tạo và cấu hình các lĩnh vực đào tạo công nghệ hiển thị trên thanh điều hướng và bộ lọc.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 font-bold shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Thêm danh mục mới</span>
        </Button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden p-5 flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-lg"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  Thứ tự: {cat.sortOrder}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    cat.isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {cat.isActive ? "Đang hiển thị" : "Tạm ẩn"}
                </span>
              </div>

              {cat.thumbnail && (
                <div className="aspect-video w-full rounded-xl overflow-hidden border border-border/60">
                  <img
                    src={cat.thumbnail}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-foreground">{cat.name}</h3>
                <span className="text-xs font-mono text-muted-foreground">/{cat.slug}</span>
                {cat.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>{cat._count?.courses || 0} khóa học</span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(cat)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setDeletingId(cat.id);
                    setDeleteModalOpen(true);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <div className="p-6 space-y-4 max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Chỉnh sửa danh mục" : "Tạo danh mục khóa học mới"}
            </DialogTitle>
            <DialogDescription>
              Điền các thông số danh mục để người học dễ dàng phân loại và tìm kiếm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Tên danh mục *</label>
              <Input
                placeholder="VD: Lập trình Web Fullstack"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingCategory) {
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "")
                    );
                  }
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Slug định danh *</label>
              <Input
                placeholder="VD: lap-trinh-web"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Mô tả ngắn</label>
              <Textarea
                rows={3}
                placeholder="Mô tả tóm tắt nội dung của lĩnh vực đào tạo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Ảnh đại diện (Thumbnail)</label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMediaPickerOpen(true)}
                  className="gap-1.5 flex-shrink-0"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Chọn ảnh</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Thứ tự hiển thị</label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="font-semibold text-foreground flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span>Kích hoạt hiển thị</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy bỏ
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Đang xử lý..." : editingCategory ? "Lưu thay đổi" : "Tạo danh mục"}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={(url) => {
          setThumbnail(url);
          setMediaPickerOpen(false);
        }}
        title="Chọn ảnh đại diện danh mục"
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Xác nhận xóa danh mục"
        description="Bạn có chắc chắn muốn xóa danh mục này? Hành động này sẽ bị chặn nếu danh mục vẫn đang chứa khóa học."
        onConfirm={handleDelete}
        isLoading={isPending}
      />
    </div>
  );
}
