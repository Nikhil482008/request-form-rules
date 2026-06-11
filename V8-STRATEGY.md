# V8 Strategy — "Form Canvas: Behaviors on a Living Form"

> Strategic direction for **Version 8** of the Request Form Rules builder.
> Derived via a design panel (4 independent directions → 3 judges → synthesis → adversarial stress-test).
> Companion docs: [V8-SPEC.md](./V8-SPEC.md) (product + screen spec) · [V8-PLAN.md](./V8-PLAN.md) (implementation plan).
> Project context: [CLAUDE.md](./CLAUDE.md).

---

## The decision

V8 is a **light-theme, guided form-rule canvas** where the admin *coaches behavior onto the real form* — not a settings screen where they configure an engine. The hero move is a **figure/ground inversion**: the **form** is the primary object and is always visible; the **rule** recedes. Every prior version (V1–V7) made the rule the figure and the form invisible, which is exactly why "when does this run / what does it touch / what will the form look like" stayed abstract.

The reference (the *ServiceOps Automation Builder*) is used for **interaction quality only** (guided canvas, progressive reveal, node/block building, contextual help, always-visible model, calm review/preview). Its core model is **temporal ticket automation** ("when an event fires, run steps once"). Form rules are the opposite: **live, reactive, declarative bindings** between form state and field behavior, continuously evaluated while someone fills the form. V8 resolves this tension by construction and honesty, never by copying the automation metaphor.

---

## 1. Mental model

> **"I'm sitting in front of my real form, coaching individual fields on how to react to what someone types."**

A rule = *a behavior bound to a field* ("Department becomes required while Category is Hardware"). There is **no Run button** — bindings are true/false at every instant; the only "time" the admin feels is their own typing.

The form must teach the **truth of each behavior type** (not one flattering demo). Four **behavior temperaments**, each with a distinct felt + visual identity in Try mode:

| Temperament | Behavior | Felt in Try |
|---|---|---|
| **Continuous** (require / show / hide / lock / limit-choices) — the 80% default | reacts forward, **relaxes on backspace** | asterisk appears as you type, leaves when you delete |
| **Set-once default** (set value on open) | populates, then **holds** | value fills and stays; truth-note explains it |
| **Held** (continuous + auto-undo OFF) | reacts forward, **does not relax** | distinct "stays on" marker |
| **Submit gate** (validation) | nothing until submit | fires only at the Try-mode Submit press |

Auto-undo is the default for revertible behaviors and is **visibly contradicted** the instant the admin picks set-once or turns it off — so the teaching gesture can never encode a lie.

---

## 2. Information architecture

Three authoring surfaces at increasing depth + governance one zoom out:

- **A · Form Canvas** (hero, always visible) — the real form, rendered by the runtime engine; each field is a behavior anchor. Source of truth for **impact**.
- **B · Behavior Block / Rule Path** (on select) — the node model: **WHEN · IF · THEN · FOR · IMPACT**. Source of truth for **how the rule reads**.
- **C · Inspector** (long-tail only) — Match-any, nested groups, exotic operators, lifecycle scope, system-wide, set-once/held config. Hard budget: **≤5 visible controls** for a typical conditional.
- **D · Rules Hub** (governance, separate screen) — list, run-order = list-order, version history, rollback. One product at two zooms.

**Object hierarchy:** `Form → Field → Behavior (one IF→THEN) → Rule (may drive several field behaviors)` — the existing *one primitive at two scales*, preserved.

The persisted data model is **unchanged** (shared `Rule/Block/Condition/Action`), so the Rules List + engine keep working; Behavior, Node, Temperament, FinalState, ConflictClass are **view-models / derived values** layered on top.

---

## 3. Screen structure

Light theme; white/slate surfaces, sky-500 primary, amber attention, emerald safe, violet overlap.

- **Top bar:** template selector · generated **Summary as a read-only caption** · state chips (Draft, amber aggregate, ✨ AI, Publish).
- **Canvas (~60%):** the real form in admin mode with a subtle persistent "edit" treatment so it never reads as fillable; **Build | Try** toggle; "only fields with behaviors" filter + "+N more" caps; a single transient source→target thread for the selected behavior only.
- **Right rail (~40%):** the Rule Path (B) expanding into the Inspector (C) only for the long tail; multi-behavior fields show a stack with the named "Final state" winner + reorderable run-order.
- **Narrow / 200% zoom:** collapses to a designed Build/Inspect toggle — never a modal drawer.

