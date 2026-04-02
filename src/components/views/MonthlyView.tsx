import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useMonthlyUsage } from "@/hooks/useUsageData";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ModelBreakdownDetail } from "@/components/ui/ModelBreakdownDetail";
import { TimeRangeSelect } from "@/components/ui/TimeRangeSelect";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import {
  formatCurrency,
  formatTokens,
  formatMonth,
  sinceDate,
} from "@/lib/utils";
import type { MonthlyUsage, TimeRange } from "@/lib/types";

const columns: Column<MonthlyUsage>[] = [
  {
    key: "month",
    header: "Month",
    render: (r) => <span className="font-medium text-foreground">{formatMonth(r.month)}</span>,
    sortValue: (r) => r.month,
  },
  {
    key: "input",
    header: "Input",
    align: "right",
    render: (r) => <span className="text-muted-foreground">{formatTokens(r.inputTokens)}</span>,
    sortValue: (r) => r.inputTokens,
  },
  {
    key: "output",
    header: "Output",
    align: "right",
    render: (r) => <span className="text-muted-foreground">{formatTokens(r.outputTokens)}</span>,
    sortValue: (r) => r.outputTokens,
  },
  {
    key: "cacheWrite",
    header: "Cache Write",
    align: "right",
    render: (r) => <span className="text-muted-foreground">{formatTokens(r.cacheCreationTokens)}</span>,
    sortValue: (r) => r.cacheCreationTokens,
  },
  {
    key: "cacheRead",
    header: "Cache Read",
    align: "right",
    render: (r) => <span className="text-muted-foreground">{formatTokens(r.cacheReadTokens)}</span>,
    sortValue: (r) => r.cacheReadTokens,
  },
  {
    key: "models",
    header: "Models",
    render: (r) => (
      <span className="text-muted-foreground">
        {r.modelsUsed.map((m) => m.split("-")[1] || m).join(", ")}
      </span>
    ),
  },
  {
    key: "cost",
    header: "Cost",
    align: "right",
    render: (r) => <span className="font-mono font-medium text-foreground">{formatCurrency(r.totalCost)}</span>,
    sortValue: (r) => r.totalCost,
  },
];

export function MonthlyView() {
  const [range, setRange] = useState<TimeRange>("all");
  const since = sinceDate(range);
  const { data, isLoading, error } = useMonthlyUsage({ since: since || undefined });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={String(error)} />;

  const chartData = [...(data ?? [])]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((d) => ({ month: formatMonth(d.month), cost: d.totalCost }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Monthly Usage</h1>
        <TimeRangeSelect value={range} onChange={setRange} />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="month"
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
              />
              <Area
                type="monotone"
                dataKey="cost"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#monthlyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <DataTable
        data={data ?? []}
        columns={columns}
        rowKey={(r) => r.month}
        expandable={(r) => <ModelBreakdownDetail breakdowns={r.modelBreakdowns} />}
      />
    </div>
  );
}
