"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SafeUser } from "@/types";
import { logoutAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import {
  User,
  LayoutDashboard,
  Bookmark,
  LogOut,
  Shield,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

interface UserMenuProps {
  user: SafeUser | null;
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    toast.success("Đã đăng xuất tài khoản thành công");
    await logoutAction();
    router.refresh();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="text-xs font-semibold">
            Đăng nhập
          </Button>
        </Link>
        <Link href="/register">
          <Button size="sm" className="text-xs font-semibold rounded-full px-4">
            Đăng ký
          </Button>
        </Link>
      </div>
    );
  }

  const isStaff =
    user.role === "SUPER_ADMIN" ||
    user.role === "ADMIN" ||
    user.role === "EDITOR";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-muted/60 transition-colors border border-border/60"
      >
        <div className="w-7 h-7 rounded-full bg-primary/15 text-primary border border-primary/30 flex items-center justify-center text-xs font-bold overflow-hidden">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            user.fullName[0]?.toUpperCase()
          )}
        </div>
        <span className="hidden md:inline text-xs font-medium max-w-[100px] truncate text-foreground">
          {user.fullName}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl z-50 p-1.5 divide-y divide-border/40 animate-in fade-in zoom-in-95">
          {/* User Info Header */}
          <div className="px-3 py-2.5">
            <p className="text-xs font-bold text-foreground truncate">
              {user.fullName}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {user.email}
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400">
                <Shield className="w-2.5 h-2.5" />
                {user.role}
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="py-1 space-y-0.5">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-muted/60 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Hồ sơ & Tài khoản</span>
            </Link>

            <Link
              href="/profile#bookmarks"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-foreground hover:bg-muted/60 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-rose-400" />
              <span>Bộ sưu tập đã lưu</span>
            </Link>

            {isStaff && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                <span>Bảng điều khiển Admin</span>
              </Link>
            )}
          </div>

          {/* Logout Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
