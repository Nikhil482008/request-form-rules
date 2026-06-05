/**
 * Domain types for the Request Form Rules module — scoped to the List page.
 *
 * Only the slice of the model the list needs is defined here (trigger, blocks,
 * status, conflict count, ordering). Preview / log / template types live in
 * their own files when those screens are built.
 */

// ── Branded ids ────────────────────────────────────────────────────────────
// Prevent passing a fieldId where a ruleId is expected, etc.
export type RuleId = string & { readonly __brand: "RuleId" };
export type FormId = string & { readonly __brand: "FormId" };
export type FieldId = string & { readonly __brand: "FieldId" };

// ── Enums (string unions) ──────────────────────────────────────────────────
export type TriggerType = "ON_LOAD" | "ON_FIELD_CHANGE" | "ON_SUBMIT";

export type Operator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "GREATER_THAN"
  | "LESS_THAN"
  | "CONTAINS"
  | "IS_EMPTY"
  | "IS_NOT_EMPTY"
  | "IN"
  | "NOT_IN";

export type LogicOperator = "AND" | "OR";

export type ActionType =
  | "SHOW"
  | "HIDE"
  | "REQUIRE"
  | "OPTIONAL"
  | "SET_VALUE"
  | "CLEAR_VALUE"
  | "ENABLE"
  | "DISABLE";

export type RuleStatus = "ENABLED" | "DISABLED";

export type ScopeKind = "ALL" | "ROLES" | "GROUPS" | "USERS";

// ── Core domain ────────────────────────────────────────────────────────────
export interface Trigger {
  type: TriggerType;
  /** Required only when type === "ON_FIELD_CHANGE". */
  fieldId?: FieldId;
  /** Resolved field label for display (denormalized for the list). */
  fieldLabel?: string;
}

export interface Condition {
  id: string;
  fieldId: FieldId;
  fieldLabel: string;
  operator: Operator;
  value: string | number | string[] | null;
}

export interface ConditionGroup {
  logic: LogicOperator;
  conditions: Condition[];
  /** Nested groups enable arbitrary AND/OR trees. Optional for the simple case. */
  groups?: ConditionGroup[];
}

export interface Action {
  id: string;
  type: ActionType;
  targetFieldId: FieldId;
  targetFieldLabel: string;
  value?: string | number | null;
}

/** One IF → THEN block. actions has length >= 1 (one condition, many actions). */
export interface RuleBlock {
  id: string;
  condition: ConditionGroup;
  actions: Action[];
}

export interface RuleScope {
  kind: ScopeKind;
  roleIds?: string[];
  groupIds?: string[];
  userIds?: string[];
}

export interface RuleAdvanced {
  reverseOnFalse: boolean;
  enforceSystemWide: boolean;
}

export interface ActorRef {
  id: string;
  name: string;
}

/**
 * A persisted rule. blocks has length >= 1 (a simple rule is a single block).
 * `conflictCount` and `order` are server-owned / denormalized for fast list
 * rendering and are never edited client-side.
 */
export interface Rule {
  id: RuleId;
  formId: FormId;
  trigger: Trigger;
  blocks: RuleBlock[];
  scope: RuleScope;
  advanced: RuleAdvanced;
  status: RuleStatus;
  order: number;
  conflictCount: number;
  updatedAt: string; // ISO
  updatedBy: ActorRef;
}

// ── List view-model helpers ────────────────────────────────────────────────
export type RuleGroupBy = "ORDER" | "TRIGGER" | "FIELD";

export interface RulesListFilters {
  q: string;
  trigger: TriggerType | "ALL";
  status: RuleStatus | "ALL";
  hasConflicts: boolean;
  groupBy: RuleGroupBy;
}

export const DEFAULT_LIST_FILTERS: RulesListFilters = {
  q: "",
  trigger: "ALL",
  status: "ALL",
  hasConflicts: false,
  groupBy: "ORDER",
};
