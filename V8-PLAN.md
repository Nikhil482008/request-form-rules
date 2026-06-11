# V8 Implementation Plan

> How Version 8 gets built. Builds on [V8-STRATEGY.md](./V8-STRATEGY.md) + [V8-SPEC.md](./V8-SPEC.md).
> Project context + editing rules: [CLAUDE.md](./CLAUDE.md). Session history: [SESSION_LOG.md](./SESSION_LOG.md).

**Governing decision:** V8 ships the way every version ships — as `rule-studio-v8.html`, a single Babel file cloned from V2 (`rule-studio-demo.html`), **replacing only the builder component**, reusing the shared engine + data model, registered in the `VERSIONS` switcher across all files, with the **Rules List table left untouched**. **V8 does not introduce a new persisted data model** — it serializes to the same `Rule { trigger, scope, blocks[].conditions/actions, advanced, audit }` shape so the shared `summarize` / `detectConflicts` / Rules List keep working. Behavior, Node, Temperament, FinalState, ConflictClass are **view-models / derived values** on top. The `src/` folder layout below is the production target; in the prototype it collapses into commented sections of the one file.

---

## 1. Component Hierarchy

`RuleStudioV8` replaces `RuleStudio` in the v8 file. Props mirror V6: `{ initial, isNew, allRules, onCancel, onSave, onEditRule, onDisableRule }`.

```
RuleStudioV8
├─ StudioHeader                 breadcrumb · title · Cancel / Save (shared chrome)
├─ StudioTopBar                 TemplateContextSelector · SummaryCaption · StateChips(Draft·ConflictAggregate·AI·Publish)
├─ WorkspaceToolbar             ModeToggle(Build|Try) · CanvasFilter · CanvasSearch
├─ Workspace
│   ├─ CanvasPane (~60%)        ← Surface A
│   │   ├─ FormCanvas           runtime render of the template
│   │   │   └─ FieldGroup → FieldRow
│   │   │        ├─ FieldControlPreview · BehaviorChipRow · AddBehaviorAffordance · FieldConflictMarker
│   │   ├─ BindingThreadLayer   transient source→target (selected behavior only)
│   │   └─ HiddenByRuleGhost    selectable ghost for hidden fields (Build only)
│   └─ RailPane (~40%)          ← appears on select
│       ├─ RulePathPanel        ← Surface B: BehaviorSummaryCaption · WhenNode · IfNode · ThenNode · ForNode · ImpactNode
│       ├─ BehaviorStack        >1 behavior: list · Final-state winner · drag-reorder
│       ├─ Inspector            ← Surface C: AdvancedDisclosure (lifecycle · system-wide · auto-undo · clear-value)
│       └─ ConflictCard         same-field: category · run-order reorder · winner · V6 actions
├─ TryLayer                     PersonaSelector · LifecyclePreviewToggle · FieldStateReadout · WhyPopover
├─ RelationshipsView            cross-field / logical conflicts
├─ PublishGate                  review · static check · change note · confirm
├─ HelpReferencePanel           "How it works"
├─ FirstRunCoach                one-time Point→Coach→Prove
├─ EmptyState                   no behaviors yet
└─ HelperHintLayer              JIT + consequence hints, field-anchored
```

**Reused unchanged (shared):** `summarize`, `detectConflicts` (extended additively), `evalCondition/evalBlock/evalGroup`, `condClause/actClause`, `genSlug`, `FIELDS/FIELD_GROUPS/OP_SETS/OPERATORS/ACTION_TYPES/ACTION_FIELDS/AUDIENCES/MOMENTS`, `cx`, `Dropdown`, `GuidedSelect`.

---

## 2. Folder Structure (production target; mirrored as file sections in the prototype)

