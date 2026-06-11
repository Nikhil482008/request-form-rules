# Request Form Rules — Redesign Handoff

**Module:** Request Form Rules (ITSM admin) — Create / Edit rule experience + Rules List.
**Status:** Design complete + 5 interactive prototypes (clickable, runnable locally).
**Location:** `c:\Users\Nikhil Khemaria\Test4\`
**Last updated:** 2026-06-04

---

## 1. What this is

A redesign of the ITSM "Request Form Rules" module. A *rule* controls how a request form behaves (show/hide fields, make required, lock, set values, validate before submit) based on conditions, for specific people, at specific moments.

The work has two parts:

1. **Design** — information architecture, interaction model, wireframes, UX copy, conflict model, and a human-readable summary system (all captured in chat; key decisions summarized below).
2. **Prototypes** — 5 self-contained, runnable HTML prototypes exploring different Create/Edit directions, all sharing one Rules List table and a top-bar version switcher.

There is also a **Next.js/React component-architecture scaffold** under `src/` (types, contracts, component skeletons — no business logic), produced during the architecture phase.

---

## 2. File map

```
Test4/
├── HANDOFF.md                  ← this file
├── CLAUDE.md                   ← persistent project context (auto-loaded by Claude)
├── SESSION_LOG.md              ← per-session changelog (newest first)
├── serve.ps1                   ← tiny PowerShell static server (localhost:8000)
├── index.html                  ← Prototype Hub (served at "/") — tabs to switch all 5 versions
│
├── rule-studio-demo.html       ← Version 2 — structured form + the enterprise Rules List
├── rule-studio-v1.html         ← Version 1 — sentence-first builder
├── rule-studio-v3.html         ← Version 3 — block workspace
├── rule-studio-v4.html         ← Version 4 — starter cards
├── rule-studio-v5.html         ← Version 5 — guided composer (Intent → Logic → Scope → Impact)
│
├── Form rule                   ← empty stub file (original opened file; ignore)
│
└── src/                        ← Next.js/React architecture scaffold (types & contracts only, NOT wired)
    ├── app/forms/[formId]/rules/page.tsx
    └── features/form-rules/
        ├── types/rules.ts              domain types (Rule, Block, Condition, Action, enums)
        ├── api/mock-rules.ts           server-shaped mock data
        ├── hooks/useRulesList.ts       server-state hook (filter/group)
        ├── lib/summarize.ts            pure Rule → sentence generator
        ├── components/shared/          TriggerChip · StatusToggle · ConflictBadge
        └── components/list/            RulesListPage · RulesTable · RuleRow · RuleSummaryCell
                                        · ListFilters · BulkActionBar · RulesEmptyState
```

> **Note:** the `.html` prototypes and the `src/` scaffold are independent. The prototypes are the live, demonstrable artifact. The `src/` tree is the recommended production architecture (feature-first, React Query + isolated builder store) but contains no implementation logic and is not connected to a build.

---

## 3. How to run the prototypes (localhost)

No Node, npm, or build step is required. The prototypes are single HTML files that load React 18, Tailwind, and Babel from CDNs and serve over a tiny PowerShell HTTP server.

**Start the server:**
```powershell
# from any shell, run the bundled server (serves Test4/ on http://localhost:8000)
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Nikhil Khemaria\Test4\serve.ps1"
```
`serve.ps1` uses `System.Net.HttpListener` on `http://localhost:8000/` and serves files from `Test4\`. Leave it running; `Ctrl+C` stops it.

**Open the versions:**

| Version | URL |
|---|---|
| **Hub (default)** | http://localhost:8000/ — tabs for all 5 versions |
| V1 | http://localhost:8000/rule-studio-v1.html |
| V2 | http://localhost:8000/rule-studio-demo.html |
| V3 | http://localhost:8000/rule-studio-v3.html |
| V4 | http://localhost:8000/rule-studio-v4.html |
| V5 | http://localhost:8000/rule-studio-v5.html |

The dark **top bar** has a version dropdown to jump between v1–v5 (every file links to every other).

**Requirements / caveats:**
- Needs internet (React/Tailwind/Babel load from `unpkg` / `cdn.tailwindcss.com`).
- Opening a file directly (`file://`) also works for the app, but the version links assume the `localhost:8000` root — use the server.
- Each prototype keeps its own in-memory state; nothing persists (no backend). Refresh = reset.

---

## 4. The five prototype versions

