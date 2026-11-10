import { DatabaseSchema as $DatabaseSchema } from "@confect/server";

import character from "./tables/character";
import devTicket from "./tables/devTicket";
import game from "./tables/game";
import gameEvent from "./tables/gameEvent";
import nightStep from "./tables/nightStep";
import nomination from "./tables/nomination";
import seat from "./tables/seat";

const databaseSchema: $DatabaseSchema.DatabaseSchema<{
  readonly character: typeof character;
  readonly devTicket: typeof devTicket;
  readonly game: typeof game;
  readonly gameEvent: typeof gameEvent;
  readonly nightStep: typeof nightStep;
  readonly nomination: typeof nomination;
  readonly seat: typeof seat;
}> = $DatabaseSchema.make({
  character,
  devTicket,
  game,
  gameEvent,
  nightStep,
  nomination,
  seat,
});

export default databaseSchema;
