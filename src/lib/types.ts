export interface ModelBreakdown {
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  cost: number;
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalCost: number;
  cost?: number;
  modelsUsed: string[];
  modelBreakdowns: ModelBreakdown[];
  project?: string;
}

export interface WeeklyUsage {
  week: string; // YYYY-MM-DD (week start)
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalCost: number;
  cost?: number;
  modelsUsed: string[];
  modelBreakdowns: ModelBreakdown[];
  project?: string;
}

export interface MonthlyUsage {
  month: string; // YYYY-MM
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalCost: number;
  cost?: number;
  modelsUsed: string[];
  modelBreakdowns: ModelBreakdown[];
  project?: string;
}

export interface SessionUsage {
  sessionId: string;
  projectPath: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalCost: number;
  cost?: number;
  lastActivity: string; // YYYY-MM-DD
  versions: string[];
  modelsUsed: string[];
  modelBreakdowns: ModelBreakdown[];
}

export interface Totals {
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalCost: number;
}

export type TimeRange = "7d" | "30d" | "90d" | "all";
