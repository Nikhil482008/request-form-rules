# Option A — Request Form Rules, Create/Edit (Canonical Spec)

> **Direction:** "Classic + inline guidance." The safest, lowest-friction evolution of the
> existing V2 structured drawer. Same single-column layout, same sticky footer, same Save flow —
> every change is **additive**: plain-language labels, one helper line per key control, hover
> `InfoHint` for advanced terms, a live human-readable summary, and calm inline conflicts.
>
> **Hard guardrails (do not break):** the shared **Rules List table** and the **top-bar version
> switcher** are untouched. The shared engine (`summarize`, `detectConflicts`, `simulate`,
> `PreviewPanel`, `FIELDS`, `AUD_FRIENDLY`, `EXECUTE_ON`, `MOMENTS`, `OPERATORS`, `ACTION_TYPES`,
> `InfoHint`) is reused, not rewritten.

---

## 1. Mental model (gentle, not a wizard)

The form is ONE scrollable column. It reads top-to-bottom as five plain questions, but there are
**no steps, no Next buttons, no progress bar** — it is the familiar V2 drawer, re-labelled.

1. **When should this run?**  → `trigger.lifecycle` + `trigger.moment`
2. **Who should this apply to?**  → `scope.audience`
3. **What conditions must match?**  → `blocks[].match` + `conditions[]`
4. **What should happen?**  → action mode (act / check) + `actions[]`
5. **Review impact**  → live summary (top) + conflict status & "Try it" (bottom)

Naming + basics (`name`, `description`) sit at the very top as the recognisable first field, exactly
as in V2. "Review impact" is not a section the admin fills in — it frames the form: the live summary
banner at the top and the conflict line + "Try it" in the footer.

---

## 2. Section order (top to bottom)

```
liveSummary        ← read-only plain-English banner (generated, never typed)
basics             ← Rule name (required) + Notes (optional)
whenAndWho         ← "When should this run?" + "At what point?" + "Who should this apply to?"
conditions         ← "What conditions must match?"  (Match all / Match any + rows)
actions            ← "What should happen?"           (act on a field / check before submit + rows)
addAnotherSet      ← "Add another \"when this, do that\"" link
advanced           ← "Advanced options" (collapsed): auto-undo + apply everywhere
conflictStatus     ← calm single line near the footer
footer             ← Try it · Cancel · Save rule (sticky)
```

**Key decision — `trigger.moment` ("At what point?") is surfaced, not buried.** In V2 it lived
inside Advanced ("Rule Event"). CLAUDE.md flags that burial as a problem, and the brief lists the
moment as core data to express in plain language. A first-time admin needs *timing* to understand
what the rule does, so it moves up beside "When should this run?". Only the two genuinely advanced
toggles (`reverseOnFalse`, `enforceSystemWide`) stay collapsed under **Advanced options** —
progressive disclosure: defaults make a valid rule instantly.

**Key decision — Advanced sits AFTER conditions/actions**, just above the conflict line, so the core
"if this → then that" is never pushed below the fold by an opened Advanced panel.

---

## 3. Live summary (source of truth, generated)

- One **read-only sentence** at the very top, regenerated from the rule on every change via the
  shared `summarize()` engine. **Never typed by the admin.** It is the exact same sentence shown on
  the Rules List row and inside conflict messages, so comprehension can never drift between screens.
- Rendered in the existing sky banner with the `✦` glyph and the lead-in **"In plain English:"**.
- A quiet, muted suffix appends the field-impact count (matches the existing V6 banner behaviour).
- When the rule has multiple condition→action sets, `summarize()` returns `null`; show the fallback
  count line instead.

**Lead-in label:** `In plain English:`
**Example (single set):** `In plain English: When Priority becomes High, make Assignee required for technicians. · Affects 1 field.`
**Multiple sets fallback:** `In plain English: 2 requirements set so far. · Affects 2 fields.`
**Field-count suffix copy:** ` · Affects {n} field{s}.`  (`n!==1` → `fields`)

---

## 4. Fields — final copy (label · helper · info tooltip)

> Helper text renders as a single muted line directly under the label. The info tooltip is the
> existing `InfoHint` "i" atom shown beside the label; `null` = no icon. Required marker is the
> existing red `*`.

