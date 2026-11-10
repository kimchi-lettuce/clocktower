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
- **The rules engine** (`confect/game/engine/`): pure modules for composition, seeded dealing, vote thresholds and day resolution, death and win conditions, night-order construction, and `gameView`
- **The projection** (`confect/game/engine/view.ts`): one function that takes the full state plus a `Viewer` (`storyteller` / `player` / `spectator`) and returns only what that person may know. `view.test.ts` is the leak test: a property test over 40 deals that walks every `*characterId` in each view and proves no player sees another seat's role, the Drunk never sees the word drunk, and the red herring appears in no view but the Storyteller's
- **The Convex surface** (`confect/game/games.spec.ts` + `games.impl.ts`): `create` (room code + seed), `join` (seat claim by device), `start` (Storyteller picks the cast; the engine deals and the red herring is chosen), and `view` — the only way to read a game, deriving the viewer from the device key rather than trusting a claim. The view is validated on the way out by `viewSchema.ts`, which rejects an unexpected field such as a grimoire in a player's view
- **The lobby** (`apps/app/src/routes/index.tsx`): create a room, join by code (or by link — the code travels in `?code=`), see the seats, copy the join link, and the Storyteller deals and begins. Guest identity is a device key in localStorage (`library/guest.ts`), and the lobby talks to Convex through an anonymous client (`library/guest-client.ts`) because there are no accounts
- **The night wizard** (`apps/app/src/components/night-wizard.tsx`): one step at a time in the printed order, with the sheet's own instruction for each wake, so the Storyteller's phone replaces the night-order sheet. Progress is persisted on the game row (`nightStepIndex`), so a phone can be locked mid-night and resumed. `nightPlan` in the engine builds the sequence; only the Storyteller's device key can read it or move it
- **The role card** (`apps/app/src/components/role-card.tsx`): a player's phone shows their character face down until tapped, then the exact published ability text. It shows the Drunk the role they believe they are, because that is the lie the whole game rests on
- **The grimoire** (`apps/app/src/components/grimoire.tsx`): the Storyteller's read-only overview — seat, name, role, the Drunk's believed role, the red herring, and ghost-vote state
- **`defaultCast`** (`confect/game/engine/cast.ts`): the chart's share of each alignment in script order, used when the Storyteller does not pick a cast
- 92 tests, collected by `vp test` (the include glob covers `confect/**/*.test.ts`); `pnpm exec tsc --noEmit -p convex` is clean
- **The Trouble Brewing script** (`confect/game/content/troubleBrewing.ts`): all 22 characters with verbatim ability text, a one-line UI text, alignment, and night-order positions. Ability text is verified word for word against four independent references, and both night-order sequences match the printed first-night and other-nights sheets line for line. Each character also carries the sheet's Storyteller instruction for its step (`firstNightNote` / `otherNightNote`), which is what the night screen will display
- A dev board queue carrying the build order

## What does not exist yet

- **No voting screen.** A table can be seated, dealt, and walked through night one. Days do not exist yet: `applyDayResult` is written and tested but nothing calls it, and no nomination can be recorded.
- **`nightStep` rows are still unwritten.** The wizard derives the sequence and persists only how far along the Storyteller is. Rows become necessary when a step resolves something worth remembering (a target, a lie that was told), which is the ability-resolution work.
- **No ability resolution.** The Storyteller still does the pointing, nodding and lying; the app says what comes next and what to say.
- **No QR code**, no seat PIN, no seat reassignment: a lost device currently means the Storyteller cannot hand the seat back.
- **No night wizard state.** `nightStep` rows exist in the schema but nothing writes them; the engine can build the order, and no function persists it.
- **No ability resolution.** What each character does at its step is still the Storyteller's job with no app help.
- **No character ability resolution.** The engine models the sequence and the rules around it; what each character *does* at its step (who the Fortune Teller is shown, what a poisoned player is told) is not implemented. Nothing yet seeds the content into Convex — the character rows are imported by a mutation that does not exist.
- The starter auth screens remain (`login-signup-form.tsx`, `_authed/dashboard`), and the dashboard is now a placeholder rather than the demo it used to be.
- The design tokens are placeholders.

There is a separate guide for simulating a table and for what to check on the day: [testing.md](testing.md).

## Next three moves

In order; the rest is on the dev board.

1. **The day phase** — dawn, nominations, hands-up voting by seat, execution, and the roll into the next night. `applyDayResult` in the engine already does the arithmetic (threshold, ties, ghost votes, deaths, endgame) and is tested at eleven players; what is missing is the Convex functions and the screen. **This is the gate for a real playtest**: an eleven-player game cannot finish without it.
2. **Ability resolution** — what each character actually learns, with poisoning applied before the ability resolves.
3. **Wake prompts** — wake lock, a dim reveal, and best-effort vibration, so the Storyteller is not tap-tap-tapping shoulders all night.

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

Tests: `vp test` (89 passing). Full health check:

```bash
pnpm install           # do not regenerate the lockfile casually: see the pnpm override note
pnpm exec confect codegen
pnpm exec vp check     # format + lint
pnpm exec tsc6 --noEmit -p convex   # typecheck the backend
pnpm --filter @clocktower/app build
```
