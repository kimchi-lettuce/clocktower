import { Table } from "@confect/core";
import * as Schema from "effect/Schema";

/*
 * Development task board (see docs/product/features/dev-board.md).
 * Holds development tickets only — never player data.
 */
export default Table.make(() =>
  Schema.Struct({
    title: Schema.String.check(Schema.isMaxLength(120)),
    description: Schema.String.check(Schema.isMaxLength(5000)),
    status: Schema.Literals(["backlog", "in-progress", "in-review", "done"]),
    priority: Schema.Literals(["low", "medium", "high"]),
    labels: Schema.Array(Schema.String.check(Schema.isMaxLength(24))),
    order: Schema.Number,
  }),
).index("by_status_and_order", ["status", "order"]);
