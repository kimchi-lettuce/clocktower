import type { Game, NightStep, Seat } from "./types";

/*
 * The night sequence.
 *
 * Order is data: each character carries its position for the first night and for
 * every later night. The engine only sorts and filters, because order decides
 * outcomes — a Poisoner who resolves after the Empath makes the wrong player lie.
 *
 * Two steps belong to no character and are synthesised for the first night:
 * the Minion learns the Demon, and the Demon learns its Minions.
 */

export const MINION_INFO = "*minion-info";
export const DEMON_INFO = "*demon-info";

/**
 * The role a seat is woken as. Usually its real role; for the Drunk it is the
 * role they believe they are, which is why their phone never shows "Drunk".
 */
export function actingRoleId(seat: Seat): string | null {
  if (!seat.roleId) return null;
  if (seat.roleId === "drunk") return seat.believedRoleId ?? seat.roleId;
  return seat.roleId;
}

export function buildNightSteps(params: { game: Game; nightNumber: number }): NightStep[] {
  const { game, nightNumber } = params;
  const first = nightNumber === 1;

  const entries: { order: number; characterId: string; seatIndex: number }[] = [];

  for (const seat of game.seats) {
    if (!seat.alive) continue;
    const characterId = actingRoleId(seat);
    if (!characterId) continue;

    const character = game.script.find((candidate) => candidate.characterId === characterId);
    if (!character) continue;

    const order = first ? character.firstNightOrder : character.otherNightOrder;
    if (order == null) continue;

    entries.push({ order, characterId, seatIndex: seat.seatIndex });
  }

  // Ties cannot happen with real night-order data, but sorting by seat keeps the
  // sequence deterministic if it ever does.
  entries.sort((a, b) => a.order - b.order || a.seatIndex - b.seatIndex);

  const steps: NightStep[] = entries.map((entry, index) => ({
    orderIndex: index,
    characterId: entry.characterId,
    actorSeatIndex: entry.seatIndex,
  }));

  if (!first) return steps;

  const info: NightStep[] = [
    { orderIndex: 0, characterId: MINION_INFO, actorSeatIndex: null },
    { orderIndex: 0, characterId: DEMON_INFO, actorSeatIndex: null },
  ];

  return [...info, ...steps].map((step, orderIndex) => ({
    ...step,
    orderIndex,
  }));
}
