import { FunctionSpec, GroupSpec } from "@confect/core";
import * as Schema from "effect/Schema";

import { Id } from "../_generated/id";
import { GameViewSchema } from "./viewSchema";

/*
 * The game's public surface: create a room, join it, start it, and look at it.
 *
 * `view` is the only way to read a game, and it derives the viewer from the
 * device key in the request rather than trusting a claim, so there is no query a
 * player can call to see the grimoire.
 *
 * Commands return a result union instead of failing, because every failure here
 * is a message for a person ("that code is not a game", "someone else is already
 * in seat 3"), not a broken invariant.
 */

const DeviceKey = Schema.String.check(Schema.isMinLength(8), Schema.isMaxLength(64));
const GameId = Id("game");
const ParticipantName = Schema.String.check(Schema.isMinLength(1), Schema.isMaxLength(24));

const CreateFailure = Schema.Struct({
  ok: Schema.Literal(false),
  reason: Schema.Literals(["script-unknown", "could-not-make-code"]),
});
const CreateSuccess = Schema.Struct({
  ok: Schema.Literal(true),
  gameId: GameId,
  code: Schema.String,
});
const create = FunctionSpec.publicMutation({
  name: "create",
  args: () => ({ deviceKey: DeviceKey, scriptId: Schema.String }),
  returns: () => Schema.Union([CreateSuccess, CreateFailure]),
});

const JoinFailure = Schema.Struct({
  ok: Schema.Literal(false),
  reason: Schema.Literals(["no-such-game", "locked", "full"]),
});
const JoinSuccess = Schema.Struct({
  ok: Schema.Literal(true),
  gameId: GameId,
  seatIndex: Schema.Number,
});
const join = FunctionSpec.publicMutation({
  name: "join",
  args: () => ({ code: Schema.String, name: ParticipantName, deviceKey: DeviceKey }),
  returns: () => Schema.Union([JoinSuccess, JoinFailure]),
});

const StartFailure = Schema.Struct({
  ok: Schema.Literal(false),
  reason: Schema.Literals([
    "no-such-game",
    "not-storyteller",
    "already-started",
    "unknown-character",
    "too-few-players",
    "cast-mismatch",
  ]),
  detail: Schema.NullOr(Schema.String),
});
const StartSuccess = Schema.Struct({ ok: Schema.Literal(true) });
const start = FunctionSpec.publicMutation({
  name: "start",
  args: () => ({
    gameId: GameId,
    deviceKey: DeviceKey,
    /**
     * The Storyteller's chosen cast, one entry per seat. Omit it to let the
     * server take the chart's share of each alignment in script order.
     */
    cast: Schema.optional(Schema.Array(Schema.String)),
  }),
  returns: () => Schema.Union([StartSuccess, StartFailure]),
});

const view = FunctionSpec.publicQuery({
  name: "view",
  args: () => ({
    gameId: GameId,
    deviceKey: Schema.optional(Schema.NullOr(DeviceKey)),
  }),
  returns: () => Schema.NullOr(GameViewSchema),
});

export default GroupSpec.make()
  .addFunction(create)
  .addFunction(join)
  .addFunction(start)
  .addFunction(view);
