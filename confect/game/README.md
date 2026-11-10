# game

Owner of the game itself: the state of one game, the rules, and the read model
that every screen renders.

## What lives here

- `engine/` — the rules. Plain TypeScript, no Convex and no Effect imports, no
  clock, randomness as a seed. Pure functions in, state plus events out, so the
  rules are tested by calling them and replayed exactly from a log.
- `*.spec.ts` / `*.impl.ts` — the Confect functions that adapt the engine to
  Convex: load state, call the engine, persist state and events, reject writes
  whose `version` is stale.
- Tables (declared in `../tables/`): `game`, `seat`, `character`, `nightStep`,
  `nomination`, `gameEvent`.

## Invariants

1. **No read returns the whole game.** Every screen reads `gameView(viewer)`,
   redacted on the server, because a single full-state query hands every role to
   anyone with devtools open.
2. **The engine owns the rules.** Adapters do not branch on game rules; if a
   rule is missing from the engine, add it there and test it there.
3. **The event log is append-only.** Undo is a correcting event, not an edit.
4. **`believedRoleId` is what a player sees.** The Drunk's real role must never
   appear in that player's projection.
5. **Vote thresholds are computed, never stored.** The stored `threshold` on a
   nomination row is a record of what it was, not a source of truth.

## Not built yet

Ability resolution per character, night pacing, the projection itself, and the
join flow. See `docs/status.md`.
