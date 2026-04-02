import type { ModelBreakdown } from "@/lib/types";
import {
  formatCurrency,
  formatTokens,
  getModelColor,
  getModelDisplayName,
} from "@/lib/utils";

export function ModelBreakdownDetail({ breakdowns }: { breakdowns: ModelBreakdown[] }) {
  return (
    <div className="grid gap-2">
      {breakdowns.map((mb) => (
        <div
          key={mb.modelName}
          className="flex items-center gap-4 text-xs"
        >
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: getModelColor(mb.modelName) }}
          />
          <span className="w-20 font-medium text-foreground">
            {getModelDisplayName(mb.modelName)}
          </span>
          <span className="text-muted-foreground">
            In: {formatTokens(mb.inputTokens)}
          </span>
          <span className="text-muted-foreground">
            Out: {formatTokens(mb.outputTokens)}
          </span>
          <span className="text-muted-foreground">
            Cache W: {formatTokens(mb.cacheCreationTokens)}
          </span>
          <span className="text-muted-foreground">
            Cache R: {formatTokens(mb.cacheReadTokens)}
          </span>
          <span className="ml-auto font-mono text-foreground">
            {formatCurrency(mb.cost)}
          </span>
        </div>
      ))}
    </div>
  );
}
