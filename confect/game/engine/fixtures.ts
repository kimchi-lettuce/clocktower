/*
 * Engine fixtures. Test-only.
 *
 * Character data comes from the real script (confect/game/content) so tests
 * cannot drift from the shipped content.
 */

import { DRUNK, FIRST_PLAYTEST_CAST, TOWNSFOLK, TROUBLE_BREWING } from "../content/troubleBrewing";
import type { Game } from "./types";

export { DRUNK };
export {
  CHEF,
  EMPATH,
  FORTUNE_TELLER,
  MONK,
  POISONER,
  IMP,
  UNDERTAKER,
} from "../content/troubleBrewing";

/** The eight characters dealt in the first playtest. */
export const FIRST_CAST = FIRST_PLAYTEST_CAST;

/** Townsfolk the Drunk may believe they are. */
export const TOWNSFOLK_POOL = TOWNSFOLK;

export const SCRIPT = TROUBLE_BREWING;

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
