import { Table } from "@confect/core";
import * as Schema from "effect/Schema";

/*
 * Script content. One row per character per script.
 *
 * `ability` holds the exact published text (the rules authority); `shortAbility`
 * is the one line the UI shows. `firstNightOrder` / `otherNightOrder` are the
 * character's position in the night sequence, null when it does not act that
 * night. All of it is data so a rule fix is a row edit and a new script is an
 * import — see docs/technical/decisions.md.
 */
export const TARGETING = ["none", "one-player", "one-player-not-self", "two-players"] as const;

export default Table.make(() =>
  Schema.Struct({
    scriptId: Schema.String,
    characterId: Schema.String,
    name: Schema.String.check(Schema.isMaxLength(40)),
    alignment: Schema.Literals(["townsfolk", "outsider", "minion", "demon"]),
    ability: Schema.String.check(Schema.isMaxLength(400)),
    shortAbility: Schema.String.check(Schema.isMaxLength(200)),
    firstNightOrder: Schema.NullOr(Schema.Number),
    otherNightOrder: Schema.NullOr(Schema.Number),
    targeting: Schema.Literals([...TARGETING]),
  }),
).index("by_script_and_character", ["scriptId", "characterId"]);
