import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type {
  DailyUsage,
  WeeklyUsage,
  MonthlyUsage,
  SessionUsage,
  Totals,
} from "@/lib/types";

interface UsageParams {
  since?: string;
  until?: string;
  project?: string;
}

export function useDailyUsage(params: UsageParams = {}) {
  return useQuery<DailyUsage[]>({
    queryKey: ["daily", params],
    queryFn: () =>
      invoke("get_daily_usage", {
        since: params.since || null,
        until: params.until || null,
        project: params.project || null,
      }),
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
}

export function useWeeklyUsage(params: UsageParams = {}) {
  return useQuery<WeeklyUsage[]>({
    queryKey: ["weekly", params],
    queryFn: () =>
      invoke("get_weekly_usage", {
        since: params.since || null,
        until: params.until || null,
        project: params.project || null,
      }),
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
}

export function useMonthlyUsage(params: UsageParams = {}) {
  return useQuery<MonthlyUsage[]>({
    queryKey: ["monthly", params],
    queryFn: () =>
      invoke("get_monthly_usage", {
        since: params.since || null,
        until: params.until || null,
        project: params.project || null,
      }),
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
}

export function useSessionUsage(params: UsageParams = {}) {
  return useQuery<SessionUsage[]>({
    queryKey: ["session", params],
    queryFn: () =>
      invoke("get_session_usage", {
        since: params.since || null,
        until: params.until || null,
        project: params.project || null,
      }),
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
}

export function useTotals(params: UsageParams & { source?: string } = {}) {
  return useQuery<Totals>({
    queryKey: ["totals", params],
    queryFn: () =>
      invoke("get_totals", {
        since: params.since || null,
        until: params.until || null,
        project: params.project || null,
        source: params.source || "daily",
      }),
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
}
