import { defineSchema as $defineSchema } from "convex/server";
import { Table as $Table } from "@confect/server";

import character from "./tables/character";
import devTicket from "./tables/devTicket";
import game from "./tables/game";
import gameEvent from "./tables/gameEvent";
import nightStep from "./tables/nightStep";
import nomination from "./tables/nomination";
import seat from "./tables/seat";

export default $defineSchema({
  character: $Table.tableDefinition(character),
  devTicket: $Table.tableDefinition(devTicket),
  game: $Table.tableDefinition(game),
  gameEvent: $Table.tableDefinition(gameEvent),
  nightStep: $Table.tableDefinition(nightStep),
  nomination: $Table.tableDefinition(nomination),
  seat: $Table.tableDefinition(seat),
});
