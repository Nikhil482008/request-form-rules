"use client";

/**
 * Server-state hook for the Rules List.
 *
 * Today it reads from MOCK_RULES and applies the filters client-side. The
 * surface (loading / error / data + filters) is the same shape a TanStack Query
 * version would expose, so the swap to `useQuery(ruleKeys.list(...), ...)` is
 * isolated to this file — no component changes.
 */
import { useMemo, useState } from "react";
import { MOCK_RULES } from "../api/mock-rules";
import {
  DEFAULT_LIST_FILTERS,
  type Rule,
  type RulesListFilters,
  type RuleGroupBy,
} from "../types/rules";

export interface RuleGroup {
  /** Stable key for the group ("ORDER" yields a single ungrouped bucket). */
  key: string;
  /** Human label shown as a section header; null for the ungrouped case. */
  label: string | null;
  rules: Rule[];
}

export interface UseRulesListResult {
  isLoading: boolean;
  error: Error | null;
  /** Flat, filtered, order-sorted list (used for counts + bulk selection). */
  rules: Rule[];
  /** The same rules arranged into display groups per `filters.groupBy`. */
  groups: RuleGroup[];
  total: number;
  filteredTotal: number;
  filters: RulesListFilters;
  setFilters: (next: Partial<RulesListFilters>) => void;
  resetFilters: () => void;
}

function matchesFilters(rule: Rule, f: RulesListFilters): boolean {
  if (f.trigger !== "ALL" && rule.trigger.type !== f.trigger) return false;
  if (f.status !== "ALL" && rule.status !== f.status) return false;
  if (f.hasConflicts && rule.conflictCount === 0) return false;
  if (f.q.trim()) {
    const haystack = [
      rule.trigger.fieldLabel ?? "",
      ...rule.blocks.flatMap((b) => [
        ...b.condition.conditions.map((c) => `${c.fieldLabel} ${String(c.value ?? "")}`),
        ...b.actions.map((a) => `${a.type} ${a.targetFieldLabel}`),
      ]),
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(f.q.trim().toLowerCase())) return false;
  }
  return true;
}

function groupRules(rules: Rule[], groupBy: RuleGroupBy): RuleGroup[] {
  if (groupBy === "ORDER") {
    return [{ key: "all", label: null, rules }];
  }

  const buckets = new Map<string, RuleGroup>();
  for (const rule of rules) {
    const entries =
      groupBy === "TRIGGER"
        ? [[rule.trigger.type, triggerGroupLabel(rule)] as const]
        : affectedFieldLabels(rule).map((label) => [label, label] as const);

    for (const [key, label] of entries) {
      if (!buckets.has(key)) buckets.set(key, { key, label, rules: [] });
      buckets.get(key)!.rules.push(rule);
    }
  }
  return [...buckets.values()];
}

function triggerGroupLabel(rule: Rule): string {
  switch (rule.trigger.type) {
    case "ON_LOAD":
      return "On form load";
    case "ON_FIELD_CHANGE":
      return `On change · ${rule.trigger.fieldLabel ?? "field"}`;
    case "ON_SUBMIT":
      return "On submit";
  }
}

/** Every field a rule reads or writes — used by the "group by field" view. */
function affectedFieldLabels(rule: Rule): string[] {
  const labels = new Set<string>();
  for (const block of rule.blocks) {
    block.condition.conditions.forEach((c) => labels.add(c.fieldLabel));
    block.actions.forEach((a) => labels.add(a.targetFieldLabel));
  }
  if (labels.size === 0) labels.add("—");
  return [...labels];
}

export function useRulesList(): UseRulesListResult {
  const [filters, setFiltersState] = useState<RulesListFilters>(DEFAULT_LIST_FILTERS);

  const all = MOCK_RULES;

  const rules = useMemo(
    () =>
      all
        .filter((r) => matchesFilters(r, filters))
        .sort((a, b) => a.order - b.order),
    [all, filters]
  );

  const groups = useMemo(() => groupRules(rules, filters.groupBy), [rules, filters.groupBy]);

  return {
    isLoading: false,
    error: null,
    rules,
    groups,
    total: all.length,
    filteredTotal: rules.length,
    filters,
    setFilters: (next) => setFiltersState((prev) => ({ ...prev, ...next })),
    resetFilters: () => setFiltersState(DEFAULT_LIST_FILTERS),
  };
}
