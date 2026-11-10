# Clocktower project instructions

Clocktower is a digital companion for the social-deduction game Blood on the Clocktower. Read [docs/product/vision.md](docs/product/vision.md) for what it is and what it deliberately is not before proposing features.

## The scope, in one paragraph

In-person game night, everyone on their own phone, one human Storyteller. Storyteller-lite: the app enforces the mechanics and prompts the Storyteller; the Storyteller still makes the judgement calls. Trouble Brewing only at first. Shareable by link and short code, with no accounts.

## Non-negotiables

- **Hidden information is the product.** Every read is a per-viewer projection computed on the server (`gameView(viewer)`). Never add a query that returns full game state, and never ship a debug query that does. A player must not be able to learn another player's character by reading their own network traffic.
- **The rules engine is pure.** Rules live in plain TypeScript that takes state in and returns state plus events out — no Convex imports, no Effect, no `Date.now()`, no `Math.random()`. Randomness arrives as a seed. Convex mutations are thin adapters around it. See [architecture](docs/technical/architecture.md).
- **Characters are data.** Ability text, night-order position, alignment, and targeting constraints live in tables, not in control flow, so fixing a rule is a data edit and a second script is a content drop.
- **Content accuracy beats invention.** Ability text and night order must match the official almanac. When a rule is unclear, record the uncertainty in a comment or a ticket rather than guessing silently.
- **No official art, no monetisation, and the trademark is not the product name.** This is an unofficial play aid.

## Working rules

- Read [docs/agent-lessons.md](docs/agent-lessons.md) before nontrivial work. For backend work also read [docs/technical/convex-backend-standard.md](docs/technical/convex-backend-standard.md) and [convex/AGENTS.md](convex/AGENTS.md), and read `convex/_generated/ai/guidelines.md` before touching Convex runtime wiring.
- Track development work on the in-app dev board at `/dev/board` (localhost only, no login). When a prompt introduces new work, add it as a ticket there too. Do not open a separate tracker.
- For UI work read [docs/design/principles.md](docs/design/principles.md) first, then use tokens from `packages/design/src/tokens.css` mapped to Tailwind utilities. Do not use colours outside those tokens.
- Keep durable decisions in [docs/technical/decisions.md](docs/technical/decisions.md) and [docs/product/decisions.md](docs/product/decisions.md), dated, the day they are made.
- The toolchain is Vite+ (`vp`, e.g. `node_modules/.bin/vp`): `vp build`, `vp dev`, `vp test`, `vp check` (`--fix` to autofix). There is no standalone `vite` binary — never run bare `vite`.
- Commit in small logical slices and push promptly. Never commit secrets, real player data, or `.env.local`.
- This repo began as a copy of the [christ-online](https://github.com/kimchi-lettuce) skeleton with a fresh history (2026-11-11). Preserve attribution to the upstream TanStack starter: https://github.com/TanStack/router/tree/main/examples/solid/start-convex-better-auth

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

<!-- convex-ai-end -->
