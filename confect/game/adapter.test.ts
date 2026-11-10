import { describe, expect, it } from "vitest";

import {
  chooseRedHerring,
  newRoomCode,
  resolveViewer,
  ROOM_CODE_ALPHABET,
  ROOM_CODE_LENGTH,
  toEngineGame,
  type GameRow,
  type SeatRow,
} from "./adapter";
import { SCRIPT } from "./engine/fixtures";

const game: GameRow = {
  code: "ABCDE",
  scriptId: "trouble-brewing",
  status: "night",
  nightNumber: 1,
  dayNumber: 0,
  seed: 42,
  version: 3,
  storyTellerDeviceKey: "st-device",
  lobbyLocked: true,
  lastActivityAt: 1_700_000_000_000,
  redHerringSeatIndex: 4,
  winner: null,
  endedReason: null,
};

const seat = (seatIndex: number, overrides: Partial<SeatRow> = {}): SeatRow => ({
  seatIndex,
  name: `Seat ${seatIndex}`,
  isStoryteller: false,
  deviceKey: `device-${seatIndex}`,
  pin: null,
  roleId: "chef",
  believedRoleId: "chef",
  alive: true,
  ghostVoteAvailable: true,
  ...overrides,
});

describe("toEngineGame", () => {
  it("converts rows into the engine's plain state", () => {
    const engine = toEngineGame({
      game,
      seats: [seat(2, { name: "Ben" }), seat(1, { name: "Ana" })],
      script: SCRIPT,
    });

    expect(engine.scriptId).toBe("trouble-brewing");
    expect(engine.status).toBe("night");
    expect(engine.seed).toBe(42);
    expect(engine.redHerringSeatIndex).toBe(4);
    expect(engine.script).toHaveLength(22);
    // Seat order is the table order, whatever order the rows came back in.
    expect(engine.seats.map((s) => s.name)).toEqual(["Ana", "Ben"]);
  });

  it("keeps the Drunk's believed role separate from the truth", () => {
    const engine = toEngineGame({
      game,
      seats: [seat(1, { roleId: "drunk", believedRoleId: "washerwoman" })],
      script: SCRIPT,
    });

    expect(engine.seats[0]?.roleId).toBe("drunk");
    expect(engine.seats[0]?.believedRoleId).toBe("washerwoman");
  });
});

describe("resolveViewer", () => {
  const seats = [seat(1), seat(2)];

  it("treats the Storyteller's device as the Storyteller", () => {
    expect(resolveViewer({ game, seats, deviceKey: "st-device" })).toEqual({ kind: "storyteller" });
  });

  it("treats a seated device as that player", () => {
    expect(resolveViewer({ game, seats, deviceKey: "device-2" })).toEqual({
      kind: "player",
      seatIndex: 2,
    });
  });

  it("treats an unknown or absent device as a spectator", () => {
    expect(resolveViewer({ game, seats, deviceKey: "stranger" })).toEqual({
      kind: "spectator",
    });
    expect(resolveViewer({ game, seats, deviceKey: null })).toEqual({
      kind: "spectator",
    });
  });

  it("does not let a device claim the Storyteller's view", () => {
    // The viewer comes from the credential, so a seat cannot impersonate the
    // Storyteller by asking.
    const view = resolveViewer({
      game: { storyTellerDeviceKey: "st-device" },
      seats: [{ seatIndex: 1, deviceKey: "device-1" }],
      deviceKey: "device-1",
    });
    expect(view).toEqual({ kind: "player", seatIndex: 1 });
  });
});

describe("newRoomCode", () => {
  it("makes a short code with no characters people confuse", () => {
    let seed = 0;
    const random = () => {
      seed += 0.137;
      return seed % 1;
    };

    for (let index = 0; index < 200; index += 1) {
      const code = newRoomCode(random);
      expect(code).toHaveLength(ROOM_CODE_LENGTH);
      for (const character of code) {
        expect(ROOM_CODE_ALPHABET).toContain(character);
      }
      expect(code).not.toMatch(/[IO01]/);
    }
  });
});

describe("chooseRedHerring", () => {
  it("picks a living good seat, never the Demon", () => {
    const seats = [
      { seatIndex: 1, roleId: "chef", alive: true },
      { seatIndex: 2, roleId: "imp", alive: true },
      { seatIndex: 3, roleId: "poisoner", alive: true },
      { seatIndex: 4, roleId: "drunk", alive: false },
    ];

    for (let index = 0; index < 20; index += 1) {
      const seatIndex = chooseRedHerring({
        seats,
        script: SCRIPT,
        random: () => index / 20,
      });
      expect([1]).toContain(seatIndex);
    }
  });

  it("has no answer when everyone living is evil", () => {
    expect(
      chooseRedHerring({
        seats: [{ seatIndex: 1, roleId: "imp", alive: true }],
        script: SCRIPT,
        random: () => 0,
      }),
    ).toBeNull();
  });
});
