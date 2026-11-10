import { describe, expect, it } from "vitest";

import { dealRoles } from "./deal";
import { FIRST_CAST, SCRIPT, seatsFor, TOWNSFOLK_POOL, gameWithRoles } from "./fixtures";
import type { Game, Seat } from "./types";
import { gameView } from "./view";
import { findCharacter } from "../content/troubleBrewing";

/*
 * The leak test. This is the product's safety property, not a unit test smell:
 * a player who can read another player's role has nothing left to play for.
 *
 * Everything a client receives comes from gameView, so proving that no view
 * carries a role it should not is the same as proving the game cannot be cheated
 * from a phone. The walk is structural (values of `*characterId` fields) rather
 * than a text search, because ability text legitimately contains words like
 * "Demon" that would make a substring test both noisy and falsely reassuring.
 */

function characterIdsIn(value: unknown): string[] {
  const found: string[] = [];

  const walk = (node: unknown) => {
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (node && typeof node === "object") {
      for (const [key, child] of Object.entries(node)) {
        if (/characterId$/i.test(key) && typeof child === "string") {
          found.push(child);
        }
        walk(child);
      }
    }
  };

  walk(value);
  return found;
}

function gameFromSeed(seed: number, playerCount = 8): Game {
  const { seats } = dealRoles({
    seats: seatsFor(playerCount),
    cast: FIRST_CAST.slice(0, playerCount),
    townsfolkPool: TOWNSFOLK_POOL,
    seed,
  });

  return {
    scriptId: "trouble-brewing",
    status: "day",
    nightNumber: 2,
    dayNumber: 1,
    seed,
    seats,
    script: SCRIPT,
    winner: null,
    redHerringSeatIndex: 3,
  };
}

const seatWith = (game: Game, roleId: string): Seat => {
  const seat = game.seats.find((candidate) => candidate.roleId === roleId);
  if (!seat) throw new Error(`No ${roleId} in this game`);
  return seat;
};

describe("gameView", () => {
  it("shows the Storyteller the truth for every seat", () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const game = gameFromSeed(seed);
      const view = gameView(game, { kind: "storyteller" });

      expect(view.kind).toBe("storyteller");
      if (view.kind !== "storyteller") return;

      expect(view.grimoire.map((seat) => seat.role.characterId)).toEqual(
        game.seats.map((seat) => seat.roleId),
      );
      expect(view.redHerringSeatIndex).toBe(3);
    }
  });

  it("never shows a player anyone else's role", () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const game = gameFromSeed(seed);

      for (const seat of game.seats) {
        const view = gameView(game, {
          kind: "player",
          seatIndex: seat.seatIndex,
        });
        const ids = characterIdsIn(view);

        expect(view.kind).toBe("player");
        if (view.kind !== "player") continue;

        // Only the viewer's own (believed) role may appear.
        expect(new Set(ids)).toEqual(new Set([view.yourRole.characterId]));
      }
    }
  });

  it("shows the Drunk the role they believe they are, never the truth", () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const game = gameFromSeed(seed);
      const drunk = seatWith(game, "drunk");
      const view = gameView(game, {
        kind: "player",
        seatIndex: drunk.seatIndex,
      });

      if (view.kind !== "player") throw new Error("expected a player view");

      expect(drunk.believedRoleId).not.toBe("drunk");
      expect(view.yourRole.characterId).toBe(drunk.believedRoleId);
      expect(characterIdsIn(view)).not.toContain("drunk");
      expect(findCharacter(view.yourRole.characterId)?.alignment).not.toBe("outsider");
    }
  });

  it("shows the Storyteller both the truth and the lie for a Drunk", () => {
    const game = gameFromSeed(7);
    const drunk = seatWith(game, "drunk");
    const view = gameView(game, { kind: "storyteller" });

    if (view.kind !== "storyteller") throw new Error("expected grimoire");

    const seat = view.grimoire.find((candidate) => candidate.seatIndex === drunk.seatIndex);
    expect(seat?.role.characterId).toBe("drunk");
    expect(seat?.believedRole.characterId).toBe(drunk.believedRoleId);
  });

  it("shows a spectator no roles at all", () => {
    const game = gameFromSeed(11);
    const view = gameView(game, { kind: "spectator" });

    expect(characterIdsIn(view)).toEqual([]);
    expect(view.kind).toBe("spectator");
  });

  it("keeps the red herring out of player and spectator views", () => {
    const game = gameFromSeed(5);

    const player = gameView(game, { kind: "player", seatIndex: 1 });
    const spectator = gameView(game, { kind: "spectator" });

    expect("redHerringSeatIndex" in player).toBe(false);
    expect("redHerringSeatIndex" in spectator).toBe(false);
    expect(JSON.stringify(player)).not.toContain("redHerring");
    expect(JSON.stringify(spectator)).not.toContain("redHerring");
  });

  it("introduces the evil team to each other at seven players", () => {
    const game = gameFromSeed(21);
    const demon = seatWith(game, "imp");
    const minion = seatWith(game, "poisoner");

    const demonView = gameView(game, {
      kind: "player",
      seatIndex: demon.seatIndex,
    });
    const minionView = gameView(game, {
      kind: "player",
      seatIndex: minion.seatIndex,
    });

    if (demonView.kind !== "player" || minionView.kind !== "player") {
      throw new Error("expected player views");
    }

    expect(demonView.knownEvilSeats).toEqual([minion.seatIndex]);
    expect(minionView.knownEvilSeats).toEqual([demon.seatIndex]);
    expect(demonView.youAreEvil).toBe(true);
    expect(minionView.youAreEvil).toBe(true);
  });

  it("leaves the evil team strangers below seven players", () => {
    // The rules only introduce the Minions and the Demon to each other in games
    // of seven or more, so at six each is on their own.
    const game = gameWithRoles(["chef", "empath", "fortune-teller", "drunk", "poisoner", "imp"]);

    const demon = gameView(game, { kind: "player", seatIndex: 6 });
    const minion = gameView(game, { kind: "player", seatIndex: 5 });
    const good = gameView(game, { kind: "player", seatIndex: 1 });

    if (demon.kind !== "player" || minion.kind !== "player" || good.kind !== "player") {
      throw new Error("expected player views");
    }

    expect(demon.knownEvilSeats).toEqual([]);
    expect(minion.knownEvilSeats).toEqual([]);
    expect(good.knownEvilSeats).toEqual([]);
    expect(good.youAreEvil).toBe(false);
  });

  it("gives everyone the public state they can see at the table", () => {
    const game = gameFromSeed(13);
    const view = gameView(game, { kind: "player", seatIndex: 2 });

    expect(view.aliveCount).toBe(8);
    // Half or more of the living, rounding up: 11 alive needs 6, 8 alive needs 4.
    expect(view.voteThreshold).toBe(4);
    expect(view.seats).toHaveLength(8);
    expect(view.seats[0]).toEqual({
      seatIndex: 1,
      name: "Ana",
      alive: true,
      ghostVoteAvailable: true,
    });
    expect("role" in view.seats[0]!).toBe(false);
  });

  it("refuses a seat that is not at the table", () => {
    const game = gameFromSeed(3);
    expect(() => gameView(game, { kind: "player", seatIndex: 99 })).toThrow(/No seat 99/);
  });

  it("refuses to render a role the script does not contain", () => {
    const game: Game = { ...gameFromSeed(3), script: [] };
    expect(() => gameView(game, { kind: "storyteller" })).toThrow(/missing from the script/);
  });
});
