import type { Character } from "../engine/types";

/*
 * Trouble Brewing, the first script.
 *
 * Ability text is verbatim from two independently maintained references that
 * agreed word for word (checked 2026-11-11): botc.town/tb and the BotC Script
 * Viewer's Trouble Brewing page, which also supplied the first-night sequence.
 * Do not paraphrase these strings — a subtly wrong ability teaches a wrong rule.
 *
 * Night-order values are positions in this script's sequence, not a global
 * canon. They were confirmed line by line against the printed first-night and
 * other-nights sheets.
 *
 * `firstNightNote` and `otherNightNote` are what the Storyteller does at that
 * step, transcribed from the same sheets, so the app can put the instruction on
 * screen instead of the Storyteller reading from paper. `firstNightOrder` is the first night's order; `otherNightOrder` applies
 * to every later night. Null means the character does not wake that night.
 *
 * Every part of this file has now been checked against at least three
 * independent sources, including the printed night-order sheets.
 */

export const SCRIPT_ID = "trouble-brewing";

type Content = Omit<Character, "firstNightOrder" | "otherNightOrder"> & {
  firstNightOrder: number | null;
  otherNightOrder: number | null;
};

const character = (content: Content): Character => content;

export const CHEF = character({
  characterId: "chef",
  name: "Chef",
  alignment: "townsfolk",
  ability: "You start knowing how many pairs of evil players there are.",
  shortAbility: "Learns how many pairs of evil players sit next to each other.",
  firstNightOrder: 8,
  otherNightOrder: null,
  targeting: "none",
  firstNightNote: "Give a finger signal: how many pairs of evil players are neighbours.",
  otherNightNote: null,
});

export const EMPATH = character({
  characterId: "empath",
  name: "Empath",
  alignment: "townsfolk",
  ability: "Each night, you learn how many of your 2 alive neighbors are evil.",
  shortAbility: "Learns how many of their two living neighbors are evil.",
  firstNightOrder: 9,
  otherNightOrder: 8,
  targeting: "none",
  firstNightNote: "Give a finger signal: how many of the Empath's living neighbours are evil.",
  otherNightNote: "Give a finger signal: how many of the Empath's living neighbours are evil.",
});

export const FORTUNE_TELLER = character({
  characterId: "fortune-teller",
  name: "Fortune Teller",
  alignment: "townsfolk",
  ability:
    "Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you.",
  shortAbility: "Checks two players for a Demon. One good player reads as a Demon.",
  firstNightOrder: 10,
  otherNightOrder: 9,
  targeting: "two-players",
  firstNightNote:
    "The Fortune Teller chooses 2 players. Nod if either is the Demon (or the RED HERRING).",
  otherNightNote:
    "The Fortune Teller chooses 2 players. Nod if either is the Demon (or the RED HERRING).",
});

export const UNDERTAKER = character({
  characterId: "undertaker",
  name: "Undertaker",
  alignment: "townsfolk",
  ability: "Each night*, you learn which character died by execution today.",
  shortAbility: "Learns who was executed yesterday.",
  firstNightOrder: null,
  otherNightOrder: 7,
  targeting: "none",
  firstNightNote: null,
  otherNightNote: "If a player was executed today, show their character token.",
});

export const MONK = character({
  characterId: "monk",
  name: "Monk",
  alignment: "townsfolk",
  ability: "Each night*, choose a player (not yourself): they are safe from the Demon tonight.",
  shortAbility: "Protects someone else from the Demon tonight.",
  firstNightOrder: null,
  otherNightOrder: 2,
  targeting: "one-player-not-self",
  firstNightNote: null,
  otherNightNote: "The Monk chooses a player.",
});

export const WASHERWOMAN = character({
  characterId: "washerwoman",
  name: "Washerwoman",
  alignment: "townsfolk",
  ability: "You start knowing that 1 of 2 players is a particular Townsfolk.",
  shortAbility: "Learns that one of two players is a particular Townsfolk.",
  firstNightOrder: 5,
  otherNightOrder: null,
  targeting: "none",
  firstNightNote:
    "Show the Townsfolk character token. Point to both the TOWNSFOLK and WRONG players.",
  otherNightNote: null,
});

