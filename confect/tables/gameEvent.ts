import { Table } from "@confect/core";
import * as Schema from "effect/Schema";

import { Id } from "../_generated/id";

/*
 * The game log. Append-only: nothing here is ever edited or deleted, which is
 * what makes replay, undo-by-correction, and post-game review possible without a
 * separate replay format.
 *
 * `data` is a JSON string of the adapter's payload for that event kind. Keeping
 * it opaque means the log can record events for characters that do not exist
 * yet, without a schema change per character.
 */
export default Table.make(() =>
  Schema.Struct({
    gameId: Id("game"),
    seq: Schema.Number,
    kind: Schema.String.check(Schema.isMaxLength(48)),
    actorSeatIndex: Schema.NullOr(Schema.Number),
    subjectSeatIndexes: Schema.Array(Schema.Number),
    data: Schema.String.check(Schema.isMaxLength(2000)),
    at: Schema.Number,
  }),
).index("by_game_and_seq", ["gameId", "seq"]);
