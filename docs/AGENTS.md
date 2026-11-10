# AGENTS.md — docs/

Read [`README.md`](README.md) first for the folder map and reading order. This file covers how to write here, not what the docs say.

## Writing rules

- `product/` and `design/` are written for a player, not a programmer. Avoid code terms; when one is unavoidable, explain it in the sentence or link the technical page that defines it.
- `technical/` explains how things work. It links to product pages and decision entries for motivation and does not restate the reasoning.
- Every new feature gets a brief in `product/features/`, copied from [`templates/feature-brief.md`](templates/feature-brief.md).
- Decisions are split by audience. Product choices (who plays, what is in scope, what the game feels like) go into [`product/decisions.md`](product/decisions.md). Architecture choices (where state lives, data model shape, the engine boundary) go into [`technical/decisions.md`](technical/decisions.md). Both carry a bar: implementation details, refactors, and optimisations belong in the commit message, never in a log.
- When a new game term appears, add it to [`product/glossary.md`](product/glossary.md) first, then use the same term everywhere.
- Lessons from agent sessions go in [`agent-lessons.md`](agent-lessons.md) only when a real mistake produced a durable, not-yet-recorded rule. Read the bar in that file first; when in doubt, leave it out.

## Canvases

Use `.canvas` files for anything that is a map rather than a narrative. A linear document forces a reader to hold relationships in their head; a canvas shows them directly. Dense text still belongs in the pages — canvases point at them instead of replacing them.

Reach for a canvas when the subject has branches, parallel areas, or many-to-many links, for example: how the night sequence resolves, or how a projection is derived per viewer. Keep prose in markdown for anything that needs to be read as an argument.

Rules of thumb:

- Link every canvas from the markdown page that needs it, with one line saying what it shows.
- Keep node text short.
- Update a canvas the same day you change the thing it maps.
- One canvas per topic.

## Do not

- Do not put secrets or real player data in a doc, even as an example. Use invented placeholder names.
- Development tasks are not tracked here — they live on the in-app dev board (`/dev/board`, localhost only).
