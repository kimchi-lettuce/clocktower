/*
 * The projection. Everything a client ever receives goes through here.
 *
 * Clocktower is a game of information asymmetry: a role is worth exactly as much
 * as the other players do not know about it. So there is no "get the game"
 * query. There is one function that takes the full state plus who is asking, and
 * returns only what that person may know — and `view.test.ts` is a property test
 * that proves it for every seat of many deals (docs/technical/decisions.md).
 *
 * Three viewers:
 *   storyteller  the truth, including the Drunk's real role and the red herring
 *   player       their own role as their phone shows it, plus public state
 *   spectator    public state only, no roles at all
 */

import type { Alignment, Character, Game, GameStatus, Winner } from "./types";
import { countAlive, voteThreshold } from "./vote";

export type Viewer =
  | { readonly kind: "storyteller" }
  | { readonly kind: "player"; readonly seatIndex: number }
  | { readonly kind: "spectator" };

/** Enough of a character to render a phone screen. */
export type RoleView = {
  characterId: string;
  name: string;
  alignment: Alignment;
  ability: string;
  shortAbility: string;
};

/** Anything a player could learn by looking around the table. */
export type PublicSeatView = {
  seatIndex: number;
  name: string;
  alive: boolean;
  /** Public: spent ghost vote tokens are visible to everyone. */
  ghostVoteAvailable: boolean;
};

export type PublicGameView = {
  /** The room code, so a phone can show or re-share the way in. */
  code: string;
  scriptId: string;
  status: GameStatus;
  nightNumber: number;
  dayNumber: number;
  winner: Winner | null;
  aliveCount: number;
  /** Announced every day, so it is not secret. */
  voteThreshold: number;
  seats: PublicSeatView[];
};

export type StorytellerView = PublicGameView & {
  kind: "storyteller";
  /**
   * The truth, seat by seat. `believedRole` differs from `role` only for the
   * Drunk, and that difference is the whole point: the app shows the truth and
   * the Storyteller decides what the player is told.
   */
  grimoire: (PublicSeatView & {
    role: RoleView;
    believedRole: RoleView;
  })[];
  /**
   * Who reads as a Demon to the Fortune Teller. Storyteller-only; it must never
   * appear in a player's view, even as a flag.
   */
  redHerringSeatIndex: number | null;
};

export type PlayerView = PublicGameView & {
  kind: "player";
  yourSeatIndex: number;
  /** Your role *as your phone shows it* — the believed role when you are the Drunk. */
  yourRole: RoleView;
  /**
   * Seats you know are evil, without their characters. Evil players only, and
   * only in games of seven or more: below that the rules never introduce them.
   */
  knownEvilSeats: number[];
  /** True when you are evil, so the screen can stop pretending otherwise. */
  youAreEvil: boolean;
};

export type SpectatorView = PublicGameView & { kind: "spectator" };

export type GameView = StorytellerView | PlayerView | SpectatorView;

function roleView(character: Character): RoleView {
  return {
    characterId: character.characterId,
    name: character.name,
    alignment: character.alignment,
    ability: character.ability,
    shortAbility: character.shortAbility,
  };
}

function resolveCharacter(game: Game, characterId: string): Character {
  const found = game.script.find((candidate) => candidate.characterId === characterId);
  if (!found) {
    throw new Error(
      `Character "${characterId}" is dealt but missing from the script, so its ability cannot be shown`,
    );
  }
  return found;
}

function publicSeatView(seat: Game["seats"][number]): PublicSeatView {
  return {
    seatIndex: seat.seatIndex,
    name: seat.name,
    alive: seat.alive,
    ghostVoteAvailable: seat.ghostVoteAvailable,
  };
}

function publicGameView(game: Game): PublicGameView {
  const aliveCount = countAlive(game);
  return {
    code: game.code,
    scriptId: game.scriptId,
    status: game.status,
    nightNumber: game.nightNumber,
    dayNumber: game.dayNumber,
    winner: game.winner,
    aliveCount,
    voteThreshold: voteThreshold(aliveCount),
    seats: game.seats.map(publicSeatView),
  };
}

const isEvil = (alignment: Alignment) => alignment === "minion" || alignment === "demon";

export function gameView(game: Game, viewer: Viewer): GameView {
  const publicView = publicGameView(game);

  if (viewer.kind === "spectator") {
    return { ...publicView, kind: "spectator" };
  }

  if (viewer.kind === "storyteller") {
    return {
      ...publicView,
      kind: "storyteller",
      grimoire: game.seats.map((seat) => {
        if (!seat.roleId) {
          throw new Error(`Seat ${seat.seatIndex} has no role`);
        }
        const role = resolveCharacter(game, seat.roleId);
        const believedRole = resolveCharacter(game, seat.believedRoleId ?? seat.roleId);
        return {
          ...publicSeatView(seat),
          role: roleView(role),
          believedRole: roleView(believedRole),
        };
      }),
      redHerringSeatIndex: game.redHerringSeatIndex,
    };
  }

  const seat = game.seats.find((candidate) => candidate.seatIndex === viewer.seatIndex);
  if (!seat) {
    throw new Error(`No seat ${viewer.seatIndex} in this game`);
  }

  const believed = resolveCharacter(game, seat.believedRoleId ?? seat.roleId ?? "");
  const truth = seat.roleId ? resolveCharacter(game, seat.roleId) : believed;
  const viewerIsEvil = isEvil(truth.alignment);

  // Below seven players the rules never introduce the evil team to each other,
  // so even the Demon and its Minion are strangers until they work it out.
  const evilIntroductions = game.seats.length >= 7;

  const knownEvilSeats =
    viewerIsEvil && evilIntroductions
      ? game.seats
          .filter((other) => other.seatIndex !== seat.seatIndex)
          .filter((other) => {
            if (!other.roleId) return false;
            return isEvil(resolveCharacter(game, other.roleId).alignment);
          })
          .map((other) => other.seatIndex)
      : [];

  return {
    ...publicView,
    kind: "player",
    yourSeatIndex: seat.seatIndex,
    // The Drunk's phone shows a Townsfolk they are not. That is the lie the
    // game is built on, so this is deliberately the believed role.
    yourRole: roleView(believed),
    knownEvilSeats,
    youAreEvil: viewerIsEvil,
  };
}
