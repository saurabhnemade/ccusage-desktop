import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { DailyUsage } from "@/lib/types";
import {
  formatCurrency,
  getModelColor,
  getModelDisplayName,
} from "@/lib/utils";

interface Props {
  data: DailyUsage[];
}

export function ModelDonut({ data }: Props) {
  const modelCosts = new Map<string, number>();
  for (const day of data) {
    for (const mb of day.modelBreakdowns) {
      const name = getModelDisplayName(mb.modelName);
      modelCosts.set(name, (modelCosts.get(name) ?? 0) + mb.cost);
    }
  }

  const chartData = Array.from(modelCosts.entries())
    .map(([name, cost]) => ({ name, cost }))
    .sort((a, b) => b.cost - a.cost);

  const total = chartData.reduce((s, d) => s + d.cost, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        Model Breakdown
      </h3>
      <div className="flex items-center gap-6">
        <div className="h-48 w-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                dataKey="cost"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={getModelColor(entry.name)}
                    stroke="var(--color-card)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.5rem",
                  fontSize: "0.8rem",
                }}
                formatter={(value) => [formatCurrency(Number(value)), "Cost"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-2">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-sm">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: getModelColor(entry.name) }}
              />
              <span className="text-foreground font-medium">{entry.name}</span>
              <span className="text-muted-foreground">
                {formatCurrency(entry.cost)} (
                {total > 0 ? ((entry.cost / total) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
