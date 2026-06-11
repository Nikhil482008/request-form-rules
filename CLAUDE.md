# CLAUDE.md — Request Form Rules Redesign

> Persistent project context. Read this first in any new session. For deep detail see
> [HANDOFF.md](./HANDOFF.md). For "what changed last" see [SESSION_LOG.md](./SESSION_LOG.md) (newest entry first).

---

## What this project is

A redesign of an **ITSM "Request Form Rules"** module (admin feature). A *rule* controls how a
request form behaves — show/hide a field, make it required/optional, lock/unlock it, set a default
value, or validate before submit — based on **conditions**, for specific **people**, at specific
**moments**.

The deliverables are:
1. **Design** — IA, interaction model, wireframes, UX copy, conflict model, human-readable summary
   system (produced across the chat; V5's spec is the most complete and is the recommended one).
2. **5 interactive prototypes** — self-contained, runnable HTML files exploring different
   Create/Edit directions. They all share ONE Rules List table + ONE rule engine + a top-bar
   version switcher.
3. **`src/`** — a Next.js/React component-architecture scaffold (types & contracts only, no logic,
   not wired to a build). This is the recommended production architecture, not a running app.

The original problems being solved: high cognitive load, trigger/framework-first configuration,
duplicated trigger selection, rules hard to understand after creation, low adoption.

---

## Where things live

Working folder: **`c:\Users\Nikhil Khemaria\Test4\`**

```
Test4/
├── CLAUDE.md                 ← this file (persistent context)
├── HANDOFF.md                ← full handoff / deep reference
├── SESSION_LOG.md            ← running per-session changelog (update at end of each session)
├── V8-STRATEGY.md            ← V8 strategic direction ("Form Canvas")
├── V8-SPEC.md                ← V8 product + screen specification
├── V8-PLAN.md                ← V8 implementation plan + build order
├── serve.ps1                 ← PowerShell static server (localhost:8000)
├── README.md                 ← public-facing readme w/ live link (+ .gitignore alongside)
├── index.html                ← Prototype Hub (served at "/") — tabs to switch all 6 versions
├── rule-studio-demo.html     ← V2 + the shared enterprise Rules List table
├── rule-studio-v1.html       ← V1 sentence-first builder
├── rule-studio-v3.html       ← V3 block workspace
├── rule-studio-v4.html       ← V4 starter cards
├── rule-studio-v5.html       ← V5 guided composer (Intent → Logic → Scope → Impact)  [recommended]
├── rule-studio-v6.html       ← V6 familiar drawer, refined — Option B (A/C hidden)
├── rule-studio-v7.html       ← V7 Progressive Workspace (V3 + progressive disclosure)
├── rule-studio-v8.html       ← V8 Guided form canvas (working interactive prototype)
├── Form rule                 ← empty stub; ignore
└── src/features/form-rules/  ← Next.js architecture scaffold (types/contracts/skeletons only)
```

---

## How to run (no Node/npm/build — by design)

The prototypes are single HTML files loading React 18 + Tailwind + Babel from CDNs, served by a
tiny PowerShell `HttpListener`.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Nikhil Khemaria\Test4\serve.ps1"
```
Then open the **Hub (default): http://localhost:8000/** — top tabs switch all 5 versions in one page
(deep-link with `#v1`…`#v5`). Direct files also work: `/rule-studio-v1.html`,
`/rule-studio-demo.html` (V2), `/rule-studio-v3.html`, `/rule-studio-v4.html`, `/rule-studio-v5.html`.

Each version also has its own in-page dark version dropdown. Needs internet (CDNs). No persistence (refresh = reset).
`serve.ps1` default route `/` = `index.html` (the hub).

**Environment facts:** Windows 11, PowerShell. **No Node, no real Python** (only the MS Store
`python.exe` stub, which doesn't work) — so the PowerShell server is the only way to serve, and
there's no JS engine on the box to compile/lint JSX outside the browser.

**Live deployment (GitHub Pages):** Test4 is a git repo (`main`) published at
**https://github.com/Nikhil482008/request-form-rules** (public) and served live at
**https://nikhil482008.github.io/request-form-rules/** (the hub). Update the live site with
`git -C "<Test4>" add -A; git commit -m "…"; git push` (Pages rebuilds in ~1 min). **IMPORTANT:** the
`VERSIONS` hrefs must stay **relative** (`href:"rule-studio-*.html"`, no leading `/`) — absolute paths
404 on the project Pages URL. `gh` CLI is at `C:\Program Files\GitHub CLI\gh.exe` (often not on PATH
in fresh shells); auth is stored in the keyring as account `Nikhil482008`.

---

## The versions (Create/Edit direction only; list + engine are shared)

| Ver | File | Direction | Distinctive UI |
|---|---|---|---|
| V1 | rule-studio-v1.html | Sentence-first | `WHEN … THEN … FOR … RUN IT WHEN …` editable colored tokens |
| V2 | rule-studio-demo.html | Structured form (Freshservice-style) | Rule Name, Applies to / Execute On, Conditions (Match ALL/ANY), Actions; **hosts the canonical Rules List table** |
| V3 | rule-studio-v3.html | Block workspace | Stack of self-contained IF→THEN cards; duplicate/delete; per-block summary/preview/conflict |
| V4 | rule-studio-v4.html | Starter cards | Intent gallery (8 cards) → guided builder pre-filled by the card |
| V5 | rule-studio-v5.html | Guided composer | Intent → Logic → Scope → Impact; intent-first; persistent Impact rail; multi-action ("+ also do this") |
| V6 | rule-studio-v6.html | Familiar drawer, refined | **Option B only** (A & C hidden). Numbered section cards (intent-first). Extras: group-to-group AND/OR connectors, guided timing dropdown (`GuidedSelect` split popover), action/operator hint subtitles, **actionable conflict resolution** (resolve actions + states per conflict). `ConditionsEditor`/`GuidedSelect`/`ConflictReview` here **diverge** from the shared copies. |
| V7 | rule-studio-v7.html | **Progressive workspace** | Cloned from V3 + progressive disclosure — each block reveals in order: context (Runs/For) → conditions → outcome → preview, with plain-language copy. |
| V8 | rule-studio-v8.html | **Guided form-rule canvas (reference-styled)** | The `Flow` reference's UI ported to form rules: **scoped themed canvas** (`.v8root[data-v8theme]` dark default + light toggle, CSS vars `--v8-*` in the head `<style>`, grain + glow layers), **role-marker rail** with **DO · IF · WHEN · FOR** stations, inline **editable underlined slots → frosted `V8Drop` popovers with a Quick Help card**, themed **context rail** (live plain-English overview + field impact + grouped conflicts), **how-it-works stepper** + **behavior reference** modals, themed **Test** preview (runs `simulate`), undo/redo, "On the _New Incident_ form…" context line. **Progressive disclosure:** a new rule starts **empty** (no prefilled values) and reveals one station at a time — WHEN → (IF / "add a condition or run always") → DO → FOR — gated by `isNew` + completion flags; the rail shows a "How it works" prompt until WHEN is set, then the summary/impact/conflicts build up gradually (computed on a sanitized `clean` draft so partial data never throws). Motion: `v8in` fade+translate on reveal, `v8beckon` pulse on the next empty slot, soft-pop popovers. **The theming is scoped to `.v8root` so the shared switcher/table are untouched.** Reuses the shared engine/Rule model/`detectConflicts`/`simulate`/`summarize` unchanged (conditions rendered as inline slots, NOT the light `ConditionsEditor`). V8 helpers: `RuleStudioV8`, `V8Drop`, `V8MenuPanel`, `MenuRow`, `V8Slot`, `V8Station`, `Marker`, `MatchChip`, `Conn`, `V8HowItWorks`, `V8BehaviorRef`, `V8TestModal`, `RV`, `VI`, `BVERB`/`bverb`, `V8_HELP`, `BEHAVIOR_DOCS`, `V8_STEPS`, `lifeFriendly`, `fieldShort`, `valDisplay`. Spec: V8-STRATEGY/SPEC/PLAN.md. |

**Visibility:** V5 and V6 Options A & C are **hidden** (files kept, unlinked from the switchers). Active set: V1 · V2 · V3 · V4 · V6 (Option B) · V7 · V8 (scaffold). V2 = safe/familiar fallback; V3/V7 = block-based / guided (V7 = progressive); V6 (Option B) = the "evolve the current screen" path.

> **V6 notes:** cloned from V2; the `RuleStudio` renders `OptionA`/`OptionB`/`OptionC` by `mode`. B & C operate on `blocks[0]` (single-set) but preserve extra blocks on edit. The Action/Validate mode radios were removed from V2 **and** all V6 options (`setBlockMode` now unused). V6 **does** carry a self-compile safety-net script. **V6's `ConflictReview` is now actionable** (diverged from the shared copy): each conflict item offers the 7 allowed actions — View conflicting rule · Edit the other rule · Disable conflicting rule · Let this rule win · Keep both by narrowing conditions · Merge with existing rule · Resolve later — surfaced as 1–2 inline primary buttons + a "More actions" overflow, with per-item resolution states (Needs review / Resolved / Accepted / Ignored), an inline read-only peek, and a top-level summary (found / can-be-resolved / need-review / handled). Wired via `RuleStudio` props `onEditRule`+`onDisableRule` up to `App` (`startEdit`/`disableRule`); local `resolutions` map keyed by `conflictKey(c)`.

---

## Shared architecture (inside every prototype)

Each HTML file is ONE `<script type="text/babel">` containing the whole app. Shared pieces:

**Data model (conceptual):**
```
Rule { id, name, description?, intent?, target?,
       trigger:{lifecycle, moment, fieldId?}, scope:{audience},
       blocks:[{id, match: ALL|ANY, mode?, conditions:[…], actions:[…]}],
       advanced:{reverseOnFalse, enforceSystemWide}, status, audit }
Group     { id, kind:"GROUP", match: ALL|ANY, conditions:[Condition…] }   // ONE level of nesting; block.conditions may hold these
Condition { id, fieldId, op, value }   // value: string (single) | string[] (multi) | undefined (none)
   // op sets by field kind:  TEXT = EQUALS|NOT_EQUALS|STARTS_WITH|ENDS_WITH|CONTAINS|IS_NOT_BLANK|IS_BLANK
   //   CHOICE = MATCH_ANY|MATCH_ALL|IS_EMPTY|IS_NOT_EMPTY   ·   MEMBERSHIP = IN|NOT_IN   (+ legacy BECOMES/GT/LT)
Action    { id, type, fieldId, value? } // type: SHOW|HIDE|MANDATE|OPTIONAL|ENABLE|DISABLE|SET_VALUE
```
Lookups: `FIELD_GROUPS`+`FIELDS` (grouped — Requester / Logged-in User / Request / Global; each field is
`{id, group, name, label:"Group - Field", type, options, opset}`), `FORM_FIELDS` (Request+Global = action
targets), `OP_SETS`, `OPERATORS` (each has `val`: single|multi|none), `OPT` (shared option lists),
`AUDIENCES`/`AUD_FRIENDLY`, `MOMENTS`, `ACTION_TYPES`. Helpers: `fieldOf`,`fLabel`,`fieldOps`,`opVal`,`defaultVal`.

**Conditions UI = ONE shared `ConditionsEditor`** (identical in all 6 files) — grouped+searchable field DD1,
field-dependent operator DD2, op-dependent value DD3 (single / multi-select **chips + "Selected Items"** /
none), and one level of nested **condition groups** (Add Condition · Add Condition Group · Remove All
Condition). Each builder mounts it: `<ConditionsEditor block={b} mutate={fn=>update(d=>fn(d.blocks[bi]))} />`.

**Engine functions (pure, reused):** `summarize`/`v4Summary`/`v5Summary` (Rule → sentence),
`detectConflicts(rule, allRules)` (contradiction/overlap), `simulate(...)` (preview), `evalBlock`/`evalGroup`/
`evalCondition`, `condClause`/`condText`, `flatConds`/`firstLeaf`, `actClause`, `genSlug`.

**Seed data:** demo rules (V1: 4, others: 8) with a built-in conflict (Rule 1 mandate Assignee ↔ Rule 4
optional Assignee) so conflict UI is visible out of the box. Fields use ids like `request__priority`.

**Version switcher:** `VERSIONS` array + `currentVersionId()` near the bottom of each file.

---

## Design principles (the "why" — keep these intact)

- **Intent over mechanics** — lead with what the admin wants, not the engine's trigger/scope.
- **Summary is the source of truth for comprehension** — always generated from the rule, never
  typed; used on the list, in the builder, and in conflict messages, so it can't drift.
- **One primitive: the IF→THEN block** — "one condition → many actions" and "many IF→THEN" are the
  same model at two scales (no mode switch).
- **Conflicts are calm + inline** — amber on the offending field + a quiet aggregate; never a heavy
  red panel; **save is never hard-blocked** (high-severity asks once). Taxonomy:
  grouped into four human-friendly categories by the shared `ConflictReview` panel:
  Contradictory · Duplicate · Overlapping Conditions · Rules Running at the Same Time.
- **Plain language only** — NO visible "lifecycle / moment / audience / execution model". Map to
  "when the form opens / while filling / when submitted", "who should this affect", etc.
- **Progressive disclosure** — defaults make a valid rule instantly; advanced
  (reverse-when-false, enforce system-wide, new/edit forms) stays collapsed.

---

## Rules for editing this project (IMPORTANT)

1. **Do NOT change the Rules List table or the top-bar version switcher** when redesigning a
   Create/Edit screen — they are shared and must stay consistent across versions (this has been a
   standing constraint for every version).
2. **Each new version = a new `rule-studio-vN.html`** cloned from `rule-studio-demo.html` (V2),
   replacing ONLY the `RuleStudio` component. Then add the new version to the `VERSIONS` array +
   `currentVersionId()` in **all** files so the switcher lists it everywhere.
3. **Keep the shared engine working** — `summarize`, `detectConflicts`, `simulate`, `condClause`,
   `actClause`, `genSlug`, `evalBlock`/`evalGroup`/`evalCondition`, `flatConds` are reused by the
   (unchanged) list. The data model (`FIELDS`/`OP_SETS`/`OPERATORS`/…), the engine, and the shared
   **`ConditionsEditor`** component are **duplicated byte-identically across all 6 files** — change in
   ONE and replicate to keep parity. New builders may add their own `vNSummary`/helpers but must not break these.
4. **After any edit, verify before declaring done:**
   - `Invoke-WebRequest http://localhost:8000/<file>` returns 200, then open it.
   - Grep the file: no nested-arrow `forEach(x=>y.forEach(...))` that closes with `})` instead of
     `}))` (see gotchas), backticks even, curly quotes `“`/`”` balanced, exactly one
     `function RuleStudio`.
5. **The user is strict about "no errors on screen."** ALL 6 versions now carry a self-compile safety-net
   `<script>` at the file end that prints the exact Babel error on screen if compilation fails
   (silent on success). Keep it until a version is confirmed healthy; remove only when asked.

---

## Gotchas learned (don't rediscover these)

- **Babel "Script error." with no detail** = a parse error thrown from the cross-origin CDN babel
  script; `window.onerror` is sanitized. To see the REAL error, self-compile same-origin:
  `Babel.transform(document.querySelector('script[type=text/babel]').textContent,{presets:['react']})`
  in a try/catch and print `err.message` (that's exactly what the safety-net scripts do).
- **The nested-arrow `forEach` paren bug:** `a.forEach(o=>o.blocks.forEach(b=>{…}))` needs to close
  with `}))` (three closers), not `})`. This caused a blank V3. Always grep for it after edits.
- **No JS engine on the box** to compile/validate outside the browser — rely on the in-page
  self-compile diagnostic + careful grep checks.
- **Edit tool needs the file Read in the session first** (copies of files made via PowerShell must
  be Read before Edit).

---

## Known limitations / deferred work

- CDN dependency (needs internet); no backend/persistence; conflict+preview run client-side on mock data.
- Nested condition groups (one level) ARE now wired in every builder's `ConditionsEditor` + engine
  (`evalGroup`, group-aware `condClause`); but `simulate`/preview **flattens** groups (no per-group eval),
  and deeper nesting isn't modeled.
- The field→operator-set mapping (which fields are `in/not in` vs `Match Any`, etc.) and `OPT` option lists
  are reasonable placeholders — tune to the real product.
- Preview uses rule-level `simulate` (ignores per-block when/who in V3; flattens nested groups).
- `src/` is contracts/skeletons only — not connected to a Next.js project or the prototypes.
- Recommended next: pick a direction → build from `src/` (Next.js + Tailwind + shadcn + TanStack
  Query) → server-side conflict/summary/preview engines → port the chosen builder → add nested
  groups, audit/version history, bulk ops, field-config "rules on this field" lens → a11y/i18n →
  remove CDN + safety-net scripts.

---

## End-of-session habit

Before ending a session, **append a new entry to the top of [SESSION_LOG.md](./SESSION_LOG.md)**
summarizing what changed, the current state, and next steps — so the next session has a clean handoff.
