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
 * Opening queue for this repo. Seeded once by the UI ("load starter tickets")
 * when the board is empty. Derived from the 2026-11-11 design session that
 * produced docs/product/vision.md and docs/technical/decisions.md.
 */
export const STARTER_DEV_TICKETS: StarterDevTicket[] = [
  {
    title: "Create the Convex deployment and fill .env.local",
    description:
      "pnpm install, cp .env.example .env.local, pnpm run convex:dev, then confirm the app boots against the dev deployment. Nothing else can be verified until this works.",
    status: "backlog",
    priority: "high",
    labels: ["setup", "convex"],
  },
  {
    title: "Delete the starter auth UI once guest join exists",
    description:
      "apps/app/src/components/login-signup-form.tsx and the _authed/dashboard route are church-starter remnants: email signup is exactly what this product does not do. Keep the Convex/Solid wiring they exercise, delete the screens, and replace them with the room-code lobby.",
    status: "backlog",
    priority: "medium",
    labels: ["frontend", "identity", "fork-cleanup"],
  },
  {
    title: "Add confect/ tests to the vp test include glob",
    description:
      "Workspace vite.config.ts only collects apps/*/src and packages/*/src, so engine tests would never run. Add confect/**/*.{test,spec}.ts to test.include before writing the first engine suite.",
    status: "done",
    priority: "high",
    labels: ["tooling", "tests"],
  },
  {
    title: "Define the game domain tables",
    description:
      "game (phase, night number, seed, secret setup decisions, version), seat (real role, believed role, alive, ghost vote, statuses), step (night order entry + resolution), event (append-only log), vote/nomination. Follow docs/technical/architecture.md.",
    status: "done",
    priority: "high",
    labels: ["backend", "data-model"],
  },
  {
    title: "Pure engine skeleton with seeded randomness",
    description:
      "confect/game/engine/ with no Convex or Effect imports: role dealing from a seed, target validation, vote resolution with the computed threshold, death and win-condition checks. Tests call functions directly, no deployment required.",
    status: "done",
    priority: "high",
    labels: ["engine", "tests"],
  },
  {
    title: "Import the Trouble Brewing script as character data",
    description:
      "Start from a community script JSON (the hobby format already carries characters, night order, and constraints) instead of typing 22 rows. Nobody here owns a physical copy, so verify with two independent sources that agree (the community JSON plus an official or well-maintained reference), and get a rules-experienced player to review the finished 22 rows. Store the exact ability text as data plus a shortened line for the UI. Adopt the community file shape so a second script is an import, not a rewrite.",
    status: "done",
    priority: "high",
    labels: ["content", "data-model"],
  },
  {
    title: "gameView projection plus the leak test",
    description:
      "One query returning a discriminated union on viewer kind (storyteller / player / spectator), redacted on the server. Property test: no viewever receives a character name that isn't theirs, except the Minion/Demon pair. This is the highest-value test in the repo.",
    status: "done",
    priority: "high",
    labels: ["backend", "security", "tests"],
  },
  {
    title: "Wire the app to the game functions (lobby)",
    description:
      "The lobby at / creates a room, joins by code or by link, lists the seats, copies the join link, and lets the Storyteller deal and begin. Verified end to end against the dev deployment: create, five joins, rejoin on the same device, start, then a storyteller view with a grimoire, a player view with only their own role, a spectator view with no roles, and a non-Storyteller refused the start.",
    status: "done",
    priority: "high",
    labels: ["frontend", "product"],
  },
  {
    title: "Seat recovery: QR, PIN, and reassignment",
    description:
      "The code, the link and the device-bound guest session are built (lobby route + library/guest.ts). Still missing: a QR code for the room, a per-seat 4-digit PIN so a player whose phone died can reclaim their seat, and a Storyteller control to hand a seat to a new device.",
    status: "backlog",
    priority: "high",
    labels: ["backend", "identity", "product"],
  },
  {
    title: "Role card and Storyteller grimoire",
    description:
      "A player's phone shows their character face down until tapped, then the exact ability text - the believed role if they are the Drunk. The Storyteller's overview is read-only by design: seat, name, role, the Drunk's believed role, the red herring, and ghost-vote state. Every legal change stays in the wizard so there is one place that can refuse an illegal move.",
    status: "done",
    priority: "high",
    labels: ["frontend", "product"],
  },
  {
    title: "Simulate a table on one machine",
    description:
      "Guest identity is localStorage, which is shared between tabs, so eleven seats on one laptop was impossible. ?device=ana on localhost gives each tab its own device key, remembered in sessionStorage. Ignored outside localhost so a shared link cannot hand out a seat. Documented in docs/testing.md.",
    status: "done",
    priority: "medium",
    labels: ["devtools", "testing"],
  },
  {
    title: "Storyteller night wizard",
    description:
      "One step at a time in the printed order, with the sheet's instruction, a Back and a Next, and the pointer saved on the game row so a locked phone can resume. Only the Storyteller's device can read the sequence or move it. Verified live: an eight-player first night came out as Minions, Demon, Poisoner, Chef, Empath, Fortune Teller, Butler, and a player asking for the night got null.",
    status: "done",
    priority: "high",
    labels: ["frontend", "engine", "product"],
  },
  {
    title: "Day phase: dawn, nominations, voting, execution",
    description:
      "The engine half exists (applyDayResult: threshold, ties, ghost votes, deaths, endgame, tested at eleven players). Missing: dawn transition, a nominations table write, a vote screen where the Storyteller taps the seats whose hands went up, an execution announcement, and the roll into the next night. This is the gate for the eleven-player playtest.",
    status: "in-progress",
    priority: "high",
    labels: ["frontend", "engine", "product"],
  },
  {
    title: "Seat-tap vote recording",
    description:
      "Storyteller taps raised hands; app counts, compares to the computed threshold, and spends ghost votes. Dead seats with a spent ghost vote are not tappable. Record per-voter so the event log and review work.",
    status: "backlog",
    priority: "medium",
    labels: ["frontend", "engine", "product"],
  },
  {
    title: "Storyteller night wizard for the first cast",
    description:
      "Chef, Empath, Fortune Teller, Undertaker, Monk, Drunk, Poisoner, Imp: correct order per night number, illegal targets refused, poisoning applied before the ability resolves, and a 'what do you tell them?' prompt that shows the truth privately and records what the Storyteller actually said. Players never input anything - the Storyteller taps their own phone and the seat's screen reveals the result.",
    status: "backlog",
    priority: "medium",
    labels: ["frontend", "engine", "product"],
  },
  {
    title: "Storyteller-driven reveals: wake lock, dim screen, best-effort buzz",
    description:
      "Player phones stay dark all night. The Storyteller taps a seat to reveal information; that seat's phone shows it. Keep the tab alive with the Screen Wake Lock API, render the reveal in a very dim palette, and fire navigator.vibrate() only where it exists (Android) as a hint. The grimoire marks which seats can buzz, so the Storyteller knows who needs a shoulder tap. Never wait for a device acknowledgement.",
    status: "backlog",
    priority: "medium",
    labels: ["frontend", "night", "design"],
  },
  {
    title: "Game expiry and creation rate limiting",
    description:
      "Guests are anonymous and games are cheap to create, so an idle-game expiry job and a creation limit are the difference between a tool and an unbounded hosting bill.",
    status: "backlog",
    priority: "medium",
    labels: ["backend", "ops"],
  },
  {
    title: "Replace the placeholder design tokens",
    description:
      "packages/design/src/tokens.css currently holds neutral placeholders inherited from the fork. Replace them with a palette chosen for a dark table, and map the night-mode variants in apps/app/src/styles/app.css.",
    status: "backlog",
    priority: "medium",
    labels: ["design", "frontend"],
  },
  {
    title: "Internalize the dev-board backend functions before public launch",
    description:
      "The devboard group is deliberately public and unauthenticated for localhost convenience. Make the functions internal before the site is public.",
    status: "backlog",
    priority: "high",
    labels: ["devtools", "security"],
  },
  {
    title: "Build the component gallery dev page",
    description:
      "In-house UI primitives reviewed on a localhost-only gallery page styled from tokens - the Storybook substitute. See docs/design/ui-foundation.md.",
    status: "backlog",
    priority: "low",
    labels: ["design", "frontend"],
  },
  {
    title: "Revisit Kobalte 2.0 adoption when it is stable",
    description:
      "Decision 2026-10-15: in-house primitives until the Solid 2 ecosystem stabilises. When @kobalte/core 2.0 ships stable, swap primitive internals.",
    status: "backlog",
    priority: "low",
    labels: ["design", "frontend"],
  },
];

export default GroupSpec.make()
  .addFunction(list)
  .addFunction(create)
  .addFunction(update)
  .addFunction(setStatus)
  .addFunction(remove)
  .addFunction(seedStarter);
