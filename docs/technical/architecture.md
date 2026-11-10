# Architecture

Where state lives, how the game is computed, and where the boundaries are. Product motivation lives in [product/vision.md](../product/vision.md); backend conventions in [convex-backend-standard.md](convex-backend-standard.md).

## The stack, briefly

- Solid 2 + TanStack Router as a browser-only SPA in `apps/app` — no SSR, no app server
- Convex as database, realtime transport, auth host, and scheduler
- Confect for typed Convex functions authored in `confect/`, codegen'd into `convex/`
- Effect at the edges for database access, auth, schedulers, and typed errors
- Tokens only in `packages/design/src/tokens.css`

## The four layers

```text
apps/app                 Solid SPA. Renders projections. Owns no game state.
  │  queries + mutations (direct to Convex)
confect/<domain>/impl    Adapters. Load state → call engine → persist + emit events.
  │  plain function calls, no services
engine/                  The rules. Pure. No Convex, no Effect, no clock, seeded RNG.
```

| Layer | May know about | Must not know about |
|---|---|---|
| `apps/app` | projection shapes, UI state | the rules, real roles of other players |
| `confect/*/impl` | Convex services, Effect, the engine's API | game rules (delegates them) |
| engine | nothing but its own types | Convex, Effect, wall clock, global RNG |

The engine is where the game lives: night order, targeting constraints, poisoning, vote resolution, death, win conditions. It is plain TypeScript so it can be tested by calling a function and replayed from a seed.

## The projection rule

`gameView(viewer)` is the only read model. The server resolves the caller to one of three viewers and returns that viewer's shape:

```ts
type Viewer =
  | { kind: "storyteller" }                        // everything
  | { kind: "player"; seatId: Id<"seat"> }         // own role, own info history, public state
  | { kind: "spectator" }                          // public state only
```

- Redaction happens **before** the data leaves the server. Hiding fields in the client is not redaction.
- The Confect spec declares the return as a discriminated union on `kind`, so adding a field to one shape is a type error until it is classified for the others.
- Public state (who is alive, who died, nominations, vote results) is the town square, and contains no roles.
- A player's *believed* role is what their projection uses. For the Drunk, the real role must never appear in that player's payload.

**The test that protects the product:** for each viewer kind, assert the payload contains no character name or role string that isn't the viewer's own — with the exception of the Minion/Demon pair for those two seats.

## Commands, events, replayability

Writes are commands: `{ gameId, actorSeatId, expectedVersion, command }`.

1. The adapter loads the game.
2. The engine returns `[nextState, events]`.
3. The adapter writes the new state and appends the events, rejecting the command if `game.version` no longer matches `expectedVersion`.

Consequences: concurrent writers cannot silently interleave, every game is replayable from its event log, and a Storyteller can undo a mis-tap by appending a correcting event rather than editing history.

Randomness (role shuffling, tie-breaking the Storyteller doesn't decide) comes from a seed stored on the game, so a replay reproduces it exactly.

## Where timing lives

Convex scheduled functions handle anything time-based (idle-game expiry, optional night pacing). Timers never live in the engine: the engine takes the current moment as an argument if it needs one, so tests do not wait.

## Auth and identity

Guest sessions, not accounts: a device-bound guest identity (see the room-code decision in [decisions.md](decisions.md#2026-11-11--guest-identity-room-code-no-accounts)), a per-seat PIN as the fallback, and the Storyteller as the recovery mechanism of last resort. Better Auth runs inside Convex through `@convex-dev/better-auth`; the SPA obtains its Convex JWT through the package's cross-domain mode.

Convex functions are the authorization boundary. A player acting on another seat is rejected on the server, not hidden in the UI.

## Toolchain

Vite+ (`vite-plus`) is the single toolchain: `vp dev`, `vp build`, `vp check` (format + lint + typecheck), `vp test`. App-level Vite settings live in `apps/app/vite.config.ts`; the workspace-root `vite.config.ts` scopes tests, lint, and formatting. There is no `vite` binary — never invoke bare `vite`.

## Repo layout

```text
apps/app/         browser SPA (Solid + TanStack Router + Convex client)
packages/design/  shared CSS tokens
confect/          tables + function groups (authoring)
convex/           codegen target + hand-maintained runtime config
docs/             product, design, technical
```

Env vars live at the workspace root (`.env.local` / `.env.example`); `apps/app/vite.config.ts` points `envDir` at the root so the app and the Convex CLI read one file.

## Working on backend code

Read [convex-backend-standard.md](convex-backend-standard.md) and [convex/AGENTS.md](../../convex/AGENTS.md) first, then `convex/_generated/ai/guidelines.md`. Generated files are never hand-edited.
