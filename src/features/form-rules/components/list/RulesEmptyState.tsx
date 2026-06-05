"use client";

import { ArrowRight, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Two distinct empty states (the adoption lever from Phase 1/2):
 *  - `variant="no-rules"`   → form has zero rules. Lead with templates + NL.
 *  - `variant="no-matches"` → filters hid everything. Offer to clear.
 */
const TEMPLATES = [
  "Show field when…",
  "Make required when…",
  "Set value when…",
  "Hide field if…",
];

export function RulesEmptyState({
  variant,
  onCreate,
  onStartFromNL,
  onClearFilters,
}: {
  variant: "no-rules" | "no-matches";
  onCreate?: () => void;
  onStartFromNL?: (text: string) => void;
  onClearFilters?: () => void;
}) {
  if (variant === "no-matches") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm font-medium">No rules match your filters</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Try a different search term, trigger, or status.
        </p>
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-lg border border-dashed py-16 text-center">
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold">No rules yet for this form</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          Rules make forms smart: show or hide fields, require information, and
          set values based on what the user enters.
        </p>
      </div>

      <form
        className="flex w-full max-w-md items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const text = new FormData(e.currentTarget).get("nl") as string;
          if (text?.trim()) onStartFromNL?.(text.trim());
        }}
      >
        <div className="relative flex-1">
          <Sparkles className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-500" />
          <Input
            name="nl"
            placeholder="Describe it: require asset tag when category is hardware"
            className="pl-8"
          />
        </div>
        <Button type="submit" variant="secondary">
          <Wand2 className="mr-1.5 h-4 w-4" /> Build
        </Button>
      </form>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Or start from a template
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {TEMPLATES.map((t) => (
            <Button key={t} variant="outline" size="sm" onClick={onCreate}>
              {t}
            </Button>
          ))}
        </div>
      </div>

      <Button variant="ghost" size="sm" onClick={onCreate}>
        Start from scratch <ArrowRight className="ml-1.5 h-4 w-4" />
      </Button>
    </div>
  );
}
