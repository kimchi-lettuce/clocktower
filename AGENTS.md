# ChristOnline project instructions

ChristOnline is an all-in-one church management system (CMS) being developed with Daniel Chin. Its starting application is based on the TanStack Router Solid Start + Convex + Better Auth example.

- Keep product context and durable decisions in `docs/`.
- Track development tasks on the in-app dev board at `/dev/board` (localhost only, no login). When a prompt introduces new work items, add them as tickets there too (see [convex/AGENTS.md](convex/AGENTS.md) for the `confect/devboard` group). Do not open a separate tracker and do not let tasks live only in prompt files.
- Read [`docs/agent-lessons.md`](docs/agent-lessons.md) before nontrivial work. For backend work, also read [`docs/technical/convex-backend-standard.md`](docs/technical/convex-backend-standard.md) and [`convex/AGENTS.md`](convex/AGENTS.md). After a session that corrected a real mistake, consider whether that mistake produced a durable lesson for the file — the bar for adding one is high.
- For UI work, read [`docs/design/brand.md`](docs/design/brand.md) first and use brand tokens from `packages/design/src/tokens.css` (mapped to Tailwind utilities like `bg-accent`); do not use colors outside the brand tokens.
- Preserve attribution to the upstream starter: https://github.com/TanStack/router/tree/main/examples/solid/start-convex-better-auth
- Keep the top-level README oriented to ChristOnline, with consolidated setup instructions and upstream attribution.
- Do not commit secrets or real church/member data.
- Never commit to git without explicit approval from Daniel first.
- The toolchain is Vite+ (`vp`, e.g. `node_modules/.bin/vp`): use `vp build`, `vp dev`, `vp test`, and `vp check` (`--fix` to autofix lint/format); there is no standalone `vite` binary — never run bare `vite`. See [docs/technical/architecture.md](docs/technical/architecture.md) and the 2026-10-17 decision in [docs/technical/decisions.md](docs/technical/decisions.md).

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
