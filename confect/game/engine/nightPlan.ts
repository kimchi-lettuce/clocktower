/*
 * The night, as the Storyteller reads it.
 *
 * `buildNightSteps` says who wakes in what order; this adds the half a
 * Storyteller actually needs: what to do when the eyes open. The instructions are
 * the printed sheet's own words (content/troubleBrewing.ts), so the app replaces
 * the paper sheet rather than paraphrasing it.
 *
 * Deliberately no ability resolution here. The Storyteller does the pointing,
 * nodding and lying; the app says what comes next and what to say
 * (docs/product/decisions.md: storyteller-lite).
 */

import { DEMON_INFO_NOTE, MINION_INFO_NOTE } from "../content/troubleBrewing";
import { DEMON_INFO, MINION_INFO, buildNightSteps } from "./nightOrder";
import type { Game } from "./types";

export type NightPlanStep = {
  orderIndex: number;
  characterId: string;
  /** Null for the two steps that belong to no character. */
  actorSeatIndex: number | null;
  /** Who the Storyteller walks up to, by name. */
  seatName: string | null;
  /** The character being woken — the believed role for the Drunk. */
  roleName: string;
  /** What to do, in the sheet's words. */
  instruction: string;
  synthetic: boolean;
  /** One line of the ability, for the Storyteller's own sanity check. */
  ability: string | null;
};

/** What the Storyteller's screen receives: the sequence and how far along it is. */
export type NightView = {
  nightNumber: number;
  stepIndex: number;
  steps: NightPlanStep[];
};

function seatName(game: Game, seatIndex: number | null): string | null {
  if (seatIndex === null) return null;
  return game.seats.find((seat) => seat.seatIndex === seatIndex)?.name ?? null;
}

export function nightPlan(game: Game, nightNumber: number): NightPlanStep[] {
  const steps = buildNightSteps({ game, nightNumber });

  return steps.map((step) => {
    if (step.characterId === MINION_INFO) {
      return {
        ...step,
        seatName: null,
        roleName: "Minions",
        instruction: MINION_INFO_NOTE,
        synthetic: true,
        ability: null,
      };
    }

    if (step.characterId === DEMON_INFO) {
      return {
        ...step,
        seatName: null,
        roleName: "Demon",
        instruction: DEMON_INFO_NOTE,
        synthetic: true,
        ability: null,
      };
    }

    const character = game.script.find((candidate) => candidate.characterId === step.characterId);

    // A dealt character missing from the script is a data error, not a night to
    // improvise through.
    if (!character) {
      throw new Error(`Night step "${step.characterId}" is not in the script for ${game.scriptId}`);
    }

    const note = nightNumber === 1 ? character.firstNightNote : character.otherNightNote;

    return {
      ...step,
      seatName: seatName(game, step.actorSeatIndex),
      roleName: character.name,
      instruction: note ?? character.shortAbility,
      synthetic: false,
      ability: character.shortAbility,
    };
  });
}
