# malleable

A personal dashboard built on the architecture of **Jelly** — *Generative and
Malleable User Interfaces with Generative and Evolving Task-Driven Data Model*
(Cao, Jiang & Xia, CHI '25, [arXiv:2503.04084](https://arxiv.org/abs/2503.04084)).

The interface is not designed screen by screen. A **task-driven data model**
is the single source of truth; a **UI specification** maps the model onto
widgets; a rule-based renderer turns spec + data into panels. Changing what
the dashboard shows means changing the model — the UI follows.

```
prompt ("give me a morning overview")
        │
        ▼
TASK-DRIVEN DATA MODEL          src/model/
  · object-relational schema      — task root, entities, SVAL/DICT/ARRY/PNTR attributes
  · dependency graph              — { source, target, mechanism, relationship }
  · structured data               — loaders that instantiate the schema
        │
        ▼
UI SPECIFICATION                annotations on every attribute:
                                <function, render, editable> (+ thumbnails for PNTR/ARRY)
        │
        ▼
RENDERED UI                     src/ui-spec/ — render-type → widget rules,
                                one recursive renderer, zero module-specific JSX
```

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 ·
[motion.dev](https://motion.dev) (all animation) ·
[bklit ui](https://github.com/bklit/bklit-ui) charts (vendored via the shadcn
registry into `src/components/charts/`, visx + motion underneath).
Deployable on Vercel as-is. No database: modules load structured data from a
public API (`digest`) and JSON seed files (`radar`, `todos`).

```bash
npm install
npm run dev
```

## Modules

| module | entity   | data source |
| ------ | -------- | ----------- |
| `news` | NewsFeed | `data/news.json` - what she engaged with in the last week, today at top, daily AI brief pinned |
| `prs`  | PrPile   | `data/prs.json` - PR number + three-word label + you/agent, muted green/amber/gray staleness, merged PRs expire 24h after merge |

Tiles: drag to move, corner puck to resize; dragging a tile bigger reveals
detail-level info, X removes it (both persist to localStorage).

`/curiosities` is a separate page: the standing list of questions being
researched, one glass tile per question, click through to a modular research
write-up (one card per section). Add a question: entry in
`data/curiosities/index.json` + a markdown file beside it.

## The board

Every panel is malleable: grab a card to move it, pull the corner puck to
resize it. Movement snaps to a 6-column grid; everything rides a soft-plastic
spring (motion.dev, underdamped for bounce), collisions push panels down, and
your arrangement persists to `localStorage`. Narrow screens stack panels
full-width. Layout defaults live in `src/ui-spec/layout.ts` — panel position
is part of the UI spec, and the physics lives in `src/ui-spec/board.tsx`.

## Add a module

1. Create `src/modules/<name>/index.ts` exporting a `DashboardModule`:
   an entity (attributes with kinds + UI annotations) and a `load()` that
   returns structured data.
2. Register it in `src/model/schema.ts` (`TASK.panels` + `MODULES`).
3. Done — no page or component edits. The renderer picks it up.

If the data needs a new widget shape, add one render type in
`src/ui-spec/widgets.tsx` and one case in `src/ui-spec/renderer.tsx`.

## Dependencies

Declared per module, composed in `src/model/dependencies.ts`. Mechanisms
follow the paper: `update` propagates a change (executed in loaders — e.g.
`Project.openCount` is derived from `TodoItem.done`, never stored);
`validate` flags a broken constraint in the UI (the digest badge).

## Design language

Heavy glassmorphism over a minimal grid: strong `backdrop-filter` blur,
layered translucent surfaces (panel → inset rows → chips), a calm aurora
background so the glass has something to refract. All tokens live in
`src/app/globals.css` and `src/components/panel.tsx` — restyling the whole
dashboard is a two-file edit. Modules never carry visual classes.

## Where this goes

The paper's pipeline *generates* the schema and spec from prompts. This
scaffold keeps both handwritten but machine-legible, so an LLM step can
evolve them later: continuous prompting (§5.3), GUI-based model
customization, and malleable panels that reshape as information needs
change.
