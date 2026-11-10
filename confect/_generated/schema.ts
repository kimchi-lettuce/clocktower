import { DatabaseSchema as $DatabaseSchema } from "@confect/server";

import devTicket from "./tables/devTicket";
import numbers from "./tables/numbers";

const databaseSchema: $DatabaseSchema.DatabaseSchema<{
  readonly devTicket: typeof devTicket;
  readonly numbers: typeof numbers;
}> = $DatabaseSchema.make({
  devTicket,
  numbers,
});

export default databaseSchema;
