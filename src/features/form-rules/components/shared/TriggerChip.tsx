import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Trigger } from "../../types/rules";

/**
 * Single source for rendering "when does this rule run". Used in the list,
 * detail, and (later) builder, so the trigger always looks identical everywhere.
 */
const TRIGGER_META: Record<Trigger["type"], { label: string; className: string }> = {
  ON_LOAD: { label: "On load", className: "bg-sky-50 text-sky-700 border-sky-200" },
  ON_FIELD_CHANGE: { label: "On change", className: "bg-violet-50 text-violet-700 border-violet-200" },
  ON_SUBMIT: { label: "On submit", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

export function TriggerChip({ trigger, className }: { trigger: Trigger; className?: string }) {
  const meta = TRIGGER_META[trigger.type];
  const label =
    trigger.type === "ON_FIELD_CHANGE" && trigger.fieldLabel
      ? `${meta.label} · ${trigger.fieldLabel}`
      : meta.label;

  return (
    <Badge variant="outline" className={cn("font-medium whitespace-nowrap", meta.className, className)}>
      {label}
    </Badge>
  );
}