All five share the **same Rules List table** (enterprise style, modeled on the real product screenshot) and the **same rule engine** (summary, conflict detection, preview). They differ only in the **Create / Edit** experience.

| Ver | Direction | Create/Edit mental model | Distinctive UI |
|---|---|---|---|
| **V1** | Sentence-first | Build a readable sentence | `WHEN … THEN … FOR … RUN IT WHEN …` as click-to-edit colored tokens |
| **V2** | Structured form | Familiar admin form (Freshservice-style) | Rule Name, Applies to / Execute On, Conditions (Match ALL/ANY), Actions |
| **V3** | Block workspace | Stack of self-contained IF→THEN cards | Collapsible blocks, duplicate/delete, per-block summary + inline preview/conflict, "Jump to block" |
| **V4** | Starter cards | Pick an intent, then complete it | Gallery of 8 starter cards → guided builder pre-filled by the card |
| **V5** | Guided composer | Intent → Logic → Scope → Impact | One calm column + persistent Impact rail; intent-first ("What do you want to control?"); multi-action via "+ also do this" |

**Recommendation for production:** **V5** is the most beginner-friendly while retaining enterprise depth (it was the synthesized "hybrid" direction). V2 is the strongest "familiar/safe" option (closest to the existing product). V3 is best for power users managing many rules at once.

### Per-version notes
- **V1** — `for` (audience) and `run it when` (timing) are inline tokens inside the block, matching the WHEN/THEN feel.
- **V2** — also hosts the canonical **Rules List** table (breadcrumb, search + filter, blue "Create Request Form Rule", columns: Name / Rule Execution On / Rule Applicable For / Rule Event / Created Date / Enabled / Actions, green toggles, row action icons). The Name column shows the rule's name with the plain-English summary as subtitle.
- **V3** — per-block self-contained editor with `When`/`Who` context chips, inline conflict ribbon, lightweight per-block "Preview result".
- **V4** — control-type starter gallery; selecting a card pre-configures the action, default timing, and which sections matter; "Validate before submit" opens condition-led.
- **V5** — intent-first with a "A specific field / The whole form" target toggle; behavior pre-filtered by control type; smart-defaulted timing chips; scope chips kept separate; flat conditions with Match all/any; right **Impact rail** (read-only summary, 2×2 facets, calm conflict line, "Test this rule").

---

## 5. Shared architecture inside the prototypes

Each HTML file is one `<script type="text/babel">` containing the whole app. Key shared pieces:

### Data model (conceptual)
```
Rule {
  id, name, description?,
  intent?, target?,                         // v4/v5 only
  trigger: { lifecycle, moment, fieldId? }, // lifecycle = new/edit/both; moment = load/change/submit
  scope:   { audience },                    // ALL | REQUESTERS | TECHNICIANS | LOGGED_IN
  blocks:  [ { id, match: ALL|ANY, mode?, conditions:[…], actions:[…] } ],
  advanced:{ reverseOnFalse, enforceSystemWide },
  status:  ENABLED|DISABLED,
  audit:   { createdBy, createdAt, modifiedBy, modifiedAt, version }
}
Condition { id, fieldId, op, value }        // value: string | string[] | undefined; op sets TEXT/CHOICE/MEMBERSHIP (see OP_SETS)
Group     { id, kind:"GROUP", match, conditions:[…] }  // blocks[].conditions may also hold one-level groups
Action    { id, type, fieldId, value? }     // type: SHOW|HIDE|MANDATE|OPTIONAL|ENABLE|DISABLE|SET_VALUE
```
Lookups: `FIELD_GROUPS`+`FIELDS` (grouped — Requester / Logged-in User / Request / Global; ~40 fields, ids like `request__priority`), `FORM_FIELDS`, `OP_SETS`, `OPERATORS`, `OPT`, `AUDIENCES`, `MOMENTS`, `ACTION_TYPES`. Shared **`ConditionsEditor`** = DD1 grouped fields → DD2 field-dependent ops → DD3 op-dependent value (single / multi-chips / none) + nested groups.

### Engine functions (pure, reused everywhere)
- `summarize(rule)` / `v4Summary` / `v5Summary` — Rule → human-readable sentence (the comprehension layer; never hand-edited).
- `detectConflicts(rule, allRules)` — contradiction / overlap (redundant) detection by field × overlapping trigger × scope.
- `simulate(draft, allRules, persona, values, moment)` — preview: which blocks match + resulting field state + cross-rule effects.
- `evalBlock`, `condClause`, `actClause`, `genSlug`, etc.

