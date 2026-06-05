import { summarizeCompact } from "../../lib/summarize";
import type { Rule } from "../../types/rules";

/**
 * The primary identity column. A rule has no "name" — its plain-language
 * summary IS its identity (the Phase 1 comprehension decision). Renders the
 * two-line when/then split from summarizeCompact so dense rows stay scannable.
 */
export function RuleSummaryCell({ rule }: { rule: Rule }) {
  const { when, then } = summarizeCompact(rule);
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-foreground">{when}</p>
      <p className="truncate text-sm text-muted-foreground">
        <span className="font-medium text-foreground/70">then </span>
        {then}
      </p>
    </div>
  );
}
