# Product decision log

Durable product decisions, dated, newest first, written so a player can read them without code words. Architecture choices live in [technical/decisions.md](../technical/decisions.md).

## Format

- **Date:** YYYY-MM-DD
- **Decision:** one sentence
- **Why:** one short paragraph
- **Considered and rejected:** the alternatives and why they lost
- **More detail:** link to a page or brief, if one exists

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
