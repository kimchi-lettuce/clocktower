import { describe, expect, it } from "vitest";

import { nightPlan } from "./nightPlan";
import { dealRoles } from "./deal";
import { DEMON_INFO, MINION_INFO } from "./nightOrder";
import { FIRST_CAST, SCRIPT, gameWithRoles, seatsFor, TOWNSFOLK_POOL } from "./fixtures";
import type { Game } from "./types";

const game = (seed = 3): Game => ({
  code: "TEST1",
  scriptId: "trouble-brewing",
  status: "night",
  nightNumber: 1,
  dayNumber: 0,
  seed,
  seats: dealRoles({
    seats: seatsFor(8),
    cast: FIRST_CAST,
    townsfolkPool: TOWNSFOLK_POOL,
    seed,
  }).seats,
  script: SCRIPT,
  winner: null,
  redHerringSeatIndex: 2,
});

describe("nightPlan", () => {
  it("walks the first night in the printed order, with instructions", () => {
    const plan = nightPlan(game(), 1);
    const roles = plan.map((step) => step.roleName);

    // Minions and Demon first, then the sheet's order. The Drunk appears in the
    // slot of the role they believe they are, so the exact cast depends on the
    // deal; the order of the fixed characters does not.
    expect(roles.slice(0, 2)).toEqual(["Minions", "Demon"]);
    expect(roles.indexOf("Poisoner")).toBeLessThan(roles.indexOf("Chef"));
    expect(roles.indexOf("Chef")).toBeLessThan(roles.indexOf("Empath"));
    expect(roles.indexOf("Empath")).toBeLessThan(roles.indexOf("Fortune Teller"));
    expect(roles.at(-1)).toBe("Fortune Teller");

    const fortuneTeller = plan.at(-1);
    expect(fortuneTeller?.instruction).toMatch(/RED HERRING/);
    expect(fortuneTeller?.seatName).toBeTruthy();
    expect(fortuneTeller?.synthetic).toBe(false);

    expect(plan[0]).toMatchObject({
      synthetic: true,
      actorSeatIndex: null,
      seatName: null,
    });
  });

  it("takes the other-nights order and drops first-night-only characters", () => {
    const plan = nightPlan(game(), 2);
    const roles = plan.map((step) => step.roleName);

    expect(roles).not.toContain("Chef");
    expect(roles).not.toContain("Minions");
    expect(roles.indexOf("Poisoner")).toBeLessThan(roles.indexOf("Monk"));
    expect(roles.indexOf("Monk")).toBeLessThan(roles.indexOf("Imp"));
    expect(roles.indexOf("Imp")).toBeLessThan(roles.indexOf("Undertaker"));
  });

  it("wakes the Drunk as the role they believe they are", () => {
    const dealt = game();
    const drunk = dealt.seats.find((seat) => seat.roleId === "drunk");
    expect(drunk).toBeDefined();

    const plan = nightPlan(dealt, 1);
    const step = plan.find((candidate) => candidate.actorSeatIndex === drunk?.seatIndex);

    // The Drunk acts in the believed role's slot; the app never says "Drunk".
    expect(step?.roleName).not.toBe("Drunk");
    expect(plan.map((s) => s.roleName)).not.toContain("Drunk");
  });

  it("skips the dead", () => {
    const dealt = gameWithRoles([
      "chef",
      "empath",
      "fortune-teller",
      "monk",
      "butler",
      "poisoner",
      "imp",
    ]);
    dealt.seats[1]!.alive = false;

    const plan = nightPlan(dealt, 2);
    expect(plan.some((step) => step.actorSeatIndex === 2)).toBe(false);
    expect(plan.length).toBeGreaterThan(0);
  });

  it("has no minion or demon step below seven players", () => {
    const plan = nightPlan(
      gameWithRoles(["chef", "empath", "fortune-teller", "drunk", "poisoner", "imp"]),
      1,
    );

    expect(plan.map((step) => step.roleName)).not.toContain("Minions");
    expect(plan.map((step) => step.roleName)).not.toContain("Demon");
    expect(plan.every((step) => !step.synthetic)).toBe(true);
  });

  it("skips characters the script does not describe", () => {
    // The sequence is built from the script, so a character missing from it never
    // becomes a step. The two synthetic steps do not need the script at all.
    const plan = nightPlan({ ...game(), script: [] }, 1);

    expect(plan.map((step) => step.characterId)).toEqual([MINION_INFO, DEMON_INFO]);
    expect(plan.every((step) => step.synthetic)).toBe(true);
  });
});
