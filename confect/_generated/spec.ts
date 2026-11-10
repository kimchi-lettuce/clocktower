import { GroupSpec, Spec } from "@confect/core";
import devboard_tickets from "../devboard/tickets.spec";
import myFunctions from "../myFunctions.spec";

const spec: Spec.Spec<{
  readonly devboard: GroupSpec.NamedAt<GroupSpec.GroupSpec<"Convex", "devboard", never, GroupSpec.NamedAt<typeof devboard_tickets, "tickets">>, "devboard">;
  readonly myFunctions: GroupSpec.NamedAt<typeof myFunctions, "myFunctions">;
}> = Spec.make().addAt("devboard", GroupSpec.makeAt("devboard").addGroupAt("tickets", devboard_tickets)).addAt("myFunctions", myFunctions);

export default spec;