---

## 4. Interaction model

**Point → Choose behavior → Describe the situation on the canvas → Prove it in Try.** Progressive disclosure is **spatial** — complexity appears only around the field you touched, and the simple case never leaves the canvas.

0. Orient — land on the live form. "Click any field to tell it how to behave."
1. Point — click a field; it lifts; behavior menu appears.
2. Choose behavior (intent-first verbs) — creates a valid minimal behavior instantly.
3. Describe the situation **on the canvas** — click "only when…", click the source field, set operator+value in a tiny on-field popover. No Inspector for the 80% case.
4. Prove it — flip to **Try**, type like a requester; the form reacts with its true temperament.
5. Understand impact & why — per-field "Final state" + "Why is this happening?" name the single deciding rule.
6. Contextual validation — JIT, field-anchored, never modal.
7. Conflict — same-field spatial marker + card; cross-field/logical → Relationships + publish check.
8. Review / Publish — draft-isolated; static logical check; version + rollback.

---

## 5. Reference adaptation (interaction qualities → form rules)

| Reference quality | V8 adaptation |
|---|---|
| "Live workflow model" always visible | the **live form itself** is the always-visible model; one behavior's "path" is a single transient binding-thread (no daunting node graph) |
| Trigger-first grouped/searchable picker | **lead with the field, not a trigger**; reuse the grouped+searchable picker for the inline condition picker |
| Natural-language action lead-ins | re-targeted to fields: Mandate→**Require**, Non-mandate→**Make optional**, Disable→**Lock**, Hide Options→**Limit choices**, + Set value, Check before submit |
| Contextual help + JIT validation | preserved, field-anchored, never modal |
| Calm onboarding, one decision at a time | simple case = one decision on canvas; Inspector reveals one at a time; no "Advanced" junk drawer |
| Review/Preview | **type into the live form and watch true temperament**, via the real renderer; what it can't reproduce is labeled, not faked |
| Generate with AI / Quick option | a discoverable goal-first escape hatch that resolves intent to a field-anchored behavior |

---

## 6. UX principles

1. Form = truth for **impact**; structured stack = truth for **logic**; the Summary is **only a caption**.
2. The canvas **does authoring**, not just preview — the simple conditional never opens the Inspector.
3. Preview teaches each behavior's **true temperament** — never one flattering archetype.
4. **Point, don't configure** — start by clicking a field, never by picking a trigger/scope/execution model.
5. Reactive by default, **honest by exception**.
6. Plain language, **generated not typed**, with a defined complexity ceiling; lifecycle stated in words, never silently defaulted.
7. Conflicts in **two honest classes** — same-field (spatial) + cross-field/logical (first-class + publish gate).
8. A **single named winner** via a documented total order.
9. **Engine parity** by reusing the real renderer, not a second preview engine.
10. The structured/text layer is the **accessible equivalent**, not an afterthought.

---

## 7. Biggest risks to avoid

1. **Engine parity is a single point of trust failure** → reuse the real runtime renderer; automated parity suite; label what can't be reproduced.
2. **"Reacts and reverts" is false for set-once / held / submit-gate** → teach all four temperaments distinctly.
3. **The dangerous conflicts are cross-field/logical** (unsubmittable hide-vs-require) → first-class Relationships view + firm publish-time static check.
4. **The Inspector silently becomes the old V2 form** → hard ≤5-control budget; dissolve "Advanced"; measure against V2.
5. **No deterministic precedence** → define a total order (phase → list-order → tie-breaks) before build.
6. **Accessibility of a spatial/reactive core** → structured/text layer as the accessible primary; ARIA live; color + icon.
7. **Mode-soup / console-by-accretion** → persona in Try only; new chrome must replace, not stack; own the canvas↔Hub seam.
8. **Viewport / zoom / performance** → designed narrow fallback; dependency-indexed, debounced evaluation; reflow-tolerant threads.

---

## Why it beats V1–V7

It answers the three questions beginners always lose — *when does it run / what does it touch / what will the form look like* — **by construction**. The form is no longer a representation of the rule; it *is* the artifact, and it is honest about exactly how each rule will behave.
