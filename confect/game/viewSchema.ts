/*
 * Effect Schema mirror of the engine's view types.
 *
 * This exists so the projection is validated on its way out of Convex, and so an
 * unexpected field — a grimoire in a player's view, the red herring anywhere —
 * is rejected by the decoder instead of quietly reaching a phone.
 */

import * as Schema from "effect/Schema";

// The engine types these schemas must match. `games.impl.ts` returns a `GameView`
// from a function whose schema is `GameViewSchema`, so a drift in either shape
// fails to compile rather than shipping a stale shape to a phone.

const AlignmentSchema = Schema.Literals(["townsfolk", "outsider", "minion", "demon"]);

const StatusSchema = Schema.Literals(["lobby", "night", "day", "ended"]);

const WinnerSchema = Schema.Literals(["good", "evil"]);

export const RoleViewSchema = Schema.Struct({
  characterId: Schema.String,
  name: Schema.String,
  alignment: AlignmentSchema,
  ability: Schema.String,
  shortAbility: Schema.String,
});

export const PublicSeatViewSchema = Schema.Struct({
  seatIndex: Schema.Number,
  name: Schema.String,
  alive: Schema.Boolean,
  ghostVoteAvailable: Schema.Boolean,
});

export const PublicGameViewSchema = Schema.Struct({
  scriptId: Schema.String,
  status: StatusSchema,
  nightNumber: Schema.Number,
  dayNumber: Schema.Number,
  winner: Schema.NullOr(WinnerSchema),
  aliveCount: Schema.Number,
  voteThreshold: Schema.Number,
  seats: Schema.Array(PublicSeatViewSchema),
});

export const StorytellerViewSchema = Schema.Struct({
  ...PublicGameViewSchema.fields,
  kind: Schema.Literal("storyteller"),
  grimoire: Schema.Array(
    Schema.Struct({
      ...PublicSeatViewSchema.fields,
      role: RoleViewSchema,
      believedRole: RoleViewSchema,
    }),
  ),
  redHerringSeatIndex: Schema.NullOr(Schema.Number),
});

export const PlayerViewSchema = Schema.Struct({
  ...PublicGameViewSchema.fields,
  kind: Schema.Literal("player"),
  yourSeatIndex: Schema.Number,
  yourRole: RoleViewSchema,
  knownEvilSeats: Schema.Array(Schema.Number),
  youAreEvil: Schema.Boolean,
});

export const SpectatorViewSchema = Schema.Struct({
  ...PublicGameViewSchema.fields,
  kind: Schema.Literal("spectator"),
});

export const GameViewSchema = Schema.Union([
  StorytellerViewSchema,
  PlayerViewSchema,
  SpectatorViewSchema,
]);
