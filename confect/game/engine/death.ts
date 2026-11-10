import { countAlive } from "./vote";
import type { EngineEvent, Game, WinCheck } from "./types";

/*
 * Death and the endgame.
 *
 * The game ends the instant the Demon dies (good wins) or only two players are
 * left alive (evil wins). That check runs after *every* death, night or day:
 * two code paths that kill and only one of them checking the endgame is how a
 * game ends up unable to end.
 */

export function applyDeath(game: Game, seatIndex: number): { game: Game; events: EngineEvent[] } {
  const seat = game.seats.find((candidate) => candidate.seatIndex === seatIndex);
  if (!seat) throw new Error(`No seat ${seatIndex}`);
  if (!seat.alive) return { game, events: [] };

  return {
    game: {
      ...game,
      seats: game.seats.map((candidate) =>
        candidate.seatIndex === seatIndex ? { ...candidate, alive: false } : candidate,
      ),
    },
    events: [{ kind: "death", subjectSeatIndexes: [seatIndex] }],
  };
}

export function checkWin(game: Game): WinCheck {
  const demonAlive = game.seats.some(
    (seat) =>
      seat.alive &&
      game.script.some(
        (character) => character.characterId === seat.roleId && character.alignment === "demon",
      ),
  );

  if (!demonAlive) {
    return { winner: "good", reason: "demon-dead" };
  }
  if (countAlive(game) <= 2) {
    return { winner: "evil", reason: "two-players-left" };
  }
  return null;
}

/** Apply a death and resolve the endgame in one step. */
export function killAndCheck(
  game: Game,
  seatIndex: number,
): { game: Game; events: EngineEvent[]; win: WinCheck } {
  const death = applyDeath(game, seatIndex);
  const win = checkWin(death.game);

  if (!win) return { ...death, win: null };

  return {
    game: {
      ...death.game,
      status: "ended",
      winner: win.winner,
    },
    events: [
      ...death.events,
      {
        kind: "game.ended",
        data: { winner: win.winner, reason: win.reason },
      },
    ],
    win,
  };
}
