import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  onRowClick?: (row: T) => void;
  pageSize?: number;
  className?: string;
  emptyMessage?: string;
}

type SortDir = "asc" | "desc" | null;

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder = "Search...",
  searchKeys = [],
  onRowClick,
  pageSize = 10,
  className,
  emptyMessage = "No data found.",
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);

  const filtered = data.filter((row) => {
    if (!search.trim() || searchKeys.length === 0) return true;
    const q = search.toLowerCase();
    return searchKeys.some((key) => {
      const val = row[key];
      if (typeof val === "string") return val.toLowerCase().includes(q);
      if (typeof val === "number") return String(val).includes(q);
      return false;
    });
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === "string" && typeof bv === "string") {
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    if (typeof av === "number" && typeof bv === "number") {
      return sortDir === "asc" ? av - bv : bv - av;
    }
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey)
      return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />;
    if (sortDir === "asc")
      return <ChevronUp className="w-3.5 h-3.5 text-primary" />;
    return <ChevronDown className="w-3.5 h-3.5 text-primary" />;
  };

  if (isLoading)
    return (
      <LoadingSkeleton variant="table" rows={pageSize} cols={columns.length} />
    );

  return (
    <div className={cn("space-y-3", className)} data-ocid="data-table">
      {searchKeys.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 glass border-white/10 bg-white/5"
            data-ocid="data-table-search"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl glass border border-white/10">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "text-left",
                    col.width,
                    col.sortable &&
                      "cursor-pointer select-none hover:text-foreground transition-colors",
                  )}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                  onKeyDown={(e) =>
                    col.sortable &&
                    (e.key === "Enter" || e.key === " ") &&
                    handleSort(String(col.key))
                  }
                  tabIndex={col.sortable ? 0 : undefined}
                >
                  <div
                    className={cn(
                      "flex items-center gap-1.5",
                      col.align === "right"
                        ? "justify-end"
                        : col.align === "center"
                          ? "justify-center"
                          : "",
                    )}
                  >
                    {col.header}
                    {col.sortable && <SortIcon colKey={String(col.key)} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-muted-foreground text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={`row-${String(row.id ?? i)}`}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (
                      target.closest("button") ||
                      target.closest("a") ||
                      target.closest("input") ||
                      target.closest("select") ||
                      target.closest("textarea") ||
                      target.closest("[data-no-row-click]") ||
                      target.closest("[role='button']") ||
                      target.closest("label")
                    ) {
                      return;
                    }
                    e.stopPropagation();
                    onRowClick?.(row);
                  }}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && onRowClick?.(row)
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                  className={cn(
                    "transition-colors duration-150",
                    onRowClick && "cursor-pointer hover:bg-white/5",
                  )}
                  data-ocid={`data-table-row.${i + 1}`}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn(
                        "px-4 py-3 text-sm text-foreground",
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                            ? "text-center"
                            : "",
                      )}
                    >
                      {col.cell
                        ? col.cell(row)
                        : String(row[col.key as keyof T] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          className="flex items-center justify-between text-sm text-muted-foreground"
          data-ocid="data-table-pagination"
        >
          <span>
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pg = i + 1;
              return (
                <Button
                  key={`pg-${pg}`}
                  variant={page === pg ? "default" : "ghost"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setPage(pg)}
                >
                  {pg}
                </Button>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
