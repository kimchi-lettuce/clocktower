import { describe, expect, it } from "vitest";

import { compositionFor, COMPOSITION } from "./composition";

/*
 * The printed composition chart, transcribed as a test so a change to the table
 * cannot pass review silently.
 *
 * | Players     | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
 * | Townsfolk   | 3 | 3 | 5 | 5 | 5 |  7 |  7 |  7 |  9 |  9 |  9 |
 * | Outsiders   | 0 | 1 | 0 | 1 | 2 |  0 |  1 |  2 |  0 |  1 |  2 |
 * | Minions     | 1 | 1 | 1 | 1 | 1 |  2 |  2 |  2 |  3 |  3 |  3 |
 * | Demons      | 1 | 1 | 1 | 1 | 1 |  1 |  1 |  1 |  1 |  1 |  1 |
 */
const CHART: [
  players: number,
  townsfolk: number,
  outsider: number,
  minion: number,
  demon: number,
][] = [
  [5, 3, 0, 1, 1],
  [6, 3, 1, 1, 1],
  [7, 5, 0, 1, 1],
  [8, 5, 1, 1, 1],
  [9, 5, 2, 1, 1],
  [10, 7, 0, 2, 1],
  [11, 7, 1, 2, 1],
  [12, 7, 2, 2, 1],
  [13, 9, 0, 3, 1],
  [14, 9, 1, 3, 1],
  [15, 9, 2, 3, 1],
];

describe("compositionFor", () => {
  it.each(CHART)(
    "matches the printed chart for %i players",
    (players, townsfolk, outsider, minion, demon) => {
      expect(compositionFor(players)).toEqual({
        townsfolk,
        outsider,
        minion,
        demon,
      });
    },
  );

  it("covers exactly the charted player counts", () => {
    expect(
      Object.keys(COMPOSITION)
        .map(Number)
        .sort((a, b) => a - b),
    ).toEqual(CHART.map(([players]) => players));
  });

  it("is unchanged above 15 players, where the extras are Travellers", () => {
    // The chart stops at 15 and says each player above it is a Traveller, so the
    // fifteen-player row still applies. Travellers are not implemented, so 16+
    // is refused rather than guessed at.
    expect(() => compositionFor(16)).toThrow(/Traveller/);
    expect(() => compositionFor(20)).toThrow(/Traveller/);
  });

  it("refuses a game smaller than the chart supports", () => {
    expect(() => compositionFor(4)).toThrow(/chart starts at 5/);
  });

  it("never has more than one Demon", () => {
    for (const composition of Object.values(COMPOSITION)) {
      expect(composition.demon).toBe(1);
    }
  });

  it("always totals the player count", () => {
    for (const [players, composition] of Object.entries(COMPOSITION)) {
      expect(
        composition.townsfolk + composition.outsider + composition.minion + composition.demon,
      ).toBe(Number(players));
    }
  });
});
