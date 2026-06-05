"use client";

import {
  Copy,
  GripVertical,
  MoreHorizontal,
  Pencil,
  PlayCircle,
  PowerOff,
  ScrollText,
  Trash2,
} from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Rule, RuleId, RuleStatus } from "../../types/rules";
import { RuleSummaryCell } from "./RuleSummaryCell";
import { TriggerChip } from "../shared/TriggerChip";
import { StatusToggle } from "../shared/StatusToggle";
import { ConflictBadge } from "../shared/ConflictBadge";

export type RuleRowAction = "EDIT" | "TEST" | "DUPLICATE" | "LOGS" | "DISABLE" | "DELETE";

/**
 * A single rule row. Presentational: it reports every interaction upward and
 * holds no data state. The drag handle is shown only in "execution order"
 * grouping (reordering is meaningless inside trigger/field groups).
 */
export function RuleRow({
  rule,
  selected,
  draggable,
  statusPending,
  onSelectChange,
  onToggleStatus,
  onOpen,
  onAction,
  onOpenConflicts,
}: {
  rule: Rule;
  selected: boolean;
  draggable: boolean;
  statusPending?: boolean;
  onSelectChange: (ruleId: RuleId, selected: boolean) => void;
  onToggleStatus: (ruleId: RuleId, next: RuleStatus) => void;
  onOpen: (ruleId: RuleId) => void;
  onAction: (action: RuleRowAction, ruleId: RuleId) => void;
  onOpenConflicts: (ruleId: RuleId) => void;
}) {
  return (
    <TableRow
      data-state={selected ? "selected" : undefined}
      className={cn("group", rule.status === "DISABLED" && "opacity-60")}
    >
      {/* select + drag */}
      <TableCell className="w-[72px] pr-0">
        <div className="flex items-center gap-1">
          {draggable ? (
            <button
              className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          ) : (
            <span className="inline-block w-4" />
          )}
          <Checkbox
            checked={selected}
            onCheckedChange={(c) => onSelectChange(rule.id, c === true)}
            aria-label={`Select rule ${rule.order}`}
          />
        </div>
      </TableCell>

      {/* primary identity — click opens detail */}
      <TableCell
        className="cursor-pointer py-3"
        onClick={() => onOpen(rule.id)}
      >
        <RuleSummaryCell rule={rule} />
      </TableCell>

      <TableCell className="w-[150px]">
        <TriggerChip trigger={rule.trigger} />
      </TableCell>

      <TableCell className="w-[110px]">
        <StatusToggle
          ruleId={rule.id}
          status={rule.status}
          pending={statusPending}
          onToggle={onToggleStatus}
        />
      </TableCell>

      <TableCell className="w-[80px] text-center">
        <ConflictBadge count={rule.conflictCount} onClick={() => onOpenConflicts(rule.id)} />
      </TableCell>

      {/* overflow menu */}
      <TableCell className="w-[56px] text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Rule actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onAction("EDIT", rule.id)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("TEST", rule.id)}>
              <PlayCircle className="mr-2 h-4 w-4" /> Test
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("DUPLICATE", rule.id)}>
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("LOGS", rule.id)}>
              <ScrollText className="mr-2 h-4 w-4" /> View logs
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAction("DISABLE", rule.id)}>
              <PowerOff className="mr-2 h-4 w-4" /> Disable
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700"
              onClick={() => onAction("DELETE", rule.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
