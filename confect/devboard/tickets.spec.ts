import { FunctionSpec, GroupSpec } from "@confect/core";
import * as Schema from "effect/Schema";

import devTicket from "../_generated/tables/devTicket";
import { Id } from "../_generated/id";

/*
 * Dev board function group (docs/product/features/dev-board.md).
 * These functions are intentionally public and unauthenticated: the board is
 * only reachable on localhost, and the table holds development tickets only.
 * They must be internalized behind the Developer role before launch — see the
 * ticket on the board itself.
 */

export const STATUSES = ["backlog", "in-progress", "in-review", "done"] as const;
export const PRIORITIES = ["low", "medium", "high"] as const;

const Status = Schema.Literals([...STATUSES]);
const Priority = Schema.Literals([...PRIORITIES]);

export type DevTicketStatus = (typeof STATUSES)[number];
export type DevTicketPriority = (typeof PRIORITIES)[number];

const Title = Schema.String.check(Schema.isMaxLength(120));
const Description = Schema.String.check(Schema.isMaxLength(5000));
const Labels = Schema.Array(Schema.String.check(Schema.isMaxLength(24)));

const list = FunctionSpec.publicQuery({
  name: "list",
  returns: () => Schema.Array(devTicket.Doc),
});

const create = FunctionSpec.publicMutation({
  name: "create",
  args: () => ({
    title: Title,
    description: Description,
    status: Status,
    priority: Priority,
    labels: Labels,
  }),
  returns: () => Id("devTicket"),
});

const update = FunctionSpec.publicMutation({
  name: "update",
  args: () => ({
    ticketId: Id("devTicket"),
    title: Title,
    description: Description,
    priority: Priority,
    labels: Labels,
  }),
  returns: () => Schema.Null,
});

const setStatus = FunctionSpec.publicMutation({
  name: "setStatus",
  args: () => ({ ticketId: Id("devTicket"), status: Status }),
  returns: () => Schema.Null,
});

const remove = FunctionSpec.publicMutation({
  name: "remove",
  args: () => ({ ticketId: Id("devTicket") }),
  returns: () => Schema.Null,
});

const seedStarter = FunctionSpec.publicMutation({
  name: "seedStarter",
  returns: () => Schema.Number,
});

export type StarterDevTicket = {
  title: string;
  description: string;
  status: DevTicketStatus;
  priority: DevTicketPriority;
  labels: string[];
};

/*
 * Opening queue carried over from the 2026-10-15 work prompt. Seeded once by
 * the UI ("load starter tickets") when the board is empty.
 */
export const STARTER_DEV_TICKETS: StarterDevTicket[] = [
  {
    title: "Confirm the four-role RBAC design with Daniel",
    description:
      "The roles/tenancy proposal is drafted in docs/technical/rbac-tenancy-design.md: Developer / Admin / Manager / Helper, scoped instead of global, tenancy recommendation Option A (one deployment, explicit church scoping). Daniel needs to confirm the names and the tenancy fork before any policy code is written.",
    status: "in-progress",
    priority: "high",
    labels: ["rbac", "product"],
  },
  {
    title: "Migrate the starter `numbers` demo out of convex/myFunctions.ts",
    description:
      "The starter listNumbers/addNumber functions are demo functions. Their Confect-native replacements live in the myFunctions group; next step is to replace the dashboard demo card with a real first feature, then delete the demo group and table.",
    status: "backlog",
    priority: "medium",
    labels: ["backend", "confect", "cleanup"],
  },
  {
    title: "Implement the grants and role-policy domain (first RBAC slice)",
    description:
      "After Daniel confirms the roles: a grants table (person, role, scope), a centralized policy layer per the backend standard, and role-shaped projections. Follow docs/technical/rbac-tenancy-design.md.",
    status: "backlog",
    priority: "high",
    labels: ["rbac", "backend", "security"],
  },
  {
    title: "Dev-board backend functions must be internalized before launch",
    description:
      "The devboard group is deliberately public and unauthenticated for localhost convenience. Before any real church data or launch, make these internal or gate them behind the Developer role.",
    status: "backlog",
    priority: "high",
    labels: ["devtools", "security"],
  },
  {
    title: "Write the domain-boundary check script",
    description:
      "CI-able check that each confect group's impl only opens tables its own domain owns (cross-domain behavior must route through the owning domain's declared functions). Converts the \"no reach-throughs\" convention into a runnable rule.",
    status: "backlog",
    priority: "medium",
    labels: ["backend", "tooling"],
  },
  {
    title: "Build the component gallery dev page",
    description:
      "In-house UI primitives (Dialog first) reviewed on a localhost-only gallery page styled from brand tokens - our Storybook substitute. See docs/design/ui-foundation.md.",
    status: "backlog",
    priority: "medium",
    labels: ["design", "frontend"],
  },
  {
    title: "Revisit solid-ui / Kobalte adoption when Kobalte 2.0 is stable",
    description:
      "Design decision 2026-10-15: in-house primitives until the Solid 2 ecosystem stabilizes. When @kobalte/core 2.0 ships stable, evaluate adopting Kobalte (or solid-ui patterns on top of it) by swapping primitive internals.",
    status: "backlog",
    priority: "low",
    labels: ["design", "frontend"],
  },
  {
    title: "Agent-native slice 1: chat panel answering real church data",
    description:
      "First slice of docs/product/agent-native.md: an agent chat that reads one church-surface with the acting person's role, proving the agent layer inherits the same policy as a human.",
    status: "backlog",
    priority: "medium",
    labels: ["ai", "product"],
  },
  {
    title: "Agent-native slice 2: a chart that renders from a stored view document",
    description:
      "Prove views-as-documents: dashboard chart primitives take their shape from a Convex document the agent (or the user) authors. Composition over a hard-coded control panel.",
    status: "backlog",
    priority: "medium",
    labels: ["ai", "frontend"],
  },
  {
    title: "Agent-native slice 3: in-app agent driving a two-step flow",
    description:
      "Do-it-with-you prototype: front-end primitives (move pointer, click, fill) drive a small flow visible to the user, under the user's own session, interruptible. Proves the teaching-before-tutorials idea.",
    status: "backlog",
    priority: "low",
    labels: ["ai", "frontend"],
  },
];

export default GroupSpec.make()
  .addFunction(list)
  .addFunction(create)
  .addFunction(update)
  .addFunction(setStatus)
  .addFunction(remove)
  .addFunction(seedStarter);