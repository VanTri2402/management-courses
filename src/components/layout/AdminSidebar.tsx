"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";
import {
  LayoutDashboard,
  MenuSquare,
  Settings,
  Image,
  Users,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  GraduationCap,
  FolderTree,
  Award,
  Shield,
} from "lucide-react";

interface AdminSidebarProps {
  role?: Role;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  allowedRoles?: Role[];
}

const navItems: NavItem[] = [
  {
    title: "Tổng quan Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Quản lý Khóa học",
    href: "/admin/courses",
    icon: GraduationCap,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "EDITOR"],
  },
  {
    title: "Danh mục Khóa học",
    href: "/admin/categories",
    icon: FolderTree,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  },
  {
    title: "Học viên & Ghi danh",
    href: "/admin/enrollments",
    icon: Award,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  },
  {
    title: "Thư viện Media Asset",
    href: "/admin/media",
    icon: Image,
    allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "EDITOR"],
  },
  {
    title: "Header & Footer CRUD",
    href: "/admin/menus",
    icon: MenuSquare,
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Cấu hình Website",
    href: "/admin/settings",
    icon: Settings,
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Người dùng & RBAC",
    href: "/admin/users",
    icon: Users,
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    title: "Nhật ký Kiểm toán",
    href: "/admin/audit-logs",
    icon: ShieldAlert,
    allowedRoles: ["SUPER_ADMIN", "ADMIN"],
  },
];

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter((item) => {
    if (!item.allowedRoles || !role) return true;
    return item.allowedRoles.includes(role);
  });

  return (
    <aside className="w-64 border-r border-border/80 bg-card/60 backdrop-blur-xl flex flex-col justify-between p-4 min-h-screen">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-3 py-2 border-b border-border/60 pb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-foreground tracking-tight">
              EduCore Admin
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                Center
              </span>
              {role && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary font-bold">
                  {role}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {visibleItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Back link */}
      <div className="pt-4 border-t border-border/60">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang Public</span>
        </Link>
      </div>
    </aside>
  );
}
