import { Table } from "@confect/core";
import * as Schema from "effect/Schema";

import { Id } from "../_generated/id";

/*
 * One seat at one game. Seats are numbered clockwise from 1, because the game's
 * rules are full of neighbour relationships (Empath, Chef) and "the seat next to
 * you" is the unit players already think in.
 *
 * `roleId` is the truth. `believedRoleId` is what that player's phone shows; for
 * the Drunk the two differ, and a player projection may only ever expose the
 * believed one. `deviceKey` is the guest identity, `pin` the fallback for a
 * changed device (docs/technical/decisions.md).
 *
 * Dead players keep their row: they still talk, and they hold one ghost vote.
 */
export default Table.make(() =>
  Schema.Struct({
    gameId: Id("game"),
    seatIndex: Schema.Number,
    name: Schema.String.check(Schema.isMaxLength(24)),
    isStoryteller: Schema.Boolean,
    deviceKey: Schema.NullOr(Schema.String),
    pin: Schema.NullOr(Schema.String),
    roleId: Schema.NullOr(Schema.String),
    believedRoleId: Schema.NullOr(Schema.String),
    alive: Schema.Boolean,
    ghostVoteAvailable: Schema.Boolean,
  }),
)
  .index("by_game_and_seat_index", ["gameId", "seatIndex"])
  .index("by_device_key", ["deviceKey"]);
