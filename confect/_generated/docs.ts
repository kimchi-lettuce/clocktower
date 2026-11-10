import type { Document } from "@confect/server";
import type schemaDefinition from "./schema";

export type CharacterDoc = Document.Document<typeof schemaDefinition, "character">;
export type DevTicketDoc = Document.Document<typeof schemaDefinition, "devTicket">;
export type GameDoc = Document.Document<typeof schemaDefinition, "game">;
export type GameEventDoc = Document.Document<typeof schemaDefinition, "gameEvent">;
export type NightStepDoc = Document.Document<typeof schemaDefinition, "nightStep">;
export type NominationDoc = Document.Document<typeof schemaDefinition, "nomination">;
export type SeatDoc = Document.Document<typeof schemaDefinition, "seat">;

export interface Docs {
  character: CharacterDoc;
  devTicket: DevTicketDoc;
  game: GameDoc;
  gameEvent: GameEventDoc;
  nightStep: NightStepDoc;
  nomination: NominationDoc;
  seat: SeatDoc;
}
