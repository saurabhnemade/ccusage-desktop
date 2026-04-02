import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useDailyUsage } from "@/hooks/useUsageData";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ModelBreakdownDetail } from "@/components/ui/ModelBreakdownDetail";
import { TimeRangeSelect } from "@/components/ui/TimeRangeSelect";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import {
  formatCurrency,
  formatTokens,
  formatDate,
  formatDateFull,
  sinceDate,
} from "@/lib/utils";
import type { DailyUsage, TimeRange } from "@/lib/types";

const columns: Column<DailyUsage>[] = [
  {
    key: "date",
    header: "Date",
    render: (r) => <span className="font-medium text-foreground">{formatDateFull(r.date)}</span>,
    sortValue: (r) => r.date,
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

export function DailyView() {
  const [range, setRange] = useState<TimeRange>("30d");
  const since = sinceDate(range);
  const { data, isLoading, error } = useDailyUsage({ since: since || undefined });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={String(error)} />;

  const chartData = [...(data ?? [])]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ date: d.date, label: formatDate(d.date), cost: d.totalCost }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Daily Usage</h1>
        <TimeRangeSelect value={range} onChange={setRange} />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
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
              />
              <Bar dataKey="cost" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <DataTable
        data={data ?? []}
        columns={columns}
        rowKey={(r) => r.date}
        expandable={(r) => <ModelBreakdownDetail breakdowns={r.modelBreakdowns} />}
      />
    </div>
  );
}