### name  *(required)*
- **Label:** `Rule name *`
- **Helper:** `Give it a name a teammate would understand at a glance. You'll see it in the rules list.`
- **InfoHint:** `A short, recognisable name — e.g. "Require an approver for high-cost requests." It only appears to admins on the rules list, never to end users.`
- **Placeholder:** `e.g. Require an approver for high-cost requests`

### description  *(optional)*
- **Label:** `Notes (optional)`
- **Helper:** `Add a sentence about why this rule exists, so the next admin knows what it's for.`
- **InfoHint:** `null`
- **Collapsed entry (matches V2):** link `Add a note` reveals the textarea.
- **Placeholder:** `Describe what this rule does and why…`

### trigger.lifecycle
- **Label:** `When should this run?`
- **Helper:** `Choose whether this applies to new requests, existing ones being edited, or both.`
- **InfoHint:** `"New requests" runs while someone raises a request for the first time. "Existing requests" runs when someone reopens and edits a request that's already been raised. Pick "Both" if it should behave the same either way.`
- **Options (map to `EXECUTE_ON` ids):**
  - `CREATE` → `New requests`
  - `EDIT` → `Existing requests`
  - `CREATE_EDIT` → `New & existing requests`

### trigger.moment
- **Label:** `At what point?`
- **Helper:** `Pick the moment this rule should act.`
- **InfoHint:** `"When the form opens" runs once before anyone types. "While the form is being filled" re-checks every time a field changes. "When the form is submitted" runs a final check as someone submits — use this for validation.`
- **Options (map to `MOMENTS` ids):**
  - `ON_LOAD` → `When the form opens`
  - `ON_FIELD_CHANGE` → `While the form is being filled`
  - `ON_SUBMIT` → `When the form is submitted`

### trigger.fieldId  *(conditional — only when moment = `ON_FIELD_CHANGE`)*
- **Label:** `Which field should it watch?`
- **Helper:** `The rule re-checks each time this field changes.`
- **InfoHint:** `null`
- **Behaviour:** appears inline only when "While the form is being filled" is selected; otherwise hidden. Options = `FIELDS`.

### scope.audience
- **Label:** `Who should this apply to?`
- **Helper:** `Choose which people see this behaviour on the form. Everyone is the safe default.`
- **InfoHint:** `"Everyone" applies to all users of the form. "Requesters" are the people raising requests; "Technicians" are agents working on them; "Signed-in users only" excludes anyone using the form without logging in.`
- **Options (map to `AUD_FRIENDLY` ids):**
  - `ALL` → `Everyone`
  - `REQUESTERS` → `Requesters only`
  - `TECHNICIANS` → `Technicians only`
  - `LOGGED_IN` → `Signed-in users only`

### blocks[].match
- **Label:** `Which conditions must match?`
- **Helper:** `Match all = every condition has to be true. Match any = one is enough.`
- **InfoHint:** `"Match all" acts only when every line below is true at the same time. "Match any" acts as soon as a single line is true. With one condition this makes no difference.`
- **Radio copy:**
  - `Match all of the conditions below`
  - `Match any of the conditions below`

### conditions[].fieldId
- **Label:** `Field`
- **Helper:** `The form field to watch.`
- **InfoHint:** `null`

### conditions[].op
- **Label:** `Condition`
- **Helper:** `How the field's value is compared.`
- **InfoHint:** `"Becomes" reacts the moment the value changes to your target. "Is" / "is not" check the current value. "Is empty" / "is not empty" need no value.`
- **Options:** the shared `OPERATORS` labels (`becomes`, `is`, `is not`, `is greater than`, `is less than`, `contains`, `is empty`, `is not empty`).

### conditions[].value
- **Label:** `Value`
- **Helper:** `The value to compare against.`
- **InfoHint:** `null`
- **Behaviour:** hidden when op is `is empty` / `is not empty` (`VALUELESS`).
- **Placeholder (free text):** `value`  ·  **Select placeholder:** `choose value`

### action mode  *(maps to `blocks[].mode`: `ACTION` vs `VALIDATE`)*
- **Label:** `What should happen?`
- **Helper:** `Change how a field behaves, or check the form before it's submitted.`
- **InfoHint:** `"Do something to a field" can show, hide, require, lock or fill a field. "Check before submit" stops the save and shows a message if the conditions are met.`
- **Radio copy:**
  - `Do something to a field`
  - `Check the form before it's submitted`

