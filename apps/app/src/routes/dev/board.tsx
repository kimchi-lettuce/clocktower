import { createFileRoute, redirect } from "@tanstack/solid-router";
import { ConvexClient } from "convex/browser";
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";
import { api } from "convex/_generated/api";
import { For, Show, createSignal, onSettled } from "solid-js";
import { Dialog } from "~/components/ui/dialog";

/*
 * Dev board (docs/product/features/dev-board.md) — the team's task tracker.
 * Deliberately outside the `_authed` tree and reachable only from localhost,
 * with an anonymous Convex client: it must never appear in deployed builds.
 */

export const Route = createFileRoute("/dev/board")({
  beforeLoad: () => {
    const host = typeof window !== "undefined" ? window.location.hostname : "";
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host.endsWith(".localhost");
    if (!isLocal) {
      throw redirect({ to: "/" });
    }
  },
  component: BoardPage,
});

const STATUS_ORDER = ["backlog", "in-progress", "in-review", "done"] as const;
type Status = (typeof STATUS_ORDER)[number];

const STATUS_LABEL: Record<Status, string> = {
  backlog: "Backlog",
  "in-progress": "In Progress",
  "in-review": "In Review",
  done: "Done",
};

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string;
if (!CONVEX_URL) {
  throw new Error("VITE_CONVEX_URL is required");
}
// Anonymous client: dev tickets carry no church data and the board is
// localhost-only, so no auth token is needed here.
const devTicketsClient = new ConvexClient(CONVEX_URL);

type DevTicket = FunctionReturnType<typeof api.devboard.tickets.list>[number];
type Priority = Exclude<DevTicket["priority"], undefined>;

function useDevQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: FunctionArgs<Query>,
) {
  const [data, setData] = createSignal<FunctionReturnType<Query> | undefined>();

  onSettled(() => {
    const unsubscribe = devTicketsClient.onUpdate(query, args, (next) => {
      setData(() => next);
    });
    return () => unsubscribe();
  });

  return data;
}

function BoardPage() {
  const tasks = useDevQuery(api.devboard.tickets.list, {});
  const [selected, setSelected] = createSignal<DevTicket | null>(null);
  const [creating, setCreating] = createSignal(false);

  const byStatus = (status: Status): DevTicket[] => {
    const list = tasks() ?? [];
    return list
      .filter((task) => task.status === status)
      .sort((a, b) => a.order - b.order);
  };

  const seedStarterTickets = async () => {
    await devTicketsClient.mutation(api.devboard.tickets.seedStarter, {});
  };

  const boardColumns = STATUS_ORDER;

  return (
    <main class="min-h-screen text-left p-0">
      <header class="bg-card border-b border-line px-4 py-4">
        <div class="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold text-ink">Dev board</h1>
            <p class="text-sm text-muted mt-0.5">
              Development tickets only — never church or member data. Served
              on localhost only.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreating(true)}
            class="px-3 py-2 text-sm font-semibold text-white bg-accent rounded-md hover:bg-accent/90 transition-colors duration-150"
          >
            + New ticket
          </button>
        </div>
      </header>

      <div class="mx-auto max-w-7xl px-4 py-6">
        <Show
          when={tasks() !== undefined}
          fallback={<p class="text-sm text-muted">Connecting to Convex…</p>}
        >
          <Show
            when={(tasks()?.length ?? 0) > 0}
            fallback={
              <div class="bg-card border border-line rounded-lg p-10 text-center">
                <h2 class="text-base font-semibold text-ink">No tickets yet</h2>
                <p class="mt-1 text-sm text-muted">
                  Load the opening queue, or create the first ticket.
                </p>
                <button
                  type="button"
                  onClick={() => void seedStarterTickets()}
                  class="mt-4 px-3 py-2 text-sm font-semibold text-ink bg-accent-soft border border-line rounded-md hover:border-accent transition-colors duration-150"
                >
                  Load starter tickets
                </button>
              </div>
            }
          >
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <For each={[...boardColumns]}>
                {(status) => (
                  <BoardColumn
                    status={status}
                    label={STATUS_LABEL[status]}
                    tasks={byStatus(status)}
                    onSelect={setSelected}
                  />
                )}
              </For>
            </div>
          </Show>
        </Show>
      </div>

      <Show when={selected()}>
        {(task) => (
          <TicketDetailsDialog
            task={task()}
            onClose={() => setSelected(null)}
          />
        )}
      </Show>
      <NewTicketDialog open={creating()} onClose={() => setCreating(false)} />
    </main>
  );
}

