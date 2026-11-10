/*
 * Engine fixtures. Test-only: these are not the shipped script data, and the
 * night-order numbers are placeholders until the real data is imported and
 * verified against two independent sources (ticket on the dev board).
 *
 * The cast is the first playtest cast: 5 Townsfolk, 1 Outsider, 1 Minion,
 * 1 Demon for an eight-player game.
 */

import type { Character, Game } from "./types";

const character = (
  characterId: string,
  name: string,
  alignment: Character["alignment"],
  firstNightOrder: number | null,
  otherNightOrder: number | null,
): Character => ({
  characterId,
  name,
  alignment,
  ability: `${name} ability text (placeholder)`,
  shortAbility: `${name}: placeholder`,
  firstNightOrder,
  otherNightOrder,
  targeting: "none",
});

export const CHEF = character("chef", "Chef", "townsfolk", 8, null);
export const EMPATH = character("empath", "Empath", "townsfolk", 9, 8);
export const FORTUNE_TELLER = character("fortune-teller", "Fortune Teller", "townsfolk", 10, 9);
export const UNDERTAKER = character("undertaker", "Undertaker", "townsfolk", null, 7);
export const MONK = character("monk", "Monk", "townsfolk", null, 2);
export const DRUNK = character("drunk", "Drunk", "outsider", null, null);
export const POISONER = character("poisoner", "Poisoner", "minion", 3, 1);
export const IMP = character("imp", "Imp", "demon", null, 5);

export const WASHERWOMAN = character("washerwoman", "Washerwoman", "townsfolk", 6, null);
export const SOLDIER = character("soldier", "Soldier", "townsfolk", null, null);

/** The eight characters dealt in the first playtest. */
export const FIRST_CAST: Character[] = [
  CHEF,
  EMPATH,
  FORTUNE_TELLER,
  UNDERTAKER,
  MONK,
  DRUNK,
  POISONER,
  IMP,
];

/** Townsfolk the Drunk may believe they are. */
export const TOWNSFOLK_POOL: Character[] = [
  CHEF,
  EMPATH,
  FORTUNE_TELLER,
  UNDERTAKER,
  MONK,
  WASHERWOMAN,
  SOLDIER,
];

export const SCRIPT: Character[] = [...TOWNSFOLK_POOL, DRUNK, POISONER, IMP];

export const SEAT_NAMES = ["Ana", "Ben", "Cal", "Dee", "Eli", "Fae", "Gus", "Hana"];

export function seatsFor(playerCount: number) {
  return Array.from({ length: playerCount }, (_, index) => ({
    seatIndex: index + 1,
    name: SEAT_NAMES[index] ?? `Seat ${index + 1}`,
  }));
}

export function gameWithRoles(roleIdBySeat: string[]): Game {
  return {
    scriptId: "trouble-brewing",
    status: "day",
    nightNumber: 1,
    dayNumber: 1,
    seed: 1,
    script: SCRIPT,
    winner: null,
    seats: roleIdBySeat.map((roleId, index) => ({
      seatIndex: index + 1,
      name: SEAT_NAMES[index] ?? `Seat ${index + 1}`,
      alive: true,
      ghostVoteAvailable: true,
      roleId,
      believedRoleId: roleId,
    })),
  };
}
