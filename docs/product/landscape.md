# Landscape

- **Status:** research note, 2026-11-11
- **Owner:** Kinzey

What already exists, what it covers, and what is left. This is evidence, not a decision — decisions about what to build live in [decisions.md](decisions.md).

Read this before proposing a feature that is "missing". Most of them are not missing from the world, only from this repo.

## The four candidates

### botc.town — BOTC Townsquare (the closest match)

Unofficial, open source ([brennenho/botc](https://github.com/brennenho/botc), MIT), Supabase/Postgres backend, live at <https://botc.town>.

- Storyteller creates a game from an edition + player count. Gets a six-character code, an invite link, **and a QR code**.
- Players open the invite, enter a name, **no account required**, and take a seat. Character and alignment stay private until the Storyteller reveals them.
- Grimoire: assign characters, life, alignment, reminder tokens, Demon bluffs, Travellers, night order, voting.
- Trouble Brewing, Bad Moon Rising, and Sects & Violets character sheets.
- Responsive for laptop, tablet, or phone; players use their own phones in person, or pair it with a voice call online.
- Explicit posture: **"The grimoire does not automate rules, narration, voice, or video."**
- One contributor, created 2026-06-16, a handful of stars.

This is our rungs 1, 3 (partly), and 5 (partly), for free, with more content than we have, and it shares our no-accounts and share-by-link shape almost exactly. The gap is the thing in our vision that nobody else claims: **enforcement for a first-time Storyteller.**

### Digital Grimoire — botc.games

Free, closed-source web app for in-person play. Storyteller grimoire on tablet or phone, a **Player Companion** linked to the Storyteller's game, a **Town View** for a shared TV, a Spy view, setup checking (character counts, jinxes, Bootlegger rules), script search, Clocktracker integration, UI in 13 languages. Built by one person who wanted spontaneous games with friends. Mature, actively maintained, no rules enforcement.

### botc.app — Blood on the Clocktower Online (official, TPI)

The Pandemonium Institute's own app: webcam, microphone, animations, sounds, desktop installers, account registration, Patreon-funded. **Made for playing online.** It is the product our vision explicitly rejects: remote play with accounts. Useful as a reference for ability text and night order; not a competitor for an in-person table.

### Blocktower — Blocktower BotC Toolkit

Free iOS/iPad app, closed source. A Storyteller-side toolkit explicitly aimed at "things the Grimoire can't track": automatic vote threshold that recalculates on deaths, nomination tracking, discussion timer, Storyteller notes, end-of-game story/reveal walkthrough, game history. Grimoire photo capture assigns roles to players. It is the nearest existing thing to storyteller-lite, but **only on the Storyteller's device** — no player phones, no dealing, iOS only.

### Also seen, less relevant

`botc-tools.xyz` (open source, MIT; role sheet, night order, role-assignment helper), `Pocket Grimoire` (open source, localisation, custom scripts), `The Grim` (mobile-friendly, step-by-step night order), `Grim-Sim` (animations, undo/redo), `Grimmy`, `Townsquare` (open source online grimoire). All grimoire-shaped. None enforce rules.

## Comparison

Against the things this repo treats as non-negotiable.

| | botc.town | Digital Grimoire | botc.app | Blocktower | **this repo** |
|---|---|---|---|---|---|
| In person, players on their own phones | yes | yes (Player Companion) | no, online | no | yes |
| Short code + link + QR, **no accounts** | yes | unverified | no, login | n/a | link + code, no QR yet |
| Private role reveal per player | yes | yes | yes | yes (photo capture) | yes |
| Hidden info projected server-side, leak-tested | unknown | unknown | unknown | n/a | **yes — 40-deal property test** |
| Enforces vote threshold / ghost votes | no | no | partly? | yes (ST-side) | engine written, **no screen** |
| Refuses illegal night targets, applies poisoning | no | no | unknown | no | **engine written, no screen** |
| Prompts a first-time Storyteller step by step | no | no | no | partly (notes, reveal) | yes — night wizard |
| Scripts | TB, BMR, SnV | TB + custom | all + homebrew | full library | TB only |
| Cost | free | free | free/Patreon | free | n/a |
| Source | MIT | closed | closed | closed | ours |
| Maintenance risk | 1 contributor, new | 1 maintainer, active | TPI | small | us |

Two facts matter more than the rest:

1. **The grimoire, the player phones, and the no-account join flow are solved.** Any of botc.town, Digital Grimoire, or our own repo can seat a table tonight.
2. **Nobody enforces the rules for the human Storyteller.** botc.town deliberately refuses to. Blocktower does the arithmetic but not the night order or the illegal-target checks. That is the only claim in [vision.md](vision.md) that is not already met by free software.

## The three paths

### A. Play first, build later — use botc.town as-is

Storyteller opens botc.town on a laptop or tablet, picks Trouble Brewing and the player count, shows the QR code. Players join on their phones with no signup. Run the game off the grimoire and the printed night sheet.

- **Cost:** minutes, no code.
- **Risk:** the Storyteller has to know the rules. That is the experiment, not a bug — deliberately let the least experienced person storytell.
- **What it buys:** an answer to whether storyteller-lite is a real need or an assumption. Nobody has run that test yet, including us.

### B. Fork botc.town and add the enforcement layer

Take the MIT codebase, keep the grimoire, player phones, QR join, voting, and three scripts, and drop in the pure rules engine from `confect/game/engine/` — which is deliberately Convex-free TypeScript, so it lifts out cleanly — plus `gameView` as the server-side projection.

- **Cost:** days, not weeks, if the frontend framework is tolerable. It replaces our lobby, night wizard, grimoire, and role card with a shipped equivalent and lets the effort go into enforcement.
- **Risk:** their stack is Node/Supabase, so this abandons Convex and Confect, and inherits a one-person project's design choices.
- **Unknown, and it is the deciding one:** the frontend framework and how readable the grimoire code is. Check before committing.

### C. Keep building this repo

Finish the day phase (the gate for a real playtest), then ability resolution, then wake prompts.

- **Cost:** the largest, but the engine, the projection, the leak test, and the lobby already exist and are ours.
- **Risk:** we rebuild a grimoire, a join flow, and a voting UI that free software already has, and we might end with a worse version of botc.town plus a prompt layer nobody asked for.

## The player surface is their weakest part, and the seam is cheap

In botc.town the player gets `read-only-grimoire-board.tsx`: a read-only copy of the Storyteller's town circle, same canvas, same tokens, same header insets. On a 375×667 phone it collapses to the `compact` layout in the top third of the screen, with the player's actual role in a bar at the bottom. That is the "grimoire grid on a phone" this repo's vision rejects — except on the player's own phone, which is worse.

Two things make this the cheapest useful change to make in a fork:

1. **The projection is already correct, so the wire is not the problem.** `getPlayerSnapshotByCode` returns only `game`, the player's own `seat` (role and alignment), and `PlayerSeatView[]`. `createPlayerSeatView` sets `publicRoleId` to the role **only for Travellers** — every other seat's role is nulled before it leaves the server. `createPublicPlayerTokenModel` then shows `ownSeat.roleId` for the player's own token and `publicRoleId` for everyone else. No other seat's `roleId` is ever in the payload.
2. **That payload is exactly what a role-card-first player UI needs** — own role and alignment, plus alive / ghost-vote / occupied per seat. Replacing the player surface is one route (`app/game/[code]/player/[seatId]/page.tsx`) and one component. No schema change, no RLS change, no projection work.

So the fork's order of work is: day phase and vote arithmetic (greenfield schema, our engine drops in), then the player surface (frontend only), then night prompts. All three are playable increments because everything around them already works.

### Verifying the projection yourself

Open a player link, DevTools → Network → the player route's RSC/JSON payload → search for another seat's role id (e.g. `monk`). It should be absent. If it is present, `main` and the deployed build disagree, which matters before forking. Note that `redacted` is only a client-side "hide my screen" toggle (`useState(false)`), not a security boundary.

## Recommendation

Do **A** before choosing between B and C. One game night with a first-time Storyteller on botc.town answers the only open product question, and costs nothing:

- If the Storyteller copes with the printed night sheet and mental vote arithmetic, then the differentiator in the vision is false, and B and C are both unjustified.
- If they fumble the vote threshold, forget that poisoning resolves first, or read the night order wrong, the engine already in this repo is the missing piece — and B is probably cheaper than C.

Path B deserves a serious look regardless: our most valuable asset is the pure engine plus the leak-tested projection, and both are portable. Our least valuable work is UI that already exists elsewhere for free.

## Verified vs assumed

- botc.town behaviour is from its instructions page and README, not from a playtest. Whether its player view actually hides the grimoire from network traffic is **unknown and untested**.
- Digital Grimoire's account requirement and its exact player-view guarantees are **unverified**.
- Blocktower's feature list is from its App Store listing; it has few ratings.
- botc.app is out of scope by design, not by evaluation.

## Sources

- <https://botc.town> and <https://botc.town/instructions>
- <https://github.com/brennenho/botc>
- <https://botc.games> and <https://blog.botc.games/town-view/>
- <https://release.botc.app>
- <https://apps.apple.com/us/app/blocktower-botc-toolkit/id6758778915>
- <https://yoyosource.github.io/BOTC-Links/> — the fan-maintained index of every BotC tool