function BoardColumn(props: {
  status: Status;
  label: string;
  tasks: DevTicket[];
  onSelect: (task: DevTicket) => void;
}) {
  return (
    <section class="bg-card border border-line rounded-lg">
      <div class="flex items-center justify-between border-b border-line px-3 py-2">
        <h2 class="text-sm font-semibold text-ink">{props.label}</h2>
        <span class="text-xs text-muted">{props.tasks.length}</span>
      </div>
      <div class="flex flex-col gap-2 p-2">
        <For each={props.tasks}>
          {(task) => (
            <button
              type="button"
              class="text-left bg-surface border border-line rounded-md p-3 hover:border-accent transition-colors duration-150"
              onClick={() => props.onSelect(task)}
            >
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium text-muted">
                  {task.priority}
                </span>
                <h3 class="text-sm font-medium text-ink">{task.title}</h3>
              </div>
              <Show when={task.labels.length > 0}>
                <div class="mt-2 flex flex-wrap gap-1">
                  <For each={task.labels}>
                    {(label) => (
                      <span class="text-xs text-accent bg-accent-soft rounded-full px-2 py-0.5">
                        {label}
                      </span>
                    )}
                  </For>
                </div>
              </Show>
            </button>
          )}
        </For>
      </div>
    </section>
  );
}

function moveTargets(status: Status): Status[] {
  return STATUS_ORDER.filter((target) => target !== status);
}

const PRIORITY_OPTIONS: readonly Priority[] = ["low", "medium", "high"];

