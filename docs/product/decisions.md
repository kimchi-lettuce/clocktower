# Product decision log

Every durable product decision gets a dated entry here, written so Daniel can read it without code words. Newest first. One entry per decision.

## Format

- **Date:** YYYY-MM-DD
- **Decision:** one sentence
- **Why:** one short paragraph
- **Considered and rejected:** the alternatives and why they lost
- **More detail:** link to a technical page or brief, if one exists

## 2026-10-15 — Four work roles, scoped instead of global

- **Decision:** ChristOnline uses four named roles — Developer (the founders building it), Admin (church staff for one church), Manager (heads of a ministry), Helper (volunteers on a team) — and every role except Developer is scoped to a church or ministry rather than granted globally.
- **Why:** The welcoming app's authority ladder worked, but staff roles were effectively global; scoping keeps Helper privacy promises real and makes Admin mean "this church". Daniel confirms the names before any role code is written.
- **Considered and rejected:** Keeping a global-admin concept (repeats the prior model's weakness); inventing more tiers (a top-down ladder the team of two cannot govern yet).
- **More detail:** [rbac-tenancy-design.md](../technical/rbac-tenancy-design.md)

## 2026-10-15 — Dev tasks tracked inside the app, not in a tracker

- **Decision:** Development work is tracked on the in-app dev board at `/dev/board`, available on localhost without login; agents are instructed to read and update it like the team's issue tracker.
- **Why:** Work items were living in chat prompts that agents rediscovered (or lost) each session. A tracker inside the product the work is on keeps the queue in view while we develop.
- **Considered and rejected:** Jira or Linear (another paid tool to maintain before launch); a docs-only task list (agents can see it, but it does not stay in view while working).
- **More detail:** [features/dev-board.md](features/dev-board.md)

## 2026-10-12 — Design system: brand tokens in code, brand story in docs

- **Decision:** The look is defined once as brand tokens in `packages/design/src/tokens.css` and documented in [`design/brand.md`](design/brand.md); the app maps those tokens onto Tailwind utilities.
- **Why:** One token source keeps the app and the marketing site in step. AI-written UI that uses token utilities stays on-brand automatically, and switching off the default Tailwind palette makes any drift visible instead of accumulating quietly.
- **Considered and rejected:** A root-level DESIGN.md file (duplicates the docs structure Daniel already reads end to end) and a JavaScript Tailwind config (Tailwind v4 is configured in CSS, so a second configuration would drift from the tokens the marketing site depends on).
## 2026-10-09 — No app-server SSR for now

- **Decision:** The UI ships as a browser-only SPA that calls Convex directly for product data.
- **Why:** Convex already owns persistence, auth, realtime, and authorization. A separate app-server rendering hop would make it harder to reason about ordinary data flow and auth, without giving the current product immediate value.
- **Considered and rejected:** A fresh SSR template or a server function for every query. They would have added another runtime boundary just when the product needs a narrower one.

## 2026-10-09 — One shared Convex backend client

- **Decision:** Server-side functions reuse a single Convex client, attaching each request's own login token before a call and sending mutations immediately rather than through the client's waiting line.
- **Why:** Building a fresh client per call wasted work. Sharing one client without per-request tokens could send one person's login with another request's data.
- **More detail:** `src/library/auth-server.ts`

## 2026-10-09 — Documentation split by audience

- **Decision:** `docs/` is organised into `product/` (for both of us, plain language), `design/` (flows and prototypes), and `technical/` (architecture).
- **Why:** Daniel should be able to read the product pages top to bottom without decoding code terms, while technical pages stay precise and link back to product pages for the motivation.
