import { describe, expect, it } from "vitest";

import { applyDeath, checkWin, killAndCheck } from "./death";
import { gameWithRoles } from "./fixtures";

const ROLES = [
  "chef",
  "empath",
  "fortune-teller",
  "undertaker",
  "monk",
  "drunk",
  "poisoner",
  "imp",
];

describe("applyDeath", () => {
  it("kills the seat and keeps its ghost vote", () => {
    const game = gameWithRoles(ROLES);
    const { game: next, events } = applyDeath(game, 4);

    const dead = next.seats.find((seat) => seat.seatIndex === 4)!;
    expect(dead.alive).toBe(false);
    expect(dead.ghostVoteAvailable).toBe(true);
    expect(events[0]!.kind).toBe("death");
  });

  it("is a no-op for an already dead seat and does not duplicate the event", () => {
    const game = gameWithRoles(ROLES);
    const once = applyDeath(game, 4);
    const twice = applyDeath(once.game, 4);

    expect(twice.events).toEqual([]);
  });

  it("leaves the seat in the game so it can still talk and vote", () => {
    const game = gameWithRoles(ROLES);
    const { game: next } = applyDeath(game, 4);
    expect(next.seats).toHaveLength(8);
  });
});

describe("checkWin", () => {
  it("is null while the Demon lives and more than two players are alive", () => {
    expect(checkWin(gameWithRoles(ROLES))).toBeNull();
  });

  it("gives good the win when the Demon dies", () => {
    const game = gameWithRoles(ROLES);
    const impSeat = game.seats.find((seat) => seat.roleId === "imp")!;
    const { game: next } = applyDeath(game, impSeat.seatIndex);

    expect(checkWin(next)).toEqual({ winner: "good", reason: "demon-dead" });
  });

  it("gives evil the win when only two players are left", () => {
    const game = gameWithRoles(ROLES);
    let next = game;
    for (const seatIndex of [1, 2, 3, 4, 5, 6]) {
      next = applyDeath(next, seatIndex).game;
    }

    expect(next.seats.filter((seat) => seat.alive)).toHaveLength(2);
    expect(checkWin(next)).toEqual({ winner: "evil", reason: "two-players-left" });
  });

  it("prefers good's win when both conditions would be true", () => {
    const game = gameWithRoles(ROLES);
    const impSeat = game.seats.find((seat) => seat.roleId === "imp")!;
    let next = game;
    for (const seatIndex of [1, 2, 3, 4, 5, 6, impSeat.seatIndex]) {
      next = applyDeath(next, seatIndex).game;
    }

    expect(checkWin(next)?.winner).toBe("good");
  });
});

describe("killAndCheck", () => {
  it("ends the game and records the reason in one step", () => {
    const game = gameWithRoles(ROLES);
    const impSeat = game.seats.find((seat) => seat.roleId === "imp")!;
    const result = killAndCheck(game, impSeat.seatIndex);

    expect(result.win).toEqual({ winner: "good", reason: "demon-dead" });
    expect(result.game.status).toBe("ended");
    expect(result.game.winner).toBe("good");
    expect(result.events.map((event) => event.kind)).toEqual(["death", "game.ended"]);
  });

  it("does not end the game for an ordinary death", () => {
    const result = killAndCheck(gameWithRoles(ROLES), 2);
    expect(result.win).toBeNull();
    expect(result.game.status).not.toBe("ended");
  });
});
