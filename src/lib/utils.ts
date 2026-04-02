import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatTokens(count: number): string {
  if (count >= 1_000_000_000) {
    return `${(count / 1_000_000_000).toFixed(1)}B`;
  }
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

export function getModelColor(model: string): string {
  const lower = model.toLowerCase();
  if (lower.includes("opus")) return "#8b5cf6";
  if (lower.includes("sonnet")) return "#6366f1";
  if (lower.includes("haiku")) return "#06b6d4";
  return "#94a3b8";
}

export function getModelDisplayName(model: string): string {
  const lower = model.toLowerCase();
  if (lower.includes("opus")) return "Opus";
  if (lower.includes("sonnet")) return "Sonnet";
  if (lower.includes("haiku")) return "Haiku";
  return model;
}

export function sinceDate(range: string): string {
  const now = new Date();
  let d: Date;
  switch (range) {
    case "7d":
      d = new Date(now.getTime() - 7 * 86400000);
      break;
    case "30d":
      d = new Date(now.getTime() - 30 * 86400000);
      break;
    case "90d":
      d = new Date(now.getTime() - 90 * 86400000);
      break;
    default:
      return "";
  }
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

export function extractProjectName(path: string): string {
  if (!path) return "Unknown";
  const parts = path.split("/");
  return parts[parts.length - 1] || parts[parts.length - 2] || path;
}
