import type { TimeRange } from "@/lib/types";
import { cn } from "@/lib/utils";

const options: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" },
];

interface Props {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
}

export function TimeRangeSelect({ value, onChange }: Props) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
