/*
 * Ending a day.
 *
 * The rules engine already resolves votes (`resolveDay`) and applies deaths
 * (`applyDeath`). This puts them in the order the table experiences them and
 * moves the clock, because the game is a loop of night and day and only one
 * function should be allowed to turn the page.
 *
 * Two things this file exists to prevent:
 * - a day that ends without checking the endgame, and
 * - ghost votes that are spent in a round but not struck off the seat.
 */

import { killAndCheck } from "./death";
import type { EngineEvent, Game } from "./types";
import { resolveDay, type DayResult, type Nomination } from "./vote";

export type DayResolution = {
  game: Game;
  result: DayResult;
  events: EngineEvent[];
};

const spendGhostVotes = (game: Game, spent: readonly number[]): Game => {
  if (spent.length === 0) return game;
  const spentSeats = new Set(spent);
  return {
    ...game,
    seats: game.seats.map((seat) =>
      spentSeats.has(seat.seatIndex) ? { ...seat, ghostVoteAvailable: false } : seat,
    ),
  };
};

export function applyDayResult(params: {
  game: Game;
  nominations: readonly Nomination[];
}): DayResolution {
  const result = resolveDay({
    game: params.game,
    nominations: params.nominations,
  });

  // Ghost votes are spent whether or not the nomination reached the threshold.
  let game = spendGhostVotes(params.game, result.ghostVotesSpent);
  const events: EngineEvent[] = [
    {
      kind: "vote.resolved",
      data: {
        executed: result.outcome.executed,
        reason: result.outcome.reason,
        tallies: result.tallies.map((tally) => tally.voteCount),
      },
    },
  ];

  if (result.outcome.executed !== null) {
    const executedSeat = result.outcome.executed;
    const death = killAndCheck(game, executedSeat);
    game = death.game;
    events.push(...death.events);
    events.push({
      kind: "execution",
      subjectSeatIndexes: [executedSeat],
      data: { reason: result.outcome.reason },
    });

    // A finished game does not roll over into another night.
    if (death.win) {
      return { game, result, events };
    }
  }

  return {
    game: {
      ...game,
      status: "night",
      nightNumber: game.nightNumber + 1,
    },
    result,
    events,
  };
}
