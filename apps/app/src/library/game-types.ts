import type { FunctionReturnType } from "convex/server";

import { api } from "convex/_generated/api";

/**
 * The shapes the screens render, derived from the query the server exposes.
 * Nothing here can describe a field the projection does not return.
 */
export type GameView = NonNullable<FunctionReturnType<typeof api.game.games.view>>;
export type PlayerView = Extract<GameView, { kind: "player" }>;
export type StorytellerView = Extract<GameView, { kind: "storyteller" }>;
export type SpectatorView = Extract<GameView, { kind: "spectator" }>;
export type RoleView = PlayerView["yourRole"];

export const alignmentLabel = (role: RoleView) =>
  role.alignment === "demon"
    ? "Demon"
    : role.alignment === "minion"
      ? "Minion"
      : role.alignment === "outsider"
        ? "Outsider"
        : "Townsfolk";

export const isEvilRole = (role: RoleView) =>
  role.alignment === "demon" || role.alignment === "minion";
