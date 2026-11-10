import { FunctionImpl, GroupImpl } from "@confect/server";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import databaseSchema from "./_generated/schema";
import { Auth, DatabaseReader, DatabaseWriter } from "./_generated/services";
import myFunctions, { UnauthenticatedError } from "./myFunctions.spec";

const requireIdentity = Effect.gen(function* () {
  const auth = yield* Auth;
  return yield* auth.getUserIdentity.pipe(
    Effect.catchTag(
      "NoUserIdentityFoundError",
      () => Effect.fail(new UnauthenticatedError()),
    ),
  );
});

const list = FunctionImpl.make(databaseSchema, myFunctions, "listNumbers", ({ count }) =>
  Effect.gen(function* () {
    const reader = yield* DatabaseReader;
    const identity = yield* requireIdentity;

    const docs = yield* reader
      .table("numbers")
      .index("by_creation_time", "desc")
      .take(count)
      .pipe(Effect.orDie);

    return {
      viewer: identity.name ?? null,
      numbers: [...docs].reverse().map((doc) => doc.value),
    };
  }),
);

const addNumber = FunctionImpl.make(
  databaseSchema,
  myFunctions,
  "addNumber",
  ({ value }) =>
    Effect.gen(function* () {
      const writer = yield* DatabaseWriter;
      const identity = yield* requireIdentity;

      yield* writer
        .table("numbers")
        .insert({
          value,
          userId: identity.tokenIdentifier,
        })
        .pipe(Effect.orDie);

      return null;
    }),
);

export default GroupImpl.make(databaseSchema, myFunctions).pipe(
  Layer.provide(list),
  Layer.provide(addNumber),
  GroupImpl.finalize,
);