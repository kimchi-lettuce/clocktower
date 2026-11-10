import { describe, expect, it } from "vitest";

import { compositionFor, COMPOSITION } from "./composition";
import { compositionProblem, dealRoles } from "./deal";
import { FIRST_CAST, IMP, POISONER, seatsFor, TOWNSFOLK_POOL } from "./fixtures";
import { createRng, shuffle } from "./rng";

describe("compositionFor", () => {
  it("gives the standard eight-player mix", () => {
    expect(compositionFor(8)).toEqual({
      townsfolk: 5,
      outsider: 1,
      minion: 1,
      demon: 1,
    });
  });

  it("covers every supported player count", () => {
    for (let players = 5; players <= 15; players++) {
      expect(COMPOSITION[players]).toBeDefined();
    }
  });

  it("never has more than one Demon and always totals the player count", () => {
    for (const [players, composition] of Object.entries(COMPOSITION)) {
      const total =
        composition.townsfolk + composition.outsider + composition.minion + composition.demon;
      expect(total).toBe(Number(players));
      expect(composition.demon).toBe(1);
    }
  });

  it("throws for an unsupported count", () => {
    expect(() => compositionFor(4)).toThrow();
    expect(() => compositionFor(16)).toThrow();
  });
});

describe("shuffle", () => {
  it("is deterministic for a seed and does not mutate its input", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const a = shuffle(createRng(42), input);
    const b = shuffle(createRng(42), input);

    expect(a).toEqual(b);
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect([...a].sort()).toEqual([...input].sort());
  });
});

describe("compositionProblem", () => {
  it("accepts the first cast for eight players", () => {
    expect(compositionProblem(8, FIRST_CAST)).toBeNull();
  });

  it("rejects a cast of the wrong shape", () => {
    const withoutOutsider = FIRST_CAST.filter((character) => character.characterId !== "drunk");
    expect(compositionProblem(8, withoutOutsider)).toMatch(/does not match 8 players/);
  });
});

describe("dealRoles", () => {
  const deal = (seed: number) =>
    dealRoles({
      seats: seatsFor(8),
      cast: FIRST_CAST,
      townsfolkPool: TOWNSFOLK_POOL,
      seed,
    });

  it("deals every role exactly once", () => {
    const { seats } = deal(7);
    expect(seats).toHaveLength(8);
    expect(seats.map((seat) => seat.roleId).sort()).toEqual(
      FIRST_CAST.map((character) => character.characterId).sort(),
    );
  });

  it("is reproducible from its seed", () => {
    expect(deal(1234).seats).toEqual(deal(1234).seats);
  });

  it("usually differs between seeds", () => {
    const fingerprints = new Set(
      [1, 2, 3, 4, 5].map((seed) =>
        deal(seed)
          .seats.map((seat) => seat.roleId)
          .join(","),
      ),
    );
    expect(fingerprints.size).toBeGreaterThan(1);
  });

  it("starts everyone alive with a ghost vote", () => {
    for (const seat of deal(99).seats) {
      expect(seat.alive).toBe(true);
      expect(seat.ghostVoteAvailable).toBe(true);
    }
  });

  it("hides the Drunk's real role behind a believable townsfolk", () => {
    const { seats } = deal(5);
    const drunk = seats.find((seat) => seat.roleId === "drunk");
    expect(drunk).toBeDefined();
    expect(drunk!.believedRoleId).not.toBe("drunk");

    const believed = TOWNSFOLK_POOL.find(
      (character) => character.characterId === drunk!.believedRoleId,
    );
    expect(believed?.alignment).toBe("townsfolk");
  });

  it("shows every other seat its real role", () => {
    for (const seat of deal(11).seats) {
      if (seat.roleId === "drunk") continue;
      expect(seat.believedRoleId).toBe(seat.roleId);
    }
  });

  it("refuses a cast that does not match the seat count", () => {
    expect(() =>
      dealRoles({
        seats: seatsFor(8),
        cast: [POISONER, IMP],
        townsfolkPool: TOWNSFOLK_POOL,
        seed: 1,
      }),
    ).toThrow();
  });
});