export const LIBRARIAN = character({
  characterId: "librarian",
  name: "Librarian",
  alignment: "townsfolk",
  ability:
    "You start knowing that 1 of 2 players is a particular Outsider. (Or that zero are in play.)",
  shortAbility: "Learns that one of two players is a particular Outsider.",
  firstNightOrder: 6,
  otherNightOrder: null,
  targeting: "none",
  firstNightNote:
    "Show the Outsider character token. Point to both the OUTSIDER and WRONG players.",
  otherNightNote: null,
});

export const INVESTIGATOR = character({
  characterId: "investigator",
  name: "Investigator",
  alignment: "townsfolk",
  ability: "You start knowing that 1 of 2 players is a particular Minion.",
  shortAbility: "Learns that one of two players is a particular Minion.",
  firstNightOrder: 7,
  otherNightOrder: null,
  targeting: "none",
  firstNightNote: "Show the Minion character token. Point to both the MINION and WRONG players.",
  otherNightNote: null,
});

export const SLAYER = character({
  characterId: "slayer",
  name: "Slayer",
  alignment: "townsfolk",
  ability:
    "Once per game, during the day, publicly choose a player: if they are the Demon, they die.",
  shortAbility: "Once per game, publicly shoots at someone during the day.",
  firstNightOrder: null,
  otherNightOrder: null,
  targeting: "one-player",
  firstNightNote: null,
  otherNightNote: null,
});

export const SOLDIER = character({
  characterId: "soldier",
  name: "Soldier",
  alignment: "townsfolk",
  ability: "You are safe from the Demon.",
  shortAbility: "Cannot be killed by the Demon.",
  firstNightOrder: null,
  otherNightOrder: null,
  targeting: "none",
  firstNightNote: null,
  otherNightNote: null,
});

export const RAVENKEEPER = character({
  characterId: "ravenkeeper",
  name: "Ravenkeeper",
  alignment: "townsfolk",
  ability: "If you die at night, you are woken to choose a player: you learn their character.",
  shortAbility: "If killed at night, learns one player's character.",
  firstNightOrder: null,
  otherNightOrder: 6,
  targeting: "one-player",
  firstNightNote: null,
  otherNightNote:
    "If the Ravenkeeper died tonight, the Ravenkeeper chooses a player. Show that player's character token.",
});

export const MAYOR = character({
  characterId: "mayor",
  name: "Mayor",
  alignment: "townsfolk",
  ability:
    "If only 3 players live & no execution occurs, your team wins. If you die at night, another player might die instead.",
  shortAbility: "Wins at three players alive if nobody is executed.",
  firstNightOrder: null,
  otherNightOrder: null,
  targeting: "none",
  firstNightNote: null,
  otherNightNote: null,
});

export const VIRGIN = character({
  characterId: "virgin",
  name: "Virgin",
  alignment: "townsfolk",
  ability:
    "The 1st time you are nominated, if the nominator is a Townsfolk, they are executed immediately.",
  shortAbility: "The first Townsfolk to nominate them is executed.",
  firstNightOrder: null,
  otherNightOrder: null,
  targeting: "none",
  firstNightNote: null,
  otherNightNote: null,
});

export const BUTLER = character({
  characterId: "butler",
  name: "Butler",
  alignment: "outsider",
  ability:
    "Each night, choose a player (not yourself): tomorrow, you may only vote if they are voting too.",
  shortAbility: "May only vote tomorrow if their chosen player votes too.",
  firstNightOrder: 11,
  otherNightOrder: 10,
  targeting: "one-player-not-self",
  firstNightNote: "The Butler chooses a player.",
  otherNightNote: "The Butler chooses a player.",
});

export const DRUNK = character({
  characterId: "drunk",
  name: "Drunk",
  alignment: "outsider",
  ability:
    "You do not know you are the Drunk. You think you are a Townsfolk character, but you are not.",
  shortAbility: "Thinks they are a Townsfolk. They are not.",
  firstNightOrder: null,
  otherNightOrder: null,
  targeting: "none",
  firstNightNote: null,
  otherNightNote: null,
});

export const RECLUSE = character({
  characterId: "recluse",
  name: "Recluse",
  alignment: "outsider",
  ability: "You might register as evil & as a Minion or Demon, even if dead.",
  shortAbility: "Might read as evil to anyone checking.",
  firstNightOrder: null,
  otherNightOrder: null,
  targeting: "none",
  firstNightNote: null,
  otherNightNote: null,
});

export const SAINT = character({
  characterId: "saint",
  name: "Saint",
  alignment: "outsider",
  ability: "If you die by execution, your team loses.",
  shortAbility: "If executed, their team loses.",
  firstNightOrder: null,
  otherNightOrder: null,
  targeting: "none",
  firstNightNote: null,
  otherNightNote: null,
});

