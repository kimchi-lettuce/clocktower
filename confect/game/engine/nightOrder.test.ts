import { describe, expect, it } from "vitest";

import { gameWithRoles, MONK, POISONER } from "./fixtures";
import { actingRoleId, buildNightSteps, DEMON_INFO, MINION_INFO } from "./nightOrder";

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

describe("actingRoleId", () => {
  it("wakes the Drunk as the role they believe they are", () => {
    const game = gameWithRoles(ROLES);
    const drunkSeat = game.seats.find((seat) => seat.roleId === "drunk")!;
    drunkSeat.believedRoleId = "washerwoman";

    expect(actingRoleId(drunkSeat)).toBe("washerwoman");
  });

  it("wakes everyone else as their real role", () => {
    const game = gameWithRoles(ROLES);
    const empath = game.seats.find((seat) => seat.roleId === "empath")!;
    expect(actingRoleId(empath)).toBe("empath");
  });
});

describe("buildNightSteps", () => {
  it("opens the first night with minion and demon information", () => {
    const steps = buildNightSteps({ game: gameWithRoles(ROLES), nightNumber: 1 });
    expect(steps[0]!.characterId).toBe(MINION_INFO);
    expect(steps[1]!.characterId).toBe(DEMON_INFO);
    expect(steps[0]!.actorSeatIndex).toBeNull();
  });

  it("uses first-night order on night one and other-night order afterwards", () => {
    const game = gameWithRoles(ROLES);

    const first = buildNightSteps({ game, nightNumber: 1 }).map((s) => s.characterId);
    const second = buildNightSteps({ game, nightNumber: 2 }).map((s) => s.characterId);

    // Chef and Fortune Teller have first-night actions only in this fixture set.
    expect(first).toContain("chef");
    expect(second).not.toContain("chef");

    // Undertaker and Monk only act on later nights.
    expect(first).not.toContain("undertaker");
    expect(second).toContain("undertaker");
    expect(second).toContain("monk");
  });

  it("orders the night by the characters' positions, not by seat", () => {
    const game = gameWithRoles(ROLES);
    const second = buildNightSteps({ game, nightNumber: 2 });
    expect(second.map((step) => step.characterId)).toEqual([
      "poisoner", // order 1
      "monk", // order 2
      "imp", // order 5
      "undertaker", // order 7
      "empath", // order 8
      "fortune-teller", // order 9
    ]);
  });

  it("skips a dead character's step", () => {
    const game = gameWithRoles(ROLES);
    const poisoner = game.seats.find((seat) => seat.roleId === POISONER.characterId)!;
    poisoner.alive = false;

    const second = buildNightSteps({ game, nightNumber: 2 });
    expect(second.map((step) => step.characterId)).not.toContain("poisoner");
  });

  it("skips a living character with no action that night", () => {
    const game = gameWithRoles(ROLES);
    const monk = game.seats.find((seat) => seat.roleId === MONK.characterId)!;
    expect(monk.alive).toBe(true);

    const first = buildNightSteps({ game, nightNumber: 1 });
    expect(first.map((step) => step.characterId)).not.toContain("monk");
  });

  it("numbers steps sequentially from zero, including the synthetic ones", () => {
    const steps = buildNightSteps({ game: gameWithRoles(ROLES), nightNumber: 1 });
    expect(steps.map((step) => step.orderIndex)).toEqual(steps.map((_, index) => index));
  });

  it("skips minion and demon info below seven players", () => {
    const six = gameWithRoles(["chef", "empath", "fortune-teller", "monk", "poisoner", "imp"]);

    const steps = buildNightSteps({ game: six, nightNumber: 1 });
    expect(steps.some((step) => step.characterId === MINION_INFO)).toBe(false);
    expect(steps.some((step) => step.characterId === DEMON_INFO)).toBe(false);

    const seven = gameWithRoles([
      "chef",
      "empath",
      "fortune-teller",
      "monk",
      "butler",
      "poisoner",
      "imp",
    ]);
    const sevenSteps = buildNightSteps({ game: seven, nightNumber: 1 });
    expect(sevenSteps[0]!.characterId).toBe(MINION_INFO);
  });

  it("has no synthetic steps after the first night", () => {
    const steps = buildNightSteps({ game: gameWithRoles(ROLES), nightNumber: 3 });
    expect(steps.some((step) => step.characterId === MINION_INFO)).toBe(false);
    expect(steps.some((step) => step.characterId === DEMON_INFO)).toBe(false);
  });

  it("wakes the Drunk in their believed character's slot", () => {
    const game = gameWithRoles(ROLES);
    const drunkSeat = game.seats.find((seat) => seat.roleId === "drunk")!;
    drunkSeat.believedRoleId = "washerwoman"; // first-night order 6

    const first = buildNightSteps({ game, nightNumber: 1 });
    const step = first.find((candidate) => candidate.actorSeatIndex === drunkSeat.seatIndex);

    expect(step?.characterId).toBe("washerwoman");
  });
});
