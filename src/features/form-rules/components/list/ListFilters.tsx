"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  RuleGroupBy,
  RulesListFilters,
  RuleStatus,
  TriggerType,
} from "../../types/rules";

/**
 * Controlled filter bar. Holds no state of its own — it reads `filters` and
 * reports changes via `onChange`, so the single source of truth stays in
 * useRulesList. Combines search + trigger/status filters + the group-by control
 * from the Phase 1 list spec.
 */
export function ListFilters({
  filters,
  onChange,
  onReset,
}: {
  filters: RulesListFilters;
  onChange: (next: Partial<RulesListFilters>) => void;
  onReset: () => void;
}) {
  const dirty =
    filters.q !== "" ||
    filters.trigger !== "ALL" ||
    filters.status !== "ALL" ||
    filters.hasConflicts;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.q}
          onChange={(e) => onChange({ q: e.target.value })}
          placeholder="Search by field or action…"
          className="pl-8"
        />
      </div>

      <Select
        value={filters.trigger}
        onValueChange={(v) => onChange({ trigger: v as TriggerType | "ALL" })}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Trigger" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All triggers</SelectItem>
          <SelectItem value="ON_LOAD">On load</SelectItem>
          <SelectItem value="ON_FIELD_CHANGE">On change</SelectItem>
          <SelectItem value="ON_SUBMIT">On submit</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(v) => onChange({ status: v as RuleStatus | "ALL" })}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All status</SelectItem>
          <SelectItem value="ENABLED">Live</SelectItem>
          <SelectItem value="DISABLED">Off</SelectItem>
        </SelectContent>
      </Select>

      <Toggle
        pressed={filters.hasConflicts}
        onPressedChange={(pressed) => onChange({ hasConflicts: pressed })}
        aria-label="Show only rules with conflicts"
        className="data-[state=on]:border-red-200 data-[state=on]:bg-red-50 data-[state=on]:text-red-700"
        variant="outline"
      >
        Has conflicts
      </Toggle>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Group by</span>
        <Select
          value={filters.groupBy}
          onValueChange={(v) => onChange({ groupBy: v as RuleGroupBy })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ORDER">Execution order</SelectItem>
            <SelectItem value="TRIGGER">Trigger</SelectItem>
            <SelectItem value="FIELD">Field</SelectItem>
          </SelectContent>
        </Select>

        {dirty && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
