import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => number | string;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  expandable?: (row: T) => React.ReactNode;
}

export function DataTable<T>({ data, columns, rowKey, expandable }: Props<T>) {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const sorted = useMemo(() => {
    if (!sortCol) return data;
    const col = columns.find((c) => c.key === sortCol);
    if (!col?.sortValue) return data;
    return [...data].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, columns, sortCol, sortDir]);

  const toggleSort = (key: string) => {
    if (sortCol === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-xs font-medium text-muted-foreground",
                  col.align === "right" ? "text-right" : "text-left",
                  col.sortValue && "cursor-pointer select-none hover:text-foreground"
                )}
                onClick={() => col.sortValue && toggleSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {sortCol === col.key &&
                    (sortDir === "asc" ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    ))}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const key = rowKey(row);
            const isExpanded = expandedRow === key;
            return (
              <tr key={key}>
                <td colSpan={columns.length} className="p-0">
                  <div
                    className={cn(
                      "flex border-b border-border/50 last:border-0",
                      expandable && "cursor-pointer hover:bg-muted/50"
                    )}
                    onClick={() =>
                      expandable &&
                      setExpandedRow(isExpanded ? null : key)
                    }
                  >
                    {columns.map((col) => (
                      <div
                        key={col.key}
                        className={cn(
                          "flex-1 px-4 py-2.5",
                          col.align === "right" && "text-right"
                        )}
                      >
                        {col.render(row)}
                      </div>
                    ))}
                  </div>
                  {expandable && isExpanded && (
                    <div className="border-b border-border/50 bg-muted/30 px-4 py-3">
                      {expandable(row)}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
          {sorted.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="py-8 text-center text-muted-foreground"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
