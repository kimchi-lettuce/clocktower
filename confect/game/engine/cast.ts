import type { Character } from "./types";
import { compositionFor } from "./composition";

/*
 * A cast that satisfies the chart, for the Storyteller who does not want to
 * choose one. Characters are taken in script order within each alignment, so the
 * result is stable and reviewable rather than clever.
 *
 * The Storyteller's real job is choosing the cast to suit the table, so this is
 * a default and not the only path: `start` takes whatever cast it is given and
 * checks it against the chart.
 */
export function defaultCast(script: readonly Character[], playerCount: number): Character[] {
  const composition = compositionFor(playerCount);

  const take = (alignment: Character["alignment"], count: number) =>
    script.filter((character) => character.alignment === alignment).slice(0, count);

  return [
    ...take("townsfolk", composition.townsfolk),
    ...take("outsider", composition.outsider),
    ...take("minion", composition.minion),
    ...take("demon", composition.demon),
  ];
}
