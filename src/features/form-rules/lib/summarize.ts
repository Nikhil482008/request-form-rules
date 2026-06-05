/**
 * summarize() — turns a Rule into a human-readable sentence.
 *
 * This is the single source of the comprehension layer. The list column, the
 * detail header, and the builder's live summary all call it, so the wording can
 * never drift from the actual logic. Pure & React-free → unit-testable in
 * isolation, no rendering required.
 *
 * Grammar:  WHEN <trigger> [, IF <conditions>] , THEN <actions> [, for <scope>]
 *           [ "+ also …" per extra block ] [ advanced clauses ]
 */
import type {
  Action,
  ActionType,
  Condition,
  ConditionGroup,
  Operator,
  Rule,
  RuleBlock,
  RuleScope,
} from "../types/rules";

// ── Fragment vocabulary ─────────────────────────────────────────────────────
const OPERATOR_PHRASE: Record<Operator, string> = {
  EQUALS: "is",
  NOT_EQUALS: "is not",
  GREATER_THAN: "is greater than",
  LESS_THAN: "is less than",
  CONTAINS: "contains",
  IS_EMPTY: "is empty",
  IS_NOT_EMPTY: "is not empty",
  IN: "is one of",
  NOT_IN: "is not one of",
};

/** Action verb + whether it reads as "<verb> the <field>" or "<verb> <field>". */
const ACTION_PHRASE: Record<ActionType, (field: string, value?: string) => string> = {
  SHOW: (f) => `show ${f}`,
  HIDE: (f) => `hide ${f}`,
  REQUIRE: (f) => `make ${f} required`,
  OPTIONAL: (f) => `make ${f} optional`,
  ENABLE: (f) => `enable ${f}`,
  DISABLE: (f) => `disable ${f}`,
  CLEAR_VALUE: (f) => `clear ${f}`,
  SET_VALUE: (f, v) => `set ${f} to ${v ?? "a value"}`,
};

const VALUELESS_OPERATORS: Operator[] = ["IS_EMPTY", "IS_NOT_EMPTY"];

// ── Fragment builders ───────────────────────────────────────────────────────
function triggerPhrase(rule: Rule): string {
  switch (rule.trigger.type) {
    case "ON_LOAD":
      return "the form loads";
    case "ON_FIELD_CHANGE":
      return `${rule.trigger.fieldLabel ?? "a field"} changes`;
    case "ON_SUBMIT":
      return "the form is submitted";
  }
}

function conditionPhrase(c: Condition): string {
  const op = OPERATOR_PHRASE[c.operator];
  if (VALUELESS_OPERATORS.includes(c.operator)) return `${c.fieldLabel} ${op}`;
  const value = Array.isArray(c.value) ? c.value.join(", ") : String(c.value ?? "");
  return `${c.fieldLabel} ${op} ${value}`;
}

function conditionGroupPhrase(group: ConditionGroup): string {
  const parts = group.conditions.map(conditionPhrase);
  const nested = (group.groups ?? []).map((g) => `(${conditionGroupPhrase(g)})`);
  const all = [...parts, ...nested];
  if (all.length === 0) return "";
  const joiner = group.logic === "AND" ? " and " : " or ";
  return all.join(joiner);
}

function actionPhrase(a: Action): string {
  const value = a.value != null ? String(a.value) : undefined;
  return ACTION_PHRASE[a.type](a.targetFieldLabel, value);
}

/** Joins a list with commas + a final "and" → "x, y and z". */
function listJoin(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function blockPhrase(block: RuleBlock): string {
  const cond = conditionGroupPhrase(block.condition);
  const actions = listJoin(block.actions.map(actionPhrase));
  return cond ? `if ${cond}, ${actions}` : actions;
}

function scopePhrase(scope: RuleScope): string {
  switch (scope.kind) {
    case "ALL":
      return "all users";
    case "ROLES":
      return countPhrase(scope.roleIds?.length, "role");
    case "GROUPS":
      return countPhrase(scope.groupIds?.length, "group");
    case "USERS":
      return countPhrase(scope.userIds?.length, "user");
  }
}

function countPhrase(n: number | undefined, noun: string): string {
  const count = n ?? 0;
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function advancedClauses(rule: Rule): string[] {
  const out: string[] = [];
  if (rule.advanced.reverseOnFalse) {
    out.push("and reverses these actions when the condition stops being true");
  }
  if (rule.advanced.enforceSystemWide) {
    out.push("enforced system-wide");
  }
  return out;
}

// ── Public API ──────────────────────────────────────────────────────────────
/**
 * Full sentence summary, e.g.
 * "When Category changes, if Category is Hardware, show Asset Tag and make
 *  Asset Tag required — for all users."
 */
export function summarize(rule: Rule): string {
  const [first, ...rest] = rule.blocks;
  const head = `When ${triggerPhrase(rule)}, ${blockPhrase(first)}`;
  const more = rest.map((b) => `also ${blockPhrase(b)}`);
  const body = listJoin([head, ...more]);

  const tail = [`for ${scopePhrase(rule.scope)}`, ...advancedClauses(rule)];
  return capitalize(`${body} — ${tail.join(", ")}.`);
}

/**
 * Compact, two-part summary for dense list rows: the trigger/condition clause
 * and the action clause are returned separately so the row can render them on
 * two lines (matching the wireframe) without re-parsing a sentence.
 */
export interface CompactSummary {
  when: string; // "When Category changes, if Category is Hardware"
  then: string; // "show Asset Tag and make Asset Tag required"
}

export function summarizeCompact(rule: Rule): CompactSummary {
  const [first] = rule.blocks;
  const cond = conditionGroupPhrase(first.condition);
  const when = cond
    ? `When ${triggerPhrase(rule)}, if ${cond}`
    : `When ${triggerPhrase(rule)}`;

  const firstThen = listJoin(first.actions.map(actionPhrase));
  const extra = rule.blocks.length - 1;
  const then = extra > 0 ? `${firstThen} (+${extra} more block${extra === 1 ? "" : "s"})` : firstThen;

  return { when: capitalize(when), then };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
