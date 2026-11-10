import { FunctionImpl, GroupImpl } from "@confect/server";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";

import databaseSchema from "../_generated/schema";
import { DatabaseReader, DatabaseWriter } from "../_generated/services";
import tickets, { STARTER_DEV_TICKETS } from "./tickets.spec";

/*
 * Implemented as Effect layers per the Confect spec/impl model.
 * Intentionally public/unauthenticated for the localhost-only dev board —
 * see tickets.spec.ts and the "internalize before launch" ticket.
 */

const list = FunctionImpl.make(databaseSchema, tickets, "list", () =>
  Effect.gen(function* () {
    const reader = yield* DatabaseReader;

    return yield* reader.table("devTicket").index("by_creation_time").take(300);
  }).pipe(Effect.orDie),
);

const create = FunctionImpl.make(databaseSchema, tickets, "create", (args) =>
  Effect.gen(function* () {
    const reader = yield* DatabaseReader;
    const writer = yield* DatabaseWriter;

    const last = yield* reader
      .table("devTicket")
      .index("by_status_and_order", (q) => q.eq("status", args.status), "desc")
      .first();
    const order = Option.isSome(last) ? last.value.order + 1 : 0;

    return yield* writer.table("devTicket").insert({
      title: args.title,
      description: args.description,
      status: args.status,
      priority: args.priority,
      labels: args.labels,
      order,
    });
  }).pipe(Effect.orDie),
);

const update = FunctionImpl.make(databaseSchema, tickets, "update", (args) =>
  Effect.gen(function* () {
    const writer = yield* DatabaseWriter;

    yield* writer.table("devTicket").patch(args.ticketId, {
      title: args.title,
      description: args.description,
      priority: args.priority,
      labels: args.labels,
    });

    return null;
  }).pipe(Effect.orDie),
);

const setStatus = FunctionImpl.make(databaseSchema, tickets, "setStatus", (args) =>
  Effect.gen(function* () {
    const reader = yield* DatabaseReader;
    const writer = yield* DatabaseWriter;

    const last = yield* reader
      .table("devTicket")
      .index("by_status_and_order", (q) => q.eq("status", args.status), "desc")
      .first();
    const order = Option.isSome(last) ? last.value.order + 1 : 0;

    yield* writer.table("devTicket").patch(args.ticketId, { status: args.status, order });

    return null;
  }).pipe(Effect.orDie),
);

const remove = FunctionImpl.make(databaseSchema, tickets, "remove", (args) =>
  Effect.gen(function* () {
    const writer = yield* DatabaseWriter;

    yield* writer.table("devTicket").delete(args.ticketId);

    return null;
  }).pipe(Effect.orDie),
);

const seedStarter = FunctionImpl.make(databaseSchema, tickets, "seedStarter", () =>
  Effect.gen(function* () {
    const reader = yield* DatabaseReader;
    const writer = yield* DatabaseWriter;

    const existing = yield* reader.table("devTicket").index("by_creation_time").first();
    if (Option.isSome(existing)) {
      return 0;
    }

    const orders: Record<string, number> = {};
    let inserted = 0;
    for (const ticket of STARTER_DEV_TICKETS) {
      const order = orders[ticket.status] ?? 0;
      orders[ticket.status] = order + 1;
      yield* writer.table("devTicket").insert({ ...ticket, order });
      inserted += 1;
    }

    return inserted;
  }).pipe(Effect.orDie),
);

export default GroupImpl.make(databaseSchema, tickets).pipe(
  Layer.provide(list),
  Layer.provide(create),
  Layer.provide(update),
  Layer.provide(setStatus),
  Layer.provide(remove),
  Layer.provide(seedStarter),
  GroupImpl.finalize,
);
