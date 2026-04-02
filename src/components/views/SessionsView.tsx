import { useState } from "react";
import { useSessionUsage } from "@/hooks/useUsageData";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ModelBreakdownDetail } from "@/components/ui/ModelBreakdownDetail";
import { TimeRangeSelect } from "@/components/ui/TimeRangeSelect";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import {
  formatCurrency,
  formatTokens,
  formatDateFull,
  extractProjectName,
  sinceDate,
} from "@/lib/utils";
import type { SessionUsage, TimeRange } from "@/lib/types";

const columns: Column<SessionUsage>[] = [
  {
    key: "project",
    header: "Project",
    render: (r) => (
      <span className="font-medium text-foreground" title={r.projectPath}>
        {extractProjectName(r.projectPath)}
      </span>
    ),
    sortValue: (r) => extractProjectName(r.projectPath),
  },
  {
    key: "sessionId",
    header: "Session",
    render: (r) => (
      <span className="font-mono text-xs text-muted-foreground">
        {r.sessionId.slice(0, 8)}
      </span>
    ),
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
    key: "lastActivity",
    header: "Last Active",
    align: "right",
    render: (r) => <span className="text-muted-foreground">{formatDateFull(r.lastActivity)}</span>,
    sortValue: (r) => r.lastActivity,
  },
  {
    key: "cost",
    header: "Cost",
    align: "right",
    render: (r) => <span className="font-mono font-medium text-foreground">{formatCurrency(r.totalCost)}</span>,
    sortValue: (r) => r.totalCost,
  },
];

export function SessionsView() {
  const [range, setRange] = useState<TimeRange>("30d");
  const since = sinceDate(range);
  const { data, isLoading, error } = useSessionUsage({ since: since || undefined });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={String(error)} />;

  const totalCost = (data ?? []).reduce((s, d) => s + d.totalCost, 0);
  const totalSessions = data?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sessions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalSessions} sessions &middot; {formatCurrency(totalCost)} total
          </p>
        </div>
        <TimeRangeSelect value={range} onChange={setRange} />
      </div>

      <DataTable
        data={data ?? []}
        columns={columns}
        rowKey={(r) => r.sessionId}
        expandable={(r) => <ModelBreakdownDetail breakdowns={r.modelBreakdowns} />}
      />
    </div>
  );
}
