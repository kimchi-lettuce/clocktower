/*
 * Shared types for the rules engine.
 *
 * Plain TypeScript on purpose: this folder imports nothing from Convex or
 * Effect, reads no clock, and takes randomness as a seed, so the rules can be
 * tested by calling a function and replayed exactly
 * (docs/technical/decisions.md). The Convex tables describe the same shapes in
 * Effect Schema; the adapters map between them.
 */

export type Alignment = "townsfolk" | "outsider" | "minion" | "demon";

export type Targeting = "none" | "one-player" | "one-player-not-self" | "two-players";

export type Character = {
  characterId: string;
  name: string;
  alignment: Alignment;
  /** The exact published text. The rules authority. */
  ability: string;
  /** One line, for a phone screen. */
  shortAbility: string;
  /** Position in the first night's sequence, or null when it does not act. */
  firstNightOrder: number | null;
  /** Position in every later night's sequence, or null. */
  otherNightOrder: number | null;
  targeting: Targeting;
  /** What the Storyteller does at this character's step, in the sheet's words. */
  firstNightNote: string | null;
  otherNightNote: string | null;
};

export type GameStatus = "lobby" | "night" | "day" | "ended";

export type Winner = "good" | "evil";

export type Seat = {
  seatIndex: number;
  name: string;
  alive: boolean;
  /** False once a dead seat has spent its single ghost vote. */
  ghostVoteAvailable: boolean;
  /** The truth. */
  roleId: string | null;
  /** What this seat's phone shows. Differs from `roleId` for the Drunk. */
  believedRoleId: string | null;
};

export type Game = {
  scriptId: string;
  status: GameStatus;
  nightNumber: number;
  dayNumber: number;
  seed: number;
  seats: Seat[];
  script: Character[];
  winner: Winner | null;
  /**
   * The good player the Fortune Teller is told is a Demon. Storyteller-chosen,
   * never shown to players (see view.ts).
   */
  redHerringSeatIndex: number | null;
};

export type NightStep = {
  orderIndex: number;
  /**
   * A character id, or one of the synthetic steps the rules need but no
   * character owns: "*minion-info" and "*demon-info" on the first night.
   */
  characterId: string;
  /** Null for a synthetic step (nobody is woken for minion info). */
  actorSeatIndex: number | null;
};

export type VoteOutcome = {
  voteCount: number;
  threshold: number;
  qualified: boolean;
  /** Dead seats whose ghost vote this round consumed. */
  ghostVotesSpent: number[];
  /** Votes that cannot count: dead seats with no ghost vote left. */
  rejectedVotes: number[];
};

export type DayOutcome =
  | { executed: number; reason: "most-votes" }
  | { executed: null; reason: "below-threshold" | "tie" | "no-nominations" };

export type WinCheck = { winner: Winner; reason: string } | null;

export type EngineEvent = {
  kind:
    | "roles.dealt"
    | "vote.resolved"
    | "execution"
    | "death"
    | "night.steps-built"
    | "game.ended";
  actorSeatIndex?: number;
  subjectSeatIndexes?: number[];
  data?: Record<string, unknown>;
};
