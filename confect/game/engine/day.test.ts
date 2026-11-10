import { describe, expect, it } from "vitest";

import { applyDayResult } from "./day";
import { gameWithRoles } from "./fixtures";
import type { Game } from "./types";

/*
 * A day in an eleven-player game: 7 Townsfolk, 1 Outsider, 2 Minions, 1 Demon.
 * That is the size the first real playtest is aiming at, so the day arithmetic is
 * checked at that size rather than on a toy table.
 */
const eleven = (): Game =>
  gameWithRoles([
    "chef",
    "empath",
    "fortune-teller",
    "undertaker",
    "monk",
    "washerwoman",
    "librarian",
    "butler",
    "poisoner",
    "spy",
    "imp",
  ]);

describe("applyDayResult", () => {
  it("executes a qualified nominee and rolls into the next night", () => {
    const game = eleven();
    const { game: next, result } = applyDayResult({
      game,
      nominations: [
        { nominatorSeatIndex: 1, nomineeSeatIndex: 9, voterSeatIndexes: [1, 2, 3, 4, 5, 6] },
      ],
    });

    expect(result.outcome).toEqual({ executed: 9, reason: "most-votes" });
    expect(next.seats.find((seat) => seat.seatIndex === 9)?.alive).toBe(false);
    expect(next.status).toBe("night");
    expect(next.nightNumber).toBe(game.nightNumber + 1);
    expect(next.winner).toBeNull();
  });

  it("needs half the living players, rounding up", () => {
    const game = eleven();
    // 11 alive → 6 votes. Five is a failed nomination.
    const five = applyDayResult({
      game,
      nominations: [
        { nominatorSeatIndex: 1, nomineeSeatIndex: 9, voterSeatIndexes: [1, 2, 3, 4, 5] },
      ],
    });
    expect(five.result.outcome.executed).toBeNull();
    expect(five.game.seats.every((seat) => seat.alive)).toBe(true);

    const six = applyDayResult({
      game,
      nominations: [
        { nominatorSeatIndex: 1, nomineeSeatIndex: 9, voterSeatIndexes: [1, 2, 3, 4, 5, 6] },
      ],
    });
    expect(six.result.outcome.executed).toBe(9);
  });

  it("executes nobody on a tie, and still loses the day", () => {
    const game = eleven();
    const { game: next, result } = applyDayResult({
      game,
      nominations: [
        { nominatorSeatIndex: 1, nomineeSeatIndex: 9, voterSeatIndexes: [1, 2, 3, 4, 5, 6] },
        { nominatorSeatIndex: 2, nomineeSeatIndex: 10, voterSeatIndexes: [2, 3, 4, 5, 6, 7] },
      ],
    });

    expect(result.outcome).toEqual({ executed: null, reason: "tie" });
    expect(next.status).toBe("night");
  });

  it("strikes spent ghost votes off the seat", () => {
    const game = eleven();
    game.seats[3]!.alive = false;
    game.seats[3]!.ghostVoteAvailable = true;

    const { game: next, result } = applyDayResult({
      game,
      nominations: [
        { nominatorSeatIndex: 1, nomineeSeatIndex: 9, voterSeatIndexes: [1, 2, 4, 5, 6, 6] },
      ],
    });

    expect(result.ghostVotesSpent).toEqual([4]);
    expect(next.seats.find((seat) => seat.seatIndex === 4)?.ghostVoteAvailable).toBe(false);
  });

  it("does not roll into a night when the execution ends the game", () => {
    const game = eleven();
    const { game: next } = applyDayResult({
      game,
      nominations: [
        { nominatorSeatIndex: 1, nomineeSeatIndex: 11, voterSeatIndexes: [1, 2, 3, 4, 5, 6] },
      ],
    });

    expect(next.winner).toBe("good");
    expect(next.status).toBe("ended");
    expect(next.nightNumber).toBe(game.nightNumber);
  });

  it("ends the day with no execution when nobody was nominated", () => {
    const game = eleven();
    const { game: next, result } = applyDayResult({ game, nominations: [] });

    expect(result.outcome).toEqual({ executed: null, reason: "no-nominations" });
    expect(next.status).toBe("night");
    expect(next.nightNumber).toBe(game.nightNumber + 1);
  });

  it("keeps playing after one wrong execution at eleven players", () => {
    // 11 → 10 alive, demon still alive: the game must not end and must not stop.
    const game = eleven();
    const { game: next } = applyDayResult({
      game,
      nominations: [
        { nominatorSeatIndex: 1, nomineeSeatIndex: 2, voterSeatIndexes: [1, 3, 4, 5, 6, 7] },
      ],
    });

    expect(next.winner).toBeNull();
    expect(next.status).toBe("night");
    expect(next.seats.filter((seat) => seat.alive)).toHaveLength(10);
  });
});
