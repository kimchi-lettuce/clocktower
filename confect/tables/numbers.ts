import { Table } from "@confect/core";
import * as Schema from "effect/Schema";

/*
 * Starter demo table kept from the Convex/Better Auth starter.
 * Declared here so confect codegen keeps emitting it into the deploy schema;
 * the starter's `convex/myFunctions.ts` still reads and writes it until that
 * demo is migrated into a Confect group.
 */
export default Table.make(() =>
  Schema.Struct({
    value: Schema.Number,
    userId: Schema.String,
  }),
).index("by_user_id", ["userId"]);