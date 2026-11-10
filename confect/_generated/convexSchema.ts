import { defineSchema as $defineSchema } from "convex/server";
import { Table as $Table } from "@confect/server";

import devTicket from "./tables/devTicket";
import numbers from "./tables/numbers";

export default $defineSchema({
  devTicket: $Table.tableDefinition(devTicket),
  numbers: $Table.tableDefinition(numbers),
});
