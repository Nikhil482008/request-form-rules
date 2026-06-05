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
├── serve.ps1                 ← PowerShell static server (localhost:8000)
├── index.html                ← Prototype Hub (served at "/") — tabs to switch all 5 versions
├── rule-studio-demo.html     ← V2 + the shared enterprise Rules List table
├── rule-studio-v1.html       ← V1 sentence-first builder
├── rule-studio-v3.html       ← V3 block workspace
├── rule-studio-v4.html       ← V4 starter cards
├── rule-studio-v5.html       ← V5 guided composer (Intent → Logic → Scope → Impact)  [recommended]
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

---

## The 5 versions (Create/Edit direction only; list + engine are shared)

| Ver | File | Direction | Distinctive UI |
|---|---|---|---|
| V1 | rule-studio-v1.html | Sentence-first | `WHEN … THEN … FOR … RUN IT WHEN …` editable colored tokens |
| V2 | rule-studio-demo.html | Structured form (Freshservice-style) | Rule Name, Applies to / Execute On, Conditions (Match ALL/ANY), Actions; **hosts the canonical Rules List table** |
| V3 | rule-studio-v3.html | Block workspace | Stack of self-contained IF→THEN cards; duplicate/delete; per-block summary/preview/conflict |
| V4 | rule-studio-v4.html | Starter cards | Intent gallery (8 cards) → guided builder pre-filled by the card |
| V5 | rule-studio-v5.html | Guided composer | Intent → Logic → Scope → Impact; intent-first; persistent Impact rail; multi-action ("+ also do this") |

**Recommended for production: V5** (most beginner-friendly + enterprise depth). V2 = safe/familiar fallback. V3 = best for power users with many rules.

---

## Shared architecture (inside every prototype)

Each HTML file is ONE `<script type="text/babel">` containing the whole app. Shared pieces:

**Data model (conceptual):**
```
Rule { id, name, description?, intent?, target?,
       trigger:{lifecycle, moment, fieldId?}, scope:{audience},
       blocks:[{id, match: ALL|ANY, mode?, conditions:[…], actions:[…]}],
       advanced:{reverseOnFalse, enforceSystemWide}, status, audit }
Condition { id, fieldId, op, value }   // op: BECOMES|EQUALS|NOT_EQUALS|GREATER_THAN|LESS_THAN|CONTAINS|IS_EMPTY|IS_NOT_EMPTY
Action    { id, type, fieldId, value? } // type: SHOW|HIDE|MANDATE|OPTIONAL|ENABLE|DISABLE|SET_VALUE
```
Lookups: `FIELDS`, `AUDIENCES`/`AUD_FRIENDLY`, `MOMENTS`, `OPERATORS`, `ACTION_TYPES`.

**Engine functions (pure, reused):** `summarize`/`v4Summary`/`v5Summary` (Rule → sentence),
`detectConflicts(rule, allRules)` (contradiction/overlap), `simulate(...)` (preview),
`evalBlock`, `condClause`, `actClause`, `genSlug`.

**Seed data:** 8 demo rules with a built-in conflict (Rule 1 mandate Assignee ↔ Rule 4 optional
Assignee) so conflict UI is visible out of the box.

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
  Contradictory (high) / Overlap-Redundant (medium) / Order-sensitive (low).
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
   `actClause`, `genSlug`, `evalBlock` are reused by the (unchanged) list. New builders may add
   their own `vNSummary`/helpers but must not break these.
4. **After any edit, verify before declaring done:**
   - `Invoke-WebRequest http://localhost:8000/<file>` returns 200, then open it.
   - Grep the file: no nested-arrow `forEach(x=>y.forEach(...))` that closes with `})` instead of
     `}))` (see gotchas), backticks even, curly quotes `“`/`”` balanced, exactly one
     `function RuleStudio`.
5. **The user is strict about "no errors on screen."** V3/V4/V5 carry a self-compile safety-net
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
- V5 nested condition groups NOT wired (conditions are flat with Match all/any).
- Preview uses rule-level `simulate` (ignores per-block when/who in V3 and nested groups in V5).
- `src/` is contracts/skeletons only — not connected to a Next.js project or the prototypes.
- Recommended next: pick a direction → build from `src/` (Next.js + Tailwind + shadcn + TanStack
  Query) → server-side conflict/summary/preview engines → port the chosen builder → add nested
  groups, audit/version history, bulk ops, field-config "rules on this field" lens → a11y/i18n →
  remove CDN + safety-net scripts.

---

## End-of-session habit

Before ending a session, **append a new entry to the top of [SESSION_LOG.md](./SESSION_LOG.md)**
summarizing what changed, the current state, and next steps — so the next session has a clean handoff.
