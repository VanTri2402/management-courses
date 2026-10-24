"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Search,
  LayoutDashboard,
  Users,
  Image,
  Settings,
  Layers,
  Compass,
  Sparkles,
  Bookmark,
  ShieldAlert,
  GraduationCap,
  FolderTree,
  BookOpen,
  Award,
  Loader2,
  Bot,
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  url: string;
  type: "COURSE" | "CATEGORY" | "NAVIGATION";
}

interface CommandSearchProps {
  className?: string;
}

export function CommandSearch({ className = "" }: CommandSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [liveResults, setLiveResults] = useState<SearchResult[]>([]);
  const router = useRouter();

  const debouncedQuery = useDebounce(query, 300);

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch live search results
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setLiveResults([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setLiveResults(data.results || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLiveResults([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  const navigateTo = (path: string) => {
    setOpen(false);
    setQuery("");
    router.push(path);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-all ${className}`}
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Tìm kiếm khóa học...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-background text-[10px] font-mono text-muted-foreground shadow-2xs">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* CmdK Dialog Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-50 w-full max-w-xl rounded-2xl border border-border/80 bg-background/95 backdrop-blur-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <Command className="w-full">
              <div className="flex items-center border-b border-border/60 px-4 py-3">
                {loading ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin mr-3 flex-shrink-0" />
                ) : (
                  <Search className="w-4 h-4 text-muted-foreground mr-3 flex-shrink-0" />
                )}
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Nhập tên khóa học, chủ đề, hoặc phân hệ..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
                />
              </div>

              <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1">
                {/* Level 2 Breakthrough: AI Natural Language Intent Pill */}
                {query.trim().length > 1 && (
                  <Command.Item
                    onSelect={() => {
                      const event = new CustomEvent("educore:open-chat", {
                        detail: { query: query.trim() },
                      });
                      window.dispatchEvent(event);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-transparent border border-emerald-500/30 text-emerald-400 font-semibold cursor-pointer mb-2 hover:bg-emerald-500/25 transition-all"
                  >
                    <Bot className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                    <div className="flex-1 truncate text-xs sm:text-sm">
                      <span>Hỏi Trợ lý AI EduCore: </span>
                      <span className="text-white italic">&quot;{query}&quot;</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      Enter
                    </span>
                  </Command.Item>
                )}

                {liveResults.length > 0 && (
                  <Command.Group heading="Kết quả tìm kiếm phù hợp" className="text-[11px] font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wider">
                    {liveResults.map((item) => (
                      <Command.Item
                        key={`${item.type}-${item.id}`}
                        onSelect={() => navigateTo(item.url)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                      >
                        {item.type === "COURSE" && <BookOpen className="w-4 h-4 text-cyan-400" />}
                        {item.type === "CATEGORY" && <FolderTree className="w-4 h-4 text-indigo-400" />}
                        {item.type === "NAVIGATION" && <Compass className="w-4 h-4 text-muted-foreground" />}
                        <span className="truncate">{item.title}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* Default Navigation Items Group */}
                <Command.Group heading="Khám phá EduCore" className="text-[11px] font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wider">
                  <Command.Item
                    onSelect={() => navigateTo("/courses")}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <span>Tất cả Khóa học (Catalog & Bộ lọc)</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigateTo("/")}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span>Trang chủ EduCore (Storytelling)</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigateTo("/#roadmap")}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Lộ trình Nghề nghiệp Tech</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigateTo("/profile")}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <Bookmark className="w-4 h-4 text-rose-400" />
                    <span>Khóa học đã lưu & Chứng chỉ cá nhân</span>
                  </Command.Item>
                </Command.Group>

                {/* Admin Management Group */}
                <Command.Group heading="Khu vực Quản trị (Admin Area)" className="text-[11px] font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wider pt-2 border-t border-border/40">
                  <Command.Item
                    onSelect={() => navigateTo("/admin/courses")}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <GraduationCap className="w-4 h-4 text-cyan-400" />
                    <span>Quản lý Khóa học</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigateTo("/admin/categories")}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <FolderTree className="w-4 h-4 text-indigo-400" />
                    <span>Danh mục Khóa học</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigateTo("/admin/enrollments")}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Học viên & Tiến độ Ghi danh</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigateTo("/admin")}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                    <span>Dashboard Quản trị Tổng quan</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigateTo("/admin/menus")}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Quản lý Menu Header & Footer</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigateTo("/admin/settings")}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <Settings className="w-4 h-4 text-amber-400" />
                    <span>Cấu hình Hệ thống & SEO</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigateTo("/admin/media")}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <Image className="w-4 h-4 text-purple-400" />
                    <span>Thư viện Media & Tải lên</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigateTo("/admin/users")}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>Quản lý Người dùng & RBAC</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => navigateTo("/admin/audit-logs")}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>Nhật ký Kiểm toán (Audit Logs)</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>

              <div className="border-t border-border/60 px-4 py-2 text-right text-[11px] text-muted-foreground bg-muted/20">
                Nhấn <kbd className="px-1 py-0.5 rounded border border-border bg-background">ESC</kbd> để đóng
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
