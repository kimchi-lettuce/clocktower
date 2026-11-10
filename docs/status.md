# Status and handover

- **Last updated:** 2026-11-11

Read this after [AGENTS.md](../AGENTS.md) and [agent-lessons.md](agent-lessons.md), before picking up work. It says where the project is, what is deliberately unbuilt, and what is still undecided. Update it at the end of any session that changes the answer to either question.

## Where the design came from

The design was settled in one session on 2026-11-11. The durable output is in this repo:

- [product/vision.md](product/vision.md) — scope, non-goals, and the scope ladder
- [product/decisions.md](product/decisions.md) — the product calls, dated, with what was rejected
- [technical/decisions.md](technical/decisions.md) — the architecture calls, including the projection rule and the engine boundary
- [design/principles.md](design/principles.md) — how screens behave
- [product/glossary.md](product/glossary.md) — the shared vocabulary

The reasoning behind it is a Storyteller walkthrough kept outside this repo, in the owner's Obsidian vault at `Projects/clocktower/storyteller-brief.html`. It simulates an eight-player game step by step and is the source of most of the requirements. If a decision here seems arbitrary, that document is usually why.

## What exists

- The forked skeleton, working: Solid SPA, Convex wiring, Confect authoring, Vite+ toolchain, dev board at `/dev/board`
- A Convex development deployment (created 2026-11-11); `.env.local` holds both `CONVEX_URL`/`CONVEX_SITE_URL` and their `VITE_` mirrors that the app reads
- Documentation: vision, both decision logs, glossary, design principles, architecture, backend standard
- **Tables** (`confect/tables/`): `character`, `game`, `seat`, `nightStep`, `nomination`, `gameEvent`
- **The rules engine** (`confect/game/engine/`): pure modules for composition, seeded dealing, vote thresholds and day resolution, death and win conditions, and night-order construction. 43 tests, collected by `vp test` (the include glob now covers `confect/**/*.test.ts`)
- A dev board queue carrying the build order

## What does not exist yet

- **No Confect functions and no game screens.** The engine is pure and tested, but nothing calls it yet: there is no `gameView` projection, no `confect/game/*.spec.ts` / `*.impl.ts`, and no lobby, seat claim, or night wizard.
- **No character ability resolution.** The engine models the sequence and the rules around it; what each character *does* at its step is not implemented, and the fixtures' night-order numbers are placeholders.
- The starter auth screens remain (`login-signup-form.tsx`, `_authed/dashboard`), and the dashboard is now a placeholder rather than the demo it used to be.
- The design tokens are placeholders.

## Next three moves

In order; the rest is on the dev board.

1. **Character data for the first cast** — import Chef, Empath, Fortune Teller, Undertaker, Monk, Drunk, Poisoner, Imp with real night-order positions and exact ability text, verified against two independent sources. The engine's fixtures point at exactly what this replaces.
2. **`gameView(viewer)` and the leak test** — the projection is the product's safety property, and it is the next thing that cannot be deferred.
3. **Join flow** — room code, link, QR, guest identity, seat PIN, lobby lock. Without it there is no way to reach a real table.

## Open questions

Deliberately unresolved; each should be answered by building or by a playtest, not by more discussion.

| Question | Current leaning |
|---|---|
| Does the app enforce "one nomination per player per day, one nomination against"? | Yes, computed, like the vote threshold. |
| What does a dead player's phone show for the rest of the game? | Their role card, greyed, plus their ghost-vote state. |
| What if the Storyteller's phone dies mid-game? | Server state is authoritative; another device can take the Storyteller seat. Not designed. |
| Does the day phase have any timer? | No timers in v1. The Storyteller paces the room. |
| Product name, domain, branding | Parked on purpose. Repo is `clocktower`; the product ships unnamed until it has been played. |

## How to verify the repo is healthy

Tests: `vp test` (43 passing). Full health check:

```bash
pnpm install           # do not regenerate the lockfile casually: see the pnpm override note
pnpm exec confect codegen
pnpm exec vp check     # format + lint + typecheck
pnpm --filter @clocktower/app build
```
