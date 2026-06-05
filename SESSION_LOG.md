# Session Log — Request Form Rules Redesign

> Running handoff between work sessions. **Newest entry at the top.**
> At the end of a session, copy the template below and fill it in.
> For stable project context, see [CLAUDE.md](./CLAUDE.md); for deep reference, [HANDOFF.md](./HANDOFF.md).

---

## Template (copy this for each new session)

```
## YYYY-MM-DD — <short title>
**Did:**
- …
**Current state:**
- what works / what's live
**Open / next:**
- …
**Watch out:**
- gotchas, anything half-done
```

---

## 2026-06-05 — Prototype Hub + session-log skill

**Did:**
- Created **`index.html`** — a single **Prototype Hub**: dark top bar with tabs for all 5 versions
  (V1 Sentence-first · V2 Structured form · V3 Block workspace · V4 Starter cards · V5 Guided
  composer ★) + a full-height iframe that swaps versions without opening files individually.
  Deep-links via `#v1`…`#v5`, plus an "Open full screen ↗" link.
- Changed **`serve.ps1`** default route `/` from `rule-studio-demo.html` → `index.html`; restarted
  the server (old task had ended; new background server). Verified `/` serves the hub (200) and all
  versions load.
- Created the global **`session-log` skill** at `~/.claude/skills/session-log/SKILL.md` — updates the
  active project's SESSION_LOG.md (invoke via `/session-log` or "session log").
- Synced run instructions in **CLAUDE.md** and **HANDOFF.md** (default page is now the hub).

**Current state:**
- **http://localhost:8000/** = the Prototype Hub (default). Server running (background task).
- All 5 versions reachable via hub tabs and via their own `rule-studio-v*.html` files; each still
  has its own in-page version switcher. Shared Rules List + engine unchanged.

**Open / next (awaiting direction):**
- Optional: add nested condition groups to V5; remove self-compile safety-net scripts from
  v3/v4/v5; export full V5 design spec; start the real Next.js build from `src/`.

**Watch out:**
- Hub embeds each version in an iframe; the version's own dark switcher also navigates inside the
  frame (harmless redundancy).
- Server is a background task; if `/` stops responding, free port 8000 then re-run `serve.ps1`
  (now defaults to `index.html`).

---

## 2026-06-04 — V5 built; CLAUDE.md + handoff docs added

**Did:**
- Built **V5** (`rule-studio-v5.html`) — the guided composer (Intent → Logic → Scope → Impact):
  intent-first "What do you want to control?" (field/whole-form toggle + 5 control types),
  behavior pre-filtered by control type with **multi-action** ("+ also do this"), human-language
  timing chips (smart-defaulted), separate scope chips, flat conditions with Match all/any,
  persistent **Impact rail** (read-only summary + 2×2 facets + calm conflict line + "Test this
  rule"), advanced (use-on new/edit, revert-when-false, enforce everywhere). Added a V5 design
  spec via a multi-agent workflow before building.
- Added **v5** to the version switcher in all files (demo/v1/v3/v4/v5).
- Polished V5: Impact rail/facets show placeholder until a control type is chosen.
- Earlier in session: tweaked **V1** — added inline **FOR** (audience) and **RUN IT WHEN**
  (timing) tokens inside the block; renamed "runs when" → "run it when".
- Wrote **HANDOFF.md**, **CLAUDE.md**, and this **SESSION_LOG.md**.

**Current state:**
- Server `serve.ps1` runs on http://localhost:8000/ (V2 default). All 5 versions load (200 OK)
  and are cross-linked via the top-bar dropdown.
- V1–V5 all functional; shared Rules List table + engine intact.
- V3/V4/V5 contain a self-compile safety-net `<script>` (silent unless a compile error exists).

**Open / next (none in progress — awaiting direction):**
- Possible: add nested condition groups to V5; remove safety-net scripts now that v3/v4/v5 are
  healthy; export the full V5 design spec to its own file; or start the real Next.js build from `src/`.

**Watch out:**
- After editing any prototype: re-check it serves 200, then grep for the nested-arrow `forEach`
  paren bug (`}))` not `})`), even backticks, balanced curly quotes, single `function RuleStudio`.
- Do NOT change the shared Rules List table or the version switcher when redesigning a builder.
- No Node/real Python on the box — use the in-page self-compile diagnostic to surface Babel errors.

---

## (history before the log existed — summary)

Across earlier turns this session the project went from concept to 5 prototypes:
- **Design phases:** IA + interaction model + ASCII wireframes for the whole module; then a
  React/Next.js component architecture (`src/` scaffold: types, contracts, list components,
  `summarize` lib, `useRulesList` hook).
- **Prototype + versions:** built a runnable single-file React/Tailwind/Babel app served by
  `serve.ps1`; created **V1** (sentence-first), **V2** (`rule-studio-demo.html`: structured form +
  the enterprise Rules List table styled from the real product screenshot), **V3** (block
  workspace), **V4** (starter cards), **V5** (guided composer). Added the top-bar version switcher
  and kept the Rules List + engine shared and unchanged across versions.
- **Debugging milestone:** V3 first shipped blank — root cause was a nested-arrow `forEach` closing
  with `})` instead of `}))`; fixed, and added the self-compile on-page error diagnostic pattern
  now reused in v3/v4/v5.
