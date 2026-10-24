"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MenuLocation, Role } from "@prisma/client";
import {
  createNavigationItemAction,
  updateNavigationItemAction,
  deleteNavigationItemAction,
  toggleNavigationItemActiveAction,
} from "@/server/actions/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
  ArrowUpDown,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

interface MenuManagerClientProps {
  initialItems: any[];
  parentCandidates: any[];
}

export function MenuManagerClient({
  initialItems,
  parentCandidates,
}: MenuManagerClientProps) {
  const [items, setItems] = useState<any[]>(initialItems);
  const [selectedLocation, setSelectedLocation] = useState<MenuLocation>(
    MenuLocation.HEADER_MAIN
  );

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slugOrUrl, setSlugOrUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [location, setLocation] = useState<MenuLocation>(MenuLocation.HEADER_MAIN);
  const [parentId, setParentId] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isExternal, setIsExternal] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [requiredRole, setRequiredRole] = useState<string>("");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const resetForm = () => {
    setEditingItem(null);
    setTitle("");
    setSlugOrUrl("");
    setIcon("");
    setBadgeText("");
    setLocation(selectedLocation);
    setParentId("");
    setSortOrder(0);
    setIsExternal(false);
    setIsActive(true);
    setRequiredRole("");
  };

  const handleOpenAdd = () => {
    resetForm();
    setLocation(selectedLocation);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setTitle(item.title);
    setSlugOrUrl(item.slugOrUrl);
    setIcon(item.icon || "");
    setBadgeText(item.badgeText || "");
    setLocation(item.location);
    setParentId(item.parentId || "");
    setSortOrder(item.sortOrder);
    setIsExternal(item.isExternal);
    setIsActive(item.isActive);
    setRequiredRole(item.requiredRole || "");
    setIsDialogOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      if (editingItem) {
        const res = await updateNavigationItemAction({
          id: editingItem.id,
          title,
          slugOrUrl,
          icon: icon || null,
          badgeText: badgeText || null,
          location,
          parentId: parentId || null,
          sortOrder,
          isExternal,
          isActive,
          requiredRole: (requiredRole as Role) || null,
        });

        if (res.success && res.data) {
          toast.success("Cập nhật menu thành công! Layout cache đã được làm mới.");
          setItems(items.map((i) => (i.id === editingItem.id ? res.data : i)));
          setIsDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Không thể cập nhật menu.");
        }
      } else {
        const res = await createNavigationItemAction({
          title,
          slugOrUrl,
          icon: icon || null,
          badgeText: badgeText || null,
          location,
          parentId: parentId || null,
          sortOrder,
          isExternal,
          isActive,
          requiredRole: (requiredRole as Role) || null,
        });

        if (res.success && res.data) {
          toast.success("Tạo mục menu mới thành công! Layout cache đã được làm mới.");
          setItems([...items, res.data]);
          setIsDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Không thể tạo menu.");
        }
      }
    });
  };

  const handleToggleActive = (item: any) => {
    const nextState = !item.isActive;
    startTransition(async () => {
      const res = await toggleNavigationItemActiveAction({
        id: item.id,
        isActive: nextState,
      });

      if (res.success) {
        toast.success(`Đã ${nextState ? "kích hoạt" : "ẩn"} mục menu.`);
        setItems(items.map((i) => (i.id === item.id ? { ...i, isActive: nextState } : i)));
        router.refresh();
      } else {
        toast.error("Không thể thay đổi trạng thái.");
      }
    });
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    startTransition(async () => {
      const res = await deleteNavigationItemAction({ id: itemToDelete });
      if (res.success) {
        toast.success("Đã xóa mục menu. Layout cache đã được làm mới.");
        setItems(items.filter((i) => i.id !== itemToDelete));
        setDeleteModalOpen(false);
        setItemToDelete(null);
        router.refresh();
      } else {
        toast.error(res.error || "Không thể xóa menu.");
      }
    });
  };

  const filteredItems = items.filter((i) => i.location === selectedLocation);

  const locationsList: { label: string; value: MenuLocation }[] = [
    { label: "Header Chính (HEADER_MAIN)", value: MenuLocation.HEADER_MAIN },
    { label: "Header Phụ (HEADER_UTILITY)", value: MenuLocation.HEADER_UTILITY },
    { label: "Footer Cột 1 (FOOTER_COL_1)", value: MenuLocation.FOOTER_COL_1 },
    { label: "Footer Cột 2 (FOOTER_COL_2)", value: MenuLocation.FOOTER_COL_2 },
    { label: "Footer Cột 3 (FOOTER_COL_3)", value: MenuLocation.FOOTER_COL_3 },
    { label: "Footer Chân (FOOTER_BOTTOM)", value: MenuLocation.FOOTER_BOTTOM },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">
            Quản Lý Menu Header & Footer (CRUD)
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Mọi chỉnh sửa tại đây tự động kích hoạt <code>revalidateTag(&apos;layout-data&apos;)</code> để cập nhật ngoài trang chủ ngay lập tức.
          </p>
        </div>

        <Button onClick={handleOpenAdd} className="font-bold gap-2">
          <Plus className="w-4 h-4" />
          <span>Thêm mục menu mới</span>
        </Button>
      </div>

      {/* Location Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-border/60">
        {locationsList.map((loc) => (
          <button
            key={loc.value}
            type="button"
            onClick={() => setSelectedLocation(loc.value)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedLocation === loc.value
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            {loc.label}
          </button>
        ))}
      </div>

      {/* Items Table */}
      <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60 font-semibold">
              <tr>
                <th className="px-4 py-3.5">Thứ tự</th>
                <th className="px-4 py-3.5">Tiêu đề menu</th>
                <th className="px-4 py-3.5">Đường dẫn (Slug/URL)</th>
                <th className="px-4 py-3.5">Menu cha</th>
                <th className="px-4 py-3.5">Huy hiệu</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="px-4 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-xs">
                    Chưa có mục menu nào trong khu vực này. Nhấn &quot;Thêm mục menu mới&quot; để tạo.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                      #{item.sortOrder}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.isExternal && (
                          <span title="Mở tab mới">
                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                          </span>
                        )}
                        {item.requiredRole && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 font-mono">
                            {item.requiredRole}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-primary truncate max-w-xs">
                      {item.slugOrUrl}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {item.parent?.title || "— (Cấp gốc)"}
                    </td>
                    <td className="px-4 py-3.5">
                      {item.badgeText ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400">
                          {item.badgeText}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          item.isActive
                            ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {item.isActive ? (
                          <>
                            <Eye className="w-3 h-3" /> Hiển thị
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Đang ẩn
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(item)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setItemToDelete(item.id);
                            setDeleteModalOpen(true);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Chỉnh sửa mục Menu" : "Thêm mục Menu mới"}
          </DialogTitle>
          <DialogDescription>
            Thiết lập tiêu đề, đường dẫn, vị trí và cấp bậc phân cấp cho menu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Tiêu đề hiển thị</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Trang chủ, Sản phẩm, Bảng giá"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Đường dẫn liên kết (Slug hoặc Full URL)</label>
            <Input
              value={slugOrUrl}
              onChange={(e) => setSlugOrUrl(e.target.value)}
              placeholder="VD: /products, /#features, https://..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Vị trí hiển thị</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as MenuLocation)}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs"
              >
                {locationsList.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Menu Cha (Tạo Dropdown)</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs"
              >
                <option value="">— Không có (Cấp gốc) —</option>
                {parentCandidates
                  .filter((p) => !editingItem || p.id !== editingItem.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.location})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Thứ tự sắp xếp (sortOrder)</label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                placeholder="0"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Huy hiệu (Badge Text)</label>
              <Input
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="VD: Mới, Hot, Pro"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Yêu cầu quyền hạn (Tùy chọn)</label>
              <select
                value={requiredRole}
                onChange={(e) => setRequiredRole(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-xs"
              >
                <option value="">Công khai (Tất cả)</option>
                <option value="USER">Chỉ User đã đăng nhập</option>
                <option value="EDITOR">Editor trở lên</option>
                <option value="ADMIN">Admin trở lên</option>
                <option value="SUPER_ADMIN">Chỉ Super Admin</option>
              </select>
            </div>

            <div className="space-y-2 pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                <input
                  type="checkbox"
                  checked={isExternal}
                  onChange={(e) => setIsExternal(e.target.checked)}
                  className="rounded border-border text-primary"
                />
                <span>Mở trong tab mới (External)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-border text-primary"
                />
                <span>Kích hoạt hiển thị (Active)</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" isLoading={isPending} disabled={isPending}>
              {editingItem ? "Cập nhật mục menu" : "Tạo mục menu"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="Xóa mục Menu này?"
        description="Mục menu này và các mục con (nếu có) sẽ bị xóa vĩnh viễn khỏi thanh điều hướng."
        onConfirm={handleDelete}
        isLoading={isPending}
      />
    </div>
  );
}
