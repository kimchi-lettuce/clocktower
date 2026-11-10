# AGENTS.md — docs/

Read [`README.md`](README.md) first for the folder map and reading order. This file covers how to write here, not what the docs say.

## Writing rules

- `product/` and `design/` are written so Daniel can read them end to end. Avoid code terms; when one is unavoidable, explain it in the sentence or link the technical page that defines it.
- `technical/` explains how things work. It links to product pages and decision entries for the motivation and does not restate the reasoning.
- Every new feature gets a brief in `product/features/`, copied from [`templates/feature-brief.md`](templates/feature-brief.md). Daniel reviews the brief before any code is written.
- Decisions are split by audience. Choices Daniel can judge from church reality (who the product serves, tenancy, data governance) go into [`product/decisions.md`](product/decisions.md) the day they are made. Architecture choices (where auth lives, data model shape, platform) go into [`technical/decisions.md`](technical/decisions.md). Both files carry a bar for what qualifies: implementation details, refactors, and optimizations are explained in their commit message or code comments, never in a log.
- When a new domain term appears, add it to [`product/glossary.md`](product/glossary.md) first, then use the same term everywhere.
- Lessons from agent sessions are recorded in [`agent-lessons.md`](agent-lessons.md) only when a real mistake produced a durable, not-yet-recorded rule. Read the bar in that file before adding an entry; when in doubt, leave it out.

## Canvases

Use `.canvas` files (Obsidian Canvas) for anything that is a map rather than a narrative. A linear document forces a reader to hold relationships in their head while decoding them from bullet lists. A canvas shows the relationships directly: shape, position, and connections carry meaning, so a reader can see a whole system or argument in one glance and jump around it. Dense text still belongs in the pages — canvases point at it instead of replacing it.

Reach for a canvas when the subject has branches, parallel areas, or many-to-many links, for example: user flows that split by role, how one feature touches data and screens at once, how documents relate to each other (see [`design/system-map.canvas`](design/system-map.canvas)). Keep prose in markdown for anything that needs to be read as an argument — reasons, tradeoffs, and explanations belong there where they can be searched, quoted, and reviewed line by line.

Rules of thumb:

- Link every canvas from the markdown page that needs it, with one line saying what the canvas shows.
- Keep node text short. Canvases carry structure; the linked pages carry the words.
- Update a canvas the same day you change the thing it maps.
- One canvas per topic. When a canvas grows past one screen of connected ideas, split it and link the parts.

## Do not

- Do not commit without explicit user approval (repo-level rule).
- Do not put secrets or real church/member data in a doc, even as an example. Use invented placeholder names and values.
- Development tasks are not tracked in this folder — they live on the in-app dev board (`/dev/board`, localhost only; the repo-level AGENTS.md points agents there). This folder holds durable product pages only.
