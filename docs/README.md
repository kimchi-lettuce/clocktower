# ChristOnline docs

Two readers use this folder: Daniel (product) and the technical agents. Pages in `product/` and `design/` are written so Daniel can read them end to end. Pages in `technical/` explain how the system works.

## Reading order

1. [Product vision](product/vision.md) — what ChristOnline is and who it serves
2. [Roadmap](product/roadmap.md) — where we are and what comes next
3. [Glossary](product/glossary.md) — shared words, one meaning each
4. [Decisions](product/decisions.md) — product choices dated and in plain language (architecture choices: [technical/decisions.md](technical/decisions.md))
5. [Feature briefs](product/features/README.md) — one page per feature, written before code
6. [Brand](design/brand.md) — what the product feels like, and the design tokens it uses
7. [UI foundation](design/ui-foundation.md) — where shared components come from
8. [Design](design/flows.md) — flows and prototypes
9. [Technical](technical/architecture.md) — architecture and data governance
10. [Roles and tenancy](technical/rbac-tenancy-design.md) — the draft role model and tenancy fork
11. [Agent-native ideas](product/agent-native.md) — the do-it-with-you agent and views-as-documents
12. [Convex backend standard](technical/convex-backend-standard.md) — backend structure and domain rules
13. [AI market shift](product/ai-market-shift.md) — market research: what AI-cheap software means for our positioning

## Conventions

- New features start from [`templates/feature-brief.md`](templates/feature-brief.md).
- Durable choices are recorded in [`product/decisions.md`](product/decisions.md).
- New domain terms go into [`product/glossary.md`](product/glossary.md) before they are used elsewhere.
- Maps live as `.canvas` files and are linked from the page they describe. See the [system map](design/system-map.canvas) for how the docs connect.
- Viewing canvases outside Obsidian: an open in Obsidian renders them natively; in VS Code, install an Obsidian-compatible canvas extension (for example "Skena" or "Infinite Canvas" from the marketplace, both read and write the same JSON Canvas 1.0 format). The files are plain JSON, so they also diff and edit as text anywhere.

## Original notes

- [[ChristOnline]] — the original project note, kept for history and setup context
- [Git for Daniel](Git%20for%20Daniel.html) — plain-language introduction to git
