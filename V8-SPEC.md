# V8 Product & Screen Specification
### "Form Canvas: Behaviors Coached onto a Living Form" · light theme

> The concrete product + screen spec for Version 8. Builds on [V8-STRATEGY.md](./V8-STRATEGY.md).
> Implementation plan: [V8-PLAN.md](./V8-PLAN.md). Project context: [CLAUDE.md](./CLAUDE.md).

**Palette (matches existing prototypes):** white / slate-50 surfaces, slate-700 text, **sky-500** primary, **amber** attention/conflict, **emerald** safe/resolved, **violet** overlap. Calm, enterprise, never red-alarm.

**Reconciliation (form-as-canvas + node/block building):** the **form** is the always-visible spatial map (what does this affect / what will the form look like). A **behavior block** is what unfolds when you touch a field — a small left-to-right node path (how the rule unfolds). The block is the bridge that gives the reference's node feel without a free-floating graph.

---

## 1. Information Architecture

| Surface | Role | Visible |
|---|---|---|
| **A · Form Canvas** (hero) | the real form (runtime render); spatial map + truth for *impact*; each field is a behavior anchor | always |
| **B · Behavior Block / Rule Path** | the node model **WHEN · IF · THEN · FOR · IMPACT**; truth for *how the rule reads* | on select/create |
| **C · Inspector** | long-tail only: Match-any, nested groups, exotic operators, lifecycle, system-wide, set-once/held; **≤5 visible controls typical** | on demand |
| **D · Rules Hub** | governance: list, run-order = list-order, history, rollback; same Summary + conflict language as the canvas | separate screen |

Object hierarchy: `Form → Field → Behavior (one IF→THEN) → Rule (may drive several behaviors)` — one primitive at two scales, no mode switch.

**The 6 concepts have fixed homes:** When → **WHEN** node + Summary clause · Conditions → **IF** node(s) · Action → **THEN** verb chip · Who → **FOR** node · Impact → canvas reacting + "Final state" · Conflicts → same-field spatial + cross-field Relationships.

---

## 2. Screen Layout

```
TOP BAR     Form: New Incident ▾   "Make Department required when Category is Hardware"   [Draft][⚠ 2][✨][Publish]
TOOLBAR     ◉ Build  ○ Try     ⌕     ☑ only fields with behaviors
WORKSPACE   ┌ CANVAS (~60%) ─────────────────┐  ┌ RAIL (~40%) ────────────────┐
            │ the living form (runtime render)│  │ RULE PATH · Department       │
            │  Category [Hardware ▾]          │  │ ① WHEN  While filling ▾      │
            │  Department * [______] ⚠        │  │ ② IF    Category = Hardware  │
            │   └ Required when Category=HW   │  │ ③ THEN  Require Department    │
            │   └ ⚠ 2 rules meet here ▸       │  │ ④ FOR   Everyone ▾           │
            │  Priority [_____] +Add behavior │  │ ⑤ IMPACT ▷ Try to see it     │
            └─────────────────────────────────┘  │ ⌄ Advanced                   │
FOOTER      [?] How it works                      └──────────────────────────────┘
```

- **Top bar:** template selector · generated **Summary (read-only caption)** · state chips (Draft, amber aggregate, ✨ AI accelerator, Publish gate).
- **Canvas (~60%):** real form, admin "edit" treatment; **Build | Try** segmented control; field verb-chips with "+N more" cap + "only fields with behaviors" filter; single transient thread for the selected behavior.
- **Rail (~40%):** Rule Path (B) deepening into the Inspector (C) only for long-tail; multi-behavior stack with named "Final state" winner + reorder.
- **Narrow / 200% zoom:** Build/Inspect toggle (canvas OR rail) — never a modal drawer.

---

## 3. Main Interaction Flow (Build)

Orient → **Point** (click field) → **Choose behavior** (intent-first verb, instantly valid) → **Describe situation on canvas** (click source field, inline popover; thread animates) → **Prove** (flip to Try, type) → **Why/impact** → **Conflict** (if any) → **Publish**. The simple 80% case is built entirely on the canvas; the Inspector is long-tail only. Test: if "Department required when Category is Hardware" rivals the V2 form in visible inputs, the inversion failed.

---

## 4. Progressive Disclosure Sequence

```
Pick verb        → ③ THEN appears, valid.            "Department is now Required."
Click only when… → ② IF appears (inline on source).  "…when Category is Hardware."
                 → ① WHEN auto-fills (smart default), calm chip.
Optional         → ④ FOR stays collapsed unless opened.
Flip to Try      → ⑤ IMPACT becomes live.
Add complexity   → Inspector reveals Match-any / groups / lifecycle, one control at a time.
```

Rules: defaults make "pick verb" alone valid; complexity appears *spatially*; the "Advanced" junk drawer is dissolved — each power feature surfaces on its own justified trigger.

---

## 5. Helper-Text Strategy (four tiers)

| Tier | Purpose | Example copy |
|---|---|---|
| **Ambient** | tell a blank canvas what to do | "Click any field to tell it how to behave." |
| **Just-in-time** | one step ahead, field-anchored, never modal | "Pick a field for your condition — the available values depend on it." · "This behavior needs a condition — or set it to always apply." |
| **Consequence** | warn before a side effect | "Hiding this field will also clear its answer. Keep it?" |
| **Teaching** | explain a concept on demand | "Lock keeps a field visible but read-only — people can see it, not change it." |

Voice: plain language only — never *lifecycle / moment / audience / execution model / trigger*. Describe **form behavior** ("while someone is filling the form", "when the form opens", "when they submit").

