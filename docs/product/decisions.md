# Product decision log

Durable product decisions, dated, newest first, written so a player can read them without code words. Architecture choices live in [technical/decisions.md](../technical/decisions.md).

## Format

- **Date:** YYYY-MM-DD
- **Decision:** one sentence
- **Why:** one short paragraph
- **Considered and rejected:** the alternatives and why they lost
- **More detail:** link to a page or brief, if one exists

## 2026-11-11 — Build on a fork of botc.town, not on this app

- **Decision:** The product ships as a fork of [BOTC Townsquare](https://botc.town) (MIT, <https://github.com/brennenho/botc>), developed at `~/Developer/clocktower-town` and pushed to `github.com/kimchi-lettuce/botc`. This repository stays as the rules engine and the content of record — the place where the mechanics are proved — but no longer carries the user interface.
- **Why:** The parts that take weeks are already built, tested and deployed there: a private grimoire, a six-character code with an invite link and QR, player phones with no accounts, live presence, reminder tokens, demon bluffs, a night-order sheet with per-step instructions, and three scripts. Their Trouble Brewing ability text matches ours word for word across all 20 shared characters. What is genuinely missing is the day phase — their schema has `alive` and `ghost_vote_available` and no votes at all — and a player screen that leads with the player's own character. Those two are exactly what our engine and our taste supply, and every increment of the fork is playable, while this app cannot be played until the day phase lands.
- **Considered and rejected:** Finishing this repository (largest effort, and it rebuilds a lobby, grimoire and join flow that exist for free); our own frontend against botc.town's hosted backend (no API contract, so a refactor breaks a game mid-night; their infrastructure carrying our friends' games; and our leak guarantee would be rented rather than owned); a from-scratch rewrite in the same stack (replaces working code with the same design).
- **Consequences:** The Solid UI work here is retired — the screens and the design reasoning carry over, the components do not. The rules engine, the vote and day arithmetic, and the verified night-order content port across because they are pure TypeScript. Official token art now ships with the product (upstream syncs TPI's published toolmaker resources), so the "no official art" principle is retired; the ability text stays faithful and the product stays free. See [landscape.md](landscape.md) for the evidence and the fork's `docs/FORK-PLAN.md` for the build order.

## 2026-11-11 — Storyteller-lite, not an automated game master

- **Decision:** The app enforces the mechanics and prompts the Storyteller step by step. A human Storyteller remains responsible for every judgement call the rules leave open — what a poisoned player is told, who the red herring is, when a Minion becomes the Demon.
- **Why:** Those calls are the game. Automating them produces a worse game and a much bigger product, and in an in-person game someone has to be awake holding the phone anyway. Enforcing the mechanics is what makes a first-time Storyteller viable, which is the actual problem.
- **Considered and rejected:** Fully automated play with no Storyteller (a research project, and it removes the human judgement that makes the game work); a paper-companion app that only deals roles (honest, but does not solve the problem it is for).
- **More detail:** [vision.md](vision.md)

## 2026-11-11 — In-person first, shareable by link

- **Decision:** The v1 use case is a group in one room with their own phones. The tool is public and shareable — anyone can start a game from a link — but it does not attempt remote play.
- **Why:** In-person removes the single most expensive feature (voice) and matches how the game is actually played. Being shareable without accounts is what makes it useful to other groups.
- **Considered and rejected:** Remote play with built-in voice (a media platform, not a game aid); invitation-only/private deployment (makes it useless to the friends it is meant for).
- **Consequence:** The Storyteller runs the game from a phone, not a tablet or laptop, so the Storyteller UI must work at phone width — no grimoire grid.

## 2026-11-11 — Trouble Brewing first; characters are data

- **Decision:** Ship one script, Trouble Brewing (22 characters). Model characters as data — alignment, ability text, night-order position, targeting constraints — so later scripts are content drops.
- **Why:** It is the script every group starts on and the one the tool's first users will know. Making characters data means fixing a rule is an edit to a row, and a second script does not require touching the engine.
- **Considered and rejected:** All three base scripts at launch (a large content effort before a single playtest); custom/community scripts (requires abilities expressive enough for rules nobody has written yet).

## 2026-11-11 — Digital from the first playtest, with a curated cast

- **Decision:** The first playtest is played entirely on the app — no paper fallback anywhere, including the night sequence. It uses a fixed cast of eight characters: Chef, Empath, Fortune Teller, Undertaker, Monk, Drunk, Poisoner, Imp.
- **Why:** Paper fallback would let the app stay unfinished and still appear to work. A fixed cast keeps the first playtest reachable without implementing all 22 Trouble Brewing characters, and that cast already exercises every mechanical lesson the walkthrough surfaced: poisoning before the ability resolves, false information, the red herring, the Drunk's invented reading, protection eating a kill, and ghost votes. Eight characters at eight players is a valid composition (5 Townsfolk / 1 Outsider / 1 Minion / 1 Demon).
- **Consequence:** The remaining 14 characters are added after the flow is proven, and each is a data row plus its constraints, not a new feature.
- **Considered and rejected:** Shipping the day phase first and writing the night on paper (defers the hardest screen, which is the one being tested); implementing all 22 characters before any playtest (a large content effort before the first feedback).

## 2026-11-11 — The app shows the truth; the Storyteller decides the lie

- **Decision:** Where information must be false — a poisoned player's answer, the Drunk's reading, the red herring — the app shows the Storyteller the true value privately, offers "give the real answer anyway", records what was actually said, and never invents the lie itself.
- **Why:** Choosing the lie is the most interesting thing a Storyteller does, and a wrong automatic lie is indistinguishable from a bug. Structured this way, v1 needs no cleverness about plausible-sounding misinformation, and the same screen can later offer generated suggestions without changing the flow.
- **Considered and rejected:** The app picking a believable lie from the seed (a future option behind the same screen, not a v1 dependency); the app silently telling the poisoned player the truth (breaks the Poisoner's ability).
- **More detail:** [design/principles.md](../design/principles.md), [technical/decisions.md](../technical/decisions.md)

## 2026-11-11 — Explain in one sentence, at the moment it matters

- **Decision:** Every rule is surfaced where it becomes relevant, once, in one sentence. There are no tutorials, no rule pages, and no setup screen full of instructions.
- **Why:** The first users will have played once. Information delivered before it applies is noise; information delivered at the moment of need is teaching. It also keeps the screens small enough for a phone.
- **More detail:** [design/principles.md](../design/principles.md)

## 2026-11-11 — Physical votes, digital record

- **Decision:** Voting stays physical — hands in the air at the table. The Storyteller taps which seats voted; the app counts, applies the threshold, and spends ghost votes.
- **Why:** The raising of hands is the drama. Only the arithmetic is a chore, and the app can do that without asking anyone to look at a screen during the argument.
- **Considered and rejected:** Phone-based voting (removes the drama and the eye contact); the Storyteller entering a total (loses ghost-vote tracking and the rules guard).

## 2026-11-11 — No accounts

- **Decision:** Joining a game never requires an account. Seats are held by a device, recoverable with a per-seat PIN or by the Storyteller.
- **Why:** A tool handed to friends in a group chat has to work immediately. Accounts would gate the only moment that matters — the start of the game.
- **More detail:** [technical/decisions.md](../technical/decisions.md)
