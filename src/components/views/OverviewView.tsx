import { useState, useMemo } from "react";
import { DollarSign, TrendingUp, Calendar, MessageSquare } from "lucide-react";
import { useDailyUsage, useSessionUsage } from "@/hooks/useUsageData";
import { StatCard } from "@/components/dashboard/StatCard";
import { CostChart } from "@/components/dashboard/CostChart";
import { ModelDonut } from "@/components/dashboard/ModelDonut";
import { RecentSessions } from "@/components/dashboard/RecentSessions";
import { TimeRangeSelect } from "@/components/ui/TimeRangeSelect";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { formatCurrency, sinceDate } from "@/lib/utils";
import type { TimeRange } from "@/lib/types";

export function OverviewView() {
  const [range, setRange] = useState<TimeRange>("30d");
  const since = sinceDate(range);

  const daily = useDailyUsage({ since: since || undefined });
  const sessions = useSessionUsage({ since: since || undefined });

  const stats = useMemo(() => {
    if (!daily.data) return null;

    const today = new Date().toISOString().slice(0, 10);
    const todayCost =
      daily.data.find((d) => d.date === today)?.totalCost ?? 0;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
      .toISOString()
      .slice(0, 10);
    const weekCost = daily.data
      .filter((d) => d.date >= weekAgo)
      .reduce((s, d) => s + d.totalCost, 0);

    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const monthCost = daily.data
      .filter((d) => d.date >= monthStart)
      .reduce((s, d) => s + d.totalCost, 0);

    const totalSessions = sessions.data?.length ?? 0;

    return { todayCost, weekCost, monthCost, totalSessions };
  }, [daily.data, sessions.data]);

  if (daily.isLoading || sessions.isLoading) return <LoadingSpinner />;
  if (daily.error)
    return <ErrorMessage message={String(daily.error)} />;
  if (sessions.error)
    return <ErrorMessage message={String(sessions.error)} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <TimeRangeSelect value={range} onChange={setRange} />
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Today"
            value={formatCurrency(stats.todayCost)}
            icon={DollarSign}
          />
          <StatCard
            title="This Week"
            value={formatCurrency(stats.weekCost)}
            icon={TrendingUp}
          />
          <StatCard
            title="This Month"
            value={formatCurrency(stats.monthCost)}
            icon={Calendar}
          />
          <StatCard
            title="Sessions"
            value={stats.totalSessions.toString()}
            icon={MessageSquare}
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <CostChart data={daily.data ?? []} />
        </div>
        <ModelDonut data={daily.data ?? []} />
      </div>

      <RecentSessions data={sessions.data ?? []} />
    </div>
  );
}
