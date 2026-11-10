import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { dealRoles } from "./engine/deal";
import { FIRST_CAST, SCRIPT, seatsFor, TOWNSFOLK_POOL } from "./engine/fixtures";
import type { Game } from "./engine/types";
import { gameView } from "./engine/view";
import { GameViewSchema } from "./viewSchema";

/*
 * The projection is decoded by this schema on its way out to a phone, so the
 * schema is a second gate in front of the same secrets. Decoding with
 * onExcessProperty: "error" means a field that should not be in a player's view
 * is rejected rather than quietly forwarded.
 */

const game: Game = {
  code: "TEST1",
  scriptId: "trouble-brewing",
  status: "night",
  nightNumber: 2,
  dayNumber: 1,
  seed: 9,
  seats: dealRoles({
    seats: seatsFor(8),
    cast: FIRST_CAST,
    townsfolkPool: TOWNSFOLK_POOL,
    seed: 9,
  }).seats,
  script: SCRIPT,
  winner: null,
  redHerringSeatIndex: 4,
};

const decode = Schema.decodeUnknownSync(GameViewSchema, {
  onExcessProperty: "error",
});

describe("GameViewSchema", () => {
  it("accepts each kind of view the engine produces", () => {
    const storyteller = decode(gameView(game, { kind: "storyteller" }));
    const player = decode(gameView(game, { kind: "player", seatIndex: 2 }));
    const spectator = decode(gameView(game, { kind: "spectator" }));

    expect(storyteller.kind).toBe("storyteller");
    expect(player.kind).toBe("player");
    expect(spectator.kind).toBe("spectator");
  });

  it("rejects a player view carrying a Storyteller-only field", () => {
    const view = gameView(game, { kind: "player", seatIndex: 2 });

    expect(() => decode({ ...view, redHerringSeatIndex: 4 })).toThrow();
  });

  it("rejects a player view carrying a grimoire", () => {
    const view = gameView(game, { kind: "player", seatIndex: 2 });

    expect(() => decode({ ...view, grimoire: [] })).toThrow();
  });

  it("rejects an unknown viewer kind", () => {
    expect(() => decode({ ...gameView(game, { kind: "spectator" }), kind: "admin" })).toThrow();
  });
});
