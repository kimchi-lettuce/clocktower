import { compositionFor, type Composition } from "./composition";
import { createRng, pick, shuffle } from "./rng";
import type { Character, EngineEvent, Seat } from "./types";

export type DealParams = {
  seats: readonly { seatIndex: number; name: string }[];
  /** The cast the Storyteller chose. Must match the player count's composition. */
  cast: readonly Character[];
  /**
   * Townsfolk available for the Drunk to believe they are. Any townsfolk not in
   * the cast is preferred, so the Drunk makes a claim nobody else is making.
   */
  townsfolkPool: readonly Character[];
  seed: number;
};

export type DealResult = { seats: Seat[]; events: EngineEvent[] };

function countByAlignment(cast: readonly Character[]): Composition {
  const counts: Composition = { townsfolk: 0, outsider: 0, minion: 0, demon: 0 };
  for (const character of cast) counts[character.alignment] += 1;
  return counts;
}

export function compositionProblem(playerCount: number, cast: readonly Character[]): string | null {
  const expected = compositionFor(playerCount);
  const actual = countByAlignment(cast);
  const wrong = (Object.keys(expected) as (keyof Composition)[]).filter(
    (key) => expected[key] !== actual[key],
  );
  if (wrong.length === 0) return null;
  const describe = (c: Composition) =>
    Object.entries(c)
      .map(([k, v]) => `${v} ${k}`)
      .join(", ");
  return `Cast does not match ${playerCount} players: expected ${describe(
    expected,
  )}, got ${describe(actual)}`;
}

/**
 * Assign the cast to seats. Deterministic for a given seed, so a game can be
 * replayed and a reported bug reproduced.
 *
 * The Drunk's real role is the Drunk; their believed role is a townsfolk, which
 * is what their own phone will show for the rest of the game.
 */
export function dealRoles(params: DealParams): DealResult {
  const { seats, cast, townsfolkPool, seed } = params;

  if (seats.length !== cast.length) {
    throw new Error(`Cast size ${cast.length} does not match ${seats.length} seats`);
  }
  const problem = compositionProblem(seats.length, cast);
  if (problem) throw new Error(problem);

  const rng = createRng(seed);
  const dealt = shuffle(rng, cast);

  const castTownsfolk = new Set(
    cast
      .filter((character) => character.alignment === "townsfolk")
      .map((character) => character.characterId),
  );
  const unclaimedTownsfolk = townsfolkPool.filter(
    (character) => character.alignment === "townsfolk" && !castTownsfolk.has(character.characterId),
  );

  const dealtSeats: Seat[] = seats.map((seat, index) => {
    const role = dealt[index]!;
    const isDrunk = role.characterId === "drunk";
    const believed = isDrunk && (pick(rng, unclaimedTownsfolk) ?? pick(rng, townsfolkPool));

    return {
      seatIndex: seat.seatIndex,
      name: seat.name,
      alive: true,
      ghostVoteAvailable: true,
      roleId: role.characterId,
      believedRoleId: believed?.characterId ?? role.characterId,
    };
  });

  return {
    seats: dealtSeats,
    events: [
      {
        kind: "roles.dealt",
        data: { seed, seatCount: seats.length },
      },
    ],
  };
}