---

## 6. Node / Block Model

A **Behavior Block** is the unit of building — one IF→THEN targeting one field, rendered as a calm connected path:

```
① WHEN ──── ② IF ──── ③ THEN ──── ④ FOR ──── ⑤ IMPACT
moment       condition  action      audience    live result
```

| Node | Reads as | Default | Edit |
|---|---|---|---|
| **① WHEN** | "While filling / When it opens / When submitting" | **smart-derived** | grouped picker |
| **② IF** | "Category is Hardware" | none ("always" until added) | inline on-field popover → Inspector for complex |
| **③ THEN** | "Require Department" | the verb you picked | verb chip |
| **④ FOR** | "Everyone / Requesters / Technicians" | Everyone | collapsed; previewed in Try |
| **⑤ IMPACT** | the live canvas reaction | — | read-only; alive in Try |

**Lifecycle:** collapsed = one-line chip on the field; expanded = full node path in the rail. **Multiple actions:** "+ also affect a field" adds an action node and lights that field on the canvas (one condition → many actions, no mode switch). Connectors are calm hairlines, not flowchart arrows.

---

## 7. Preview / Impact Area (Try mode)

Try **instantiates the real runtime renderer** against draft rules (no second engine). Type like a requester; the form reacts with its **true temperament**:

| Temperament | Try behavior |
|---|---|
| Continuous (default) | reacts forward; **relaxes on backspace** |
| Set-once default | populates, then **holds**; truth-note: "set once when the form opens — changing Category later won't undo it" |
| Held (auto-undo off) | reacts forward; **stays on** |
| Submit gate (validation) | nothing until the Try **Submit** press |

Also in Try: **persona selector** (the only place audience simulation lives), **new/existing** toggle (create-vs-edit feel-able), per-field **"Final state"** (single deciding rule), **"Why is this happening?"**. Things preview can't honestly reproduce (server-only, async/integration, mobile) are **labeled, not faked**. No Run button.

---

## 8. Conflict Treatment

**A · Same-field** (two rules touch one field at one moment) — live **on the field**: amber underline + `⚠ N rules meet here ▸`. The card names the human category (Contradictory · Duplicate · Overlapping · Same time), shows **run-order with drag-to-reorder**, names the **winner**, and offers V6 actions (View · Edit the other · Disable the other · Let this win · Keep both by narrowing · Merge · Resolve later).

**B · Cross-field / logical** (hide-vs-require unsubmittable; set-value cascades; a condition reading a hidden field) — no single field to live on, so promoted to a **first-class Relationships view** + a **publish-time static check** that flags logical impossibilities as **strong, near-blocking** warnings.

**Precedence (deterministic total order):** phase (load → field-change → submit) → list-order = run-order (last acts wins in phase) → defined tie-breaks. "Final state" + "Why" always name the winner this order produces.

**Tone:** save is never hard-blocked, but a form-breaking contradiction never ships on an amber whisper alone — that's what the publish gate catches. A quiet **aggregate chip** in the top bar is the only global signal.

---

## 9. Onboarding / "How it works" Layer

- **First-time state:** a one-time, dismissible **Point → Coach → Prove** coach with a tiny inline animated demo. "Don't show again"; reopenable from "How it works."
- **Empty state:** form renders normally + "This form has no rules yet. Click any field to tell it how to behave." + "Show me how."
- **"How it works" panel** (persistent `[?]`): non-modal reference — behavior glossary, the four temperaments, AND/OR, conflict categories, 3 worked examples. Doubles as the help/reference panel.
- **Mid-build:** the JIT helper tier carries the rest — no tutorial required.

---

## 10. Rule Summary Behavior

- **Generated, never typed**, from the rule — can't drift. Shown in the top bar (whole rule) + atop the Rule Path (this behavior).
- **Complexity ceiling:** ≤2 conditions, no nested group, single action → one plain sentence. Past it, **degrades to a two-line structured caption** (`When ALL of: … / Then: …`) rather than forcing grammar that lies-by-omission.
- **Lifecycle in plain words** ("on new requests" / "on new and existing requests") — never silently defaulted.
- **Conflict messages never diff two prose sentences** — they diff structured deltas, prose as a one-line gloss.
- The Summary describes; the **canvas reaction** is truth for impact; the **structured stack** is truth for logic.

---

## Named element behaviors (quick-reference)

| Element | V8 behavior |
|---|---|
| **Trigger selection** | not led with; **WHEN node** smart-defaults (set-value→opens, conditional→while filling, validation→submit); editable via grouped picker; lifecycle = plain Summary clause |
| **Condition groups** | simple = one inline condition on the source field; "+ add condition" → small stack; **one level of nested group** with its own All/Any |
| **AND / OR logic** | plain **"All of these / Any of these"** toggle at the group header; group-to-group **"And also / Or else"** connector pills |
| **Action selection** | intent-first verbs scoped to the field type (Require / Make optional / Show / Hide / Lock / Set value / Limit choices / Check before submit); "+ also affect a field" for multi-action |
| **Preview of field impact** | Try mode on the real renderer; four temperaments; "Final state" + "Why"; persona + new/edit toggles live here only |
| **Conflict awareness** | same-field spatial badge + card (run-order, winner, V6 actions); cross-field → Relationships + publish check; aggregate chip in top bar |
| **Help / reference panel** | persistent non-modal "How it works" drawer + JIT inline helpers |
| **Empty state** | form renders normally + "no rules yet — click any field…" + "Show me how" |
| **First-time state** | one-time dismissible Point→Coach→Prove demo; reopenable |
