import { describe, expect, it } from "vitest";

import { defaultCast } from "./cast";
import { compositionFor } from "./composition";
import { compositionProblem } from "./deal";
import { SCRIPT } from "./fixtures";

describe("defaultCast", () => {
  it("satisfies the composition chart for every supported player count", () => {
    for (let playerCount = 5; playerCount <= 15; playerCount += 1) {
      const cast = defaultCast(SCRIPT, playerCount);

      expect(cast).toHaveLength(playerCount);
      expect(compositionProblem(playerCount, cast)).toBeNull();

      const counts = cast.reduce(
        (totals, character) => {
          totals[character.alignment] += 1;
          return totals;
        },
        { townsfolk: 0, outsider: 0, minion: 0, demon: 0 },
      );
      expect(counts).toEqual(compositionFor(playerCount));
    }
  });

  it("takes characters in script order, not at random", () => {
    const cast = defaultCast(SCRIPT, 8);
    expect(cast.map((character) => character.characterId)).toEqual([
      "chef",
      "empath",
      "fortune-teller",
      "undertaker",
      "monk",
      "butler",
      "poisoner",
      "imp",
    ]);
  });

  it("never repeats a character", () => {
    const ids = defaultCast(SCRIPT, 15).map((character) => character.characterId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
