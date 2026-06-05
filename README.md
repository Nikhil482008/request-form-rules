# Request Form Rules — Redesign Prototypes

Interactive prototypes for a redesign of an ITSM **“Request Form Rules”** admin module — the screen
where admins define how a request form behaves (show/hide a field, make it required, lock it, set a
value, validate before submit) based on **conditions**, for specific **people**, at specific
**moments**.

## 🔗 Live demo

**https://REPLACE_ME.github.io/request-form-rules/** — the Prototype Hub; the top tabs switch
between all versions.

## What's here

Self-contained, single-file **React 18 + Tailwind + Babel** prototypes (no build step — everything
loads from CDNs). They all share **one** Rules List table and **one** rule engine; they differ only
in the Create / Edit experience.

| Version | File | Direction |
|---|---|---|
| V1 | `rule-studio-v1.html` | Sentence-first builder |
| V2 | `rule-studio-demo.html` | Structured form (hosts the shared Rules List table) |
| V3 | `rule-studio-v3.html` | Block workspace |
| V4 | `rule-studio-v4.html` | Starter cards |
| V5 | `rule-studio-v5.html` | Guided composer |
| V6 | `rule-studio-v6.html` | Refined classic — with an in-page **A / B / C** variant selector |

`index.html` is the **Prototype Hub** (the site's entry point) — tabs to switch all versions in one
page.

## Run locally

No Node/npm required. From this folder:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File serve.ps1
```

Then open **http://localhost:8000/**.

## Notes

- Prototype only — **no backend or persistence** (a refresh resets everything). Conflict detection
  and preview run client-side on mock data.
- Needs an internet connection (React / Tailwind / Babel load from CDNs).
- Design context and architecture notes: see [`CLAUDE.md`](./CLAUDE.md), [`HANDOFF.md`](./HANDOFF.md),
  and [`OPTION-A-DESIGN.md`](./OPTION-A-DESIGN.md). The `src/` folder is a Next.js component
  scaffold (types/contracts only, not wired to a build).