### actions[].type
- **Label:** `Do this`
- **Helper:** `Pick what happens to the field.`
- **InfoHint:** `Make required / optional control whether the field must be filled. Show / hide control visibility. Make editable / read-only control whether it can be changed. Set value fills it in for the user.`
- **Options:** the shared `ACTION_TYPES` labels (`Make required`, `Make optional`, `Show`, `Hide`, `Make editable`, `Make read-only`, `Set value`).

### actions[].fieldId
- **Label:** `To this field`
- **Helper:** `The field this action changes.`
- **InfoHint:** `null`

### actions[].value  *(only when type = `Set value`)*
- **Label:** `To`
- **Helper:** `The value to fill in.`
- **InfoHint:** `null`
- **Inline connector word (matches V2):** `to`
- **Placeholder:** `value`  ·  **Select placeholder:** `choose`

### advanced.reverseOnFalse
- **Label:** `Undo this automatically when the conditions stop being true`
- **Helper:** `Keeps the form tidy — if someone changes a value back, the field returns to how it was.`
- **InfoHint:** `Example: if you hide a field when Priority is High, this shows it again the moment Priority changes. Works only with on/off actions (show, hide, required, read-only). Not available with "Set value" — it has no opposite to undo.`
- **Disabled state copy (when any action is `Set value`):** `Not available with "Set value" (it has no opposite).`

### advanced.enforceSystemWide
- **Label:** `Apply to every request form, not just this one`
- **Helper:** `Leave off unless you really need this everywhere. It overrides the "Who should this apply to?" choice across all forms.`
- **InfoHint:** `When on, this rule runs on every request form for everyone, ignoring the audience you picked above. Powerful but easy to forget — double-check before saving.`
- **On-state warning copy (shown when checked):** `Overrides "Who should this apply to?" everywhere — use with care.`

---

## 5. Advanced options (collapsed by default)

- **Toggle label:** `Advanced options`  (chevron `›` collapsed / `˅` expanded)
- Contains exactly two controls, both off by default:
  1. `Undo this automatically when the conditions stop being true` — see `advanced.reverseOnFalse`.
  2. `Apply to every request form, not just this one` — see `advanced.enforceSystemWide`.
- `trigger.moment` is **NOT** here (it is surfaced as "At what point?" above).

---

## 6. Conditions & Actions blocks

- **Conditions empty state:** `No conditions yet — this rule runs every time. Add a condition to make it act only in specific cases.`
- **Add condition link:** `Add a condition`
- **Actions empty state:** `Add at least one thing to do — for example, make a field required when your conditions match.`
- **Add action link:** `Add an action`
- **Add another set link:** `Add another "when this, do that"`
- **Multi-set group header (when >1 set):** `Set {n}`  ·  **Remove link:** `Remove set`

---

## 7. Conflict status (calm, inline, never blocking)

Two surfaces, both reused from V2/V6 — no red panels, save never disabled by a conflict.

**(a) Inline, on the affected action row** (amber outline + note):
- **Lead-in:** `Worth a look:`
- **Body:** the engine's `c.text`, e.g. `This rule does "make Assignee required" while "When Priority becomes High, make Assignee optional" does "make Assignee optional" on the same trigger.`
- **Inline actions:** `View that rule` · `Keep this rule's version` · `Dismiss`

**(b) Aggregate line in the sticky footer:**
- **No conflicts:** `No conflicts with your other rules`
- **With conflicts:** `{n} thing to review` / `{n} things to review` (pluralise naturally)
- **Microcopy (expanded / hover):** `We found another rule that touches the same field at the same moment. You can still save — this is just a heads-up so nothing surprises you later.`

Severity stays a quiet amber for all; high-severity contradictions are mentioned once and can be set
aside with **"Keep this rule's version"** — they still never stop the admin from saving.

---

## 8. Preview / "Try it" entry

- **Button label:** `Try it`
- **Helper (tooltip/subtext):** `See how this rule plays out on a sample form before you save — pick who's using it and a few test values. Nothing is saved.`
- **Placement:** a quiet **outline** button in the sticky footer, immediately **left of Cancel**, so
  it is reachable but never competes with Save. Opens the existing `PreviewPanel` in a small
  right-side drawer (~380px) titled **"Try it"**, over a light dimmer; the form stays put behind it.
  Closes on overlay click or the `✕`. Never blocks Save.
- Inside the drawer, keep the shared `PreviewPanel` copy ("Run as", "Moment", "Test values",
  `▷ Run simulation`).

---

## 9. Footer & save flow (kept simple)

