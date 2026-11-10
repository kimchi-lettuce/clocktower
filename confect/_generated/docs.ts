import type { Document } from "@confect/server";
import type schemaDefinition from "./schema";

export type DevTicketDoc = Document.Document<typeof schemaDefinition, "devTicket">;

export interface Docs {
  devTicket: DevTicketDoc;
}
