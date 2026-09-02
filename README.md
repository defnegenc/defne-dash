# defne dash

Defne's dashboard. One page, aero glass, everything draggable.

## The page

- **Latest** - one line: what just happened (merges today + the daily AI brief), folded type.
- **needs you** - one line: what actually needs her attention (PRs ready to merge, stale PRs).
- **news** - what she engaged with this week, today first, daily AI brief pinned to the top. Rows link out.
- **pr pile** - PRs as chips. ✓ gray = merged (auto-expires ~24h after merge). ↗ green = ready to merge, clicks to the PR. ! amber = stale, feeds the "needs you" line.
- **ideas ✦** - questions being researched; each links to a modular write-up under `/curiosities`.

## Interaction

- Desktop is a free 2D board: drag any section anywhere (side by side, stacked, wherever). Positions persist to localStorage. Drop settles with a spring plop.
- Hover a section header for the grip and a **box/unbox** toggle: news rows and PR chips work in a glass container or bare.
- Mobile falls back to a static stacked list.

## Stack

- Next.js + TypeScript, Vercel-deployable.
- Animations: motion.dev only. Charts: vendored bklit ui (`src/components/charts`).
- Fonts from Fontshare (Hanken Grotesk; display font awaiting her pick).
- All visual tokens live in `src/app/globals.css` + `src/components/panel.tsx`.

## Data

| file | what |
| ---- | ---- |
| `data/news.json` | news items with `engagedAt`; `kind: "ai-daily"` pins to top |
| `data/prs.json` | PR number, three-word label, you/agent, status, merged/opened timestamps |
| `data/curiosities/` | `index.json` + one markdown per question; add an entry + a file to grow the list |
| `public/sketches/` | hand-drawn sketches vectorized to SVG; reference as `/sketches/<name>.svg` |

Architecture: task-driven data model → UI spec → rule-based renderer, after *Generative and Malleable UIs with Task-Driven Data Models* (Jelly, CHI '25, arXiv 2503.04084). See `src/model/` and `src/ui-spec/`.
