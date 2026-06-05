"use client";

import { useCallback, useState } from "react";
import { AlertTriangle, Plus, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Rule, RuleId, RuleStatus } from "../../types/rules";
import { useRulesList } from "../../hooks/useRulesList";
import { ListFilters } from "./ListFilters";
import { BulkActionBar, type BulkOp } from "./BulkActionBar";
import { RulesTable } from "./RulesTable";
import type { RuleRowAction } from "./RuleRow";

/**
 * Container for the Rules List screen. Owns the two pieces of state that don't
 * belong to the server (selection) or the hook (filters already live there):
 *   - the selection Set
 *   - the in-flight status-toggle Set (optimistic-pending visual)
 *
 * Everything else is delegated: server data → useRulesList, presentation →
 * RulesTable/ListFilters/BulkActionBar. Navigation + mutations are surfaced as
 * callbacks so this component stays free of router/query specifics and can be
 * dropped into Storybook or tests unchanged.
 */
export function RulesListPage({
  formName = "New Hardware Request",
  conflictCount = 0,
  onCreateRule,
  onOpenRule,
  onEditRule,
  onTestRule,
  onOpenConflicts,
  onOpenActivityLog,
  onRuleLogs,
  onToggleRuleStatus,
  onBulk,
}: {
  formName?: string;
  /** Total conflicts across the form — drives the nav-tab badge. */
  conflictCount?: number;
  onCreateRule?: () => void;
  onOpenRule?: (ruleId: RuleId) => void;
  onEditRule?: (ruleId: RuleId) => void;
  onTestRule?: (ruleId: RuleId) => void;
  onOpenConflicts?: (ruleId?: RuleId) => void;
  onOpenActivityLog?: () => void;
  onRuleLogs?: (ruleId: RuleId) => void;
  onToggleRuleStatus?: (ruleId: RuleId, next: RuleStatus) => Promise<void> | void;
  onBulk?: (op: BulkOp, ids: RuleId[]) => Promise<void> | void;
}) {
  const { groups, rules, filters, setFilters, resetFilters, total, isLoading } =
    useRulesList();

  const [selectedIds, setSelectedIds] = useState<Set<RuleId>>(new Set());
  const [pendingStatusIds, setPendingStatusIds] = useState<Set<RuleId>>(new Set());

  // ── selection ──────────────────────────────────────────────────────────
  const selectRule = useCallback((ruleId: RuleId, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      selected ? next.add(ruleId) : next.delete(ruleId);
      return next;
    });
  }, []);

  const selectAll = useCallback((visible: Rule[], selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      visible.forEach((r) => (selected ? next.add(r.id) : next.delete(r.id)));
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // ── status toggle (optimistic-pending visual; mutation owned by parent) ──
  const toggleStatus = useCallback(
    async (ruleId: RuleId, next: RuleStatus) => {
      setPendingStatusIds((prev) => new Set(prev).add(ruleId));
      try {
        await onToggleRuleStatus?.(ruleId, next);
      } finally {
        setPendingStatusIds((prev) => {
          const n = new Set(prev);
          n.delete(ruleId);
          return n;
        });
      }
    },
    [onToggleRuleStatus]
  );

  // ── row + bulk dispatch ─────────────────────────────────────────────────
  const handleRowAction = useCallback(
    (action: RuleRowAction, ruleId: RuleId) => {
      switch (action) {
        case "EDIT":
          return onEditRule?.(ruleId);
        case "TEST":
          return onTestRule?.(ruleId);
        case "LOGS":
          return onRuleLogs?.(ruleId);
        case "DISABLE":
          return toggleStatus(ruleId, "DISABLED");
        case "DUPLICATE":
          return onBulk?.("DUPLICATE", [ruleId]);
        case "DELETE":
          return onBulk?.("DELETE", [ruleId]);
      }
    },
    [onEditRule, onTestRule, onRuleLogs, toggleStatus, onBulk]
  );

  const handleBulk = useCallback(
    async (op: BulkOp, ids: RuleId[]) => {
      await onBulk?.(op, ids);
      clearSelection();
    },
    [onBulk, clearSelection]
  );

  const selectedList = [...selectedIds];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 p-6">
        {/* page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Form · {formName}</p>
            <h1 className="text-xl font-semibold tracking-tight">Rules</h1>
          </div>
          <Button onClick={onCreateRule}>
            <Plus className="mr-1.5 h-4 w-4" /> Create Rule
          </Button>
        </div>

        {/* sub-nav tabs (Conflicts + Activity Log are siblings of the list) */}
        <nav className="flex items-center gap-1 border-b">
          <TabLink active>Rules</TabLink>
          <TabLink onClick={() => onOpenConflicts?.()}>
            <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
            Conflicts
            {conflictCount > 0 && (
              <Badge
                variant="outline"
                className="ml-1.5 border-red-200 bg-red-50 px-1.5 text-red-700"
              >
                {conflictCount}
              </Badge>
            )}
          </TabLink>
          <TabLink onClick={onOpenActivityLog}>
            <ScrollText className="mr-1.5 h-3.5 w-3.5" />
            Activity Log
          </TabLink>
        </nav>

        {/* filters */}
        <ListFilters filters={filters} onChange={setFilters} onReset={resetFilters} />

        {/* bulk bar (renders null when empty selection) */}
        <BulkActionBar
          selectedIds={selectedList}
          onAction={handleBulk}
          onClear={clearSelection}
        />

        {/* table / empty states */}
        {isLoading ? (
          <div className="rounded-md border p-10 text-center text-sm text-muted-foreground">
            Loading rules…
          </div>
        ) : (
          <RulesTable
            groups={groups}
            groupedByOrder={filters.groupBy === "ORDER"}
            selectedIds={selectedIds}
            pendingStatusIds={pendingStatusIds}
            hasAnyRules={total > 0}
            onSelectAll={selectAll}
            onSelectRule={selectRule}
            onToggleStatus={toggleStatus}
            onOpenRule={(id) => onOpenRule?.(id)}
            onRowAction={handleRowAction}
            onOpenConflicts={(id) => onOpenConflicts?.(id)}
            onClearFilters={resetFilters}
            onCreate={() => onCreateRule?.()}
          />
        )}

        {/* footer count */}
        {!isLoading && rules.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Showing {rules.length} of {total} rule{total === 1 ? "" : "s"}
          </p>
        )}
      </div>
    </TooltipProvider>
  );
}

function TabLink({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex items-center px-3 py-2 text-sm font-medium transition-colors " +
        (active
          ? "border-b-2 border-foreground text-foreground"
          : "border-b-2 border-transparent text-muted-foreground hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}
