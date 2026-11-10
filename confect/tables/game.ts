import { Table } from "@confect/core";
import * as Schema from "effect/Schema";

/*
 * One game. Rows are cheap and public to create, so they carry `lastActivityAt`
 * for the expiry job and a short `code` for joining (docs/status.md lists the
 * open question about rate limiting).
 *
 * `version` is the optimistic-concurrency token: a command is rejected when the
 * version it read no longer matches. `seed` makes every shuffled outcome
 * reproducible, which is what makes a replay exact.
 *
 * The `redHerringSeatIndex` field is a Storyteller-only secret set before the
 * first night. It must never appear in a player projection.
 */
export default Table.make(() =>
  Schema.Struct({
    code: Schema.String.check(Schema.isMaxLength(8)),
    scriptId: Schema.String,
    status: Schema.Literals(["lobby", "night", "day", "ended"]),
    nightNumber: Schema.Number,
    dayNumber: Schema.Number,
    seed: Schema.Number,
    version: Schema.Number,
    storyTellerDeviceKey: Schema.NullOr(Schema.String),
    lobbyLocked: Schema.Boolean,
    lastActivityAt: Schema.Number,
    redHerringSeatIndex: Schema.NullOr(Schema.Number),
    winner: Schema.NullOr(Schema.Literals(["good", "evil"])),
    endedReason: Schema.NullOr(Schema.String),
  }),
)
  .index("by_code", ["code"])
  .index("by_status_and_last_activity", ["status", "lastActivityAt"]);
