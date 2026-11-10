# Technical decisions

Dated architecture decisions. Newest first. Carried-over entries (pre-2026-11-11) come from the christ-online skeleton this repo was forked from; the reasoning still applies, the church specifics do not.

## 2026-11-11 — Per-viewer projections only; no full-state reads

- **Decision:** The single read model is `gameView(viewer)`. The server decides who the caller is, then returns one of three shapes: Storyteller (everything), player (own role, own information history, public state), spectator (public state only). There is no query that returns the whole game, and no debug query that does either.
- **Why:** Clocktower is an information-asymmetry game and Convex hands query results to the browser. One accidental `getGame()` and any player can read every role with devtools open, which ends the game permanently and silently. One door with server-side redaction is the only shape that is safe by construction.
- **Consequence:** Every new field on the game must be classified as Storyteller-only, player-visible, or public, at the moment it is added. The Confect spec declares the projection as a discriminated union on viewer kind, so leaking a field is a type error.
- **Test that must exist:** for every viewer kind, assert that the payload contains no character name or role string that isn't the viewer's own (with the Minion/Demon pair excepted for those two players).
- **Considered and rejected:** Trusting the client to hide fields (it can't); a `publicGame` + `privateGame` split (two shapes to keep in step, and the private one still needs a viewer check).

## 2026-11-11 — A pure rules engine, with thin Convex adapters

- **Decision:** Game rules live in plain TypeScript modules that take state and a command in and return new state plus events out. They import nothing from Convex or Effect, take no clock, and take randomness as a seed. Convex mutations load state, call the engine, and persist the result.
- **Why:** Testability is a property of where the boundary is drawn, not of the library. Rules scattered through mutations can only be tested against a live deployment, drift between call sites, and cannot be replayed. A pure engine is testable in milliseconds, produces an event log for free (replay, undo, review), and makes seeded randomness reproducible.
- **Consequence:** Effect is used at the edges only — database access, auth, schedulers, typed errors. A rules function that needs a service is a sign the boundary moved.
- **Considered and rejected:** Effect throughout including the rules (testable if `R = never`, but heavier to read and worse in stack traces than plain functions); rules inside mutations (the default failure mode this decision exists to prevent).

## 2026-11-11 — Guest identity: room code, no accounts

- **Decision:** Joining a game requires no account. A game has a 5-character room code, a link containing that code, and a QR code that encodes the link. Identity is a guest session bound to the device (local storage); a per-seat 4-digit PIN is the fallback for a changed device, and the Storyteller can reassign a seat directly. The lobby locks when the game starts, and idle games expire.
- **Why:** A public, in-person tool has to work thirty seconds after someone opens the link. Passwords and email would kill that. The device binding covers the common failure (refresh, lock screen); the PIN and the Storyteller cover the rare one (dead phone). Making the Storyteller the recovery mechanism removes account recovery from the product entirely.
- **Considered and rejected:** Email/password accounts (friction with no benefit for a two-hour game); rejoin-by-name (collides, and invites impersonation); a link with no code (the link becomes a permanent password in a group chat).
- **Consequence:** Because guests are anonymous, game creation needs rate limiting and games need an expiry job, or hosting cost has no ceiling.

## 2026-11-11 — Votes are recorded by seat, not as a total

- **Decision:** The Storyteller taps the seats whose hands went up. The app counts, compares against the computed threshold, and marks ghost votes spent.
- **Why:** A total cannot tell the app who voted, so it cannot track ghost votes or produce a review. Tapping seats is the same effort as counting and typing, and gives a complete record. It also makes an illegal vote impossible to record: a dead player with no ghost vote left is not tappable.
- **Considered and rejected:** Digital voting from players' phones (removes the physical drama and pulls attention off the table); the Storyteller typing a total (loses the record and the rule guard).

## 2026-11-11 — Forked from christ-online with a fresh root commit

- **Decision:** This repo was created by copying the christ-online working tree (no git history) into a new repository with a single root commit, then deleting the church-specific product, brand, and deployment artefacts.
- **Why:** The skeleton's hand-built parts are the expensive parts — the Solid 2 Convex adapter, the Vite+ configuration, the Confect v10 layout, the dev board — and rewriting them would repeat solved problems. The history, however, carries another product's context and belongs to a shared project.
- **Consequence:** Attribution to christ-online and to the upstream TanStack starter stays in the README. Anything that still reads as church-specific is a bug in the fork.

## 2026-10-17 — Vite+ as the unified toolchain

- **Decision:** Vite+ (`vite-plus` 1.3.0 / the `vp` CLI) is the single toolchain: `vp dev` / `vp build` per app, `vp run -r build` for the workspace, `vp check` for format + lint + typecheck, `vp test` for tests. pnpm overrides alias `vite@*` to `@voidzero-dev/vite-plus-core`, so every `vite` import resolves to the same core.
- **Why:** It fills the repo's need for a linter, formatter, and test runner with one dependency and one config surface, plus cached monorepo task runs.
- **Consequence:** There is no standalone `vite` binary — scripts and docs must call `vp`, never bare `vite`.
- **Follow-ups:** `confect/**` test files are not in `test.include` yet; add them when the first real engine suite exists.

## 2026-10-15 — In-house UI primitives until Kobalte 2.0 stabilises

- **Decision:** Build UI primitives in-house under `apps/app/src/components/ui/`, styled from tokens, with a localhost-only gallery page instead of Storybook.
- **Why:** The app runs Solid 2 RC. Kobalte's Solid 2 line is alpha, solid-ui targets the Solid 1 lineage, and v1-era packages break on Solid 2. A second app to maintain is not worth it for a small team.
- **Consequence:** Keep primitives small and headless-ish so swapping internals for Kobalte 2 stable later is mechanical. More detail: [design/ui-foundation.md](../design/ui-foundation.md).

## 2026-10-15 — Confect v10 layout: root `confect/` directory

- **Decision:** Backend authoring uses Confect 10's own layout: a root `confect/` directory for tables and function groups, with `convex/` as codegen output plus hand-maintained runtime configuration.
- **Why:** `confect codegen` hardcodes its authoring directory as the sibling of the Convex functions directory — it is not configurable. Pointing the functions directory at `confect/` makes codegen treat authoring sources as managed output and delete them (verified 2026-10-15).
- **Consequence:** `convex/` files written by codegen must never be hand-edited. More detail: [convex-backend-standard.md](convex-backend-standard.md).

## 2026-10-09 — Browser-only SPA calling Convex directly

- **Decision:** The app is a browser-only SPA. Product reads and writes call Convex directly from the browser; there is no app server and no SSR runtime.
- **Why:** Convex already owns persistence, validation, auth, and realtime. A second hop adds complexity without improving the product, and keeps the reactive path short.
- **Considered and rejected:** SSR (the product does not need it); proxying product calls through server functions (recreates the hop being removed).

## 2026-10-09 — Cross-domain Better Auth hosted in Convex

- **Decision:** Better Auth runs on Convex HTTP routes and the SPA obtains a Convex JWT from it, using the package-supported cross-domain mode.
- **Why:** The SPA and auth service are different origins, so cookies alone cannot carry the session.
- **Note:** The auth model here is guest sessions, not sign-in flows. See the room-code decision above; any authenticated account feature must justify itself against the no-accounts default.

## 2026-10-09 — Solid 2 `onSettled` cleanup for Convex subscriptions

- **Decision:** The Solid 2 Convex adapter subscribes inside `onSettled` and returns the unsubscribe function as the cleanup.
- **Why:** Solid 2 uses `onSettled` for lifecycle; an immediately-invoked cleanup disposes the subscription before it fires and leaves reactive UI blank.

## 2026-10-09 — One local Convex/Solid adapter

- **Decision:** `apps/app/src/library/convex-client.tsx` is the project-owned bridge between Convex and Solid 2, rather than the `convex-solidjs` package.
- **Why:** `convex-solidjs` targets Solid 1 and imports `solid-js/web`, which no longer exists in the Solid 2 package split. The adapter is small enough to own.
- **Consequence:** The adapter is maintenance surface. If Convex changes its browser API, update the adapter.

## 2026-10-09 — One shared Convex backend client

- **Decision:** Server-side functions reuse a single Convex client, attaching each request's own token before a call, and skip the client's waiting queue.
- **Why:** Building a client per call wastes work; sharing one without per-call tokens can send one person's credentials with another request's data, so the per-request token attach and the queue-skip go together.

## 2026-10-09 — Confect-first Convex domain modules

- **Decision:** `convex/` stays the canonical backend directory and backend code is organised into domain modules. Confect and Effect provide typed schemas, contracts, and services inside that backend; they are not a separate backend surface.
- **Why:** Domain-oriented modules give maintainers and agents stable file seams without losing Convex transactions, reactive reads, or the generated API path.
- **More detail:** [convex-backend-standard.md](convex-backend-standard.md)