```
src/features/form-rules/
├─ shared/                      ← REUSED, UNTOUCHED (types, summarize, conflicts, list table)
└─ builder-v8/
   ├─ RuleStudioV8.tsx
   ├─ workspace/   StudioTopBar · WorkspaceToolbar · Workspace · ModeToggle
   ├─ canvas/      FormCanvas · FieldGroup · FieldRow · FieldControlPreview · BehaviorChipRow ·
   │               AddBehaviorAffordance · FieldConflictMarker · BindingThreadLayer · HiddenByRuleGhost
   ├─ rail/        RailPane · RulePathPanel · BehaviorStack · Inspector · AdvancedDisclosure
   ├─ nodes/       WhenNode · IfNode · ThenNode · ForNode · ImpactNode
   ├─ conditions/  ConditionStack · ConditionRow · MatchToggle · ConnectorPill · InlineFieldPopover
   ├─ try/         TryLayer · PersonaSelector · LifecyclePreviewToggle · FieldStateReadout · WhyPopover
   ├─ conflicts/   ConflictCard · ConflictAggregateChip · RelationshipsView
   ├─ help/        HelpReferencePanel · HelperHint
   ├─ onboarding/  FirstRunCoach · EmptyState
   ├─ publish/     PublishGate
   ├─ state/       builderStore · selectors
   ├─ lib/         formRenderer · temperament · precedence · finalState · crossFieldCheck · summarizeV8 · deriveWhen
   ├─ content/     helpText · behaviorGlossary · conflictCopy · examples
   └─ types/       behavior · node · conflict-view · ui-state   (view-models only)
```

---

## 3. Screen Breakdown

Rendered states of the one builder screen: Build·empty · Build·field-selected · Build·behavior-unfolding · Build·inspector-open · Build·multi-behavior · Try · Conflict·same-field · Conflict·cross-field · Publish gate · First-run · Narrow/zoom fallback.

---

## 4. State Model

Persisted `draft` uses the shared `Rule` shape; everything else is UI or derived.

```ts
interface BuilderState {
  draft: Rule;                                        // SHARED shape -> engine + list keep working
  ui: {
    mode: 'BUILD' | 'TRY';
    selection: { fieldId?: string; behaviorRef?: { blockId; actionId } };
    inspectorOpen: boolean;
    canvas: { onlyWithBehaviors: boolean; search: string; expandedFields: string[] };
    try: { inputs: Record<FieldId, Value>; persona: AudienceId; lifecycle: 'NEW'|'EDIT'; whyFieldId?: string };
    help: { panelOpen: boolean; activeTopic?: string };
    onboarding: { firstRunSeen: boolean; coachStep: number };
    conflicts: { resolutions: Record<ConflictKey, Resolution>; relationshipsOpen: boolean };
    publish: { gateOpen: boolean; changeNote: string };
    dirty: boolean;
  };
}
// DERIVED (memoized): summary, behaviors, temperamentOf, conflicts(+class), finalStateByField, tryResult, validation.
```

Actions: `selectField · addBehavior(verb) · setVerb · addCondition · setOperatorValue · setMatch · addConditionGroup · setConnector · setWhen · addAction · setAudience · toggleAdvanced · setMode · setTryInput · setPersona · setLifecycle · openWhy · openInspector · resolveConflict · reorderBehaviors · openHelp · dismissFirstRun · saveDraft · publish`.

---

## 5. Interaction States

| Element | States |
|---|---|
| Field | idle · hover · selected · has-behavior · source-of-rule · conflict · hidden-ghost · disabled-by-persona(Try) |
| Node | empty · filled · editing · invalid · auto-derived(WHEN) |
| Behavior block | collapsed · expanded · valid · incomplete · winning / overridden |
| Condition | single · grouped(All/Any) · nested-group · connector(And also/Or else) |
| Mode | Build · Try · narrow-fallback |
| Conflict | none · same-field · cross-field · resolved · accepted · ignored · needs-review |
| Try reaction | continuous · set-once · held · submit-gate |
| Validation | ok · needs-condition · needs-field · empty-action · consequence-warning |
| Publish | draft · checking · blocked-logical · publishable · published |

---

## 6. Reusable UI Pieces

