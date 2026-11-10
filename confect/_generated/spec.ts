import { GroupSpec, Spec } from "@confect/core";
import devboard_tickets from "../devboard/tickets.spec";
import game_games from "../game/games.spec";

const spec: Spec.Spec<{
  readonly devboard: GroupSpec.NamedAt<GroupSpec.GroupSpec<"Convex", "devboard", never, GroupSpec.NamedAt<typeof devboard_tickets, "tickets">>, "devboard">;
  readonly game: GroupSpec.NamedAt<GroupSpec.GroupSpec<"Convex", "game", never, GroupSpec.NamedAt<typeof game_games, "games">>, "game">;
}> = Spec.make().addAt("devboard", GroupSpec.makeAt("devboard").addGroupAt("tickets", devboard_tickets)).addAt("game", GroupSpec.makeAt("game").addGroupAt("games", game_games));

export default spec;
