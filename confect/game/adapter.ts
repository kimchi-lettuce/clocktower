/*
 * The seam between Convex rows and the rules engine.
 *
 * Deliberately boring: it converts documents into the engine's plain types and
 * resolves who is asking. All the thinking lives in the engine, which stays
 * testable without a deployment, and all the Convex/Effect ceremony lives in
 * games.impl.ts.
 *
 * The row types are structural rather than imported from Convex codegen, so this
 * file has no runtime dependency on Convex and can be unit tested directly. If a
 * table gains or renames a field the impl stops type-checking, which is the
 * warning we want.
 */

import type { Character, Game, GameStatus, Seat, Winner } from "./engine/types";
import type { Viewer } from "./engine/view";

export type GameRow = {
  code: string;
  scriptId: string;
  status: GameStatus;
  nightNumber: number;
  dayNumber: number;
  seed: number;
  version: number;
  storyTellerDeviceKey: string | null;
  lobbyLocked: boolean;
  lastActivityAt: number;
  redHerringSeatIndex: number | null;
  winner: Winner | null;
  endedReason: string | null;
};

export type SeatRow = {
  seatIndex: number;
  name: string;
  isStoryteller: boolean;
  deviceKey: string | null;
  pin: string | null;
  roleId: string | null;
  believedRoleId: string | null;
  alive: boolean;
  ghostVoteAvailable: boolean;
};

export function toEngineGame(params: {
  game: GameRow;
  seats: readonly SeatRow[];
  script: readonly Character[];
}): Game {
  const seats: Seat[] = [...params.seats]
    .sort((left, right) => left.seatIndex - right.seatIndex)
    .map((seat) => ({
      seatIndex: seat.seatIndex,
      name: seat.name,
      alive: seat.alive,
      ghostVoteAvailable: seat.ghostVoteAvailable,
      roleId: seat.roleId,
      believedRoleId: seat.believedRoleId,
    }));

  return {
    code: params.game.code,
    scriptId: params.game.scriptId,
    status: params.game.status,
    nightNumber: params.game.nightNumber,
    dayNumber: params.game.dayNumber,
    seed: params.game.seed,
    seats,
    script: [...params.script],
    winner: params.game.winner,
    redHerringSeatIndex: params.game.redHerringSeatIndex,
  };
}

/**
 * Who is asking. The viewer is derived from the device key the request presents,
 * never from a field the client chooses: a player cannot ask to be shown the
 * grimoire by claiming to be the Storyteller.
 */
export function resolveViewer(params: {
  game: Pick<GameRow, "storyTellerDeviceKey">;
  seats: readonly Pick<SeatRow, "seatIndex" | "deviceKey">[];
  deviceKey: string | null;
}): Viewer {
  const { deviceKey } = params;
  if (!deviceKey) return { kind: "spectator" };

  if (params.game.storyTellerDeviceKey === deviceKey) {
    return { kind: "storyteller" };
  }

  const seat = params.seats.find((candidate) => candidate.deviceKey === deviceKey);
  return seat ? { kind: "player", seatIndex: seat.seatIndex } : { kind: "spectator" };
}

/**
 * Room codes are read aloud and typed on phones, so the alphabet drops the
 * characters people confuse: I, O, 0, 1.
 */
export const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const ROOM_CODE_LENGTH = 5;

export function newRoomCode(random: () => number): string {
  let code = "";
  for (let index = 0; index < ROOM_CODE_LENGTH; index += 1) {
    const pick = Math.floor(random() * ROOM_CODE_ALPHABET.length);
    code += ROOM_CODE_ALPHABET[Math.min(pick, ROOM_CODE_ALPHABET.length - 1)];
  }
  return code;
}

/**
 * The Fortune Teller's red herring: a living good player who reads as a Demon.
 * Picking it once, before the first night, means the answer stays consistent all
 * game instead of drifting toward whoever is convenient.
 */
export function chooseRedHerring(params: {
  seats: readonly Pick<SeatRow, "seatIndex" | "roleId" | "alive">[];
  script: readonly Character[];
  random: () => number;
}): number | null {
  const evil = new Set(
    params.script
      .filter((character) => character.alignment === "minion" || character.alignment === "demon")
      .map((character) => character.characterId),
  );

  const candidates = params.seats
    .filter((seat) => seat.alive && seat.roleId !== null && !evil.has(seat.roleId))
    .map((seat) => seat.seatIndex);

  if (candidates.length === 0) return null;
  const index = Math.floor(params.random() * candidates.length);
  return candidates[Math.min(index, candidates.length - 1)] ?? null;
}
