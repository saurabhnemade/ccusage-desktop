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
import { useWeeklyUsage } from "@/hooks/useUsageData";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ModelBreakdownDetail } from "@/components/ui/ModelBreakdownDetail";
import { TimeRangeSelect } from "@/components/ui/TimeRangeSelect";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import {
  formatCurrency,
  formatTokens,
  formatDateFull,
  sinceDate,
} from "@/lib/utils";
import type { WeeklyUsage, TimeRange } from "@/lib/types";

const columns: Column<WeeklyUsage>[] = [
  {
    key: "week",
    header: "Week Starting",
    render: (r) => <span className="font-medium text-foreground">{formatDateFull(r.week)}</span>,
    sortValue: (r) => r.week,
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

export function WeeklyView() {
  const [range, setRange] = useState<TimeRange>("90d");
  const since = sinceDate(range);
  const { data, isLoading, error } = useWeeklyUsage({ since: since || undefined });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={String(error)} />;

  const chartData = [...(data ?? [])]
    .sort((a, b) => a.week.localeCompare(b.week))
    .map((d) => ({ week: formatDateFull(d.week), cost: d.totalCost }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Weekly Usage</h1>
        <TimeRangeSelect value={range} onChange={setRange} />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="week"
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
              <Bar dataKey="cost" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <DataTable
        data={data ?? []}
        columns={columns}
        rowKey={(r) => r.week}
        expandable={(r) => <ModelBreakdownDetail breakdowns={r.modelBreakdowns} />}
      />
    </div>
  );
}