function TicketDetailsDialog(props: {
  task: DevTicket;
  onClose: () => void;
}) {
  const [title, setTitle] = createSignal(props.task.title);
  const [description, setDescription] = createSignal(props.task.description);
  const [priority, setPriority] = createSignal<Priority>(props.task.priority);
  const [labels, setLabels] = createSignal(props.task.labels.join(", "));
  const [saved, setSaved] = createSignal(false);

  const save = async () => {
    await devTicketsClient.mutation(api.devboard.tickets.update, {
      ticketId: props.task._id,
      title: title(),
      description: description(),
      priority: priority(),
      labels: labels()
        .split(",")
        .map((label) => label.trim())
        .filter((label) => label.length > 0),
    });
    setSaved(true);
  };

  const move = async (status: Status) => {
    await devTicketsClient.mutation(api.devboard.tickets.setStatus, {
      ticketId: props.task._id,
      status,
    });
    props.onClose();
  };

  const remove = async () => {
    await devTicketsClient.mutation(api.devboard.tickets.remove, {
      ticketId: props.task._id,
    });
    props.onClose();
  };

  return (
    <Dialog
      open
      title={props.task.title}
      onClose={() => props.onClose()}
    >
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-medium text-muted mb-1">Title</label>
          <input
            type="text"
            value={title()}
            onInput={(event) => setTitle(event.currentTarget.value)}
            class="w-full border border-line rounded-md px-3 py-2 text-sm text-ink bg-surface"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted mb-1">
            Description
          </label>
          <textarea
            rows={6}
            value={description()}
            onInput={(event) => setDescription(event.currentTarget.value)}
            class="w-full border border-line rounded-md px-3 py-2 text-sm text-ink bg-surface"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted mb-1">
            Priority
          </label>
          <select
            value={priority()}
            onChange={(event) =>
              setPriority(event.currentTarget.value as Priority)
            }
            class="w-full border border-line rounded-md px-3 py-2 text-sm text-ink bg-surface"
          >
            <For each={PRIORITY_OPTIONS}>
              {(option) => <option value={option}>{option}</option>}
            </For>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-muted mb-1">
            Labels (comma-separated)
          </label>
          <input
            type="text"
            value={labels()}
            onInput={(event) => setLabels(event.currentTarget.value)}
            class="w-full border border-line rounded-md px-3 py-2 text-sm text-ink bg-surface"
          />
        </div>
        <div>
          <span class="block text-xs font-medium text-muted mb-1">Move to</span>
          <div class="flex flex-wrap gap-2">
            <For each={moveTargets(props.task.status)}>
              {(status) => (
                <button
                  type="button"
                  onClick={() => void move(status)}
                  class="px-3 py-1.5 text-xs font-medium text-ink bg-accent-soft border border-line rounded-md hover:border-accent transition-colors duration-150"
                >
                  {STATUS_LABEL[status]}
                </button>
              )}
            </For>
          </div>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-line">
          <button
            type="button"
            onClick={() => void remove()}
            class="text-xs font-medium text-danger hover:underline"
          >
            Delete ticket
          </button>
          <div class="flex items-center gap-2">
            <Show when={saved()}>
              <span class="text-xs text-success">Saved</span>
            </Show>
            <button
              type="button"
              onClick={() => void save()}
              class="px-3 py-2 text-sm font-semibold text-white bg-accent rounded-md hover:bg-accent/90 transition-colors duration-150"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

function NewTicketDialog(props: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [priority, setPriority] = createSignal<Priority>("medium");
  const [status, setStatus] = createSignal<Status>("backlog");
  const [labels, setLabels] = createSignal("");

  const create = async () => {
    if (title().trim().length === 0) return;
    await devTicketsClient.mutation(api.devboard.tickets.create, {
      title: title().trim(),
      description: description(),
      status: status(),
      priority: priority(),
      labels: labels()
        .split(",")
        .map((label) => label.trim())
        .filter((label) => label.length > 0),
    });
    setTitle("");
    setDescription("");
    setLabels("");
    props.onClose();
  };

  return (
    <Dialog
      open={props.open}
      title="New ticket"
      onClose={() => props.onClose()}
    >
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-medium text-muted mb-1">Title</label>
          <input
            type="text"
            value={title()}
            onInput={(event) => setTitle(event.currentTarget.value)}
            class="w-full border border-line rounded-md px-3 py-2 text-sm text-ink bg-surface"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted mb-1">
            Description
          </label>
          <textarea
            rows={4}
            value={description()}
            onInput={(event) => setDescription(event.currentTarget.value)}
            class="w-full border border-line rounded-md px-3 py-2 text-sm text-ink bg-surface"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-muted mb-1">
              Status
            </label>
            <select
              value={status()}
              onChange={(event) => setStatus(event.currentTarget.value as Status)}
              class="w-full border border-line rounded-md px-3 py-2 text-sm text-ink bg-surface"
            >
              <For each={[...STATUS_ORDER]}>
                {(option) => (
                  <option value={option}>{STATUS_LABEL[option]}</option>
                )}
              </For>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-muted mb-1">
              Priority
            </label>
            <select
              value={priority()}
              onChange={(event) =>
                setPriority(event.currentTarget.value as Priority)
              }
              class="w-full border border-line rounded-md px-3 py-2 text-sm text-ink bg-surface"
            >
              <For each={PRIORITY_OPTIONS}>
                {(option) => <option value={option}>{option}</option>}
              </For>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-muted mb-1">
            Labels (comma-separated)
          </label>
          <input
            type="text"
            value={labels()}
            onInput={(event) => setLabels(event.currentTarget.value)}
            class="w-full border border-line rounded-md px-3 py-2 text-sm text-ink bg-surface"
          />
        </div>
        <div class="flex justify-end pt-2 border-t border-line">
          <button
            type="button"
            onClick={() => void create()}
            class="px-3 py-2 text-sm font-semibold text-white bg-accent rounded-md hover:bg-accent/90 transition-colors duration-150"
          >
            Create ticket
          </button>
        </div>
      </div>
    </Dialog>
  );
}