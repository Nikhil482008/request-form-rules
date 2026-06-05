"use client";

import { Copy, Download, Power, PowerOff, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RuleId } from "../../types/rules";

export type BulkOp = "ENABLE" | "DISABLE" | "DUPLICATE" | "EXPORT" | "DELETE";

/**
 * Appears only when selection > 0 (rendered conditionally by the table).
 * Maps to the single POST /rules/bulk endpoint — one op per button, the parent
 * fires the mutation and clears selection.
 */
export function BulkActionBar({
  selectedIds,
  onAction,
  onClear,
}: {
  selectedIds: RuleId[];
  onAction: (op: BulkOp, ids: RuleId[]) => void;
  onClear: () => void;
}) {
  const count = selectedIds.length;
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
      <span className="text-sm font-medium">{count} selected</span>
      <div className="mx-1 h-5 w-px bg-border" />

      <Button variant="ghost" size="sm" onClick={() => onAction("ENABLE", selectedIds)}>
        <Power className="mr-1.5 h-4 w-4" /> Enable
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onAction("DISABLE", selectedIds)}>
        <PowerOff className="mr-1.5 h-4 w-4" /> Disable
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onAction("DUPLICATE", selectedIds)}>
        <Copy className="mr-1.5 h-4 w-4" /> Duplicate
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onAction("EXPORT", selectedIds)}>
        <Download className="mr-1.5 h-4 w-4" /> Export
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => onAction("DELETE", selectedIds)}
      >
        <Trash2 className="mr-1.5 h-4 w-4" /> Delete
      </Button>

      <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={onClear}>
        <X className="h-4 w-4" />
        <span className="sr-only">Clear selection</span>
      </Button>
    </div>
  );
}
