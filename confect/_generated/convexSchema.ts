import { defineSchema as $defineSchema } from "convex/server";
import { Table as $Table } from "@confect/server";

import devTicket from "./tables/devTicket";

export default $defineSchema({
  devTicket: $Table.tableDefinition(devTicket),
});
