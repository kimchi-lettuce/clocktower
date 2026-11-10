import { describe, expect, it } from "vitest";

import { gameWithRoles } from "./fixtures";
import { countAlive, nominationProblems, resolveDay, voteThreshold } from "./vote";

describe("voteThreshold", () => {
  it("is half the living players, rounded up", () => {
    expect(voteThreshold(8)).toBe(4);
    expect(voteThreshold(7)).toBe(4);
    expect(voteThreshold(6)).toBe(3);
    expect(voteThreshold(5)).toBe(3);
    expect(voteThreshold(4)).toBe(2);
    expect(voteThreshold(3)).toBe(2);
  });
});

describe("nominationProblems", () => {
  it("refuses dead nominators and dead nominees", () => {
    const game = gameWithRoles([
      "chef",
      "empath",
      "fortune-teller",
      "undertaker",
      "monk",
      "drunk",
      "poisoner",
      "imp",
    ]);
    game.seats[0]!.alive = false;

    expect(
      nominationProblems(game, {
        nominatorSeatIndex: 1,
        nomineeSeatIndex: 2,
        voterSeatIndexes: [],
      }),
    ).toContain("A dead player cannot nominate");

    expect(
      nominationProblems(game, {
        nominatorSeatIndex: 2,
        nomineeSeatIndex: 1,
        voterSeatIndexes: [],
      }),
    ).toContain("A dead player cannot be nominated");
  });

  it("refuses self-nomination", () => {
    const game = gameWithRoles(["chef", "empath", "poisoner", "imp", "monk"]);
    expect(
      nominationProblems(game, {
        nominatorSeatIndex: 2,
        nomineeSeatIndex: 2,
        voterSeatIndexes: [],
      }),
    ).toContain("A player cannot nominate themselves");
  });
});

describe("resolveDay", () => {
  const eightSeats = () =>
    gameWithRoles([
      "chef",
      "empath",
      "fortune-teller",
      "undertaker",
      "monk",
      "drunk",
      "poisoner",
      "imp",
    ]);

  it("executes the nominee who reaches the threshold", () => {
    const game = eightSeats();
    const result = resolveDay({
      game,
      nominations: [
        {
          nominatorSeatIndex: 6,
          nomineeSeatIndex: 7,
          voterSeatIndexes: [1, 3, 6, 5],
        },
      ],
    });

    expect(countAlive(game)).toBe(8);
    expect(result.outcome).toEqual({ executed: 7, reason: "most-votes" });
    expect(result.tallies[0]!.threshold).toBe(4);
  });

  it("does not execute below the threshold", () => {
    const game = eightSeats();
    const result = resolveDay({
      game,
      nominations: [
        {
          nominatorSeatIndex: 6,
          nomineeSeatIndex: 7,
          voterSeatIndexes: [1, 3, 6],
        },
      ],
    });

    expect(result.outcome).toEqual({ executed: null, reason: "below-threshold" });
  });

  it("executes nobody when the top vote is tied", () => {
    const game = eightSeats();
    const result = resolveDay({
      game,
      nominations: [
        {
          nominatorSeatIndex: 6,
          nomineeSeatIndex: 7,
          voterSeatIndexes: [1, 2, 3, 4],
        },
        {
          nominatorSeatIndex: 5,
          nomineeSeatIndex: 1,
          voterSeatIndexes: [6, 7, 8, 5],
        },
      ],
    });

    expect(result.outcome).toEqual({ executed: null, reason: "tie" });
  });

  it("spends a ghost vote, and counts it", () => {
    const game = eightSeats();
    game.seats[3]!.alive = false; // Dee is dead, ghost vote available

    const result = resolveDay({
      game,
      nominations: [
        {
          nominatorSeatIndex: 6,
          nomineeSeatIndex: 7,
          voterSeatIndexes: [1, 2, 4, 5],
        },
      ],
    });

    expect(result.tallies[0]!.voteCount).toBe(4);
    expect(result.tallies[0]!.ghostVotesSpent).toEqual([4]);
    expect(result.outcome).toEqual({ executed: 7, reason: "most-votes" });
  });

  it("rejects a dead seat that already spent its ghost vote in an earlier round", () => {
    const game = eightSeats();
    game.seats[3]!.alive = false; // Dee, dead in round one, votes

    const result = resolveDay({
      game,
      nominations: [
        {
          nominatorSeatIndex: 6,
          nomineeSeatIndex: 7,
          voterSeatIndexes: [4],
        },
        {
          nominatorSeatIndex: 5,
          nomineeSeatIndex: 1,
          voterSeatIndexes: [4],
        },
      ],
    });

    expect(result.tallies[0]!.voteCount).toBe(1);
    expect(result.tallies[1]!.voteCount).toBe(0);
    expect(result.tallies[1]!.rejectedVotes).toEqual([4]);
  });

  it("counts a seat once even if it is tapped twice", () => {
    const game = eightSeats();
    const result = resolveDay({
      game,
      nominations: [
        {
          nominatorSeatIndex: 6,
          nomineeSeatIndex: 7,
          voterSeatIndexes: [1, 1, 2, 3, 4],
        },
      ],
    });

    expect(result.tallies[0]!.voteCount).toBe(4);
  });

  it("records no execution when nothing was nominated", () => {
    const game = eightSeats();
    expect(resolveDay({ game, nominations: [] }).outcome).toEqual({
      executed: null,
      reason: "no-nominations",
    });
  });
});
