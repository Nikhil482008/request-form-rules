"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Rule, RuleId, RuleStatus } from "../../types/rules";
import type { RuleGroup } from "../../hooks/useRulesList";
import { RuleRow, type RuleRowAction } from "./RuleRow";
import { RulesEmptyState } from "./RulesEmptyState";

/**
 * Renders the grouped rule rows + the column header. Stateless w.r.t. data: it
 * receives groups + the selection set and forwards every interaction up to the
 * page, which owns selection and mutations.
 *
 * The drag handle / reorder affordance only appears in "execution order"
 * grouping — passed down as `draggable` per row.
 */
export function RulesTable({
  groups,
  groupedByOrder,
  selectedIds,
  pendingStatusIds,
  hasAnyRules,
  onSelectAll,
  onSelectRule,
  onToggleStatus,
  onOpenRule,
  onRowAction,
  onOpenConflicts,
  onClearFilters,
  onCreate,
}: {
  groups: RuleGroup[];
  /** true when filters.groupBy === "ORDER" → rows are reorderable. */
  groupedByOrder: boolean;
  selectedIds: Set<RuleId>;
  pendingStatusIds: Set<RuleId>;
  /** Distinguishes "no rules at all" from "filters hid everything". */
  hasAnyRules: boolean;
  onSelectAll: (rules: Rule[], selected: boolean) => void;
  onSelectRule: (ruleId: RuleId, selected: boolean) => void;
  onToggleStatus: (ruleId: RuleId, next: RuleStatus) => void;
  onOpenRule: (ruleId: RuleId) => void;
  onRowAction: (action: RuleRowAction, ruleId: RuleId) => void;
  onOpenConflicts: (ruleId: RuleId) => void;
  onClearFilters: () => void;
  onCreate: () => void;
}) {
  const visibleRules = groups.flatMap((g) => g.rules);
  const isEmpty = visibleRules.length === 0;

  if (isEmpty) {
    return (
      <RulesEmptyState
        variant={hasAnyRules ? "no-matches" : "no-rules"}
        onCreate={onCreate}
        onClearFilters={onClearFilters}
      />
    );
  }

  // Header "select all" reflects the currently visible (filtered) rows.
  const allSelected =
    visibleRules.length > 0 && visibleRules.every((r) => selectedIds.has(r.id));
  const someSelected = visibleRules.some((r) => selectedIds.has(r.id));

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[72px]">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={(c) => onSelectAll(visibleRules, c === true)}
                aria-label="Select all visible rules"
                className="ml-5"
              />
            </TableHead>
            <TableHead>Rule</TableHead>
            <TableHead className="w-[150px]">Trigger</TableHead>
            <TableHead className="w-[110px]">Status</TableHead>
            <TableHead className="w-[80px] text-center">Conflicts</TableHead>
            <TableHead className="w-[56px]" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {groups.map((group) => (
            <GroupSection
              key={group.key}
              group={group}
              draggable={groupedByOrder}
              selectedIds={selectedIds}
              pendingStatusIds={pendingStatusIds}
              onSelectRule={onSelectRule}
              onToggleStatus={onToggleStatus}
              onOpenRule={onOpenRule}
              onRowAction={onRowAction}
              onOpenConflicts={onOpenConflicts}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function GroupSection({
  group,
  draggable,
  selectedIds,
  pendingStatusIds,
  onSelectRule,
  onToggleStatus,
  onOpenRule,
  onRowAction,
  onOpenConflicts,
}: {
  group: RuleGroup;
  draggable: boolean;
  selectedIds: Set<RuleId>;
  pendingStatusIds: Set<RuleId>;
  onSelectRule: (ruleId: RuleId, selected: boolean) => void;
  onToggleStatus: (ruleId: RuleId, next: RuleStatus) => void;
  onOpenRule: (ruleId: RuleId) => void;
  onRowAction: (action: RuleRowAction, ruleId: RuleId) => void;
  onOpenConflicts: (ruleId: RuleId) => void;
}) {
  return (
    <>
      {group.label && (
        <TableRow className="hover:bg-transparent">
          <TableHead
            colSpan={6}
            className={cn(
              "h-9 bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            )}
          >
            {group.label}
            <span className="ml-2 font-normal normal-case text-muted-foreground/70">
              {group.rules.length}
            </span>
          </TableHead>
        </TableRow>
      )}
      {group.rules.map((rule) => (
        <RuleRow
          key={rule.id}
          rule={rule}
          draggable={draggable}
          selected={selectedIds.has(rule.id)}
          statusPending={pendingStatusIds.has(rule.id)}
          onSelectChange={onSelectRule}
          onToggleStatus={onToggleStatus}
          onOpen={onOpenRule}
          onAction={onRowAction}
          onOpenConflicts={onOpenConflicts}
        />
      ))}
    </>
  );
}
