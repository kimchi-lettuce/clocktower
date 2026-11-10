import { DatabaseSchema as $DatabaseSchema } from "@confect/server";

import devTicket from "./tables/devTicket";

const databaseSchema: $DatabaseSchema.DatabaseSchema<{
  readonly devTicket: typeof devTicket;
}> = $DatabaseSchema.make({
  devTicket,
});

export default databaseSchema;