Left side: the conflict status line (§7b). Right side, in order: `Try it` (outline) · `Cancel`
(outline) · `Save rule` (primary).

- **Save button:** `Save rule`
- **Save is gated ONLY by a present rule name + at least one action per set** (existing `valid`
  logic). Conflicts NEVER disable Save. When `valid` is false, Save is dimmed; everything else stays
  interactive.
- Keep the bottom area light: one status line + three buttons. No tray, no tabs, no log panel in
  Option A — the live summary at the top plus the conflict line and "Try it" cover "Review impact".

---

## 10. Copy replacements (old → final)

| From (current V2/list) | To (Option A) |
|---|---|
| `Execute On` | `When should this run?` |
| `New Form` / `Edit Form` / `New & Edit Form` | `New requests` / `Existing requests` / `New & existing requests` |
| `Rule Event` | `At what point?` |
| `On Form Load` / `On Field Change` / `On Form Submit` | `When the form opens` / `While the form is being filled` / `When the form is submitted` |
| `Applies to` | `Who should this apply to?` |
| `All Users` / `Requesters` / `Technicians` / `Logged-in Users` | `Everyone` / `Requesters only` / `Technicians only` / `Signed-in users only` |
| `Conditions` | `What conditions must match?` |
| `Match ALL of the conditions below` | `Match all of the conditions below` |
| `Match ANY of the conditions below` | `Match any of the conditions below` |
| `Add new condition` | `Add a condition` |
| `Actions` | `What should happen?` |
| `Perform an Action` | `Do something to a field` |
| `Validate Form on Submission` | `Check the form before it's submitted` |
| `Add new action` | `Add an action` |
| `+ Add another condition & action set` | `Add another "when this, do that"` |
| `Advanced Settings` | `Advanced options` |
| `Reverse the action when the condition is no longer true` | `Undo this automatically when the conditions stop being true` |
| `Enforce across every form` | `Apply to every request form, not just this one` |
| `Rule Name` | `Rule name` |
| `Add Description` | `Add a note` |
| `Heads up:` | `Worth a look:` |
| `Let this one win` | `Keep this rule's version` |
| `▷ Try it` | `Try it` |
| `Save Rule` | `Save rule` |
| `⚠ N things to review` | `N things to review` |
| `✓ No conflicts` | `No conflicts with your other rules` |

---

## 11. Rationale (key decisions)

- **Why keep V2's skeleton:** A power admin who knows the old screen should barely notice the change
  except that everything is clearer. Same single column, same Rule name on top, same
  conditions-then-actions stack, same sticky footer with Save. No wizard, no reflow. Lowest possible
  learning curve = the brief's core requirement for Option A.
- **Why surface "At what point?" instead of burying it (resolving spec disagreement):** Spec 1 kept
  `trigger.moment` inside Advanced for maximum V2 fidelity; Specs 2 & 3 lifted it out. CLAUDE.md
  explicitly names the *buried* moment as a problem, and the brief lists it as core data to express
  in plain language. Timing is essential to understanding a rule, so it is surfaced as "At what
  point?". Only the two truly optional toggles stay collapsed — true progressive disclosure.
- **Why these labels:** Plain questions that map to the gentle model, with **zero** visible
  "lifecycle / moment / audience / execution model / trigger / block". Helper lines carry the
  one-sentence "what"; the `InfoHint` "i" carries the one-step-deeper "why" on hover, keeping the
  surface calm.
- **Why "Do something to a field" / "Check the form before it's submitted":** clearer than V2's
  "Perform an Action" / "Validate Form on Submission" while keeping the same two-radio mechanic.
  Chosen over Spec 2/3's "Change the form / Block submit" because it reads as intent, not mechanics.
- **Why the summary is generated, never typed:** it is the single source of truth, identical on the
  list and in conflict text via shared `summarize()`, so comprehension can't drift.
- **Why conflicts stay this calm:** amber-on-field + one quiet footer line, reassuring tone, and
  Save never hard-blocked — straight from CLAUDE.md. "Worth a look:" and "Keep this rule's version"
  are the softest, clearest of the three specs' options.
- **Why "Try it" stays a quiet footer button:** keeps the bottom light and the Save flow simple;
  reuses the existing `PreviewPanel` drawer with no new surface area.
- **Untouched:** the shared Rules List table, the dark top-bar version switcher, and every shared
  engine function — Option A drops into the V6 shell without changing shared chrome.

