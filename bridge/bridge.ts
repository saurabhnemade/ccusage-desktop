// Suppress ccusage's consola logger output (it writes to stdout which
// interferes with our JSON protocol). The Rust reader also skips non-JSON lines
// as a safety net.
import { logger } from "ccusage/logger";
logger.level = -999;

import {
  loadDailyUsageData,
  loadWeeklyUsageData,
  loadMonthlyUsageData,
  loadSessionData,
  loadSessionBlockData,
} from "ccusage/data-loader";
import { calculateTotals } from "ccusage/calculate-cost";

interface BridgeRequest {
  command: "daily" | "weekly" | "monthly" | "session" | "blocks" | "totals";
  args: {
    since?: string;
    until?: string;
    breakdown?: boolean;
    project?: string;
    mode?: "auto" | "calculate" | "display";
    source?: "daily" | "weekly" | "monthly" | "session";
  };
}

interface BridgeResponse {
  ok: boolean;
  data?: unknown;
  error?: string;
}

function buildOptions(args: BridgeRequest["args"]) {
  return {
    since: args.since,
    until: args.until,
    project: args.project,
    mode: args.mode ?? ("auto" as const),
    offline: false,
  };
}

async function handleCommand(req: BridgeRequest): Promise<BridgeResponse> {
  const opts = buildOptions(req.args);

  switch (req.command) {
    case "daily": {
      const data = await loadDailyUsageData(opts);
      return { ok: true, data };
    }
    case "weekly": {
      const data = await loadWeeklyUsageData(opts);
      return { ok: true, data };
    }
    case "monthly": {
      const data = await loadMonthlyUsageData(opts);
      return { ok: true, data };
    }
    case "session": {
      const data = await loadSessionData(opts);
      return { ok: true, data };
    }
    case "blocks": {
      const data = await loadSessionBlockData(opts);
      return { ok: true, data };
    }
    case "totals": {
      const source = req.args.source ?? "daily";
      let sourceData;
      switch (source) {
        case "daily":
          sourceData = await loadDailyUsageData(opts);
          break;
        case "weekly":
          sourceData = await loadWeeklyUsageData(opts);
          break;
        case "monthly":
          sourceData = await loadMonthlyUsageData(opts);
          break;
        case "session":
          sourceData = await loadSessionData(opts);
          break;
      }
      const totals = calculateTotals(sourceData);
      return { ok: true, data: totals };
    }
    default:
      return { ok: false, error: `Unknown command: ${(req as BridgeRequest).command}` };
  }
}

async function main() {
  const reader = Bun.stdin.stream().getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const req: BridgeRequest = JSON.parse(trimmed);
        const res = await handleCommand(req);
        process.stdout.write(JSON.stringify(res) + "\n");
      } catch (err) {
        const res: BridgeResponse = {
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        };
        process.stdout.write(JSON.stringify(res) + "\n");
      }
    }
  }
}

main().catch((err) => {
  process.stdout.write(JSON.stringify({ ok: false, error: String(err) }) + "\n");
  process.exit(1);
});
