import { describe, expect, it } from "vitest";

import { compositionProblem } from "./deal";
import { findCharacter, FIRST_PLAYTEST_CAST, TROUBLE_BREWING } from "../content/troubleBrewing";

/*
 * Content guards. These are cheap and catch the two ways script data goes wrong:
 * a character is missing, or two characters claim the same slot in the night
 * sequence (which would make the Storyteller's wizard ambiguous).
 */
describe("Trouble Brewing content", () => {
  it("has the printed character counts", () => {
    const counts = TROUBLE_BREWING.reduce<Record<string, number>>((totals, character) => {
      totals[character.alignment] = (totals[character.alignment] ?? 0) + 1;
      return totals;
    }, {});

    expect(TROUBLE_BREWING).toHaveLength(22);
    expect(counts).toEqual({
      townsfolk: 13,
      outsider: 4,
      minion: 4,
      demon: 1,
    });
  });

  it("has unique ids and names", () => {
    const ids = TROUBLE_BREWING.map((character) => character.characterId);
    const names = TROUBLE_BREWING.map((character) => character.name);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
  });

  it("never gives two characters the same slot in a night sequence", () => {
    for (const night of ["firstNightOrder", "otherNightOrder"] as const) {
      const used = TROUBLE_BREWING.map((character) => character[night]).filter(
        (order): order is number => order !== null,
      );
      expect(new Set(used).size).toBe(used.length);
    }
  });

  it("uses positive whole numbers for night order, or null", () => {
    for (const character of TROUBLE_BREWING) {
      for (const order of [character.firstNightOrder, character.otherNightOrder]) {
        if (order === null) continue;
        expect(Number.isInteger(order)).toBe(true);
        expect(order).toBeGreaterThan(0);
      }
    }
  });

  it("carries ability text and a short line for every character", () => {
    for (const character of TROUBLE_BREWING) {
      expect(character.ability.length).toBeGreaterThan(10);
      expect(character.shortAbility.length).toBeGreaterThan(5);
      expect(character.ability).toMatch(/[.!)\]]$/);
    }
  });

  it("gives every character with a night action a targeting rule", () => {
    for (const character of TROUBLE_BREWING) {
      const wakes = character.firstNightOrder !== null || character.otherNightOrder !== null;

      // Waking up does not always mean choosing: information characters wake
      // with no target at all.
      if (
        character.characterId === "poisoner" ||
        character.characterId === "monk" ||
        character.characterId === "fortune-teller" ||
        character.characterId === "butler" ||
        character.characterId === "imp"
      ) {
        expect(wakes).toBe(true);
        expect(character.targeting).not.toBe("none");
      }
    }
  });

  it("tells the Storyteller what to do at every step that has one", () => {
    for (const character of TROUBLE_BREWING) {
      if (character.firstNightOrder !== null) {
        expect(character.firstNightNote).toBeTruthy();
      }
      if (character.otherNightOrder !== null) {
        expect(character.otherNightNote).toBeTruthy();
      }
      if (character.firstNightOrder === null) {
        expect(character.firstNightNote).toBeNull();
      }
      if (character.otherNightOrder === null) {
        expect(character.otherNightNote).toBeNull();
      }
    }
  });

  it("deals a legal eight-player game from the first playtest cast", () => {
    expect(FIRST_PLAYTEST_CAST).toHaveLength(8);
    expect(compositionProblem(8, FIRST_PLAYTEST_CAST)).toBeNull();
  });

  it("finds characters by id", () => {
    expect(findCharacter("imp")?.name).toBe("Imp");
    expect(findCharacter("not-a-character")).toBeUndefined();
  });
});
