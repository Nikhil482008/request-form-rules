"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { RuleId, RuleStatus } from "../../types/rules";

/**
 * Inline enable/disable. Presentational only — it reports intent via onToggle
 * and renders `pending` state; the optimistic mutation lives in the parent
 * (useRuleMutations). Keeping the network out of the atom means it stays
 * reusable in the detail page and bulk-preview contexts.
 */
export function StatusToggle({
  ruleId,
  status,
  pending = false,
  onToggle,
}: {
  ruleId: RuleId;
  status: RuleStatus;
  pending?: boolean;
  onToggle: (ruleId: RuleId, next: RuleStatus) => void;
}) {
  const enabled = status === "ENABLED";

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={enabled}
        disabled={pending}
        aria-label={enabled ? "Disable rule" : "Enable rule"}
        onCheckedChange={(checked) => onToggle(ruleId, checked ? "ENABLED" : "DISABLED")}
      />
      <span
        className={cn(
          "text-xs font-medium",
          enabled ? "text-emerald-600" : "text-muted-foreground",
          pending && "opacity-50"
        )}
      >
        {enabled ? "Live" : "Off"}
      </span>
    </div>
  );
}
