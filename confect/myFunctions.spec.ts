import { FunctionSpec, GroupSpec } from "@confect/core";
import * as Schema from "effect/Schema";

import numbers from "./_generated/tables/numbers";

/*
 * Starter demo group, migrated from the hand-written `convex/myFunctions.ts`.
 * Kept as a working Confect/Effect reference and for the dashboard demo card;
 * tracked on the dev board for removal or relocation once real features land.
 */

export class UnauthenticatedError extends Schema.TaggedError<UnauthenticatedError>()(
  "UnauthenticatedError",
  {},
) {}

const list = FunctionSpec.publicQuery({
  name: "listNumbers",
  args: () => ({ count: Schema.Number }),
  returns: () =>
    Schema.Struct({
      viewer: Schema.NullOr(Schema.String),
      numbers: Schema.Array(Schema.Number),
    }),
  error: () => UnauthenticatedError,
});

const addNumber = FunctionSpec.publicMutation({
  name: "addNumber",
  args: () => ({ value: Schema.Number }),
  returns: () => Schema.Null,
  error: () => UnauthenticatedError,
});

export default GroupSpec.make().addFunction(list).addFunction(addNumber);