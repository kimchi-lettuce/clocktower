import { Table } from "@confect/core";
import * as Schema from "effect/Schema";

import { Id } from "../_generated/id";

/*
 * The night's script: one row per step the Storyteller has to work through,
 * generated at dusk from the characters in play and the night number.
 *
 * Steps exist as rows (rather than being derived on the fly) so the Storyteller
 * can close the app mid-night and resume, and so a resolved step is a fact.
 * `toldPlayer` records what was actually said out loud when the truth was
 * false — the Storyteller decides the lie, the app only remembers it
 * (docs/product/decisions.md).
 */
export default Table.make(() =>
  Schema.Struct({
    gameId: Id("game"),
    nightNumber: Schema.Number,
    orderIndex: Schema.Number,
    characterId: Schema.String,
    actorSeatIndex: Schema.NullOr(Schema.Number),
    status: Schema.Literals(["pending", "resolved", "skipped"]),
    targetSeatIndexes: Schema.Array(Schema.Number),
    revealShown: Schema.Boolean,
    toldPlayer: Schema.NullOr(Schema.String),
    note: Schema.NullOr(Schema.String),
  }),
).index("by_game_and_night_and_order", ["gameId", "nightNumber", "orderIndex"]);