`SegmentedControl` · `GroupedSearchPicker` (the reference's picker) · `InlineFieldPopover` · `NodeChip`/`VerbChip` · `ConnectorPill` · `MatchToggle` · `StatePill` · `InfoHint`/`Tooltip` · `Thread`/`GhostLine` · `CalloutCard` · `SummaryCaption` · `TemperamentBadge` · `Drawer`.

---

## 7. Data Model for Rules (persisted — unchanged contract)

```ts
interface Rule {                                       // SHARED — do not fork
  id; name; description?;
  trigger: Trigger; scope: { audience: AudienceId };
  blocks: Block[];                                     // one primitive at two scales
  advanced: { reverseOnFalse: boolean; enforceSystemWide: boolean; lifecycleScope?: 'NEW'|'EDIT'|'BOTH' };
  status: 'ENABLED'|'DISABLED'; order: number;         // list-order = run-order
  audit: { createdBy; createdAt; modifiedBy; modifiedAt; version };
}
interface Block { id; match: 'ALL'|'ANY'; conditions: (Condition|Group)[]; actions: Action[]; }

// VIEW-MODEL (derived, not stored):
interface Behavior { blockId; actionId; fieldId; verb: ActionType; when: Trigger;
                     conditions: (Condition|Group)[]; audience: AudienceId; temperament: Temperament; }
```

---

## 8. Data Model for Triggers / Conditions / Actions / Conflicts

```ts
interface Trigger { moment: 'ON_LOAD'|'ON_FIELD_CHANGE'|'ON_SUBMIT'; lifecycle: 'NEW'|'EDIT'|'BOTH'; fieldId?; }
const MOMENT_COPY = { ON_LOAD:'when the form opens', ON_FIELD_CHANGE:'while someone is filling the form', ON_SUBMIT:'when they submit' };
// deriveWhen(verb, hasCondition): SET_VALUE->ON_LOAD, validation->ON_SUBMIT, conditional->ON_FIELD_CHANGE

interface Condition { id; fieldId; op: Operator; value?: string | string[]; }
interface Group { id; kind:'GROUP'; match:'ALL'|'ANY'; connector?:'AND'|'OR'; conditions: Condition[]; }  // one level
// AND/OR surface as MatchToggle ("All of these / Any of these") + ConnectorPill ("And also / Or else")

type ActionType = 'SHOW'|'HIDE'|'MANDATE'|'OPTIONAL'|'ENABLE'|'DISABLE'|'SET_VALUE'|'CLEAR_VALUE'|'SHOW_OPTIONS'|'HIDE_OPTIONS'|'VALIDATE';
interface Action { id; type: ActionType; fieldId; value?; }
type Temperament = 'CONTINUOUS'|'SET_ONCE'|'HELD'|'SUBMIT_GATE';
function classifyTemperament(a, trigger, advanced) {
  if (a.type==='VALIDATE' || trigger.moment==='ON_SUBMIT') return 'SUBMIT_GATE';
  if (a.type==='SET_VALUE' && trigger.moment==='ON_LOAD')   return 'SET_ONCE';
  if (advanced.reverseOnFalse===false)                       return 'HELD';
  return 'CONTINUOUS';
}

interface Conflict {
  category: 'CONTRADICTORY'|'DUPLICATE'|'OVERLAP'|'SAME_TIME';   // existing 4 human categories
  conflictClass: 'SAME_FIELD'|'CROSS_FIELD';                    // NEW: spatial vs Relationships
  severity: 'HIGH'|'MEDIUM'|'LOW';
  with: Rule; field: FieldId; text: string;
  runOrder: { thisRule: number; otherRule: number };
  resolution?: Resolution;                                      // V6 states
}
// CROSS_FIELD (publish-time): unsubmittable (hide-vs-require per persona), set-value cascades, condition reads a hidden field.

// PRECEDENCE total order: phase(ON_LOAD<ON_FIELD_CHANGE<ON_SUBMIT) -> rule.order -> tie-breaks
interface FinalState { fieldId; state: 'shown'|'hidden'|'required'|'optional'|'locked'|'set'; decidedBy: RuleId; others: RuleId[]; }
```

---

## 9. Helper-Text Content Structure (copy is data, not hardcoded)

```ts
interface HelpContent {
  ambient: Record<ScreenState, string>;                         // "Click any field to tell it how to behave."
  jit:     Record<ValidationCode, string>;                      // field-anchored
  consequence: Record<ConsequenceCode, { body; confirm; optOut }>;
  teaching: BehaviorGlossary & TemperamentGuide & ConflictCopy; // glossary, 4 temperaments, conflict categories, examples
}
```

| Tier | Key | Copy |
|---|---|---|
| ambient | BUILD_EMPTY | "Click any field to tell it how to behave." |
| jit | NEEDS_CONDITION | "This behavior needs a condition — or set it to always apply." |
| jit | NEEDS_FIELD_FOR_CONDITION | "Pick a field for your condition — the available values depend on it." |
| consequence | HIDE_CLEARS_VALUE | "Hiding this field will also clear its answer. Keep it?" |
| teaching | TEMPERAMENT.SET_ONCE | "Set once when the form opens — changing things later won't undo it." |

---

## 10. Build Order

Each phase ends with the standing verify gate: `Invoke-WebRequest …/rule-studio-v8.html` = 200, grep for balanced parens/braces/brackets + even backticks + balanced curly quotes + one `RuleStudioV8`, no nested-arrow `forEach` `}))` bug, and the in-page safety-net surfaces any compile error. Build behind the canvas so the screen is never blank.

| Phase | Deliverable | Verify |
|---|---|---|
| **0 · Scaffold** | clone demo→v8; gut RuleStudio→RuleStudioV8 (header + two-pane shell + Build/Try toggle + placeholders); register v8 in `VERSIONS`+`currentVersionId` in all files + hub; keep table/engine intact; safety-net | serves 200; switcher lists V8; table works |
| **1 · Canvas (read-only)** | FormCanvas/FieldGroup/FieldRow from `FIELDS`; edit treatment; filter/search; EmptyState | fields render grouped; looks like the form |
| **2 · Behavior (THEN)** | click→verb→minimal valid behavior; BehaviorChipRow; RulePathPanel + ThenNode; SummaryCaption | can create "always require X" |
| **3 · Conditions (IF+WHEN)** | InlineFieldPopover; ConditionStack/MatchToggle/ConnectorPill/nested group; deriveWhen; BindingThread | 80% case on canvas, no Inspector; AND/OR works |
| **4 · Inspector** | Inspector/AdvancedDisclosure; ≤5-control budget; ForNode | complex rule possible; simple still never opens it |
| **5 · Try / impact** | TryLayer live eval; four temperaments; persona; lifecycle; Final state; Why | each temperament behaves correctly |
| **6 · Conflicts** | conflictClass + same-field marker + ConflictCard (reorder + V6 actions); crossFieldCheck + RelationshipsView; aggregate; precedence/finalState | seed conflict shows spatially; deterministic winner |
| **7 · Help + onboarding** | HelpReferencePanel; HelperHintLayer; FirstRunCoach; content modules | first-time user builds a rule unaided |
| **8 · Publish + polish** | PublishGate (static check + change note + draft isolation); narrow/zoom fallback; a11y (ARIA live, color+icon); motion | blocks unsubmittable forms; works at 200% zoom |

---

## Final V8 Direction

**Version 8 is a light-theme, guided _form canvas_ where the admin coaches behavior onto the real form, not a settings screen where they configure an engine.** The live form *is* the workspace and the source of truth for impact; each rule is a small **behavior block** that unfolds as a calm node path — **WHEN · IF · THEN · FOR · IMPACT** — revealed one step at a time, authored by pointing at a field and describing the situation directly on the canvas. The simple 80% case never opens a panel; genuine complexity lives in a budgeted Inspector underneath. Trust is earned by **honesty**: a **Try** mode runs the real renderer so the form reacts with its true temperament (continuous relaxes, set-once holds, held stays on, submit-gates wait); the generated **summary is a caption, never the editing surface** (so it never becomes a sentence builder); and conflicts are handled in two honest tiers — calm spatial markers for same-field clashes, a first-class Relationships view plus a firm publish-time check for the dangerous cross-field/logical ones — over a deterministic precedence order so the named winner always matches runtime. It reuses the existing data model, engine, and Rules List **unchanged** (only the create/edit component is new), ships as `rule-studio-v8.html`, and is built canvas-first so the screen is always alive. The result feels like a modern enterprise workflow studio — exploratory, visual, guided — but unmistakably a **form-behavior** tool, learnable with zero training.
