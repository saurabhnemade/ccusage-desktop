import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({ title, value, subtitle, icon: Icon, trend }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon size={18} className="text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-bold text-card-foreground">{value}</p>
      {subtitle && (
        <p
          className={cn(
            "mt-1 text-xs",
            trend === "up"
              ? "text-destructive"
              : trend === "down"
                ? "text-success"
                : "text-muted-foreground"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
