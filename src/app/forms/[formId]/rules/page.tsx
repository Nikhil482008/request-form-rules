"use client";

/**
 * Route: /forms/:formId/rules  → the Rules List screen.
 *
 * This is the thin composition layer: it owns the framework concerns (routing
 * via next/navigation, and where mutations would call React Query) and feeds
 * them into RulesListPage as plain callbacks. The heavy component stays
 * framework-agnostic; everything Next-specific lives here.
 *
 * Mutation callbacks are stubbed with TODO markers — wiring them to
 * useRuleMutations / useBulkRuleMutations is the next milestone (out of scope
 * for the List page itself).
 */
import { useParams, useRouter } from "next/navigation";
import { RulesListPage } from "@/features/form-rules/components/list/RulesListPage";
import type { RuleId, RuleStatus } from "@/features/form-rules/types/rules";
import type { BulkOp } from "@/features/form-rules/components/list/BulkActionBar";

export default function RulesListRoute() {
  const router = useRouter();
  const { formId } = useParams<{ formId: string }>();

  const base = `/forms/${formId}/rules`;

  return (
    <RulesListPage
      formName="New Hardware Request"
      conflictCount={3}
      // ── navigation ────────────────────────────────────────────────────
      onCreateRule={() => router.push(`${base}/new`)}
      onOpenRule={(id: RuleId) => router.push(`${base}/${id}`)}
      onEditRule={(id: RuleId) => router.push(`${base}/${id}/edit`)}
      onTestRule={(id: RuleId) => router.push(`${base}/${id}?test=1`)}
      onRuleLogs={(id: RuleId) => router.push(`${base}/${id}?tab=logs`)}
      onOpenConflicts={(id?: RuleId) =>
        router.push(id ? `${base}/conflicts?rule=${id}` : `${base}/conflicts`)
      }
      onOpenActivityLog={() => router.push(`${base}/activity`)}
      // ── mutations (TODO: wire to React Query hooks) ───────────────────
      onToggleRuleStatus={async (id: RuleId, next: RuleStatus) => {
        // TODO: useRuleMutations().setStatus(id, next) with optimistic update
        console.info("toggle status", id, next);
      }}
      onBulk={async (op: BulkOp, ids: RuleId[]) => {
        // TODO: useBulkRuleMutations().run(op, ids) → POST /forms/:id/rules/bulk
        console.info("bulk", op, ids);
      }}
    />
  );
}
