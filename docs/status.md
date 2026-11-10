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
- A dev board queue carrying the build order

## What does not exist yet

- **No game tables, no engine, no game screens.** There is no `confect/game/` group; nothing about the game is implemented. The starter auth screens (`login-signup-form.tsx`, `_authed/dashboard`) are church-fork remnants still sitting in the app.
- No tests are collected: `confect/**` is outside the `vp test` include glob, and there are no suites yet.
- The design tokens are placeholders.

## Next three moves

In order; the rest is on the dev board.

1. **Tables** — game, seat, step, event, vote/nomination, per [architecture.md](technical/architecture.md). Nothing else can be built first.
2. **Engine skeleton** — `confect/game/engine/`, pure, seeded, with the vote threshold, death, and win-condition rules plus their tests. Wire `confect/**` into the test glob in the same change.
3. **Character data for the first cast** — Chef, Empath, Fortune Teller, Undertaker, Monk, Drunk, Poisoner, Imp, verified against two independent sources.

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

```bash
pnpm install           # do not regenerate the lockfile casually: see the pnpm override note
pnpm exec confect codegen
pnpm exec vp check     # format + lint + typecheck
pnpm --filter @clocktower/app build
```
