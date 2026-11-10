# Testing a game

For the owner's own playtests. Written for the session where eleven friends turn up.

## Simulating a table on one machine

Guest identity is a device key in localStorage, and localStorage is shared between
tabs — so use the localhost-only override to give each tab its own identity:

```
http://localhost:3000/?device=ana     ← player
http://localhost:3000/?device=ben     ← player
http://localhost:3000/?device=st      ← Storyteller (create the room in this tab)
```

`?device=` is ignored outside localhost, so a real link can never hand someone a
seat. The identity lasts for the tab's session, which means you can reload and
still be the same player, but a *new* tab needs its own `?device=`.

Then: create the room in the Storyteller tab, copy the code, and join from each
other tab with a name. Eleven tabs is a lot; six is enough to exercise most
branches, and eleven is the size to check before a real game.

## What is worth checking, in order

1. **Join, rejoin, lock.** Join, reload the tab (you are still seated), then start
   and try joining again — it must be refused.
2. **The projection.** On a player's tab, open devtools and search the query
   response for another player's character name. There must be none. This is the
   property the whole product rests on.
3. **The Drunk.** Dealt in games of 8 or more. Their tab shows a Townsfolk; the
   Storyteller's grimoire shows `Drunk` with "Thinks they are the …"; the night
   wizard wakes them in the *believed* role's slot.
4. **Seven players exactly.** At seven, Minions and Demon are introduced to each
   other and the two info steps appear. At six, they are not, and a lone Minion
   learns nothing — check both.
5. **The night sequence.** Walk a full first night with the wizard. The order
   should match the printed sheet, and the instruction text should be the sheet's.
6. **Reload mid-night.** The wizard should come back to the same step.

## What does not exist yet

Check this list before planning a session around it — as of 2026-11-11:

- **No day phase.** Nothing moves the game from night to day. There are no
  nominations, no hands-up voting, no executions, and no second night. A game can
  be seated, dealt, and walked through night one, and that is where it stops. An
  eleven-player game cannot be played to an ending because of this: eleven players
  need several days.
- **No ability resolution.** The app tells the Storyteller what to do and to whom;
  it does not compute what the Fortune Teller is shown, and it does not apply
  poisoning. The Storyteller does that from the rules, as they would with paper.
- **No wake prompt.** Players' phones show a dim "eyes closed" panel; the
  Storyteller taps shoulders as usual. No vibration, no wake lock yet.
- **No QR, no seat PIN, no seat reassignment.** A phone that dies mid-game cannot
  currently get its seat back.

## Reporting a problem

Pause, screenshot, and note the seat and the step. The server state is
authoritative and every game row carries `seed` and `version`, so a deal can be
reproduced exactly from the seed — that is worth quoting in a bug report.
