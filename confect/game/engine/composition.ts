/*
 * How many of each alignment are in play, by player count. This is the only
 * place the number 8 turns into "5 Townsfolk, 1 Outsider, 1 Minion, 1 Demon".
 *
 * Trouble Brewing's Baron adds two Outsiders; when that character exists it
 * modifies this table rather than the dealing code.
 */
export type Composition = {
  townsfolk: number;
  outsider: number;
  minion: number;
  demon: number;
};

export const COMPOSITION: Readonly<Record<number, Composition>> = {
  5: { townsfolk: 3, outsider: 0, minion: 1, demon: 1 },
  6: { townsfolk: 3, outsider: 1, minion: 1, demon: 1 },
  7: { townsfolk: 5, outsider: 0, minion: 1, demon: 1 },
  8: { townsfolk: 5, outsider: 1, minion: 1, demon: 1 },
  9: { townsfolk: 5, outsider: 2, minion: 1, demon: 1 },
  10: { townsfolk: 7, outsider: 0, minion: 2, demon: 1 },
  11: { townsfolk: 7, outsider: 1, minion: 2, demon: 1 },
  12: { townsfolk: 7, outsider: 2, minion: 2, demon: 1 },
  13: { townsfolk: 9, outsider: 0, minion: 3, demon: 1 },
  14: { townsfolk: 9, outsider: 1, minion: 3, demon: 1 },
  15: { townsfolk: 9, outsider: 2, minion: 3, demon: 1 },
};

export function compositionFor(playerCount: number): Composition {
  const composition = COMPOSITION[playerCount];
  if (!composition) {
    throw new Error(`No composition for ${playerCount} players (supported: 5-15)`);
  }
  return composition;
}
