import { Table } from "@confect/core";
import * as Schema from "effect/Schema";

import { Id } from "../_generated/id";

/*
 * One nomination round. `voterSeatIndexes` is the record of which seats' hands
 * went up — the Storyteller taps seats rather than typing a total, because a
 * total cannot tell the app who spent a ghost vote
 * (docs/technical/decisions.md).
 *
 * `threshold` is stored only as a record of what it was at the time; the live
 * value is always recomputed from who is alive.
 */
export default Table.make(() =>
  Schema.Struct({
    gameId: Id("game"),
    dayNumber: Schema.Number,
    nominatorSeatIndex: Schema.Number,
    nomineeSeatIndex: Schema.Number,
    voterSeatIndexes: Schema.Array(Schema.Number),
    voteCount: Schema.Number,
    threshold: Schema.Number,
    qualified: Schema.Boolean,
    executed: Schema.Boolean,
  }),
).index("by_game_and_day", ["gameId", "dayNumber"]);