export const POISONER = character({
  characterId: "poisoner",
  name: "Poisoner",
  alignment: "minion",
  ability: "Each night, choose a player: they are poisoned tonight and tomorrow day.",
  shortAbility: "One player's ability misbehaves tonight and tomorrow.",
  firstNightOrder: 3,
  otherNightOrder: 1,
  targeting: "one-player",
  firstNightNote: "The Poisoner chooses a player.",
  otherNightNote: "The Poisoner chooses a player.",
});

export const SPY = character({
  characterId: "spy",
  name: "Spy",
  alignment: "minion",
  ability:
    "Each night, you see the Grimoire. You might register as good & as a Townsfolk or Outsider, even if dead.",
  shortAbility: "Sees the whole grimoire. Might read as good.",
  firstNightOrder: 4,
  otherNightOrder: 3,
  targeting: "none",
  firstNightNote: "Show the Grimoire for as long as the Spy needs.",
  otherNightNote: "Show the Grimoire for as long as the Spy needs.",
});

export const SCARLET_WOMAN = character({
  characterId: "scarlet-woman",
  name: "Scarlet Woman",
  alignment: "minion",
  ability:
    "If there are 5 or more players alive & the Demon dies, you become the Demon. (Travellers don't count.)",
  shortAbility: "Becomes the Demon if it dies with 5 or more alive.",
  firstNightOrder: null,
  otherNightOrder: 4,
  targeting: "none",
  firstNightNote: null,
  otherNightNote:
    "If the Scarlet Woman became the Imp today, show them the YOU ARE token, then the Imp token.",
});

export const BARON = character({
  characterId: "baron",
  name: "Baron",
  alignment: "minion",
  ability: "There are extra Outsiders in play. [+2 Outsiders]",
  shortAbility: "Two extra Outsiders are in play.",
  firstNightOrder: null,
  otherNightOrder: null,
  targeting: "none",
  firstNightNote: null,
  otherNightNote: null,
});

export const IMP = character({
  characterId: "imp",
  name: "Imp",
  alignment: "demon",
  ability:
    "Each night*, choose a player: they die. If you kill yourself this way, a Minion becomes the Imp.",
  shortAbility: "Kills one player. Killing yourself passes on the Demon.",
  firstNightOrder: null,
  otherNightOrder: 5,
  targeting: "one-player",
  firstNightNote: null,
  otherNightNote:
    "The Imp chooses a player. If the Imp chose themselves: replace 1 alive Minion token with a spare Imp token, put the old Imp to sleep, wake the new Imp, show the YOU ARE token, then the Imp token.",
});

export const TROUBLE_BREWING: Character[] = [
  CHEF,
  EMPATH,
  FORTUNE_TELLER,
  UNDERTAKER,
  MONK,
  WASHERWOMAN,
  LIBRARIAN,
  INVESTIGATOR,
  SLAYER,
  SOLDIER,
  RAVENKEEPER,
  MAYOR,
  VIRGIN,
  BUTLER,
  DRUNK,
  RECLUSE,
  SAINT,
  POISONER,
  SPY,
  SCARLET_WOMAN,
  BARON,
  IMP,
];

/**
 * Storyteller instructions for the two steps that belong to no character.
 * Transcribed from the printed night-order sheet, which also states the
 * condition the engine enforces: both only happen at seven or more players.
 */
export const MINION_INFO_NOTE =
  "Wake all Minions. Show the THIS IS THE DEMON token. Point to the Demon.";
export const DEMON_INFO_NOTE =
  "Wake the Demon. Show the THESE ARE YOUR MINIONS token. Point to all Minions. Show the THESE CHARACTERS ARE NOT IN PLAY token. Show 3 not-in-play good character tokens.";

export function findCharacter(characterId: string): Character | undefined {
  return TROUBLE_BREWING.find((candidate) => candidate.characterId === characterId);
}

/** The cast used by the first playtest: 5 Townsfolk, 1 Outsider, 1 Minion, 1 Demon. */
export const FIRST_PLAYTEST_CAST: Character[] = [
  CHEF,
  EMPATH,
  FORTUNE_TELLER,
  UNDERTAKER,
  MONK,
  DRUNK,
  POISONER,
  IMP,
];

export const TOWNSFOLK = TROUBLE_BREWING.filter((candidate) => candidate.alignment === "townsfolk");
