"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * The one component that renders a conflict count, used by the list rows, the
 * nav tab, and the detail header. Every badge reads from the same conflict
 * query upstream, so counts can never disagree across the UI.
 *
 * Renders a neutral dash when count === 0 so rows stay vertically aligned.
 */
export function ConflictBadge({
  count,
  onClick,
  className,
}: {
  count: number;
  /** Jump to the Conflicts tab filtered to this rule. */
  onClick?: () => void;
  className?: string;
}) {
  if (count === 0) {
    return <span className={cn("text-muted-foreground/50 text-sm", className)}>—</span>;
  }

  const badge = (
    <Badge
      variant="outline"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "gap-1 border-red-200 bg-red-50 font-semibold text-red-700",
        onClick && "cursor-pointer hover:bg-red-100",
        className
      )}
    >
      <AlertTriangle className="h-3 w-3" aria-hidden />
      {count}
    </Badge>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent>
        {count} conflict{count === 1 ? "" : "s"} — click to review
      </TooltipContent>
    </Tooltip>
  );
}
