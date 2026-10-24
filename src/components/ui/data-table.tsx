"use client";

import React, { useState, useEffect } from "react";
import { useUrlState } from "@/hooks/use-url-state";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  total: number;
  page: number;
  limit: number;
  searchPlaceholder?: string;
  filterParamName?: string;
  filterOptions?: FilterOption[];
  emptyMessage?: string;
  actions?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  total,
  page,
  limit,
  searchPlaceholder = "Tìm kiếm...",
  filterParamName,
  filterOptions,
  emptyMessage = "Không có dữ liệu phù hợp.",
  actions,
}: DataTableProps<T>) {
  const { getParam, setParam, setParams } = useUrlState();
  const [searchTerm, setSearchTerm] = useState(getParam("search", ""));
  const debouncedSearch = useDebounce(searchTerm, 350);

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearch !== getParam("search", "")) {
      setParams({ search: debouncedSearch || null, page: "1" });
    }
  }, [debouncedSearch]);

  const currentFilter = filterParamName ? getParam(filterParamName, "") : "";
  const totalPages = Math.ceil(total / limit) || 1;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setParam("page", String(newPage));
    }
  };

  const handleFilterClick = (value: string) => {
    if (!filterParamName) return;
    setParams({
      [filterParamName]: currentFilter === value ? null : value,
      page: "1",
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 bg-card"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {filterOptions && filterOptions.length > 0 && (
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/60">
              <span className="text-xs text-muted-foreground px-2 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Lọc:
              </span>
              <button
                type="button"
                onClick={() => handleFilterClick("")}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  !currentFilter
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Tất cả
              </button>
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleFilterClick(opt.value)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    currentFilter === opt.value
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {actions && <div className="ml-auto">{actions}</div>}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60 font-semibold">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={`px-4 py-3.5 ${col.className || ""}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={`px-4 py-3.5 ${col.className || ""}`}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground">
          <span>
            Hiển thị <strong>{data.length}</strong> / <strong>{total}</strong> bản ghi
          </span>

          <div className="flex items-center gap-1">
            <span>
              Trang <strong>{page}</strong> / <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center ml-2 space-x-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