---

## 12. Implementation JSON (paste-ready strings)

```json
{
  "sectionOrder": [
    "liveSummary",
    "basics",
    "whenAndWho",
    "conditions",
    "actions",
    "addAnotherSet",
    "advanced",
    "conflictStatus",
    "footer"
  ],
  "liveSummary": {
    "leadIn": "In plain English:",
    "fieldCountSuffix": " · Affects {n} field{s}.",
    "multiSetFallback": "{n} requirements set so far.",
    "generated": true,
    "source": "summarize()"
  },
  "fields": {
    "name": {
      "label": "Rule name",
      "required": true,
      "helperText": "Give it a name a teammate would understand at a glance. You'll see it in the rules list.",
      "infoTooltip": "A short, recognisable name — e.g. \"Require an approver for high-cost requests.\" It only appears to admins on the rules list, never to end users.",
      "placeholder": "e.g. Require an approver for high-cost requests"
    },
    "description": {
      "label": "Notes (optional)",
      "required": false,
      "helperText": "Add a sentence about why this rule exists, so the next admin knows what it's for.",
      "infoTooltip": null,
      "collapsedLink": "Add a note",
      "placeholder": "Describe what this rule does and why…"
    },
    "trigger.lifecycle": {
      "label": "When should this run?",
      "helperText": "Choose whether this applies to new requests, existing ones being edited, or both.",
      "infoTooltip": "\"New requests\" runs while someone raises a request for the first time. \"Existing requests\" runs when someone reopens and edits a request that's already been raised. Pick \"Both\" if it should behave the same either way.",
      "options": {
        "CREATE": "New requests",
        "EDIT": "Existing requests",
        "CREATE_EDIT": "New & existing requests"
      }
    },
    "trigger.moment": {
      "label": "At what point?",
      "helperText": "Pick the moment this rule should act.",
      "infoTooltip": "\"When the form opens\" runs once before anyone types. \"While the form is being filled\" re-checks every time a field changes. \"When the form is submitted\" runs a final check as someone submits — use this for validation.",
      "options": {
        "ON_LOAD": "When the form opens",
        "ON_FIELD_CHANGE": "While the form is being filled",
        "ON_SUBMIT": "When the form is submitted"
      }
    },
    "trigger.fieldId": {
      "label": "Which field should it watch?",
      "helperText": "The rule re-checks each time this field changes.",
      "infoTooltip": null,
      "showWhen": "trigger.moment === 'ON_FIELD_CHANGE'"
    },
    "scope.audience": {
      "label": "Who should this apply to?",
      "helperText": "Choose which people see this behaviour on the form. Everyone is the safe default.",
      "infoTooltip": "\"Everyone\" applies to all users of the form. \"Requesters\" are the people raising requests; \"Technicians\" are agents working on them; \"Signed-in users only\" excludes anyone using the form without logging in.",
      "options": {
        "ALL": "Everyone",
        "REQUESTERS": "Requesters only",
        "TECHNICIANS": "Technicians only",
        "LOGGED_IN": "Signed-in users only"
      }
    },
    "blocks.match": {
      "label": "Which conditions must match?",
      "helperText": "Match all = every condition has to be true. Match any = one is enough.",
      "infoTooltip": "\"Match all\" acts only when every line below is true at the same time. \"Match any\" acts as soon as a single line is true. With one condition this makes no difference.",
      "radio": {
        "ALL": "Match all of the conditions below",
        "ANY": "Match any of the conditions below"
      }
    },
    "conditions.fieldId": {
      "label": "Field",
      "helperText": "The form field to watch.",
      "infoTooltip": null
    },
    "conditions.op": {
      "label": "Condition",
      "helperText": "How the field's value is compared.",
      "infoTooltip": "\"Becomes\" reacts the moment the value changes to your target. \"Is\" / \"is not\" check the current value. \"Is empty\" / \"is not empty\" need no value."
    },
    "conditions.value": {
      "label": "Value",
      "helperText": "The value to compare against.",
      "infoTooltip": null,
      "hideWhen": "op IS_EMPTY or IS_NOT_EMPTY",
      "placeholder": "value",
      "selectPlaceholder": "choose value"
    },
    "actions.mode": {
      "label": "What should happen?",
      "helperText": "Change how a field behaves, or check the form before it's submitted.",
      "infoTooltip": "\"Do something to a field\" can show, hide, require, lock or fill a field. \"Check before submit\" stops the save and shows a message if the conditions are met.",
      "radio": {
        "ACTION": "Do something to a field",
        "VALIDATE": "Check the form before it's submitted"
      }
    },
    "actions.type": {
      "label": "Do this",
      "helperText": "Pick what happens to the field.",
      "infoTooltip": "Make required / optional control whether the field must be filled. Show / hide control visibility. Make editable / read-only control whether it can be changed. Set value fills it in for the user."
    },
    "actions.fieldId": {
      "label": "To this field",
      "helperText": "The field this action changes.",
      "infoTooltip": null
    },
    "actions.value": {
      "label": "To",
      "helperText": "The value to fill in.",
      "infoTooltip": null,
      "showWhen": "type === 'SET_VALUE'",
      "connectorWord": "to",
      "placeholder": "value",
      "selectPlaceholder": "choose"
    },
    "advanced.reverseOnFalse": {
      "label": "Undo this automatically when the conditions stop being true",
      "helperText": "Keeps the form tidy — if someone changes a value back, the field returns to how it was.",
      "infoTooltip": "Example: if you hide a field when Priority is High, this shows it again the moment Priority changes. Works only with on/off actions (show, hide, required, read-only). Not available with \"Set value\" — it has no opposite to undo.",
      "disabledNote": "Not available with \"Set value\" (it has no opposite)."
    },
    "advanced.enforceSystemWide": {
      "label": "Apply to every request form, not just this one",
      "helperText": "Leave off unless you really need this everywhere. It overrides the \"Who should this apply to?\" choice across all forms.",
      "infoTooltip": "When on, this rule runs on every request form for everyone, ignoring the audience you picked above. Powerful but easy to forget — double-check before saving.",
      "onNote": "Overrides \"Who should this apply to?\" everywhere — use with care."
    }
  },
  "advanced": {
    "label": "Advanced options",
    "items": [
      "Undo this automatically when the conditions stop being true",
      "Apply to every request form, not just this one"
    ]
  },
  "emptyStates": {
    "conditions": "No conditions yet — this rule runs every time. Add a condition to make it act only in specific cases.",
    "actions": "Add at least one thing to do — for example, make a field required when your conditions match.",
    "addConditionLink": "Add a condition",
    "addActionLink": "Add an action",
    "addAnotherSetLink": "Add another \"when this, do that\"",
    "setHeader": "Set {n}",
    "removeSetLink": "Remove set"
  },
  "conflictStatus": {
    "noConflictLabel": "No conflicts with your other rules",
    "withConflictLabel": "{n} thing to review",
    "withConflictLabelPlural": "{n} things to review",
    "microcopy": "We found another rule that touches the same field at the same moment. You can still save — this is just a heads-up so nothing surprises you later.",
    "inlineLeadIn": "Worth a look:",
    "inlineActions": ["View that rule", "Keep this rule's version", "Dismiss"]
  },
  "previewEntry": {
    "buttonLabel": "Try it",
    "helperText": "See how this rule plays out on a sample form before you save — pick who's using it and a few test values. Nothing is saved.",
    "drawerTitle": "Try it",
    "placement": "Quiet outline button in the sticky footer, immediately left of Cancel; opens the shared PreviewPanel in a ~380px right drawer over a light dimmer. Never blocks Save."
  },
  "footer": {
    "saveLabel": "Save rule",
    "cancelLabel": "Cancel",
    "saveGatedBy": "name present AND every set has >=1 action (existing `valid`); conflicts NEVER disable Save"
  },
  "rationale": "Option A keeps V2's exact single-column drawer, control types, and Save flow so a returning admin barely notices the change beyond clearer wording. All edits are additive: technical labels become the five gentle questions (no visible lifecycle/moment/audience/execution-model/trigger/block), one helper line per key control, the existing InfoHint atom for deeper terms on hover, the generated summarize() sentence as the source of truth, calm amber-on-field plus one quiet footer line for conflicts, and the existing PreviewPanel behind a quiet \"Try it\" footer button. The one deliberate move beyond pure V2 fidelity is surfacing trigger.moment as \"At what point?\" instead of leaving it buried in Advanced — CLAUDE.md flags that burial as a problem and a first-timer needs timing to understand the rule; only reverseOnFalse and enforceSystemWide stay collapsed. The shared Rules List table, top-bar version switcher, and engine functions are untouched."
}
```
