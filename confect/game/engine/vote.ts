import type { DayOutcome, Game, VoteOutcome } from "./types";

/*
 * Voting. The table raises hands; the Storyteller taps which seats voted.
 *
 * Two rules live here and nowhere else:
 * - the threshold is half the *living* players, rounded up, recomputed every
 *   time rather than remembered;
 * - a dead seat votes once for the whole game, not once per day, so ghost votes
 *   are spent across the day's rounds, in the order they happened.
 */

export function countAlive(game: Game): number {
  return game.seats.filter((seat) => seat.alive).length;
}

export function voteThreshold(aliveCount: number): number {
  return Math.ceil(aliveCount / 2);
}

export type Nomination = {
  nominatorSeatIndex: number;
  nomineeSeatIndex: number;
  voterSeatIndexes: readonly number[];
};

/** Rule violations that must be refused before the vote is recorded. */
export function nominationProblems(game: Game, nomination: Nomination): string[] {
  const problems: string[] = [];
  const bySeat = new Map(game.seats.map((seat) => [seat.seatIndex, seat]));

  const nominator = bySeat.get(nomination.nominatorSeatIndex);
  if (!nominator) {
    problems.push(`No seat ${nomination.nominatorSeatIndex}`);
  } else if (!nominator.alive) {
    problems.push("A dead player cannot nominate");
  }

  const nominee = bySeat.get(nomination.nomineeSeatIndex);
  if (!nominee) {
    problems.push(`No seat ${nomination.nomineeSeatIndex}`);
  } else if (!nominee.alive) {
    problems.push("A dead player cannot be nominated");
  }

  if (nomination.nominatorSeatIndex === nomination.nomineeSeatIndex) {
    problems.push("A player cannot nominate themselves");
  }

  return problems;
}

export type DayResult = {
  outcome: DayOutcome;
  tallies: VoteOutcome[];
  /** Every ghost vote spent today, in the order spent. */
  ghostVotesSpent: number[];
};

/**
 * Resolve a day of nominations. Rounds are processed in the order they were
 * called, so a ghost vote raised in the first round is gone for the second.
 */
export function resolveDay(params: { game: Game; nominations: readonly Nomination[] }): DayResult {
  const { game, nominations } = params;

  if (nominations.length === 0) {
    return {
      outcome: { executed: null, reason: "no-nominations" },
      tallies: [],
      ghostVotesSpent: [],
    };
  }

  const bySeat = new Map(game.seats.map((seat) => [seat.seatIndex, seat]));
  const threshold = voteThreshold(countAlive(game));
  const spent = new Set<number>();
  const tallies: VoteOutcome[] = [];

  for (const nomination of nominations) {
    const rejected: number[] = [];
    const seen = new Set<number>();
    let count = 0;

    for (const seatIndex of nomination.voterSeatIndexes) {
      if (seen.has(seatIndex)) continue; // one vote per seat per round
      seen.add(seatIndex);

      const seat = bySeat.get(seatIndex);
      if (!seat) {
        rejected.push(seatIndex);
        continue;
      }
      if (seat.alive) {
        count += 1;
        continue;
      }
      if (seat.ghostVoteAvailable && !spent.has(seatIndex)) {
        spent.add(seatIndex);
        count += 1;
        continue;
      }
      rejected.push(seatIndex);
    }

    tallies.push({
      voteCount: count,
      threshold,
      qualified: count >= threshold,
      ghostVotesSpent: [...spent],
      rejectedVotes: rejected,
    });
  }

  const qualified = nominations
    .map((nomination, index) => ({ nomination, tally: tallies[index]! }))
    .filter((entry) => entry.tally.qualified);

  if (qualified.length === 0) {
    return {
      outcome: { executed: null, reason: "below-threshold" },
      tallies,
      ghostVotesSpent: [...spent],
    };
  }

  const best = Math.max(...qualified.map((entry) => entry.tally.voteCount));
  const winners = qualified.filter((entry) => entry.tally.voteCount === best);

  if (winners.length > 1) {
    return {
      outcome: { executed: null, reason: "tie" },
      tallies,
      ghostVotesSpent: [...spent],
    };
  }

  return {
    outcome: { executed: winners[0]!.nomination.nomineeSeatIndex, reason: "most-votes" },
    tallies,
    ghostVotesSpent: [...spent],
  };
}
