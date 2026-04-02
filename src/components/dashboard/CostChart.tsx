import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { DailyUsage } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  data: DailyUsage[];
}

export function CostChart({ data }: Props) {
  const chartData = [...data]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      date: d.date,
      label: formatDate(d.date),
      cost: d.totalCost,
    }));

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        Daily Cost Trend
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                fontSize: "0.8rem",
              }}
              formatter={(value) => [formatCurrency(Number(value)), "Cost"]}
              labelFormatter={(label) => label}
            />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#costGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
