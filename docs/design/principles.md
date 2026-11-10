# Design principles

How the screens should behave. Written from the first playtest conversation (2026-11-11) — these are rules, not preferences, and they exist because the game is a conversation first and software second.

## 1. Explain at the moment of relevance

A player who has played once should never have to read a manual, and should never be told something before it matters.

- The rule appears **on the screen where it is needed**, in **one sentence**, then gets out of the way.
- Anything longer than a sentence is a link, a sheet, or a tooltip — never body copy.
- Nobody sees a tutorial. The first time a player learns what a ghost vote is, it is the morning after they die, because that is the first moment it applies to them.
- Corollary: never front-load a game setup screen with rules. Deal the character, show the character's ability, and let the game teach the rest.

## 2. Physical first, software second

The table is the interface. The app records what happened there; it does not replace the happening.

- Votes are hands in the air and voices at the table. The Storyteller taps **which seats** went up, never a total.
- Discussion, negotiation, and whispers never enter the app.
- Any screen that would make seven people look down instead of at each other is wrong.

## 3. The Storyteller's screen is an overview plus a wizard

- **Overview:** a stacked list of seats with role and live effects — "where am I?" — read-mostly.
- **Wizard:** one question at a time — "what do I do next?" — where changes get committed.
- The overview never allows a state change that the wizard would have refused. Rule enforcement has one home.

## 4. In a dark room, the phone must not glow

Night-time screens are dim, low-contrast, and dark-red where possible, because a bright screen identifies who is awake. Prefer haptics and a quiet wake prompt over a notification that lights a face up.

## 5. Show the state, never the arithmetic

- Vote threshold: computed and displayed, never asked for.
- Ghost votes: shown as available or spent on the seat itself.
- Night order: presented as a sequence, never as a list to interpret.
- If a user needs to remember a number, the UI has failed.

## 6. Never show a secret that isn't yours

Redaction happens on the server. The client is not trusted, and "hide it with CSS" is not a redaction. See the projection rule in [technical/architecture.md](../technical/architecture.md).

## 7. Every screen has one job

If a screen is doing two jobs it is two screens: the Storyteller's overview and the Storyteller's wizard are separate views of the same data, and so are the player's role card and the player's night prompt.
