import type { Document } from "@confect/server";
import type schemaDefinition from "./schema";

export type DevTicketDoc = Document.Document<typeof schemaDefinition, "devTicket">;
export type NumbersDoc = Document.Document<typeof schemaDefinition, "numbers">;

export interface Docs {
  devTicket: DevTicketDoc;
  numbers: NumbersDoc;
}
