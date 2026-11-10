# Clocktower

A digital companion for **Blood on the Clocktower**, the social-deduction game where one person runs the game and everyone else lies to each other.

It exists because the physical game is expensive and hard to get hold of, and because a phone is a much better place to keep a secret than a table covered in cardboard.

**Working name:** `clocktower` in code and folders. The public name, domain, and repo are not settled — see the [product decision](../docs/product/vision.md) and the trademark note in [AGENTS.md](AGENTS.md).

## What it is

- **An in-person game-night tool.** Everyone is in the same room with their own phone. One person is the Storyteller and runs the game from their phone.
- **Storyteller-lite.** The app knows the rules — night order, targeting constraints, the vote threshold, poisoning, ghost votes — and walks the Storyteller through them a step at a time. The Storyteller still makes every judgement call the rules leave open. It is _not_ an automated game master.
- **Trouble Brewing first.** One script, 22 characters. Characters are data, so a second script is a content drop rather than a rewrite.
- **Shareable without accounts.** A game has a short code, a link, and a QR code. No signup, ever.

## Stack

- [Solid](https://solidjs.com/) 2 + [TanStack Router](https://tanstack.com/router) as a browser-only SPA in `apps/app`
- [Convex](https://www.convex.dev/) as the backend and realtime database, in `convex/`
- [Confect](https://github.com/rjdellecese/confect) for Effect-typed Convex functions, authored in `confect/`
- [Effect v4](https://effect.website/docs/v4/onboarding) at the edges: database access, auth, timers, typed errors
- [Better Auth](https://www.better-auth.com/) through `@convex-dev/better-auth`, used for frictionless guest sessions rather than logins
- [Vite+](https://viteplus.dev/) (`vp`) as the single dev/build/test/lint toolchain
- `packages/design` for shared CSS tokens

The rules engine itself is plain TypeScript with no Effect and no Convex imports — see [architecture](../docs/technical/architecture.md).

## Repository layout

```text
apps/app/    the game (Solid SPA)
packages/design/  shared CSS tokens
confect/     Convex function groups and tables (Confect authoring)
convex/      Convex codegen target + hand-maintained runtime config
docs/        product, design, and technical docs
```

## Run locally

1. Install [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/).
2. `pnpm install`
3. `cp .env.example .env.local`
4. `pnpm run convex:dev` — follow the prompts to create a Convex development deployment. Keep this terminal open; it writes `VITE_CONVEX_URL` into `.env.local`.
5. In a second terminal: `pnpm run dev` and open the URL Vite prints (normally <http://localhost:3000>).

The app is a static SPA, so deploying it means hosting `apps/app`'s build output and pointing it at a Convex deployment. There is no app server.

## Notes

- [Architecture](../docs/technical/architecture.md) — how the pieces fit, including the rules engine boundary
- [Convex backend standard](../docs/technical/convex-backend-standard.md) — how backend code is organised
- [Agent lessons](../docs/agent-lessons.md) — read before nontrivial work
- The in-app dev board at `/dev/board` tracks development work (localhost only, no login)

Unofficial fan tool for private play: no official art, no ads, no charge. Character names and ability text belong to The Pandemonium Institute.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.

<!-- convex-ai-end -->
