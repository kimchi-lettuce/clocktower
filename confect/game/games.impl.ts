import { FunctionImpl, GroupImpl } from "@confect/server";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";

import databaseSchema from "../_generated/schema";
import { DatabaseReader, DatabaseWriter } from "../_generated/services";
import { chooseRedHerring, newRoomCode, resolveViewer, toEngineGame } from "./adapter";
import { SCRIPT_ID, TOWNSFOLK, TROUBLE_BREWING, findCharacter } from "./content/troubleBrewing";
import { compositionFor } from "./engine/composition";
import { dealRoles } from "./engine/deal";
import { gameView } from "./engine/view";
import games from "./games.spec";

/*
 * Thin adapters: read rows, call the engine, write rows. Every rule decision is
 * made by the engine, which is why this file mostly checks preconditions and
 * shapes data.
 *
 * `Math.random` and `Date.now` are allowed here and only here — the engine takes
 * a seed and a night number so it never reads a clock.
 */

const MAX_SEATS = 20;

const scriptFor = (scriptId: string) => (scriptId === SCRIPT_ID ? TROUBLE_BREWING : null);

const create = FunctionImpl.make(databaseSchema, games, "create", (args) =>
  Effect.gen(function* () {
    const reader = yield* DatabaseReader;
    const writer = yield* DatabaseWriter;

    if (!scriptFor(args.scriptId)) {
      return { ok: false, reason: "script-unknown" } as const;
    }

    let code: string | null = null;
    for (let attempt = 0; attempt < 8 && code === null; attempt += 1) {
      const candidate = newRoomCode(Math.random);
      const taken = yield* reader
        .table("game")
        .index("by_code", (q) => q.eq("code", candidate))
        .first();
      if (Option.isNone(taken)) code = candidate;
    }

    if (code === null) {
      return { ok: false, reason: "could-not-make-code" } as const;
    }

    const gameId = yield* writer.table("game").insert({
      code,
      scriptId: args.scriptId,
      status: "lobby",
      nightNumber: 0,
      dayNumber: 0,
      // The seed fixes the shuffle, so a dealt game can be reproduced exactly.
      seed: Math.floor(Math.random() * 2 ** 31),
      version: 0,
      storyTellerDeviceKey: args.deviceKey,
      lobbyLocked: false,
      lastActivityAt: Date.now(),
      redHerringSeatIndex: null,
      winner: null,
      endedReason: null,
    });

    return { ok: true, gameId, code } as const;
  }).pipe(Effect.orDie),
);

const join = FunctionImpl.make(databaseSchema, games, "join", (args) =>
  Effect.gen(function* () {
    const reader = yield* DatabaseReader;
    const writer = yield* DatabaseWriter;

    const found = yield* reader
      .table("game")
      .index("by_code", (q) => q.eq("code", args.code.trim().toUpperCase()))
      .first();

    if (Option.isNone(found)) return { ok: false, reason: "no-such-game", detail: null } as const;

    const game = found.value;
    if (game.lobbyLocked || game.status !== "lobby") {
      return { ok: false, reason: "locked" } as const;
    }

    const seats = yield* reader
      .table("seat")
      .index("by_game_and_seat_index", (q) => q.eq("gameId", game._id))
      .take(MAX_SEATS);

    // Rejoining on the same device must not take a second seat.
    const alreadySeated = seats.find((seat) => seat.deviceKey === args.deviceKey);
    if (alreadySeated) {
      return {
        ok: true,
        gameId: game._id,
        seatIndex: alreadySeated.seatIndex,
      } as const;
    }

    if (seats.length >= MAX_SEATS) return { ok: false, reason: "full" } as const;

    const seatIndex = seats.reduce((highest, seat) => Math.max(highest, seat.seatIndex), 0) + 1;

    yield* writer.table("seat").insert({
      gameId: game._id,
      seatIndex,
      name: args.name,
      isStoryteller: false,
      deviceKey: args.deviceKey,
      pin: null,
      roleId: null,
      believedRoleId: null,
      alive: true,
      ghostVoteAvailable: true,
    });

    yield* writer.table("game").patch(game._id, { lastActivityAt: Date.now() });

    return { ok: true, gameId: game._id, seatIndex } as const;
  }).pipe(Effect.orDie),
);

