# Glossary

One meaning per word. Use these terms in docs, code, and UI copy — never a synonym.

| Term | Meaning |
|------|---------|
| **Script** | A set of characters a game is dealt from. Trouble Brewing is the first one. |
| **Character** | A role with an ability, an alignment, and a place in the night order. |
| **Seat** | A player's place at the table, numbered clockwise. The grimoire is organised by seat. |
| **Alignment** | Good or evil. Most characters are good; Minions and the Demon are evil. |
| **Townsfolk** | Good character with a useful ability. The majority in a full game. |
| **Outsider** | Good character whose ability hurts its own team. |
| **Minion** | Evil character who protects the Demon. |
| **Demon** | The evil character who kills at night. Executing the Demon wins the game for good. |
| **Storyteller (ST)** | The non-player who runs the game, holds all information, and makes the judgement calls. |
| **Grimoire** | The Storyteller's full view of the game: every seat, every real character, every live effect. Players never see it. |
| **Believed role** | The character a player *thinks* they are. Differs from the real role for the Drunk, and for anyone the Storyteller has misled. |
| **Night order** | The fixed sequence in which characters wake at night. The first night and later nights have different sequences. Order changes outcomes, so it is data, not code order. |
| **Step** | One entry in a night's sequence: wake a character, take a target, resolve. May be skipped, cancelled, or resolve to nothing. |
| **Target** | The player or players a character acts on. Constraints are rules ("not yourself", "not a dead player"). |
| **Poisoned** | A live effect from the Poisoner: the affected character's ability misbehaves tonight and the following day. The Storyteller supplies the false result. |
| **Droisoned** | Shorthand for "poisoned or drunk" — the two ways an ability silently fails. Not a displayed term. |
| **Red herring** | The good player who registers as a Demon to the Fortune Teller. Chosen by the Storyteller at game start. |
| **Execution** | The day's vote outcome: a nominated player with at least the required votes dies. |
| **Vote threshold** | The number of votes needed to execute: half of the living players, rounded up. Always computed from who is alive now, never stored. |
| **Nomination** | A player putting another player up for execution. A nomination round has its own vote. |
| **Ghost vote** | A dead player's single remaining vote, usable once for the rest of the game. |
| **Event** | One recorded thing that happened, appended to the game log: a step resolved, a vote held, a death, a secret set. The event log is the replay. |
| **Projection** | The server-side reduction of game state to what one viewer is allowed to see. Every read is a projection. |
| **Room code** | The short per-game code (and matching link / QR) that lets seats be joined without an account. |
| **Town square** | The public view of the game: who is alive, who is dead, nominations, results. Contains no roles. |
