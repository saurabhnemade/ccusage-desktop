import type { SessionUsage } from "@/lib/types";
import {
  formatCurrency,
  formatDateFull,
  extractProjectName,
} from "@/lib/utils";

interface Props {
  data: SessionUsage[];
}

export function RecentSessions({ data }: Props) {
  const sorted = [...data]
    .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
    .slice(0, 10);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        Recent Sessions
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="pb-2 pr-4 font-medium">Project</th>
              <th className="pb-2 pr-4 font-medium">Models</th>
              <th className="pb-2 pr-4 font-medium text-right">Cost</th>
              <th className="pb-2 font-medium text-right">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr
                key={s.sessionId}
                className="border-b border-border/50 last:border-0"
              >
                <td className="py-2.5 pr-4 font-medium text-foreground">
                  {extractProjectName(s.projectPath)}
                </td>
                <td className="py-2.5 pr-4 text-muted-foreground">
                  {s.modelsUsed.map((m) => m.split("-")[1] || m).join(", ")}
                </td>
                <td className="py-2.5 pr-4 text-right font-mono text-foreground">
                  {formatCurrency(s.totalCost)}
                </td>
                <td className="py-2.5 text-right text-muted-foreground">
                  {formatDateFull(s.lastActivity)}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  No sessions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