const start = FunctionImpl.make(databaseSchema, games, "start", (args) =>
  Effect.gen(function* () {
    const reader = yield* DatabaseReader;
    const writer = yield* DatabaseWriter;

    const found = yield* reader.table("game").get(args.gameId).pipe(Effect.option);
    if (Option.isNone(found)) return { ok: false, reason: "no-such-game", detail: null } as const;

    const game = found.value;
    if (game.storyTellerDeviceKey !== args.deviceKey) {
      return { ok: false, reason: "not-storyteller", detail: null } as const;
    }
    if (game.status !== "lobby") {
      return { ok: false, reason: "already-started", detail: null } as const;
    }

    const script = scriptFor(game.scriptId);
    if (!script) return { ok: false, reason: "unknown-character", detail: null } as const;

    const seats = yield* reader
      .table("seat")
      .index("by_game_and_seat_index", (q) => q.eq("gameId", game._id))
      .take(MAX_SEATS);

    const cast = args.cast.map((characterId) => findCharacter(characterId));
    if (cast.some((character) => character === undefined)) {
      return { ok: false, reason: "unknown-character", detail: null } as const;
    }
    const resolvedCast = cast.filter((character) => character !== undefined);

    if (seats.length < 5) {
      return { ok: false, reason: "too-few-players", detail: null } as const;
    }

    if (seats.length !== resolvedCast.length) {
      return {
        ok: false,
        reason: "cast-mismatch",
        detail: `${seats.length} players, ${resolvedCast.length} characters`,
      } as const;
    }

    const expected = compositionFor(seats.length);
    const actual = resolvedCast.reduce<Record<string, number>>((counts, character) => {
      counts[character.alignment] = (counts[character.alignment] ?? 0) + 1;
      return counts;
    }, {});
    const mismatched = (["townsfolk", "outsider", "minion", "demon"] as const).filter(
      (alignment) => expected[alignment] !== (actual[alignment] ?? 0),
    );

    if (mismatched.length > 0) {
      return {
        ok: false,
        reason: "cast-mismatch",
        detail:
          `for ${seats.length} players the chart needs ` +
          (["townsfolk", "outsider", "minion", "demon"] as const)
            .map((alignment) => `${expected[alignment]} ${alignment}`)
            .join(", "),
      } as const;
    }

    const dealt = dealRoles({
      seats: seats.map((seat) => ({ seatIndex: seat.seatIndex, name: seat.name })),
      cast: resolvedCast,
      townsfolkPool: TOWNSFOLK,
      seed: game.seed,
    }).seats;

    for (const dealtSeat of dealt) {
      const row = seats.find((seat) => seat.seatIndex === dealtSeat.seatIndex);
      if (!row) continue;
      yield* writer.table("seat").patch(row._id, {
        roleId: dealtSeat.roleId,
        believedRoleId: dealtSeat.believedRoleId,
      });
    }

    const redHerringSeatIndex = chooseRedHerring({
      seats: dealt.map((seat) => ({
        seatIndex: seat.seatIndex,
        roleId: seat.roleId,
        alive: seat.alive,
      })),
      script,
      random: Math.random,
    });

    yield* writer.table("game").patch(game._id, {
      status: "night",
      nightNumber: 1,
      dayNumber: 0,
      lobbyLocked: true,
      redHerringSeatIndex,
      version: game.version + 1,
      lastActivityAt: Date.now(),
    });

    return { ok: true } as const;
  }).pipe(Effect.orDie),
);

const view = FunctionImpl.make(databaseSchema, games, "view", (args) =>
  Effect.gen(function* () {
    const reader = yield* DatabaseReader;

    const found = yield* reader.table("game").get(args.gameId).pipe(Effect.option);
    if (Option.isNone(found)) return null;

    const game = found.value;
    const script = scriptFor(game.scriptId);
    if (!script) return null;

    const seats = yield* reader
      .table("seat")
      .index("by_game_and_seat_index", (q) => q.eq("gameId", game._id))
      .take(MAX_SEATS);

    const viewer = resolveViewer({
      game,
      seats,
      deviceKey: args.deviceKey ?? null,
    });

    return gameView(toEngineGame({ game, seats, script }), viewer);
  }).pipe(Effect.orDie),
);

export default GroupImpl.make(databaseSchema, games).pipe(
  Layer.provide(create),
  Layer.provide(join),
  Layer.provide(start),
  Layer.provide(view),
  GroupImpl.finalize,
);