### Seed data
8 demo rules (`SEED`) with a **built-in conflict**: Rule 1 (mandate Assignee) vs Rule 4 (make Assignee optional) on the same trigger — so conflict badges/inline warnings are visible out of the box.

### Version switcher
`VERSIONS` array + `currentVersionId()` in each file render the dark top bar dropdown. Identical block in all files; adding a version = add one line + one `if` in each file (or just the new file + links).

---

## 6. Key design decisions (the "why")

- **Intent over mechanics.** The biggest problem in the original was users configuring framework (trigger/scope) before expressing intent. Every version leads with *what the admin wants*, not the engine's data model.
- **The human-readable summary is the source of truth for comprehension** — always generated from the rule, never typed, so it can't drift from the logic. Used on the list, in the builder, and in conflict messages.
- **One rule primitive: the IF→THEN block.** "One condition → many actions" and "many IF→THEN" are the same block model at two scales (no mode switch).
- **Conflicts are calm + inline.** Surfaced where you're editing (amber on the offending field) + a quiet aggregate; never a heavy red panel; **save is never hard-blocked** (high-severity asks once). Taxonomy: Contradictory (high) / Overlap-Redundant (medium) / Order-sensitive (low).
- **Plain language only.** No "lifecycle / moment / audience / execution model" in the visible UI — mapped to "when the form opens / while filling / on submit", "who should this affect", etc.
- **Progressive disclosure.** Defaults make a valid rule instantly; advanced (reverse-when-false, enforce system-wide, new/edit forms) stays collapsed.
- **Competitor lessons applied:** ManageEngine's Trigger→Condition→Action spine, Zoho's visual blocks, Freshservice/Zendesk's natural-language readability.

Full design deliverables (IA, screen structure, copy tables, tooltip copy, conflict treatment, summary grammar, interaction model, wireframes) for each phase live in the chat history; V5's is the most complete and is the recommended spec.

---

## 7. Known limitations / risks

- **CDN dependency** — prototypes need internet; for an offline demo, vendor React/Tailwind/Babel locally.
- **No persistence / no backend** — all state is in-memory; refresh resets. Conflict/preview run client-side on mock data.
- **Nested condition groups** (one level) are now wired in every builder via the shared `ConditionsEditor` + engine (`evalGroup`, group-aware `condClause`). Deeper nesting not modeled. **(This HANDOFF predates V6 + the grouped-field condition overhaul — see SESSION_LOG.md / CLAUDE.md for current detail.)**
- **Preview** uses the shared rule-level `simulate`; it does not evaluate per-block `when/who` overrides (V3) and **flattens** nested groups (no per-group eval).
- **Safety-net scripts** — ALL 6 versions include a small self-compile `<script>` at the end of the file that surfaces a precise Babel error on screen if the file ever fails to compile (silent on success). Harmless; remove before any production use.
- **`src/` scaffold** is types/contracts/skeletons only — no logic, not connected to a Next.js project or the prototypes.
- **Babel-in-browser** transpiles on load (fine for a prototype, not for production performance).

---

## 8. Recommended next steps

1. **Pick a direction** (recommend V5; V2 as the safe/familiar fallback) and lock the spec.
2. **Stand up a real app** from the `src/` architecture: Next.js + Tailwind + shadcn/ui, TanStack Query for server state, an isolated builder store for the draft. Replace `mock-rules.ts` with the real API per the documented contracts.
3. **Build the conflict + summary engines server-side** (authoritative), exposing `POST /conflicts/detect` and `POST /preview` that accept an unsaved draft.
4. **Port the chosen builder UI** from the prototype to real components (the prototype is the visual + interaction reference).
5. **Add the deferred depth:** nested condition groups, full audit/version history with restore, bulk operations on the list, the field-config "rules on this field" lens.
6. **Accessibility + i18n pass** on the summary grammar and all copy.
7. **Remove** the CDN reliance and the self-compile safety-net scripts.

---

## 9. Quick reference

- **Server:** `serve.ps1` → http://localhost:8000/ (Test4 root).
- **Default page:** `/` → `index.html` (Prototype Hub; tabs for v1–v5). V2 = `/rule-studio-demo.html`.
- **Switch versions:** top-bar dropdown, or open `rule-studio-v{1..5}.html`.
- **Built-in conflict to demo:** Rule 1 ↔ Rule 4 (Assignee mandate vs optional).
- **Try the engine:** Create/Edit a rule → watch the live summary, the conflict line, and "Test / Preview".
