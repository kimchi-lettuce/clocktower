import { GenericId } from "@confect/core";

export type TableNames = "character" | "devTicket" | "game" | "gameEvent" | "nightStep" | "nomination" | "seat";

export const Id = <const TableName extends TableNames>(
  tableName: TableName,
) => GenericId.GenericId(tableName);
