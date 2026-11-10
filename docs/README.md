# Clocktower docs

Pages are split by audience: `product/` and `design/` explain what the game is and how it should feel, `technical/` explains how it works. Agents and humans read the same pages.

## Reading order

0. [Status and handover](status.md) — where the project is right now, and what is undecided
1. [Vision](product/vision.md) — what this is, and what it deliberately is not
2. [Glossary](product/glossary.md) — the game's words, one meaning each
3. [Product decisions](product/decisions.md) — dated product choices
4. [Design principles](design/principles.md) — how the screens should behave
5. [UI foundation](design/ui-foundation.md) — where shared components come from
6. [Architecture](technical/architecture.md) — layers, the engine boundary, the projection rule
7. [Technical decisions](technical/decisions.md) — dated architecture choices
8. [Convex backend standard](technical/convex-backend-standard.md) — backend structure and domain rules
9. [Feature briefs](product/features/README.md) — one page per feature, written before code
10. [Agent lessons](agent-lessons.md) — mistakes that changed how agents work here

The game itself is documented elsewhere: the Trouble Brewing script, night order, and ability text come from the official almanac, and the Storyteller walkthrough that produced this repo's requirements lives in the Obsidian vault at `Projects/clocktower/storyteller-brief.html`.

## Conventions

- New features start from [`templates/feature-brief.md`](templates/feature-brief.md).
- Durable choices are recorded in a decision log, dated, the day they are made.
- New game terms go into [`product/glossary.md`](product/glossary.md) before they are used elsewhere.
- Maps live as Obsidian `.canvas` files and are linked from the page they describe. They are plain JSON, so they diff and edit as text anywhere.
